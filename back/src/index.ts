import cors from "cors";
import express from 'express';
import pino from 'pino';
import { pinoHttp } from 'pino-http';
import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { PrismaClient, TxStatus, EntryKind } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';

import { getRequestToPayStatus, getCollectionToken, requestToPay, transfer, getDisbursementsToken } from './momo.js';

const app = express();
app.use(express.json());
app.use(cors({ origin: "http://localhost:5173"}))
const port = process.env.PORT || 3000;

// Swagger setup
const swaggerOptions = {
    definition: {
        openapi: "3.1.0",
        info: {
            title: "PLA-Momo API",
            version: "1.0.0",
            description:
                "This is a simple CRUD API application made with Express and documented with Swagger",
        },
        servers: [
            {
                url: "http://localhost:3000",
            },
        ],
    },
    apis: ["./src/routes/*.js"],
};
const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

const logger = pino({ level: process.env.NODE_ENV === 'production' ? 'info' : 'debug' });
app.use(pinoHttp({ logger }));
const prisma = new PrismaClient();

async function getOrCreateUserAccount(userId: string, currency: string) {
    await prisma.appUser.upsert({
        where: { id: userId },
        update: {},
        create: { id: userId },
    });

    let acc = await prisma.account.findUnique({
        where: { userId_currency_kind: { userId, currency, kind: 'USER' } }
    });
    if (!acc) {
        acc = await prisma.account.create({ data: { userId, currency, kind: 'USER' } });
    }
    return acc;
}

async function getOrCreateEscrowAccount(currency: string) {
    let acc = await prisma.account.findFirst({ where: { kind: 'ESCROW', currency, userId: null } });
    if (!acc) {
        acc = await prisma.account.create({ data: { currency, kind: 'ESCROW' } });
    }
    return acc;
}

async function getAccountBalance(accountId: string) {
    const agg = await prisma.ledgerEntry.groupBy({
        by: ['accountId'],
        where: { accountId },
        _sum: { credit: true, debit: true }
    });
    if (agg.length === 0) return 0n;
    const sumCredit = BigInt((agg[0]._sum.credit ?? 0 as any).toString());
    const sumDebit = BigInt((agg[0]._sum.debit ?? 0 as any).toString());

    return sumCredit - sumDebit;
}

// --- Routes---

//Health
app.get('/health', (_req, res) => res.json({ ok: true }));

//Create sandbox RequestToPay
app.post("/deposits", async (req, res) => {
    try {
        const schema = z.object({
            userId: z.string().uuid(),
            amount: z.string().regex(/^\d+(\.\d{1,6})?$/),
            msisdn: z.string().min(5),
            currency: z.string().default('EUR')
        });
        const { userId, amount, msisdn, currency } = schema.parse(req.body);

        const idempotencyKey = req.header('x-idempotency-key') ?? uuidv4();

        const userAcc = await getOrCreateUserAccount(userId, currency);
        await getOrCreateEscrowAccount(currency);

        const tx = await prisma.tx.create({
            data: {
                idempotencyKey: idempotencyKey,
                status: TxStatus.PENDING,
                kind: EntryKind.DEPOSIT,
                currency: currency,
                amount: amount as unknown as any,
                meta: { userId, msisdn }
            }
        });

        const referenceId = tx.id;

        const token = await getCollectionToken();

        await requestToPay({ token, referenceId, amount, currency, msisdn, externalId: `deposit-${tx.id}` })

        res.status(202).json({ txId: tx.id });
    } catch (err: any) {
        req.log.error({ err }, 'deposit error');
        res.status(400).json({ error: err.message ?? 'bad request' });
    }
});

app.post("/withdraw", async (req, res) => {
    try {
        const schema = z.object({
            userId: z.string().uuid(),
            amount: z.string().regex(/^\d+(\.\d{1,6})?$/),
            msisdn: z.string().min(5),
            currency: z.string().default('EUR')
        });
        const { userId, amount, msisdn, currency } = schema.parse(req.body);

        const idempotencyKey = req.header('x-idempotency-key') ?? uuidv4();

        const userAcc = await getOrCreateUserAccount(userId, currency);
        await getOrCreateEscrowAccount(currency);

        const tx = await prisma.tx.create({
            data: {
                idempotencyKey: idempotencyKey,
                status: TxStatus.PENDING,
                kind: EntryKind.WITHDRAWAL,
                currency: currency,
                amount: amount as unknown as any,
                meta: { userId, msisdn }
            }
        });

        const referenceId = tx.id;

        const token = await getDisbursementsToken();

        await transfer({ token, referenceId, amount, currency, msisdn, externalId: `deposit-${tx.id}` })

        res.status(202).json({ txId: tx.id });
    } catch (err: any) {
        const txId = err?.txId || null;
        if (txId) {
            try {
                await prisma.tx.update({ where: { id: txId }, data: { status: TxStatus.FAILED} });
            } catch {
                
            }
        }
        req.log.error({ err }, 'withdraw error');
        res.status(400).json({ error: err.message ?? 'bad request' });
    }
});

