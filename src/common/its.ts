import { Command } from 'commander';
import { addBaseOptions, addOptionsToCommands, encodeITSDestination, loadConfig, printInfo } from '../common';

/**
 * 주어진 구성(config)과 명령어 인자(args)를 사용하여 ITS 수신자 주소를 인코딩합니다.
 * @param config - 애플리케이션 구성 객체.
 * @param args - 명령어 인자 배열. 예: ['destination-chain', 'destination-address'].
 * @param _options - 명령어 옵션 객체.
 */
async function encodeRecipient(config: any, args: string[], _options: any): Promise<void> {
    const [destinationChain, destinationAddress] = args;
    const itsDestinationAddress = encodeITSDestination(config, destinationChain, destinationAddress);
    printInfo('Human-readable destination address', destinationAddress);
    printInfo('Encoded ITS destination address', itsDestinationAddress);
}

/**
 * 주어진 프로세서(processor)를 사용하여 명령어 인자(args)와 옵션(options)을 처리합니다.
 * @param processor - 실행할 프로세서 함수. 예: encodeRecipient.
 * @param args - 명령어 인자 배열.
 * @param options - 명령어 옵션 객체.
 */
async function mainProcessor(processor: (config: any, args: string[], options: any) => Promise<void>, args: string[], options: any): Promise<void> {
    const config = loadConfig();
    await processor(config, args, options);
}

if (require.main === module) {
    const program = new Command();
    program.name('its').description('Interchain Token Service common operations.');
    program
        .command('encode-recipient <destination-chain> <destination-address>')
        .description('Encode ITS recipient based on destination chain in config')
        .action((destinationChain: string, destinationAddress: string, options: any) => {
            mainProcessor(encodeRecipient, [destinationChain, destinationAddress], options);
        });
    addOptionsToCommands(program, addBaseOptions, { ignoreChainNames: true });
    program.parse();
}

export { encodeRecipient, mainProcessor };