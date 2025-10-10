/**
 * @swagger
 * components:
 *   schemas:
 *     DepositRequest:
 *       type: object
 *       required:
 *         - userId
 *         - amount
 *         - msisdn
 *         - currency
 *       properties:
 *         userId:
 *           type: string
 *           format: uuid
 *           description: ID utilisateur (UUID v4)
 *         amount:
 *           type: string
 *           pattern: '^\\d+(\\.\\d{1,6})?$'
 *           description: Montant du dépôt (string décimale)
 *         msisdn:
 *           type: string
 *           description: Numéro MTN MoMo (MSISDN)
 *         currency:
 *           type: string
 *           description: Devise (sandbox = EUR)
 *       example:
 *         userId: d9c5a0b2-0f7c-4f3b-9a86-3f8f57b0b2a1
 *         amount: "6.00"
 *         msisdn: "56733123453"
 *         currency: "EUR"
 *
 *     DepositResponse:
 *       type: object
 *       properties:
 *         txId:
 *           type: string
 *           format: uuid
 *           description: Identifiant interne de la transaction (sert aussi de X-Reference-Id MoMo)
 *       example:
 *         txId: 5e2a7e6d-1e3a-4a7b-9e1f-7d1d0f7c9e62
 *
 *     TxStatusResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           enum: [PENDING, SUCCESS, FAILED]
 *           description: Statut courant de la transaction
 *       example:
 *         status: SUCCESS
 *
 *     BalanceResponse:
 *       type: object
 *       properties:
 *         currency:
 *           type: string
 *           description: Devise du compte
 *         balance:
 *           type: string
 *           description: Solde formaté en string décimale (6 décimales)
 *       example:
 *         currency: EUR
 *         balance: "6.000000"
 *
 *     MomoWebhookPayload:
 *       type: object
 *       description: Payload représentatif d'un callback MTN MoMo
 *       properties:
 *         referenceId:
 *           type: string
 *           format: uuid
 *           description: X-Reference-Id associé à la transaction (txId interne)
 *         status:
 *           type: string
 *           enum: [SUCCESSFUL, FAILED, PENDING]
 *         amount:
 *           type: string
 *         currency:
 *           type: string
 *       example:
 *         referenceId: 5e2a7e6d-1e3a-4a7b-9e1f-7d1d0f7c9e62
 *         status: SUCCESSFUL
 *         amount: "6.00"
 *         currency: EUR
 *
 *     Error:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           description: Message d'erreur lisible
 *       example:
 *         error: bad request
 */


/**
 * components:
 * schemas:
 *   WithdrawRequest:
 *     type: object
 *     required: [userId, amount, msisdn]
 *     properties:
 *       userId:
 *         type: string
 *         format: uuid
 *         description: ID utilisateur
 *         example: "d9c5a0b2-0f7c-4f3b-9a86-3f8f57b0b2a1"
 *       amount:
 *         type: string
 *         description: Montant à débiter (string décimal, jusqu'à 6 décimales)
 *         pattern: '^\d+(\.\d{1,6})?$'
 *         example: "125.50"
 *       msisdn:
 *         type: string
 *         minLength: 5
 *         description: Numéro MoMo (format MSISDN)
 *         example: "2250701020304"
 *       currency:
 *         type: string
 *         description: Devise (par défaut EUR)
 *         example: "EUR"
 *         default: "EUR"
 *   WithdrawAcceptedResponse:
 *     type: object
 *     required: [txId]
 *     properties:
 *       txId:
 *         type: string
 *         format: uuid
 *         description: Identifiant de transaction interne
 *         example: "f3d9a2f6-9c3a-4b2e-9e7a-1b2c3d4e5f67"
 *   ErrorResponse:
 *     type: object
 *     properties:
 *       error:
 *         type: string
 *         example: "bad request"
 * parameters:
 *   IdempotencyKeyHeader:
 *     name: x-idempotency-key
 *     in: header
 *     required: false
 *     description: Clé d'idempotence pour éviter les doublons. UUID recommandé.
 *     schema:
 *       type: string
 *       example: "8c1b7ac2-0d2f-4fa9-9d8e-2f2f2f2f2f2f"

 */

