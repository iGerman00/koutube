"use strict";
/**
 * @author jdiaz5513
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVoidMask = exports.getUint64Mask = exports.getInt64Mask = exports.getBitMask = exports.getUint8Mask = exports.getUint32Mask = exports.getUint16Mask = exports.getInt8Mask = exports.getInt32Mask = exports.getInt16Mask = exports.getFloat64Mask = exports.getFloat32Mask = void 0;
const errors_1 = require("../errors");
function _makePrimitiveMaskFn(byteLength, setter) {
    return (x) => {
        const dv = new DataView(new ArrayBuffer(byteLength));
        setter.call(dv, 0, x, true);
        return dv;
    };
}
/* eslint-disable @typescript-eslint/unbound-method */
exports.getFloat32Mask = _makePrimitiveMaskFn(4, DataView.prototype.setFloat32);
exports.getFloat64Mask = _makePrimitiveMaskFn(8, DataView.prototype.setFloat64);
exports.getInt16Mask = _makePrimitiveMaskFn(2, DataView.prototype.setInt16);
exports.getInt32Mask = _makePrimitiveMaskFn(4, DataView.prototype.setInt32);
exports.getInt8Mask = _makePrimitiveMaskFn(1, DataView.prototype.setInt8);
exports.getUint16Mask = _makePrimitiveMaskFn(2, DataView.prototype.setUint16);
exports.getUint32Mask = _makePrimitiveMaskFn(4, DataView.prototype.setUint32);
exports.getUint8Mask = _makePrimitiveMaskFn(1, DataView.prototype.setUint8);
/* eslint-enable */
function getBitMask(value, bitOffset) {
    const dv = new DataView(new ArrayBuffer(1));
    if (!value)
        return dv;
    dv.setUint8(0, 1 << bitOffset % 8);
    return dv;
}
exports.getBitMask = getBitMask;
function getInt64Mask(x) {
    return x.toDataView();
}
exports.getInt64Mask = getInt64Mask;
function getUint64Mask(x) {
    return x.toDataView();
}
exports.getUint64Mask = getUint64Mask;
function getVoidMask() {
    throw new Error(errors_1.INVARIANT_UNREACHABLE_CODE);
}
exports.getVoidMask = getVoidMask;
//# sourceMappingURL=mask.js.map