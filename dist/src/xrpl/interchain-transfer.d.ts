import * as xrpl from 'xrpl';
/**
 * XRPL에서 체인간 토큰 전송을 시작하는 함수
 * @param _config - 설정 객체 (사용하지 않음)
 * @param wallet - XRPL 지갑 객체
 * @param client - XRPL 클라이언트
 * @param chain - 체인 정보 (contracts.InterchainTokenService.address 포함)
 * @param options - 옵션 객체 (payload, gasFeeAmount, yes 포함)
 * @param args - 인수 배열 (token, amount, destinationChain, destinationAddress 포함)
 */
declare function interchainTransfer(_config: any, wallet: xrpl.Wallet, client: any, chain: any, options: {
    payload?: string;
    gasFeeAmount: string;
    yes: boolean;
}, args: string[]): Promise<void>;
export { interchainTransfer };
