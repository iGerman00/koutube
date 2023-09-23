"use strict";
/**
 * @author jdiaz5513
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Interface = void 0;
const constants_1 = require("../../constants");
const errors_1 = require("../../errors");
const util_1 = require("../../util");
const pointer_1 = require("./pointer");
class Interface extends pointer_1.Pointer {
    constructor(segment, byteOffset, depthLimit = constants_1.MAX_DEPTH) {
        super(segment, byteOffset, depthLimit);
        throw new Error(util_1.format(errors_1.NOT_IMPLEMENTED, "new Interface"));
    }
}
exports.Interface = Interface;
//# sourceMappingURL=interface.js.map