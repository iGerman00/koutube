"use strict";
/**
 * @author jdiaz5513
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Text = void 0;
const tslib_1 = require("tslib");
const debug_1 = tslib_1.__importDefault(require("debug"));
const util_1 = require("../../util");
const list_element_size_1 = require("../list-element-size");
const list_1 = require("./list");
const pointer_1 = require("./pointer");
const pointer_type_1 = require("./pointer-type");
const trace = debug_1.default("capnp:text");
trace("load");
class Text extends list_1.List {
    static fromPointer(pointer) {
        pointer_1.validate(pointer_type_1.PointerType.LIST, pointer, list_element_size_1.ListElementSize.BYTE);
        return textFromPointerUnchecked(pointer);
    }
    /**
     * Read a utf-8 encoded string value from this pointer.
     *
     * @param {number} [index] The index at which to start reading; defaults to zero.
     * @returns {string} The string value.
     */
    get(index = 0) {
        if (index !== 0) {
            trace("Called get() on %s with a strange index (%d).", this, index);
        }
        if (pointer_1.isNull(this))
            return "";
        const c = pointer_1.getContent(this);
        // Remember to exclude the NUL byte.
        return util_1.decodeUtf8(new Uint8Array(c.segment.buffer, c.byteOffset + index, this.getLength() - index));
    }
    /**
     * Get the number of utf-8 encoded bytes in this text. This does **not** include the NUL byte.
     *
     * @returns {number} The number of bytes allocated for the text.
     */
    getLength() {
        return super.getLength() - 1;
    }
    /**
     * Write a utf-8 encoded string value starting at the specified index.
     *
     * @param {number} index The index at which to start copying the string. Note that if this is not zero the bytes
     * before `index` will be left as-is. All bytes after `index` will be overwritten.
     * @param {string} value The string value to set.
     * @returns {void}
     */
    set(index, value) {
        if (index !== 0) {
            trace("Called set() on %s with a strange index (%d).", this, index);
        }
        const src = util_1.encodeUtf8(value);
        const dstLength = src.byteLength + index;
        let c;
        let original;
        // TODO: Consider reusing existing space if list is already initialized and there's enough room for the value.
        if (!pointer_1.isNull(this)) {
            c = pointer_1.getContent(this);
            // Only copy bytes that will remain after copying. Everything after `index` should end up truncated.
            let originalLength = this.getLength();
            if (originalLength >= index) {
                originalLength = index;
            }
            else {
                trace("%d byte gap exists between original text and new text in %s.", index - originalLength, this);
            }
            original = new Uint8Array(c.segment.buffer.slice(c.byteOffset, c.byteOffset + Math.min(originalLength, index)));
            pointer_1.erase(this);
        }
        // Always allocate an extra byte for the NUL byte.
        list_1.initList(list_element_size_1.ListElementSize.BYTE, dstLength + 1, this);
        c = pointer_1.getContent(this);
        const dst = new Uint8Array(c.segment.buffer, c.byteOffset, dstLength);
        if (original)
            dst.set(original);
        dst.set(src, index);
    }
    toString() {
        return `Text_${super.toString()}`;
    }
}
exports.Text = Text;
function textFromPointerUnchecked(pointer) {
    return new Text(pointer.segment, pointer.byteOffset, pointer._capnp.depthLimit);
}
//# sourceMappingURL=text.js.map