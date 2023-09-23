/**
 * @author jdiaz5513
 */
import { Int64, Uint64 } from "../../types/index";
import { ObjectSize } from "../object-size";
import { Segment } from "../segment";
import { Data } from "./data";
import { List, ListCtor } from "./list";
import { Orphan } from "./orphan";
import { _Pointer, _PointerCtor, Pointer, PointerCtor } from "./pointer";
export interface _StructCtor extends _PointerCtor {
    readonly id: string;
    readonly size: ObjectSize;
}
export interface StructCtor<T extends Struct> {
    readonly _capnp: _StructCtor;
    new (segment: Segment, byteOffset: number, depthLimit?: number, compositeIndex?: number): T;
}
export interface _Struct extends _Pointer {
    compositeIndex?: number;
}
export declare class Struct extends Pointer {
    static readonly _capnp: {
        displayName: string;
    };
    static readonly getAs: typeof getAs;
    static readonly getBit: typeof getBit;
    static readonly getData: typeof getData;
    static readonly getFloat32: typeof getFloat32;
    static readonly getFloat64: typeof getFloat64;
    static readonly getUint8: typeof getUint8;
    static readonly getUint16: typeof getUint16;
    static readonly getUint32: typeof getUint32;
    static readonly getUint64: typeof getUint64;
    static readonly getInt8: typeof getInt8;
    static readonly getInt16: typeof getInt16;
    static readonly getInt32: typeof getInt32;
    static readonly getInt64: typeof getInt64;
    static readonly getList: typeof getList;
    static readonly getPointer: typeof getPointer;
    static readonly getPointerAs: typeof getPointerAs;
    static readonly getStruct: typeof getStruct;
    static readonly getText: typeof getText;
    static readonly initData: typeof initData;
    static readonly initList: typeof initList;
    static readonly initStruct: typeof initStruct;
    static readonly initStructAt: typeof initStructAt;
    static readonly setBit: typeof setBit;
    static readonly setFloat32: typeof setFloat32;
    static readonly setFloat64: typeof setFloat64;
    static readonly setUint8: typeof setUint8;
    static readonly setUint16: typeof setUint16;
    static readonly setUint32: typeof setUint32;
    static readonly setUint64: typeof setUint64;
    static readonly setInt8: typeof setInt8;
    static readonly setInt16: typeof setInt16;
    static readonly setInt32: typeof setInt32;
    static readonly setInt64: typeof setInt64;
    static readonly setText: typeof setText;
    static readonly testWhich: typeof testWhich;
    readonly _capnp: _Struct;
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
    constructor(segment: Segment, byteOffset: number, depthLimit?: number, compositeIndex?: number);
    static toString(): string;
    toString(): string;
}
/**
 * Initialize a struct with the provided object size. This will allocate new space for the struct contents, ideally in
 * the same segment as this pointer.
 *
 * @param {ObjectSize} size An object describing the size of the struct's data and pointer sections.
 * @param {Struct} s The struct to initialize.
 * @returns {void}
 */
export declare function initStruct(size: ObjectSize, s: Struct): void;
export declare function initStructAt<T extends Struct>(index: number, StructClass: StructCtor<T>, p: Pointer): T;
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
export declare function resize(dstSize: ObjectSize, s: Struct): void;
export declare function adopt<T extends Struct>(src: Orphan<T>, s: Struct): void;
export declare function disown<T extends Struct>(s: Struct): Orphan<T>;
/**
 * Convert a struct to a struct of the provided class. Particularly useful when casting to nested group types.
 *
 * @protected
 * @template T
 * @param {StructCtor<T>} StructClass The struct class to convert to. Not particularly useful if `Struct`.
 * @param {Struct} s The struct to convert.
 * @returns {T} A new instance of the desired struct class pointing to the same location.
 */
export declare function getAs<T extends Struct>(StructClass: StructCtor<T>, s: Struct): T;
/**
 * Read a boolean (bit) value out of a struct.
 *
 * @protected
 * @param {number} bitOffset The offset in **bits** from the start of the data section.
 * @param {Struct} s The struct to read from.
 * @param {DataView} [defaultMask] The default value as a DataView.
 * @returns {boolean} The value.
 */
export declare function getBit(bitOffset: number, s: Struct, defaultMask?: DataView): boolean;
export declare function getData(index: number, s: Struct, defaultValue?: Pointer): Data;
export declare function getDataSection(s: Struct): Pointer;
/**
 * Read a float32 value out of a struct.
 *
 * @param {number} byteOffset The offset in bytes from the start of the data section.
 * @param {Struct} s The struct to read from.
 * @param {DataView} [defaultMask] The default value as a DataView.
 * @returns {number} The value.
 */
export declare function getFloat32(byteOffset: number, s: Struct, defaultMask?: DataView): number;
/**
 * Read a float64 value out of this segment.
 *
 * @param {number} byteOffset The offset in bytes from the start of the data section.
 * @param {Struct} s The struct to read from.
 * @param {DataView} [defaultMask] The default value as a DataView.
 * @returns {number} The value.
 */
export declare function getFloat64(byteOffset: number, s: Struct, defaultMask?: DataView): number;
/**
 * Read an int16 value out of this segment.
 *
 * @param {number} byteOffset The offset in bytes from the start of the data section.
 * @param {Struct} s The struct to read from.
 * @param {DataView} [defaultMask] The default value as a DataView.
 * @returns {number} The value.
 */
