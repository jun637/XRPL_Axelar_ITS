import * as xrpl from 'xrpl';
/**
 * 특정 토큰 발행자와의 신뢰선을 설정하는 함수
 * @param _config - 설정 객체 (사용하지 않음)
 * @param wallet - XRPL 지갑 객체
 * @param client - XRPL 클라이언트
 * @param _chain - 체인 정보 (사용하지 않음)
 * @param options - 옵션 객체 (account, limit, yes 포함)
 * @param args - 인수 배열 (currency, issuer 포함)
 */
declare function trustSet(_config: any, wallet: xrpl.Wallet, client: any, _chain: any, options: {
    account?: string;
    limit: string;
    yes: boolean;
}, args: string[]): Promise<void>;
export { trustSet };
