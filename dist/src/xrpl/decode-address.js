"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processCommand = processCommand;
const commander_1 = require("commander");
const utils_1 = require("./utils");
const common_1 = require("../common");
/**
 * XRPL 주소를 디코딩하여 raw bytes로 변환하는 함수
 * @param address - 디코딩할 XRPL 계정 주소
 */
function processCommand(address) {
    try {
        const decodedAddressHex = (0, utils_1.decodeAccountIDToHex)(address);
        (0, common_1.printInfo)('Account ID raw bytes', `0x${decodedAddressHex}`);
    }
    catch (error) {
        (0, common_1.printError)('Failed to decode account ID', error.message);
        process.exit(1);
    }
}
if (require.main === module) {
    const program = new commander_1.Command();
    program.name('decode-address').description('Decode XRPL account ID to raw bytes.').argument('<address>', 'XRPL account ID to decode');
    program.action((address) => {
        processCommand(address);
    });
    program.parse();
}
//# sourceMappingURL=decode-address.js.map