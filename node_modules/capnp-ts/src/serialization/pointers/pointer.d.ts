/**
 * @author jdiaz5513
 */
import { ListElementSize } from "../list-element-size";
import { ObjectSize } from "../object-size";
import { Segment } from "../segment";
import { Orphan } from "./orphan";
import { PointerAllocationResult } from "./pointer-allocation-result";
import { PointerType } from "./pointer-type";
import { Message } from "../message";
export interface _PointerCtor {
    readonly displayName: string;
}
export interface PointerCtor<T extends Pointer> {
    readonly _capnp: _PointerCtor;
    new (segment: Segment, byteOffset: number, depthLimit?: number): T;
}
export interface _Pointer {
    compositeIndex?: number;
    compositeList: boolean;
    /**
     * A number that is decremented as nested pointers are traversed. When this hits zero errors will be thrown.
     */
    depthLimit: number;
}
/**
 * A pointer referencing a single byte location in a segment. This is typically used for Cap'n Proto pointers, but is
 * also sometimes used to reference an offset to a pointer's content or tag words.
 *
 * @export
 * @class Pointer
 */
export declare class Pointer {
    static readonly adopt: typeof adopt;
    static readonly copyFrom: typeof copyFrom;
    static readonly disown: typeof disown;
    static readonly dump: typeof dump;
    static readonly isNull: typeof isNull;
    static readonly _capnp: _PointerCtor;
    readonly _capnp: _Pointer;
    /** Offset, in bytes, from the start of the segment to the beginning of this pointer. */
    byteOffset: number;
    /**
     * The starting segment for this pointer's data. In the case of a far pointer, the actual content this pointer is
     * referencing will be in another segment within the same message.
     */
    segment: Segment;
    constructor(segment: Segment, byteOffset: number, depthLimit?: number);
    toString(): string;
}
/**
 * Adopt an orphaned pointer, making the pointer point to the orphaned content without copying it.
 *
 * @param {Orphan<Pointer>} src The orphan to adopt.
 * @param {Pointer} p The the pointer to adopt into.
 * @returns {void}
 */
export declare function adopt<T extends Pointer>(src: Orphan<T>, p: T): void;
/**
 * Convert a pointer to an Orphan, zeroing out the pointer and leaving its content untouched. If the content is no
 * longer needed, call `disown()` on the orphaned pointer to erase the contents as well.
 *
 * Call `adopt()` on the orphan with the new target pointer location to move it back into the message; the orphan
 * object is then invalidated after adoption (can only adopt once!).
 *
 * @param {T} p The pointer to turn into an Orphan.
 * @returns {Orphan<T>} An orphaned pointer.
 */
export declare function disown<T extends Pointer>(p: T): Orphan<T>;
export declare function dump(p: Pointer): string;
/**
 * Get the total number of bytes required to hold a list of the provided size with the given length, rounded up to the
 * nearest word.
 *
 * @param {ListElementSize} elementSize A number describing the size of the list elements.
 * @param {number} length The length of the list.
 * @param {ObjectSize} [compositeSize] The size of each element in a composite list; required if
 * `elementSize === ListElementSize.COMPOSITE`.
 * @returns {number} The number of bytes required to hold an element of that size, or `NaN` if that is undefined.
 */
export declare function getListByteLength(elementSize: ListElementSize, length: number, compositeSize?: ObjectSize): number;
/**
 * Get the number of bytes required to hold a list element of the provided size. `COMPOSITE` elements do not have a
 * fixed size, and `BIT` elements are packed into exactly a single bit, so these both return `NaN`.
 *
 * @param {ListElementSize} elementSize A number describing the size of the list elements.
 * @returns {number} The number of bytes required to hold an element of that size, or `NaN` if that is undefined.
 */
export declare function getListElementByteLength(elementSize: ListElementSize): number;
/**
 * Add an offset to the pointer's offset and return a new Pointer for that address.
 *
 * @param {number} offset The number of bytes to add to the offset.
 * @param {Pointer} p The pointer to add from.
 * @returns {Pointer} A new pointer to the address.
 */
export declare function add(offset: number, p: Pointer): Pointer;
/**
 * Replace a pointer with a deep copy of the pointer at `src` and all of its contents.
 *
 * @param {Pointer} src The pointer to copy.
 * @param {Pointer} p The pointer to copy into.
 * @returns {void}
 */
export declare function copyFrom(src: Pointer, p: Pointer): void;
/**
 * Recursively erase a pointer, any far pointers/landing pads/tag words, and the content it points to.
 *
 * Note that this will leave "holes" of zeroes in the message, since the space cannot be reclaimed. With packing this
 * will have a negligible effect on the final message size.
 *
 * FIXME: This may need protection against infinite recursion...
 *
 * @param {Pointer} p The pointer to erase.
 * @returns {void}
 */
export declare function erase(p: Pointer): void;
/**
 * Set the pointer (and far pointer landing pads, if applicable) to zero. Does not touch the pointer's content.
 *
 * @param {Pointer} p The pointer to erase.
 * @returns {void}
 */
