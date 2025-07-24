"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.broadcast = broadcast;
const commander_1 = require("commander");
const utils_1 = require("./utils");
const cli_utils_1 = require("./cli-utils");
const common_1 = require("../common");
/**
 * 인코딩된 서명된 트랜잭션을 XRPL에 브로드캐스트하는 함수
 * @param _config - 설정 객체 (사용하지 않음)
 * @param _wallet - 지갑 객체 (사용하지 않음)
 * @param client - XRPL 클라이언트
 * @param _chain - 체인 정보 (사용하지 않음)
 * @param options - 옵션 객체
 * @param args - 인수 객체 (txBlob 포함)
 */
async function broadcast(_config, _wallet, client, _chain, options, args) {
    const txBlob = args[0];
    const tx = (0, utils_1.decodeTxBlob)(txBlob);
    (0, common_1.printInfo)('Preparing to broadcast transaction', tx);
    if ((0, common_1.prompt)(`Submit ${tx.TransactionType} transaction?`, options.yes)) {
        process.exit(0);
    }
    await client.submitTx(txBlob);
}
if (require.main === module) {
    const program = new commander_1.Command();
    program
        .name('broadcast')
        .description('Broadcast encoded signed transaction to XRPL.')
        .argument('<txBlob>', 'signed transaction blob to broadcast')
        .action((txBlob, options) => {
        (0, utils_1.mainProcessor)(broadcast, options, [txBlob]);
    });
    (0, cli_utils_1.addBaseOptions)(program);
    (0, cli_utils_1.addSkipPromptOption)(program);
    program.parse();
}
//# sourceMappingURL=broadcast.js.map