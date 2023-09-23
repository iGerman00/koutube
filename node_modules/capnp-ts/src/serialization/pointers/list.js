"use strict";
/**
 * @author jdiaz5513
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.set = exports.get = exports.initList = exports.List = void 0;
const tslib_1 = require("tslib");
const debug_1 = tslib_1.__importDefault(require("debug"));
const errors_1 = require("../../errors");
const util_1 = require("../../util");
const list_element_size_1 = require("../list-element-size");
const object_size_1 = require("../object-size");
const pointer_1 = require("./pointer");
const trace = debug_1.default("capnp:list");
trace("load");
/**
 * A generic list class. Implements Filterable,
 */
class List extends pointer_1.Pointer {
    static toString() {
        return this._capnp.displayName;
    }
    all(callbackfn) {
        const length = this.getLength();
        for (let i = 0; i < length; i++) {
            if (!callbackfn(this.get(i), i))
                return false;
        }
        return true;
    }
    any(callbackfn) {
        const length = this.getLength();
        for (let i = 0; i < length; i++) {
            if (callbackfn(this.get(i), i))
                return true;
        }
        return false;
    }
    ap(callbackfns) {
        const length = this.getLength();
        const res = [];
        for (let i = 0; i < length; i++) {
            res.push(...callbackfns.map((f) => f(this.get(i), i)));
        }
        return res;
    }
    concat(other) {
        const length = this.getLength();
        const otherLength = other.getLength();
        const res = new Array(length + otherLength);
        for (let i = 0; i < length; i++)
            res[i] = this.get(i);
        for (let i = 0; i < otherLength; i++)
            res[i + length] = other.get(i);
        return res;
    }
    drop(n) {
        const length = this.getLength();
        const res = new Array(length);
        for (let i = n; i < length; i++)
            res[i] = this.get(i);
        return res;
    }
    dropWhile(callbackfn) {
        const length = this.getLength();
        const res = [];
        let drop = true;
        for (let i = 0; i < length; i++) {
            const v = this.get(i);
            if (drop)
                drop = callbackfn(v, i);
            if (!drop)
                res.push(v);
        }
        return res;
    }
    empty() {
        return [];
    }
    every(callbackfn) {
        return this.all(callbackfn);
    }
    filter(callbackfn) {
        const length = this.getLength();
        const res = [];
        for (let i = 0; i < length; i++) {
            const value = this.get(i);
            if (callbackfn(value, i))
                res.push(value);
        }
        return res;
    }
    find(callbackfn) {
        const length = this.getLength();
        for (let i = 0; i < length; i++) {
            const value = this.get(i);
            if (callbackfn(value, i))
                return value;
        }
        return undefined;
    }
    findIndex(callbackfn) {
        const length = this.getLength();
        for (let i = 0; i < length; i++) {
            const value = this.get(i);
            if (callbackfn(value, i))
                return i;
        }
        return -1;
    }
    forEach(callbackfn) {
        const length = this.getLength();
        for (let i = 0; i < length; i++)
            callbackfn(this.get(i), i);
    }
    get(_index) {
        return get(_index, this);
    }
    /**
     * Get the length of this list.
     *
     * @returns {number} The number of elements in this list.
     */
    getLength() {
        return pointer_1.getTargetListLength(this);
    }
    groupBy(callbackfn) {
        const length = this.getLength();
        const res = {};
        for (let i = 0; i < length; i++) {
            const v = this.get(i);
            res[callbackfn(v, i)] = v;
        }
        return res;
    }
    intersperse(sep) {
        const length = this.getLength();
        const res = new Array(length);
        for (let i = 0; i < length; i++) {
            if (i > 0)
                res.push(sep);
            res.push(this.get(i));
        }
        return res;
    }
    map(callbackfn) {
        const length = this.getLength();
        const res = new Array(length);
        for (let i = 0; i < length; i++)
            res[i] = callbackfn(this.get(i), i);
        return res;
    }
    reduce(callbackfn, initialValue) {
        let i = 0;
        let res;
        if (initialValue === undefined) {
            res = this.get(0);
            i++;
        }
        else {
            res = initialValue;
        }
        for (; i < this.getLength(); i++)
            res = callbackfn(res, this.get(i), i);
        return res;
    }
    set(_index, _value) {
        set(_index, _value, this);
    }
    slice(start = 0, end) {
        const length = end ? Math.min(this.getLength(), end) : this.getLength();
        const res = new Array(length - start);
        for (let i = start; i < length; i++)
            res[i] = this.get(i);
        return res;
    }
    some(callbackfn) {
        return this.any(callbackfn);
    }
    take(n) {
        const length = Math.min(this.getLength(), n);
        const res = new Array(length);
        for (let i = 0; i < length; i++)
            res[i] = this.get(i);
        return res;
    }
    takeWhile(callbackfn) {
        const length = this.getLength();
        const res = [];
        let take;
        for (let i = 0; i < length; i++) {
            const v = this.get(i);
            take = callbackfn(v, i);
            if (!take)
                return res;
            res.push(v);
        }
        return res;
    }
    toArray() {
        return this.map(util_1.identity);
    }
    toString() {
        return `List_${super.toString()}`;
    }
}
exports.List = List;
List._capnp = {
    displayName: "List<Generic>",
    size: list_element_size_1.ListElementSize.VOID,
};
List.get = get;
List.initList = initList;
List.set = set;
/**
 * Initialize the list with the given element size and length. This will allocate new space for the list, ideally in
 * the same segment as this pointer.
 *
 * @param {ListElementSize} elementSize The size of each element in the list.
 * @param {number} length The number of elements in the list.
 * @param {List<T>} l The list to initialize.
 * @param {ObjectSize} [compositeSize] The size of each element in a composite list. This value is required for
 * composite lists.
 * @returns {void}
 */
