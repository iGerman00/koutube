"use strict";
/**
 * @author jdiaz5513
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStreamFrame = exports.toPackedArrayBuffer = exports.toArrayBuffer = exports.setRoot = exports.readRawPointer = exports.initRoot = exports.getSegment = exports.getRoot = exports.dump = exports.allocateSegment = exports.preallocateSegments = exports.getFramedSegments = exports.initMessage = exports.Message = void 0;
const tslib_1 = require("tslib");
const debug_1 = tslib_1.__importDefault(require("debug"));
const constants_1 = require("../constants");
const errors_1 = require("../errors");
const util_1 = require("../util");
const arena_1 = require("./arena");
const packing_1 = require("./packing");
const pointers_1 = require("./pointers");
const segment_1 = require("./segment");
const pointer_1 = require("./pointers/pointer");
const struct_1 = require("./pointers/struct");
const trace = debug_1.default("capnp:message");
trace("load");
class Message {
    /**
     * A Cap'n Proto message.
     *
     * SECURITY WARNING: In nodejs do not pass a Buffer's internal array buffer into this constructor. Pass the buffer
     * directly and everything will be fine. If not, your message will potentially be initialized with random memory
     * contents!
     *
     * The constructor method creates a new Message, optionally using a provided arena for segment allocation, or a buffer
     * to read from.
     *
     * @constructor {Message}
     *
     * @param {AnyArena|ArrayBufferView|ArrayBuffer} [src] The source for the message.
     * A value of `undefined` will cause the message to initialize with a single segment arena only big enough for the
     * root pointer; it will expand as you go. This is a reasonable choice for most messages.
     *
     * Passing an arena will cause the message to use that arena for its segment allocation. Contents will be accepted
     * as-is.
     *
     * Passing an array buffer view (like `DataView`, `Uint8Array` or `Buffer`) will create a **copy** of the source
     * buffer; beware of the potential performance cost!
     *
     * @param {boolean} [packed] Whether or not the message is packed. If `true` (the default), the message will be
     * unpacked.
     *
     * @param {boolean} [singleSegment] If true, `src` will be treated as a message consisting of a single segment without
     * a framing header.
     *
     */
    constructor(src, packed = true, singleSegment = false) {
        this._capnp = initMessage(src, packed, singleSegment);
        if (src && !isAnyArena(src))
            preallocateSegments(this);
        trace("new %s", this);
    }
    allocateSegment(byteLength) {
        return allocateSegment(byteLength, this);
    }
    /**
     * Create a pretty-printed string dump of this message; incredibly useful for debugging.
     *
     * WARNING: Do not call this method on large messages!
     *
     * @returns {string} A big steaming pile of pretty hex digits.
     */
    dump() {
        return dump(this);
    }
    /**
     * Get a struct pointer for the root of this message. This is primarily used when reading a message; it will not
     * overwrite existing data.
     *
     * @template T
     * @param {StructCtor<T>} RootStruct The struct type to use as the root.
     * @returns {T} A struct representing the root of the message.
     */
    getRoot(RootStruct) {
        return getRoot(RootStruct, this);
    }
    /**
     * Get a segment by its id.
     *
     * This will lazily allocate the first segment if it doesn't already exist.
     *
     * @param {number} id The segment id.
     * @returns {Segment} The requested segment.
     */
    getSegment(id) {
        return getSegment(id, this);
    }
    /**
     * Initialize a new message using the provided struct type as the root.
     *
     * @template T
     * @param {StructCtor<T>} RootStruct The struct type to use as the root.
     * @returns {T} An initialized struct pointing to the root of the message.
     */
    initRoot(RootStruct) {
        return initRoot(RootStruct, this);
    }
    /**
     * Set the root of the message to a copy of the given pointer. Used internally
     * to make copies of pointers for default values.
     *
     * @param {Pointer} src The source pointer to copy.
     * @returns {void}
     */
    setRoot(src) {
        setRoot(src, this);
    }
    /**
     * Combine the contents of this message's segments into a single array buffer and prepend a stream framing header
     * containing information about the following segment data.
     *
     * @returns {ArrayBuffer} An ArrayBuffer with the contents of this message.
     */
    toArrayBuffer() {
        return toArrayBuffer(this);
    }
    /**
     * Like `toArrayBuffer()`, but also applies the packing algorithm to the output. This is typically what you want to
     * use if you're sending the message over a network link or other slow I/O interface where size matters.
     *
     * @returns {ArrayBuffer} A packed message.
     */
    toPackedArrayBuffer() {
        return toPackedArrayBuffer(this);
    }
    toString() {
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        return `Message_arena:${this._capnp.arena}`;
    }
}
exports.Message = Message;
Message.allocateSegment = allocateSegment;
Message.dump = dump;
Message.getRoot = getRoot;
Message.getSegment = getSegment;
Message.initRoot = initRoot;
Message.readRawPointer = readRawPointer;
Message.toArrayBuffer = toArrayBuffer;
Message.toPackedArrayBuffer = toPackedArrayBuffer;
function initMessage(src, packed = true, singleSegment = false) {
    if (src === undefined) {
        return {
            arena: new arena_1.SingleSegmentArena(),
            segments: [],
            traversalLimit: constants_1.DEFAULT_TRAVERSE_LIMIT,
        };
    }
    if (isAnyArena(src)) {
        return { arena: src, segments: [], traversalLimit: constants_1.DEFAULT_TRAVERSE_LIMIT };
    }
    let buf = src;
    if (isArrayBufferView(buf)) {
        buf = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
    }
    if (packed)
        buf = packing_1.unpack(buf);
    if (singleSegment) {
        return {
            arena: new arena_1.SingleSegmentArena(buf),
            segments: [],
            traversalLimit: constants_1.DEFAULT_TRAVERSE_LIMIT,
        };
    }
    return {
        arena: new arena_1.MultiSegmentArena(getFramedSegments(buf)),
        segments: [],
        traversalLimit: constants_1.DEFAULT_TRAVERSE_LIMIT,
    };
}
exports.initMessage = initMessage;
/**
 * Given an _unpacked_ message with a segment framing header, this will generate an ArrayBuffer for each segment in
 * the message.
 *
 * This method is not typically called directly, but can be useful in certain cases.
 *
 * @static
 * @param {ArrayBuffer} message An unpacked message with a framing header.
 * @returns {ArrayBuffer[]} An array of buffers containing the segment data.
 */
