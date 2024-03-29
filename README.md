# DeltaSet

[![NPM][npm-image]][npm-url]
[![Build Status][build-status-img]][build-status-link]
[![Code Quality][quality-img]][quality-link]
[![Coverage][coverage-img]][coverage-link]
[![GitHub Project][github-image]][github-url]
[![API Documentation][api-docs-image]][api-docs-url]

JavaScript Set keeping delta of changes made to it

[npm-image]: https://img.shields.io/npm/v/@proc7ts/delta-set.svg?logo=npm
[npm-url]: https://www.npmjs.com/package/@proc7ts/delta-set
[build-status-img]: https://github.com/proc7ts/delta-set/workflows/Build/badge.svg
[build-status-link]: https://github.com/proc7ts/delta-set/actions?query=workflow:Build
[quality-img]: https://app.codacy.com/project/badge/Grade/067cc45d12134dfaa78daeb3fb45a7d1
[quality-link]: https://www.codacy.com/gh/proc7ts/delta-set/dashboard?utm_source=github.com&utm_medium=referral&utm_content=proc7ts/delta-set&utm_campaign=Badge_Grade
[coverage-img]: https://app.codacy.com/project/badge/Coverage/067cc45d12134dfaa78daeb3fb45a7d1
[coverage-link]: https://www.codacy.com/gh/proc7ts/delta-set/dashboard?utm_source=github.com&utm_medium=referral&utm_content=proc7ts/delta-set&utm_campaign=Badge_Coverage
[github-image]: https://img.shields.io/static/v1?logo=github&label=GitHub&message=project&color=informational
[github-url]: https://github.com/proc7ts/delta-set
[api-docs-image]: https://img.shields.io/static/v1?logo=typescript&label=API&message=docs&color=informational
[api-docs-url]: https://proc7ts.github.io/delta-set/index.html

A `DeltaSet` class inherits ES2015 `Set`. In addition, it keeps changes made to it and has methods
to deal with these changes' delta.

```typescript
import { DeltaSet } from '@proc7ts/delta-set';

// Construct a delta set containing specified elements
// and record their addition.
const deltaSet = new DeltaSet([1, 2, 3]); // [1, 2, 3]

// Remove element and record its removal
deltaSet.delete(2); // [1, 3]

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
deltaSet.delta(/* add */ [11, 12], /* remove */ [4]); // [1, 3, 11, 12]

// Replay last changes in another set
deltaSet.redelta(otherSet); // otherSet: [1, 3, 11, 12]

// Remove all elements and record their removal
deltaSet.clear();

deltaSet.redelta((add, remove) => console.log('added:', ...add, '; removed:', ...remove));
// Logs: added: ; removed: 4 1 3 11 12
```
