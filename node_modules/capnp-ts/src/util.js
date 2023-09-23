"use strict";
/**
 * @author jdiaz5513
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.repeat = exports.padToWord = exports.pad = exports.identity = exports.format = exports.encodeUtf8 = exports.dumpBuffer = exports.decodeUtf8 = exports.checkUint32 = exports.checkInt32 = exports.bufferToHex = void 0;
const tslib_1 = require("tslib");
// LINT: a lot of the util functions need the any type.
/* tslint:disable:no-any no-unsafe-any */
const debug_1 = tslib_1.__importDefault(require("debug"));
const constants_1 = require("./constants");
const errors_1 = require("./errors");
const trace = debug_1.default("capnp:util");
trace("load");
/**
 * Dump a hex string from the given buffer.
 *
 * @export
 * @param {ArrayBuffer} buffer The buffer to convert.
 * @returns {string} A hexadecimal string representing the buffer.
 */
function bufferToHex(buffer) {
    const a = new Uint8Array(buffer);
    const h = [];
    for (let i = 0; i < a.byteLength; i++)
        h.push(pad(a[i].toString(16), 2));
    return `[${h.join(" ")}]`;
}
exports.bufferToHex = bufferToHex;
/**
 * Throw an error if the provided value cannot be represented as a 32-bit integer.
 *
 * @export
 * @param {number} value The number to check.
 * @returns {number} The same number if it is valid.
 */
function checkInt32(value) {
    if (value > constants_1.MAX_INT32 || value < -constants_1.MAX_INT32) {
        throw new RangeError(errors_1.RANGE_INT32_OVERFLOW);
    }
    return value;
}
exports.checkInt32 = checkInt32;
function checkUint32(value) {
    if (value < 0 || value > constants_1.MAX_UINT32) {
        throw new RangeError(errors_1.RANGE_UINT32_OVERFLOW);
    }
    return value;
}
exports.checkUint32 = checkUint32;
/**
 * Decode a UTF-8 encoded byte array into a JavaScript string (UCS-2).
 *
 * @export
 * @param {Uint8Array} src A utf-8 encoded byte array.
 * @returns {string} A string representation of the byte array.
 */
function decodeUtf8(src) {
    // This ain't for the faint of heart, kids. If you suffer from seizures, heart palpitations, or have had a history of
    // stroke you may want to look away now.
    const l = src.byteLength;
    let dst = "";
    let i = 0;
    let cp = 0;
    let a = 0;
    let b = 0;
    let c = 0;
    let d = 0;
    while (i < l) {
        a = src[i++];
        if ((a & 0b10000000) === 0) {
            cp = a;
        }
        else if ((a & 0b11100000) === 0b11000000) {
            if (i >= l)
                throw new RangeError(errors_1.RANGE_INVALID_UTF8);
            b = src[i++];
            cp = ((a & 0b00011111) << 6) | (b & 0b00111111);
        }
        else if ((a & 0b11110000) === 0b11100000) {
            if (i + 1 >= l)
                throw new RangeError(errors_1.RANGE_INVALID_UTF8);
            b = src[i++];
            c = src[i++];
            cp = ((a & 0b00001111) << 12) | ((b & 0b00111111) << 6) | (c & 0b00111111);
        }
        else if ((a & 0b11111000) === 0b11110000) {
            if (i + 2 >= l)
                throw new RangeError(errors_1.RANGE_INVALID_UTF8);
            b = src[i++];
            c = src[i++];
            d = src[i++];
            cp = ((a & 0b00000111) << 18) | ((b & 0b00111111) << 12) | ((c & 0b00111111) << 6) | (d & 0b00111111);
        }
        else {
            throw new RangeError(errors_1.RANGE_INVALID_UTF8);
        }
        if (cp <= 0xd7ff || (cp >= 0xe000 && cp <= 0xffff)) {
            dst += String.fromCharCode(cp);
        }
        else {
            // We must reach into the astral plane and construct the surrogate pair!
            cp -= 0x00010000;
            const hi = (cp >>> 10) + 0xd800;
            const lo = (cp & 0x03ff) + 0xdc00;
            if (hi < 0xd800 || hi > 0xdbff)
                throw new RangeError(errors_1.RANGE_INVALID_UTF8);
            dst += String.fromCharCode(hi, lo);
        }
    }
    return dst;
}
exports.decodeUtf8 = decodeUtf8;
function dumpBuffer(buffer) {
    const b = buffer instanceof ArrayBuffer
        ? new Uint8Array(buffer)
        : new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
    const byteLength = Math.min(b.byteLength, constants_1.MAX_BUFFER_DUMP_BYTES);
    let r = format("\n=== buffer[%d] ===", byteLength);
    for (let j = 0; j < byteLength; j += 16) {
        r += `\n${pad(j.toString(16), 8)}: `;
        let s = "";
        let k;
        for (k = 0; k < 16 && j + k < b.byteLength; k++) {
            const v = b[j + k];
            r += `${pad(v.toString(16), 2)} `;
            // Printable ASCII range.
            s += v > 31 && v < 255 ? String.fromCharCode(v) : "·";
            if (k === 7)
                r += " ";
        }
        r += `${repeat((17 - k) * 3, " ")}${s}`;
    }
    r += "\n";
    if (byteLength !== b.byteLength) {
        r += format("=== (truncated %d bytes) ===\n", b.byteLength - byteLength);
    }
    return r;
}
exports.dumpBuffer = dumpBuffer;
/**
 * Encode a JavaScript string (UCS-2) to a UTF-8 encoded string inside a Uint8Array.
 *
 * Note that the underlying buffer for the array will likely be larger than the actual contents; ignore the extra bytes.
 *
 * @export
 * @param {string} src The input string.
 * @returns {Uint8Array} A UTF-8 encoded buffer with the string's contents.
 */
