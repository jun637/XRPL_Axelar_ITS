import * as xrpl from 'xrpl';
/**
 * XRPL에서 GMP 호출을 시작하는 함수
 * @param _config - 설정 객체 (사용하지 않음)
 * @param wallet - XRPL 지갑 객체
 * @param client - XRPL 클라이언트
 * @param chain - 체인 정보 (contracts.AxelarGateway.address 포함)
 * @param options - 옵션 객체 (payload, gasFeeToken, gasFeeAmount, yes 포함)
 * @param args - 인수 배열 (destinationChain, destinationAddress 포함)
 */
declare function callContract(_config: any, wallet: xrpl.Wallet, client: any, chain: any, options: {
    payload: string;
    gasFeeToken: string;
    gasFeeAmount: number;
    yes: boolean;
}, args: string[]): Promise<void>;
export { callContract };
