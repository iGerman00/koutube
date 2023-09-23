"use strict";
/**
 * @author jdiaz5513
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompositeList = void 0;
const tslib_1 = require("tslib");
const debug_1 = tslib_1.__importDefault(require("debug"));
const list_element_size_1 = require("../list-element-size");
const list_1 = require("./list");
const pointer_1 = require("./pointer");
const trace = debug_1.default("capnp:list:composite");
trace("load");
function CompositeList(CompositeClass) {
    var _a;
    return _a = class extends list_1.List {
            get(index) {
                return new CompositeClass(this.segment, this.byteOffset, this._capnp.depthLimit - 1, index);
            }
            set(index, value) {
                pointer_1.copyFrom(value, this.get(index));
            }
            toString() {
                return `Composite_${super.toString()},cls:${CompositeClass.toString()}`;
            }
        },
        _a._capnp = {
            compositeSize: CompositeClass._capnp.size,
            displayName: `List<${CompositeClass._capnp.displayName}>`,
            size: list_element_size_1.ListElementSize.COMPOSITE,
        },
        _a;
}
exports.CompositeList = CompositeList;
//# sourceMappingURL=composite-list.js.map