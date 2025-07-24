"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processCommand = processCommand;
const commander_1 = require("commander");
const utils_1 = require("./utils");
const common_1 = require("../common");
/**
 * XRPL 트랜잭션 blob을 디코딩하여 트랜잭션 객체로 변환하는 함수
 * @param txBlob - 디코딩할 XRPL 직렬화된 트랜잭션 blob
 */
function processCommand(txBlob) {
    try {
        const tx = (0, utils_1.decodeTxBlob)(txBlob);
        (0, common_1.printInfo)('Decoded transaction', tx);
    }
    catch (error) {
        (0, common_1.printError)('Failed to decode transaction blob', error.message);
        process.exit(1);
    }
}
if (require.main === module) {
    const program = new commander_1.Command();
    program
        .name('decode-tx-blob')
        .description('Decode XRPL serialized transaction blob into transaction object.')
        .argument('<tx-blob>', 'XRPL serialized transaction blob to decode');
    program.action((txBlob) => {
        processCommand(txBlob);
    });
    program.parse();
}
//# sourceMappingURL=decode-tx-blob.js.map