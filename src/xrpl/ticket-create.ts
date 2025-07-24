import { Command, Option } from 'commander';
import { mainProcessor } from './utils';
import { addBaseOptions, addSkipPromptOption } from './cli-utils';
import { printInfo } from '../common';
import * as xrpl from 'xrpl';

/**
 * XRPL 계정을 위한 티켓을 생성하는 함수
 * @param _config - 설정 객체 (사용하지 않음)
 * @param wallet - XRPL 지갑 객체
 * @param client - XRPL 클라이언트
 * @param _chain - 체인 정보 (사용하지 않음)
 * @param options - 옵션 객체 (account, ticketCount, yes 포함)
 */
async function ticketCreate(_config: any, wallet: xrpl.Wallet, client: any, _chain: any, options: { account?: string; ticketCount: string; yes: boolean }): Promise<void> {
    printInfo(`Creating ${options.ticketCount} tickets`);
    await client.sendTicketCreate(
        wallet,
        {
            account: options.account,
            ticketCount: Number(options.ticketCount),
        },
        options,
    );

    printInfo('Successfully created tickets');
}

if (require.main === module) {
    const program = new Command();

    program
        .name('ticket-create')
        .description('Create tickets for an XRPL account.')
        .addOption(new Option('-m, --multisign', 'active wallet is a signer of the target XRPL multisig account').default(false))
        .addOption(new Option('--account <account>', 'XRPL account to configure (default: active wallet)'))
        .addOption(new Option('--ticketCount <ticketCount>', 'number of tickets to create').makeOptionMandatory(true));

    addBaseOptions(program);
    addSkipPromptOption(program);

    program.action((options) => {
        mainProcessor(ticketCreate, options, []);
    });

    program.parse();
}

export { ticketCreate };