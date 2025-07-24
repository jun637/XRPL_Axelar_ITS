import * as xrpl from 'xrpl';
/**
 * 지갑의 잔액을 표시하는 함수
 * @param _config - 설정 객체 (사용하지 않음)
 * @param wallet - XRPL 지갑 객체
 * @param client - XRPL 클라이언트
 * @param chain - 체인 정보
 */
declare function balances(_config: any, wallet: xrpl.Wallet, client: any, chain: any): Promise<void>;
export { balances };
