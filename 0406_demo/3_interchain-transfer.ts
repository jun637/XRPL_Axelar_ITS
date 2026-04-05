/**
 * [STEP 3] XRPL → XRPL EVM 사이드체인 크로스체인 전송 (Axelar ITS)
 *
 * XRPL에서 XRPL EVM 사이드체인으로 XRP를 크로스체인 전송합니다.
 *
 * 핵심 원리:
 *   - XRPL은 스마트 컨트랙트가 없으므로, Payment 트랜잭션의 Memo 필드에
 *     Axelar가 정한 포맷으로 목적지 정보를 기록합니다.
 *   - Axelar 릴레이어가 XRPL 원장을 모니터링하다가 이 Memo를 읽어가서
 *     EVM 쪽에 토큰을 전달하는 구조입니다.
 *   - 따라서 Axelar SDK를 직접 호출하는 코드는 없습니다.
 *
 * 실행: npx ts-node 0406_demo/3_interchain-transfer.ts
 */

// xrpl: XRPL 네트워크와 상호작용하기 위한 공식 JavaScript/TypeScript 라이브러리
// Client: WebSocket 연결 클라이언트
// Wallet: 트랜잭션 서명용 지갑
// xrpToDrops: XRP → drops 단위 변환 (1 XRP = 1,000,000 drops)
// Payment: XRPL Payment 트랜잭션 타입
import { Client, Wallet, xrpToDrops, Payment } from 'xrpl';

// ============ XRPL 네트워크 연결 WebSocket URL + 지갑 생성 정보 설정 영역 ============
const WSS_URL = 'wss://s.altnet.rippletest.net:51233';  // XRPL 테스트넷 WebSocket 엔드포인트
const SEED = 'sEdVhxCVbktxtztgx7gD4DGuyhG1v8S';         // ← 1번에서 생성한 seed 입력 (현재는 하드코딩된 상태)
// ==================================================================================

// ============ 크로스체인 전송 설정 영역 ============
const ITS_ADDRESS = 'rNrjh1KGZk2jBR3wPfAQnoidtFFYQKbQn2';                  // Axelar ITS 컨트랙트 주소 (XRPL 측) — 이 주소로 Payment를 보내면 Axelar가 감지
const DESTINATION_CHAIN = 'xrpl-evm';                                      // 목적지 체인 식별자 (Axelar가 인식하는 체인 이름)
const DESTINATION_ADDRESS = '0x3F2A5215585536487B99a72b20358eEeaD42381e';  // 받을 EVM 지갑 주소 (현재는 하드코딩된 상태)
const AMOUNT_XRP = '10';                                                   // 보낼 XRP 수량 (현재는 하드코딩된 상태)
const GAS_FEE_AMOUNT_XRP = '0.5';                                          // Axelar 릴레이어 가스비 (XRP 단위) — 부족하면 전송이 멈춤
// ================================================

/**
 * toHex: 문자열을 16진수(hex)로 변환
 * XRPL Memo 필드는 hex 인코딩된 문자열만 허용하기 때문에 필요
 */
function toHex(str: string): string {
    return Buffer.from(str).toString('hex').toUpperCase();
}

async function main() {
    // XRPL 테스트넷 노드에 WebSocket 연결
    const client = new Client(WSS_URL);
    await client.connect();

    // Seed로부터 지갑 복원
    const wallet = Wallet.fromSeed(SEED);

    // 전송 정보 출력
    console.log(`보내는 지갑: ${wallet.address}`);
    console.log(`받는 체인:   ${DESTINATION_CHAIN}`);
    console.log(`받는 주소:   ${DESTINATION_ADDRESS}`);
    console.log(`전송 수량:   ${AMOUNT_XRP} XRP`);
    console.log(`가스비:      ${GAS_FEE_AMOUNT_XRP} XRP`);

    // ============ 크로스체인 Payment 트랜잭션 구성 ============
    // XRPL의 일반 Payment 트랜잭션이지만, Memo에 Axelar 약속 포맷을 담아서
    // "이건 크로스체인 전송이다"라고 릴레이어에게 알려주는 구조
    const tx: Payment = {
        TransactionType: 'Payment',
        Account: wallet.address,             // 보내는 사람 (내 지갑)
        Destination: ITS_ADDRESS,            // 받는 사람 = Axelar ITS 컨트랙트 (XRPL 주소)
        Amount: xrpToDrops(AMOUNT_XRP),      // 보낼 금액 (drops 단위로 변환)
        Memos: [
            // Memo 1: 트랜잭션 타입 — "이건 인터체인 전송이다"
            {
                Memo: {
                    MemoType: toHex('type'),
                    MemoData: toHex('interchain_transfer'),
                },
            },
            // Memo 2: 목적지 체인 — "xrpl-evm으로 보내라"
            {
                Memo: {
                    MemoType: toHex('destination_chain'),
                    MemoData: toHex(DESTINATION_CHAIN),
                },
            },
            // Memo 3: 목적지 주소 — "이 EVM 주소로 보내라" (0x 접두사 제거 후 hex 변환)
            {
                Memo: {
                    MemoType: toHex('destination_address'),
                    MemoData: toHex(DESTINATION_ADDRESS.replace('0x', '')),
                },
            },
            // Memo 4: 가스비 — Axelar 릴레이어가 EVM 쪽 트랜잭션을 실행할 때 쓸 비용 (drops 단위)
            {
                Memo: {
                    MemoType: toHex('gas_fee_amount'),
                    MemoData: toHex(xrpToDrops(GAS_FEE_AMOUNT_XRP)),
                },
            },
        ],
    };
    // ========================================================

    // 트랜잭션 서명 후 XRPL 원장에 제출하고, 검증될 때까지 대기
    console.log('\n트랜잭션 제출 중...');
    const result = await client.submitAndWait(tx, { wallet });

    // 결과 출력
    console.log(`TX 해시: ${result.result.hash}`);
    console.log(`상태:    ${result.result.meta && typeof result.result.meta === 'object' ? (result.result.meta as any).TransactionResult : 'unknown'}`);

    // 탐색기 링크 — XRPL 탐색기에서 TX 확인, Axelarscan에서 크로스체인 릴레이 진행 상태 확인
    console.log(`\nXRPL 탐색기:     https://testnet.xrpl.org/transactions/${result.result.hash}`);
    console.log(`Axelarscan:      https://testnet.axelarscan.io/gmp/${result.result.hash}`);

    // WebSocket 연결 종료
    await client.disconnect();
}

main().catch(console.error);
