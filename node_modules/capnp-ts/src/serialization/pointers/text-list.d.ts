/**
 * @author jdiaz5513
 */
import { _ListCtor, List } from "./list";
export declare class TextList extends List<string> {
    static readonly _capnp: _ListCtor;
    get(index: number): string;
    set(index: number, value: string): void;
    toString(): string;
}
