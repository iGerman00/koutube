"use strict";
/**
 * @author jdiaz5513
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListElementOffset = exports.ListElementSize = void 0;
var ListElementSize;
(function (ListElementSize) {
    ListElementSize[ListElementSize["VOID"] = 0] = "VOID";
    ListElementSize[ListElementSize["BIT"] = 1] = "BIT";
    ListElementSize[ListElementSize["BYTE"] = 2] = "BYTE";
    ListElementSize[ListElementSize["BYTE_2"] = 3] = "BYTE_2";
    ListElementSize[ListElementSize["BYTE_4"] = 4] = "BYTE_4";
    ListElementSize[ListElementSize["BYTE_8"] = 5] = "BYTE_8";
    ListElementSize[ListElementSize["POINTER"] = 6] = "POINTER";
    ListElementSize[ListElementSize["COMPOSITE"] = 7] = "COMPOSITE";
})(ListElementSize = exports.ListElementSize || (exports.ListElementSize = {}));
exports.ListElementOffset = [
    0,
    0.125,
    1,
    2,
    4,
    8,
    8,
    NaN // composite
];
//# sourceMappingURL=list-element-size.js.map