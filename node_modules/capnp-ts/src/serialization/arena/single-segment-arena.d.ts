/**
 * @author jdiaz5513
 */
import { Segment } from "../segment";
import { ArenaAllocationResult } from "./arena-allocation-result";
import { ArenaKind } from "./arena-kind";
export declare class SingleSegmentArena {
    static readonly allocate: typeof allocate;
    static readonly getBuffer: typeof getBuffer;
    static readonly getNumSegments: typeof getNumSegments;
    buffer: ArrayBuffer;
    readonly kind = ArenaKind.SINGLE_SEGMENT;
    constructor(buffer?: ArrayBuffer);
    toString(): string;
}
export declare function allocate(minSize: number, segments: Segment[], s: SingleSegmentArena): ArenaAllocationResult;
export declare function getBuffer(id: number, s: SingleSegmentArena): ArrayBuffer;
export declare function getNumSegments(): number;
