"use strict";
/**
 * @author jdiaz5513
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.trackPointerAllocation = exports.copyFromStruct = exports.copyFromList = exports.validate = exports.setStructPointer = exports.setListPointer = exports.setInterfacePointer = exports.setFarPointer = exports.relocateTo = exports.isNull = exports.isDoubleFar = exports.initPointer = exports.getTargetStructSize = exports.getTargetPointerType = exports.getTargetListLength = exports.getTargetListElementSize = exports.getTargetCompositeListSize = exports.getTargetCompositeListTag = exports.getStructSize = exports.getStructPointerLength = exports.getStructDataWords = exports.getPointerType = exports.getOffsetWords = exports.getListLength = exports.getListElementSize = exports.getFarSegmentId = exports.getContent = exports.getCapabilityId = exports.followFars = exports.followFar = exports.erasePointer = exports.erase = exports.copyFrom = exports.add = exports.getListElementByteLength = exports.getListByteLength = exports.dump = exports.disown = exports.adopt = exports.Pointer = void 0;
const tslib_1 = require("tslib");
const debug_1 = tslib_1.__importDefault(require("debug"));
const constants_1 = require("../../constants");
const util_1 = require("../../util");
const list_element_size_1 = require("../list-element-size");
const object_size_1 = require("../object-size");
const orphan_1 = require("./orphan");
const pointer_allocation_result_1 = require("./pointer-allocation-result");
const pointer_type_1 = require("./pointer-type");
const errors_1 = require("../../errors");
const trace = debug_1.default("capnp:pointer");
trace("load");
/**
 * A pointer referencing a single byte location in a segment. This is typically used for Cap'n Proto pointers, but is
 * also sometimes used to reference an offset to a pointer's content or tag words.
 *
 * @export
 * @class Pointer
 */
class Pointer {
    constructor(segment, byteOffset, depthLimit = constants_1.MAX_DEPTH) {
        this._capnp = { compositeList: false, depthLimit };
        this.segment = segment;
        this.byteOffset = byteOffset;
        if (depthLimit === 0) {
            throw new Error(util_1.format(errors_1.PTR_DEPTH_LIMIT_EXCEEDED, this));
        }
        // Make sure we keep track of all pointer allocations; there's a limit per message (prevent DoS).
        trackPointerAllocation(segment.message, this);
        // NOTE: It's okay to have a pointer to the end of the segment; you'll see this when creating pointers to the
        // beginning of the content of a newly-allocated composite list with zero elements. Unlike other language
        // implementations buffer over/underflows are not a big issue since all buffer access is bounds checked in native
        // code anyway.
        if (byteOffset < 0 || byteOffset > segment.byteLength) {
            throw new Error(util_1.format(errors_1.PTR_OFFSET_OUT_OF_BOUNDS, byteOffset));
        }
        trace("new %s", this);
    }
    toString() {
        return util_1.format("Pointer_%d@%a,%s,limit:%x", this.segment.id, this.byteOffset, dump(this), this._capnp.depthLimit);
    }
}
exports.Pointer = Pointer;
Pointer.adopt = adopt;
Pointer.copyFrom = copyFrom;
Pointer.disown = disown;
Pointer.dump = dump;
Pointer.isNull = isNull;
Pointer._capnp = {
    displayName: "Pointer",
};
/**
 * Adopt an orphaned pointer, making the pointer point to the orphaned content without copying it.
 *
 * @param {Orphan<Pointer>} src The orphan to adopt.
 * @param {Pointer} p The the pointer to adopt into.
 * @returns {void}
 */
