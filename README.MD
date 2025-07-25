# XRPL-Axelar ITS 실험 프로젝트

**XRPL에서 발행한 토큰 또는 XRP를 XRPL EVM Sidechain으로 전송하기 위한 실험 TypeScript 프로젝트입니다.**

---

## 🚀 빠른 시작

### 1. 의존성 설치 및 빌드
```bash
npm ci && npm run build
```

### 2. XRPL 지갑 생성
```bash
npm run generate-wallet
```
- 실행 후 출력되는 시드(`PRIVATE_KEY`)를 복사해둡니다.

### 3. 환경 변수 설정
`.env` 파일을 생성하고 아래와 같이 입력하세요:
```env
PRIVATE_KEY=<위에서_복사한_시드>
ENV=xrpl
CHAIN=xrpl
```

### 4. 테스트넷 자금 충전(선택)
```bash
npm run faucet -- --minBalance 100 --amount 100
```
- 잔고가 부족할 때만 사용하세요.

---


## 📂 디렉토리 구조

```
XRPL_Axelar_ITS/
├── config/
│   └── testnet.json
├── src/
│   ├── common/
│   │   ├── cli-utils.ts
│   │   ├── index.ts
│   │   ├── its.ts
│   │   └── utils.ts
│   ├── transactions/
│   │   ├── add-gas.ts
│   │   ├── account-set.ts
│   │   ├── interchain-transfer.ts
│   │   ├── payment.ts
│   │   └── trust-set.ts
│   ├── utils/
│   │   ├── cli-utils.ts
│   │   └── utils.ts
│   └── wallet/
│       ├── check-balance.ts
│       ├── faucet.ts
│       └── generate-wallet.ts
└── package.json
```

---

## 📋 명령어별 설명 및 예시

### 1. XRPL 지갑 생성
- **명령어:**
  ```bash
  npx ts-node src/wallet/generate-wallet.ts
  ```
- **설명:**
  새로운 XRPL 지갑(주소, 시드, 공개키)을 생성합니다. 출력된 시드를 `.env`에 저장하세요.

### 2. 테스트넷 자금 요청
- **명령어:**
  ```bash
  npx ts-node src/wallet/faucet.ts -- --minBalance 100 --amount 100
  ```
- **설명:**
  XRPL 테스트넷에서 지정한 주소로 XRP를 충전합니다. 이미 충분한 잔고가 있으면 무시됩니다.

### 3. 잔액 및 IOU 조회
- **명령어:**
  ```bash
  npx ts-node src/wallet/check-balance.ts
  ```
- **설명:**
  현재 환경변수에 등록된 XRPL 지갑의 XRP 및 IOU(발행형 토큰) 잔액을 조회합니다. 잔고가 부족하면 자동으로 10 XRP를 충전합니다.

### 5. 트러스트라인 설정
- **명령어:**
  ```bash
  npx ts-node src/transactions/trust-set.ts USD <발행자주소>
  ```
- **설명:**
  IOU(발행형 토큰) 전송을 위해 수신자가 해당 토큰에 대한 신뢰선을 설정합니다.

### 6. 인터체인 전송 (XRP/IOU)
- **명령어:**
  ```bash
  # XRP 전송
  npx ts-node src/transactions/interchain-transfer.ts -- XRP 1 xrpl-evm-devnet <EVM_주소> --gasFeeAmount 0
  # IOU 전송
  npx ts-node src/transactions/interchain-transfer.ts -- "USD.rXXXX..." 1 xrpl-evm-devnet <EVM_주소> --gasFeeAmount 0
  ```
- **설명:**
  XRPL의 XRP 또는 IOU 토큰을 EVM 사이드체인 주소로 전송합니다.

### 7. 가스 추가
- **명령어:**
  ```bash
  npx ts-node src/transactions/add-gas.ts -- --amount 0.1 --token XRP --msgId <메시지_ID>
  ```
- **설명:**
  인터체인 메시지에 추가 가스(XRP)를 보냅니다. 메시지 ID는 AxelarScan 등에서 확인 가능합니다.

### 8. 일반 결제 (XRPL 내 송금)
- **명령어:**
  ```bash
  npx ts-node src/transactions/payment.ts -- --to <수신자주소> --amount <수량> --token <XRP|IOU>
  ```
- **설명:**
  XRPL 내에서 XRP 또는 IOU를 다른 XRPL 주소로 송금합니다.

### 9. 계정 속성 변경
- **명령어:**
  ```bash
  npx ts-node src/transactions/account-set.ts -- --setFlag <플래그번호>
  ```
- **설명:**
  XRPL 계정의 속성(예: DefaultRipple, DisableMaster 등)을 변경합니다.

---

## ⚠️ 주의사항

- **테스트넷 전용**: 실제 자산이 아닌 테스트 환경입니다.
- **PRIVATE_KEY 노출 주의**: 시드는 절대 외부에 공개하지 마세요.
- **트러스트라인**: IOU 전송 시 수신자도 해당 토큰에 대한 트러스트라인이 있어야 함.
- **명령어 옵션**: 각 명령어의 옵션은 `--help`로 확인 가능합니다.

---

## 🔗 참고 자료

- [XRPL 공식 문서](https://xrpl.org/)
- [Axelar 공식 문서](https://docs.axelar.dev/)
- [Interchain Token Service](https://docs.axelar.dev/dev/interchain-token-service)

---

**실행 중 오류가 발생하면 에러 메시지와 함께 질문해 주세요. 최신 코드/구조에 맞춰 README를 계속 보완해드릴 수 있습니다!**
