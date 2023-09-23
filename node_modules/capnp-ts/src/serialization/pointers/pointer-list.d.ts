/**
 * @author jdiaz5513
 */
import { ListCtor } from "./list";
import { Pointer, PointerCtor } from "./pointer";
export declare function PointerList<T extends Pointer>(PointerClass: PointerCtor<T>): ListCtor<T>;