function adopt(src, p) {
    src._moveTo(p);
}
exports.adopt = adopt;
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
function disown(p) {
    return new orphan_1.Orphan(p);
}
exports.disown = disown;
function dump(p) {
    return util_1.bufferToHex(p.segment.buffer.slice(p.byteOffset, p.byteOffset + 8));
}
exports.dump = dump;
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
function getListByteLength(elementSize, length, compositeSize) {
    switch (elementSize) {
        case list_element_size_1.ListElementSize.BIT:
            return util_1.padToWord((length + 7) >>> 3);
        case list_element_size_1.ListElementSize.BYTE:
        case list_element_size_1.ListElementSize.BYTE_2:
        case list_element_size_1.ListElementSize.BYTE_4:
        case list_element_size_1.ListElementSize.BYTE_8:
        case list_element_size_1.ListElementSize.POINTER:
        case list_element_size_1.ListElementSize.VOID:
            return util_1.padToWord(getListElementByteLength(elementSize) * length);
        /* istanbul ignore next */
        case list_element_size_1.ListElementSize.COMPOSITE:
            if (compositeSize === undefined) {
                throw new Error(util_1.format(errors_1.PTR_INVALID_LIST_SIZE, NaN));
            }
            return length * util_1.padToWord(object_size_1.getByteLength(compositeSize));
        /* istanbul ignore next */
        default:
            throw new Error(errors_1.PTR_INVALID_LIST_SIZE);
    }
}
exports.getListByteLength = getListByteLength;
/**
 * Get the number of bytes required to hold a list element of the provided size. `COMPOSITE` elements do not have a
 * fixed size, and `BIT` elements are packed into exactly a single bit, so these both return `NaN`.
 *
 * @param {ListElementSize} elementSize A number describing the size of the list elements.
 * @returns {number} The number of bytes required to hold an element of that size, or `NaN` if that is undefined.
 */
function getListElementByteLength(elementSize) {
    switch (elementSize) {
        /* istanbul ignore next */
        case list_element_size_1.ListElementSize.BIT:
            return NaN;
        case list_element_size_1.ListElementSize.BYTE:
            return 1;
        case list_element_size_1.ListElementSize.BYTE_2:
            return 2;
        case list_element_size_1.ListElementSize.BYTE_4:
            return 4;
        case list_element_size_1.ListElementSize.BYTE_8:
        case list_element_size_1.ListElementSize.POINTER:
            return 8;
        /* istanbul ignore next */
        case list_element_size_1.ListElementSize.COMPOSITE:
            // Caller has to figure it out based on the tag word.
            return NaN;
        /* istanbul ignore next */
        case list_element_size_1.ListElementSize.VOID:
            return 0;
        /* istanbul ignore next */
        default:
            throw new Error(util_1.format(errors_1.PTR_INVALID_LIST_SIZE, elementSize));
    }
}
exports.getListElementByteLength = getListElementByteLength;
/**
 * Add an offset to the pointer's offset and return a new Pointer for that address.
 *
 * @param {number} offset The number of bytes to add to the offset.
 * @param {Pointer} p The pointer to add from.
 * @returns {Pointer} A new pointer to the address.
 */
function add(offset, p) {
    return new Pointer(p.segment, p.byteOffset + offset, p._capnp.depthLimit);
}
exports.add = add;
/**
 * Replace a pointer with a deep copy of the pointer at `src` and all of its contents.
 *
 * @param {Pointer} src The pointer to copy.
 * @param {Pointer} p The pointer to copy into.
 * @returns {void}
 */
