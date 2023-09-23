"use strict";
/**
 * @author jdiaz5513
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkPointerBounds = exports.checkDataBounds = exports.testWhich = exports.setVoid = exports.setUint8 = exports.setUint64 = exports.setUint32 = exports.setUint16 = exports.setText = exports.setPointer = exports.setInt8 = exports.setInt64 = exports.setInt32 = exports.setInt16 = exports.setFloat64 = exports.setFloat32 = exports.setBit = exports.initList = exports.initData = exports.getVoid = exports.getUint8 = exports.getUint64 = exports.getUint32 = exports.getUint16 = exports.getText = exports.getStruct = exports.getSize = exports.getPointerSection = exports.getPointerAs = exports.getPointer = exports.getList = exports.getInt8 = exports.getInt64 = exports.getInt32 = exports.getInt16 = exports.getFloat64 = exports.getFloat32 = exports.getDataSection = exports.getData = exports.getBit = exports.getAs = exports.disown = exports.adopt = exports.resize = exports.initStructAt = exports.initStruct = exports.Struct = void 0;
const tslib_1 = require("tslib");
const debug_1 = tslib_1.__importDefault(require("debug"));
const constants_1 = require("../../constants");
const index_1 = require("../../types/index");
const util_1 = require("../../util");
const list_element_size_1 = require("../list-element-size");
const object_size_1 = require("../object-size");
const data_1 = require("./data");
const list_1 = require("./list");
const pointer_1 = require("./pointer");
const pointer_type_1 = require("./pointer-type");
const text_1 = require("./text");
const errors_1 = require("../../errors");
const trace = debug_1.default("capnp:struct");
trace("load");
// Used to apply bit masks (default values).
const TMP_WORD = new DataView(new ArrayBuffer(8));
class Struct extends pointer_1.Pointer {
    /**
     * Create a new pointer to a struct.
     *
     * @constructor {Struct}
     * @param {Segment} segment The segment the pointer resides in.
     * @param {number} byteOffset The offset from the beginning of the segment to the beginning of the pointer data.
     * @param {any} [depthLimit=MAX_DEPTH] The nesting depth limit for this object.
     * @param {number} [compositeIndex] If set, then this pointer is actually a reference to a composite list
     * (`this._getPointerTargetType() === PointerType.LIST`), and this number is used as the index of the struct within
     * the list. It is not valid to call `initStruct()` on a composite struct – the struct contents are initialized when
     * the list pointer is initialized.
     */
    constructor(segment, byteOffset, depthLimit = constants_1.MAX_DEPTH, compositeIndex) {
        super(segment, byteOffset, depthLimit);
        this._capnp.compositeIndex = compositeIndex;
        this._capnp.compositeList = compositeIndex !== undefined;
    }
    static toString() {
        return this._capnp.displayName;
    }
    toString() {
        return (`Struct_${super.toString()}` +
            `${this._capnp.compositeIndex === undefined ? "" : `,ci:${this._capnp.compositeIndex}`}`);
    }
}
exports.Struct = Struct;
Struct._capnp = {
    displayName: "Struct",
};
Struct.getAs = getAs;
Struct.getBit = getBit;
Struct.getData = getData;
Struct.getFloat32 = getFloat32;
Struct.getFloat64 = getFloat64;
Struct.getUint8 = getUint8;
Struct.getUint16 = getUint16;
Struct.getUint32 = getUint32;
Struct.getUint64 = getUint64;
Struct.getInt8 = getInt8;
Struct.getInt16 = getInt16;
Struct.getInt32 = getInt32;
Struct.getInt64 = getInt64;
Struct.getList = getList;
Struct.getPointer = getPointer;
Struct.getPointerAs = getPointerAs;
Struct.getStruct = getStruct;
Struct.getText = getText;
Struct.initData = initData;
Struct.initList = initList;
Struct.initStruct = initStruct;
Struct.initStructAt = initStructAt;
Struct.setBit = setBit;
Struct.setFloat32 = setFloat32;
Struct.setFloat64 = setFloat64;
Struct.setUint8 = setUint8;
Struct.setUint16 = setUint16;
Struct.setUint32 = setUint32;
Struct.setUint64 = setUint64;
Struct.setInt8 = setInt8;
Struct.setInt16 = setInt16;
Struct.setInt32 = setInt32;
Struct.setInt64 = setInt64;
Struct.setText = setText;
Struct.testWhich = testWhich;
/**
 * Initialize a struct with the provided object size. This will allocate new space for the struct contents, ideally in
 * the same segment as this pointer.
 *
 * @param {ObjectSize} size An object describing the size of the struct's data and pointer sections.
 * @param {Struct} s The struct to initialize.
 * @returns {void}
 */
