/**
 * @author jdiaz5513
 */
import { List } from "./list";
import { Pointer } from "./pointer";
/**
 * A generic blob of bytes. Can be converted to a DataView or Uint8Array to access its contents using `toDataView()` and
 * `toUint8Array()`. Use `copyBuffer()` to copy an entire buffer at once.
 *
 * @export
 * @class Data
 * @extends {List<number>}
 */
export declare class Data extends List<number> {
    static fromPointer(pointer: Pointer): Data;
    protected static _fromPointerUnchecked(pointer: Pointer): Data;
    /**
     * Copy the contents of `src` into this Data pointer. If `src` is smaller than the length of this pointer then the
     * remaining bytes will be zeroed out. Extra bytes in `src` are ignored.
     *
     * @param {(ArrayBuffer | ArrayBufferView)} src The source buffer.
     * @returns {void}
     */
    copyBuffer(src: ArrayBuffer | ArrayBufferView): void;
    /**
     * Read a byte from the specified offset.
     *
     * @param {number} byteOffset The byte offset to read.
     * @returns {number} The byte value.
     */
    get(byteOffset: number): number;
    /**
     * Write a byte at the specified offset.
     *
     * @param {number} byteOffset The byte offset to set.
     * @param {number} value The byte value to set.
     * @returns {void}
     */
    set(byteOffset: number, value: number): void;
    /**
     * Creates a **copy** of the underlying buffer data and returns it as an ArrayBuffer.
     *
     * To obtain a reference to the underlying buffer instead, use `toUint8Array()` or `toDataView()`.
     *
     * @returns {ArrayBuffer} A copy of this data buffer.
     */
    toArrayBuffer(): ArrayBuffer;
    /**
     * Convert this Data pointer to a DataView representing the pointer's contents.
     *
     * WARNING: The DataView references memory from a message segment, so do not venture outside the bounds of the
     * DataView or else BAD THINGS.
     *
     * @returns {DataView} A live reference to the underlying buffer.
     */
    toDataView(): DataView;
    toString(): string;
    /**
     * Convert this Data pointer to a Uint8Array representing the pointer's contents.
     *
     * WARNING: The Uint8Array references memory from a message segment, so do not venture outside the bounds of the
     * Uint8Array or else BAD THINGS.
     *
     * @returns {DataView} A live reference to the underlying buffer.
     */
    toUint8Array(): Uint8Array;
}