function encodeUtf8(src) {
    const l = src.length;
    const dst = new Uint8Array(new ArrayBuffer(l * 4));
    let j = 0;
    for (let i = 0; i < l; i++) {
        const c = src.charCodeAt(i);
        if (c <= 0x7f) {
            dst[j++] = c;
        }
        else if (c <= 0x07ff) {
            dst[j++] = 0b11000000 | (c >>> 6);
            dst[j++] = 0b10000000 | ((c >>> 0) & 0b00111111);
        }
        else if (c <= 0xd7ff || c >= 0xe000) {
            dst[j++] = 0b11100000 | (c >>> 12);
            dst[j++] = 0b10000000 | ((c >>> 6) & 0b00111111);
            dst[j++] = 0b10000000 | ((c >>> 0) & 0b00111111);
        }
        else {
            // Make sure the surrogate pair is complete.
            /* istanbul ignore next */
            if (i + 1 >= l)
                throw new RangeError(errors_1.RANGE_INVALID_UTF8);
            // I cast thee back into the astral plane.
            const hi = c - 0xd800;
            const lo = src.charCodeAt(++i) - 0xdc00;
            const cp = ((hi << 10) | lo) + 0x00010000;
            dst[j++] = 0b11110000 | (cp >>> 18);
            dst[j++] = 0b10000000 | ((cp >>> 12) & 0b00111111);
            dst[j++] = 0b10000000 | ((cp >>> 6) & 0b00111111);
            dst[j++] = 0b10000000 | ((cp >>> 0) & 0b00111111);
        }
    }
    return dst.subarray(0, j);
}
exports.encodeUtf8 = encodeUtf8;
/**
 * Produce a `printf`-style string. Nice for providing arguments to `assert` without paying the cost for string
 * concatenation up front. Precision is supported for floating point numbers.
 *
 * @param {string} s The format string. Supported format specifiers: b, c, d, f, j, o, s, x, and X.
 * @param {...any} args Values to be formatted in the string. Arguments beyond what are consumed by the format string
 * are ignored.
 * @returns {string} The formatted string.
 */
