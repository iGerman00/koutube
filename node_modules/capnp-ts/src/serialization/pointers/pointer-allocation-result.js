"use strict";
/**
 * @author jdiaz5513
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PointerAllocationResult = void 0;
const tslib_1 = require("tslib");
const debug_1 = tslib_1.__importDefault(require("debug"));
const trace = debug_1.default("capnp:pointer-allocation-result");
trace("load");
/**
 * This is used as the return value for `Pointer.prototype.initPointer`. Turns out using a class in V8 for multiple
 * return values is faster than using an array or anonymous object.
 *
 * http://jsben.ch/#/zTdbD
 *
 * @export
 * @class PointerAllocationResult
 */
class PointerAllocationResult {
    constructor(pointer, offsetWords) {
        this.pointer = pointer;
        this.offsetWords = offsetWords;
    }
}
exports.PointerAllocationResult = PointerAllocationResult;
//# sourceMappingURL=pointer-allocation-result.js.map