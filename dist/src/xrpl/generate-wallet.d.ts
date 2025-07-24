/**
 * 새로운 XRPL 지갑을 생성하는 함수
 * @param options - 지갑 생성 옵션 (walletKeyType 포함)
 */
declare function processCommand(options: {
    walletKeyType: string;
}): void;
export { processCommand };