/**
 * @swagger
 * tags:
 *   name: MoMo
 *   description: API de gestion des dépôts, statuts et soldes (MTN MoMo sandbox)
 */

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Healthcheck
 *     tags: [MoMo]
 *     responses:
 *       200:
 *         description: Service opérationnel
 */


/**
 * @swagger
 * /deposits:
 *   post:
 *     summary: Créer un dépôt (MoMo RequestToPay)
 *     description: Crée une transaction PENDING et déclenche un RequestToPay côté MTN. En sandbox, la devise est EUR.
 *     tags: [MoMo]
 *     parameters:
 *       - in: header
 *         name: X-Idempotency-Key
 *         description: UUID pour éviter les doublons (généré côté serveur si absent)
 *         schema:
 *           type: string
 *           format: uuid
 *         required: false
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DepositRequest'
 *     responses:
 *       202:
 *         description: Demande acceptée (transaction créée côté app et envoyée à MoMo)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DepositResponse'
 *       400:
 *         description: Requête invalide
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erreur serveur
 */

/**
 * @swagger
 * /transactions/{txId}:
 *   get:
 *     summary: Obtenir le statut d'une transaction MoMo
 *     tags: [MoMo]
 *     parameters:
 *       - in: path
 *         name: txId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Identifiant interne de la transaction (égal au X-Reference-Id)
 *     responses:
 *       200:
 *         description: Statut courant
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TxStatusResponse'
 *       404:
 *         description: Transaction introuvable
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erreur serveur
 */

/**
 * @swagger
 * /users/{userId}/balance:
 *   get:
 *     summary: Récupérer le solde virtuel d'un utilisateur
 *     tags: [MoMo]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de l'utilisateur
 *       - in: query
 *         name: currency
 *         required: false
 *         schema:
 *           type: string
 *           default: EUR
 *         description: Devise (par défaut EUR en sandbox)
 *     responses:
 *       200:
 *         description: Solde de l'utilisateur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BalanceResponse'
 *       500:
 *         description: Erreur serveur
 */

/**
 * @swagger
 * /webhooks/momo:
 *   post:
 *     summary: Réception webhook MTN MoMo (simulation possible via Swagger)
 *     description: En production, MTN enverra ce POST automatiquement. En sandbox, tu peux simuler le callback avec ce endpoint.
 *     tags: [MoMo]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MomoWebhookPayload'
 *     responses:
 *       200:
 *         description: Webhook reçu
 *       500:
 *         description: Erreur serveur
 */

/**
 * @swagger
 * /withdraw:
 *   post:
 *     tags: [Payments]
 *     summary: Initier un retrait (Disbursements)
 *     parameters:
 *       - in: header
 *         name: X-Idempotency-Key
 *         description: UUID pour éviter les doublons (généré côté serveur si absent)
 *         schema:
 *           type: string
 *           format: uuid
 *         required: false
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/WithdrawRequest'
 *           examples:
 *             default:
 *               value:
 *                 userId: "d9c5a0b2-0f7c-4f3b-9a86-3f8f57b0b2a1"
 *                 amount: "125.50"
 *                 msisdn: "2250701020304"
 *                 currency: "EUR"
 *     responses:
 *       202:
 *         description: Retrait accepté (traitement asynchrone)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WithdrawAcceptedResponse'
 *             examples:
 *               default:
 *                 value:
 *                   txId: "f3d9a2f6-9c3a-4b2e-9e7a-1b2c3d4e5f67"
 *       400:
 *         description: Requête invalide
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               validationError:
 *                 value:
 *                   error: "bad request"
 *       500:
 *         description: Erreur serveur
 */