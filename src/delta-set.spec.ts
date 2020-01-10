import { DeltaSet } from './delta-set';

describe('constructor', () => {
  it('constructs empty set without parameters', () => {

    const set = new DeltaSet();

    expect(set.size).toBe(0);
    expect(deltaOf(set)).toEqual([[], []]);
  });
  it('constructs a set of provided given elements', () => {

    const elements = [1, 2, 3];
    const set = new DeltaSet(elements);

    expect([...set]).toEqual(elements);
    expect(deltaOf(set)).toEqual([elements, []]);
  });
});

describe('add', () => {

  let set: DeltaSet<number>;

  beforeEach(() => {
    set = new DeltaSet([1, 2, 3]);
  });

  it('records element addition', () => {
    set.add(4);
    expect([...set]).toEqual([1, 2, 3, 4]);
    expect(deltaOf(set)).toEqual([[1, 2, 3, 4], []]);
  });
  it('forgets element removal', () => {
    set.delete(1);
    set.delete(2);
    set.add(2);
    expect([...set]).toEqual([3, 2]);
    expect(deltaOf(set)).toEqual([[3, 2], [1]]);
  });
  it('does nothing if element is already in the set', () => {
    set.add(2);
    expect([...set]).toEqual([1, 2, 3]);
    expect(deltaOf(set)).toEqual([[1, 2, 3], []]);
  });
});

describe('delete', () => {

  let set: DeltaSet<number>;

  beforeEach(() => {
    set = new DeltaSet([1, 2, 3]);
  });

  it('records element removal and forgets element addition', () => {
    set.delete(2);
    expect([...set]).toEqual([1, 3]);
    expect(deltaOf(set)).toEqual([[1, 3], [2]]);
  });
  it('does nothing if element is not in the set', () => {
    set.delete(4);
    expect([...set]).toEqual([1, 2, 3]);
    expect(deltaOf(set)).toEqual([[1, 2, 3], []]);
  });
});

describe('clear', () => {

  let set: DeltaSet<number>;

  beforeEach(() => {
    set = new DeltaSet([1, 2, 3]);
  });

  it('records all elements removal and forgets all element additions', () => {
    set.clear();
    expect(set.size).toBe(0);
    expect(deltaOf(set)).toEqual([[], [1, 2, 3]]);
  });
});

describe('delta', () => {

  let set: DeltaSet<number>;

  beforeEach(() => {
    set = new DeltaSet([1, 2, 3]);
  });

  it('adds elements', () => {
    expect(set.delta([4, 5, 6])).toBe(set);
    expect([...set]).toEqual([1, 2, 3, 4, 5, 6]);
    expect(deltaOf(set)).toEqual([[1, 2, 3, 4, 5, 6], []]);
  });
  it('removes elements', () => {
    expect(set.delta([], [3, 1])).toBe(set);
    expect([...set]).toEqual([2]);
    expect(deltaOf(set)).toEqual([[2], [3, 1]]);
  });
  it('adds elements after removing them', () => {
    expect(set.delta([2, 4], [2, 1])).toBe(set);
    expect([...set]).toEqual([3, 2, 4]);
    expect(deltaOf(set)).toEqual([[3, 2, 4], [1]]);
  });
});

describe('undelta', () => {

  let set: DeltaSet<number>;

  beforeEach(() => {
    set = new DeltaSet([1, 2, 3]);
    set.delete(2);
  });

  it('forgets changes delta', () => {
    set.undelta();
    expect([...set]).toEqual([1, 3]);
    expect(deltaOf(set)).toEqual([[], []]);
  });
});

describe('redelta', () => {

  let set: DeltaSet<number>;

  beforeEach(() => {
    set = new DeltaSet([1, 2, 3]);
    set.delete(2);
  });

  it('replays changes in another set', () => {

    const target = new Set([2, 5]);

    expect(set.redelta(target)).toBe(set);
    expect([...target]).toEqual([5, 1, 3]);
  });
});

function deltaOf<T>(set: DeltaSet<T>): [T[], T[]] {

  const added: T[] = [];
  const removed: T[] = [];

  set.redelta((add, remove) => {
    added.push(...add);
    removed.push(...remove);
  });

  return [added, removed];
}