function copyFrom(src, p) {
    // If the pointer is the same then this is a noop.
    if (p.segment === src.segment && p.byteOffset === src.byteOffset) {
        trace("ignoring copy operation from identical pointer %s", src);
        return;
    }
    // Make sure we erase this pointer's contents before moving on. If src is null, that's all we do.
    erase(p); // noop if null
    if (isNull(src))
        return;
    switch (getTargetPointerType(src)) {
        case pointer_type_1.PointerType.STRUCT:
            copyFromStruct(src, p);
            break;
        case pointer_type_1.PointerType.LIST:
            copyFromList(src, p);
            break;
        /* istanbul ignore next */
        default:
            throw new Error(util_1.format(errors_1.PTR_INVALID_POINTER_TYPE, getTargetPointerType(p)));
    }
}
exports.copyFrom = copyFrom;
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
function erase(p) {
    if (isNull(p))
        return;
    // First deal with the contents.
    let c;
    switch (getTargetPointerType(p)) {
        case pointer_type_1.PointerType.STRUCT: {
            const size = getTargetStructSize(p);
            c = getContent(p);
            // Wipe the data section.
            c.segment.fillZeroWords(c.byteOffset, size.dataByteLength / 8);
            // Iterate over all the pointers and nuke them.
            for (let i = 0; i < size.pointerLength; i++) {
                erase(add(i * 8, c));
            }
            break;
        }
        case pointer_type_1.PointerType.LIST: {
            const elementSize = getTargetListElementSize(p);
            const length = getTargetListLength(p);
            let contentWords = util_1.padToWord(length * getListElementByteLength(elementSize));
            c = getContent(p);
            if (elementSize === list_element_size_1.ListElementSize.POINTER) {
                for (let i = 0; i < length; i++) {
                    erase(new Pointer(c.segment, c.byteOffset + i * 8, p._capnp.depthLimit - 1));
                }
                // Calling erase on each pointer takes care of the content, nothing left to do here.
                break;
            }
            else if (elementSize === list_element_size_1.ListElementSize.COMPOSITE) {
                // Read some stuff from the tag word.
                const tag = add(-8, c);
                const compositeSize = getStructSize(tag);
                const compositeByteLength = object_size_1.getByteLength(compositeSize);
                contentWords = getOffsetWords(tag);
                // Kill the tag word.
                c.segment.setWordZero(c.byteOffset - 8);
                // Recursively erase each pointer.
                for (let i = 0; i < length; i++) {
                    for (let j = 0; j < compositeSize.pointerLength; j++) {
                        erase(new Pointer(c.segment, c.byteOffset + i * compositeByteLength + j * 8, p._capnp.depthLimit - 1));
                    }
                }
            }
            c.segment.fillZeroWords(c.byteOffset, contentWords);
            break;
        }
        case pointer_type_1.PointerType.OTHER:
            // No content.
            break;
        default:
            throw new Error(util_1.format(errors_1.PTR_INVALID_POINTER_TYPE, getTargetPointerType(p)));
    }
    erasePointer(p);
}
exports.erase = erase;
/**
 * Set the pointer (and far pointer landing pads, if applicable) to zero. Does not touch the pointer's content.
 *
 * @param {Pointer} p The pointer to erase.
 * @returns {void}
 */
function erasePointer(p) {
    if (getPointerType(p) === pointer_type_1.PointerType.FAR) {
        const landingPad = followFar(p);
        if (isDoubleFar(p)) {
            // Kill the double-far tag word.
            landingPad.segment.setWordZero(landingPad.byteOffset + 8);
        }
        // Kill the landing pad.
        landingPad.segment.setWordZero(landingPad.byteOffset);
    }
    // Finally! Kill the pointer itself...
    p.segment.setWordZero(p.byteOffset);
}
exports.erasePointer = erasePointer;
/**
 * Interpret the pointer as a far pointer, returning its target segment and offset.
 *
 * @param {Pointer} p The pointer to read from.
 * @returns {Pointer} A pointer to the far target.
 */
function followFar(p) {
    const targetSegment = p.segment.message.getSegment(p.segment.getUint32(p.byteOffset + 4));
    const targetWordOffset = p.segment.getUint32(p.byteOffset) >>> 3;
    return new Pointer(targetSegment, targetWordOffset * 8, p._capnp.depthLimit - 1);
}
exports.followFar = followFar;
/**
 * If the pointer address references a far pointer, follow it to the location where the actual pointer data is written.
 * Otherwise, returns the pointer unmodified.
 *
 * @param {Pointer} p The pointer to read from.
 * @returns {Pointer} A new pointer representing the target location, or `p` if it is not a far pointer.
 */
