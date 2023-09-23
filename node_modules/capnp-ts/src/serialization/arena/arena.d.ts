/**
 * @author jdiaz5513
 */
import { Segment } from "../segment";
import { AnyArena } from "./any-arena";
import { ArenaAllocationResult } from "./arena-allocation-result";
export declare abstract class Arena {
    static readonly allocate: typeof allocate;
    static readonly getBuffer: typeof getBuffer;
    static readonly getNumSegments: typeof getNumSegments;
}
export declare function allocate(minSize: number, segments: Segment[], a: AnyArena): ArenaAllocationResult;
export declare function getBuffer(id: number, a: AnyArena): ArrayBuffer;
export declare function getNumSegments(a: AnyArena): number;
