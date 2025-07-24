import { Command } from 'commander';
import { addWalletOptions } from './cli-utils';
import { generateWallet } from './utils';
import { printInfo } from '../common';

/**
 * 새로운 XRPL 지갑을 생성하는 함수
 * @param options - 지갑 생성 옵션 (walletKeyType 포함)
 */
function processCommand(options: { walletKeyType: string }): void {
    const wallet = generateWallet();
    printInfo('Generated new XRPL wallet', wallet);
}

if (require.main === module) {
    const program = new Command();

    program
        .name('generate-wallet')
        .description('Generate a new XRPL wallet.')
        .action((options) => {
            processCommand(options);
        });

    addWalletOptions(program);

    program.parse();
}

export { processCommand };