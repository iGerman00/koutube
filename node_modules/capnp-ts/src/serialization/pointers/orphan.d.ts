import { ListElementSize } from "../list-element-size";
import { ObjectSize } from "../object-size";
import { Segment } from "../segment";
import { Pointer } from "./pointer";
import { PointerType } from "./pointer-type";
export interface _Orphan {
    capId: number;
    elementSize: ListElementSize;
    length: number;
    size: ObjectSize;
    type: PointerType;
}
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
export declare class Orphan<T extends Pointer> {
    /** If this member is not present then the orphan has already been adopted, or something went very wrong. */
    _capnp?: _Orphan;
    byteOffset: number;
    segment: Segment;
    constructor(src: T);
    /**
     * Adopt (move) this orphan into the target pointer location. This will allocate far pointers in `dst` as needed.
     *
     * @param {T} dst The destination pointer.
     * @returns {void}
     */
    _moveTo(dst: T): void;
    dispose(): void;
    toString(): string;
}
