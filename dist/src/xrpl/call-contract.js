"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.callContract = callContract;
const commander_1 = require("commander");
const utils_1 = require("./utils");
const cli_utils_1 = require("./cli-utils");
/**
 * XRPL에서 GMP 호출을 시작하는 함수
 * @param _config - 설정 객체 (사용하지 않음)
 * @param wallet - XRPL 지갑 객체
 * @param client - XRPL 클라이언트
 * @param chain - 체인 정보 (contracts.AxelarGateway.address 포함)
 * @param options - 옵션 객체 (payload, gasFeeToken, gasFeeAmount, yes 포함)
 * @param args - 인수 배열 (destinationChain, destinationAddress 포함)
 */
async function callContract(_config, wallet, client, chain, options, args) {
    await client.sendPayment(wallet, {
        destination: chain.contracts.AxelarGateway.address,
        amount: (0, utils_1.parseTokenAmount)(options.gasFeeToken, options.gasFeeAmount), // token is either "XRP" or "<currency>.<issuer-address>"
        memos: [
            { memoType: (0, utils_1.hex)('type'), memoData: (0, utils_1.hex)('call_contract') },
            { memoType: (0, utils_1.hex)('destination_address'), memoData: (0, utils_1.hex)(args[1].replace('0x', '')) },
            { memoType: (0, utils_1.hex)('destination_chain'), memoData: (0, utils_1.hex)(args[0]) },
            { memoType: (0, utils_1.hex)('payload'), memoData: options.payload },
        ],
    }, options);
}
if (require.main === module) {
    const program = new commander_1.Command();
    program
        .name('call-contract')
        .description('Initiate a GMP call from XRPL.')
        .arguments('<destinationChain> <destinationAddress>')
        .addOption(new commander_1.Option('--payload <payload>', 'payload to call contract at destination address with').makeOptionMandatory(true))
        .addOption(new commander_1.Option('--gasFeeToken <gasFeeToken>', 'token to pay gas in ("XRP" or "<currency>.<issuer>")').makeOptionMandatory(true))
        .addOption(new commander_1.Option('--gasFeeAmount <gasFeeAmount>', 'amount of the deposited tokens that will be used to pay gas').makeOptionMandatory(true))
        .action((destinationChain, destinationAddress, options) => {
        (0, utils_1.mainProcessor)(callContract, options, [destinationChain, destinationAddress]);
    });
    (0, cli_utils_1.addBaseOptions)(program);
    (0, cli_utils_1.addSkipPromptOption)(program);
    program.parse();
}
//# sourceMappingURL=call-contract.js.map