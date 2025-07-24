import "dotenv/config";
import * as xrpl from 'xrpl';

/**
 * 환경변수(PRIVATE_KEY)로 XRPL 지갑을 불러와
 * - 지갑 정보(주소, 시드, 공개키) 출력
 * - 10 XRP 자동 충전
 * - XRP/IOU 잔고 모두 조회
 * 를 한 번에 처리하는 통합 스크립트입니다.
 *
 * [실행 예시]
 *   npx ts-node src/wallet/check-balance.ts
 */

async function checkBalance() {
    const seed = process.env.PRIVATE_KEY;
    if (!seed) {
        console.error('❌ 환경변수 PRIVATE_KEY가 설정되어 있지 않습니다.');
        process.exit(1);
    }
    const wallet = xrpl.Wallet.fromSeed(seed.trim());
    console.log('👛 XRPL 지갑 정보');
    console.log(`- 주소: ${wallet.address}`);
    console.log(`- 시드: ${wallet.seed}`);
    console.log(`- 공개키: ${wallet.publicKey}`);

    const client = new xrpl.Client('wss://s.altnet.rippletest.net:51233');
    await client.connect();

    // 10 XRP 자동 충전
    try {
        console.log('💸 10 XRP 자동 충전 중...');
        await client.fundWallet(wallet, { amount: '10' });
        console.log('✅ 10 XRP 충전 완료!');
    } catch (e) {
        console.warn('⚠️ fundWallet 실패(이미 충분한 잔고가 있을 수 있음):', e?.message || e);
    }

    // XRP 잔고 조회
    const  balance  = await client.getXrpBalance(wallet.address);
    console.log(`💰 XRP 잔고: ${balance} XRP`);

    // IOU 잔고 조회
    const lines = await client.request({
        command: 'account_lines',
        account: wallet.address,
    });
    if (lines.result.lines && lines.result.lines.length > 0) {
        console.log('💳 IOU 잔고:');
        for (const line of lines.result.lines) {
            console.log(`- ${line.balance} ${line.currency}.${line.account}`);
        }
    } else {
        console.log('💳 IOU 잔고: 없음');
    }

    await client.disconnect();
}

if (require.main === module) {
    checkBalance();
} 