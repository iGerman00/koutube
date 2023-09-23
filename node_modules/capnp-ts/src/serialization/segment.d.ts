/**
 * @author jdiaz5513
 */
import { Int64, Uint64 } from "../types";
import { Message } from "./message";
import { Pointer } from "./pointers";
export declare class Segment implements DataView {
    buffer: ArrayBuffer;
    /** The number of bytes currently allocated in the segment. */
    byteLength: number;
    /**
     * This value should always be zero. It's only here to satisfy the DataView interface.
     *
     * In the future the Segment implementation (or a child class) may allow accessing the buffer from a nonzero offset,
     * but that adds a lot of extra arithmetic.
     */
    byteOffset: number;
    readonly [Symbol.toStringTag]: "DataView";
    readonly id: number;
    readonly message: Message;
    private _dv;
    constructor(id: number, message: Message, buffer: ArrayBuffer, byteLength?: number);
    /**
     * Attempt to allocate the requested number of bytes in this segment. If this segment is full this method will return
     * a pointer to freshly allocated space in another segment from the same message.
     *
     * @param {number} byteLength The number of bytes to allocate, will be rounded up to the nearest word.
     * @returns {Pointer} A pointer to the newly allocated space.
     */
    allocate(byteLength: number): Pointer;
    /**
     * Quickly copy a word (8 bytes) from `srcSegment` into this one at the given offset.
     *
     * @param {number} byteOffset The offset to write the word to.
     * @param {Segment} srcSegment The segment to copy the word from.
     * @param {number} srcByteOffset The offset from the start of `srcSegment` to copy from.
     * @returns {void}
     */
    copyWord(byteOffset: number, srcSegment: Segment, srcByteOffset: number): void;
    /**
     * Quickly copy words from `srcSegment` into this one.
     *
     * @param {number} byteOffset The offset to start copying into.
     * @param {Segment} srcSegment The segment to copy from.
     * @param {number} srcByteOffset The start offset to copy from.
     * @param {number} wordLength The number of words to copy.
     * @returns {void}
     */
    copyWords(byteOffset: number, srcSegment: Segment, srcByteOffset: number, wordLength: number): void;
    /**
     * Quickly fill a number of words in the buffer with zeroes.
     *
     * @param {number} byteOffset The first byte to set to zero.
     * @param {number} wordLength The number of words (not bytes!) to zero out.
     * @returns {void}
     */
    fillZeroWords(byteOffset: number, wordLength: number): void;
    /** WARNING: This function is not yet implemented. */
    getBigInt64(byteOffset: number, littleEndian?: boolean): bigint;
    /** WARNING: This function is not yet implemented. */
    getBigUint64(byteOffset: number, littleEndian?: boolean): bigint;
    /**
     * Get the total number of bytes available in this segment (the size of its underlying buffer).
     *
     * @returns {number} The total number of bytes this segment can hold.
     */
    getCapacity(): number;
    /**
     * Read a float32 value out of this segment.
     *
     * @param {number} byteOffset The offset in bytes to the value.
     * @returns {number} The value.
     */
    getFloat32(byteOffset: number): number;
    /**
     * Read a float64 value out of this segment.
     *
     * @param {number} byteOffset The offset in bytes to the value.
     * @returns {number} The value.
     */
    getFloat64(byteOffset: number): number;
    /**
     * Read an int16 value out of this segment.
     *
     * @param {number} byteOffset The offset in bytes to the value.
     * @returns {number} The value.
     */
    getInt16(byteOffset: number): number;
    /**
     * Read an int32 value out of this segment.
     *
     * @param {number} byteOffset The offset in bytes to the value.
     * @returns {number} The value.
     */
    getInt32(byteOffset: number): number;
    /**
     * Read an int64 value out of this segment.
     *
     * @param {number} byteOffset The offset in bytes to the value.
     * @returns {number} The value.
     */
    getInt64(byteOffset: number): Int64;
    /**
     * Read an int8 value out of this segment.
     *
     * @param {number} byteOffset The offset in bytes to the value.
     * @returns {number} The value.
     */
    getInt8(byteOffset: number): number;
    /**
     * Read a uint16 value out of this segment.
     *
     * @param {number} byteOffset The offset in bytes to the value.
     * @returns {number} The value.
     */
    getUint16(byteOffset: number): number;
    /**
     * Read a uint32 value out of this segment.
     *
     * @param {number} byteOffset The offset in bytes to the value.
     * @returns {number} The value.
     */
    getUint32(byteOffset: number): number;
    /**
     * Read a uint8 value out of this segment.
     * NOTE: this does not copy the memory region, so updates to the underlying buffer will affect the Uint64 value!
     *
     * @param {number} byteOffset The offset in bytes to the value.
     * @returns {number} The value.
     */
    getUint64(byteOffset: number): Uint64;
    /**
     * Read a uint8 value out of this segment.
     *
     * @param {number} byteOffset The offset in bytes to the value.
     * @returns {number} The value.
     */
    getUint8(byteOffset: number): number;
    hasCapacity(byteLength: number): boolean;
    /**
     * Quickly check the word at the given offset to see if it is equal to zero.
     *
     * PERF_V8: Fastest way to do this is by reading the whole word as a `number` (float64) in the _native_ endian format
     * and see if it's zero.
     *
     * Benchmark: http://jsben.ch/#/Pjooc
     *
     * @param {number} byteOffset The offset to the word.
     * @returns {boolean} `true` if the word is zero.
     */
    isWordZero(byteOffset: number): boolean;
    /**
     * Swap out this segment's underlying buffer with a new one. It's assumed that the new buffer has the same content but
     * more free space, otherwise all existing pointers to this segment will be hilariously broken.
     *
     * @param {ArrayBuffer} buffer The new buffer to use.
     * @returns {void}
     */
    replaceBuffer(buffer: ArrayBuffer): void;
    /** WARNING: This function is not yet implemented.  */
    setBigInt64(byteOffset: number, value: bigint, littleEndian?: boolean): void;
    /** WARNING: This function is not yet implemented.  */
    setBigUint64(byteOffset: number, value: bigint, littleEndian?: boolean): void;
    /**
     * Write a float32 value to the specified offset.
     *
     * @param {number} byteOffset The offset from the beginning of the buffer.
     * @param {number} val The value to store.
     * @returns {void}
     */
    setFloat32(byteOffset: number, val: number): void;
    /**
     * Write an float64 value to the specified offset.
     *
     * @param {number} byteOffset The offset from the beginning of the buffer.
     * @param {number} val The value to store.
     * @returns {void}
     */
    setFloat64(byteOffset: number, val: number): void;
    /**
     * Write an int16 value to the specified offset.
     *
     * @param {number} byteOffset The offset from the beginning of the buffer.
     * @param {number} val The value to store.
     * @returns {void}
     */
    setInt16(byteOffset: number, val: number): void;
    /**
     * Write an int32 value to the specified offset.
     *
     * @param {number} byteOffset The offset from the beginning of the buffer.
     * @param {number} val The value to store.
     * @returns {void}
     */
    setInt32(byteOffset: number, val: number): void;
    /**
     * Write an int8 value to the specified offset.
     *
     * @param {number} byteOffset The offset from the beginning of the buffer.
     * @param {number} val The value to store.
     * @returns {void}
     */
    setInt8(byteOffset: number, val: number): void;
    /**
     * Write an int64 value to the specified offset.
     *
     * @param {number} byteOffset The offset from the beginning of the buffer.
     * @param {Int64} val The value to store.
     * @returns {void}
     */
    setInt64(byteOffset: number, val: Int64): void;
    /**
     * Write a uint16 value to the specified offset.
     *
     * @param {number} byteOffset The offset from the beginning of the buffer.
     * @param {number} val The value to store.
     * @returns {void}
     */
    setUint16(byteOffset: number, val: number): void;
    /**
     * Write a uint32 value to the specified offset.
     *
     * @param {number} byteOffset The offset from the beginning of the buffer.
     * @param {number} val The value to store.
     * @returns {void}
     */
    setUint32(byteOffset: number, val: number): void;
    /**
     * Write a uint64 value to the specified offset.
     * TODO: benchmark other ways to perform this write operation.
     *
     * @param {number} byteOffset The offset from the beginning of the buffer.
     * @param {Uint64} val The value to store.
     * @returns {void}
     */
    setUint64(byteOffset: number, val: Uint64): void;
    /**
     * Write a uint8 (byte) value to the specified offset.
     *
     * @param {number} byteOffset The offset from the beginning of the buffer.
     * @param {number} val The value to store.
     * @returns {void}
     */
    setUint8(byteOffset: number, val: number): void;
    /**
     * Write a zero word (8 bytes) to the specified offset. This is slightly faster than calling `setUint64` or
     * `setFloat64` with a zero value.
     *
     * Benchmark: http://jsben.ch/#/dUdPI
     *
     * @param {number} byteOffset The offset of the word to set to zero.
     * @returns {void}
     */
    setWordZero(byteOffset: number): void;
    toString(): string;
}
