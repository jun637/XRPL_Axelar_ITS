/**
 * [STEP 1] XRPL 지갑 생성
 *
 * XRPL 네트워크에서 사용할 새 지갑(주소 + 시드)을 생성합니다.
 * 생성된 Seed를 2번(faucet), 3번(interchain-transfer) 스크립트에 붙여넣어 사용합니다.
 *
 * 실행: npx ts-node 0406_demo/1_generate-wallet.ts
 */

// xrpl: XRPL 네트워크와 상호작용하기 위한 공식 JavaScript/TypeScript 라이브러리
import { Wallet } from 'xrpl';

// ============ 지갑 생성 ============
// Wallet.generate(): 새로운 XRPL 키페어(주소, 시드, 공개키)를 랜덤 생성
const wallet = Wallet.generate();
// ==================================

// 생성 결과 출력 — Address는 계정 식별자, Seed는 트랜잭션 서명에 필요한 비밀키
console.log('=== 새 XRPL 지갑 생성 완료 ===');
console.log(`Address : ${wallet.address}`);   // XRPL 계정 주소 (r로 시작)
console.log(`Seed    : ${wallet.seed}`);      // 비밀키 시드 (sEd로 시작) — 2, 3번 스크립트에 복사
console.log(`PubKey  : ${wallet.publicKey}`); // 공개키
