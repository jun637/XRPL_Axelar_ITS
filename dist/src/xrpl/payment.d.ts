import * as xrpl from 'xrpl';
/**
 * XRPL에서 토큰을 전송하는 함수
 * @param _config - 설정 객체 (사용하지 않음)
 * @param wallet - XRPL 지갑 객체
 * @param client - XRPL 클라이언트
 * @param _chain - 체인 정보 (사용하지 않음)
 * @param options - 옵션 객체 (from, to, token, amount, yes 포함)
 */
declare function payment(_config: any, wallet: xrpl.Wallet, client: any, _chain: any, options: {
    from?: string;
    to: string;
    token: string;
    amount: number;
    yes: boolean;
}): Promise<void>;
export { payment };
