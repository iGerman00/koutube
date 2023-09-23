/**
 * @author jdiaz5513
 */
import { List } from "./list";
import { Pointer } from "./pointer";
export declare class Text extends List<string> {
    static fromPointer(pointer: Pointer): Text;
    /**
     * Read a utf-8 encoded string value from this pointer.
     *
     * @param {number} [index] The index at which to start reading; defaults to zero.
     * @returns {string} The string value.
     */
    get(index?: number): string;
    /**
     * Get the number of utf-8 encoded bytes in this text. This does **not** include the NUL byte.
     *
     * @returns {number} The number of bytes allocated for the text.
     */
    getLength(): number;
    /**
     * Write a utf-8 encoded string value starting at the specified index.
     *
     * @param {number} index The index at which to start copying the string. Note that if this is not zero the bytes
     * before `index` will be left as-is. All bytes after `index` will be overwritten.
     * @param {string} value The string value to set.
     * @returns {void}
     */
    set(index: number, value: string): void;
    toString(): string;
}