function initStruct(size, s) {
    if (s._capnp.compositeIndex !== undefined) {
        throw new Error(util_1.format(errors_1.PTR_INIT_COMPOSITE_STRUCT, s));
    }
    // Make sure to clear existing contents before overwriting the pointer data (erase is a noop if already empty).
    pointer_1.erase(s);
    const c = s.segment.allocate(object_size_1.getByteLength(size));
    const res = pointer_1.initPointer(c.segment, c.byteOffset, s);
    pointer_1.setStructPointer(res.offsetWords, size, res.pointer);
}
exports.initStruct = initStruct;
function initStructAt(index, StructClass, p) {
    const s = getPointerAs(index, StructClass, p);
    initStruct(StructClass._capnp.size, s);
    return s;
}
exports.initStructAt = initStructAt;
/**
 * Make a shallow copy of a struct's contents and update the pointer to point to the new content. The data and pointer
 * sections will be resized to the provided size.
 *
 * WARNING: This method can cause data loss if `dstSize` is smaller than the original size!
 *
 * @param {ObjectSize} dstSize The desired size for the struct contents.
 * @param {Struct} s The struct to resize.
 * @returns {void}
 */
function resize(dstSize, s) {
    const srcSize = getSize(s);
    const srcContent = pointer_1.getContent(s);
    const dstContent = s.segment.allocate(object_size_1.getByteLength(dstSize));
    // Only copy the data section for now. The pointer section will need to be rewritten.
    dstContent.segment.copyWords(dstContent.byteOffset, srcContent.segment, srcContent.byteOffset, Math.min(object_size_1.getDataWordLength(srcSize), object_size_1.getDataWordLength(dstSize)));
    const res = pointer_1.initPointer(dstContent.segment, dstContent.byteOffset, s);
    pointer_1.setStructPointer(res.offsetWords, dstSize, res.pointer);
    // Iterate through the new pointer section and update the offsets so they point to the right place. This is a bit
    // more complicated than it appears due to the fact that the original pointers could have been far pointers, and
    // the new pointers might need to be allocated as far pointers if the segment is full.
    for (let i = 0; i < Math.min(srcSize.pointerLength, dstSize.pointerLength); i++) {
        const srcPtr = new pointer_1.Pointer(srcContent.segment, srcContent.byteOffset + srcSize.dataByteLength + i * 8);
        if (pointer_1.isNull(srcPtr)) {
            // If source pointer is null, leave the destination pointer as default null.
            continue;
        }
        const srcPtrTarget = pointer_1.followFars(srcPtr);
        const srcPtrContent = pointer_1.getContent(srcPtr);
        const dstPtr = new pointer_1.Pointer(dstContent.segment, dstContent.byteOffset + dstSize.dataByteLength + i * 8);
        // For composite lists the offset needs to point to the tag word, not the first element which is what getContent
        // returns.
        if (pointer_1.getTargetPointerType(srcPtr) === pointer_type_1.PointerType.LIST &&
            pointer_1.getTargetListElementSize(srcPtr) === list_element_size_1.ListElementSize.COMPOSITE) {
            srcPtrContent.byteOffset -= 8;
        }
        const r = pointer_1.initPointer(srcPtrContent.segment, srcPtrContent.byteOffset, dstPtr);
        // Read the old pointer data, but discard the original offset.
        const a = srcPtrTarget.segment.getUint8(srcPtrTarget.byteOffset) & 0x03;
        const b = srcPtrTarget.segment.getUint32(srcPtrTarget.byteOffset + 4);
        r.pointer.segment.setUint32(r.pointer.byteOffset, a | (r.offsetWords << 2));
        r.pointer.segment.setUint32(r.pointer.byteOffset + 4, b);
    }
    // Zero out the old data and pointer sections.
    srcContent.segment.fillZeroWords(srcContent.byteOffset, object_size_1.getWordLength(srcSize));
}
exports.resize = resize;
function adopt(src, s) {
    if (s._capnp.compositeIndex !== undefined) {
        throw new Error(util_1.format(errors_1.PTR_ADOPT_COMPOSITE_STRUCT, s));
    }
    pointer_1.Pointer.adopt(src, s);
}
exports.adopt = adopt;
function disown(s) {
    if (s._capnp.compositeIndex !== undefined) {
        throw new Error(util_1.format(errors_1.PTR_DISOWN_COMPOSITE_STRUCT, s));
    }
    return pointer_1.Pointer.disown(s);
}
exports.disown = disown;
/**
 * Convert a struct to a struct of the provided class. Particularly useful when casting to nested group types.
 *
 * @protected
 * @template T
 * @param {StructCtor<T>} StructClass The struct class to convert to. Not particularly useful if `Struct`.
 * @param {Struct} s The struct to convert.
 * @returns {T} A new instance of the desired struct class pointing to the same location.
 */
function getAs(StructClass, s) {
    return new StructClass(s.segment, s.byteOffset, s._capnp.depthLimit, s._capnp.compositeIndex);
}
exports.getAs = getAs;
/**
 * Read a boolean (bit) value out of a struct.
 *
 * @protected
 * @param {number} bitOffset The offset in **bits** from the start of the data section.
 * @param {Struct} s The struct to read from.
 * @param {DataView} [defaultMask] The default value as a DataView.
 * @returns {boolean} The value.
 */