//Poll tx status
app.get("/transactions/:txId", async (req, res) => {// TO DO: Disbursment too
    try {
        logger.info("/transactions/:txId");
        const txId = z.string().uuid().parse(req.params.txId);
        const tx = await prisma.tx.findUnique({ where: { id: txId } });
        if (!tx) return res.status(404).json({ error: 'not found' });

        if (tx.status === TxStatus.SUCCESS || tx.status === TxStatus.FAILED) {
            return res.json({ status: tx.status });
        }

        const token = await getCollectionToken(); 
        const statusResp = await getRequestToPayStatus({ token, referenceId: txId });
        const status = (statusResp.status ?? '').toUpperCase();

        if (status === 'SUCCESSFUL') {
            const currency = tx.currency;
            const userId = (tx.meta as any).userId as string;
            const amountStr = tx.amount as unknown as string;

            const [escrowAcc, userAcc] = await Promise.all([
                getOrCreateEscrowAccount(currency),
                getOrCreateUserAccount(userId, currency)
            ]);

            await prisma.$transaction(async (trx) => {
                await trx.tx.update({ where: { id: txId }, data: { status: TxStatus.SUCCESS } });
                await trx.ledgerEntry.createMany({
                    data: [
                        { txId, accountId: escrowAcc.id, debit: amountStr as any, credit: 0 as any, currency },
                        { txId, accountId: userAcc.id, debit: 0 as any, credit: amountStr as any, currency }
                    ]
                });
            });

            return res.json({ status: 'SUCCESS' });
        }

        if (status === 'FAILED' || status === 'REJECTED' || status === 'TIMEOUT') {
            await prisma.tx.update({ where: { id: txId }, data: { status: TxStatus.FAILED } });
            return res.json({ status: 'FAILED' });
        }

        return res.json({ status: 'PENDING' });
    } catch (err: any) {
        req.log.error({ err }, 'status error');
        res.status(400).json({ error: err.message ?? 'bad request' });
    }
});

app.get("/users/:userId/balance", async (req, res) => {
    try {
        logger.info("Called: /users/:userId/balance");
        const schema = z.object({ userId: z.string().uuid(), currency: z.string().default('EUR') });
        const { userId, currency } = schema.parse({ userId: req.params.userId, currency: req.query.currency ?? 'EUR' });

        const acc = await prisma.account.findUnique({ where: { userId_currency_kind: { userId, currency, kind: 'USER' } } });
        if (!acc) return res.json({ currency, balance: '0.000000' });

        const balScaled = await getAccountBalance(acc.id);
        res.json({ currency, balance: balScaled.toString() });
    } catch (err: any) {
        res.status(400).json({ error: err.message ?? 'bad request' });
    }
});

app.post('/webhooks/momo', async (req, res) => {
    try {
        const payload = req.body ?? {};
        const provider = 'MTN';
        const eventId = (payload.eventId ?? payload.referenceId ?? uuidv4()).toString();

        await prisma.webhookEvent.create({
            data: { provider, eventId, signatureOk: true, payload }
        });

        const ref = payload.referenceId ?? payload['X-Reference-Id'];
        console.log(`ref: ${ref}`);
        const status = (payload.status ?? '').toUpperCase();
        if (ref && (status === 'SUCCESSFUL' || status === 'FAILED')) {
            const tx = await prisma.tx.findUnique({ where: { id: ref } });
            if (tx && tx.status === TxStatus.PENDING) {
                if (status === 'SUCCESSFUL') {
                    const currency = tx.currency;
                    const userId = (tx.meta as any).userId as string;
                    const amountStr = tx.amount as unknown as string;
                    const [escrowAcc, userAcc] = await Promise.all([
                        getOrCreateEscrowAccount(currency),
                        getOrCreateUserAccount(userId, currency)
                    ]);
                    await prisma.$transaction(async (trx) => {
                        await trx.tx.update({ where: { id: tx.id }, data: { status: TxStatus.SUCCESS } });
                        await trx.ledgerEntry.createMany({
                            data: [
                                { txId: tx.id, accountId: escrowAcc.id, debit: amountStr as any, credit: 0 as any, currency },
                                { txId: tx.id, accountId: userAcc.id, debit: 0 as any, credit: amountStr as any, currency }
                            ]
                        });
                    });
                } else {
                    await prisma.tx.update({ where: { id: tx.id }, data: { status: TxStatus.FAILED } });
                }
            }
        }

        res.status(200).send('ok');
    } catch (err: any) {
        console.log(`webhook error: ${err}`);
        req.log.error({ err }, 'webhook error');
        res.status(200).send('ok'); // avoid retry
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});