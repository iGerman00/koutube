/**
 * @author jdiaz5513
 */
import { Segment } from "../segment";
import { Pointer } from "./pointer";
export declare class Interface extends Pointer {
    constructor(segment: Segment, byteOffset: number, depthLimit?: number);
}
