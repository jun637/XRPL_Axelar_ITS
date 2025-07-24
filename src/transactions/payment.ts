import { Command, Option } from 'commander';
import { mainProcessor, parseTokenAmount } from '../utils/utils';
import { addBaseOptions, addSkipPromptOption } from '../utils/cli-utils';
import { printInfo } from '../common';
import * as xrpl from 'xrpl';

/**
 * XRPL 내에서 단순 송금(Payment) 트랜잭션을 실행하는 스크립트입니다.
 * - 지정한 계정에서 다른 계정으로 XRP 또는 IOU를 전송합니다.
 *
 * [주요 옵션]
 *   --from <from>     : 송금할 계정(기본값: 활성 지갑)
 *   --to <to>         : 수신자 계정(필수)
 *   --token <token>   : 토큰 종류(XRP 또는 IOU)
 *   --amount <amount> : 송금할 수량(필수)
 *
 * [실행 예시]
 *   npx ts-node src/transactions/payment.ts --from r... --to r... --token XRP --amount 10
 */
async function payment(_config: any, wallet: xrpl.Wallet, client: any, _chain: any, options: { from?: string; to: string; token: string; amount: number; yes: boolean }): Promise<void> {
    printInfo('Transferring tokens');
    await client.sendPayment(
        wallet,
        {
            account: options.from,
            amount: parseTokenAmount(options.token, options.amount), // token is either "XRP" or "<currency>.<issuer-address>"
            destination: options.to,
        },
        options,
    );
}

if (require.main === module) {
    const program = new Command();

    program
        .name('payment')
        .description("Configure an XRPL account's properties")
        .addOption(new Option('-m, --multisign', 'active wallet is a signer of the sender XRPL multisig account').default(false))
        .addOption(new Option('--from <from>', 'account to send from (default: active wallet)'))
        .addOption(new Option('--to <to>', 'destination account').makeOptionMandatory(true))
        .addOption(new Option('--token <token>', 'token to send ("XRP" or "<currency>.<issuer>")').default('XRP'))
        .addOption(new Option('--amount <amount>', 'amount of tokens to send').makeOptionMandatory(true));

    addBaseOptions(program);
    addSkipPromptOption(program);

    program.action((options) => {
        mainProcessor(payment, options, []);
    });

    program.parse();
}

export { payment };