"use strict";
/**
 * @author jdiaz5513
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.padToWord = exports.getWordLength = exports.getDataWordLength = exports.getByteLength = exports.ObjectSize = void 0;
const tslib_1 = require("tslib");
const debug_1 = tslib_1.__importDefault(require("debug"));
const _ = tslib_1.__importStar(require("../util"));
const trace = debug_1.default("capnp:object-size");
trace("load");
/**
 * A simple object that describes the size of a struct.
 *
 * @export
 * @class ObjectSize
 */
class ObjectSize {
    constructor(dataByteLength, pointerCount) {
        this.dataByteLength = dataByteLength;
        this.pointerLength = pointerCount;
    }
    toString() {
        return _.format("ObjectSize_dw:%d,pc:%d", getDataWordLength(this), this.pointerLength);
    }
}
exports.ObjectSize = ObjectSize;
function getByteLength(o) {
    return o.dataByteLength + o.pointerLength * 8;
}
exports.getByteLength = getByteLength;
function getDataWordLength(o) {
    return o.dataByteLength / 8;
}
exports.getDataWordLength = getDataWordLength;
function getWordLength(o) {
    return o.dataByteLength / 8 + o.pointerLength;
}
exports.getWordLength = getWordLength;
function padToWord(o) {
    return new ObjectSize(_.padToWord(o.dataByteLength), o.pointerLength);
}
exports.padToWord = padToWord;
//# sourceMappingURL=object-size.js.map