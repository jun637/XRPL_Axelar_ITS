import { Command, Option } from 'commander';
import { mainProcessor, hex, parseTokenAmount } from '../utils/utils';
import { addBaseOptions, addSkipPromptOption } from '../utils/cli-utils';
import * as xrpl from 'xrpl';

/**
 * XRPL → XRPL EVM 사이드체인으로 토큰(XRP 또는 IOU)을 전송하는 스크립트입니다.
 * - interchain-transfer 명령어로 크로스체인 전송을 수행합니다.
 *
 * [주요 옵션]
 *   --gasFeeAmount <amount> : 크로스체인 전송 시 사용할 가스 수량
 *
 * [실행 예시]
 *   npx ts-node src/transactions/interchain-transfer.ts --env xrpl --chainName xrpl XRP 10 xrpl-evm 0xabc... --gasFeeAmount 2
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