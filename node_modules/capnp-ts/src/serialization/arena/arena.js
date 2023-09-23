"use strict";
/**
 * @author jdiaz5513
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNumSegments = exports.getBuffer = exports.allocate = exports.Arena = void 0;
const tslib_1 = require("tslib");
const debug_1 = tslib_1.__importDefault(require("debug"));
const errors_1 = require("../../errors");
const arena_kind_1 = require("./arena-kind");
const multi_segment_arena_1 = require("./multi-segment-arena");
const single_segment_arena_1 = require("./single-segment-arena");
const trace = debug_1.default("capnp:arena");
trace("load");
class Arena {
}
exports.Arena = Arena;
Arena.allocate = allocate;
Arena.getBuffer = getBuffer;
Arena.getNumSegments = getNumSegments;
function allocate(minSize, segments, a) {
    switch (a.kind) {
        case arena_kind_1.ArenaKind.MULTI_SEGMENT:
            return multi_segment_arena_1.MultiSegmentArena.allocate(minSize, a);
        case arena_kind_1.ArenaKind.SINGLE_SEGMENT:
            return single_segment_arena_1.SingleSegmentArena.allocate(minSize, segments, a);
        default:
            return errors_1.assertNever(a);
    }
}
exports.allocate = allocate;
function getBuffer(id, a) {
    switch (a.kind) {
        case arena_kind_1.ArenaKind.MULTI_SEGMENT:
            return multi_segment_arena_1.MultiSegmentArena.getBuffer(id, a);
        case arena_kind_1.ArenaKind.SINGLE_SEGMENT:
            return single_segment_arena_1.SingleSegmentArena.getBuffer(id, a);
        default:
            return errors_1.assertNever(a);
    }
}
exports.getBuffer = getBuffer;
function getNumSegments(a) {
    switch (a.kind) {
        case arena_kind_1.ArenaKind.MULTI_SEGMENT:
            return multi_segment_arena_1.MultiSegmentArena.getNumSegments(a);
        case arena_kind_1.ArenaKind.SINGLE_SEGMENT:
            return single_segment_arena_1.SingleSegmentArena.getNumSegments();
        default:
            return errors_1.assertNever(a);
    }
}
exports.getNumSegments = getNumSegments;
//# sourceMappingURL=arena.js.map