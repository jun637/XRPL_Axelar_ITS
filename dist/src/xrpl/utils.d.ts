import * as xrpl from 'xrpl';
declare function hex(str: string): string;
declare function roundUpToNearestXRP(amountInDrops: number): number;
declare function generateWallet(options: {
    walletKeyType: string;
}): xrpl.Wallet;
declare function getWallet(options: {
    privateKey: string;
    walletKeyType: string;
}): xrpl.Wallet;
declare function deriveAddress(publicKey: string): string;
declare function decodeAccountIDToHex(accountId: string): string;
declare function decodeTxBlob(blob: string): any;
declare function parseTokenAmount(token: string, amount: number): xrpl.Amount;
declare class XRPLClient {
    private client;
    constructor(rpcUrl: string);
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    request(command: string, params?: any): Promise<any>;
    autofill(tx: any): Promise<any>;
    accountInfo(account: string, ledgerIndex?: string): Promise<{
        balance: string;
        sequence: string;
    }>;
    accountObjects(account: string, params?: any, limit?: number, ledgerIndex?: string): Promise<any[]>;
    tickets(account: string, limit?: number, ledgerIndex?: string): Promise<number[]>;
    accountLines(account: string): Promise<any[]>;
    reserveRequirements(): Promise<{
        baseReserve: number;
        ownerReserve: number;
    }>;
    fee(feeType?: string): Promise<number>;
    fundWallet(wallet: xrpl.Wallet, amount: xrpl.Amount): Promise<any>;
    handleReceipt(receipt: any): void;
    submitTx(txBlob: string, failHard?: boolean): Promise<any>;
    buildTx(txType: string, fields?: any, args?: any): Promise<any>;
    signTx(signer: xrpl.Wallet, tx: any, multisign?: boolean): Promise<any>;
    signAndSubmitTx(signer: xrpl.Wallet, txType: string, fields?: any, args?: any, options?: {
        multisign: boolean;
        yes: boolean;
    }): Promise<any>;
    checkRequiredField(field: any, fieldName: string): void;
    sendPayment(signer: xrpl.Wallet, { destination, amount, memos, ...restArgs }: any, options?: {
        multisign: boolean;
        yes: boolean;
    }): Promise<any>;
    sendSignerListSet(signer: xrpl.Wallet, { quorum, signers, ...restArgs }: any, options?: {
        multisign: boolean;
        yes: boolean;
    }): Promise<any>;
    sendTicketCreate(signer: xrpl.Wallet, { ticketCount, ...restArgs }: any, options?: {
        multisign: boolean;
        yes: boolean;
    }): Promise<any>;
    sendAccountSet(signer: xrpl.Wallet, { transferRate, tickSize, domain, flag, ...restArgs }: any, options?: {
        multisign: boolean;
        yes: boolean;
    }): Promise<any>;
    sendTrustSet(signer: xrpl.Wallet, { currency, issuer, value, ...restArgs }: any, options?: {
        multisign: boolean;
        yes: boolean;
    }): Promise<any>;
}
declare function printWalletInfo(client: XRPLClient, wallet: xrpl.Wallet, chain: {
    name: string;
    tokenSymbol?: string;
    wssRpc: string;
}): Promise<void>;
declare function mainProcessor(processor: (config: any, wallet: xrpl.Wallet, client: XRPLClient, chain: {
    name: string;
    tokenSymbol?: string;
    wssRpc: string;
}, options: any, args: string[]) => Promise<void>, options: {
    env: string;
    chainName?: string;
    ignoreError?: boolean;
    privateKey?: string;
    privateKeyType?: string;
}, args: string[], save?: boolean, catchErr?: boolean): Promise<void>;
export { XRPLClient, generateWallet, getWallet, printWalletInfo, mainProcessor, hex, roundUpToNearestXRP, deriveAddress, parseTokenAmount, decodeAccountIDToHex, decodeTxBlob, };
