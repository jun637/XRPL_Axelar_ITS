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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.itsHubContractAddress = exports.getProposalConfig = exports.getCurrentVerifierSet = exports.parseTrustedChains = exports.tryItsEdgeContract = exports.itsEdgeContract = exports.SHORT_COMMIT_HASH_REGEX = exports.VERSION_REGEX = exports.readContractCode = exports.pascalToSnake = exports.pascalToKebab = exports.downloadContractCode = exports.calculateDomainSeparator = exports.getSaltFromKey = exports.getAmplifierContractOnchainConfig = exports.getMultisigProof = exports.getChainConfigByAxelarId = exports.getChainConfig = exports.prompt = exports.getCurrentTimeInSeconds = exports.etaToDate = exports.dateToEta = exports.parseArgs = exports.callAxelarscanApi = exports.httpPost = exports.httpGet = exports.isNonEmptyStringArray = exports.isNumberArray = exports.isValidDecimal = exports.isValidNumber = exports.isNumber = exports.isStringLowercase = exports.isStringArray = exports.isString = exports.isNonEmptyString = exports.printDivider = exports.printHighlight = exports.printError = exports.printWarn = exports.printInfo = exports.writeJSON = void 0;
exports.loadConfig = loadConfig;
exports.saveConfig = saveConfig;
exports.printLog = printLog;
exports.isKeccak256Hash = isKeccak256Hash;
exports.isValidTimeFormat = isValidTimeFormat;
exports.copyObject = copyObject;
exports.sleep = sleep;
exports.findProjectRoot = findProjectRoot;
exports.toBigNumberString = toBigNumberString;
exports.timeout = timeout;
exports.validateParameters = validateParameters;
exports.getDomainSeparator = getDomainSeparator;
exports.isValidSvmAddressFormat = isValidSvmAddressFormat;
exports.asciiToBytes = asciiToBytes;
exports.encodeITSDestination = encodeITSDestination;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const https = __importStar(require("https"));
const http = __importStar(require("http"));
const chalk_1 = __importDefault(require("chalk"));
const readline_sync_1 = __importDefault(require("readline-sync"));
const fs_extra_1 = require("fs-extra");
const cosmwasm_stargate_1 = require("@cosmjs/cosmwasm-stargate");
const ethers_1 = require("ethers");
const utils_1 = require("ethers/lib/utils");
const encoding_1 = require("@cosmjs/encoding");
const node_fetch_1 = __importDefault(require("node-fetch"));
const pascalToSnake = (str) => str.replace(/([A-Z])/g, (group) => `_${group.toLowerCase()}`).replace(/^_/, '');
exports.pascalToSnake = pascalToSnake;
const pascalToKebab = (str) => str.replace(/([A-Z])/g, (group) => `-${group.toLowerCase()}`).replace(/^-/, '');
exports.pascalToKebab = pascalToKebab;
const VERSION_REGEX = /^\d+\.\d+\.\d+$/;
exports.VERSION_REGEX = VERSION_REGEX;
const SHORT_COMMIT_HASH_REGEX = /^[a-f0-9]{7,}$/;
exports.SHORT_COMMIT_HASH_REGEX = SHORT_COMMIT_HASH_REGEX;
const SVM_BASE58_ADDRESS_REGEX = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
function loadConfig(env) {
    return require(`${__dirname}/../axelar-chains-config/info/${env}.json`);
}
function saveConfig(config, env) {
    writeJSON(config, `${__dirname}/../axelar-chains-config/info/${env}.json`);
}
const writeJSON = (data, name) => {
    (0, fs_extra_1.outputJsonSync)(name, data, {
        spaces: 2,
        EOL: '\n',
    });
};
exports.writeJSON = writeJSON;
const printInfo = (msg, info = '', colour = chalk_1.default.green) => {
    if (typeof info === 'boolean') {
        info = String(info);
    }
    else if (typeof info === 'object') {
        info = JSON.stringify(info, null, 2);
    }
    if (info) {
        console.log(`${msg}: ${colour(info)}\n`);
    }
    else {
        console.log(`${msg}\n`);
    }
};
exports.printInfo = printInfo;
const printWarn = (msg, info = '') => {
    if (info) {
        msg = `${msg}: ${info}`;
    }
    console.log(`${chalk_1.default.italic.yellow(msg)}\n`);
};
exports.printWarn = printWarn;
const printError = (msg, info = '') => {
    if (info) {
        msg = `${msg}: ${info}`;
    }
    console.log(`${chalk_1.default.bold.red(msg)}\n`);
};
exports.printError = printError;
const printHighlight = (msg, info = '', colour = chalk_1.default.bgBlue) => {
    if (info) {
        msg = `${msg}: ${info}`;
    }
    console.log(`${colour(msg)}\n`);
};
exports.printHighlight = printHighlight;
const printDivider = (char = '-', width = process.stdout.columns, colour = chalk_1.default.bold.white) => {
    console.log(colour(char.repeat(width)));
};
exports.printDivider = printDivider;
function printLog(log) {
    console.log(JSON.stringify({ log }, null, 2));
}
const isString = (arg) => {
    return typeof arg === 'string';
};
exports.isString = isString;
const isNonEmptyString = (arg) => {
    return isString(arg) && arg !== '';
};
exports.isNonEmptyString = isNonEmptyString;
const isStringLowercase = (arg) => {
    return isNonEmptyString(arg) && arg === arg.toLowerCase();
};
exports.isStringLowercase = isStringLowercase;
const isStringArray = (arr) => Array.isArray(arr) && arr.every(isString);
exports.isStringArray = isStringArray;
const isNumber = (arg) => {
    return Number.isInteger(arg);
};
exports.isNumber = isNumber;
const isValidNumber = (arg) => {
    if (typeof arg === 'number')
        return isFinite(arg);
    return !isNaN(parseInt(arg)) && isFinite(Number(arg));
};
exports.isValidNumber = isValidNumber;
const isValidDecimal = (arg) => {
    if (typeof arg === 'number')
        return isFinite(arg);
    return !isNaN(parseFloat(arg)) && isFinite(Number(arg));
};
exports.isValidDecimal = isValidDecimal;
const isNumberArray = (arr) => {
    if (!Array.isArray(arr)) {
        return false;
    }
    for (const item of arr) {
        if (!isNumber(item)) {
            return false;
        }
    }
    return true;
};
exports.isNumberArray = isNumberArray;
const isNonEmptyStringArray = (arr) => {
    if (!Array.isArray(arr)) {
        return false;
    }
    for (const item of arr) {
        if (typeof item !== 'string') {
            return false;
        }
    }
    return true;
};
exports.isNonEmptyStringArray = isNonEmptyStringArray;
function copyObject(obj) {
    return JSON.parse(JSON.stringify(obj));
}
const httpGet = (url) => {
    return new Promise((resolve, reject) => {
        (url.startsWith('https://') ? https : http).get(url, (res) => {
            const { statusCode } = res;
            const contentType = res.headers['content-type'];
            let error;
            if (statusCode !== 200 && statusCode !== 301) {
                error = new Error('Request Failed.\n' + `Request: ${url}\nStatus Code: ${statusCode}`);
            }
            else if (!/^application\/json/.test(contentType)) {
                error = new Error('Invalid content-type.\n' + `Expected application/json but received ${contentType}`);
            }
            if (error) {
                res.resume();
                reject(error);
                return;
            }
            res.setEncoding('utf8');
            let rawData = '';
            res.on('data', (chunk) => {
                rawData += chunk;
            });
            res.on('end', () => {
                try {
                    const parsedData = JSON.parse(rawData);
                    resolve(parsedData);
                }
                catch (e) {
                    reject(e);
                }
            });
        });
    });
};
exports.httpGet = httpGet;
const httpPost = async (url, data) => {
    const response = await (0, node_fetch_1.default)(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    return response.json();
};
exports.httpPost = httpPost;
const callAxelarscanApi = async (config, method, data, time = 10000) => {
    return timeout(httpPost(`${config.axelar.axelarscanApi}/${method}`, data), time, new Error(`Timeout calling Axelarscan API: ${method}`));
};
exports.callAxelarscanApi = callAxelarscanApi;
const itsHubContractAddress = (config) => {
    return config?.axelar?.contracts?.InterchainTokenService?.address;
};
exports.itsHubContractAddress = itsHubContractAddress;
/**
 * Parses the input string into an array of arguments, recognizing and converting
 * to the following types: boolean, number, array, and string.
 *
 * @param {string} args - The string of arguments to parse.
 *
 * @returns {Array} - An array containing parsed arguments.
 *
 * @example
 * const input = "hello true 123 [1,2,3]";
 * const output = parseArgs(input);
 * console.log(output); // Outputs: [ 'hello', true, 123, [ 1, 2, 3] ]
 */
const parseArgs = (args) => {
    return args
        .split(/\s+/)
        .filter((item) => item !== '')
        .map((arg) => {
        if (arg.startsWith('[') && arg.endsWith(']')) {
            return JSON.parse(arg);
        }
        else if (arg === 'true') {
            return true;
        }
        else if (arg === 'false') {
            return false;
        }
        else if (!isNaN(Number(arg)) && !arg.startsWith('0x')) {
            return Number(arg);
        }
        return arg;
    });
};
exports.parseArgs = parseArgs;
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
function timeout(prom, time, exception) {
    let timer;
    // Racing the promise with a timer
    // If the timer resolves first, the promise is rejected with the exception
    return Promise.race([prom, new Promise((resolve, reject) => (timer = setTimeout(reject, time, exception)))]).finally(() => clearTimeout(timer));
}
/**
 * Determines if a given input is a valid keccak256 hash.
 *
 * @param {string} input - The string to validate.
 * @returns {boolean} - Returns true if the input is a valid keccak256 hash, false otherwise.
 */
function isKeccak256Hash(input) {
    // Ensure it's a string of 66 characters length and starts with '0x'
    if (typeof input !== 'string' || input.length !== 66 || input.slice(0, 2) !== '0x') {
        return false;
    }
    // Ensure all characters after the '0x' prefix are hexadecimal (0-9, a-f, A-F)
    const hexPattern = /^[a-fA-F0-9]{64}$/;
    return hexPattern.test(input.slice(2));
}
/**
 * Validate if the input string matches the time format YYYY-MM-DDTHH:mm:ss
 *
 * @param {string} timeString - The input time string.
 * @return {boolean} - Returns true if the format matches, false otherwise.
 */
function isValidTimeFormat(timeString) {
    const regex = /^\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|1\d|2\d|3[01])T(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d$/;
    if (timeString === '0') {
        return true;
    }
    return regex.test(timeString);
}
// [삭제] Stellar 관련 코드
/**
 * Basic validatation to check if the provided string *might* be a valid SVM
 * address. One needs to ensure that it's 32 bytes long after decoding.
 *
 * See https://solana.com/developers/guides/advanced/exchange#basic-verification.
 *
 * @param {string} address - The base58 encoded Solana address to validate
 * @returns {boolean} - True if the address is valid, false otherwise
 */
function isValidSvmAddressFormat(address) {
    return SVM_BASE58_ADDRESS_REGEX.test(address);
}
const validationFunctions = {
    isNonEmptyString,
    isNumber,
    isValidNumber,
    isValidDecimal,
    isNumberArray,
    isKeccak256Hash,
    isString,
    isNonEmptyStringArray,
    isValidTimeFormat,
    isValidSvmAddressFormat,
};
function validateParameters(parameters) {
    for (const [validatorFunctionString, paramsObj] of Object.entries(parameters)) {
        const validatorFunction = validationFunctions[validatorFunctionString];
        if (typeof validatorFunction !== 'function') {
            throw new Error(`Validator function ${validatorFunctionString} is not defined`);
        }
        for (const paramKey of Object.keys(paramsObj)) {
            const paramValue = paramsObj[paramKey];
            const isValid = validatorFunction(paramValue);
            if (!isValid) {
                throw new Error(`Input validation failed for ${validatorFunctionString} with parameter ${paramKey}: ${paramValue}`);
            }
        }
    }
}
const dateToEta = (utcTimeString) => {
    if (utcTimeString === '0') {
        return 0;
    }
    const date = new Date(utcTimeString + 'Z');
    if (isNaN(date.getTime())) {
        throw new Error(`Invalid date format provided: ${utcTimeString}`);
    }
    return Math.floor(date.getTime() / 1000);
};
exports.dateToEta = dateToEta;
const etaToDate = (timestamp) => {
    const date = new Date(timestamp * 1000);
    if (isNaN(date.getTime())) {
        throw new Error(`Invalid timestamp provided: ${timestamp}`);
    }
    return date.toISOString().slice(0, 19);
};
exports.etaToDate = etaToDate;
const getCurrentTimeInSeconds = () => {
    const now = new Date();
    const currentTimeInSecs = Math.floor(now.getTime() / 1000);
    return currentTimeInSecs;
};
exports.getCurrentTimeInSeconds = getCurrentTimeInSeconds;
/**
 * Prompt the user for confirmation
 * @param {string} question Prompt question
 * @param {boolean} yes If true, skip the prompt
 * @returns {boolean} Returns true if the prompt was skipped, false otherwise
 */
const prompt = (question, yes = false) => {
    // skip the prompt if yes was passed
    if (yes) {
        return false;
    }
    const answer = readline_sync_1.default.question(`${question} ${chalk_1.default.green('(y/n)')} `);
    console.log();
    return answer !== 'y';
};
exports.prompt = prompt;
function findProjectRoot(startDir) {
    let currentDir = startDir;
    while (currentDir !== path.parse(currentDir).root) {
        const potentialPackageJson = path.join(currentDir, 'package.json');
        if (fs.existsSync(potentialPackageJson)) {
            return currentDir;
        }
        currentDir = path.resolve(currentDir, '..');
    }
    throw new Error('Unable to find project root');
}
function toBigNumberString(number) {
    return Math.ceil(number).toLocaleString('en', { useGrouping: false });
}
const isValidCosmosAddress = (str) => {
    try {
        (0, encoding_1.normalizeBech32)(str);
        return true;
    }
    catch (error) {
        return false;
    }
};
const getSaltFromKey = (key) => {
    return (0, utils_1.keccak256)(utils_1.defaultAbiCoder.encode(['string'], [key.toString()]));
};
exports.getSaltFromKey = getSaltFromKey;
const getAmplifierContractOnchainConfig = async (config, chain) => {
    const key = Buffer.from('config');
    const client = await cosmwasm_stargate_1.CosmWasmClient.connect(config.axelar.rpc);
    const value = await client.queryContractRaw(config.axelar.contracts.MultisigProver[chain].address, key);
    return JSON.parse(Buffer.from(value).toString('ascii'));
};
exports.getAmplifierContractOnchainConfig = getAmplifierContractOnchainConfig;
async function getDomainSeparator(config, chain, options) {
    // Allow any domain separator for local deployments or `0x` if not provided
    if (options.env === 'local') {
        if (options.domainSeparator && options.domainSeparator !== 'offline') {
            return options.domainSeparator;
        }
        return ethers_1.constants.HashZero;
    }
    if (isKeccak256Hash(options.domainSeparator)) {
        // return the domainSeparator for debug deployments
        return options.domainSeparator;
    }
    const { axelar: { contracts, chainId }, } = config;
    const { Router: { address: routerAddress }, } = contracts;
    if (!isString(chain.axelarId)) {
        throw new Error(`missing or invalid axelar ID for chain ${chain.name}`);
    }
    if (!isString(routerAddress) || !isValidCosmosAddress(routerAddress)) {
        throw new Error(`missing or invalid router address`);
    }
    if (!isString(chainId)) {
        throw new Error(`missing or invalid chain ID`);
    }
    const expectedDomainSeparator = calculateDomainSeparator(chain.axelarId, routerAddress, chainId);
    if (options.domainSeparator === 'offline') {
        printInfo('Computed domain separator offline');
        return expectedDomainSeparator;
    }
    printInfo(`Retrieving domain separator for ${chain.name} from Axelar network`);
    const domainSeparator = (0, utils_1.hexlify)((await getAmplifierContractOnchainConfig(config, chain.axelarId)).domain_separator);
    if (domainSeparator !== expectedDomainSeparator) {
        throw new Error(`unexpected domain separator (want ${expectedDomainSeparator}, got ${domainSeparator})`);
    }
    return expectedDomainSeparator;
}
const getChainConfig = (config, chainName, options = {}) => {
    if (!chainName) {
        return undefined;
    }
    const chainConfig = config.chains[chainName] || config[chainName];
    if (!options.skipCheck && !chainConfig) {
        throw new Error(`Chain ${chainName} not found in config`);
    }
    return chainConfig;
};
exports.getChainConfig = getChainConfig;
const getChainConfigByAxelarId = (config, chainAxelarId) => {
    if (chainAxelarId === 'axelar') {
        return config.axelar;
    }
    for (const chain of Object.values(config.chains)) {
        if (chain.axelarId === chainAxelarId) {
            return chain;
        }
    }
    throw new Error(`Chain with axelarId ${chainAxelarId} not found in config`);
};
exports.getChainConfigByAxelarId = getChainConfigByAxelarId;
const getMultisigProof = async (config, chain, multisigSessionId) => {
    const query = { proof: { multisig_session_id: `${multisigSessionId}` } };
    const client = await cosmwasm_stargate_1.CosmWasmClient.connect(config.axelar.rpc);
    const value = await client.queryContractSmart(config.axelar.contracts.MultisigProver[chain].address, query);
    return value;
};
exports.getMultisigProof = getMultisigProof;
const getCurrentVerifierSet = async (config, chain) => {
    const client = await cosmwasm_stargate_1.CosmWasmClient.connect(config.axelar.rpc);
    const { id: verifierSetId, verifier_set: verifierSet } = await client.queryContractSmart(config.axelar.contracts.MultisigProver[chain].address, 'current_verifier_set');
    return {
        verifierSetId,
        verifierSet,
        signers: Object.values(verifierSet.signers),
    };
};
exports.getCurrentVerifierSet = getCurrentVerifierSet;
const calculateDomainSeparator = (chain, router, network) => (0, utils_1.keccak256)(Buffer.from(`${chain}${router}${network}`));
exports.calculateDomainSeparator = calculateDomainSeparator;
const downloadContractCode = async (url, contractName, version) => {
    const tempDir = path.join(process.cwd(), 'artifacts');
    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
    }
    const outputPath = path.join(tempDir, `${contractName}-${version}.wasm`);
    const response = await (0, node_fetch_1.default)(url);
    if (!response.ok) {
        throw new Error(`Failed to download WASM file: ${response.statusText}`);
    }
    const buffer = await response.buffer();
    fs.writeFileSync(outputPath, buffer);
    return outputPath;
};
exports.downloadContractCode = downloadContractCode;
const tryItsEdgeContract = (chainConfig) => {
    const itsEdgeContract = chainConfig.contracts.InterchainTokenService?.objects?.ChannelId || // sui
        chainConfig.contracts.InterchainTokenService?.address;
    return itsEdgeContract;
};
exports.tryItsEdgeContract = tryItsEdgeContract;
const itsEdgeContract = (chainConfig) => {
    const itsEdgeContract = tryItsEdgeContract(chainConfig);
    if (!itsEdgeContract) {
        throw new Error(`Missing InterchainTokenService edge contract for chain: ${chainConfig.name}`);
    }
    return itsEdgeContract;
};
exports.itsEdgeContract = itsEdgeContract;
const itsEdgeChains = (config) => Object.values(config.chains)
    .filter(tryItsEdgeContract)
    .map((chain) => chain.axelarId);
