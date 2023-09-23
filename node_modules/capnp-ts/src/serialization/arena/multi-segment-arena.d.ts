/**
 * @author jdiaz5513
 */
import { ArenaAllocationResult } from "./arena-allocation-result";
import { ArenaKind } from "./arena-kind";
export declare class MultiSegmentArena {
    static readonly allocate: typeof allocate;
    static readonly getBuffer: typeof getBuffer;
    static readonly getNumSegments: typeof getNumSegments;
    readonly buffers: ArrayBuffer[];
    readonly kind = ArenaKind.MULTI_SEGMENT;
    constructor(buffers?: ArrayBuffer[]);
    toString(): string;
}
export declare function allocate(minSize: number, m: MultiSegmentArena): ArenaAllocationResult;
export declare function getBuffer(id: number, m: MultiSegmentArena): ArrayBuffer;
export declare function getNumSegments(m: MultiSegmentArena): number;
