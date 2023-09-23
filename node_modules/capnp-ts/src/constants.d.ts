/**
 * @author jdiaz5513
 */
/** Default size (in bytes) for newly allocated segments. */
export declare const DEFAULT_BUFFER_SIZE = 4096;
export declare const DEFAULT_DECODE_LIMIT: number;
/**
 * Limit to how deeply nested pointers are allowed to be. The root struct of a message will start at this value, and it
 * is decremented as pointers are dereferenced.
 */
export declare const DEFAULT_DEPTH_LIMIT = 64;
/**
 * Limit to the number of **bytes** that can be traversed in a single message. This is necessary to prevent certain
 * classes of DoS attacks where maliciously crafted data can be self-referencing in a way that wouldn't trigger the
 * depth limit.
 *
 * For this reason, it is advised to cache pointers into variables and not constantly dereference them since the
 * message's traversal limit gets decremented each time.
 */
export declare const DEFAULT_TRAVERSE_LIMIT: number;
/**
 * When allocating array buffers dynamically (while packing or in certain Arena implementations) the previous buffer's
 * size is multiplied by this number to determine the next buffer's size. This is chosen to keep both time spent
 * reallocating and wasted memory to a minimum.
 *
 * Smaller numbers would save memory at the expense of CPU time.
 */
export declare const GROWTH_FACTOR = 1.5;
/** A bitmask applied to obtain the size of a list pointer. */
export declare const LIST_SIZE_MASK = 7;
/** Maximum number of bytes to dump at once when dumping array buffers to string. */
export declare const MAX_BUFFER_DUMP_BYTES = 8192;
/** The maximum value for a 32-bit integer. */
export declare const MAX_INT32 = 2147483647;
/** The maximum value for a 32-bit unsigned integer. */
export declare const MAX_UINT32 = 4294967295;
/** The largest integer that can be precisely represented in JavaScript. */
export declare const MAX_SAFE_INTEGER = 9007199254740991;
/** Maximum limit on the number of segments in a message stream. */
export declare const MAX_STREAM_SEGMENTS = 512;
/** The smallest integer that can be precisely represented in JavaScript. */
export declare const MIN_SAFE_INTEGER = -9007199254740991;
/** Minimum growth increment for a SingleSegmentArena. */
export declare const MIN_SINGLE_SEGMENT_GROWTH = 4096;
/**
 * This will be `true` if the machine running this code stores numbers natively in little-endian format. This is useful
 * for some numeric type conversions when the endianness does not affect the output. Using the native endianness for
 * these operations is _slightly_ faster.
 */
export declare const NATIVE_LITTLE_ENDIAN: boolean;
/**
 * When packing a message, this is the number of zero bytes required after a SPAN (0xff) tag is written to the packed
 * message before the span is terminated.
 *
 * This little detail is left up to the implementation because it can be tuned for performance. Setting this to a higher
 * value may help with messages that contain a ton of text/data.
 *
 * It is imperative to never set this below 1 or else BAD THINGS. You have been warned.
 */
export declare const PACK_SPAN_THRESHOLD = 2;
/**
 * How far to travel into a nested pointer structure during a deep copy; when this limit is exhausted the copy
 * operation will throw an error.
 */
export declare const POINTER_COPY_LIMIT = 32;
/** A bitmask for looking up the double-far flag on a far pointer. */
export declare const POINTER_DOUBLE_FAR_MASK = 4;
/** A bitmask for looking up the pointer type. */
export declare const POINTER_TYPE_MASK = 3;
/** Used for some 64-bit conversions, equal to Math.pow(2, 32). */
export declare const VAL32 = 4294967296;
/** The maximum value allowed for depth traversal limits. */
export declare const MAX_DEPTH = 2147483647;
/** The maximum byte length for a single segment. */
export declare const MAX_SEGMENT_LENGTH = 4294967295;
