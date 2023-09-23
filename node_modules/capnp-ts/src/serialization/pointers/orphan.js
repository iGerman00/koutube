"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Orphan = void 0;
const tslib_1 = require("tslib");
const debug_1 = tslib_1.__importDefault(require("debug"));
const errors_1 = require("../../errors");
const util_1 = require("../../util");
const list_element_size_1 = require("../list-element-size");
const object_size_1 = require("../object-size");
const pointer_1 = require("./pointer");
const pointer_type_1 = require("./pointer-type");
const trace = debug_1.default("capnp:orphan");
trace("load");
// Technically speaking this class doesn't need to be generic, but the extra type checking enforced by this helps to
// make sure you don't accidentally adopt a pointer of the wrong type.
/**
 * An orphaned pointer. This object itself is technically a pointer to the original pointer's content, which was left
 * untouched in its original message. The original pointer data is encoded as attributes on the Orphan object, ready to
 * be reconstructed once another pointer is ready to adopt it.
 *
 * @export
 * @class Orphan
 * @extends {Pointer}
 * @template T
 */
class Orphan {
    constructor(src) {
        const c = pointer_1.getContent(src);
        this.segment = c.segment;
        this.byteOffset = c.byteOffset;
        this._capnp = {};
        // Read vital info from the src pointer so we can reconstruct it during adoption.
        this._capnp.type = pointer_1.getTargetPointerType(src);
        switch (this._capnp.type) {
            case pointer_type_1.PointerType.STRUCT:
                this._capnp.size = pointer_1.getTargetStructSize(src);
                break;
            case pointer_type_1.PointerType.LIST:
                this._capnp.length = pointer_1.getTargetListLength(src);
                this._capnp.elementSize = pointer_1.getTargetListElementSize(src);
                if (this._capnp.elementSize === list_element_size_1.ListElementSize.COMPOSITE) {
                    this._capnp.size = pointer_1.getTargetCompositeListSize(src);
                }
                break;
            case pointer_type_1.PointerType.OTHER:
                this._capnp.capId = pointer_1.getCapabilityId(src);
                break;
            default:
                // COVERAGE: Unreachable code.
                /* istanbul ignore next */
                throw new Error(errors_1.PTR_INVALID_POINTER_TYPE);
        }
        // Zero out the source pointer (but not the contents!).
        pointer_1.erasePointer(src);
    }
    /**
     * Adopt (move) this orphan into the target pointer location. This will allocate far pointers in `dst` as needed.
     *
     * @param {T} dst The destination pointer.
     * @returns {void}
     */
    _moveTo(dst) {
        if (this._capnp === undefined) {
            throw new Error(util_1.format(errors_1.PTR_ALREADY_ADOPTED, this));
        }
        // TODO: Implement copy semantics when this happens.
        if (this.segment.message !== dst.segment.message) {
            throw new Error(util_1.format(errors_1.PTR_ADOPT_WRONG_MESSAGE, this, dst));
        }
        // Recursively wipe out the destination pointer first.
        pointer_1.erase(dst);
        const res = pointer_1.initPointer(this.segment, this.byteOffset, dst);
        switch (this._capnp.type) {
            case pointer_type_1.PointerType.STRUCT:
                pointer_1.setStructPointer(res.offsetWords, this._capnp.size, res.pointer);
                break;
            case pointer_type_1.PointerType.LIST: {
                let offsetWords = res.offsetWords;
                if (this._capnp.elementSize === list_element_size_1.ListElementSize.COMPOSITE) {
                    offsetWords--; // The tag word gets skipped.
                }
                pointer_1.setListPointer(offsetWords, this._capnp.elementSize, this._capnp.length, res.pointer, this._capnp.size);
                break;
            }
            case pointer_type_1.PointerType.OTHER:
                pointer_1.setInterfacePointer(this._capnp.capId, res.pointer);
                break;
            /* istanbul ignore next */
            default:
                throw new Error(errors_1.PTR_INVALID_POINTER_TYPE);
        }
        this._capnp = undefined;
    }
    dispose() {
        // FIXME: Should this throw?
        if (this._capnp === undefined) {
            trace("not disposing an already disposed orphan", this);
            return;
        }
        switch (this._capnp.type) {
            case pointer_type_1.PointerType.STRUCT:
                this.segment.fillZeroWords(this.byteOffset, object_size_1.getWordLength(this._capnp.size));
                break;
            case pointer_type_1.PointerType.LIST: {
                const byteLength = pointer_1.getListByteLength(this._capnp.elementSize, this._capnp.length, this._capnp.size);
                this.segment.fillZeroWords(this.byteOffset, byteLength);
                break;
            }
            default:
                // Other pointer types don't actually have any content.
                break;
        }
        this._capnp = undefined;
    }
    toString() {
        return util_1.format("Orphan_%d@%a,type:%s", this.segment.id, this.byteOffset, this._capnp && this._capnp.type);
    }
}
exports.Orphan = Orphan;
//# sourceMappingURL=orphan.js.map