function followFars(p) {
    if (getPointerType(p) === pointer_type_1.PointerType.FAR) {
        const landingPad = followFar(p);
        if (isDoubleFar(p))
            landingPad.byteOffset += 8;
        return landingPad;
    }
    return p;
}
exports.followFars = followFars;
function getCapabilityId(p) {
    return p.segment.getUint32(p.byteOffset + 4);
}
exports.getCapabilityId = getCapabilityId;
function isCompositeList(p) {
    return getTargetPointerType(p) === pointer_type_1.PointerType.LIST && getTargetListElementSize(p) === list_element_size_1.ListElementSize.COMPOSITE;
}
/**
 * Obtain the location of the pointer's content, following far pointers as needed.
 * If the pointer is a struct pointer and `compositeIndex` is set, it will be offset by a multiple of the struct's size.
 *
 * @param {Pointer} p The pointer to read from.
 * @param {boolean} [ignoreCompositeIndex] If true, will not follow the composite struct pointer's composite index and
 * instead return a pointer to the parent list's contents (also the beginning of the first struct).
 * @returns {Pointer} A pointer to the beginning of the pointer's content.
 */
function getContent(p, ignoreCompositeIndex) {
    let c;
    if (isDoubleFar(p)) {
        const landingPad = followFar(p);
        c = new Pointer(p.segment.message.getSegment(getFarSegmentId(landingPad)), getOffsetWords(landingPad) * 8);
    }
    else {
        const target = followFars(p);
        c = new Pointer(target.segment, target.byteOffset + 8 + getOffsetWords(target) * 8);
    }
    if (isCompositeList(p))
        c.byteOffset += 8;
    if (!ignoreCompositeIndex && p._capnp.compositeIndex !== undefined) {
        // Seek backwards by one word so we can read the struct size off the tag word.
        c.byteOffset -= 8;
        // Seek ahead by `compositeIndex` multiples of the struct's total size.
        c.byteOffset += 8 + p._capnp.compositeIndex * object_size_1.getByteLength(object_size_1.padToWord(getStructSize(c)));
    }
    return c;
}
exports.getContent = getContent;
/**
 * Read the target segment ID from a far pointer.
 *
 * @param {Pointer} p The pointer to read from.
 * @returns {number} The target segment ID.
 */
function getFarSegmentId(p) {
    return p.segment.getUint32(p.byteOffset + 4);
}
exports.getFarSegmentId = getFarSegmentId;
/**
 * Get a number indicating the size of the list's elements.
 *
 * @param {Pointer} p The pointer to read from.
 * @returns {ListElementSize} The size of the list's elements.
 */
function getListElementSize(p) {
    return p.segment.getUint32(p.byteOffset + 4) & constants_1.LIST_SIZE_MASK;
}
exports.getListElementSize = getListElementSize;
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
function getListLength(p) {
    return p.segment.getUint32(p.byteOffset + 4) >>> 3;
}
exports.getListLength = getListLength;
/**
 * Get the offset (in words) from the end of a pointer to the start of its content. For struct pointers, this is the
 * beginning of the data section, and for list pointers it is the location of the first element. The value should
 * always be zero for interface pointers.
 *
 * @param {Pointer} p The pointer to read from.
 * @returns {number} The offset, in words, from the end of the pointer to the start of the data section.
 */
function getOffsetWords(p) {
    const o = p.segment.getInt32(p.byteOffset);
    // Far pointers only have 29 offset bits.
    return o & 2 ? o >> 3 : o >> 2;
}
exports.getOffsetWords = getOffsetWords;
/**
 * Look up the pointer's type.
 *
 * @param {Pointer} p The pointer to read from.
 * @returns {PointerType} The type of pointer.
 */
function getPointerType(p) {
    return p.segment.getUint32(p.byteOffset) & constants_1.POINTER_TYPE_MASK;
}
exports.getPointerType = getPointerType;
/**
 * Read the number of data words from this struct pointer.
 *
 * @param {Pointer} p The pointer to read from.
 * @returns {number} The number of data words in the struct.
 */
