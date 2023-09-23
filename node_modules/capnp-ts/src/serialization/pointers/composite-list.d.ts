/**
 * @author jdiaz5513
 */
import { ListCtor } from "./list";
import { Struct, StructCtor } from "./struct";
export declare function CompositeList<T extends Struct>(CompositeClass: StructCtor<T>): ListCtor<T>;