export declare function getInt16(byteOffset: number, s: Struct, defaultMask?: DataView): number;
/**
 * Read an int32 value out of this segment.
 *
 * @param {number} byteOffset The offset in bytes from the start of the data section.
 * @param {Struct} s The struct to read from.
 * @param {DataView} [defaultMask] The default value as a DataView.
 * @returns {number} The value.
 */
export declare function getInt32(byteOffset: number, s: Struct, defaultMask?: DataView): number;
/**
 * Read an int64 value out of this segment.
 *
 * @param {number} byteOffset The offset in bytes from the start of the data section.
 * @param {Struct} s The struct to read from.
 * @param {DataView} [defaultMask] The default value as a DataView.
 * @returns {number} The value.
 */
export declare function getInt64(byteOffset: number, s: Struct, defaultMask?: DataView): Int64;
/**
 * Read an int8 value out of this segment.
 *
 * @param {number} byteOffset The offset in bytes from the start of the data section.
 * @param {Struct} s The struct to read from.
 * @param {DataView} [defaultMask] The default value as a DataView.
 * @returns {number} The value.
 */
export declare function getInt8(byteOffset: number, s: Struct, defaultMask?: DataView): number;
export declare function getList<T>(index: number, ListClass: ListCtor<T>, s: Struct, defaultValue?: Pointer): List<T>;
export declare function getPointer(index: number, s: Struct): Pointer;
export declare function getPointerAs<T extends Pointer>(index: number, PointerClass: PointerCtor<T>, s: Struct): T;
export declare function getPointerSection(s: Struct): Pointer;
export declare function getSize(s: Struct): ObjectSize;
export declare function getStruct<T extends Struct>(index: number, StructClass: StructCtor<T>, s: Struct, defaultValue?: Pointer): T;
export declare function getText(index: number, s: Struct, defaultValue?: string): string;
/**
 * Read an uint16 value out of a struct..
 *
 * @param {number} byteOffset The offset in bytes from the start of the data section.
 * @param {Struct} s The struct to read from.
 * @param {DataView} [defaultMask] The default value as a DataView.
 * @returns {number} The value.
 */
export declare function getUint16(byteOffset: number, s: Struct, defaultMask?: DataView): number;
/**
 * Read an uint32 value out of a struct.
 *
 * @param {number} byteOffset The offset in bytes from the start of the data section.
 * @param {Struct} s The struct to read from.
 * @param {DataView} [defaultMask] The default value as a DataView.
 * @returns {number} The value.
 */
export declare function getUint32(byteOffset: number, s: Struct, defaultMask?: DataView): number;
/**
 * Read an uint64 value out of a struct.
 *
 * @param {number} byteOffset The offset in bytes from the start of the data section.
 * @param {Struct} s The struct to read from.
 * @param {DataView} [defaultMask] The default value as a DataView.
 * @returns {number} The value.
 */
export declare function getUint64(byteOffset: number, s: Struct, defaultMask?: DataView): Uint64;
/**
 * Read an uint8 value out of a struct.
 *
 * @param {number} byteOffset The offset in bytes from the start of the data section.
 * @param {Struct} s The struct to read from.
 * @param {DataView} [defaultMask] The default value as a DataView.
 * @returns {number} The value.
 */
export declare function getUint8(byteOffset: number, s: Struct, defaultMask?: DataView): number;
export declare function getVoid(): void;
export declare function initData(index: number, length: number, s: Struct): Data;
export declare function initList<T>(index: number, ListClass: ListCtor<T>, length: number, s: Struct): List<T>;
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
export declare function setBit(bitOffset: number, value: boolean, s: Struct, defaultMask?: DataView): void;
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
export declare function setFloat32(byteOffset: number, value: number, s: Struct, defaultMask?: DataView): void;
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
export declare function setFloat64(byteOffset: number, value: number, s: Struct, defaultMask?: DataView): void;
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
export declare function setInt16(byteOffset: number, value: number, s: Struct, defaultMask?: DataView): void;
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
export declare function setInt32(byteOffset: number, value: number, s: Struct, defaultMask?: DataView): void;
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
export declare function setInt64(byteOffset: number, value: Int64, s: Struct, defaultMask?: DataView): void;
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
export declare function setInt8(byteOffset: number, value: number, s: Struct, defaultMask?: DataView): void;
export declare function setPointer(index: number, value: Pointer, s: Struct): void;
export declare function setText(index: number, value: string, s: Struct): void;
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
export declare function setUint16(byteOffset: number, value: number, s: Struct, defaultMask?: DataView): void;
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
export declare function setUint32(byteOffset: number, value: number, s: Struct, defaultMask?: DataView): void;
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
export declare function setUint64(byteOffset: number, value: Uint64, s: Struct, defaultMask?: DataView): void;
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
export declare function setUint8(byteOffset: number, value: number, s: Struct, defaultMask?: DataView): void;
export declare function setVoid(): void;
export declare function testWhich(name: string, found: number, wanted: number, s: Struct): void;
export declare function checkDataBounds(byteOffset: number, byteLength: number, s: Struct): void;
export declare function checkPointerBounds(index: number, s: Struct): void;
