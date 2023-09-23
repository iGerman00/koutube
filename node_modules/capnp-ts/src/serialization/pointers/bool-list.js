"use strict";
/**
 * @author jdiaz5513
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BoolList = void 0;
const tslib_1 = require("tslib");
const debug_1 = tslib_1.__importDefault(require("debug"));
const list_element_size_1 = require("../list-element-size");
const list_1 = require("./list");
const pointer_1 = require("./pointer");
const trace = debug_1.default("capnp:list:composite");
trace("load");
class BoolList extends list_1.List {
    get(index) {
        const bitMask = 1 << index % 8;
        const byteOffset = index >>> 3;
        const c = pointer_1.getContent(this);
        const v = c.segment.getUint8(c.byteOffset + byteOffset);
        return (v & bitMask) !== 0;
    }
    set(index, value) {
        const bitMask = 1 << index % 8;
        const c = pointer_1.getContent(this);
        const byteOffset = c.byteOffset + (index >>> 3);
        const v = c.segment.getUint8(byteOffset);
        c.segment.setUint8(byteOffset, value ? v | bitMask : v & ~bitMask);
    }
    toString() {
        return `Bool_${super.toString()}`;
    }
}
exports.BoolList = BoolList;
BoolList._capnp = {
    displayName: "List<boolean>",
    size: list_element_size_1.ListElementSize.BIT
};
//# sourceMappingURL=bool-list.js.map