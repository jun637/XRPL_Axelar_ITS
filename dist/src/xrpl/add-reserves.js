"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.addReserves = addReserves;
const commander_1 = require("commander");
const xrpl = __importStar(require("xrpl"));
const utils_1 = require("./utils");
const cli_utils_1 = require("./cli-utils");
/**
 * XRPL 멀티시그 fee reserve를 충전하는 함수
 * @param _config - 환경 설정 객체
 * @param wallet - XRPL 지갑 객체
 * @param client - XRPL 클라이언트 객체
 * @param chain - 체인 정보 객체
 * @param options - 커맨드라인 옵션 객체
 * @param _args - 추가 인자(사용 안 함)
 */
async function addReserves(_config, wallet, client, chain, options, _args) {
    await client.sendPayment(wallet, {
        destination: chain.contracts.AxelarGateway.address,
        amount: xrpl.xrpToDrops(options.amount),
        memos: [{ memoType: (0, utils_1.hex)('type'), memoData: (0, utils_1.hex)('add_reserves') }],
    }, options);
}
if (require.main === module) {
    const program = new commander_1.Command();
    program
        .name('add-reserves')
        .description('Top up the XRPL multisig fee reserve with XRP.')
        .addOption(new commander_1.Option('--amount <amount>', 'amount of XRP to deposit into the fee reserve').makeOptionMandatory(true))
        .action((options) => {
        (0, utils_1.mainProcessor)(addReserves, options, []);
    });
    (0, cli_utils_1.addBaseOptions)(program);
    (0, cli_utils_1.addSkipPromptOption)(program);
    program.parse();
}
//# sourceMappingURL=add-reserves.js.map