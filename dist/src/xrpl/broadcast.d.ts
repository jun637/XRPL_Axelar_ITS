import * as xrpl from 'xrpl';
/**
 * 인코딩된 서명된 트랜잭션을 XRPL에 브로드캐스트하는 함수
 * @param _config - 설정 객체 (사용하지 않음)
 * @param _wallet - 지갑 객체 (사용하지 않음)
 * @param client - XRPL 클라이언트
 * @param _chain - 체인 정보 (사용하지 않음)
 * @param options - 옵션 객체
 * @param args - 인수 객체 (txBlob 포함)
 */
declare function broadcast(_config: any, _wallet: xrpl.Wallet, client: any, _chain: any, options: {
    yes: boolean;
}, args: string[]): Promise<void>;
export { broadcast };
