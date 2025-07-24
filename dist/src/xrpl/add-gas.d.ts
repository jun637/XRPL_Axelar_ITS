import * as xrpl from 'xrpl';
/**
 * XRPL 메시지에 가스를 추가하는 함수
 * @param _config - 설정 객체 (사용하지 않음)
 * @param wallet - XRPL 지갑 객체
 * @param client - XRPL 클라이언트
 * @param chain - 체인 정보 (contracts.AxelarGateway.address 포함)
 * @param options - 옵션 객체 (token, amount, msgId, yes 포함)
 * @param _args - 인수 배열 (사용하지 않음)
 */
declare function addGas(_config: any, wallet: xrpl.Wallet, client: any, chain: any, options: {
    token: string;
    amount: number;
    msgId: string;
    yes: boolean;
}, _args: string[]): Promise<void>;
export { addGas };