function getBit(bitOffset, s, defaultMask) {
    const byteOffset = Math.floor(bitOffset / 8);
    const bitMask = 1 << bitOffset % 8;
    checkDataBounds(byteOffset, 1, s);
    const ds = getDataSection(s);
    const v = ds.segment.getUint8(ds.byteOffset + byteOffset);
    if (defaultMask === undefined)
        return (v & bitMask) !== 0;
    const defaultValue = defaultMask.getUint8(0);
    return ((v ^ defaultValue) & bitMask) !== 0;
}
exports.getBit = getBit;
function getData(index, s, defaultValue) {
    checkPointerBounds(index, s);
    const ps = getPointerSection(s);
    ps.byteOffset += index * 8;
    const l = new data_1.Data(ps.segment, ps.byteOffset, s._capnp.depthLimit - 1);
    if (pointer_1.isNull(l)) {
        if (defaultValue) {
            pointer_1.Pointer.copyFrom(defaultValue, l);
        }
        else {
            list_1.List.initList(list_element_size_1.ListElementSize.BYTE, 0, l);
        }
    }
    return l;
}
exports.getData = getData;
function getDataSection(s) {
    return pointer_1.getContent(s);
}
exports.getDataSection = getDataSection;
/**
 * Read a float32 value out of a struct.
 *
 * @param {number} byteOffset The offset in bytes from the start of the data section.
 * @param {Struct} s The struct to read from.
 * @param {DataView} [defaultMask] The default value as a DataView.
 * @returns {number} The value.
 */
function getFloat32(byteOffset, s, defaultMask) {
    checkDataBounds(byteOffset, 4, s);
    const ds = getDataSection(s);
    if (defaultMask === undefined) {
        return ds.segment.getFloat32(ds.byteOffset + byteOffset);
    }
    const v = ds.segment.getUint32(ds.byteOffset + byteOffset) ^ defaultMask.getUint32(0, true);
    TMP_WORD.setUint32(0, v, constants_1.NATIVE_LITTLE_ENDIAN);
    return TMP_WORD.getFloat32(0, constants_1.NATIVE_LITTLE_ENDIAN);
}
exports.getFloat32 = getFloat32;
/**
 * Read a float64 value out of this segment.
 *
 * @param {number} byteOffset The offset in bytes from the start of the data section.
 * @param {Struct} s The struct to read from.
 * @param {DataView} [defaultMask] The default value as a DataView.
 * @returns {number} The value.
 */
function getFloat64(byteOffset, s, defaultMask) {
    checkDataBounds(byteOffset, 8, s);
    const ds = getDataSection(s);
    if (defaultMask !== undefined) {
        const lo = ds.segment.getUint32(ds.byteOffset + byteOffset) ^ defaultMask.getUint32(0, true);
        const hi = ds.segment.getUint32(ds.byteOffset + byteOffset + 4) ^ defaultMask.getUint32(4, true);
        TMP_WORD.setUint32(0, lo, constants_1.NATIVE_LITTLE_ENDIAN);
        TMP_WORD.setUint32(4, hi, constants_1.NATIVE_LITTLE_ENDIAN);
        return TMP_WORD.getFloat64(0, constants_1.NATIVE_LITTLE_ENDIAN);
    }
    return ds.segment.getFloat64(ds.byteOffset + byteOffset);
}
exports.getFloat64 = getFloat64;
/**
 * Read an int16 value out of this segment.
 *
 * @param {number} byteOffset The offset in bytes from the start of the data section.
 * @param {Struct} s The struct to read from.
 * @param {DataView} [defaultMask] The default value as a DataView.
 * @returns {number} The value.
 */
function getInt16(byteOffset, s, defaultMask) {
    checkDataBounds(byteOffset, 2, s);
    const ds = getDataSection(s);
    if (defaultMask === undefined) {
        return ds.segment.getInt16(ds.byteOffset + byteOffset);
    }
    const v = ds.segment.getUint16(ds.byteOffset + byteOffset) ^ defaultMask.getUint16(0, true);
    TMP_WORD.setUint16(0, v, constants_1.NATIVE_LITTLE_ENDIAN);
    return TMP_WORD.getInt16(0, constants_1.NATIVE_LITTLE_ENDIAN);
}
exports.getInt16 = getInt16;
/**
 * Read an int32 value out of this segment.
 *
 * @param {number} byteOffset The offset in bytes from the start of the data section.
 * @param {Struct} s The struct to read from.
 * @param {DataView} [defaultMask] The default value as a DataView.
 * @returns {number} The value.
 */
