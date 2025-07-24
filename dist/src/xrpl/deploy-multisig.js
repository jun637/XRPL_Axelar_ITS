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
exports.deployMultisig = deployMultisig;
const xrpl = __importStar(require("xrpl"));
const commander_1 = require("commander");
const utils_1 = require("./utils");
const cli_utils_1 = require("./cli-utils");
const common_1 = require("../common");
const DISABLE_MASTER_FLAG = xrpl.AccountSetAsfFlags.asfDisableMaster;
const DEFAULTS = {
    TRANSFER_RATE: 0, // Don't charge a fee for transferring currencies issued by the multisig
    TICK_SIZE: 6, // Determines truncation for order book entries, not payments
    DOMAIN: 'axelar.foundation',
    FLAGS: [
        xrpl.AccountSetAsfFlags.asfDisallowIncomingNFTokenOffer,
        xrpl.AccountSetAsfFlags.asfDisallowIncomingCheck,
        xrpl.AccountSetAsfFlags.asfDisallowIncomingPayChan,
        xrpl.AccountSetAsfFlags.asfDefaultRipple,
        xrpl.AccountSetAsfFlags.asfNoFreeze,
    ],
};
const MAX_TICKET_COUNT = 250;
const INITIAL_QUORUM = 1;
const INITIAL_SIGNER_WEIGHT = 1;
/**
 * XRPL 멀티시그 계정을 배포하는 함수
 * @param _config - 설정 객체 (사용하지 않음)
 * @param wallet - XRPL 지갑 객체
 * @param client - XRPL 클라이언트
 * @param chain - 체인 정보 (contracts 객체 포함)
 * @param options - 옵션 객체 (generateWallet, transferRate, tickSize, domain, flags, initialSigner, yes 포함)
 */
async function deployMultisig(_config, wallet, client, chain, options) {
    const { balance } = await client.accountInfo(wallet.address);
    const { baseReserve, ownerReserve } = await client.reserveRequirements();
    const multisigReserve = Math.ceil(baseReserve + (MAX_TICKET_COUNT + 1) * ownerReserve);
    if (balance < Number(multisigReserve)) {
        (0, common_1.printWarn)(`Wallet XRP balance (${balance} XRP) is less than required multisig account reserve (${multisigReserve} XRP)`);
        process.exit(0);
    }
    let multisig;
    if (options.generateWallet) {
        multisig = (0, utils_1.generateWallet)({ walletKeyType: 'ed25519' });
        (0, common_1.printInfo)('Generated new multisig account', multisig);
        (0, common_1.printInfo)(`Funding multisig account with ${multisigReserve} XRP from wallet`);
        await client.sendPayment(wallet, { destination: multisig.address, amount: xrpl.xrpToDrops(multisigReserve) });
        (0, common_1.printInfo)('Funded multisig account');
    }
    else {
        if ((0, common_1.prompt)(`Proceed with turning ${wallet.address} into a multisig account?`, options.yes)) {
            return;
        }
        multisig = wallet;
    }
    (0, common_1.printInfo)('Setting initial multisig signer', options.initialSigner);
    await client.sendSignerListSet(multisig, {
        quorum: INITIAL_QUORUM,
        signers: [{ address: options.initialSigner, weight: INITIAL_SIGNER_WEIGHT }],
    }, options);
    (0, common_1.printInfo)('Creating tickets');
    await client.sendTicketCreate(multisig, { ticketCount: MAX_TICKET_COUNT }, options);
    for (const flag of options.flags) {
        (0, common_1.printInfo)(`Setting flag ${flag}`);
        await client.sendAccountSet(multisig, { flag }, options);
    }
    (0, common_1.printInfo)('Configuring remaining account settings');
    await client.sendAccountSet(multisig, {
        transferRate: options.transferRate,
        tickSize: options.tickSize,
        domain: (0, utils_1.hex)(options.domain),
        flag: DISABLE_MASTER_FLAG,
    }, options);
    chain.contracts.AxelarGateway = chain.contracts.InterchainTokenService = {
        address: multisig.address,
        initialSigner: options.initialSigner,
        transferRate: options.transferRate,
        tickSize: options.tickSize,
        domain: options.domain,
        flags: [DISABLE_MASTER_FLAG, ...options.flags],
    };
    (0, common_1.printInfo)('Successfully created and configured XRPL multisig account', multisig.address);
}
if (require.main === module) {
    const program = new commander_1.Command();
    program
        .name('deploy-multisig')
        .description('Converts a wallet into an XRPL multisig account.')
        .addOption(new commander_1.Option('--generateWallet', 'convert a new wallet (instead of the active wallet) into an XRPL multisig account').default(false))
        .addOption(new commander_1.Option('--transferRate <transferRate>', 'account transfer rate').default(DEFAULTS.TRANSFER_RATE))
        .addOption(new commander_1.Option('--tickSize <tickSize>', 'account tick size').default(DEFAULTS.TICK_SIZE))
        .addOption(new commander_1.Option('--domain <domain>', 'account domain').default(DEFAULTS.DOMAIN))
        .addOption(new commander_1.Option('--flags <flags...>', 'extra account flags (beyond asfDisableMaster)').default(DEFAULTS.FLAGS))
        .addOption(new commander_1.Option('--initialSigner <signer>', "XRPL address of the multisig's initial signer").makeOptionMandatory(true));
    (0, cli_utils_1.addBaseOptions)(program);
    (0, cli_utils_1.addSkipPromptOption)(program);
    program.action((options) => {
        (0, utils_1.mainProcessor)(deployMultisig, options, []);
    });
    program.parse();
}
//# sourceMappingURL=deploy-multisig.js.map