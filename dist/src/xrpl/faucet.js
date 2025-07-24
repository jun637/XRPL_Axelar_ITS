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
exports.faucet = faucet;
const xrpl = __importStar(require("xrpl"));
const commander_1 = require("commander");
const utils_1 = require("./utils");
const cli_utils_1 = require("./cli-utils");
const common_1 = require("../common");
const MAX_CLAIMABLE_DROPS = 1000000000;
/**
 * XRPL faucet에서 자금을 요청하는 함수
 * @param _config - 설정 객체 (사용하지 않음)
 * @param wallet - XRPL 지갑 객체
 * @param client - XRPL 클라이언트
 * @param _chain - 체인 정보 (사용하지 않음)
 * @param options - 옵션 객체 (recipient, amount, minBalance, yes 포함)
 */
async function faucet(_config, wallet, client, _chain, options) {
    const recipient = options.recipient || wallet.address;
    const { balance: recipientBalance } = await client.accountInfo(recipient);
    const amountInDrops = xrpl.xrpToDrops(options.amount);
    const recipientBalanceInXrp = xrpl.dropsToXrp(recipientBalance);
    const isDifferentRecipient = wallet.address.toLowerCase() !== recipient.toLowerCase();
    let fee = '0';
    if (isDifferentRecipient) {
        (0, common_1.printInfo)(`Requesting funds for`, recipient);
        fee = await client.fee();
    }
    if (Number(recipientBalanceInXrp) >= Number(options.minBalance)) {
        (0, common_1.printWarn)(`Recipient balance (${recipientBalanceInXrp} XRP) above minimum, skipping faucet request`);
        process.exit(0);
    }
    const amountToClaim = (0, utils_1.roundUpToNearestXRP)(Number(amountInDrops) + Number(fee));
    if (amountToClaim > MAX_CLAIMABLE_DROPS) {
        (0, common_1.printWarn)(`Amount too high, maximum is ${(MAX_CLAIMABLE_DROPS - Number(fee)) / 1e6} XRP`);
        process.exit(0);
    }
    (0, common_1.printInfo)(`Funding active wallet ${wallet.address} with`, `${amountToClaim / 1e6} XRP`);
    await client.fundWallet(wallet, String(amountToClaim / 1e6));
    if (isDifferentRecipient) {
        (0, common_1.printInfo)(`Transferring ${options.amount} XRP from active wallet to recipient`, recipient);
        await client.sendPayment(wallet, {
            destination: recipient,
            amount: amountInDrops,
            fee,
        }, options);
    }
    (0, common_1.printInfo)('Funds sent', recipient);
}
if (require.main === module) {
    const program = new commander_1.Command();
    program
        .name('faucet')
        .addOption(new commander_1.Option('--recipient <recipient>', 'recipient to request funds for (default: wallet address)'))
        .addOption(new commander_1.Option('--amount <amount>', 'amount of XRP tokens to request from the faucet').default('100'))
        .addOption(new commander_1.Option('--minBalance <amount>', 'tokens will only be requested from the faucet if recipient XRP balance is below the amount provided').default('1'))
        .description('Query the faucet for funds.')
        .action((options) => {
        (0, utils_1.mainProcessor)(faucet, options, []);
    });
    (0, cli_utils_1.addBaseOptions)(program);
    (0, cli_utils_1.addSkipPromptOption)(program);
    program.parse();
}
//# sourceMappingURL=faucet.js.map