function getInt32(byteOffset, s, defaultMask) {
    checkDataBounds(byteOffset, 4, s);
    const ds = getDataSection(s);
    if (defaultMask === undefined) {
        return ds.segment.getInt32(ds.byteOffset + byteOffset);
    }
    const v = ds.segment.getUint32(ds.byteOffset + byteOffset) ^ defaultMask.getUint16(0, true);
    TMP_WORD.setUint32(0, v, constants_1.NATIVE_LITTLE_ENDIAN);
    return TMP_WORD.getInt32(0, constants_1.NATIVE_LITTLE_ENDIAN);
}
exports.getInt32 = getInt32;
/**
 * Read an int64 value out of this segment.
 *
 * @param {number} byteOffset The offset in bytes from the start of the data section.
 * @param {Struct} s The struct to read from.
 * @param {DataView} [defaultMask] The default value as a DataView.
 * @returns {number} The value.
 */
function getInt64(byteOffset, s, defaultMask) {
    checkDataBounds(byteOffset, 8, s);
    const ds = getDataSection(s);
    if (defaultMask === undefined) {
        return ds.segment.getInt64(ds.byteOffset + byteOffset);
    }
    const lo = ds.segment.getUint32(ds.byteOffset + byteOffset) ^ defaultMask.getUint32(0, true);
    const hi = ds.segment.getUint32(ds.byteOffset + byteOffset + 4) ^ defaultMask.getUint32(4, true);
    TMP_WORD.setUint32(0, lo, constants_1.NATIVE_LITTLE_ENDIAN);
    TMP_WORD.setUint32(4, hi, constants_1.NATIVE_LITTLE_ENDIAN);
    return new index_1.Int64(new Uint8Array(TMP_WORD.buffer.slice(0)));
}
exports.getInt64 = getInt64;
/**
 * Read an int8 value out of this segment.
 *
 * @param {number} byteOffset The offset in bytes from the start of the data section.
 * @param {Struct} s The struct to read from.
 * @param {DataView} [defaultMask] The default value as a DataView.
 * @returns {number} The value.
 */
