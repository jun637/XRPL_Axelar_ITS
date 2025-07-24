import { Command, Option } from 'commander';
import { mainProcessor, hex, parseTokenAmount } from './utils';
import { addBaseOptions, addSkipPromptOption } from './cli-utils';
import * as xrpl from 'xrpl';

/**
 * XRPL 메시지에 가스를 추가하는 함수
 * @param _config - 설정 객체 (사용하지 않음)
 * @param wallet - XRPL 지갑 객체
 * @param client - XRPL 클라이언트
 * @param chain - 체인 정보 (contracts.AxelarGateway.address 포함)
 * @param options - 옵션 객체 (token, amount, msgId, yes 포함)
 * @param _args - 인수 배열 (사용하지 않음)
 */
async function addGas(_config: any, wallet: xrpl.Wallet, client: any, chain: any, options: { token: string; amount: number; msgId: string; yes: boolean }, _args: string[]): Promise<void> {
    await client.sendPayment(
        wallet,
        {
            destination: chain.contracts.AxelarGateway.address,
            amount: parseTokenAmount(options.token, options.amount),
            memos: [
                { memoType: hex('type'), memoData: hex('add_gas') },
                { memoType: hex('msg_id'), memoData: hex(options.msgId.toLowerCase().replace('0x', '')) },
            ],
        },
        options,
    );
}

if (require.main === module) {
    const program = new Command();

    program
        .name('add-gas')
        .description('Top up more gas to an XRPL message.')
        .addOption(new Option('--token <token>', 'token to use').makeOptionMandatory(true))
        .addOption(new Option('--amount <amount>', 'amount of gas to add').makeOptionMandatory(true))
        .addOption(new Option('--msgId <msgId>', 'message ID whose gas to top up').makeOptionMandatory(true))
        .action((options) => {
            mainProcessor(addGas, options, []);
        });

    addBaseOptions(program);
    addSkipPromptOption(program);

    program.parse();
}

export { addGas };