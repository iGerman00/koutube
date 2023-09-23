/**
 * @author jdiaz5513
 */
import { ListElementSize } from "../list-element-size";
import { ObjectSize } from "../object-size";
import { Segment } from "../segment";
import { Pointer } from "./pointer";
export interface _ListCtor {
    readonly compositeSize?: ObjectSize;
    readonly displayName: string;
    readonly size: ListElementSize;
}
export interface ListCtor<T> {
    readonly _capnp: _ListCtor;
    new (segment: Segment, byteOffset: number, depthLimit?: number): List<T>;
}
export declare type FilterCallback<T> = (this: void, value: T, index: number) => boolean;
export declare type IndexedCallback<T, U> = (this: void, value: T, index: number) => U;
export interface Group<T> {
    [k: string]: T;
}
/**
 * A generic list class. Implements Filterable,
 */
export declare class List<T> extends Pointer {
    static readonly _capnp: _ListCtor;
    static readonly get: typeof get;
    static readonly initList: typeof initList;
    static readonly set: typeof set;
    static toString(): string;
    all(callbackfn: FilterCallback<T>): boolean;
    any(callbackfn: FilterCallback<T>): boolean;
    ap<U>(callbackfns: Array<IndexedCallback<T, U>>): U[];
    concat(other: List<T>): T[];
    drop(n: number): T[];
    dropWhile(callbackfn: FilterCallback<T>): T[];
    empty(): T[];
    every(callbackfn: FilterCallback<T>): boolean;
    filter(callbackfn: FilterCallback<T>): T[];
    find(callbackfn: FilterCallback<T>): T | undefined;
    findIndex(callbackfn: FilterCallback<T>): number;
    forEach(callbackfn: (this: void, value: T, index: number) => void): void;
    get(_index: number): T;
    /**
     * Get the length of this list.
     *
     * @returns {number} The number of elements in this list.
     */
    getLength(): number;
    groupBy(callbackfn: IndexedCallback<T, string>): Group<T>;
    intersperse(sep: T): T[];
    map<U>(callbackfn: IndexedCallback<T, U>): U[];
    reduce(callbackfn: (previousValue: T, currentValue: T, currentIndex: number) => T): T;
    reduce<U>(callbackfn: (previousValue: U, currentValue: T, currentIndex: number) => U, initialValue: U): U;
    set(_index: number, _value: T): void;
    slice(start?: number, end?: number): T[];
    some(callbackfn: FilterCallback<T>): boolean;
    take(n: number): T[];
    takeWhile(callbackfn: FilterCallback<T>): T[];
    toArray(): T[];
    toString(): string;
}
/**
 * Initialize the list with the given element size and length. This will allocate new space for the list, ideally in
 * the same segment as this pointer.
 *
 * @param {ListElementSize} elementSize The size of each element in the list.
 * @param {number} length The number of elements in the list.
 * @param {List<T>} l The list to initialize.
 * @param {ObjectSize} [compositeSize] The size of each element in a composite list. This value is required for
 * composite lists.
 * @returns {void}
 */
export declare function initList<T>(elementSize: ListElementSize, length: number, l: List<T>, compositeSize?: ObjectSize): void;
export declare function get<T>(_index: number, _l: List<T>): T;
export declare function set<T>(_index: number, _value: T, _l: List<T>): void;
