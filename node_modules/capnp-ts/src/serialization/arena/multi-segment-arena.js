"use strict";
/**
 * @author jdiaz5513
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNumSegments = exports.getBuffer = exports.allocate = exports.MultiSegmentArena = void 0;
const tslib_1 = require("tslib");
const debug_1 = tslib_1.__importDefault(require("debug"));
const constants_1 = require("../../constants");
const errors_1 = require("../../errors");
const util_1 = require("../../util");
const arena_allocation_result_1 = require("./arena-allocation-result");
const arena_kind_1 = require("./arena-kind");
const trace = debug_1.default("capnp:arena:multi");
trace("load");
class MultiSegmentArena {
    constructor(buffers = []) {
        this.kind = arena_kind_1.ArenaKind.MULTI_SEGMENT;
        this.buffers = buffers;
        trace("new %s", this);
    }
    toString() {
        return util_1.format("MultiSegmentArena_segments:%d", getNumSegments(this));
    }
}
exports.MultiSegmentArena = MultiSegmentArena;
MultiSegmentArena.allocate = allocate;
MultiSegmentArena.getBuffer = getBuffer;
MultiSegmentArena.getNumSegments = getNumSegments;
function allocate(minSize, m) {
    const b = new ArrayBuffer(util_1.padToWord(Math.max(minSize, constants_1.DEFAULT_BUFFER_SIZE)));
    m.buffers.push(b);
    return new arena_allocation_result_1.ArenaAllocationResult(m.buffers.length - 1, b);
}
exports.allocate = allocate;
function getBuffer(id, m) {
    if (id < 0 || id >= m.buffers.length) {
        throw new Error(util_1.format(errors_1.SEG_ID_OUT_OF_BOUNDS, id));
    }
    return m.buffers[id];
}
exports.getBuffer = getBuffer;
function getNumSegments(m) {
    return m.buffers.length;
}
exports.getNumSegments = getNumSegments;
//# sourceMappingURL=multi-segment-arena.js.map