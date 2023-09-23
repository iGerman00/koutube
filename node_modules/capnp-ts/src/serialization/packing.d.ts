/**
 * @author jdiaz5513
 */
/**
 * Compute the Hamming weight (number of bits set to 1) of a number. Used to figure out how many bytes follow a tag byte
 * while computing the size of a packed message.
 *
 * WARNING: Using this with floating point numbers will void your warranty.
 *
 * @param {number} x A real integer.
 * @returns {number} The hamming weight (integer).
 */
export declare function getHammingWeight(x: number): number;
export declare type byte = number;
/**
 * Compute the tag byte from the 8 bytes of a 64-bit word.
 *
 * @param {byte} a The first byte.
 * @param {byte} b The second byte.
 * @param {byte} c The third byte.
 * @param {byte} d The fourth byte.
 * @param {byte} e The fifth byte.
 * @param {byte} f The sixth byte.
 * @param {byte} g The seventh byte.
 * @param {byte} h The eighth byte (phew!).
 * @returns {number} The tag byte.
 */
export declare function getTagByte(a: byte, b: byte, c: byte, d: byte, e: byte, f: byte, g: byte, h: byte): number;
/**
 * Efficiently calculate the length of a packed Cap'n Proto message.
 *
 * @export
 * @param {ArrayBuffer} packed The packed message.
 * @returns {number} The length of the unpacked message in bytes.
 */
export declare function getUnpackedByteLength(packed: ArrayBuffer): number;
/**
 * Compute the number of zero bytes that occur in a given 64-bit word, provided as eight separate bytes.
 *
 * @param {byte} a The first byte.
 * @param {byte} b The second byte.
 * @param {byte} c The third byte.
 * @param {byte} d The fourth byte.
 * @param {byte} e The fifth byte.
 * @param {byte} f The sixth byte.
 * @param {byte} g The seventh byte.
 * @param {byte} h The eighth byte (phew!).
 * @returns {number} The number of these bytes that are zero.
 */
export declare function getZeroByteCount(a: byte, b: byte, c: byte, d: byte, e: byte, f: byte, g: byte, h: byte): number;
/**
 * Pack a section of a Cap'n Proto message into a compressed format. This will efficiently compress zero bytes (which
 * are common in idiomatic Cap'n Proto messages) into a compact form.
 *
 * For stream-framed messages this is called once for the frame header and once again for each segment in the message.
 *
 * The returned array buffer is trimmed to the exact size of the packed message with a single copy operation at the end.
 * This should be decent on CPU time but does require quite a lot of memory (a normal array is filled up with each
 * packed byte until the packing is complete).
 *
 * @export
 * @param {ArrayBuffer} unpacked The message to pack.
 * @param {number} [byteOffset] Starting byte offset to read bytes from, defaults to 0.
 * @param {number} [byteLength] Total number of bytes to read, defaults to the remainder of the buffer contents.
 * @returns {ArrayBuffer} A packed version of the message.
 */
export declare function pack(unpacked: ArrayBuffer, byteOffset?: number, byteLength?: number): ArrayBuffer;
/**
 * Unpack a compressed Cap'n Proto message into a new ArrayBuffer.
 *
 * Unlike the `pack` function, this is able to efficiently determine the exact size needed for the output buffer and
 * runs considerably more efficiently.
 *
 * @export
 * @param {ArrayBuffer} packed An array buffer containing the packed message.
 * @returns {ArrayBuffer} The unpacked message.
 */
export declare function unpack(packed: ArrayBuffer): ArrayBuffer;
