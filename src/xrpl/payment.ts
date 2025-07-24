import { Command, Option } from 'commander';
import { mainProcessor, parseTokenAmount } from './utils';
import { addBaseOptions, addSkipPromptOption } from './cli-utils';
import { printInfo } from '../common';
import * as xrpl from 'xrpl';

/**
 * XRPL에서 토큰을 전송하는 함수
 * @param _config - 설정 객체 (사용하지 않음)
 * @param wallet - XRPL 지갑 객체
 * @param client - XRPL 클라이언트
 * @param _chain - 체인 정보 (사용하지 않음)
 * @param options - 옵션 객체 (from, to, token, amount, yes 포함)
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