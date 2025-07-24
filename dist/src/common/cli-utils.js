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
exports.addStoreOptions = exports.addOptionsToCommands = exports.addBaseOptions = exports.addEnvOption = void 0;
require("dotenv/config");
const fs = __importStar(require("fs"));
const commander_1 = require("commander");
// A path to the chain configuration files
const CHAIN_CONFIG_PATH = `${__dirname}/../axelar-chains-config/info`;
// A list of available chain environments which are the names of the files in the CHAIN_CONFIG_PATH
const CHAIN_ENVIRONMENTS = fs.readdirSync(CHAIN_CONFIG_PATH).map((chainName) => chainName.split('.')[0]);
/**
 * 환경 변수 옵션을 추가합니다.
 * @param program - 명령어 프로그램 객체
 * @param defaultValue - 기본값 (선택 사항)
 */
const addEnvOption = (program, defaultValue) => {
    program.addOption(new commander_1.Option('-e, --env <env>', 'environment')
        .choices(CHAIN_ENVIRONMENTS)
        .default(defaultValue || 'testnet')
        .makeOptionMandatory(true)
        .env('ENV'));
};
exports.addEnvOption = addEnvOption;
/**
 * 기본 옵션을 추가합니다.
 * @param program - 명령어 프로그램 객체
 * @param options - 옵션 설정 (선택 사항)
 * @returns 프로그램 객체
 */
const addBaseOptions = (program, options = {}) => {
    addEnvOption(program);
    program.addOption(new commander_1.Option('-y, --yes', 'skip deployment prompt confirmation').env('YES'));
    program.addOption(new commander_1.Option('--parallel', 'run script parallely wrt chains'));
    program.addOption(new commander_1.Option('--saveChainSeparately', 'save chain info separately'));
    program.addOption(new commander_1.Option('--gasOptions <gasOptions>', 'gas options cli override'));
    if (!options.ignoreChainNames) {
        program.addOption(new commander_1.Option('-n, --chainNames <chainNames>', 'chains to run the script over').makeOptionMandatory(true).env('CHAINS'));
        program.addOption(new commander_1.Option('--skipChains <skipChains>', 'chains to skip over'));
        program.addOption(new commander_1.Option('--startFromChain <startFromChain>', 'start from a specific chain onwards in the config, useful when a cmd fails for an intermediate chain'));
    }
    if (!options.ignorePrivateKey) {
        program.addOption(new commander_1.Option('-p, --privateKey <privateKey>', 'private key').makeOptionMandatory(true).env('PRIVATE_KEY'));
    }
    if (options.address) {
        program.addOption(new commander_1.Option('-a, --address <address>', 'override address'));
    }
    return program;
};
exports.addBaseOptions = addBaseOptions;
/**
 * 명령어 프로그램에 옵션을 추가합니다.
 * @param program - 명령어 프로그램 객체
 * @param optionMethod - 옵션을 추가할 함수
 * @param options - 옵션 설정 (선택 사항)
 */
const addOptionsToCommands = (program, optionMethod, options) => {
    if (program.commands.length > 0) {
        program.commands.forEach((command) => {
            optionMethod(command, options);
        });
    }
};
exports.addOptionsToCommands = addOptionsToCommands;
/**
 * 스토어 옵션을 추가합니다.
 * @param program - 명령어 프로그램 객체
 */
const addStoreOptions = (program) => {
    program.addOption(new commander_1.Option('-a, --artifact-path <artifactPath>', 'Path to the contract artifact file to upload (required if --version is not used)').env('ARTIFACT_PATH'));
    program.addOption(new commander_1.Option('-v, --version <contractVersion>', 'Specify a released version (X.Y.Z) or a commit hash to upload (required if --artifact-path is not used)').env('CONTRACT_VERSION'));
    program.hook('preAction', async (thisCommand) => {
        const opts = thisCommand.opts();
        if (!opts.artifactPath && !opts.version) {
            throw new Error('Either --artifact-path or --version is required');
        }
    });
};
exports.addStoreOptions = addStoreOptions;
//# sourceMappingURL=cli-utils.js.map