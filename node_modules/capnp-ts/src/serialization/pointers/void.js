"use strict";
/**
 * @author jdiaz5513
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.VOID = exports.Void = void 0;
const object_size_1 = require("../object-size");
const struct_1 = require("./struct");
class Void extends struct_1.Struct {
}
exports.Void = Void;
Void._capnp = {
    displayName: "Void",
    id: "0",
    size: new object_size_1.ObjectSize(0, 0)
};
// This following line makes a mysterious "whooshing" sound when it runs.
exports.VOID = undefined;
//# sourceMappingURL=void.js.map