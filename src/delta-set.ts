import type { ReadonlyDeltaSet } from './readonly-delta-set.js';

/**
 * A `Set` implementation that keeps a delta of changes made to it.
 *
 * @typeParam T - A type of elements of delta set.
 */
export class DeltaSet<T> extends Set<T> implements ReadonlyDeltaSet<T> {

  readonly #added: Set<T>;
  readonly #removed: Set<T>;

  /**
   * Constructs new delta set.
   *
   * @param values - An iterable of elements be added to constructed delta set. Or `null` to add nothing.
   */
  constructor(values?: Iterable<T> | null) {
    super();
    this.#added = new Set<T>(values);
    this.#removed = new Set<T>();
    this.#added.forEach(value => this.add(value));
  }

  /**
   * Appends a new element with a specified value to the end of this delta set. Unless the set contains this element
   * already.
   *
   * Records element addition and forgets its removal unless the set contains it already.
   *
   * @param value - The value of the element to add.
   *
   * @returns `this` delta set.
   */
  add(value: T): this {
    if (!this.has(value)) {
      this.#added.add(value);
      this.#removed.delete(value);
      super.add(value);
    }

    return this;
  }

  /**
   * Removes the specified element from this delta set.
   *
   * Records element removal and forgets its addition if removal succeed.
   *
   * @param value - The value of the element to remove.
   *
   * @returns `true` if element removed successfully; or `false` if this set did not contain the element.
   */
  delete(value: T): boolean {
    if (super.delete(value)) {
      this.#added.delete(value);
      this.#removed.add(value);

      return true;
    }

    return false;
  }

  /**
   * Removes all elements from this delta set.
   *
   * Records all elements removal and forgets all elements additions.
   */
  clear(): void {
    this.#added.clear();
    this.forEach(value => this.#removed.add(value));
    super.clear();
  }

  /**
   * Applies changes to this delta set.
   *
   * First removes elements to `remove`. Then appends elements to `add`.
   *
   * Records all changes made.
   *
   * @param add - An iterable of elements to add.
   * @param remove - An iterable of elements to remove.
   *
   * @returns `this` delta set.
   */
  delta(add: Iterable<T>, remove: Iterable<T> = []): this {
    DeltaSet$DeltaReceiver(this)(add, remove);

    return this;
  }

  /**
   * Replays the changes made to this set in target receiver.
   *
   * @param receiver - A receiver of changes delta. E.g. another `Set`.
   *
   * @returns `this` delta set.
   */
  redelta(receiver: DeltaSet.DeltaReceiver<T>): this {

    const receive = typeof receiver === 'function' ? receiver : DeltaSet$DeltaReceiver(receiver);

    receive([...this.#added], [...this.#removed]);

    return this;
  }

  /**
   * Forgets all changes made to this set.
   *
   * Does not alter the set contents.
   *
   * @returns `this` delta set.
   */
  undelta(): this {
    this.#added.clear();
    this.#removed.clear();

    return this;
  }

}

export namespace DeltaSet {

  /**
   * A delta set changes receiver.
   *
   * This can be either an {@link DeltaReceiverObject object}, or a {@link DeltaReceiverFunction function}.
   *
   * @typeParam T - A type of elements of delta set.
   */
  export type DeltaReceiver<T> =
      | DeltaReceiverFunction<T>
      | DeltaReceiverObject<T>;

  /**
   * A delta set changes receiver function.
   *
   * @typeParam T - A type of elements of delta set.
   * @param added - An array of added elements.
   * @param removed - An array of removed elements.
   */
  export type DeltaReceiverFunction<T> = (this: void, added: T[], removed: T[]) => void;

  /**
   * A delta set changes receiver object.
   *
   * A `Set` class implements this interface.
   *
   * @typeParam T - A type of elements of delta set.
   */
  export interface DeltaReceiverObject<T> {

    /**
     * Receives an element that has been added to delta set.
     *
     * @param value - The value of the added element.
     */
    add(value: T): void;

    /**
     * Receives an element that has been remove from delta set.
     *
     * @param value - The value of the removed element.
     */
    delete(value: T): void;

  }

}

/**
 * @internal
 */
function DeltaSet$DeltaReceiver<T>(
    receiver: DeltaSet.DeltaReceiverObject<T>,
): (this: void, add: Iterable<T>, remove: Iterable<T>) => void {
  return (add, remove) => {
    for (const removed of remove) {
      receiver.delete(removed);
    }
    for (const added of add) {
      receiver.add(added);
    }
  };
}
