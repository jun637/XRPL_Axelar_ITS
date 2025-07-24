"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.balances = balances;
const commander_1 = require("commander");
const utils_1 = require("./utils");
const cli_utils_1 = require("./cli-utils");
/**
 * 지갑의 잔액을 표시하는 함수
 * @param _config - 설정 객체 (사용하지 않음)
 * @param wallet - XRPL 지갑 객체
 * @param client - XRPL 클라이언트
 * @param chain - 체인 정보
 */
async function balances(_config, wallet, client, chain) {
    await (0, utils_1.printWalletInfo)(client, wallet, chain);
}
if (require.main === module) {
    const program = new commander_1.Command();
    program.name('balances').description('Display balances of the wallet on XRPL.');
    (0, cli_utils_1.addBaseOptions)(program);
    program.action((options) => {
        (0, utils_1.mainProcessor)(balances, options, []);
    });
    program.parse();
}
//# sourceMappingURL=balances.js.map