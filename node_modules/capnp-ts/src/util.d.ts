/**
 * @author jdiaz5513
 */
/**
 * Dump a hex string from the given buffer.
 *
 * @export
 * @param {ArrayBuffer} buffer The buffer to convert.
 * @returns {string} A hexadecimal string representing the buffer.
 */
export declare function bufferToHex(buffer: ArrayBuffer): string;
/**
 * Throw an error if the provided value cannot be represented as a 32-bit integer.
 *
 * @export
 * @param {number} value The number to check.
 * @returns {number} The same number if it is valid.
 */
export declare function checkInt32(value: number): number;
export declare function checkUint32(value: number): number;
/**
 * Decode a UTF-8 encoded byte array into a JavaScript string (UCS-2).
 *
 * @export
 * @param {Uint8Array} src A utf-8 encoded byte array.
 * @returns {string} A string representation of the byte array.
 */
export declare function decodeUtf8(src: Uint8Array): string;
export declare function dumpBuffer(buffer: ArrayBuffer | ArrayBufferView): string;
/**
 * Encode a JavaScript string (UCS-2) to a UTF-8 encoded string inside a Uint8Array.
 *
 * Note that the underlying buffer for the array will likely be larger than the actual contents; ignore the extra bytes.
 *
 * @export
 * @param {string} src The input string.
 * @returns {Uint8Array} A UTF-8 encoded buffer with the string's contents.
 */
export declare function encodeUtf8(src: string): Uint8Array;
/**
 * Produce a `printf`-style string. Nice for providing arguments to `assert` without paying the cost for string
 * concatenation up front. Precision is supported for floating point numbers.
 *
 * @param {string} s The format string. Supported format specifiers: b, c, d, f, j, o, s, x, and X.
 * @param {...any} args Values to be formatted in the string. Arguments beyond what are consumed by the format string
 * are ignored.
 * @returns {string} The formatted string.
 */
export declare function format(s: string, ...args: unknown[]): string;
/**
 * Return the thing that was passed in. Yaaaaawn.
 *
 * @export
 * @template T
 * @param {T} x A thing.
 * @returns {T} The same thing.
 */
export declare function identity<T>(x: T): T;
export declare function pad(v: string, width: number, pad?: string): string;
/**
 * Add padding to a number to make it divisible by 8. Typically used to pad byte sizes so they align to a word boundary.
 *
 * @export
 * @param {number} size The number to pad.
 * @returns {number} The padded number.
 */
export declare function padToWord(size: number): number;
/**
 * Repeat a string n times. Shamelessly copied from lodash.repeat.
 *
 * @param {number} times Number of times to repeat.
 * @param {string} str The string to repeat.
 * @returns {string} The repeated string.
 */
export declare function repeat(times: number, str: string): string;
