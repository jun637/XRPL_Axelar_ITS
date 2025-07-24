import { Command, Option } from 'commander';
import * as xrpl from 'xrpl';
import { mainProcessor, hex } from './utils';
import { addBaseOptions, addSkipPromptOption } from './cli-utils';

/**
 * XRPL 멀티시그 fee reserve를 충전하는 함수
 * @param _config - 환경 설정 객체
 * @param wallet - XRPL 지갑 객체
 * @param client - XRPL 클라이언트 객체
 * @param chain - 체인 정보 객체
 * @param options - 커맨드라인 옵션 객체
 * @param _args - 추가 인자(사용 안 함)
 */
async function addReserves(
  _config: any,
  wallet: xrpl.Wallet,
  client: any,
  chain: any,
  options: { amount: string },
  _args: any
): Promise<void> {
  await client.sendPayment(
    wallet,
    {
      destination: chain.contracts.AxelarGateway.address,
      amount: xrpl.xrpToDrops(options.amount),
      memos: [{ memoType: hex('type'), memoData: hex('add_reserves') }],
    },
    options,
  );
}

if (require.main === module) {
  const program = new Command();

  program
    .name('add-reserves')
    .description('XRPL 멀티시그 fee reserve를 XRP로 충전합니다.')
    .addOption(new Option('--amount <amount>', 'fee reserve로 예치할 XRP 수량').makeOptionMandatory(true))
    .action((options) => {
      mainProcessor(addReserves, options, []);
    });

  addBaseOptions(program);
  addSkipPromptOption(program);

  program.parse();
}

export { addReserves };