import "dotenv/config";
import { Wallet } from "xrpl"
let adminWallet!: Wallet
async function loadWallets(): Promise<void> {
    
  //const seed = "sEdThoRiyqRs7jZaBvYoL2ePXfQc5A6"; // 테스트할 시드
  //const walletEd = Wallet.fromSeed(seed, { algorithm: "ed25519" as any });
  //const walletSecp = Wallet.fromSeed(seed, { algorithm: "secp256k1" as any });
  //console.log("ed25519:", walletEd.address);
  //console.log("secp256k1:", walletSecp.address);
    try {
       //1. 환경변수에서 current Seed 로드
      const currentSeed = process.env.PRIVATE_KEY

       //2. 현재 연결된 지갑 복원
      const currentWallet = Wallet.fromSeed(currentSeed!.trim())
      
      console.log(`✅ 현재 연결된 지갑: ${currentWallet.address}`)
      console.log(`✅ 현재 연결된 지갑 Seed: ${currentWallet.seed}`)
      
    } catch (error) {
      console.error('❌ 지갑 로드 실패:', error)
      throw new Error(`지갑 로드 실패: ${error}`)
    }
  }
  loadWallets();