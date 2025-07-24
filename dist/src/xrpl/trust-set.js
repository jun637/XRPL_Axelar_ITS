"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.trustSet = trustSet;
const commander_1 = require("commander");
const utils_1 = require("./utils");
const cli_utils_1 = require("./cli-utils");
/**
 * 특정 토큰 발행자와의 신뢰선을 설정하는 함수
 * @param _config - 설정 객체 (사용하지 않음)
 * @param wallet - XRPL 지갑 객체
 * @param client - XRPL 클라이언트
 * @param _chain - 체인 정보 (사용하지 않음)
 * @param options - 옵션 객체 (account, limit, yes 포함)
 * @param args - 인수 배열 (currency, issuer 포함)
 */
async function trustSet(_config, wallet, client, _chain, options, args) {
    await client.sendTrustSet(wallet, {
        account: options.account,
        value: options.limit,
        currency: args[0],
        issuer: args[1],
    }, options);
}
if (require.main === module) {
    const program = new commander_1.Command();
    program
        .name('trust-set')
        .description('Establish a trust line with the issuer of a given token.')
        .arguments('<tokenCurrency> <tokenIssuer>')
        .addOption(new commander_1.Option('-m, --multisign', 'active wallet is a signer of the target XRPL multisig account').default(false))
        .addOption(new commander_1.Option('--account <account>', 'XRPL account from which to create a trust line (default: active wallet)'))
        .addOption(new commander_1.Option('--limit <limit>', 'trust line limit').default('1000000000'))
        .action((currency, issuer, options) => {
        (0, utils_1.mainProcessor)(trustSet, options, [currency, issuer]);
    });
    (0, cli_utils_1.addBaseOptions)(program);
    (0, cli_utils_1.addSkipPromptOption)(program);
    program.parse();
}
//# sourceMappingURL=trust-set.js.map