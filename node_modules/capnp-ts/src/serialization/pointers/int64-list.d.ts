/**
 * @author jdiaz5513
 */
import { Int64 } from "../../types";
import { _ListCtor, List } from "./list";
export declare class Int64List extends List<Int64> {
    static readonly _capnp: _ListCtor;
    get(index: number): Int64;
    set(index: number, value: Int64): void;
    toString(): string;
}
