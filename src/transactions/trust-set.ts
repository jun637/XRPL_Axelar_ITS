import { Command, Option } from 'commander';
import { mainProcessor } from '../utils/utils';
import { addBaseOptions, addSkipPromptOption } from '../utils/cli-utils';
import * as xrpl from 'xrpl';

/**
 * XRPL에서 Trust Line(신뢰선)을 생성하는 스크립트입니다.
 * - 특정 IOU(예: USD, USDT 등) 토큰을 받기 위해 issuer와의 trustline을 설정합니다.
 *
 * [주요 옵션]
 *   <tokenCurrency> : 토큰 심볼(예: USD)
 *   <tokenIssuer>   : issuer 주소
 *   --limit <amt>   : trustline 한도(기본값: 1000000000)
 *
 * [실행 예시]
 *   npx ts-node src/transactions/trust-set.ts USD r... --limit 1000
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