import * as xrpl from 'xrpl';
/**
 * XRPL 멀티시그 계정을 배포하는 함수
 * @param _config - 설정 객체 (사용하지 않음)
 * @param wallet - XRPL 지갑 객체
 * @param client - XRPL 클라이언트
 * @param chain - 체인 정보 (contracts 객체 포함)
 * @param options - 옵션 객체 (generateWallet, transferRate, tickSize, domain, flags, initialSigner, yes 포함)
 */
declare function deployMultisig(_config: any, wallet: xrpl.Wallet, client: any, chain: any, options: {
    generateWallet: boolean;
    transferRate: number;
    tickSize: number;
    domain: string;
    flags: number[];
    initialSigner: string;
    yes: boolean;
}): Promise<void>;
export { deployMultisig };
