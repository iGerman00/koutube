/**
 * @author jdiaz5513
 */
import { Uint64 } from "./uint64";
/**
 * Represents a signed 64-bit integer stored using a Uint8Array in little-endian format.
 *
 * You may convert this to a primitive number by calling `toNumber()` but be wary of precision loss!
 *
 * The value passed in as the source buffer is expected to be in little-endian format.
 */
export declare class Int64 extends Uint64 {
    static fromArrayBuffer(source: ArrayBuffer, offset?: number, noCopy?: boolean): Int64;
    static fromDataView(source: DataView, offset?: number, noCopy?: boolean): Int64;
    static fromNumber(source: number): Int64;
    /**
     * Parse a hexadecimal string in **big endian format** as an Int64 value.
     *
     * The value will be negative if the string is either preceded with a `-` sign, or already in the negative 2's
     * complement form.
     *
     * @static
     * @param {string} source The source string.
     * @returns {Int64} The string parsed as a 64-bit signed integer.
     */
    static fromHexString(source: string): Int64;
    static fromUint8Array(source: Uint8Array, offset?: number, noCopy?: boolean): Int64;
    equals(other: Int64): boolean;
    inspect(): string;
    negate(): void;
    setValue(loWord: number, hiWord?: number): void;
    toHexString(): string;
    /**
     * Convert to a native javascript number.
     *
     * WARNING: do not expect this number to be accurate to integer precision for large (positive or negative) numbers!
     *
     * @param {boolean} allowImprecise If `true`, no check is performed to verify the returned value is accurate;
     * otherwise out-of-range values are clamped to +/-Infinity.
     * @returns {number} A numeric representation of this integer.
     */
    toNumber(allowImprecise?: boolean): number;
}
