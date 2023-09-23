"use strict";
/**
 * @author jdiaz5513
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Uint16List = void 0;
const tslib_1 = require("tslib");
const debug_1 = tslib_1.__importDefault(require("debug"));
const list_element_size_1 = require("../list-element-size");
const list_1 = require("./list");
const pointer_1 = require("./pointer");
const trace = debug_1.default("capnp:list:composite");
trace("load");
class Uint16List extends list_1.List {
    get(index) {
        const c = pointer_1.getContent(this);
        return c.segment.getUint16(c.byteOffset + index * 2);
    }
    set(index, value) {
        const c = pointer_1.getContent(this);
        c.segment.setUint16(c.byteOffset + index * 2, value);
    }
    toString() {
        return `Uint16_${super.toString()}`;
    }
}
exports.Uint16List = Uint16List;
Uint16List._capnp = {
    displayName: "List<Uint16>",
    size: list_element_size_1.ListElementSize.BYTE_2
};
//# sourceMappingURL=uint16-list.js.map