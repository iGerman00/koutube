"use strict";
/**
 * @author jdiaz5513
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PointerList = void 0;
const tslib_1 = require("tslib");
const debug_1 = tslib_1.__importDefault(require("debug"));
const list_element_size_1 = require("../list-element-size");
const list_1 = require("./list");
const pointer_1 = require("./pointer");
const trace = debug_1.default("capnp:list:composite");
trace("load");
function PointerList(PointerClass) {
    var _a;
    return _a = class extends list_1.List {
            get(index) {
                const c = pointer_1.getContent(this);
                return new PointerClass(c.segment, c.byteOffset + index * 8, this._capnp.depthLimit - 1);
            }
            set(index, value) {
                pointer_1.copyFrom(value, this.get(index));
            }
            toString() {
                return `Pointer_${super.toString()},cls:${PointerClass.toString()}`;
            }
        },
        _a._capnp = {
            displayName: `List<${PointerClass._capnp.displayName}>`,
            size: list_element_size_1.ListElementSize.POINTER,
        },
        _a;
}
exports.PointerList = PointerList;
//# sourceMappingURL=pointer-list.js.map