/**
 * Adds wallet key type option to the program.
 * @param {import('commander').Command} program - The commander program instance.
 * @param {Object} [options={}] - Additional options.
 * @returns {import('commander').Command} The updated program instance.
 */
declare const addWalletOptions: (program: import("commander").Command, options?: Object) => import("commander").Command;
/**
 * Adds skip prompt confirmation option to the program.
 * @param {import('commander').Command} program - The commander program instance.
 * @param {Object} [options={}] - Additional options.
 * @returns {import('commander').Command} The updated program instance.
 */
declare const addSkipPromptOption: (program: import("commander").Command, options?: Object) => import("commander").Command;
/**
 * Adds base options to the program.
 * @param {import('commander').Command} program - The commander program instance.
 * @param {Object} [options={}] - Additional options.
 * @returns {import('commander').Command} The updated program instance.
 */
declare const addBaseOptions: (program: import("commander").Command, options?: Object) => import("commander").Command;
export { addBaseOptions, addWalletOptions, addSkipPromptOption, };