function getFramedSegments(message) {
    const dv = new DataView(message);
    const segmentCount = dv.getUint32(0, true) + 1;
    const segments = new Array(segmentCount);
    trace("reading %d framed segments from stream", segmentCount);
    let byteOffset = 4 + segmentCount * 4;
    byteOffset += byteOffset % 8;
    if (byteOffset + segmentCount * 4 > message.byteLength) {
        throw new Error(errors_1.MSG_INVALID_FRAME_HEADER);
    }
    for (let i = 0; i < segmentCount; i++) {
        const byteLength = dv.getUint32(4 + i * 4, true) * 8;
        if (byteOffset + byteLength > message.byteLength) {
            throw new Error(errors_1.MSG_INVALID_FRAME_HEADER);
        }
        segments[i] = message.slice(byteOffset, byteOffset + byteLength);
        byteOffset += byteLength;
    }
    return segments;
}
exports.getFramedSegments = getFramedSegments;
/**
 * This method is called on messages that were constructed with existing data to prepopulate the segments array with
 * everything we can find in the arena. Each segment will have it's `byteLength` set to the size of its buffer.
 *
 * Technically speaking, the message's segments will be "full" after calling this function. Calling this on your own
 * may void your warranty.
 *
 * @param {Message} m The message to allocate.
 * @returns {void}
 */
