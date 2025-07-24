'use strict';

import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import * as http from 'http';
import chalk from 'chalk';
import readlineSync from 'readline-sync';
import { outputJsonSync } from 'fs-extra';
import { CosmWasmClient } from '@cosmjs/cosmwasm-stargate';
import { constants } from 'ethers';
import { keccak256, defaultAbiCoder, hexlify } from 'ethers/lib/utils';
import { normalizeBech32 } from '@cosmjs/encoding';
import fetch from 'node-fetch';
 
import bs58 from 'bs58';

const pascalToSnake = (str: string) => str.replace(/([A-Z])/g, (group) => `_${group.toLowerCase()}`).replace(/^_/, '');

const pascalToKebab = (str: string) => str.replace(/([A-Z])/g, (group) => `-${group.toLowerCase()}`).replace(/^-/, '');

const VERSION_REGEX = /^\d+\.\d+\.\d+$/;
const SHORT_COMMIT_HASH_REGEX = /^[a-f0-9]{7,}$/;
const SVM_BASE58_ADDRESS_REGEX = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

function loadConfig() {
    const configPath = path.join(__dirname, '../../config/testnet.json');
    return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
}

function saveConfig(config: any, env: string) {
    writeJSON(config, `${__dirname}/../axelar-chains-config/info/${env}.json`);
}

const writeJSON = (data: any, name: string) => {
    outputJsonSync(name, data, {
        spaces: 2,
        EOL: '\n',
    });
};

const printInfo = (msg: string, info: any = '', colour = chalk.green) => {
    if (typeof info === 'boolean') {
        info = String(info);
    } else if (typeof info === 'object') {
        info = JSON.stringify(info, null, 2);
    }

    if (info) {
        console.log(`${msg}: ${colour(info)}\n`);
    } else {
        console.log(`${msg}\n`);
    }
};

const printWarn = (msg: string, info: any = '') => {
    if (info) {
        msg = `${msg}: ${info}`;
    }

    console.log(`${chalk.italic.yellow(msg)}\n`);
};

const printError = (msg: string, info: any = '') => {
    if (info) {
        msg = `${msg}: ${info}`;
    }

    console.log(`${chalk.bold.red(msg)}\n`);
};

const printHighlight = (msg: string, info: any = '', colour = chalk.bgBlue) => {
    if (info) {
        msg = `${msg}: ${info}`;
    }

    console.log(`${colour(msg)}\n`);
};

const printDivider = (char = '-', width = process.stdout.columns, colour = chalk.bold.white) => {
    console.log(colour(char.repeat(width)));
};

function printLog(log: any) {
    console.log(JSON.stringify({ log }, null, 2));
}

const isString = (arg: string) => {
    return typeof arg === 'string';
};

const isNonEmptyString = (arg: string) => {
    return isString(arg) && arg !== '';
};

const isStringLowercase = (arg: string) => {
    return isNonEmptyString(arg) && arg === arg.toLowerCase();
};

const isStringArray = (arr: string[]) => Array.isArray(arr) && arr.every(isString);

const isNumber = (arg: number) => {
    return Number.isInteger(arg);
};

const isValidNumber = (arg: string | number) => {
    if (typeof arg === 'number') return isFinite(arg);
    return !isNaN(parseInt(arg)) && isFinite(Number(arg));
};

const isValidDecimal = (arg: string | number) => {
    if (typeof arg === 'number') return isFinite(arg);
    return !isNaN(parseFloat(arg)) && isFinite(Number(arg));
};

const isNumberArray = (arr: number[]) => {
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

const isNonEmptyStringArray = (arr: string[]) => {
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

function copyObject(obj: any) {
    return JSON.parse(JSON.stringify(obj));
}

const httpGet = (url: string) => {
    return new Promise((resolve, reject) => {
        (url.startsWith('https://') ? https : http).get(url, (res) => {
            const { statusCode } = res;
            const contentType = res.headers['content-type'];
            let error;

            if (statusCode !== 200 && statusCode !== 301) {
                error = new Error('Request Failed.\n' + `Request: ${url}\nStatus Code: ${statusCode}`);
            } else if (!/^application\/json/.test(contentType)) {
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
                } catch (e) {
                    reject(e);
                }
            });
        });
    });
};

const httpPost = async (url: string, data: any) => {
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    return response.json();
};

const callAxelarscanApi = async (config: any, method: string, data: any, time = 10000) => {
    return timeout(
        httpPost(`${config.axelar.axelarscanApi}/${method}`, data),
        time,
        new Error(`Timeout calling Axelarscan API: ${method}`),
    );
};

