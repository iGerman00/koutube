/**
 * @author jdiaz5513
 */
import { Uint64 } from "../../types/index";
import { _ListCtor, List } from "./list";
export declare class Uint64List extends List<Uint64> {
    static readonly _capnp: _ListCtor;
    get(index: number): Uint64;
    set(index: number, value: Uint64): void;
    toString(): string;
}
