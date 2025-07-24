import "dotenv/config";
import { Command } from 'commander';
import { mainProcessor, printWalletInfo } from './utils';
import { addBaseOptions } from './cli-utils';
import * as xrpl from 'xrpl';

/**
 * 지갑의 잔액을 표시하는 함수
 * @param _config - 설정 객체 (사용하지 않음)
 * @param wallet - XRPL 지갑 객체
 * @param client - XRPL 클라이언트
 * @param chain - 체인 정보
 */
async function balances(_config: any, wallet: xrpl.Wallet, client: any, chain: any): Promise<void> {
    await printWalletInfo(client, wallet, chain);
}

if (require.main === module) {
    const program = new Command();

    program.name('balances').description('Display balances of the wallet on XRPL.');

    addBaseOptions(program);

    program.action((options) => {
        mainProcessor(balances, options, []);
    });

    program.parse();
}

export { balances };