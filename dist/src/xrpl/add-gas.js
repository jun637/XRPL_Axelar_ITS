"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addGas = addGas;
const commander_1 = require("commander");
const utils_1 = require("./utils");
const cli_utils_1 = require("./cli-utils");
/**
 * XRPL 메시지에 가스를 추가하는 함수
 * @param _config - 설정 객체 (사용하지 않음)
 * @param wallet - XRPL 지갑 객체
 * @param client - XRPL 클라이언트
 * @param chain - 체인 정보 (contracts.AxelarGateway.address 포함)
 * @param options - 옵션 객체 (token, amount, msgId, yes 포함)
 * @param _args - 인수 배열 (사용하지 않음)
 */
async function addGas(_config, wallet, client, chain, options, _args) {
    await client.sendPayment(wallet, {
        destination: chain.contracts.AxelarGateway.address,
        amount: (0, utils_1.parseTokenAmount)(options.token, options.amount),
        memos: [
            { memoType: (0, utils_1.hex)('type'), memoData: (0, utils_1.hex)('add_gas') },
            { memoType: (0, utils_1.hex)('msg_id'), memoData: (0, utils_1.hex)(options.msgId.toLowerCase().replace('0x', '')) },
        ],
    }, options);
}
if (require.main === module) {
    const program = new commander_1.Command();
    program
        .name('add-gas')
        .description('Top up more gas to an XRPL message.')
        .addOption(new commander_1.Option('--token <token>', 'token to use').makeOptionMandatory(true))
        .addOption(new commander_1.Option('--amount <amount>', 'amount of gas to add').makeOptionMandatory(true))
        .addOption(new commander_1.Option('--msgId <msgId>', 'message ID whose gas to top up').makeOptionMandatory(true))
        .action((options) => {
        (0, utils_1.mainProcessor)(addGas, options, []);
    });
    (0, cli_utils_1.addBaseOptions)(program);
    (0, cli_utils_1.addSkipPromptOption)(program);
    program.parse();
}
//# sourceMappingURL=add-gas.js.map