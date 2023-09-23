"use strict";
/**
 * @author jdiaz5513
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Int16List = void 0;
const tslib_1 = require("tslib");
const debug_1 = tslib_1.__importDefault(require("debug"));
const list_element_size_1 = require("../list-element-size");
const list_1 = require("./list");
const pointer_1 = require("./pointer");
const trace = debug_1.default("capnp:list:composite");
trace("load");
class Int16List extends list_1.List {
    get(index) {
        const c = pointer_1.getContent(this);
        return c.segment.getInt16(c.byteOffset + index * 2);
    }
    set(index, value) {
        const c = pointer_1.getContent(this);
        c.segment.setInt16(c.byteOffset + index * 2, value);
    }
    toString() {
        return `Int16_${super.toString()}`;
    }
}
exports.Int16List = Int16List;
Int16List._capnp = {
    displayName: "List<Int16>",
    size: list_element_size_1.ListElementSize.BYTE_2
};
//# sourceMappingURL=int16-list.js.map