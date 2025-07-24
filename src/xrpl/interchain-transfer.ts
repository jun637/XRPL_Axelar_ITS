import { Command, Option } from 'commander';
import { mainProcessor, hex, parseTokenAmount } from './utils';
import { addBaseOptions, addSkipPromptOption } from './cli-utils';
import * as xrpl from 'xrpl';

/**
 * XRPL에서 체인간 토큰 전송을 시작하는 함수
 * @param _config - 설정 객체 (사용하지 않음)
 * @param wallet - XRPL 지갑 객체
 * @param client - XRPL 클라이언트
 * @param chain - 체인 정보 (contracts.InterchainTokenService.address 포함)
 * @param options - 옵션 객체 (payload, gasFeeAmount, yes 포함)
 * @param args - 인수 배열 (token, amount, destinationChain, destinationAddress 포함)
 */
async function interchainTransfer(_config: any, wallet: xrpl.Wallet, client: any, chain: any, options: { payload?: string; gasFeeAmount: string; yes: boolean }, args: string[]): Promise<void> {
    await client.sendPayment(
        wallet,
        {
            destination: chain.contracts.InterchainTokenService.address,
            amount: parseTokenAmount(args[0], Number(args[1])), // token is either "XRP" or "<currency>.<issuer-address>"
            memos: [
                { memoType: hex('type'), memoData: hex('interchain_transfer') },
                { memoType: hex('destination_address'), memoData: hex(args[3].replace('0x', '')) },
                { memoType: hex('destination_chain'), memoData: hex(args[2]) },
                { memoType: hex('gas_fee_amount'), memoData: hex(options.gasFeeAmount) },
                

                ...(options.payload ? [{ memoType: hex('payload'), memoData: options.payload }] : []),
            ],
        },
        options,
    );
}

if (require.main === module) {
    const program = new Command();

    program
        .name('interchain-transfer')
        .description('Initiate an interchain token transfer from XRPL.')
        .arguments('<token> <amount> <destinationChain> <destinationAddress>')
        .addOption(new Option('--payload <payload>', 'payload to call contract at destination address with'))
        .addOption(new Option('--gasFeeAmount <gasFeeAmount>', 'gas fee amount').makeOptionMandatory(true))
        .action((token, amount, destinationChain, destinationAddress, options) => {
            mainProcessor(interchainTransfer, options, [token, amount, destinationChain, destinationAddress]);
        });

    addBaseOptions(program);
    addSkipPromptOption(program);

    program.parse();
}

export { interchainTransfer };