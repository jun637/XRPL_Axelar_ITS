import * as xrpl from 'xrpl';
/**
 * XRPL 계정을 위한 티켓을 생성하는 함수
 * @param _config - 설정 객체 (사용하지 않음)
 * @param wallet - XRPL 지갑 객체
 * @param client - XRPL 클라이언트
 * @param _chain - 체인 정보 (사용하지 않음)
 * @param options - 옵션 객체 (account, ticketCount, yes 포함)
 */
declare function ticketCreate(_config: any, wallet: xrpl.Wallet, client: any, _chain: any, options: {
    account?: string;
    ticketCount: string;
    yes: boolean;
}): Promise<void>;
export { ticketCreate };
