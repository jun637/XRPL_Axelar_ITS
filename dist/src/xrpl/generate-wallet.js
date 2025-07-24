"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processCommand = processCommand;
const commander_1 = require("commander");
const cli_utils_1 = require("./cli-utils");
const utils_1 = require("./utils");
const common_1 = require("../common");
/**
 * 새로운 XRPL 지갑을 생성하는 함수
 * @param options - 지갑 생성 옵션 (walletKeyType 포함)
 */
function processCommand(options) {
    const wallet = (0, utils_1.generateWallet)(options);
    (0, common_1.printInfo)('Generated new XRPL wallet', wallet);
}
if (require.main === module) {
    const program = new commander_1.Command();
    program
        .name('generate-wallet')
        .description('Generate a new XRPL wallet.')
        .action((options) => {
        processCommand(options);
    });
    (0, cli_utils_1.addWalletOptions)(program);
    program.parse();
}
//# sourceMappingURL=generate-wallet.js.map