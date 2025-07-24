import { Command, Option } from 'commander';
import { mainProcessor } from './utils';
import { addBaseOptions, addSkipPromptOption } from './cli-utils';
import * as xrpl from 'xrpl';

/**
 * 특정 토큰 발행자와의 신뢰선을 설정하는 함수
 * @param _config - 설정 객체 (사용하지 않음)
 * @param wallet - XRPL 지갑 객체
 * @param client - XRPL 클라이언트
 * @param _chain - 체인 정보 (사용하지 않음)
 * @param options - 옵션 객체 (account, limit, yes 포함)
 * @param args - 인수 배열 (currency, issuer 포함)
 */
async function trustSet(_config: any, wallet: xrpl.Wallet, client: any, _chain: any, options: { account?: string; limit: string; yes: boolean }, args: string[]): Promise<void> {
    await client.sendTrustSet(
        wallet,
        {
            account: options.account,
            value: options.limit,
            currency: args[0],
            issuer: args[1],
        },
        options,
    );
}

if (require.main === module) {
    const program = new Command();

    program
        .name('trust-set')
        .description('Establish a trust line with the issuer of a given token.')
        .arguments('<tokenCurrency> <tokenIssuer>')
        .addOption(new Option('-m, --multisign', 'active wallet is a signer of the target XRPL multisig account').default(false))
        .addOption(new Option('--account <account>', 'XRPL account from which to create a trust line (default: active wallet)'))
        .addOption(new Option('--limit <limit>', 'trust line limit').default('1000000000'))
        .action((currency, issuer, options) => {
            mainProcessor(trustSet, options, [currency, issuer]);
        });

    addBaseOptions(program);
    addSkipPromptOption(program);

    program.parse();
}

export { trustSet };