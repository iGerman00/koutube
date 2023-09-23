/**
 * @author jdiaz5513
 */
/**
 * Represents an unsigned 64-bit integer stored using a Uint8Array in little-endian format. It's a little bit faster
 * than int64 because we don't need to keep track of the sign bit or perform two's compliment operations on set.
 *
 * You may convert this to a primitive number by calling `toNumber()` but be wary of precision loss!
 *
 * Note that overflow is not implemented, so negative numbers passed into `setValue()` will be negated first.
 *
 * The value passed in as the source buffer is expected to be in little-endian format.
 */
export declare class Uint64 {
    readonly buffer: Uint8Array;
    /**
     * Creates a new instance; this is a no-frills constructor for speed. Use the factory methods if you need to convert
     * from other types or use a different offset into the buffer.
     *
     * Will throw if the buffer is not at least 8 bytes long.
     *
     * @constructor
     * @param {Uint8Array} buffer The buffer to use for this 64-bit word; the bytes must be in little-endian order.
     */
    constructor(buffer: Uint8Array);
    static fromArrayBuffer(source: ArrayBuffer, offset?: number, noCopy?: boolean): Uint64;
    static fromDataView(source: DataView, offset?: number, noCopy?: boolean): Uint64;
    /**
     * Parse a hexadecimal string in **big endian format** as a Uint64 value.
     *
     * @static
     * @param {string} source The source string.
     * @returns {Uint64} The string parsed as a 64-bit unsigned integer.
     */
    static fromHexString(source: string): Uint64;
    static fromNumber(source: number): Uint64;
    static fromUint8Array(source: Uint8Array, offset?: number, noCopy?: boolean): Uint64;
    equals(other: Uint64): boolean;
    inspect(): string;
    /**
     * Faster way to check for zero values without converting to a number first.
     *
     * @returns {boolean} `true` if the contained value is zero.
     * @memberOf Uint64
     */
    isZero(): boolean;
    setValue(loWord: number, hiWord?: number): void;
    /**
     * Convert to a native javascript number.
     *
     * WARNING: do not expect this number to be accurate to integer precision for large (positive or negative) numbers!
     *
     * @param {boolean} allowImprecise If `true`, no check is performed to verify the returned value is accurate;
     * otherwise out-of-range values are clamped to +Infinity.
     * @returns {number} A numeric representation of this integer.
     */
    toNumber(allowImprecise?: boolean): number;
    valueOf(): number;
    toArrayBuffer(): ArrayBuffer;
    toDataView(): DataView;
    toHexString(): string;
    toString(radix?: number): string;
    toUint8Array(): Uint8Array;
}
