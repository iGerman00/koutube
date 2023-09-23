/**
 * @author jdiaz5513
 */
/**
 * A simple object that describes the size of a struct.
 *
 * @export
 * @class ObjectSize
 */
export declare class ObjectSize {
    /** The number of bytes required for the data section. */
    readonly dataByteLength: number;
    /** The number of pointers in the object. */
    readonly pointerLength: number;
    constructor(dataByteLength: number, pointerCount: number);
    toString(): string;
}
export declare function getByteLength(o: ObjectSize): number;
export declare function getDataWordLength(o: ObjectSize): number;
export declare function getWordLength(o: ObjectSize): number;
export declare function padToWord(o: ObjectSize): ObjectSize;