function preallocateSegments(m) {
    const numSegments = arena_1.Arena.getNumSegments(m._capnp.arena);
    if (numSegments < 1)
        throw new Error(errors_1.MSG_NO_SEGMENTS_IN_ARENA);
    m._capnp.segments = new Array(numSegments);
    for (let i = 0; i < numSegments; i++) {
        // Set up each segment so that they're fully allocated to the extents of the existing buffers.
        const buffer = arena_1.Arena.getBuffer(i, m._capnp.arena);
        const segment = new segment_1.Segment(i, m, buffer, buffer.byteLength);
        m._capnp.segments[i] = segment;
    }
}
exports.preallocateSegments = preallocateSegments;
function isArrayBufferView(src) {
    return src.byteOffset !== undefined;
}
function isAnyArena(o) {
    return o.kind !== undefined;
}
function allocateSegment(byteLength, m) {
    trace("allocating %x bytes for %s", byteLength, m);
    const res = arena_1.Arena.allocate(byteLength, m._capnp.segments, m._capnp.arena);
    let s;
    if (res.id === m._capnp.segments.length) {
        // Note how we're only allowing new segments in if they're exactly the next one in the array. There is no logical
        // reason for segments to be created out of order.
        s = new segment_1.Segment(res.id, m, res.buffer);
        trace("adding new segment %s", s);
        m._capnp.segments.push(s);
    }
    else if (res.id < 0 || res.id > m._capnp.segments.length) {
        throw new Error(util_1.format(errors_1.MSG_SEGMENT_OUT_OF_BOUNDS, res.id, m));
    }
    else {
        s = m._capnp.segments[res.id];
        trace("replacing segment %s with buffer (len:%d)", s, res.buffer.byteLength);
        s.replaceBuffer(res.buffer);
    }
    return s;
}
exports.allocateSegment = allocateSegment;
function dump(m) {
    let r = "";
    if (m._capnp.segments.length === 0) {
        return "================\nNo Segments\n================\n";
    }
    for (let i = 0; i < m._capnp.segments.length; i++) {
        r += `================\nSegment #${i}\n================\n`;
        const { buffer, byteLength } = m._capnp.segments[i];
        const b = new Uint8Array(buffer, 0, byteLength);
        r += util_1.dumpBuffer(b);
    }
    return r;
}
exports.dump = dump;
function getRoot(RootStruct, m) {
    const root = new RootStruct(m.getSegment(0), 0);
    pointer_1.validate(pointers_1.PointerType.STRUCT, root);
    const ts = pointer_1.getTargetStructSize(root);
    // Make sure the underlying pointer is actually big enough to hold the data and pointers as specified in the schema.
    // If not a shallow copy of the struct contents needs to be made before returning.
    if (ts.dataByteLength < RootStruct._capnp.size.dataByteLength ||
        ts.pointerLength < RootStruct._capnp.size.pointerLength) {
        trace("need to resize root struct %s", root);
        struct_1.resize(RootStruct._capnp.size, root);
    }
    return root;
}
exports.getRoot = getRoot;
function getSegment(id, m) {
    const segmentLength = m._capnp.segments.length;
    if (id === 0 && segmentLength === 0) {
        // Segment zero is special. If we have no segments in the arena we'll want to allocate a new one and leave room
        // for the root pointer.
        const arenaSegments = arena_1.Arena.getNumSegments(m._capnp.arena);
        if (arenaSegments === 0) {
            allocateSegment(constants_1.DEFAULT_BUFFER_SIZE, m);
        }
        else {
            // Okay, the arena already has a buffer we can use. This is totally fine.
            m._capnp.segments[0] = new segment_1.Segment(0, m, arena_1.Arena.getBuffer(0, m._capnp.arena));
        }
        if (!m._capnp.segments[0].hasCapacity(8)) {
            throw new Error(errors_1.MSG_SEGMENT_TOO_SMALL);
        }
        // This will leave room for the root pointer.
        m._capnp.segments[0].allocate(8);
        return m._capnp.segments[0];
    }
    if (id < 0 || id >= segmentLength) {
        throw new Error(util_1.format(errors_1.MSG_SEGMENT_OUT_OF_BOUNDS, id, m));
    }
    return m._capnp.segments[id];
}
exports.getSegment = getSegment;
function initRoot(RootStruct, m) {
    const root = new RootStruct(m.getSegment(0), 0);
    struct_1.initStruct(RootStruct._capnp.size, root);
    trace("Initialized root pointer %s for %s.", root, m);
    return root;
}
exports.initRoot = initRoot;
/**
 * Read a pointer in raw form (a packed message with framing headers). Does not
 * care or attempt to validate the input beyond parsing the message
 * segments.
 *
 * This is typically used by the compiler to load default values, but can be
 * useful to work with messages with an unknown schema.
 *
 * @param {ArrayBuffer} data The raw data to read.
 * @returns {Pointer} A root pointer.
 */