function getInt8(byteOffset, s, defaultMask) {
    checkDataBounds(byteOffset, 1, s);
    const ds = getDataSection(s);
    if (defaultMask === undefined) {
        return ds.segment.getInt8(ds.byteOffset + byteOffset);
    }
    const v = ds.segment.getUint8(ds.byteOffset + byteOffset) ^ defaultMask.getUint8(0);
    TMP_WORD.setUint8(0, v);
    return TMP_WORD.getInt8(0);
}
exports.getInt8 = getInt8;
function getList(index, ListClass, s, defaultValue) {
    checkPointerBounds(index, s);
    const ps = getPointerSection(s);
    ps.byteOffset += index * 8;
    const l = new ListClass(ps.segment, ps.byteOffset, s._capnp.depthLimit - 1);
    if (pointer_1.isNull(l)) {
        if (defaultValue) {
            pointer_1.Pointer.copyFrom(defaultValue, l);
        }
        else {
            list_1.List.initList(ListClass._capnp.size, 0, l, ListClass._capnp.compositeSize);
        }
    }
    else if (ListClass._capnp.compositeSize !== undefined) {
        // If this is a composite list we need to be sure the composite elements are big enough to hold everything as
        // specified in the schema. If the new schema has added fields we'll need to "resize" (shallow-copy) the list so
        // it has room for the new fields.
        const srcSize = pointer_1.getTargetCompositeListSize(l);
        const dstSize = ListClass._capnp.compositeSize;
        if (dstSize.dataByteLength > srcSize.dataByteLength || dstSize.pointerLength > srcSize.pointerLength) {
            const srcContent = pointer_1.getContent(l);
            const srcLength = pointer_1.getTargetListLength(l);
            trace("resizing composite list %s due to protocol upgrade, new size: %d", l, object_size_1.getByteLength(dstSize) * srcLength);
            // Allocate an extra 8 bytes for the tag.
            const dstContent = l.segment.allocate(object_size_1.getByteLength(dstSize) * srcLength + 8);
            const res = pointer_1.initPointer(dstContent.segment, dstContent.byteOffset, l);
            pointer_1.setListPointer(res.offsetWords, ListClass._capnp.size, srcLength, res.pointer, dstSize);
            // Write the new tag word.
            pointer_1.setStructPointer(srcLength, dstSize, dstContent);
            // Seek ahead past the tag word before copying the content.
            dstContent.byteOffset += 8;
            for (let i = 0; i < srcLength; i++) {
                const srcElementOffset = srcContent.byteOffset + i * object_size_1.getByteLength(srcSize);
                const dstElementOffset = dstContent.byteOffset + i * object_size_1.getByteLength(dstSize);
                // Copy the data section.
                dstContent.segment.copyWords(dstElementOffset, srcContent.segment, srcElementOffset, object_size_1.getWordLength(srcSize));
                // Iterate through the pointers and update the offsets so they point to the right place.
                for (let j = 0; j < srcSize.pointerLength; j++) {
                    const srcPtr = new pointer_1.Pointer(srcContent.segment, srcElementOffset + srcSize.dataByteLength + j * 8);
                    const dstPtr = new pointer_1.Pointer(dstContent.segment, dstElementOffset + dstSize.dataByteLength + j * 8);
                    const srcPtrTarget = pointer_1.followFars(srcPtr);
                    const srcPtrContent = pointer_1.getContent(srcPtr);
                    if (pointer_1.getTargetPointerType(srcPtr) === pointer_type_1.PointerType.LIST &&
                        pointer_1.getTargetListElementSize(srcPtr) === list_element_size_1.ListElementSize.COMPOSITE) {
                        srcPtrContent.byteOffset -= 8;
                    }
                    const r = pointer_1.initPointer(srcPtrContent.segment, srcPtrContent.byteOffset, dstPtr);
                    // Read the old pointer data, but discard the original offset.
                    const a = srcPtrTarget.segment.getUint8(srcPtrTarget.byteOffset) & 0x03;
                    const b = srcPtrTarget.segment.getUint32(srcPtrTarget.byteOffset + 4);
                    r.pointer.segment.setUint32(r.pointer.byteOffset, a | (r.offsetWords << 2));
                    r.pointer.segment.setUint32(r.pointer.byteOffset + 4, b);
                }
            }
            // Zero out the old content.
            srcContent.segment.fillZeroWords(srcContent.byteOffset, object_size_1.getWordLength(srcSize) * srcLength);
        }
    }
    return l;
}
exports.getList = getList;
function getPointer(index, s) {
    checkPointerBounds(index, s);
    const ps = getPointerSection(s);
    ps.byteOffset += index * 8;
    return new pointer_1.Pointer(ps.segment, ps.byteOffset, s._capnp.depthLimit - 1);
}
exports.getPointer = getPointer;
function getPointerAs(index, PointerClass, s) {
    checkPointerBounds(index, s);
    const ps = getPointerSection(s);
    ps.byteOffset += index * 8;
    return new PointerClass(ps.segment, ps.byteOffset, s._capnp.depthLimit - 1);
}
exports.getPointerAs = getPointerAs;
function getPointerSection(s) {
    const ps = pointer_1.getContent(s);
    ps.byteOffset += util_1.padToWord(getSize(s).dataByteLength);
    return ps;
}
exports.getPointerSection = getPointerSection;
function getSize(s) {
    if (s._capnp.compositeIndex !== undefined) {
        // For composite lists the object size is stored in a tag word right before the content.
        const c = pointer_1.getContent(s, true);
        c.byteOffset -= 8;
        return pointer_1.getStructSize(c);
    }
    return pointer_1.getTargetStructSize(s);
}
exports.getSize = getSize;
function getStruct(index, StructClass, s, defaultValue) {
    const t = getPointerAs(index, StructClass, s);
    if (pointer_1.isNull(t)) {
        if (defaultValue) {
            pointer_1.Pointer.copyFrom(defaultValue, t);
        }
        else {
            initStruct(StructClass._capnp.size, t);
        }
    }
    else {
        pointer_1.validate(pointer_type_1.PointerType.STRUCT, t);
        const ts = pointer_1.getTargetStructSize(t);
        // This can happen when reading a struct that was constructed with an older version of the same schema, and new
        // fields were added to the struct. A shallow copy of the struct will be made so that there's enough room for the
        // data and pointer sections. This will unfortunately leave a "hole" of zeroes in the message, but that hole will
        // at least compress well.
        if (ts.dataByteLength < StructClass._capnp.size.dataByteLength ||
            ts.pointerLength < StructClass._capnp.size.pointerLength) {
            trace("need to resize child struct %s", t);
            resize(StructClass._capnp.size, t);
        }
    }
    return t;
}
exports.getStruct = getStruct;
function getText(index, s, defaultValue) {
    const t = text_1.Text.fromPointer(getPointer(index, s));
    // FIXME: This will perform an unnecessary string<>ArrayBuffer roundtrip.
    if (pointer_1.isNull(t) && defaultValue)
        t.set(0, defaultValue);
    return t.get(0);
}
exports.getText = getText;
/**
 * Read an uint16 value out of a struct..
 *
 * @param {number} byteOffset The offset in bytes from the start of the data section.
 * @param {Struct} s The struct to read from.
 * @param {DataView} [defaultMask] The default value as a DataView.
 * @returns {number} The value.
 */
function getUint16(byteOffset, s, defaultMask) {
    checkDataBounds(byteOffset, 2, s);
    const ds = getDataSection(s);
    if (defaultMask === undefined) {
        return ds.segment.getUint16(ds.byteOffset + byteOffset);
    }
    return ds.segment.getUint16(ds.byteOffset + byteOffset) ^ defaultMask.getUint16(0, true);
}
exports.getUint16 = getUint16;
/**
 * Read an uint32 value out of a struct.
 *
 * @param {number} byteOffset The offset in bytes from the start of the data section.
 * @param {Struct} s The struct to read from.
 * @param {DataView} [defaultMask] The default value as a DataView.
 * @returns {number} The value.
 */
