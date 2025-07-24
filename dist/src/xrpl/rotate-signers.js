"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rotateSigners = rotateSigners;
const commander_1 = require("commander");
const utils_1 = require("./utils");
const cli_utils_1 = require("./cli-utils");
const common_1 = require("../common");
/**
 * XRPL 멀티시그 계정의 서명자를 교체하는 함수
 * @param _config - 설정 객체 (사용하지 않음)
 * @param wallet - XRPL 지갑 객체
 * @param client - XRPL 클라이언트
 * @param chain - 체인 정보 (contracts.AxelarGateway.address 포함)
 * @param options - 옵션 객체 (signerPublicKeys, signerWeights, quorum, yes 포함)
 */
async function rotateSigners(_config, wallet, client, chain, options) {
    // Wallet must be the initial signer of the multisig account,
    // with enough weight to reach quorum.
    const multisig = chain.contracts.AxelarGateway.address;
    if (options.signerPublicKeys.length !== options.signerWeights.length) {
        throw new Error('Number of signer public keys must match number of signer weights');
    }
    (0, common_1.printInfo)('Updating multisig signer set');
    await client.sendSignerListSet(wallet, {
        account: multisig,
        quorum: Number(options.quorum),
        signers: options.signerPublicKeys.map((signedPubKey, i) => ({
            address: (0, utils_1.deriveAddress)(signedPubKey),
            weight: Number(options.signerWeights[i]),
        })),
    }, { multisign: true, ...options });
    (0, common_1.printInfo)('Successfully rotated signers');
}
if (require.main === module) {
    const program = new commander_1.Command();
    program
        .name('rotate-signers')
        .description('Rotate signers of the XRPL multisig account.')
        .addOption(new commander_1.Option('--signerPublicKeys <signerPublicKeys...>', 'public keys of the new signers').makeOptionMandatory(true))
        .addOption(new commander_1.Option('--signerWeights <signerWeights...>', 'weights of the new signers').makeOptionMandatory(true))
        .addOption(new commander_1.Option('--quorum <quorum>', 'new quorum for the multisig account').makeOptionMandatory(true));
    (0, cli_utils_1.addBaseOptions)(program);
    (0, cli_utils_1.addSkipPromptOption)(program);
    program.action((options) => {
        (0, utils_1.mainProcessor)(rotateSigners, options, []);
    });
    program.parse();
}
//# sourceMappingURL=rotate-signers.js.map