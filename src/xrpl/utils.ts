'use strict';
import "dotenv/config"
import * as xrpl from 'xrpl';
import { decodeAccountID } from 'ripple-address-codec';
import * as rippleBinaryCodec from 'ripple-binary-codec';
import chalk from 'chalk';
import { loadConfig, saveConfig, printInfo, printWarn, printError, prompt, getChainConfig } from '../common';
import { deriveAddress as xrplDeriveAddress } from 'ripple-keypairs';

function hex(str: string): string {
    return Buffer.from(str).toString('hex');
}

function roundUpToNearestXRP(amountInDrops: number): number {
    return Math.ceil(amountInDrops / 1e6) * 1e6;
}

function generateWallet(): xrpl.Wallet {
    return xrpl.Wallet.generate(xrpl.ECDSA.ed25519);
}

function getWallet(options: { privateKey: string }): xrpl.Wallet {
    return xrpl.Wallet.fromSeed(options.privateKey, { algorithm: xrpl.ECDSA.ed25519 });
}

function deriveAddress(publicKey: string): string {
    try {
        // publicKey가 이미 address인 경우 그대로 반환
        if (publicKey.length === 34 && publicKey.startsWith('r')) {
            return publicKey;
        }
        // xrpl 공식 유틸 사용
        return xrplDeriveAddress(publicKey);
    } catch (error) {
        throw new Error(`Failed to derive address from public key: ${(error as Error).message}`);
    }
}

function decodeAccountIDToHex(accountId: string): string {
    const decoded = decodeAccountID(accountId);
    return Buffer.from(decoded).toString('hex');
}

function decodeTxBlob(blob: string): any {
    return rippleBinaryCodec.decode(blob);
}

