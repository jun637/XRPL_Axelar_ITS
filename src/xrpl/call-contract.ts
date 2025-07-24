import { Command, Option } from 'commander';
import { mainProcessor, hex, parseTokenAmount } from './utils';
import { addBaseOptions, addSkipPromptOption } from './cli-utils';
import * as xrpl from 'xrpl';

/**
 * XRPL에서 GMP 호출을 시작하는 함수
 * @param _config - 설정 객체 (사용하지 않음)
 * @param wallet - XRPL 지갑 객체
 * @param client - XRPL 클라이언트
 * @param chain - 체인 정보 (contracts.AxelarGateway.address 포함)
 * @param options - 옵션 객체 (payload, gasFeeToken, gasFeeAmount, yes 포함)
 * @param args - 인수 배열 (destinationChain, destinationAddress 포함)
 */
async function callContract(_config: any, wallet: xrpl.Wallet, client: any, chain: any, options: { payload: string; gasFeeToken: string; gasFeeAmount: number; yes: boolean }, args: string[]): Promise<void> {
    await client.sendPayment(
        wallet,
        {
            destination: chain.contracts.AxelarGateway.address,
            amount: parseTokenAmount(options.gasFeeToken, options.gasFeeAmount), // token is either "XRP" or "<currency>.<issuer-address>"
            memos: [
                { memoType: hex('type'), memoData: hex('call_contract') },
                { memoType: hex('destination_address'), memoData: hex(args[1].replace('0x', '')) },
                { memoType: hex('destination_chain'), memoData: hex(args[0]) },
                { memoType: hex('payload'), memoData: options.payload },
            ],
        },
        options,
    );
}

if (require.main === module) {
    const program = new Command();

    program
        .name('call-contract')
        .description('Initiate a GMP call from XRPL.')
        .arguments('<destinationChain> <destinationAddress>')
        .addOption(new Option('--payload <payload>', 'payload to call contract at destination address with').makeOptionMandatory(true))
        .addOption(
            new Option('--gasFeeToken <gasFeeToken>', 'token to pay gas in ("XRP" or "<currency>.<issuer>")').makeOptionMandatory(true),
        )
        .addOption(
            new Option('--gasFeeAmount <gasFeeAmount>', 'amount of the deposited tokens that will be used to pay gas').makeOptionMandatory(
                true,
            ),
        )
        .action((destinationChain, destinationAddress, options) => {
            mainProcessor(callContract, options, [destinationChain, destinationAddress]);
        });

    addBaseOptions(program);
    addSkipPromptOption(program);

    program.parse();
}

export { callContract };