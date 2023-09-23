"use strict";
/**
 * @author jdiaz5513
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Uint32List = void 0;
const tslib_1 = require("tslib");
const debug_1 = tslib_1.__importDefault(require("debug"));
const list_element_size_1 = require("../list-element-size");
const list_1 = require("./list");
const pointer_1 = require("./pointer");
const trace = debug_1.default("capnp:list:composite");
trace("load");
class Uint32List extends list_1.List {
    get(index) {
        const c = pointer_1.getContent(this);
        return c.segment.getUint32(c.byteOffset + index * 4);
    }
    set(index, value) {
        const c = pointer_1.getContent(this);
        c.segment.setUint32(c.byteOffset + index * 4, value);
    }
    toString() {
        return `Uint32_${super.toString()}`;
    }
}
exports.Uint32List = Uint32List;
Uint32List._capnp = {
    displayName: "List<Uint32>",
    size: list_element_size_1.ListElementSize.BYTE_4
};
//# sourceMappingURL=uint32-list.js.map