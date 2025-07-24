'use strict';
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
exports.addSkipPromptOption = exports.addWalletOptions = exports.addBaseOptions = void 0;
const xrpl = __importStar(require("xrpl"));
const commander_1 = require("commander");
const cli_utils_1 = require("../common/cli-utils");
/**
 * Adds wallet key type option to the program.
 * @param {import('commander').Command} program - The commander program instance.
 * @param {Object} [options={}] - Additional options.
 * @returns {import('commander').Command} The updated program instance.
 */
const addWalletOptions = (program, options = {}) => {
    program.addOption(new commander_1.Option('--walletKeyType <walletKeyType>', 'wallet key type')
        .makeOptionMandatory(true)
        .choices([xrpl.ECDSA.secp256k1])
        .default(xrpl.ECDSA.secp256k1)
        .env('WALLET_KEY_TYPE'));
    return program;
};
exports.addWalletOptions = addWalletOptions;
/**
 * Adds skip prompt confirmation option to the program.
 * @param {import('commander').Command} program - The commander program instance.
 * @param {Object} [options={}] - Additional options.
 * @returns {import('commander').Command} The updated program instance.
 */
const addSkipPromptOption = (program, options = {}) => {
    program.addOption(new commander_1.Option('-y, --yes', 'skip prompt confirmation').env('YES'));
    return program;
};
exports.addSkipPromptOption = addSkipPromptOption;
/**
 * Adds base options to the program.
 * @param {import('commander').Command} program - The commander program instance.
 * @param {Object} [options={}] - Additional options.
 * @returns {import('commander').Command} The updated program instance.
 */
const addBaseOptions = (program, options = {}) => {
    (0, cli_utils_1.addEnvOption)(program);
    addWalletOptions(program);
    program.addOption(new commander_1.Option('-n, --chainName <chainName>', 'chain to run the script over').makeOptionMandatory(true).env('CHAIN'));
    program.addOption(new commander_1.Option('-p, --privateKey <privateKey>', 'private key').makeOptionMandatory(true).env('PRIVATE_KEY'));
    program.addOption(new commander_1.Option('--privateKeyType <privateKeyType>', 'private key type')
        .makeOptionMandatory(true)
        .choices(['seed'])
        .default('seed')
        .env('PRIVATE_KEY_TYPE'));
    return program;
};
exports.addBaseOptions = addBaseOptions;
//# sourceMappingURL=cli-utils.js.map