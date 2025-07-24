"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.accountSet = accountSet;
const commander_1 = require("commander");
const utils_1 = require("./utils");
const cli_utils_1 = require("./cli-utils");
const common_1 = require("../common");
/**
 * XRPL 계정 속성을 설정하는 함수
 * @param _config - 설정 객체 (사용하지 않음)
 * @param wallet - XRPL 지갑 객체
 * @param client - XRPL 클라이언트
 * @param _chain - 체인 정보 (사용하지 않음)
 * @param options - 옵션 객체 (account, transferRate, tickSize, domain, flag, yes 포함)
 */
async function accountSet(_config, wallet, client, _chain, options) {
    (0, common_1.printInfo)('Updating account properties');
    await client.sendAccountSet(wallet, {
        account: options.account,
        transferRate: options.transferRate ? Number(options.transferRate) : undefined,
        tickSize: options.tickSize ? Number(options.tickSize) : undefined,
        domain: options.domain ? (0, utils_1.hex)(options.domain) : undefined,
        flag: options.flag ? Number(options.flag) : undefined,
    }, options);
    (0, common_1.printInfo)('Successfully updated account properties');
}
if (require.main === module) {
    const program = new commander_1.Command();
    program
        .name('account-set')
        .description("Configure an XRPL account's properties")
        .addOption(new commander_1.Option('-m, --multisign', 'active wallet is a signer of the XRPL multisig account being configured').default(false))
        .addOption(new commander_1.Option('--account <account>', 'XRPL account to configure (default: active wallet)'))
        .addOption(new commander_1.Option('--transferRate <transferRate>', 'account transfer rate'))
        .addOption(new commander_1.Option('--tickSize <tickSize>', 'account tick size'))
        .addOption(new commander_1.Option('--domain <domain>', 'account domain'))
        .addOption(new commander_1.Option('--flag <flag>', 'account flag'));
    (0, cli_utils_1.addBaseOptions)(program);
    (0, cli_utils_1.addSkipPromptOption)(program);
    program.action((options) => {
        (0, utils_1.mainProcessor)(accountSet, options, []);
    });
    program.parse();
}
//# sourceMappingURL=account-set.js.map