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
        console.error('❌ PRIVATE_KEY environment variable is not set.');
        process.exit(1);
    }
    const wallet = xrpl.Wallet.fromSeed(seed.trim());
    console.log('==============================================');
    console.log('              XRPL Wallet Info');
    console.log('==============================================');
    console.log(`Address   : ${wallet.address}`);
    console.log(`Seed      : ${wallet.seed}`);
    console.log(`PublicKey : ${wallet.publicKey}`);
    console.log('----------------------------------------------');

    const client = new xrpl.Client('wss://s.altnet.rippletest.net:51233');
    await client.connect();

    // 10 XRP 자동 충전 기능, 일단 주석 처리함
    //try {
    //    console.log('Auto-funding 10 XRP...');
    //    await client.fundWallet(wallet, { amount: '10' });
    //    console.log('10 XRP funded successfully!');
    //} catch (e) {
    //    console.warn('fundWallet failed (maybe already funded):', e?.message || e);
    // }
    console.log('----------------------------------------------');
    // XRP balance
    const  balance  = await client.getXrpBalance(wallet.address);
    console.log(`XRP Balance   : ${balance} XRP`);
    // IOU balances
    const lines = await client.request({
        command: 'account_lines',
        account: wallet.address,
    });
    if (lines.result.lines && lines.result.lines.length > 0) {
        console.log('IOU Balances  :');
        for (const line of lines.result.lines) {
            console.log(`   - ${line.balance} ${line.currency}.${line.account}`);
        }
    } else {
        console.log('IOU Balances  : None');
    }
    console.log('----------------------------------------------');

    await client.disconnect();
}

if (require.main === module) {
    checkBalance();
} 