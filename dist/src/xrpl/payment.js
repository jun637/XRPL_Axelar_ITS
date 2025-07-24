"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.payment = payment;
const commander_1 = require("commander");
const utils_1 = require("./utils");
const cli_utils_1 = require("./cli-utils");
const common_1 = require("../common");
/**
 * XRPL에서 토큰을 전송하는 함수
 * @param _config - 설정 객체 (사용하지 않음)
 * @param wallet - XRPL 지갑 객체
 * @param client - XRPL 클라이언트
 * @param _chain - 체인 정보 (사용하지 않음)
 * @param options - 옵션 객체 (from, to, token, amount, yes 포함)
 */
async function payment(_config, wallet, client, _chain, options) {
    (0, common_1.printInfo)('Transferring tokens');
    await client.sendPayment(wallet, {
        account: options.from,
        amount: (0, utils_1.parseTokenAmount)(options.token, options.amount), // token is either "XRP" or "<currency>.<issuer-address>"
        destination: options.to,
    }, options);
}
if (require.main === module) {
    const program = new commander_1.Command();
    program
        .name('payment')
        .description("Configure an XRPL account's properties")
        .addOption(new commander_1.Option('-m, --multisign', 'active wallet is a signer of the sender XRPL multisig account').default(false))
        .addOption(new commander_1.Option('--from <from>', 'account to send from (default: active wallet)'))
        .addOption(new commander_1.Option('--to <to>', 'destination account').makeOptionMandatory(true))
        .addOption(new commander_1.Option('--token <token>', 'token to send ("XRP" or "<currency>.<issuer>")').default('XRP'))
        .addOption(new commander_1.Option('--amount <amount>', 'amount of tokens to send').makeOptionMandatory(true));
    (0, cli_utils_1.addBaseOptions)(program);
    (0, cli_utils_1.addSkipPromptOption)(program);
    program.action((options) => {
        (0, utils_1.mainProcessor)(payment, options, []);
    });
    program.parse();
}
//# sourceMappingURL=payment.js.map