function getStructDataWords(p) {
    return p.segment.getUint16(p.byteOffset + 4);
}
exports.getStructDataWords = getStructDataWords;
/**
 * Read the number of pointers contained in this struct pointer.
 *
 * @param {Pointer} p The pointer to read from.
 * @returns {number} The number of pointers in this struct.
 */
function getStructPointerLength(p) {
    return p.segment.getUint16(p.byteOffset + 6);
}
exports.getStructPointerLength = getStructPointerLength;
/**
 * Get an object describing this struct pointer's size.
 *
 * @param {Pointer} p The pointer to read from.
 * @returns {ObjectSize} The size of the struct.
 */
function getStructSize(p) {
    return new object_size_1.ObjectSize(getStructDataWords(p) * 8, getStructPointerLength(p));
}
exports.getStructSize = getStructSize;
/**
 * Get a pointer to this pointer's composite list tag word, following far pointers as needed.
 *
 * @param {Pointer} p The pointer to read from.
 * @returns {Pointer} A pointer to the list's composite tag word.
 */
function getTargetCompositeListTag(p) {
    const c = getContent(p);
    // The composite list tag is always one word before the content.
    c.byteOffset -= 8;
    return c;
}
exports.getTargetCompositeListTag = getTargetCompositeListTag;
/**
 * Get the object size for the target composite list, following far pointers as needed.
 *
 * @param {Pointer} p The pointer to read from.
 * @returns {ObjectSize} An object describing the size of each struct in the list.
 */
function getTargetCompositeListSize(p) {
    return getStructSize(getTargetCompositeListTag(p));
}
exports.getTargetCompositeListSize = getTargetCompositeListSize;
/**
 * Get the size of the list elements referenced by this pointer, following far pointers if necessary.
 *
 * @param {Pointer} p The pointer to read from.
 * @returns {ListElementSize} The size of the elements in the list.
 */
function getTargetListElementSize(p) {
    return getListElementSize(followFars(p));
}
exports.getTargetListElementSize = getTargetListElementSize;
/**
 * Get the length of the list referenced by this pointer, following far pointers if necessary. If the list is a
 * composite list, it will look up the tag word and read the length from there.
 *
 * @param {Pointer} p The pointer to read from.
 * @returns {number} The number of elements in the list.
 */
function getTargetListLength(p) {
    const t = followFars(p);
    if (getListElementSize(t) === list_element_size_1.ListElementSize.COMPOSITE) {
        // The content is prefixed by a tag word; it's a struct pointer whose offset contains the list's length.
        return getOffsetWords(getTargetCompositeListTag(p));
    }
    return getListLength(t);
}
exports.getTargetListLength = getTargetListLength;
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
function getTargetPointerType(p) {
    const t = getPointerType(followFars(p));
    if (t === pointer_type_1.PointerType.FAR)
        throw new Error(util_1.format(errors_1.PTR_INVALID_FAR_TARGET, p));
    return t;
}
exports.getTargetPointerType = getTargetPointerType;
/**
 * Get the size of the struct referenced by a pointer, following far pointers if necessary.
 *
 * @param {Pointer} p The poiner to read from.
 * @returns {ObjectSize} The size of the struct referenced by this pointer.
 */
