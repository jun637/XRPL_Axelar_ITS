'use strict';

import * as xrpl from 'xrpl';
import { Option } from 'commander';
import { addEnvOption } from '../common/cli-utils';

/**
 * Adds wallet key type option to the program.
 * @param {import('commander').Command} program - The commander program instance.
 * @param {Object} [options={}] - Additional options.
 * @returns {import('commander').Command} The updated program instance.
 */
const addWalletOptions = (program: import('commander').Command, options: Object = {}): import('commander').Command => {
    program.addOption(
        new Option('--walletKeyType <walletKeyType>', 'wallet key type')
            .makeOptionMandatory(true)
            .choices([xrpl.ECDSA.secp256k1])
            .default(xrpl.ECDSA.secp256k1)
            .env('WALLET_KEY_TYPE'),
    );

    return program;
};

/**
 * Adds skip prompt confirmation option to the program.
 * @param {import('commander').Command} program - The commander program instance.
 * @param {Object} [options={}] - Additional options.
 * @returns {import('commander').Command} The updated program instance.
 */
const addSkipPromptOption = (program: import('commander').Command, options: Object = {}): import('commander').Command => {
    program.addOption(new Option('-y, --yes', 'skip prompt confirmation').env('YES'));
    return program;
};

/**
 * Adds base options to the program.
 * @param {import('commander').Command} program - The commander program instance.
 * @param {Object} [options={}] - Additional options.
 * @returns {import('commander').Command} The updated program instance.
 */
const addBaseOptions = (program: import('commander').Command, options: Object = {}): import('commander').Command => {
    addEnvOption(program);
    addWalletOptions(program);

    program.addOption(new Option('-n, --chainName <chainName>', 'chain to run the script over').makeOptionMandatory(true).env('CHAIN'));

    program.addOption(new Option('-p, --privateKey <privateKey>', 'private key').makeOptionMandatory(true).env('PRIVATE_KEY'));

    program.addOption(
        new Option('--privateKeyType <privateKeyType>', 'private key type')
            .makeOptionMandatory(true)
            .choices(['seed'])
            .default('seed')
            .env('PRIVATE_KEY_TYPE'),
    );

    return program;
};

export {
    addBaseOptions,
    addWalletOptions,
    addSkipPromptOption,
};