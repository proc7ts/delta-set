/**
 * @module delta-set
 */
/**
 * A `Set` implementation that keeps a delta of changes made to it.
 *
 * @typeparam T  A type of elements of delta set.
 */
export class DeltaSet<T> extends Set<T> {

  /** @internal */
  private readonly _added: Set<T>;

  /** @internal */
  private readonly _removed: Set<T>;

  /**
   * Constructs new delta set.
   *
   * @param values  An iterable of elements be add to constructed delta set. Or `null` to add nothing.
   */
  constructor(values?: Iterable<T> | null) {
    super();
    this._added = new Set<T>(values);
    this._removed = new Set<T>();
    this._added.forEach(value => this.add(value));
  }

  /**
   * Appends a new element with a specified value to the end of this delta set. Unless the set contains this element
   * already.
   *
   * Records element addition and forgets its removal unless the set contains it already.
   *
   * @param value  The value of the element to add.
   *
   * @returns `this` delta set.
   */
  add(value: T): this {
    if (!this.has(value)) {
      this._added.add(value);
      this._removed.delete(value);
      super.add(value);
    }
    return this;
  }

  /**
   * Removes the specified element from this delta set.
   *
   * Records element removal and forgets its addition if removal succeed.
   *
   * @param value  The value of the element to remove.
   *
   * @returns `true` if element removed successfully; or `false` if this set did not contain the element.
   */
  delete(value: T): boolean {
    if (super.delete(value)) {
      this._added.delete(value);
      this._removed.add(value);
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
    this._added.clear();
    this.forEach(value => this._removed.add(value));
    super.clear();
  }

  /**
   * Applies changes to this delta set.
   *
   * First removes elements to `remove`. Then appends elements to `add`.
   *
   * Records all changes made.
   *
   * @param add  An iterable of elements to add.
   * @param remove  An iterable of elements to remove.
   *
   * @returns `this` delta set.
   */
  delta(add: Iterable<T>, remove: Iterable<T> = []): this {
    deltaSetDeltaReceiver(this)(add, remove);
    return this;
  }

  /**
   * Replays changes made to this set in target receiver.
   *
   * @param receiver  A receiver of changes delta. E.g. another `Set`.
   *
   * @returns `this` delta set.
   */
  redelta(receiver: DeltaSet.DeltaReceiver<T>): this {

    const receive = typeof receiver === 'function' ? receiver : deltaSetDeltaReceiver(receiver);

    receive([...this._added], [...this._removed]);

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
    this._added.clear();
    this._removed.clear();
    return this;
  }

}

export namespace DeltaSet {

  /**
   * A delta set changes receiver.
   *
   * This can be either an {@link DeltaReceiverObject object}, or a {@link DeltaReceiverFunction function}.
   *
   * @typeparam T  A type of elements of delta set.
   */
  export type DeltaReceiver<T> =
      | DeltaReceiverFunction<T>
      | DeltaReceiverObject<T>;

  /**
   * A delta set changes receiver function.
   *
   * @typeparam T  A type of elements of delta set.
   */
  export type DeltaReceiverFunction<T> =
  /**
   * @param added  An array of added elements.
   * @param removed  An array of removed elements.
   */
      (this: void, added: T[], remove: T[]) => void;

  /**
   * A delta set changes receiver object.
   *
   * A `Set` class implements this interface.
   *
   * @typeparam T  A type of elements of delta set.
   */
  export interface DeltaReceiverObject<T> {

    /**
     * Receives an element that has been added to delta set.
     *
     * @param value  The value of the added element.
     */
    add(value: T): void;

    /**
     * Receives an element that has been remove from delta set.
     *
     * @param value  The value of the removed element.
     */
    delete(value: T): void;

  }

}

/**
 * @internal
 */
function deltaSetDeltaReceiver<T>(
    receiver: { add(value: T): void; delete(value: T): void; },
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
