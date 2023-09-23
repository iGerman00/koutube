"use strict";
/**
 * @author jdiaz5513
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Int8List = void 0;
const tslib_1 = require("tslib");
const debug_1 = tslib_1.__importDefault(require("debug"));
const list_element_size_1 = require("../list-element-size");
const list_1 = require("./list");
const pointer_1 = require("./pointer");
const trace = debug_1.default("capnp:list:composite");
trace("load");
class Int8List extends list_1.List {
    get(index) {
        const c = pointer_1.getContent(this);
        return c.segment.getInt8(c.byteOffset + index);
    }
    set(index, value) {
        const c = pointer_1.getContent(this);
        c.segment.setInt8(c.byteOffset + index, value);
    }
    toString() {
        return `Int8_${super.toString()}`;
    }
}
exports.Int8List = Int8List;
Int8List._capnp = {
    displayName: "List<Int8>",
    size: list_element_size_1.ListElementSize.BYTE
};
//# sourceMappingURL=int8-list.js.map