function getUint32(byteOffset, s, defaultMask) {
    checkDataBounds(byteOffset, 4, s);
    const ds = getDataSection(s);
    if (defaultMask === undefined) {
        return ds.segment.getUint32(ds.byteOffset + byteOffset);
    }
    return ds.segment.getUint32(ds.byteOffset + byteOffset) ^ defaultMask.getUint32(0, true);
}
exports.getUint32 = getUint32;
/**
 * Read an uint64 value out of a struct.
 *
 * @param {number} byteOffset The offset in bytes from the start of the data section.
 * @param {Struct} s The struct to read from.
 * @param {DataView} [defaultMask] The default value as a DataView.
 * @returns {number} The value.
 */
function getUint64(byteOffset, s, defaultMask) {
    checkDataBounds(byteOffset, 8, s);
    const ds = getDataSection(s);
    if (defaultMask === undefined) {
        return ds.segment.getUint64(ds.byteOffset + byteOffset);
    }
    const lo = ds.segment.getUint32(ds.byteOffset + byteOffset) ^ defaultMask.getUint32(0, true);
    const hi = ds.segment.getUint32(ds.byteOffset + byteOffset + 4) ^ defaultMask.getUint32(4, true);
    TMP_WORD.setUint32(0, lo, constants_1.NATIVE_LITTLE_ENDIAN);
    TMP_WORD.setUint32(4, hi, constants_1.NATIVE_LITTLE_ENDIAN);
    return new index_1.Uint64(new Uint8Array(TMP_WORD.buffer.slice(0)));
}
exports.getUint64 = getUint64;
/**
 * Read an uint8 value out of a struct.
 *
 * @param {number} byteOffset The offset in bytes from the start of the data section.
 * @param {Struct} s The struct to read from.
 * @param {DataView} [defaultMask] The default value as a DataView.
 * @returns {number} The value.
 */
function getUint8(byteOffset, s, defaultMask) {
    checkDataBounds(byteOffset, 1, s);
    const ds = getDataSection(s);
    if (defaultMask === undefined) {
        return ds.segment.getUint8(ds.byteOffset + byteOffset);
    }
    return ds.segment.getUint8(ds.byteOffset + byteOffset) ^ defaultMask.getUint8(0);
}
exports.getUint8 = getUint8;
function getVoid() {
    throw new Error(errors_1.INVARIANT_UNREACHABLE_CODE);
}
exports.getVoid = getVoid;
function initData(index, length, s) {
    checkPointerBounds(index, s);
    const ps = getPointerSection(s);
    ps.byteOffset += index * 8;
    const l = new data_1.Data(ps.segment, ps.byteOffset, s._capnp.depthLimit - 1);
    pointer_1.erase(l);
    list_1.List.initList(list_element_size_1.ListElementSize.BYTE, length, l);
    return l;
}
exports.initData = initData;
function initList(index, ListClass, length, s) {
    checkPointerBounds(index, s);
    const ps = getPointerSection(s);
    ps.byteOffset += index * 8;
    const l = new ListClass(ps.segment, ps.byteOffset, s._capnp.depthLimit - 1);
    pointer_1.erase(l);
    list_1.List.initList(ListClass._capnp.size, length, l, ListClass._capnp.compositeSize);
    return l;
}
exports.initList = initList;
/**
 * Write a boolean (bit) value to the struct.
 *
 * @protected
 * @param {number} bitOffset The offset in **bits** from the start of the data section.
 * @param {boolean} value The value to write (writes a 0 for `false`, 1 for `true`).
 * @param {Struct} s The struct to write to.
 * @param {DataView} [defaultMask] The default value as a DataView.
 * @returns {void}
 */
function setBit(bitOffset, value, s, defaultMask) {
    const byteOffset = Math.floor(bitOffset / 8);
    const bitMask = 1 << bitOffset % 8;
    checkDataBounds(byteOffset, 1, s);
    const ds = getDataSection(s);
    const b = ds.segment.getUint8(ds.byteOffset + byteOffset);
    // If the default mask bit is set, that means `true` values are actually written as `0`.
    if (defaultMask !== undefined) {
        value = (defaultMask.getUint8(0) & bitMask) !== 0 ? !value : value;
    }
    ds.segment.setUint8(ds.byteOffset + byteOffset, value ? b | bitMask : b & ~bitMask);
}
exports.setBit = setBit;
/**
 * Write a primitive float32 value to the struct.
 *
 * @protected
 * @param {number} byteOffset The offset in bytes from the start of the data section.
 * @param {number} value The value to write.
 * @param {Struct} s The struct to write to.
 * @param {DataView} [defaultMask] The default value as a DataView.
 * @returns {void}
 */
