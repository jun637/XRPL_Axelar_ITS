"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.interchainTransfer = interchainTransfer;
const commander_1 = require("commander");
const utils_1 = require("./utils");
const cli_utils_1 = require("./cli-utils");
/**
 * XRPL에서 체인간 토큰 전송을 시작하는 함수
 * @param _config - 설정 객체 (사용하지 않음)
 * @param wallet - XRPL 지갑 객체
 * @param client - XRPL 클라이언트
 * @param chain - 체인 정보 (contracts.InterchainTokenService.address 포함)
 * @param options - 옵션 객체 (payload, gasFeeAmount, yes 포함)
 * @param args - 인수 배열 (token, amount, destinationChain, destinationAddress 포함)
 */
async function interchainTransfer(_config, wallet, client, chain, options, args) {
    await client.sendPayment(wallet, {
        destination: chain.contracts.InterchainTokenService.address,
        amount: (0, utils_1.parseTokenAmount)(args[0], Number(args[1])), // token is either "XRP" or "<currency>.<issuer-address>"
        memos: [
            { memoType: (0, utils_1.hex)('type'), memoData: (0, utils_1.hex)('interchain_transfer') },
            { memoType: (0, utils_1.hex)('destination_address'), memoData: (0, utils_1.hex)(args[3].replace('0x', '')) },
            { memoType: (0, utils_1.hex)('destination_chain'), memoData: (0, utils_1.hex)(args[2]) },
            { memoType: (0, utils_1.hex)('gas_fee_amount'), memoData: (0, utils_1.hex)(options.gasFeeAmount) },
            ...(options.payload ? [{ memoType: (0, utils_1.hex)('payload'), memoData: options.payload }] : []),
        ],
    }, options);
}
if (require.main === module) {
    const program = new commander_1.Command();
    program
        .name('interchain-transfer')
        .description('Initiate an interchain token transfer from XRPL.')
        .arguments('<token> <amount> <destinationChain> <destinationAddress>')
        .addOption(new commander_1.Option('--payload <payload>', 'payload to call contract at destination address with'))
        .addOption(new commander_1.Option('--gasFeeAmount <gasFeeAmount>', 'gas fee amount').makeOptionMandatory(true))
        .action((token, amount, destinationChain, destinationAddress, options) => {
        (0, utils_1.mainProcessor)(interchainTransfer, options, [token, amount, destinationChain, destinationAddress]);
    });
    (0, cli_utils_1.addBaseOptions)(program);
    (0, cli_utils_1.addSkipPromptOption)(program);
    program.parse();
}
//# sourceMappingURL=interchain-transfer.js.map