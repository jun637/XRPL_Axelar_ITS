import * as xrpl from 'xrpl';
/**
 * XRPL faucet에서 자금을 요청하는 함수
 * @param _config - 설정 객체 (사용하지 않음)
 * @param wallet - XRPL 지갑 객체
 * @param client - XRPL 클라이언트
 * @param _chain - 체인 정보 (사용하지 않음)
 * @param options - 옵션 객체 (recipient, amount, minBalance, yes 포함)
 */
declare function faucet(_config: any, wallet: xrpl.Wallet, client: any, _chain: any, options: {
    recipient?: string;
    amount: string;
    minBalance: string;
    yes: boolean;
}): Promise<void>;
export { faucet };
