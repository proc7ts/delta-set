DeltaSet 
========

[![NPM][npm-image]][npm-url]
[![CircleCI][ci-image]][ci-url]
[![codecov][codecov-image]][codecov-url]
[![GitHub Project][github-image]][github-url]
[![API Documentation][api-docs-image]][api-docs-url]

JavaScript Set keeping delta of changes made to it

[npm-image]: https://img.shields.io/npm/v/delta-set.svg?logo=npm
[npm-url]: https://www.npmjs.com/package/delta-set
[ci-image]: https://img.shields.io/circleci/build/github/surol/delta-set?logo=circleci
[ci-url]: https://circleci.com/gh/surol/delta-set
[codecov-image]: https://codecov.io/gh/surol/delta-set/branch/master/graph/badge.svg
[codecov-url]: https://codecov.io/gh/surol/delta-set
[github-image]: https://img.shields.io/static/v1?logo=github&label=GitHub&message=project&color=informational
[github-url]: https://github.com/surol/delta-set
[api-docs-image]: https://img.shields.io/static/v1?logo=typescript&label=API&message=docs&color=informational
[api-docs-url]: https://surol.github.io/delta-set/index.html


A `DeltaSet` class inherits ES2015 `Set`. In addition it keeps changes made to it and has methods
to deal with these changes delta.

```typescript
import { DeltaSet } from 'delta-set';

// Construct a delta set containing specified elements
// and record their addition. 
const deltaSet = new DeltaSet([1, 2, 3]); // [1, 2, 3]

// Remove element and record its removal
deltaSet.remove(2); // [1, 3]

// Add element and record its addition
deltaSet.add(4); // [1, 3, 4]

const otherSet = new Set<number>();

// Replay changes in another set
deltaSet.redelta(otherSet); // otherSet: [1, 3, 4]

// Changes may be reported to receiver function
deltaSet.redelta((add, remove) => console.log('added:', ...add, '; removed:', ...remove));
// Logs: added: 1 3 4 ; removed: 2

// Forget about changes made to delta set
deltaSet.undelta();

// Apply more changes
deltaSet.delta(/* add */ [11, 12], /* remove */ [4]); // [1, 2, 11, 12]

// Replay last changes in another set
deltaSet.redelta(otherSet); // otherSet: [1, 2, 11, 12]

// Remove all elements and record their removal
deltaSet.clear();

deltaSet.redelta((add, remove) => console.log('added:', ...add, '; removed:', ...remove));
// Logs: added: ; removed: 1 2 11 12 
```
