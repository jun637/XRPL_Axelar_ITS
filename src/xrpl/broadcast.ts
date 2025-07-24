import { Command } from 'commander';
import { mainProcessor, decodeTxBlob } from './utils';
import { addBaseOptions, addSkipPromptOption } from './cli-utils';
import { printInfo, prompt } from '../common';
import * as xrpl from 'xrpl';

/**
 * 인코딩된 서명된 트랜잭션을 XRPL에 브로드캐스트하는 함수
 * @param _config - 설정 객체 (사용하지 않음)
 * @param _wallet - 지갑 객체 (사용하지 않음)
 * @param client - XRPL 클라이언트
 * @param _chain - 체인 정보 (사용하지 않음)
 * @param options - 옵션 객체
 * @param args - 인수 객체 (txBlob 포함)
 */
async function broadcast(_config: any, _wallet: xrpl.Wallet, client: any, _chain: any, options: { yes: boolean }, args: string[]): Promise<void> {
    const txBlob = args[0];
    const tx = decodeTxBlob(txBlob);
    printInfo('Preparing to broadcast transaction', tx);

    if (prompt(`Submit ${tx.TransactionType} transaction?`, options.yes)) {
        process.exit(0);
    }

    await client.submitTx(txBlob);
}

if (require.main === module) {
    const program = new Command();

    program
        .name('broadcast')
        .description('Broadcast encoded signed transaction to XRPL.')
        .argument('<txBlob>', 'signed transaction blob to broadcast')
        .action((txBlob, options) => {
            mainProcessor(broadcast, options, [txBlob]);
        });

    addBaseOptions(program);
    addSkipPromptOption(program);

    program.parse();
}

export { broadcast };