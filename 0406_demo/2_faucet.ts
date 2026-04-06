/**
 * [STEP 2] 테스트넷 XRP 수령
 *
 * 실행: npx ts-node 0406_demo/2_faucet.ts
 * SEED를 1번에서 생성한 값으로 교체
 */
import { Client, Wallet } from 'xrpl';

// ============ XRPL 네트워크 연결 WebSocket URL + 지갑 생성 정보 설정 영역 ============
const WSS_URL = 'wss://s.altnet.rippletest.net:51233';
const SEED = 'sEdVhxCVbktxtztgx7gD4DGuyhG1v8S'; // ← 1번에서 생성한 seed 입력 (현재는 하드코딩된 상태)
// ======================================

async function main() {
    const client = new Client(WSS_URL);
    await client.connect();

    const wallet = Wallet.fromSeed(SEED);
    console.log(`지갑 주소: ${wallet.address}`);

    console.log('Faucet 요청 중...');
    const result = await client.fundWallet(wallet);
    console.log(`수령 완료: ${result.balance} XRP`);
    console.log(`Explorer: https://testnet.xrpl.org/accounts/${wallet.address}`);

    await client.disconnect();
}

main().catch(console.error);
