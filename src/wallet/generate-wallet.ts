import { Command } from 'commander';
import { addWalletOptions } from '../utils/cli-utils';
import { generateWallet } from '../utils/utils';
import { printInfo } from '../common';

/**
 * XRPL 지갑을 생성하는 스크립트입니다.
 * - ed25519/secp256k1 타입의 XRPL 지갑을 생성하여 주소와 시드를 출력합니다.
 *
 * [주요 옵션]
 *   없음 (실행 시 바로 지갑 생성)
 *
 * [실행 예시]
 *   npx ts-node src/wallet/generate-wallet.ts
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