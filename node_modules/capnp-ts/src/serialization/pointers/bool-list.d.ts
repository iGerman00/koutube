/**
 * @author jdiaz5513
 */
import { _ListCtor, List } from "./list";
export declare class BoolList extends List<boolean> {
    static readonly _capnp: _ListCtor;
    get(index: number): boolean;
    set(index: number, value: boolean): void;
    toString(): string;
}
