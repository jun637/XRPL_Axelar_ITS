import * as xrpl from 'xrpl';
/**
 * XRPL 계정 속성을 설정하는 함수
 * @param _config - 설정 객체 (사용하지 않음)
 * @param wallet - XRPL 지갑 객체
 * @param client - XRPL 클라이언트
 * @param _chain - 체인 정보 (사용하지 않음)
 * @param options - 옵션 객체 (account, transferRate, tickSize, domain, flag, yes 포함)
 */
declare function accountSet(_config: any, wallet: xrpl.Wallet, client: any, _chain: any, options: {
    account?: string;
    transferRate?: string;
    tickSize?: string;
    domain?: string;
    flag?: string;
    yes: boolean;
}): Promise<void>;
export { accountSet };