function setFloat32(byteOffset, value, s, defaultMask) {
    checkDataBounds(byteOffset, 4, s);
    const ds = getDataSection(s);
    if (defaultMask !== undefined) {
        TMP_WORD.setFloat32(0, value, constants_1.NATIVE_LITTLE_ENDIAN);
        const v = TMP_WORD.getUint32(0, constants_1.NATIVE_LITTLE_ENDIAN) ^ defaultMask.getUint32(0, true);
        ds.segment.setUint32(ds.byteOffset + byteOffset, v);
        return;
    }
    ds.segment.setFloat32(ds.byteOffset + byteOffset, value);
}
exports.setFloat32 = setFloat32;
/**
 * Write a primitive float64 value to the struct.
 *
 * @protected
 * @param {number} byteOffset The offset in bytes from the start of the data section.
 * @param {number} value The value to write.
 * @param {Struct} s The struct to write to.
 * @param {DataView} [defaultMask] The default value as a DataView.
 * @returns {void}
 */
function setFloat64(byteOffset, value, s, defaultMask) {
    checkDataBounds(byteOffset, 8, s);
    const ds = getDataSection(s);
    if (defaultMask !== undefined) {
        TMP_WORD.setFloat64(0, value, constants_1.NATIVE_LITTLE_ENDIAN);
        const lo = TMP_WORD.getUint32(0, constants_1.NATIVE_LITTLE_ENDIAN) ^ defaultMask.getUint32(0, true);
        const hi = TMP_WORD.getUint32(4, constants_1.NATIVE_LITTLE_ENDIAN) ^ defaultMask.getUint32(4, true);
        ds.segment.setUint32(ds.byteOffset + byteOffset, lo);
        ds.segment.setUint32(ds.byteOffset + byteOffset + 4, hi);
        return;
    }
    ds.segment.setFloat64(ds.byteOffset + byteOffset, value);
}
exports.setFloat64 = setFloat64;
/**
 * Write a primitive int16 value to the struct.
 *
 * @protected
 * @param {number} byteOffset The offset in bytes from the start of the data section.
 * @param {number} value The value to write.
 * @param {Struct} s The struct to write to.
 * @param {DataView} [defaultMask] The default value as a DataView.
 * @returns {void}
 */
function setInt16(byteOffset, value, s, defaultMask) {
    checkDataBounds(byteOffset, 2, s);
    const ds = getDataSection(s);
    if (defaultMask !== undefined) {
        TMP_WORD.setInt16(0, value, constants_1.NATIVE_LITTLE_ENDIAN);
        const v = TMP_WORD.getUint16(0, constants_1.NATIVE_LITTLE_ENDIAN) ^ defaultMask.getUint16(0, true);
        ds.segment.setUint16(ds.byteOffset + byteOffset, v);
        return;
    }
    ds.segment.setInt16(ds.byteOffset + byteOffset, value);
}
exports.setInt16 = setInt16;
/**
 * Write a primitive int32 value to the struct.
 *
 * @protected
 * @param {number} byteOffset The offset in bytes from the start of the data section.
 * @param {number} value The value to write.
 * @param {Struct} s The struct to write to.
 * @param {DataView} [defaultMask] The default value as a DataView.
 * @returns {void}
 */
function setInt32(byteOffset, value, s, defaultMask) {
    checkDataBounds(byteOffset, 4, s);
    const ds = getDataSection(s);
    if (defaultMask !== undefined) {
        TMP_WORD.setInt32(0, value, constants_1.NATIVE_LITTLE_ENDIAN);
        const v = TMP_WORD.getUint32(0, constants_1.NATIVE_LITTLE_ENDIAN) ^ defaultMask.getUint32(0, true);
        ds.segment.setUint32(ds.byteOffset + byteOffset, v);
        return;
    }
    ds.segment.setInt32(ds.byteOffset + byteOffset, value);
}
exports.setInt32 = setInt32;
/**
 * Write a primitive int64 value to the struct.
 *
 * @protected
 * @param {number} byteOffset The offset in bytes from the start of the data section.
 * @param {number} value The value to write.
 * @param {Struct} s The struct to write to.
 * @param {DataView} [defaultMask] The default value as a DataView.
 * @returns {void}
 */
function setInt64(byteOffset, value, s, defaultMask) {
    checkDataBounds(byteOffset, 8, s);
    const ds = getDataSection(s);
    if (defaultMask !== undefined) {
        // PERF: We could cast the Int64 to a DataView to apply the mask using four 32-bit reads, but we already have a
        // typed array so avoiding the object allocation turns out to be slightly faster. Int64 is guaranteed to be in
        // little-endian format by design.
        for (let i = 0; i < 8; i++) {
            ds.segment.setUint8(ds.byteOffset + byteOffset + i, value.buffer[i] ^ defaultMask.getUint8(i));
        }
        return;
    }
    ds.segment.setInt64(ds.byteOffset + byteOffset, value);
}
exports.setInt64 = setInt64;
/**
 * Write a primitive int8 value to the struct.
 *
 * @protected
 * @param {number} byteOffset The offset in bytes from the start of the data section.
 * @param {number} value The value to write.
 * @param {Struct} s The struct to write to.
 * @param {DataView} [defaultMask] The default value as a DataView.
 * @returns {void}
 */