const itsHubContractAddress = (config: any) => {
    return config?.axelar?.contracts?.InterchainTokenService?.address;
};

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
const parseArgs = (args: string) => {
    return args
        .split(/\s+/)
        .filter((item) => item !== '')
        .map((arg) => {
            if (arg.startsWith('[') && arg.endsWith(']')) {
                return JSON.parse(arg);
            } else if (arg === 'true') {
                return true;
            } else if (arg === 'false') {
                return false;
            } else if (!isNaN(Number(arg)) && !arg.startsWith('0x')) {
                return Number(arg);
            }

            return arg;
        });
};

function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function timeout(prom: Promise<any>, time: number, exception: Error) {
    let timer: NodeJS.Timeout;

    // Racing the promise with a timer
    // If the timer resolves first, the promise is rejected with the exception
    return Promise.race([prom, new Promise((resolve, reject) => (timer = setTimeout(reject, time, exception)))]).finally(() =>
        clearTimeout(timer),
    );
}

/**
 * Determines if a given input is a valid keccak256 hash.
 *
 * @param {string} input - The string to validate.
 * @returns {boolean} - Returns true if the input is a valid keccak256 hash, false otherwise.
 */
function isKeccak256Hash(input: string) {
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
function isValidTimeFormat(timeString: string) {
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
function isValidSvmAddressFormat(address: string) {
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

function validateParameters(parameters: { [key: string]: any }) {
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

const dateToEta = (utcTimeString: string) => {
    if (utcTimeString === '0') {
        return 0;
    }

    const date = new Date(utcTimeString + 'Z');

    if (isNaN(date.getTime())) {
        throw new Error(`Invalid date format provided: ${utcTimeString}`);
    }

    return Math.floor(date.getTime() / 1000);
};

const etaToDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);

    if (isNaN(date.getTime())) {
        throw new Error(`Invalid timestamp provided: ${timestamp}`);
    }

    return date.toISOString().slice(0, 19);
};

const getCurrentTimeInSeconds = () => {
    const now = new Date();
    const currentTimeInSecs = Math.floor(now.getTime() / 1000);
    return currentTimeInSecs;
};

/**
 * Prompt the user for confirmation
 * @param {string} question Prompt question
 * @param {boolean} yes If true, skip the prompt
 * @returns {boolean} Returns true if the prompt was skipped, false otherwise
 */
const prompt = (question: string, yes = false) => {
    // skip the prompt if yes was passed
    if (yes) {
        return false;
    }

    const answer = readlineSync.question(`${question} ${chalk.green('(y/n)')} `);
    console.log();

    return answer !== 'y';
};

function findProjectRoot(startDir: string) {
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

function toBigNumberString(number: number) {
    return Math.ceil(number).toLocaleString('en', { useGrouping: false });
}

const isValidCosmosAddress = (str: string) => {
    try {
        normalizeBech32(str);

        return true;
    } catch (error) {
        return false;
    }
};

const getSaltFromKey = (key: string) => {
    return keccak256(defaultAbiCoder.encode(['string'], [key.toString()]));
};

const getAmplifierContractOnchainConfig = async (config: any, chain: string) => {
    const key = Buffer.from('config');
    const client = await CosmWasmClient.connect(config.axelar.rpc);
    const value = await client.queryContractRaw(config.axelar.contracts.MultisigProver[chain].address, key);
    return JSON.parse(Buffer.from(value).toString('ascii'));
};

async function getDomainSeparator(config: any, chain: any, options: { env: string; domainSeparator?: string; }) {
    // Allow any domain separator for local deployments or `0x` if not provided
    if (options.env === 'local') {
        if (options.domainSeparator && options.domainSeparator !== 'offline') {
            return options.domainSeparator;
        }

        return constants.HashZero;
    }

    if (isKeccak256Hash(options.domainSeparator)) {
        // return the domainSeparator for debug deployments
        return options.domainSeparator;
    }

    const {
        axelar: { contracts, chainId },
    } = config;
    const {
        Router: { address: routerAddress },
    } = contracts;

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
    const domainSeparator = hexlify((await getAmplifierContractOnchainConfig(config, chain.axelarId)).domain_separator);

    if (domainSeparator !== expectedDomainSeparator) {
        throw new Error(`unexpected domain separator (want ${expectedDomainSeparator}, got ${domainSeparator})`);
    }

    return expectedDomainSeparator;
}

const getChainConfig = (config: any, chainName: string, options: { skipCheck?: boolean } = {}) => {
    if (!chainName) {
        return undefined;
    }

    const chainConfig = config.chains[chainName] || config[chainName];

    if (!options.skipCheck && !chainConfig) {
        throw new Error(`Chain ${chainName} not found in config`);
    }

    return chainConfig;
};

const getChainConfigByAxelarId = (config: any, chainAxelarId: string) => {
    if (chainAxelarId === 'axelar') {
        return config.axelar;
    }

    for (const chain of Object.values(config.chains) as any[]) {
        if (chain.axelarId === chainAxelarId) {
            return chain;
        }
    }

    throw new Error(`Chain with axelarId ${chainAxelarId} not found in config`);
};

const getMultisigProof = async (config: any, chain: string, multisigSessionId: string) => {
    const query = { proof: { multisig_session_id: `${multisigSessionId}` } };
    const client = await CosmWasmClient.connect(config.axelar.rpc);
    const value = await client.queryContractSmart(config.axelar.contracts.MultisigProver[chain].address, query);
    return value;
};

const getCurrentVerifierSet = async (config: any, chain: string) => {
    const client = await CosmWasmClient.connect(config.axelar.rpc);
    const { id: verifierSetId, verifier_set: verifierSet } = await client.queryContractSmart(
        config.axelar.contracts.MultisigProver[chain].address,
        'current_verifier_set',
    );

    return {
        verifierSetId,
        verifierSet,
        signers: Object.values(verifierSet.signers),
    };
};

const calculateDomainSeparator = (chain: string, router: string, network: string) => keccak256(Buffer.from(`${chain}${router}${network}`));

const downloadContractCode = async (url: string, contractName: string, version: string) => {
    const tempDir = path.join(process.cwd(), 'artifacts');

    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
    }

    const outputPath = path.join(tempDir, `${contractName}-${version}.wasm`);

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Failed to download WASM file: ${response.statusText}`);
    }

    const buffer = await response.buffer();
    fs.writeFileSync(outputPath, buffer);

    return outputPath;
};

const tryItsEdgeContract = (chainConfig: any) => {
    const itsEdgeContract =
        chainConfig.contracts.InterchainTokenService?.objects?.ChannelId || // sui
        chainConfig.contracts.InterchainTokenService?.address;

    return itsEdgeContract;
};

const itsEdgeContract = (chainConfig: any) => {
    const itsEdgeContract = tryItsEdgeContract(chainConfig);

    if (!itsEdgeContract) {
        throw new Error(`Missing InterchainTokenService edge contract for chain: ${chainConfig.name}`);
    }

    return itsEdgeContract;
};

const itsEdgeChains = (config: any) =>
    Object.values(config.chains)
        .filter(tryItsEdgeContract)
        .map((chain: any) => chain.axelarId);

const parseTrustedChains = (config: any, trustedChains: string[]) => {
    return trustedChains.length === 1 && trustedChains[0] === 'all' ? itsEdgeChains(config) : trustedChains;
};

const readContractCode = (options: { contractCodePath: string }) => {
    return fs.readFileSync(options.contractCodePath);
};

function asciiToBytes(string: string) {
    return hexlify(Buffer.from(string, 'ascii'));
}



/**
 * Encodes the destination address for Interchain Token Service (ITS) transfers.
 * This function ensures proper encoding of the destination address based on the destination chain type.
 * Note: - Stellar and XRPL addresses are converted to ASCII byte arrays.
 *       - Solana (svm) addresses are decoded from base58 and hexlified.
 *       - EVM and Sui addresses are returned as-is (default behavior).
 *       - Additional encoding logic can be added for new chain types.
 */
function encodeITSDestination(config: any, destinationChain: string, destinationAddress: string) {
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

const getProposalConfig = (config: any, env: string, key: string) => {
    try {
        const value = config.axelar?.[key];
        if (value === undefined) throw new Error(`Key "${key}" not found in config for ${env}`);
        return value;
    } catch (error) {
        throw new Error(`Failed to load config value "${key}" for ${env}: ${error.message}`);
    }
};

export {
    loadConfig,
    saveConfig,
    writeJSON,
    printInfo,
    printWarn,
    printError,
    printHighlight,
    printDivider,
    printLog,
    isKeccak256Hash,
    isNonEmptyString,
    isString,
    isStringArray,
    isStringLowercase,
    isNumber,
    isValidNumber,
    isValidDecimal,
    isNumberArray,
    isNonEmptyStringArray,
    isValidTimeFormat,
    copyObject,
    httpGet,
    httpPost,
    callAxelarscanApi,
    parseArgs,
    sleep,
    dateToEta,
    etaToDate,
    getCurrentTimeInSeconds,
    prompt,
    findProjectRoot,
    toBigNumberString,
    timeout,
    validateParameters,
    getDomainSeparator,
    getChainConfig,
    getChainConfigByAxelarId,
    getMultisigProof,
    getAmplifierContractOnchainConfig,
    getSaltFromKey,
    calculateDomainSeparator,
    downloadContractCode,
    pascalToKebab,
    pascalToSnake,
    readContractCode,
    VERSION_REGEX,
    SHORT_COMMIT_HASH_REGEX,
    itsEdgeContract,
    tryItsEdgeContract,
    parseTrustedChains,
    isValidSvmAddressFormat,
    getCurrentVerifierSet,
    asciiToBytes,
    encodeITSDestination,
    getProposalConfig,
    itsHubContractAddress,
};