export declare function erasePointer(p: Pointer): void;
/**
 * Interpret the pointer as a far pointer, returning its target segment and offset.
 *
 * @param {Pointer} p The pointer to read from.
 * @returns {Pointer} A pointer to the far target.
 */
export declare function followFar(p: Pointer): Pointer;
/**
 * If the pointer address references a far pointer, follow it to the location where the actual pointer data is written.
 * Otherwise, returns the pointer unmodified.
 *
 * @param {Pointer} p The pointer to read from.
 * @returns {Pointer} A new pointer representing the target location, or `p` if it is not a far pointer.
 */
export declare function followFars(p: Pointer): Pointer;
export declare function getCapabilityId(p: Pointer): number;
/**
 * Obtain the location of the pointer's content, following far pointers as needed.
 * If the pointer is a struct pointer and `compositeIndex` is set, it will be offset by a multiple of the struct's size.
 *
 * @param {Pointer} p The pointer to read from.
 * @param {boolean} [ignoreCompositeIndex] If true, will not follow the composite struct pointer's composite index and
 * instead return a pointer to the parent list's contents (also the beginning of the first struct).
 * @returns {Pointer} A pointer to the beginning of the pointer's content.
 */
export declare function getContent(p: Pointer, ignoreCompositeIndex?: boolean): Pointer;
/**
 * Read the target segment ID from a far pointer.
 *
 * @param {Pointer} p The pointer to read from.
 * @returns {number} The target segment ID.
 */
export declare function getFarSegmentId(p: Pointer): number;
/**
 * Get a number indicating the size of the list's elements.
 *
 * @param {Pointer} p The pointer to read from.
 * @returns {ListElementSize} The size of the list's elements.
 */
export declare function getListElementSize(p: Pointer): ListElementSize;
/**
 * Get the number of elements in a list pointer. For composite lists, it instead represents the total number of words in
 * the list (not counting the tag word).
 *
 * This method does **not** attempt to distinguish between composite and non-composite lists. To get the correct
 * length for composite lists use `getTargetListLength()` instead.
 *
 * @param {Pointer} p The pointer to read from.
 * @returns {number} The length of the list, or total number of words for composite lists.
 */
export declare function getListLength(p: Pointer): number;
/**
 * Get the offset (in words) from the end of a pointer to the start of its content. For struct pointers, this is the
 * beginning of the data section, and for list pointers it is the location of the first element. The value should
 * always be zero for interface pointers.
 *
 * @param {Pointer} p The pointer to read from.
 * @returns {number} The offset, in words, from the end of the pointer to the start of the data section.
 */
export declare function getOffsetWords(p: Pointer): number;
/**
 * Look up the pointer's type.
 *
 * @param {Pointer} p The pointer to read from.
 * @returns {PointerType} The type of pointer.
 */
export declare function getPointerType(p: Pointer): PointerType;
/**
 * Read the number of data words from this struct pointer.
 *
 * @param {Pointer} p The pointer to read from.
 * @returns {number} The number of data words in the struct.
 */
export declare function getStructDataWords(p: Pointer): number;
/**
 * Read the number of pointers contained in this struct pointer.
 *
 * @param {Pointer} p The pointer to read from.
 * @returns {number} The number of pointers in this struct.
 */
export declare function getStructPointerLength(p: Pointer): number;
/**
 * Get an object describing this struct pointer's size.
 *
 * @param {Pointer} p The pointer to read from.
 * @returns {ObjectSize} The size of the struct.
 */
export declare function getStructSize(p: Pointer): ObjectSize;
/**
 * Get a pointer to this pointer's composite list tag word, following far pointers as needed.
 *
 * @param {Pointer} p The pointer to read from.
 * @returns {Pointer} A pointer to the list's composite tag word.
 */
export declare function getTargetCompositeListTag(p: Pointer): Pointer;
/**
 * Get the object size for the target composite list, following far pointers as needed.
 *
 * @param {Pointer} p The pointer to read from.
 * @returns {ObjectSize} An object describing the size of each struct in the list.
 */
export declare function getTargetCompositeListSize(p: Pointer): ObjectSize;
/**
 * Get the size of the list elements referenced by this pointer, following far pointers if necessary.
 *
 * @param {Pointer} p The pointer to read from.
 * @returns {ListElementSize} The size of the elements in the list.
 */
export declare function getTargetListElementSize(p: Pointer): ListElementSize;
/**
 * Get the length of the list referenced by this pointer, following far pointers if necessary. If the list is a
 * composite list, it will look up the tag word and read the length from there.
 *
 * @param {Pointer} p The pointer to read from.
 * @returns {number} The number of elements in the list.
 */
export declare function getTargetListLength(p: Pointer): number;
/**
 * Get the type of a pointer, following far pointers if necessary. For non-far pointers this is equivalent to calling
 * `getPointerType()`.
 *
 * The target of a far pointer can never be another far pointer, and this method will throw if such a situation is
 * encountered.
 *
 * @param {Pointer} p The pointer to read from.
 * @returns {PointerType} The type of pointer referenced by this pointer.
 */