function setInt8(byteOffset, value, s, defaultMask) {
    checkDataBounds(byteOffset, 1, s);
    const ds = getDataSection(s);
    if (defaultMask !== undefined) {
        TMP_WORD.setInt8(0, value);
        const v = TMP_WORD.getUint8(0) ^ defaultMask.getUint8(0);
        ds.segment.setUint8(ds.byteOffset + byteOffset, v);
        return;
    }
    ds.segment.setInt8(ds.byteOffset + byteOffset, value);
}
exports.setInt8 = setInt8;
function setPointer(index, value, s) {
    pointer_1.copyFrom(value, getPointer(index, s));
}
exports.setPointer = setPointer;
function setText(index, value, s) {
    text_1.Text.fromPointer(getPointer(index, s)).set(0, value);
}
exports.setText = setText;
/**
 * Write a primitive uint16 value to the struct.
 *
 * @protected
 * @param {number} byteOffset The offset in bytes from the start of the data section.
 * @param {number} value The value to write.
 * @param {Struct} s The struct to write to.
 * @param {DataView} [defaultMask] The default value as a DataView.
 * @returns {void}
 */
function setUint16(byteOffset, value, s, defaultMask) {
    checkDataBounds(byteOffset, 2, s);
    const ds = getDataSection(s);
    if (defaultMask !== undefined)
        value ^= defaultMask.getUint16(0, true);
    ds.segment.setUint16(ds.byteOffset + byteOffset, value);
}
exports.setUint16 = setUint16;
/**
 * Write a primitive uint32 value to the struct.
 *
 * @protected
 * @param {number} byteOffset The offset in bytes from the start of the data section.
 * @param {number} value The value to write.
 * @param {Struct} s The struct to write to.
 * @param {DataView} [defaultMask] The default value as a DataView.
 * @returns {void}
 */
function setUint32(byteOffset, value, s, defaultMask) {
    checkDataBounds(byteOffset, 4, s);
    const ds = getDataSection(s);
    if (defaultMask !== undefined)
        value ^= defaultMask.getUint32(0, true);
    ds.segment.setUint32(ds.byteOffset + byteOffset, value);
}
exports.setUint32 = setUint32;
/**
 * Write a primitive uint64 value to the struct.
 *
 * @protected
 * @param {number} byteOffset The offset in bytes from the start of the data section.
 * @param {number} value The value to write.
 * @param {Struct} s The struct to write to.
 * @param {DataView} [defaultMask] The default value as a DataView.
 * @returns {void}
 */
function setUint64(byteOffset, value, s, defaultMask) {
    checkDataBounds(byteOffset, 8, s);
    const ds = getDataSection(s);
    if (defaultMask !== undefined) {
        // PERF: We could cast the Uint64 to a DataView to apply the mask using four 32-bit reads, but we already have a
        // typed array so avoiding the object allocation turns out to be slightly faster. Uint64 is guaranteed to be in
        // little-endian format by design.
        for (let i = 0; i < 8; i++) {
            ds.segment.setUint8(ds.byteOffset + byteOffset + i, value.buffer[i] ^ defaultMask.getUint8(i));
        }
        return;
    }
    ds.segment.setUint64(ds.byteOffset + byteOffset, value);
}
exports.setUint64 = setUint64;
/**
 * Write a primitive uint8 value to the struct.
 *
 * @protected
 * @param {number} byteOffset The offset in bytes from the start of the data section.
 * @param {number} value The value to write.
 * @param {Struct} s The struct to write to.
 * @param {DataView} [defaultMask] The default value as a DataView.
 * @returns {void}
 */
function setUint8(byteOffset, value, s, defaultMask) {
    checkDataBounds(byteOffset, 1, s);
    const ds = getDataSection(s);
    if (defaultMask !== undefined)
        value ^= defaultMask.getUint8(0);
    ds.segment.setUint8(ds.byteOffset + byteOffset, value);
}
exports.setUint8 = setUint8;
function setVoid() {
    throw new Error(errors_1.INVARIANT_UNREACHABLE_CODE);
}
exports.setVoid = setVoid;
function testWhich(name, found, wanted, s) {
    if (found !== wanted) {
        throw new Error(util_1.format(errors_1.PTR_INVALID_UNION_ACCESS, s, name, found, wanted));
    }
}
exports.testWhich = testWhich;
function checkDataBounds(byteOffset, byteLength, s) {
    const dataByteLength = getSize(s).dataByteLength;
    if (byteOffset < 0 || byteLength < 0 || byteOffset + byteLength > dataByteLength) {
        throw new Error(util_1.format(errors_1.PTR_STRUCT_DATA_OUT_OF_BOUNDS, s, byteLength, byteOffset, dataByteLength));
    }
}
exports.checkDataBounds = checkDataBounds;
function checkPointerBounds(index, s) {
    const pointerLength = getSize(s).pointerLength;
    if (index < 0 || index >= pointerLength) {
        throw new Error(util_1.format(errors_1.PTR_STRUCT_POINTER_OUT_OF_BOUNDS, s, index, pointerLength));
    }
}
exports.checkPointerBounds = checkPointerBounds;
//# sourceMappingURL=struct.js.map