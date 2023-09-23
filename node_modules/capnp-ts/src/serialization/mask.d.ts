/**
 * @author jdiaz5513
 */
import { Int64, Uint64 } from "../types/index";
export declare const getFloat32Mask: (x: number) => DataView;
export declare const getFloat64Mask: (x: number) => DataView;
export declare const getInt16Mask: (x: number) => DataView;
export declare const getInt32Mask: (x: number) => DataView;
export declare const getInt8Mask: (x: number) => DataView;
export declare const getUint16Mask: (x: number) => DataView;
export declare const getUint32Mask: (x: number) => DataView;
export declare const getUint8Mask: (x: number) => DataView;
export declare function getBitMask(value: boolean, bitOffset: number): DataView;
export declare function getInt64Mask(x: Int64): DataView;
export declare function getUint64Mask(x: Uint64): DataView;
export declare function getVoidMask(): void;
