/**
 * XRPL 트랜잭션 blob을 디코딩하여 트랜잭션 객체로 변환하는 함수
 * @param txBlob - 디코딩할 XRPL 직렬화된 트랜잭션 blob
 */
declare function processCommand(txBlob: string): void;
export { processCommand };
