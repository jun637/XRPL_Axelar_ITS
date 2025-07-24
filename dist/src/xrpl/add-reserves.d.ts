import * as xrpl from 'xrpl';
/**
 * XRPL 멀티시그 fee reserve를 충전하는 함수
 * @param _config - 환경 설정 객체
 * @param wallet - XRPL 지갑 객체
 * @param client - XRPL 클라이언트 객체
 * @param chain - 체인 정보 객체
 * @param options - 커맨드라인 옵션 객체
 * @param _args - 추가 인자(사용 안 함)
 */
declare function addReserves(_config: any, wallet: xrpl.Wallet, client: any, chain: any, options: {
    amount: string;
}, _args: any): Promise<void>;
export { addReserves };
