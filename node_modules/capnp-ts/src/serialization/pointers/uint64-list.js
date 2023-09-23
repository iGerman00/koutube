"use strict";
/**
 * @author jdiaz5513
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Uint64List = void 0;
const tslib_1 = require("tslib");
const debug_1 = tslib_1.__importDefault(require("debug"));
const list_element_size_1 = require("../list-element-size");
const list_1 = require("./list");
const pointer_1 = require("./pointer");
const trace = debug_1.default("capnp:list:composite");
trace("load");
class Uint64List extends list_1.List {
    get(index) {
        const c = pointer_1.getContent(this);
        return c.segment.getUint64(c.byteOffset + index * 8);
    }
    set(index, value) {
        const c = pointer_1.getContent(this);
        c.segment.setUint64(c.byteOffset + index * 8, value);
    }
    toString() {
        return `Uint64_${super.toString()}`;
    }
}
exports.Uint64List = Uint64List;
Uint64List._capnp = {
    displayName: "List<Uint64>",
    size: list_element_size_1.ListElementSize.BYTE_8,
};
//# sourceMappingURL=uint64-list.js.map