function getTargetStructSize(p) {
    return getStructSize(followFars(p));
}
exports.getTargetStructSize = getTargetStructSize;
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
function initPointer(contentSegment, contentOffset, p) {
    if (p.segment !== contentSegment) {
        // Need a far pointer.
        trace("Initializing far pointer %s -> %s.", p, contentSegment);
        if (!contentSegment.hasCapacity(8)) {
            // GAH! Not enough space in the content segment for a landing pad so we need a double far pointer.
            const landingPad = p.segment.allocate(16);
            trace("GAH! Initializing double-far pointer in %s from %s -> %s.", p, contentSegment, landingPad);
            setFarPointer(true, landingPad.byteOffset / 8, landingPad.segment.id, p);
            setFarPointer(false, contentOffset / 8, contentSegment.id, landingPad);
            landingPad.byteOffset += 8;
            return new pointer_allocation_result_1.PointerAllocationResult(landingPad, 0);
        }
        // Allocate a far pointer landing pad in the target segment.
        const landingPad = contentSegment.allocate(8);
        if (landingPad.segment.id !== contentSegment.id) {
            throw new Error(errors_1.INVARIANT_UNREACHABLE_CODE);
        }
        setFarPointer(false, landingPad.byteOffset / 8, landingPad.segment.id, p);
        return new pointer_allocation_result_1.PointerAllocationResult(landingPad, (contentOffset - landingPad.byteOffset - 8) / 8);
    }
    trace("Initializing intra-segment pointer %s -> %a.", p, contentOffset);
    return new pointer_allocation_result_1.PointerAllocationResult(p, (contentOffset - p.byteOffset - 8) / 8);
}
exports.initPointer = initPointer;
/**
 * Check if the pointer is a double-far pointer.
 *
 * @param {Pointer} p The pointer to read from.
 * @returns {boolean} `true` if it is a double-far pointer, `false` otherwise.
 */
function isDoubleFar(p) {
    return getPointerType(p) === pointer_type_1.PointerType.FAR && (p.segment.getUint32(p.byteOffset) & constants_1.POINTER_DOUBLE_FAR_MASK) !== 0;
}
exports.isDoubleFar = isDoubleFar;
/**
 * Quickly check to see if the pointer is "null". A "null" pointer is a zero word, equivalent to an empty struct
 * pointer.
 *
 * @param {Pointer} p The pointer to read from.
 * @returns {boolean} `true` if the pointer is "null".
 */
function isNull(p) {
    return p.segment.isWordZero(p.byteOffset);
}
exports.isNull = isNull;
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
function relocateTo(dst, src) {
    const t = followFars(src);
    const lo = t.segment.getUint8(t.byteOffset) & 0x03; // discard the offset
    const hi = t.segment.getUint32(t.byteOffset + 4);
    // Make sure anything dst was pointing to is wiped out.
    erase(dst);
    const res = initPointer(t.segment, t.byteOffset + 8 + getOffsetWords(t) * 8, dst);
    // Keep the low 2 bits and write the new offset.
    res.pointer.segment.setUint32(res.pointer.byteOffset, lo | (res.offsetWords << 2));
    // Keep the high 32 bits intact.
    res.pointer.segment.setUint32(res.pointer.byteOffset + 4, hi);
    erasePointer(src);
}
exports.relocateTo = relocateTo;
/**
 * Write a far pointer.
 *
 * @param {boolean} doubleFar Set to `true` if this is a double far pointer.
 * @param {number} offsetWords The offset, in words, to the target pointer.
 * @param {number} segmentId The segment the target pointer is located in.
 * @param {Pointer} p The pointer to write to.
 * @returns {void}
 */
function setFarPointer(doubleFar, offsetWords, segmentId, p) {
    const A = pointer_type_1.PointerType.FAR;
    const B = doubleFar ? 1 : 0;
    const C = offsetWords;
    const D = segmentId;
    p.segment.setUint32(p.byteOffset, A | (B << 2) | (C << 3));
    p.segment.setUint32(p.byteOffset + 4, D);
}
exports.setFarPointer = setFarPointer;
/**
 * Write a raw interface pointer.
 *
 * @param {number} capId The capability ID.
 * @param {Pointer} p The pointer to write to.
 * @returns {void}
 */
