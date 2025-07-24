import * as xrpl from 'xrpl';
/**
 * XRPL 멀티시그 계정의 서명자를 교체하는 함수
 * @param _config - 설정 객체 (사용하지 않음)
 * @param wallet - XRPL 지갑 객체
 * @param client - XRPL 클라이언트
 * @param chain - 체인 정보 (contracts.AxelarGateway.address 포함)
 * @param options - 옵션 객체 (signerPublicKeys, signerWeights, quorum, yes 포함)
 */
declare function rotateSigners(_config: any, wallet: xrpl.Wallet, client: any, chain: any, options: {
    signerPublicKeys: string[];
    signerWeights: string[];
    quorum: string;
    yes: boolean;
}): Promise<void>;
export { rotateSigners };