function initList(elementSize, length, l, compositeSize) {
    let c;
    switch (elementSize) {
        case list_element_size_1.ListElementSize.BIT:
            c = l.segment.allocate(Math.ceil(length / 8));
            break;
        case list_element_size_1.ListElementSize.BYTE:
        case list_element_size_1.ListElementSize.BYTE_2:
        case list_element_size_1.ListElementSize.BYTE_4:
        case list_element_size_1.ListElementSize.BYTE_8:
        case list_element_size_1.ListElementSize.POINTER:
            c = l.segment.allocate(length * pointer_1.getListElementByteLength(elementSize));
            break;
        case list_element_size_1.ListElementSize.COMPOSITE: {
            if (compositeSize === undefined) {
                throw new Error(util_1.format(errors_1.PTR_COMPOSITE_SIZE_UNDEFINED));
            }
            compositeSize = object_size_1.padToWord(compositeSize);
            const byteLength = object_size_1.getByteLength(compositeSize) * length;
            // We need to allocate an extra 8 bytes for the tag word, then make sure we write the length to it. We advance
            // the content pointer by 8 bytes so that it then points to the first list element as intended. Everything
            // starts off zeroed out so these nested structs don't need to be initialized in any way.
            c = l.segment.allocate(byteLength + 8);
            pointer_1.setStructPointer(length, compositeSize, c);
            trace("Wrote composite tag word %s for %s.", c, l);
            break;
        }
        case list_element_size_1.ListElementSize.VOID:
            // No need to allocate anything, we can write the list pointer right here.
            pointer_1.setListPointer(0, elementSize, length, l);
            return;
        default:
            throw new Error(util_1.format(errors_1.PTR_INVALID_LIST_SIZE, elementSize));
    }
    const res = pointer_1.initPointer(c.segment, c.byteOffset, l);
    pointer_1.setListPointer(res.offsetWords, elementSize, length, res.pointer, compositeSize);
}
exports.initList = initList;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function get(_index, _l) {
    throw new TypeError();
}
exports.get = get;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function set(_index, _value, _l) {
    throw new TypeError();
}
exports.set = set;
//# sourceMappingURL=list.js.map