import { PrismaClient, TxStatus, EntryKind } from '@prisma/client';
const prisma = new PrismaClient();

async function getAccountBalance(accountId) {
    const agg = await prisma.ledgerEntry.groupBy({
        by: ['accountId'],
        where: { accountId },
        _sum: { credit: true, debit: true }
    });
    if (agg.length === 0) return 0n;
    const sumCredit = BigInt((agg[0]._sum.credit ?? 0).toString());
    console.log(`Credit: ${sumCredit}`);
    const sumDebit = BigInt((agg[0]._sum.debit ?? 0).toString());
    console.log(`Debit: ${sumDebit}`);

    return sumCredit - sumDebit;
}

const balance = await getAccountBalance("d9c5a0b2-0f7c-4f3b-9a86-3f8f57b0b2a1");
console.log(`balance: ${balance}`)