function setInterfacePointer(capId, p) {
    p.segment.setUint32(p.byteOffset, pointer_type_1.PointerType.OTHER);
    p.segment.setUint32(p.byteOffset + 4, capId);
}
exports.setInterfacePointer = setInterfacePointer;
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
function setListPointer(offsetWords, size, length, p, compositeSize) {
    const A = pointer_type_1.PointerType.LIST;
    const B = offsetWords;
    const C = size;
    let D = length;
    if (size === list_element_size_1.ListElementSize.COMPOSITE) {
        if (compositeSize === undefined) {
            throw new TypeError(errors_1.TYPE_COMPOSITE_SIZE_UNDEFINED);
        }
        D *= object_size_1.getWordLength(compositeSize);
    }
    p.segment.setUint32(p.byteOffset, A | (B << 2));
    p.segment.setUint32(p.byteOffset + 4, C | (D << 3));
}
exports.setListPointer = setListPointer;
/**
 * Write a raw struct pointer.
 *
 * @param {number} offsetWords The number of words from the end of this pointer to the beginning of the struct's data
 * section.
 * @param {ObjectSize} size An object describing the size of the struct.
 * @param {Pointer} p The pointer to write to.
 * @returns {void}
 */
function setStructPointer(offsetWords, size, p) {
    const A = pointer_type_1.PointerType.STRUCT;
    const B = offsetWords;
    const C = object_size_1.getDataWordLength(size);
    const D = size.pointerLength;
    p.segment.setUint32(p.byteOffset, A | (B << 2));
    p.segment.setUint16(p.byteOffset + 4, C);
    p.segment.setUint16(p.byteOffset + 6, D);
}
exports.setStructPointer = setStructPointer;
/**
 * Read some bits off a pointer to make sure it has the right pointer data.
 *
 * @param {PointerType} pointerType The expected pointer type.
 * @param {Pointer} p The pointer to validate.
 * @param {ListElementSize} [elementSize] For list pointers, the expected element size. Leave this
 * undefined for struct pointers.
 * @returns {void}
 */
