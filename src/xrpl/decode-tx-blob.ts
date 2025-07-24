import { Command } from 'commander';
import { decodeTxBlob } from './utils';
import { printInfo, printError } from '../common';

/**
 * XRPL 트랜잭션 blob을 디코딩하여 트랜잭션 객체로 변환하는 함수
 * @param txBlob - 디코딩할 XRPL 직렬화된 트랜잭션 blob
 */
function processCommand(txBlob: string): void {
    try {
        const tx = decodeTxBlob(txBlob);
        printInfo('Decoded transaction', tx);
    } catch (error) {
        printError('Failed to decode transaction blob', (error as Error).message);
        process.exit(1);
    }
}

if (require.main === module) {
    const program = new Command();

    program
        .name('decode-tx-blob')
        .description('Decode XRPL serialized transaction blob into transaction object.')
        .argument('<tx-blob>', 'XRPL serialized transaction blob to decode');

    program.action((txBlob) => {
        processCommand(txBlob);
    });

    program.parse();
}

export { processCommand };