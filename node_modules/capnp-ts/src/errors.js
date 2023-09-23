"use strict";
/**
 * This file contains all the error strings used in the library. Also contains silliness.
 *
 * @author jdiaz5513
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PTR_WRITE_CONST_STRUCT = exports.PTR_WRITE_CONST_LIST = exports.TYPE_SET_GENERIC_LIST = exports.TYPE_GET_GENERIC_LIST = exports.TYPE_COMPOSITE_SIZE_UNDEFINED = exports.SEG_SIZE_OVERFLOW = exports.SEG_REPLACEMENT_BUFFER_TOO_SMALL = exports.SEG_NOT_WORD_ALIGNED = exports.SEG_ID_OUT_OF_BOUNDS = exports.SEG_GET_NON_ZERO_SINGLE = exports.SEG_BUFFER_NOT_ALLOCATED = exports.RANGE_UINT32_OVERFLOW = exports.RANGE_SIZE_OVERFLOW = exports.RANGE_INVALID_UTF8 = exports.RANGE_INT64_UNDERFLOW = exports.RANGE_INT32_OVERFLOW = exports.PTR_WRONG_STRUCT_PTR_SIZE = exports.PTR_WRONG_STRUCT_DATA_SIZE = exports.PTR_WRONG_COMPOSITE_PTR_SIZE = exports.PTR_WRONG_COMPOSITE_DATA_SIZE = exports.PTR_WRONG_POINTER_TYPE = exports.PTR_WRONG_LIST_TYPE = exports.PTR_TRAVERSAL_LIMIT_EXCEEDED = exports.PTR_STRUCT_POINTER_OUT_OF_BOUNDS = exports.PTR_STRUCT_DATA_OUT_OF_BOUNDS = exports.PTR_OFFSET_OUT_OF_BOUNDS = exports.PTR_INVALID_UNION_ACCESS = exports.PTR_INVALID_POINTER_TYPE = exports.PTR_INVALID_LIST_SIZE = exports.PTR_INVALID_FAR_TARGET = exports.PTR_INIT_NON_GROUP = exports.PTR_INIT_COMPOSITE_STRUCT = exports.PTR_DISOWN_COMPOSITE_STRUCT = exports.PTR_DEPTH_LIMIT_EXCEEDED = exports.PTR_COMPOSITE_SIZE_UNDEFINED = exports.PTR_ALREADY_ADOPTED = exports.PTR_ADOPT_WRONG_MESSAGE = exports.PTR_ADOPT_COMPOSITE_STRUCT = exports.NOT_IMPLEMENTED = exports.MSG_SEGMENT_TOO_SMALL = exports.MSG_SEGMENT_OUT_OF_BOUNDS = exports.MSG_PACK_NOT_WORD_ALIGNED = exports.MSG_NO_SEGMENTS_IN_ARENA = exports.MSG_INVALID_FRAME_HEADER = exports.assertNever = exports.INVARIANT_UNREACHABLE_CODE = void 0;
const tslib_1 = require("tslib");
const debug_1 = tslib_1.__importDefault(require("debug"));
const constants_1 = require("./constants");
const trace = debug_1.default("capnp:errors");
trace("load");
// Invariant violations (sometimes known as "precondition failed").
//
// All right, hold up the brakes. This is a serious 1 === 0 WHAT THE FAILURE moment here. Tell the SO's you won't be
// home for dinner.
exports.INVARIANT_UNREACHABLE_CODE = "CAPNP-TS000 Unreachable code detected.";
function assertNever(n) {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    throw new Error(exports.INVARIANT_UNREACHABLE_CODE + ` (never block hit with: ${n})`);
}
exports.assertNever = assertNever;
// Message errors.
//
// Now who told you it would be a good idea to fuzz the inputs? You just made the program sad.
exports.MSG_INVALID_FRAME_HEADER = "CAPNP-TS001 Attempted to parse an invalid message frame header; are you sure this is a Cap'n Proto message?";
exports.MSG_NO_SEGMENTS_IN_ARENA = "CAPNP-TS002 Attempted to preallocate a message with no segments in the arena.";
exports.MSG_PACK_NOT_WORD_ALIGNED = "CAPNP-TS003 Attempted to pack a message that was not word-aligned.";
exports.MSG_SEGMENT_OUT_OF_BOUNDS = "CAPNP-TS004 Segment ID %X is out of bounds for message %s.";
exports.MSG_SEGMENT_TOO_SMALL = "CAPNP-TS005 First segment must have at least enough room to hold the root pointer (8 bytes).";
// Used for methods that are not yet implemented.
//
// My bad. I'll get to it. Eventually.
exports.NOT_IMPLEMENTED = "CAPNP-TS006 %s is not implemented.";
// Pointer-related errors.
//
// Look, this is probably the hardest part of the code. Cut some slack here! You probably found a bug.
exports.PTR_ADOPT_COMPOSITE_STRUCT = "CAPNP-TS007 Attempted to adopt a struct into a composite list (%s).";
exports.PTR_ADOPT_WRONG_MESSAGE = "CAPNP-TS008 Attempted to adopt %s into a pointer in a different message %s.";
exports.PTR_ALREADY_ADOPTED = "CAPNP-TS009 Attempted to adopt %s more than once.";
exports.PTR_COMPOSITE_SIZE_UNDEFINED = "CAPNP-TS010 Attempted to set a composite list without providing a composite element size.";
exports.PTR_DEPTH_LIMIT_EXCEEDED = "CAPNP-TS011 Nesting depth limit exceeded for %s.";
exports.PTR_DISOWN_COMPOSITE_STRUCT = "CAPNP-TS012 Attempted to disown a struct member from a composite list (%s).";
exports.PTR_INIT_COMPOSITE_STRUCT = "CAPNP-TS013 Attempted to initialize a struct member from a composite list (%s).";
exports.PTR_INIT_NON_GROUP = "CAPNP-TS014 Attempted to initialize a group field with a non-group struct class.";
exports.PTR_INVALID_FAR_TARGET = "CAPNP-TS015 Target of a far pointer (%s) is another far pointer.";
exports.PTR_INVALID_LIST_SIZE = "CAPNP-TS016 Invalid list element size: %x.";
exports.PTR_INVALID_POINTER_TYPE = "CAPNP-TS017 Invalid pointer type: %x.";
exports.PTR_INVALID_UNION_ACCESS = "CAPNP-TS018 Attempted to access getter on %s for union field %s that is not currently set (wanted: %d, found: %d).";
exports.PTR_OFFSET_OUT_OF_BOUNDS = "CAPNP-TS019 Pointer offset %a is out of bounds for underlying buffer.";
exports.PTR_STRUCT_DATA_OUT_OF_BOUNDS = "CAPNP-TS020 Attempted to access out-of-bounds struct data (struct: %s, %d bytes at %a, data words: %d).";
exports.PTR_STRUCT_POINTER_OUT_OF_BOUNDS = "CAPNP-TS021 Attempted to access out-of-bounds struct pointer (%s, index: %d, length: %d).";
exports.PTR_TRAVERSAL_LIMIT_EXCEEDED = "CAPNP-TS022 Traversal limit exceeded! Slow down! %s";
exports.PTR_WRONG_LIST_TYPE = "CAPNP-TS023 Cannot convert %s to a %s list.";
exports.PTR_WRONG_POINTER_TYPE = "CAPNP-TS024 Attempted to convert pointer %s to a %s type.";
exports.PTR_WRONG_COMPOSITE_DATA_SIZE = "CAPNP-TS025 Attempted to convert %s to a composite list with the wrong data size (found: %d).";
exports.PTR_WRONG_COMPOSITE_PTR_SIZE = "CAPNP-TS026 Attempted to convert %s to a composite list with the wrong pointer size (found: %d).";
exports.PTR_WRONG_STRUCT_DATA_SIZE = "CAPNP-TS027 Attempted to convert %s to a struct with the wrong data size (found: %d).";
exports.PTR_WRONG_STRUCT_PTR_SIZE = "CAPNP-TS028 Attempted to convert %s to a struct with the wrong pointer size (found: %d).";
// Custom error messages for the built-in `RangeError` class.
//
// You don't get a witty comment with these.
exports.RANGE_INT32_OVERFLOW = "CAPNP-TS029 32-bit signed integer overflow detected.";
exports.RANGE_INT64_UNDERFLOW = "CAPNP-TS030 Buffer is not large enough to hold a word.";
exports.RANGE_INVALID_UTF8 = "CAPNP-TS031 Invalid UTF-8 code sequence detected.";
exports.RANGE_SIZE_OVERFLOW = `CAPNP-TS032 Size %x exceeds maximum ${constants_1.MAX_SEGMENT_LENGTH.toString(16)}.`;
exports.RANGE_UINT32_OVERFLOW = "CAPNP-TS033 32-bit unsigned integer overflow detected.";
// Segment-related errors.
//
// These suck. Deal with it.
exports.SEG_BUFFER_NOT_ALLOCATED = "CAPNP-TS034 allocate() needs to be called at least once before getting a buffer.";
exports.SEG_GET_NON_ZERO_SINGLE = "CAPNP-TS035 Attempted to get a segment other than 0 (%d) from a single segment arena.";
exports.SEG_ID_OUT_OF_BOUNDS = "CAPNP-TS036 Attempted to get an out-of-bounds segment (%d).";
exports.SEG_NOT_WORD_ALIGNED = "CAPNP-TS037 Segment buffer length %d is not a multiple of 8.";
exports.SEG_REPLACEMENT_BUFFER_TOO_SMALL = "CAPNP-TS038 Attempted to replace a segment buffer with one that is smaller than the allocated space.";
exports.SEG_SIZE_OVERFLOW = `CAPNP-TS039 Requested size %x exceeds maximum value (${constants_1.MAX_SEGMENT_LENGTH}).`;
// Custom error messages for the built-in `TypeError` class.
//
// If it looks like a duck, quacks like an elephant, and has hooves for feet, it's probably JavaScript.
exports.TYPE_COMPOSITE_SIZE_UNDEFINED = "CAPNP-TS040 Must provide a composite element size for composite list pointers.";
exports.TYPE_GET_GENERIC_LIST = "CAPNP-TS041 Attempted to call get() on a generic list.";
exports.TYPE_SET_GENERIC_LIST = "CAPNP-TS042 Attempted to call set() on a generic list.";
exports.PTR_WRITE_CONST_LIST = "CAPNP-TS043 Attempted to write to a const list.";
exports.PTR_WRITE_CONST_STRUCT = "CAPNP-TS044 Attempted to write to a const struct.";
//# sourceMappingURL=errors.js.map