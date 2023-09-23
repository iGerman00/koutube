"use strict";
/**
 * @author jdiaz5513
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNumSegments = exports.getBuffer = exports.allocate = exports.SingleSegmentArena = void 0;
const tslib_1 = require("tslib");
const debug_1 = tslib_1.__importDefault(require("debug"));
const constants_1 = require("../../constants");
const errors_1 = require("../../errors");
const util_1 = require("../../util");
const arena_allocation_result_1 = require("./arena-allocation-result");
const arena_kind_1 = require("./arena-kind");
const trace = debug_1.default("capnp:arena:single");
trace("load");
class SingleSegmentArena {
    constructor(buffer = new ArrayBuffer(constants_1.DEFAULT_BUFFER_SIZE)) {
        this.kind = arena_kind_1.ArenaKind.SINGLE_SEGMENT;
        if ((buffer.byteLength & 7) !== 0) {
            throw new Error(util_1.format(errors_1.SEG_NOT_WORD_ALIGNED, buffer.byteLength));
        }
        this.buffer = buffer;
        trace("new %s", this);
    }
    toString() {
        return util_1.format("SingleSegmentArena_len:%x", this.buffer.byteLength);
    }
}
exports.SingleSegmentArena = SingleSegmentArena;
SingleSegmentArena.allocate = allocate;
SingleSegmentArena.getBuffer = getBuffer;
SingleSegmentArena.getNumSegments = getNumSegments;
function allocate(minSize, segments, s) {
    trace("Allocating %x bytes for segment 0 in %s.", minSize, s);
    const srcBuffer = segments.length > 0 ? segments[0].buffer : s.buffer;
    if (minSize < constants_1.MIN_SINGLE_SEGMENT_GROWTH) {
        minSize = constants_1.MIN_SINGLE_SEGMENT_GROWTH;
    }
    else {
        minSize = util_1.padToWord(minSize);
    }
    s.buffer = new ArrayBuffer(srcBuffer.byteLength + minSize);
    // PERF: Assume that the source and destination buffers are word-aligned and use Float64Array to copy them one word
    // at a time.
    new Float64Array(s.buffer).set(new Float64Array(srcBuffer));
    return new arena_allocation_result_1.ArenaAllocationResult(0, s.buffer);
}
exports.allocate = allocate;
function getBuffer(id, s) {
    if (id !== 0)
        throw new Error(util_1.format(errors_1.SEG_GET_NON_ZERO_SINGLE, id));
    return s.buffer;
}
exports.getBuffer = getBuffer;
function getNumSegments() {
    return 1;
}
exports.getNumSegments = getNumSegments;
//# sourceMappingURL=single-segment-arena.js.map