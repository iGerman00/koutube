"use strict";
/**
 * @author jdiaz5513
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextList = void 0;
const tslib_1 = require("tslib");
const debug_1 = tslib_1.__importDefault(require("debug"));
const list_element_size_1 = require("../list-element-size");
const list_1 = require("./list");
const text_1 = require("./text");
const pointer_1 = require("./pointer");
const trace = debug_1.default("capnp:list:composite");
trace("load");
class TextList extends list_1.List {
    get(index) {
        const c = pointer_1.getContent(this);
        c.byteOffset += index * 8;
        return text_1.Text.fromPointer(c).get(0);
    }
    set(index, value) {
        const c = pointer_1.getContent(this);
        c.byteOffset += index * 8;
        text_1.Text.fromPointer(c).set(0, value);
    }
    toString() {
        return `Text_${super.toString()}`;
    }
}
exports.TextList = TextList;
TextList._capnp = {
    displayName: "List<Text>",
    size: list_element_size_1.ListElementSize.POINTER
};
//# sourceMappingURL=text-list.js.map