function readRawPointer(data) {
    return new pointers_1.Pointer(new Message(data).getSegment(0), 0);
}
exports.readRawPointer = readRawPointer;
function setRoot(src, m) {
    pointers_1.Pointer.copyFrom(src, new pointers_1.Pointer(m.getSegment(0), 0));
}
exports.setRoot = setRoot;
function toArrayBuffer(m) {
    const streamFrame = getStreamFrame(m);
    // Make sure the first segment is allocated.
    if (m._capnp.segments.length === 0)
        getSegment(0, m);
    const segments = m._capnp.segments;
    // Add space for the stream framing.
    const totalLength = streamFrame.byteLength + segments.reduce((l, s) => l + util_1.padToWord(s.byteLength), 0);
    const out = new Uint8Array(new ArrayBuffer(totalLength));
    let o = streamFrame.byteLength;
    out.set(new Uint8Array(streamFrame));
    segments.forEach((s) => {
        const segmentLength = util_1.padToWord(s.byteLength);
        out.set(new Uint8Array(s.buffer, 0, segmentLength), o);
        o += segmentLength;
    });
    return out.buffer;
}
exports.toArrayBuffer = toArrayBuffer;
function toPackedArrayBuffer(m) {
    const streamFrame = packing_1.pack(getStreamFrame(m));
    // Make sure the first segment is allocated.
    if (m._capnp.segments.length === 0)
        m.getSegment(0);
    // NOTE: A copy operation can be avoided here if we capture the intermediate array and use that directly in the copy
    // loop below, rather than have `pack()` copy it to an ArrayBuffer just to have to copy it again later. If the
    // intermediate array can be avoided altogether that's even better!
    const segments = m._capnp.segments.map((s) => packing_1.pack(s.buffer, 0, util_1.padToWord(s.byteLength)));
    const totalLength = streamFrame.byteLength + segments.reduce((l, s) => l + s.byteLength, 0);
    const out = new Uint8Array(new ArrayBuffer(totalLength));
    let o = streamFrame.byteLength;
    out.set(new Uint8Array(streamFrame));
    segments.forEach((s) => {
        out.set(new Uint8Array(s), o);
        o += s.byteLength;
    });
    return out.buffer;
}
exports.toPackedArrayBuffer = toPackedArrayBuffer;
function getStreamFrame(m) {
    const length = m._capnp.segments.length;
    if (length === 0) {
        // Don't bother allocating the first segment, just return a single zero word for the frame header.
        return new Float64Array(1).buffer;
    }
    const frameLength = 4 + length * 4 + (1 - (length % 2)) * 4;
    const out = new DataView(new ArrayBuffer(frameLength));
    trace("Writing message stream frame with segment count: %d.", length);
    out.setUint32(0, length - 1, true);
    m._capnp.segments.forEach((s, i) => {
        trace("Message segment %d word count: %d.", s.id, s.byteLength / 8);
        out.setUint32(i * 4 + 4, s.byteLength / 8, true);
    });
    return out.buffer;
}
exports.getStreamFrame = getStreamFrame;
//# sourceMappingURL=message.js.map