function format(s, ...args) {
    const n = s.length;
    let arg;
    let argIndex = 0;
    let c;
    let escaped = false;
    let i = 0;
    let leadingZero = false;
    let precision;
    let result = "";
    function nextArg() {
        return args[argIndex++];
    }
    function slurpNumber() {
        let digits = "";
        while (/\d/.test(s[i])) {
            digits += s[i++];
            c = s[i];
        }
        return digits.length > 0 ? parseInt(digits, 10) : null;
    }
    for (; i < n; ++i) {
        c = s[i];
        if (escaped) {
            escaped = false;
            if (c === ".") {
                leadingZero = false;
                c = s[++i];
            }
            else if (c === "0" && s[i + 1] === ".") {
                leadingZero = true;
                i += 2;
                c = s[i];
            }
            else {
                leadingZero = true;
            }
            precision = slurpNumber();
            switch (c) {
                case "a": // number in hex with padding
                    result += "0x" + pad(parseInt(String(nextArg()), 10).toString(16), 8);
                    break;
                case "b": // number in binary
                    result += parseInt(String(nextArg()), 10).toString(2);
                    break;
                case "c": // character
                    arg = nextArg();
                    if (typeof arg === "string" || arg instanceof String) {
                        result += arg;
                    }
                    else {
                        result += String.fromCharCode(parseInt(String(arg), 10));
                    }
                    break;
                case "d": // number in decimal
                    result += parseInt(String(nextArg()), 10);
                    break;
                case "f": {
                    // floating point number
                    const tmp = parseFloat(String(nextArg())).toFixed(precision || 6);
                    result += leadingZero ? tmp : tmp.replace(/^0/, "");
                    break;
                }
                case "j": // JSON
                    result += JSON.stringify(nextArg());
                    break;
                case "o": // number in octal
                    result += "0" + parseInt(String(nextArg()), 10).toString(8);
                    break;
                case "s": // string
                    result += nextArg();
                    break;
                case "x": // lowercase hexadecimal
                    result += "0x" + parseInt(String(nextArg()), 10).toString(16);
                    break;
                case "X": // uppercase hexadecimal
                    result += "0x" + parseInt(String(nextArg()), 10).toString(16).toUpperCase();
                    break;
                default:
                    result += c;
                    break;
            }
        }
        else if (c === "%") {
            escaped = true;
        }
        else {
            result += c;
        }
    }
    return result;
}
exports.format = format;
/**
 * Return the thing that was passed in. Yaaaaawn.
 *
 * @export
 * @template T
 * @param {T} x A thing.
 * @returns {T} The same thing.
 */
function identity(x) {
    return x;
}
exports.identity = identity;
function pad(v, width, pad = "0") {
    return v.length >= width ? v : new Array(width - v.length + 1).join(pad) + v;
}
exports.pad = pad;
/**
 * Add padding to a number to make it divisible by 8. Typically used to pad byte sizes so they align to a word boundary.
 *
 * @export
 * @param {number} size The number to pad.
 * @returns {number} The padded number.
 */
function padToWord(size) {
    return (size + 7) & ~7;
}
exports.padToWord = padToWord;
/**
 * Repeat a string n times. Shamelessly copied from lodash.repeat.
 *
 * @param {number} times Number of times to repeat.
 * @param {string} str The string to repeat.
 * @returns {string} The repeated string.
 */
function repeat(times, str) {
    let out = "";
    let n = times;
    let s = str;
    if (n < 1 || n > Number.MAX_VALUE)
        return out;
    // https://en.wikipedia.org/wiki/Exponentiation_by_squaring
    do {
        if (n % 2)
            out += s;
        n = Math.floor(n / 2);
        if (n)
            s += s;
    } while (n);
    return out;
}
exports.repeat = repeat;
const hex = (v) => parseInt(String(v)).toString(16);
// Set up custom debug formatters.
/* istanbul ignore next */
debug_1.default.formatters["h"] = hex;
/* istanbul ignore next */
debug_1.default.formatters["x"] = (v) => `0x${hex(v)}`;
/* istanbul ignore next */
debug_1.default.formatters["a"] = (v) => `0x${pad(hex(v), 8)}`;
/* istanbul ignore next */
debug_1.default.formatters["X"] = (v) => `0x${hex(v).toUpperCase()}`;
//# sourceMappingURL=util.js.map