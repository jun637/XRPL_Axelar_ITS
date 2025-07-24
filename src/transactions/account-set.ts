import { Command, Option } from 'commander';
import { mainProcessor } from '../utils/utils';
import { addBaseOptions, addSkipPromptOption } from '../utils/cli-utils';
import { printInfo } from '../common';
import * as xrpl from 'xrpl';
import { hex } from '../utils/utils';

/**
 * XRPL 계정의 속성(Flag 등)을 설정하는 스크립트입니다.
 * - 계정의 다양한 속성(예: DefaultRipple, NoFreeze 등)을 변경할 수 있습니다.
 *
 * [주요 옵션]
 *   --flag <flag> : 설정할 XRPL AccountSet 플래그
 *
 * [실행 예시]
 *   npx ts-node src/transactions/account-set.ts --flag DefaultRipple
 */
async function accountSet(_config: any, wallet: xrpl.Wallet, client: any, _chain: any, options: { account?: string; transferRate?: string; tickSize?: string; domain?: string; flag?: string; yes: boolean }): Promise<void> {
    printInfo('Updating account properties');
    await client.sendAccountSet(
        wallet,
        {
            account: options.account,
            transferRate: options.transferRate ? Number(options.transferRate) : undefined,
            tickSize: options.tickSize ? Number(options.tickSize) : undefined,
            domain: options.domain ? hex(options.domain) : undefined,
            flag: options.flag ? Number(options.flag) : undefined,
        },
        options,
    );

    printInfo('Successfully updated account properties');
}

if (require.main === module) {
    const program = new Command();

    program
        .name('account-set')
        .description("Configure an XRPL account's properties")
        .addOption(new Option('-m, --multisign', 'active wallet is a signer of the XRPL multisig account being configured').default(false))
        .addOption(new Option('--account <account>', 'XRPL account to configure (default: active wallet)'))
        .addOption(new Option('--transferRate <transferRate>', 'account transfer rate'))
        .addOption(new Option('--tickSize <tickSize>', 'account tick size'))
        .addOption(new Option('--domain <domain>', 'account domain'))
        .addOption(new Option('--flag <flag>', 'account flag'));

    addBaseOptions(program);
    addSkipPromptOption(program);

    program.action((options) => {
        mainProcessor(accountSet, options, []);
    });

    program.parse();
}

export { accountSet };