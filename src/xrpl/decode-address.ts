import { Command } from 'commander';
import { decodeAccountIDToHex } from './utils';
import { printInfo, printError } from '../common';

/**
 * XRPL 주소를 디코딩하여 raw bytes로 변환하는 함수
 * @param address - 디코딩할 XRPL 계정 주소
 */
function processCommand(address: string): void {
    try {
        const decodedAddressHex = decodeAccountIDToHex(address);
        printInfo('Account ID raw bytes', `0x${decodedAddressHex}`);
    } catch (error) {
        printError('Failed to decode account ID', (error as Error).message);
        process.exit(1);
    }
}

if (require.main === module) {
    const program = new Command();

    program.name('decode-address').description('Decode XRPL account ID to raw bytes.').argument('<address>', 'XRPL account ID to decode');

    program.action((address) => {
        processCommand(address);
    });

    program.parse();
}

export { processCommand };