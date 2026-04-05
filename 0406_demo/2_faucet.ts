/**
 * [STEP 2] 테스트넷 XRP 수령 (Faucet)
 *
 * XRPL 테스트넷 Faucet에 요청하여 지갑에 테스트용 XRP를 충전합니다.
 * 테스트넷에서만 동작하며, 메인넷에서는 사용할 수 없습니다.
 *
 * 실행: npx ts-node 0406_demo/2_faucet.ts
 */

// xrpl: XRPL 네트워크와 상호작용하기 위한 공식 JavaScript/TypeScript 라이브러리
// Client: XRPL 노드에 WebSocket으로 연결하는 클라이언트
// Wallet: 지갑 생성/복원 및 트랜잭션 서명에 사용
import { Client, Wallet } from 'xrpl';

// ============ XRPL 네트워크 연결 WebSocket URL + 지갑 생성 정보 설정 영역 ============
const WSS_URL = 'wss://s.altnet.rippletest.net:51233';  // XRPL 테스트넷 WebSocket 엔드포인트
const SEED = 'sEdVhxCVbktxtztgx7gD4DGuyhG1v8S';         // ← 1번에서 생성한 seed 입력
// ==================================================================================

async function main() {
    // XRPL 테스트넷 노드에 WebSocket 연결
    const client = new Client(WSS_URL);
    await client.connect();

    // Seed로부터 지갑 복원 — 1번 스크립트에서 생성한 동일한 지갑
    const wallet = Wallet.fromSeed(SEED);
    console.log(`지갑 주소: ${wallet.address}`);

    // fundWallet(): XRPL 테스트넷 Faucet에 XRP 충전 요청
    // 테스트넷에서 무료로 XRP를 받을 수 있는 공식 API
    console.log('Faucet 요청 중...');
    const result = await client.fundWallet(wallet);
    console.log(`수령 완료: ${result.balance} XRP`);

    // WebSocket 연결 종료
    await client.disconnect();
}

main().catch(console.error);