const parseTrustedChains = (config, trustedChains) => {
    return trustedChains.length === 1 && trustedChains[0] === 'all' ? itsEdgeChains(config) : trustedChains;
};
exports.parseTrustedChains = parseTrustedChains;
const readContractCode = (options) => {
    return fs.readFileSync(options.contractCodePath);
};
exports.readContractCode = readContractCode;
function asciiToBytes(string) {
    return (0, utils_1.hexlify)(Buffer.from(string, 'ascii'));
}
/**
 * Encodes the destination address for Interchain Token Service (ITS) transfers.
 * This function ensures proper encoding of the destination address based on the destination chain type.
 * Note: - Stellar and XRPL addresses are converted to ASCII byte arrays.
 *       - Solana (svm) addresses are decoded from base58 and hexlified.
 *       - EVM and Sui addresses are returned as-is (default behavior).
 *       - Additional encoding logic can be added for new chain types.
 */
function encodeITSDestination(config, destinationChain, destinationAddress) {
    const chainType = getChainConfig(config, destinationChain, { skipCheck: true })?.chainType;
    switch (chainType) {
        case undefined:
            printWarn(`destinationChain ${destinationChain} not found in config`);
            return destinationAddress;
        case 'xrpl':
            // TODO: validate XRPL address format
            return asciiToBytes(destinationAddress);
        case 'evm':
        case 'sui':
        default: // EVM, Sui, and other chains (return as-is)
            return destinationAddress;
    }
}
const getProposalConfig = (config, env, key) => {
    try {
        const value = config.axelar?.[key];
        if (value === undefined)
            throw new Error(`Key "${key}" not found in config for ${env}`);
        return value;
    }
    catch (error) {
        throw new Error(`Failed to load config value "${key}" for ${env}: ${error.message}`);
    }
};
exports.getProposalConfig = getProposalConfig;
//# sourceMappingURL=utils.js.map