export declare function getTargetPointerType(p: Pointer): PointerType;
/**
 * Get the size of the struct referenced by a pointer, following far pointers if necessary.
 *
 * @param {Pointer} p The poiner to read from.
 * @returns {ObjectSize} The size of the struct referenced by this pointer.
 */
export declare function getTargetStructSize(p: Pointer): ObjectSize;
/**
 * Initialize a pointer to point at the data in the content segment. If the content segment is not the same as the
 * pointer's segment, this will allocate and write far pointers as needed. Nothing is written otherwise.
 *
 * The return value includes a pointer to write the pointer's actual data to (the eventual far target), and the offset
 * value (in words) to use for that pointer. In the case of double-far pointers this offset will always be zero.
 *
 * @param {Segment} contentSegment The segment containing this pointer's content.
 * @param {number} contentOffset The offset within the content segment for the beginning of this pointer's content.
 * @param {Pointer} p The pointer to initialize.
 * @returns {PointerAllocationResult} An object containing a pointer (where the pointer data should be written), and
 * the value to use as the offset for that pointer.
 */
export declare function initPointer(contentSegment: Segment, contentOffset: number, p: Pointer): PointerAllocationResult;
/**
 * Check if the pointer is a double-far pointer.
 *
 * @param {Pointer} p The pointer to read from.
 * @returns {boolean} `true` if it is a double-far pointer, `false` otherwise.
 */
export declare function isDoubleFar(p: Pointer): boolean;
/**
 * Quickly check to see if the pointer is "null". A "null" pointer is a zero word, equivalent to an empty struct
 * pointer.
 *
 * @param {Pointer} p The pointer to read from.
 * @returns {boolean} `true` if the pointer is "null".
 */
export declare function isNull(p: Pointer): boolean;
/**
 * Relocate a pointer to the given destination, ensuring that it points to the same content. This will create far
 * pointers as needed if the content is in a different segment than the destination. After the relocation the source
 * pointer will be erased and is no longer valid.
 *
 * @param {Pointer} dst The desired location for the `src` pointer. Any existing contents will be erased before
 * relocating!
 * @param {Pointer} src The pointer to relocate.
 * @returns {void}
 */
export declare function relocateTo(dst: Pointer, src: Pointer): void;
/**
 * Write a far pointer.
 *
 * @param {boolean} doubleFar Set to `true` if this is a double far pointer.
 * @param {number} offsetWords The offset, in words, to the target pointer.
 * @param {number} segmentId The segment the target pointer is located in.
 * @param {Pointer} p The pointer to write to.
 * @returns {void}
 */
export declare function setFarPointer(doubleFar: boolean, offsetWords: number, segmentId: number, p: Pointer): void;
/**
 * Write a raw interface pointer.
 *
 * @param {number} capId The capability ID.
 * @param {Pointer} p The pointer to write to.
 * @returns {void}
 */
export declare function setInterfacePointer(capId: number, p: Pointer): void;
/**
 * Write a raw list pointer.
 *
 * @param {number} offsetWords The number of words from the end of this pointer to the beginning of the list content.
 * @param {ListElementSize} size The size of each element in the list.
 * @param {number} length The number of elements in the list.
 * @param {Pointer} p The pointer to write to.
 * @param {ObjectSize} [compositeSize] For composite lists this describes the size of each element in this list. This
 * is required for composite lists.
 * @returns {void}
 */
export declare function setListPointer(offsetWords: number, size: ListElementSize, length: number, p: Pointer, compositeSize?: ObjectSize): void;
/**
 * Write a raw struct pointer.
 *
 * @param {number} offsetWords The number of words from the end of this pointer to the beginning of the struct's data
 * section.
 * @param {ObjectSize} size An object describing the size of the struct.
 * @param {Pointer} p The pointer to write to.
 * @returns {void}
 */
export declare function setStructPointer(offsetWords: number, size: ObjectSize, p: Pointer): void;
/**
 * Read some bits off a pointer to make sure it has the right pointer data.
 *
 * @param {PointerType} pointerType The expected pointer type.
 * @param {Pointer} p The pointer to validate.
 * @param {ListElementSize} [elementSize] For list pointers, the expected element size. Leave this
 * undefined for struct pointers.
 * @returns {void}
 */
export declare function validate(pointerType: PointerType, p: Pointer, elementSize?: ListElementSize): void;
export declare function copyFromList(src: Pointer, dst: Pointer): void;
export declare function copyFromStruct(src: Pointer, dst: Pointer): void;
/**
 * Track the allocation of a new Pointer object.
 *
 * This will decrement an internal counter tracking how many bytes have been traversed in the message so far. After
 * a certain limit, this method will throw an error in order to prevent a certain class of DoS attacks.
 *
 * @param {Message} message The message the pointer belongs to.
 * @param {Pointer} p The pointer being allocated.
 * @returns {void}
 */
export declare function trackPointerAllocation(message: Message, p: Pointer): void;
