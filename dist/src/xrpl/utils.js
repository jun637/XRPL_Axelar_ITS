'use strict';
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.XRPLClient = void 0;
exports.generateWallet = generateWallet;
exports.getWallet = getWallet;
exports.printWalletInfo = printWalletInfo;
exports.mainProcessor = mainProcessor;
exports.hex = hex;
exports.roundUpToNearestXRP = roundUpToNearestXRP;
exports.deriveAddress = deriveAddress;
exports.parseTokenAmount = parseTokenAmount;
exports.decodeAccountIDToHex = decodeAccountIDToHex;
exports.decodeTxBlob = decodeTxBlob;
const xrpl = __importStar(require("xrpl"));
const ripple_address_codec_1 = require("ripple-address-codec");
const rippleBinaryCodec = __importStar(require("ripple-binary-codec"));
const chalk_1 = __importDefault(require("chalk"));
const common_1 = require("../common");
function hex(str) {
    return Buffer.from(str).toString('hex');
}
function roundUpToNearestXRP(amountInDrops) {
    return Math.ceil(amountInDrops / 1e6) * 1e6;
}
function generateWallet(options) {
    return xrpl.Wallet.generate(options.walletKeyType);
}
function getWallet(options) {
    return xrpl.Wallet.fromSeed(options.privateKey, {
        algorithm: options.walletKeyType,
    });
}
function deriveAddress(publicKey) {
    // publicKey로부터 address를 계산하는 함수
    // 실제 구현에서는 xrpl 라이브러리의 공식 메서드를 사용해야 함
    // 임시로 간단한 구현을 제공
    try {
        // publicKey가 이미 address인 경우 그대로 반환
        if (publicKey.length === 34 && publicKey.startsWith('r')) {
            return publicKey;
        }
        // 실제로는 xrpl 라이브러리의 address 유틸을 사용해야 함
        throw new Error('deriveAddress는 xrpl 라이브러리의 공식 address 유틸을 사용해 구현 필요');
    }
    catch (error) {
        throw new Error(`Failed to derive address from public key: ${error.message}`);
    }
}
function decodeAccountIDToHex(accountId) {
    const decoded = (0, ripple_address_codec_1.decodeAccountID)(accountId);
    return Buffer.from(decoded).toString('hex');
}
function decodeTxBlob(blob) {
    return rippleBinaryCodec.decode(blob);
}
function parseTokenAmount(token, amount) {
    let parsedAmount;
    if (token === 'XRP') {
        parsedAmount = xrpl.xrpToDrops(amount);
    }
    else {
        const [currency, issuer] = token.split('.');
        parsedAmount = {
            currency,
            issuer,
            value: amount.toString(),
        };
    }
    return parsedAmount;
}
class XRPLClient {
    constructor(rpcUrl) {
        this.client = new xrpl.Client(rpcUrl);
    }
    async connect() {
        await this.client.connect();
    }
    async disconnect() {
        await this.client.disconnect();
    }
    async request(command, params = {}) {
        const response = await this.client.request({ command, ...params });
        return response.result;
    }
    async autofill(tx) {
        return this.client.autofill(tx);
    }
    async accountInfo(account, ledgerIndex = 'validated') {
        try {
            const accountInfoRes = await this.request('account_info', {
                account,
                ledger_index: ledgerIndex,
            });
            const accountInfo = accountInfoRes.account_data;
            return {
                balance: accountInfo.Balance,
                sequence: accountInfo.Sequence,
            };
        }
        catch (error) {
            if (error.data?.error === 'actNotFound') {
                return {
                    balance: '0',
                    sequence: '-1',
                };
            }
            throw error;
        }
    }
    async accountObjects(account, params = {}, limit = 1000, ledgerIndex = 'validated') {
        const accountObjectsRes = await this.request('account_objects', {
            account,
            ledger_index: ledgerIndex,
            limit,
            ...params,
        });
        return accountObjectsRes.account_objects;
    }
    async tickets(account, limit = 1000, ledgerIndex = 'validated') {
        const ticketRes = await this.accountObjects(account, { type: 'ticket' }, limit, ledgerIndex);
        return ticketRes.map((ticket) => ticket.TicketSequence);
    }
    async accountLines(account) {
        const accountLinesRes = await this.request('account_lines', {
            account,
            ledger_index: 'validated',
        });
        return accountLinesRes.lines;
    }
    async reserveRequirements() {
        const serverInfoRes = await this.request('server_info');
        const validatedLedger = serverInfoRes.info;
        return {
            baseReserve: validatedLedger.reserve_base_xrp,
            ownerReserve: validatedLedger.reserve_inc_xrp,
        };
    }
    async fee(feeType = 'open_ledger_fee') {
        const feeRes = await this.request('fee');
        return feeRes.drops[feeType];
    }
    async fundWallet(wallet, amount) {
        return this.client.fundWallet(wallet, { amount: amount.toString() });
    }
    handleReceipt(receipt) {
        const result = receipt.engine_result;
        if (result !== 'tesSUCCESS') {
            (0, common_1.printError)('Transaction failed', `${receipt.engine_result}: ${receipt.engine_result_message}`);
            process.exit(1);
        }
        (0, common_1.printInfo)(`Transaction sent`, receipt.tx_json.hash);
    }
    async submitTx(txBlob, failHard = true) {
        const result = await this.request('submit', {
            tx_blob: txBlob,
            fail_hard: failHard,
        });
        this.handleReceipt(result);
        return result;
    }
    async buildTx(txType, fields = {}, args = {}) {
        const tx = {
            TransactionType: txType,
            ...fields,
        };
        if (args.account) {
            tx.Account = args.account;
        }
        if (args.fee) {
            tx.Fee = args.fee;
        }
        return this.autofill(tx);
    }
    async signTx(signer, tx, multisign = false) {
        return signer.sign(tx, multisign);
    }
    async signAndSubmitTx(signer, txType, fields = {}, args = {}, options = { multisign: false, yes: false }) {
        const tx = await this.buildTx(txType, fields, {
            ...args,
            account: args.account ?? signer.classicAddress,
            // when multisigning, fee = (N + 1) * normal fee, where N is the number of signatures
            fee: args.fee ?? (options.multisign ? String(Number(await this.fee()) * 2) : undefined),
        });
        (0, common_1.printInfo)(`${options.multisign ? 'Multi-' : ''}Signing transaction`, JSON.stringify(tx, null, 2));
        const signedTx = await this.signTx(signer, tx, options.multisign);
        if ((0, common_1.prompt)(`Submit ${txType} transaction?`, options.yes)) {
            (0, common_1.printWarn)('Transaction cancelled by user.');
            process.exit(0);
        }
        return this.submitTx(signedTx.tx_blob);
    }
    checkRequiredField(field, fieldName) {
        if (!field) {
            throw new Error(`Missing required field: ${fieldName}`);
        }
    }
    async sendPayment(signer, { destination, amount, memos = [], ...restArgs }, options = { multisign: false, yes: false }) {
        this.checkRequiredField(destination, 'destination');
        this.checkRequiredField(amount, 'amount');
        return this.signAndSubmitTx(signer, 'Payment', {
            Destination: destination,
            Amount: amount,
            Memos: memos.length > 0
                ? memos.map((memo) => ({
                    Memo: {
                        MemoType: memo.memoType,
                        MemoData: memo.memoData,
                    },
                }))
                : undefined,
        }, restArgs, options);
    }
    async sendSignerListSet(signer, { quorum, signers, ...restArgs }, options = { multisign: false, yes: false }) {
        this.checkRequiredField(quorum, 'quorum');
        this.checkRequiredField(signers, 'signers');
        if (signers.length === 0) {
            throw new Error('Signers list cannot be empty');
        }
        return this.signAndSubmitTx(signer, 'SignerListSet', {
            SignerQuorum: quorum,
            SignerEntries: signers.map((signer) => ({
                SignerEntry: {
                    Account: signer.address,
                    SignerWeight: signer.weight,
                },
            })),
        }, restArgs, options);
    }
    async sendTicketCreate(signer, { ticketCount, ...restArgs }, options = { multisign: false, yes: false }) {
        this.checkRequiredField(ticketCount, 'ticketCount');
        return this.signAndSubmitTx(signer, 'TicketCreate', { TicketCount: ticketCount }, restArgs, options);
    }
    async sendAccountSet(signer, { transferRate, tickSize, domain, flag, ...restArgs }, options = { multisign: false, yes: false }) {
        return this.signAndSubmitTx(signer, 'AccountSet', {
            TransferRate: transferRate,
            TickSize: tickSize,
            Domain: domain,
            SetFlag: flag,
        }, restArgs, options);
    }
    async sendTrustSet(signer, { currency, issuer, value, ...restArgs }, options = { multisign: false, yes: false }) {
        this.checkRequiredField(currency, 'currency');
        this.checkRequiredField(issuer, 'issuer');
        this.checkRequiredField(value, 'value');
        return this.signAndSubmitTx(signer, 'TrustSet', {
            LimitAmount: {
                currency,
                issuer,
                value,
            },
        }, restArgs, options);
    }
}
exports.XRPLClient = XRPLClient;
async function printWalletInfo(client, wallet, chain) {
    const address = wallet.address;
    const { balance, sequence } = await client.accountInfo(address);
    (0, common_1.printInfo)('Wallet address', address);
    if (balance === '0') {
        (0, common_1.printError)('Wallet balance', '0');
    }
    else {
        (0, common_1.printInfo)('Wallet balance', `${xrpl.dropsToXrp(balance)} ${chain.tokenSymbol || ''}`);
    }
    if (sequence === '-1') {
        (0, common_1.printWarn)('Wallet is not active because it does not meet the base reserve requirement');
        return;
    }
    (0, common_1.printInfo)('Wallet sequence', sequence);
    const lines = await client.accountLines(address);
    if (lines.length === 0) {
        (0, common_1.printInfo)('Wallet IOU balances', 'No IOU balances found');
        return;
    }
    (0, common_1.printInfo)('Wallet IOU balances', lines.map((line) => `${line.balance} ${line.currency}.${line.account}`).join('  '));
}
async function mainProcessor(processor, options, args, save = true, catchErr = false) {
    if (!options.env) {
        throw new Error('Environment was not provided');
    }
    (0, common_1.printInfo)('Environment', options.env);
    const config = (0, common_1.loadConfig)(options.env);
    if (!options.chainName) {
        throw new Error('Chain name was not provided');
    }
    const chainName = options.chainName.toLowerCase();
    const chain = (0, common_1.getChainConfig)(config, chainName);
    if (!chain) {
        throw new Error(`Chain ${chainName} is not defined in the info file`);
    }
    if (chain.name !== 'xrpl') {
        throw new Error(`Cannot run script for a non XRPL chain: ${chainName}`);
    }
    console.log('');
    (0, common_1.printInfo)('Chain', chain.name, chalk_1.default.cyan);
    const wallet = getWallet({
        privateKey: options.privateKey || '',
        walletKeyType: options.privateKeyType || 'ed25519'
    });
    const client = new XRPLClient(chain.wssRpc);
    await client.connect();
    try {
        await processor(config, wallet, client, chain, options, args);
    }
    catch (error) {
        (0, common_1.printError)(`Failed with error on ${chainName}`, error.message);
        if (!catchErr && !options.ignoreError) {
            throw error;
        }
    }
    finally {
        await client.disconnect();
    }
    if (save) {
        (0, common_1.saveConfig)(config, options.env);
    }
}
//# sourceMappingURL=utils.js.map