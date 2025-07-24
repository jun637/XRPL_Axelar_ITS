# XRPL-Axelar ITS 프로젝트

XRPL에서 Axelar Interchain Token Service (ITS)를 통해 다른 체인으로 토큰을 전송하는 TypeScript 프로젝트입니다.

## 🚀 빠른 시작

### 1. 설치 및 빌드
```bash
npm ci && npm run build
```

### 2. 지갑 생성
```bash
npm run generate-wallet
```

### 3. 환경 설정
`.env` 파일을 생성하고 다음 내용을 추가하세요:
```env
PRIVATE_KEY=<생성된_시드값>
ENV=testnet
CHAIN=xrpl
```

### 4. 테스트넷 자금 요청 (선택사항)
```bash
npm run faucet -- --minBalance 100 --amount 100
```

## 🎯 XRPL → 타 체인 토큰 전송 과정

### 1단계: XRPL 멀티시그 계정 배포
```bash
npm run deploy-multisig -- -e testnet -n xrpl --initialSigner <XRPL_주소>
```

### 2단계: 인터체인 토큰 전송
```bash
# XRP를 다른 체인으로 전송
npm run interchain-transfer -- -e testnet -n xrpl XRP 1 xrpl-evm-devnet 0x0A90c0Af1B07f6AC34f3520348Dbfae73BDa358E --gasFeeAmount 0

# IOU 토큰을 다른 체인으로 전송
npm run interchain-transfer -- -e testnet -n xrpl "ABC.r4DVHyEisbgQRAXCiMtP2xuz5h3dDkwqf1" 1 ethereum 0x1234567890123456789012345678901234567890 --gasFeeAmount 0
```

### 3단계: 가스 추가 (필요시)
```bash
npm run add-gas -- -e testnet -n xrpl --amount 0.1 --token XRP --msgId <메시지_ID>
```

## 📋 사용 가능한 스크립트

### 핵심 기능
- `generate-wallet` - XRPL 지갑 생성
- `faucet` - 테스트넷 자금 요청
- `deploy-multisig` - XRPL 멀티시그 계정 배포
- `interchain-transfer` - 인터체인 토큰 전송
- `add-gas` - 가스 추가
- `add-reserves` - 수수료 예치 추가

### 유틸리티
- `balances` - 잔액 조회
- `payment` - 일반 결제
- `call-contract` - 컨트랙트 호출 (GMP)
- `broadcast` - 원시 트랜잭션 브로드캐스트
- `decode-address` - XRPL 주소 디코딩
- `decode-tx-blob` - 트랜잭션 블롭 디코딩

### 계정 관리
- `trust-set` - 신뢰선 설정
- `ticket-create` - 티켓 생성
- `account-set` - 계정 속성 설정
- `rotate-signers` - 멀티시그 서명자 변경

## 🔧 설정 파일

`config/testnet.json` 파일에 네트워크 및 컨트랙트 설정이 포함되어 있습니다:

```json
{
  "chains": {
    "xrpl": {
      "wssRpc": "wss://s.altnet.rippletest.net:51233",
      "contracts": {
        "InterchainTokenService": {
          "address": "rNrjh1KGZk2jBR3wPfAQnoidtFFYQKbQn2"
        },
        "AxelarGateway": {
          "address": "rNrjh1KGZk2jBR3wPfAQnoidtFFYQKbQn2"
        }
      }
    }
  }
}
```

## 📝 예시

### XRP를 Ethereum으로 전송
```bash
npm run interchain-transfer -- -e testnet -n xrpl XRP 1 ethereum 0x1234567890123456789012345678901234567890 --gasFeeAmount 0
```

### IOU 토큰을 다른 체인으로 전송
```bash
npm run interchain-transfer -- -e testnet -n xrpl "ABC.r4DVHyEisbgQRAXCiMtP2xuz5h3dDkwqf1" 1 xrpl-evm-devnet 0x0A90c0Af1B07f6AC34f3520348Dbfae73BDa358E --gasFeeAmount 0
```

### GMP (General Message Passing) 호출
```bash
npm run call-contract -- -e testnet -n xrpl xrpl-evm-devnet 0x2F630a1CE68d76ff2113D2F3AE8FB64Abf7d3804 --gasFeeAmount 1 --gasFeeToken XRP --payload 0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000B48656C6C6F20576F726C64000000000000000000000000000000000000000000
```

## 🏗️ 프로젝트 구조

```
XRPL_Axelar_ITS/
├── config/
│   └── testnet.json          # 네트워크 및 컨트랙트 설정
├── src/
│   ├── common/               # 공통 유틸리티
│   │   ├── utils.ts          # 핵심 유틸리티 함수들
│   │   ├── cli-utils.ts      # CLI 옵션 관리
│   │   ├── index.ts          # 공통 모듈 내보내기
│   │   └── its.ts            # 인터체인 토큰 서비스 유틸리티
│   └── xrpl/                 # XRPL 전용 스크립트들
│       ├── utils.ts          # XRPL 클라이언트 및 유틸리티
│       ├── balances.ts       # 잔액 조회
│       ├── payment.ts        # 결제 전송
│       ├── interchain-transfer.ts # 인터체인 전송
│       ├── call-contract.ts  # 컨트랙트 호출
│       └── ... (기타 XRPL 스크립트들)
└── package.json
```

## ⚠️ 주의사항

1. **테스트넷 사용**: 현재 설정은 XRPL 테스트넷을 사용합니다.
2. **가스 수수료**: 인터체인 전송 시 가스 수수료가 필요할 수 있습니다.
3. **멀티시그 계정**: 인터체인 전송을 위해서는 먼저 멀티시그 계정을 배포해야 합니다.
4. **환경 변수**: `.env` 파일에 올바른 `PRIVATE_KEY`를 설정해야 합니다.

## 🔗 관련 링크

- [XRPL 공식 문서](https://xrpl.org/)
- [Axelar 공식 문서](https://docs.axelar.dev/)
- [Interchain Token Service](https://docs.axelar.dev/dev/interchain-token-service)
