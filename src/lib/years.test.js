import test from 'node:test';
import assert from 'node:assert/strict';

import { MAX_YEAR, MIN_YEAR, YEARS } from './years.js';

test('offers every target year from GitHub launch through next year', () => {
  assert.equal(YEARS[0], MAX_YEAR);
  assert.equal(YEARS.at(-1), MIN_YEAR);
  assert.equal(YEARS.length, MAX_YEAR - MIN_YEAR + 1);

  for (let index = 1; index < YEARS.length; index += 1) {
    assert.equal(YEARS[index], YEARS[index - 1] - 1);
  }
});