function parseTokenAmount(token: string, amount: number): xrpl.Amount {
    let parsedAmount: xrpl.Amount;
    if (token === 'XRP') {
        parsedAmount = xrpl.xrpToDrops(amount);
    } else {
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
    private client: xrpl.Client;

    constructor(rpcUrl: string) {
        this.client = new xrpl.Client(rpcUrl);
    }

    async connect(): Promise<void> {
        await this.client.connect();
    }

    async disconnect(): Promise<void> {
        await this.client.disconnect();
    }

    async request(command: string, params: any = {}): Promise<any> {
        const response = await this.client.request({ command, ...params });
        return response.result;
    }

    async autofill(tx: any): Promise<any> {
        return this.client.autofill(tx);
    }

    async accountInfo(account: string, ledgerIndex: string = 'validated'): Promise<{ balance: string; sequence: string }> {
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
        } catch (error: any) {
            if (error.data?.error === 'actNotFound') {
                return {
                    balance: '0',
                    sequence: '-1',
                };
            }

            throw error;
        }
    }

    async accountObjects(account: string, params: any = {}, limit: number = 1000, ledgerIndex: string = 'validated'): Promise<any[]> {
        const accountObjectsRes = await this.request('account_objects', {
            account,
            ledger_index: ledgerIndex,
            limit,
            ...params,
        });

        return accountObjectsRes.account_objects;
    }

    async tickets(account: string, limit: number = 1000, ledgerIndex: string = 'validated'): Promise<number[]> {
        const ticketRes = await this.accountObjects(account, { type: 'ticket' }, limit, ledgerIndex);
        return ticketRes.map((ticket: any) => ticket.TicketSequence);
    }

    async accountLines(account: string): Promise<any[]> {
        const accountLinesRes = await this.request('account_lines', {
            account,
            ledger_index: 'validated',
        });

        return accountLinesRes.lines;
    }

    async reserveRequirements(): Promise<{ baseReserve: number; ownerReserve: number }> {
        const serverInfoRes = await this.request('server_info');
        const validatedLedger = serverInfoRes.info.validated_ledger;
        return {
            baseReserve: validatedLedger.reserve_base_xrp,
            ownerReserve: validatedLedger.reserve_inc_xrp,
        };
    }

    async fee(feeType: string = 'open_ledger_fee'): Promise<number> {
        const feeRes = await this.request('fee');
        return feeRes.drops[feeType];
    }

    async fundWallet(wallet: xrpl.Wallet, amount: xrpl.Amount): Promise<any> {
        return this.client.fundWallet(wallet, { amount: amount.toString() });
    }

    handleReceipt(receipt: any): void {
        const result: string = receipt.engine_result;

        if (result !== 'tesSUCCESS') {
            printError('Transaction failed', `${receipt.engine_result}: ${receipt.engine_result_message}`);
            process.exit(1);
        }

        printInfo(`Transaction sent`, receipt.tx_json.hash);
    }

    async submitTx(txBlob: string, failHard: boolean = true): Promise<any> {
        const result = await this.request('submit', {
            tx_blob: txBlob,
            fail_hard: failHard,
        });
        this.handleReceipt(result);
        return result;
    }

    async buildTx(txType: string, fields: any = {}, args: any = {}): Promise<any> {
        const tx: any = {
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

    async signTx(signer: xrpl.Wallet, tx: any, multisign: boolean = false): Promise<any> {
        return signer.sign(tx, multisign);
    }

    async signAndSubmitTx(signer: xrpl.Wallet, txType: string, fields: any = {}, args: any = {}, options: { multisign: boolean; yes: boolean } = { multisign: false, yes: false }): Promise<any> {
        const tx: any = await this.buildTx(txType, fields, {
            ...args,
            account: args.account ?? signer.classicAddress,
            // when multisigning, fee = (N + 1) * normal fee, where N is the number of signatures
            fee: args.fee ?? (options.multisign ? String(Number(await this.fee()) * 2) : undefined),
        });

        printInfo(`${options.multisign ? 'Multi-' : ''}Signing transaction`, JSON.stringify(tx, null, 2));
        const signedTx: any = await this.signTx(signer, tx, options.multisign);

        if (prompt(`Submit ${txType} transaction?`, options.yes)) {
            printWarn('Transaction cancelled by user.');
            process.exit(0);
        }

        return this.submitTx(signedTx.tx_blob);
    }

    checkRequiredField(field: any, fieldName: string): void {
        if (!field) {
            throw new Error(`Missing required field: ${fieldName}`);
        }
    }

    async sendPayment(signer: xrpl.Wallet, { destination, amount, memos = [], ...restArgs }: any, options: { multisign: boolean; yes: boolean } = { multisign: false, yes: false }): Promise<any> {
        this.checkRequiredField(destination, 'destination');
        this.checkRequiredField(amount, 'amount');
        return this.signAndSubmitTx(
            signer,
            'Payment',
            {
                Destination: destination,
                Amount: amount,
                Memos:
                    memos.length > 0
                        ? memos.map((memo: any) => ({
                              Memo: {
                                  MemoType: memo.memoType,
                                  MemoData: memo.memoData,
                              },
                          }))
                        : undefined,
            },
            restArgs,
            options,
        );
    }

    async sendSignerListSet(signer: xrpl.Wallet, { quorum, signers, ...restArgs }: any, options: { multisign: boolean; yes: boolean } = { multisign: false, yes: false }): Promise<any> {
        this.checkRequiredField(quorum, 'quorum');
        this.checkRequiredField(signers, 'signers');

        if (signers.length === 0) {
            throw new Error('Signers list cannot be empty');
        }

        return this.signAndSubmitTx(
            signer,
            'SignerListSet',
            {
                SignerQuorum: quorum,
                SignerEntries: signers.map((signer: any) => ({
                    SignerEntry: {
                        Account: signer.address,
                        SignerWeight: signer.weight,
                    },
                })),
            },
            restArgs,
            options,
        );
    }

    async sendTicketCreate(signer: xrpl.Wallet, { ticketCount, ...restArgs }: any, options: { multisign: boolean; yes: boolean } = { multisign: false, yes: false }): Promise<any> {
        this.checkRequiredField(ticketCount, 'ticketCount');
        return this.signAndSubmitTx(signer, 'TicketCreate', { TicketCount: ticketCount }, restArgs, options);
    }

    async sendAccountSet(signer: xrpl.Wallet, { transferRate, tickSize, domain, flag, ...restArgs }: any, options: { multisign: boolean; yes: boolean } = { multisign: false, yes: false }): Promise<any> {
        return this.signAndSubmitTx(
            signer,
            'AccountSet',
            {
                TransferRate: transferRate,
                TickSize: tickSize,
                Domain: domain,
                SetFlag: flag,
            },
            restArgs,
            options,
        );
    }

    async sendTrustSet(signer: xrpl.Wallet, { currency, issuer, value, ...restArgs }: any, options: { multisign: boolean; yes: boolean } = { multisign: false, yes: false }): Promise<any> {
        this.checkRequiredField(currency, 'currency');
        this.checkRequiredField(issuer, 'issuer');
        this.checkRequiredField(value, 'value');
        return this.signAndSubmitTx(
            signer,
            'TrustSet',
            {
                LimitAmount: {
                    currency,
                    issuer,
                    value,
                },
            },
            restArgs,
            options,
        );
    }
}

async function printWalletInfo(client: XRPLClient, wallet: xrpl.Wallet, chain: { name: string; tokenSymbol?: string; wssRpc: string }): Promise<void> {
    const address: string = wallet.address;
    const { balance, sequence } = await client.accountInfo(address);
    printInfo('Wallet address', address);

    if (balance === '0') {
        printError('Wallet balance', '0');
    } else {
        printInfo('Wallet balance', `${xrpl.dropsToXrp(balance)} ${chain.tokenSymbol || ''}`);
    }

    if (sequence === '-1') {
        printWarn('Wallet is not active because it does not meet the base reserve requirement');
        return;
    }

    printInfo('Wallet sequence', sequence);

    const lines: any[] = await client.accountLines(address);

    if (lines.length === 0) {
        printInfo('Wallet IOU balances', 'No IOU balances found');
        return;
    }

    printInfo('Wallet IOU balances', lines.map((line: any) => `${line.balance} ${line.currency}.${line.account}`).join('  '));
}

async function mainProcessor(processor: (config: any, wallet: xrpl.Wallet, client: XRPLClient, chain: { name: string; tokenSymbol?: string; wssRpc: string }, options: any, args: string[]) => Promise<void>, options: { env: string; chainName?: string; ignoreError?: boolean; privateKey?: string; privateKeyType?: string }, args: string[], save: boolean = true, catchErr: boolean = false): Promise<void> {
    if (!options.env) {
        throw new Error('Environment was not provided');
    }

    printInfo('Environment', options.env);

    const config = loadConfig();

    if (!options.chainName) {
        throw new Error('Chain name was not provided');
    }

    const chainName: string = options.chainName.toLowerCase();

    const chain: { name: string; tokenSymbol?: string; wssRpc: string } | undefined = getChainConfig(config, chainName);

    if (!chain) {
        throw new Error(`Chain ${chainName} is not defined in the info file`);
    }

    if (chain.name !== 'xrpl') {
        throw new Error(`Cannot run script for a non XRPL chain: ${chainName}`);
    }

    console.log('');
    printInfo('Chain', chain.name, chalk.cyan);

    const wallet: xrpl.Wallet = getWallet({
        privateKey: options.privateKey || process.env.PRIVATE_KEY || ''
    });

    const client: XRPLClient = new XRPLClient(chain.wssRpc);
    await client.connect();

    try {
        await processor(config, wallet, client, chain, options, args);
    } catch (error: any) {
        printError(`Failed with error on ${chainName}`, error.message);

        if (!catchErr && !options.ignoreError) {
            throw error;
        }
    } finally {
        await client.disconnect();
    }

    if (save) {
        saveConfig(config, options.env);
    }
}

export {
    XRPLClient,
    generateWallet,
    getWallet,
    printWalletInfo,
    mainProcessor,
    hex,
    roundUpToNearestXRP,
    deriveAddress,
    parseTokenAmount,
    decodeAccountIDToHex,
    decodeTxBlob,
};