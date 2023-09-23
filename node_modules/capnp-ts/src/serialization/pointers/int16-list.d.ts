/**
 * @author jdiaz5513
 */
import { _ListCtor, List } from "./list";
export declare class Int16List extends List<number> {
    static readonly _capnp: _ListCtor;
    get(index: number): number;
    set(index: number, value: number): void;
    toString(): string;
}