function validate(pointerType, p, elementSize) {
    if (isNull(p))
        return;
    const t = followFars(p);
    // Check the pointer type.
    const A = t.segment.getUint32(t.byteOffset) & constants_1.POINTER_TYPE_MASK;
    if (A !== pointerType) {
        throw new Error(util_1.format(errors_1.PTR_WRONG_POINTER_TYPE, p, pointerType));
    }
    // Check the list element size, if provided.
    if (elementSize !== undefined) {
        const C = t.segment.getUint32(t.byteOffset + 4) & constants_1.LIST_SIZE_MASK;
        if (C !== elementSize) {
            throw new Error(util_1.format(errors_1.PTR_WRONG_LIST_TYPE, p, list_element_size_1.ListElementSize[elementSize]));
        }
    }
}
exports.validate = validate;
function copyFromList(src, dst) {
    if (dst._capnp.depthLimit <= 0)
        throw new Error(errors_1.PTR_DEPTH_LIMIT_EXCEEDED);
    const srcContent = getContent(src);
    const srcElementSize = getTargetListElementSize(src);
    const srcLength = getTargetListLength(src);
    let srcCompositeSize;
    let srcStructByteLength;
    let dstContent;
    if (srcElementSize === list_element_size_1.ListElementSize.POINTER) {
        dstContent = dst.segment.allocate(srcLength << 3);
        // Recursively copy each pointer in the list.
        for (let i = 0; i < srcLength; i++) {
            const srcPtr = new Pointer(srcContent.segment, srcContent.byteOffset + (i << 3), src._capnp.depthLimit - 1);
            const dstPtr = new Pointer(dstContent.segment, dstContent.byteOffset + (i << 3), dst._capnp.depthLimit - 1);
            copyFrom(srcPtr, dstPtr);
        }
    }
    else if (srcElementSize === list_element_size_1.ListElementSize.COMPOSITE) {
        srcCompositeSize = object_size_1.padToWord(getTargetCompositeListSize(src));
        srcStructByteLength = object_size_1.getByteLength(srcCompositeSize);
        dstContent = dst.segment.allocate(object_size_1.getByteLength(srcCompositeSize) * srcLength + 8);
        // Copy the tag word.
        dstContent.segment.copyWord(dstContent.byteOffset, srcContent.segment, srcContent.byteOffset - 8);
        // Copy the entire contents, including all pointers. This should be more efficient than making `srcLength`
        // copies to skip the pointer sections, and we're about to rewrite all those pointers anyway.
        // PERF: Skip this step if the composite struct only contains pointers.
        if (srcCompositeSize.dataByteLength > 0) {
            const wordLength = object_size_1.getWordLength(srcCompositeSize) * srcLength;
            dstContent.segment.copyWords(dstContent.byteOffset + 8, srcContent.segment, srcContent.byteOffset, wordLength);
        }
        // Recursively copy all the pointers in each struct.
        for (let i = 0; i < srcLength; i++) {
            for (let j = 0; j < srcCompositeSize.pointerLength; j++) {
                const offset = i * srcStructByteLength + srcCompositeSize.dataByteLength + (j << 3);
                const srcPtr = new Pointer(srcContent.segment, srcContent.byteOffset + offset, src._capnp.depthLimit - 1);
                const dstPtr = new Pointer(dstContent.segment, dstContent.byteOffset + offset + 8, dst._capnp.depthLimit - 1);
                copyFrom(srcPtr, dstPtr);
            }
        }
    }
    else {
        const byteLength = util_1.padToWord(srcElementSize === list_element_size_1.ListElementSize.BIT
            ? (srcLength + 7) >>> 3
            : getListElementByteLength(srcElementSize) * srcLength);
        const wordLength = byteLength >>> 3;
        dstContent = dst.segment.allocate(byteLength);
        // Copy all of the list contents word-by-word.
        dstContent.segment.copyWords(dstContent.byteOffset, srcContent.segment, srcContent.byteOffset, wordLength);
    }
    // Initialize the list pointer.
    const res = initPointer(dstContent.segment, dstContent.byteOffset, dst);
    setListPointer(res.offsetWords, srcElementSize, srcLength, res.pointer, srcCompositeSize);
}
exports.copyFromList = copyFromList;
function copyFromStruct(src, dst) {
    if (dst._capnp.depthLimit <= 0)
        throw new Error(errors_1.PTR_DEPTH_LIMIT_EXCEEDED);
    const srcContent = getContent(src);
    const srcSize = getTargetStructSize(src);
    const srcDataWordLength = object_size_1.getDataWordLength(srcSize);
    // Allocate space for the destination content.
    const dstContent = dst.segment.allocate(object_size_1.getByteLength(srcSize));
    // Copy the data section.
    dstContent.segment.copyWords(dstContent.byteOffset, srcContent.segment, srcContent.byteOffset, srcDataWordLength);
    // Copy the pointer section.
    for (let i = 0; i < srcSize.pointerLength; i++) {
        const offset = srcSize.dataByteLength + i * 8;
        const srcPtr = new Pointer(srcContent.segment, srcContent.byteOffset + offset, src._capnp.depthLimit - 1);
        const dstPtr = new Pointer(dstContent.segment, dstContent.byteOffset + offset, dst._capnp.depthLimit - 1);
        copyFrom(srcPtr, dstPtr);
    }
    // Don't touch dst if it's already initialized as a composite list pointer. With composite struct pointers there's
    // no pointer to copy here and we've already copied the contents.
    if (dst._capnp.compositeList)
        return;
    // Initialize the struct pointer.
    const res = initPointer(dstContent.segment, dstContent.byteOffset, dst);
    setStructPointer(res.offsetWords, srcSize, res.pointer);
}
exports.copyFromStruct = copyFromStruct;
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
function trackPointerAllocation(message, p) {
    message._capnp.traversalLimit -= 8;
    if (message._capnp.traversalLimit <= 0) {
        throw new Error(util_1.format(errors_1.PTR_TRAVERSAL_LIMIT_EXCEEDED, p));
    }
}
exports.trackPointerAllocation = trackPointerAllocation;
//# sourceMappingURL=pointer.js.map