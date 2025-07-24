"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ticketCreate = ticketCreate;
const commander_1 = require("commander");
const utils_1 = require("./utils");
const cli_utils_1 = require("./cli-utils");
const common_1 = require("../common");
/**
 * XRPL 계정을 위한 티켓을 생성하는 함수
 * @param _config - 설정 객체 (사용하지 않음)
 * @param wallet - XRPL 지갑 객체
 * @param client - XRPL 클라이언트
 * @param _chain - 체인 정보 (사용하지 않음)
 * @param options - 옵션 객체 (account, ticketCount, yes 포함)
 */
async function ticketCreate(_config, wallet, client, _chain, options) {
    (0, common_1.printInfo)(`Creating ${options.ticketCount} tickets`);
    await client.sendTicketCreate(wallet, {
        account: options.account,
        ticketCount: Number(options.ticketCount),
    }, options);
    (0, common_1.printInfo)('Successfully created tickets');
}
if (require.main === module) {
    const program = new commander_1.Command();
    program
        .name('ticket-create')
        .description('Create tickets for an XRPL account.')
        .addOption(new commander_1.Option('-m, --multisign', 'active wallet is a signer of the target XRPL multisig account').default(false))
        .addOption(new commander_1.Option('--account <account>', 'XRPL account to configure (default: active wallet)'))
        .addOption(new commander_1.Option('--ticketCount <ticketCount>', 'number of tickets to create').makeOptionMandatory(true));
    (0, cli_utils_1.addBaseOptions)(program);
    (0, cli_utils_1.addSkipPromptOption)(program);
    program.action((options) => {
        (0, utils_1.mainProcessor)(ticketCreate, options, []);
    });
    program.parse();
}
//# sourceMappingURL=ticket-create.js.map