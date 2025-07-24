import { Command, Option } from 'commander';
import { mainProcessor, hex } from './utils';
import { addBaseOptions, addSkipPromptOption } from './cli-utils';
import { printInfo } from '../common';
import * as xrpl from 'xrpl';

/**
 * XRPL 계정 속성을 설정하는 함수
 * @param _config - 설정 객체 (사용하지 않음)
 * @param wallet - XRPL 지갑 객체
 * @param client - XRPL 클라이언트
 * @param _chain - 체인 정보 (사용하지 않음)
 * @param options - 옵션 객체 (account, transferRate, tickSize, domain, flag, yes 포함)
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