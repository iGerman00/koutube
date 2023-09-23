"use strict";
/**
 * @author jdiaz5513
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArenaAllocationResult = void 0;
const tslib_1 = require("tslib");
const debug_1 = tslib_1.__importDefault(require("debug"));
const trace = debug_1.default("capnp:serialization:arena:arena-allocation-result");
trace("load");
class ArenaAllocationResult {
    constructor(id, buffer) {
        this.id = id;
        this.buffer = buffer;
        trace("new", this);
    }
}
exports.ArenaAllocationResult = ArenaAllocationResult;
//# sourceMappingURL=arena-allocation-result.js.map