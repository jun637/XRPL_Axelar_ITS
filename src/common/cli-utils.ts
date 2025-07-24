import 'dotenv/config';
import * as fs from 'fs';
import { Option, Command } from 'commander';

// XRPL만 지원하도록 하드코딩
const CHAIN_ENVIRONMENTS: string[] = ['xrpl'];

type ProgramType = Command & { commands: readonly Command[] };

type OptionMethod = (program: ProgramType, options?: any) => void;

type AddBaseOptions = {
    ignoreChainNames?: boolean;
    ignorePrivateKey?: boolean;
    address?: string;
};

/**
 * 환경 변수 옵션을 추가합니다.
 * @param program - 명령어 프로그램 객체
 * @param defaultValue - 기본값 (선택 사항)
 */
const addEnvOption = (program: ProgramType, defaultValue?: string): void => {
    program.addOption(
        new Option('-e, --env <env>', 'environment')
            .choices(CHAIN_ENVIRONMENTS)
            .default(defaultValue || 'testnet')
            .makeOptionMandatory(true)
            .env('ENV'),
    );
};

/**
 * 기본 옵션을 추가합니다.
 * @param program - 명령어 프로그램 객체
 * @param options - 옵션 설정 (선택 사항)
 * @returns 프로그램 객체
 */
const addBaseOptions = (program: ProgramType, options: AddBaseOptions = {}): ProgramType => {
    addEnvOption(program);

    program.addOption(new Option('-y, --yes', 'skip deployment prompt confirmation').env('YES'));
    program.addOption(new Option('--parallel', 'run script parallely wrt chains'));
    program.addOption(new Option('--saveChainSeparately', 'save chain info separately'));
    program.addOption(new Option('--gasOptions <gasOptions>', 'gas options cli override'));

    if (!options.ignoreChainNames) {
        program.addOption(
            new Option('-n, --chainNames <chainNames>', 'chains to run the script over').makeOptionMandatory(true).env('CHAINS'),
        );
        program.addOption(new Option('--skipChains <skipChains>', 'chains to skip over'));
        program.addOption(
            new Option(
                '--startFromChain <startFromChain>',
                'start from a specific chain onwards in the config, useful when a cmd fails for an intermediate chain',
            ),
        );
    }

    if (!options.ignorePrivateKey) {
        program.addOption(new Option('-p, --privateKey <privateKey>', 'private key').makeOptionMandatory(true).env('PRIVATE_KEY'));
    }

    if (options.address) {
        program.addOption(new Option('-a, --address <address>', 'override address'));
    }

    return program;
};

/**
 * 명령어 프로그램에 옵션을 추가합니다.
 * @param program - 명령어 프로그램 객체
 * @param optionMethod - 옵션을 추가할 함수
 * @param options - 옵션 설정 (선택 사항)
 */
const addOptionsToCommands = (program: ProgramType, optionMethod: OptionMethod, options?: any): void => {
    if (program.commands.length > 0) {
        program.commands.forEach((command) => {
            optionMethod(command, options);
        });
    }
};

/**
 * 스토어 옵션을 추가합니다.
 * @param program - 명령어 프로그램 객체
 */
const addStoreOptions = (program: ProgramType): void => {
    program.addOption(
        new Option(
            '-a, --artifact-path <artifactPath>',
            'Path to the contract artifact file to upload (required if --version is not used)',
        ).env('ARTIFACT_PATH'),
    );

    program.addOption(
        new Option(
            '-v, --version <contractVersion>',
            'Specify a released version (X.Y.Z) or a commit hash to upload (required if --artifact-path is not used)',
        ).env('CONTRACT_VERSION'),
    );

    program.hook('preAction', async (thisCommand: Command) => {
        const opts = thisCommand.opts();

        if (!opts.artifactPath && !opts.version) {
            throw new Error('Either --artifact-path or --version is required');
        }
    });
};

export { addEnvOption, addBaseOptions, addOptionsToCommands, addStoreOptions };