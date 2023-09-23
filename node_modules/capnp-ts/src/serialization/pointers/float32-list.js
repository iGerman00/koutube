"use strict";
/**
 * @author jdiaz5513
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Float32List = void 0;
const tslib_1 = require("tslib");
const debug_1 = tslib_1.__importDefault(require("debug"));
const list_element_size_1 = require("../list-element-size");
const list_1 = require("./list");
const pointer_1 = require("./pointer");
const trace = debug_1.default("capnp:list:composite");
trace("load");
class Float32List extends list_1.List {
    get(index) {
        const c = pointer_1.getContent(this);
        return c.segment.getFloat32(c.byteOffset + index * 4);
    }
    set(index, value) {
        const c = pointer_1.getContent(this);
        c.segment.setFloat32(c.byteOffset + index * 4, value);
    }
    toString() {
        return `Float32_${super.toString()}`;
    }
}
exports.Float32List = Float32List;
Float32List._capnp = {
    displayName: "List<Float32>",
    size: list_element_size_1.ListElementSize.BYTE_4
};
//# sourceMappingURL=float32-list.js.map