import chalk from 'chalk';
declare const pascalToSnake: (str: string) => string;
declare const pascalToKebab: (str: string) => string;
declare const VERSION_REGEX: RegExp;
declare const SHORT_COMMIT_HASH_REGEX: RegExp;
declare function loadConfig(env: string): any;
declare function saveConfig(config: any, env: string): void;
declare const writeJSON: (data: any, name: string) => void;
declare const printInfo: (msg: string, info?: any, colour?: chalk.Chalk) => void;
declare const printWarn: (msg: string, info?: any) => void;
declare const printError: (msg: string, info?: any) => void;
declare const printHighlight: (msg: string, info?: any, colour?: chalk.Chalk) => void;
declare const printDivider: (char?: string, width?: number, colour?: chalk.Chalk) => void;
declare function printLog(log: any): void;
declare const isString: (arg: string) => boolean;
declare const isNonEmptyString: (arg: string) => boolean;
declare const isStringLowercase: (arg: string) => boolean;
declare const isStringArray: (arr: string[]) => boolean;
declare const isNumber: (arg: number) => boolean;
declare const isValidNumber: (arg: string | number) => boolean;
declare const isValidDecimal: (arg: string | number) => boolean;
declare const isNumberArray: (arr: number[]) => boolean;
declare const isNonEmptyStringArray: (arr: string[]) => boolean;
declare function copyObject(obj: any): any;
declare const httpGet: (url: string) => Promise<unknown>;
declare const httpPost: (url: string, data: any) => Promise<any>;
declare const callAxelarscanApi: (config: any, method: string, data: any, time?: number) => Promise<any>;
declare const itsHubContractAddress: (config: any) => any;
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
declare const parseArgs: (args: string) => any[];
declare function sleep(ms: number): Promise<unknown>;
declare function timeout(prom: Promise<any>, time: number, exception: Error): Promise<any>;
/**
 * Determines if a given input is a valid keccak256 hash.
 *
 * @param {string} input - The string to validate.
 * @returns {boolean} - Returns true if the input is a valid keccak256 hash, false otherwise.
 */
declare function isKeccak256Hash(input: string): boolean;
/**
 * Validate if the input string matches the time format YYYY-MM-DDTHH:mm:ss
 *
 * @param {string} timeString - The input time string.
 * @return {boolean} - Returns true if the format matches, false otherwise.
 */
declare function isValidTimeFormat(timeString: string): boolean;
/**
 * Basic validatation to check if the provided string *might* be a valid SVM
 * address. One needs to ensure that it's 32 bytes long after decoding.
 *
 * See https://solana.com/developers/guides/advanced/exchange#basic-verification.
 *
 * @param {string} address - The base58 encoded Solana address to validate
 * @returns {boolean} - True if the address is valid, false otherwise
 */
declare function isValidSvmAddressFormat(address: string): boolean;
declare function validateParameters(parameters: {
    [key: string]: any;
}): void;
declare const dateToEta: (utcTimeString: string) => number;
declare const etaToDate: (timestamp: number) => string;
declare const getCurrentTimeInSeconds: () => number;
/**
 * Prompt the user for confirmation
 * @param {string} question Prompt question
 * @param {boolean} yes If true, skip the prompt
 * @returns {boolean} Returns true if the prompt was skipped, false otherwise
 */
declare const prompt: (question: string, yes?: boolean) => boolean;
declare function findProjectRoot(startDir: string): string;
declare function toBigNumberString(number: number): string;
declare const getSaltFromKey: (key: string) => string;
declare const getAmplifierContractOnchainConfig: (config: any, chain: string) => Promise<any>;
declare function getDomainSeparator(config: any, chain: any, options: {
    env: string;
    domainSeparator?: string;
}): Promise<string>;
declare const getChainConfig: (config: any, chainName: string, options?: {
    skipCheck?: boolean;
}) => any;
declare const getChainConfigByAxelarId: (config: any, chainAxelarId: string) => any;
declare const getMultisigProof: (config: any, chain: string, multisigSessionId: string) => Promise<any>;
declare const getCurrentVerifierSet: (config: any, chain: string) => Promise<{
    verifierSetId: any;
    verifierSet: any;
    signers: unknown[];
}>;
declare const calculateDomainSeparator: (chain: string, router: string, network: string) => string;
declare const downloadContractCode: (url: string, contractName: string, version: string) => Promise<string>;
declare const tryItsEdgeContract: (chainConfig: any) => any;
declare const itsEdgeContract: (chainConfig: any) => any;
declare const parseTrustedChains: (config: any, trustedChains: string[]) => any[];
declare const readContractCode: (options: {
    contractCodePath: string;
}) => NonSharedBuffer;
declare function asciiToBytes(string: string): string;
/**
 * Encodes the destination address for Interchain Token Service (ITS) transfers.
 * This function ensures proper encoding of the destination address based on the destination chain type.
 * Note: - Stellar and XRPL addresses are converted to ASCII byte arrays.
 *       - Solana (svm) addresses are decoded from base58 and hexlified.
 *       - EVM and Sui addresses are returned as-is (default behavior).
 *       - Additional encoding logic can be added for new chain types.
 */
declare function encodeITSDestination(config: any, destinationChain: string, destinationAddress: string): string;
declare const getProposalConfig: (config: any, env: string, key: string) => any;
export { loadConfig, saveConfig, writeJSON, printInfo, printWarn, printError, printHighlight, printDivider, printLog, isKeccak256Hash, isNonEmptyString, isString, isStringArray, isStringLowercase, isNumber, isValidNumber, isValidDecimal, isNumberArray, isNonEmptyStringArray, isValidTimeFormat, copyObject, httpGet, httpPost, callAxelarscanApi, parseArgs, sleep, dateToEta, etaToDate, getCurrentTimeInSeconds, prompt, findProjectRoot, toBigNumberString, timeout, validateParameters, getDomainSeparator, getChainConfig, getChainConfigByAxelarId, getMultisigProof, getAmplifierContractOnchainConfig, getSaltFromKey, calculateDomainSeparator, downloadContractCode, pascalToKebab, pascalToSnake, readContractCode, VERSION_REGEX, SHORT_COMMIT_HASH_REGEX, itsEdgeContract, tryItsEdgeContract, parseTrustedChains, isValidSvmAddressFormat, getCurrentVerifierSet, asciiToBytes, encodeITSDestination, getProposalConfig, itsHubContractAddress, };
