/**
 * @author jdiaz5513
 */
import { AnyArena } from "./arena";
import { Pointer, StructCtor, Struct } from "./pointers";
import { Segment } from "./segment";
export interface _Message {
    readonly arena: AnyArena;
    segments: Segment[];
    traversalLimit: number;
}
export declare class Message {
    static readonly allocateSegment: typeof allocateSegment;
    static readonly dump: typeof dump;
    static readonly getRoot: typeof getRoot;
    static readonly getSegment: typeof getSegment;
    static readonly initRoot: typeof initRoot;
    static readonly readRawPointer: typeof readRawPointer;
    static readonly toArrayBuffer: typeof toArrayBuffer;
    static readonly toPackedArrayBuffer: typeof toPackedArrayBuffer;
    readonly _capnp: _Message;
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
    constructor(src?: AnyArena | ArrayBufferView | ArrayBuffer, packed?: boolean, singleSegment?: boolean);
    allocateSegment(byteLength: number): Segment;
    /**
     * Create a pretty-printed string dump of this message; incredibly useful for debugging.
     *
     * WARNING: Do not call this method on large messages!
     *
     * @returns {string} A big steaming pile of pretty hex digits.
     */
    dump(): string;
    /**
     * Get a struct pointer for the root of this message. This is primarily used when reading a message; it will not
     * overwrite existing data.
     *
     * @template T
     * @param {StructCtor<T>} RootStruct The struct type to use as the root.
     * @returns {T} A struct representing the root of the message.
     */
    getRoot<T extends Struct>(RootStruct: StructCtor<T>): T;
    /**
     * Get a segment by its id.
     *
     * This will lazily allocate the first segment if it doesn't already exist.
     *
     * @param {number} id The segment id.
     * @returns {Segment} The requested segment.
     */
    getSegment(id: number): Segment;
    /**
     * Initialize a new message using the provided struct type as the root.
     *
     * @template T
     * @param {StructCtor<T>} RootStruct The struct type to use as the root.
     * @returns {T} An initialized struct pointing to the root of the message.
     */
    initRoot<T extends Struct>(RootStruct: StructCtor<T>): T;
    /**
     * Set the root of the message to a copy of the given pointer. Used internally
     * to make copies of pointers for default values.
     *
     * @param {Pointer} src The source pointer to copy.
     * @returns {void}
     */
    setRoot(src: Pointer): void;
    /**
     * Combine the contents of this message's segments into a single array buffer and prepend a stream framing header
     * containing information about the following segment data.
     *
     * @returns {ArrayBuffer} An ArrayBuffer with the contents of this message.
     */
    toArrayBuffer(): ArrayBuffer;
    /**
     * Like `toArrayBuffer()`, but also applies the packing algorithm to the output. This is typically what you want to
     * use if you're sending the message over a network link or other slow I/O interface where size matters.
     *
     * @returns {ArrayBuffer} A packed message.
     */
    toPackedArrayBuffer(): ArrayBuffer;
    toString(): string;
}
export interface CreateMessageOptions {
    packed?: boolean;
    singleSegment?: boolean;
}
export declare function initMessage(src?: AnyArena | ArrayBufferView | ArrayBuffer, packed?: boolean, singleSegment?: boolean): _Message;
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
export declare function getFramedSegments(message: ArrayBuffer): ArrayBuffer[];
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
export declare function preallocateSegments(m: Message): void;
export declare function allocateSegment(byteLength: number, m: Message): Segment;
export declare function dump(m: Message): string;
export declare function getRoot<T extends Struct>(RootStruct: StructCtor<T>, m: Message): T;
export declare function getSegment(id: number, m: Message): Segment;
export declare function initRoot<T extends Struct>(RootStruct: StructCtor<T>, m: Message): T;
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
export declare function readRawPointer(data: ArrayBuffer): Pointer;
export declare function setRoot(src: Pointer, m: Message): void;
export declare function toArrayBuffer(m: Message): ArrayBuffer;
export declare function toPackedArrayBuffer(m: Message): ArrayBuffer;
export declare function getStreamFrame(m: Message): ArrayBuffer;
