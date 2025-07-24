import { Command, Option } from 'commander';
import { mainProcessor, deriveAddress } from './utils';
import { addBaseOptions, addSkipPromptOption } from './cli-utils';
import { printInfo } from '../common';
import * as xrpl from 'xrpl';

/**
 * XRPL 멀티시그 계정의 서명자를 교체하는 함수
 * @param _config - 설정 객체 (사용하지 않음)
 * @param wallet - XRPL 지갑 객체
 * @param client - XRPL 클라이언트
 * @param chain - 체인 정보 (contracts.AxelarGateway.address 포함)
 * @param options - 옵션 객체 (signerPublicKeys, signerWeights, quorum, yes 포함)
 */
async function rotateSigners(_config: any, wallet: xrpl.Wallet, client: any, chain: any, options: { signerPublicKeys: string[]; signerWeights: string[]; quorum: string; yes: boolean }): Promise<void> {
    // Wallet must be the initial signer of the multisig account,
    // with enough weight to reach quorum.
    const multisig = chain.contracts.AxelarGateway.address;

    if (options.signerPublicKeys.length !== options.signerWeights.length) {
        throw new Error('Number of signer public keys must match number of signer weights');
    }

    printInfo('Updating multisig signer set');
    await client.sendSignerListSet(
        wallet,
        {
            account: multisig,
            quorum: Number(options.quorum),
            signers: options.signerPublicKeys.map((signedPubKey, i) => ({
                address: deriveAddress(signedPubKey),
                weight: Number(options.signerWeights[i]),
            })),
        },
        { multisign: true, ...options },
    );

    printInfo('Successfully rotated signers');
}

if (require.main === module) {
    const program = new Command();

    program
        .name('rotate-signers')
        .description('Rotate signers of the XRPL multisig account.')
        .addOption(new Option('--signerPublicKeys <signerPublicKeys...>', 'public keys of the new signers').makeOptionMandatory(true))
        .addOption(new Option('--signerWeights <signerWeights...>', 'weights of the new signers').makeOptionMandatory(true))
        .addOption(new Option('--quorum <quorum>', 'new quorum for the multisig account').makeOptionMandatory(true));

    addBaseOptions(program);
    addSkipPromptOption(program);

    program.action((options) => {
        mainProcessor(rotateSigners, options, []);
    });

    program.parse();
}

export { rotateSigners };