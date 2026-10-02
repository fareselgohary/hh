// node test.mjs — checks the triage rules
import assert from 'node:assert';
import { QUESTIONS, assess, valid } from './public/logic.js';

const base = { q1: '25-39', q2: 'no', q3: 'no', q4: 'no', q5: 'no', q6: 'no', q7: 'no', q8: 'no', q9: 'no',
  q10: 'no', q11: 'no', q12: 'no', q13: 'no', q14: 'lt1', q15: 'no' };
const p = over => assess({ ...base, ...over }).pathway;

assert.equal(QUESTIONS.length, 15);
assert.ok(valid(base));
assert.ok(!valid({ ...base, q3: 'maybe' }));
assert.ok(!valid({ ...base, q15: undefined }));
assert.equal(p({}), 'green');
assert.equal(p({ q3: 'yes' }), 'red');
assert.equal(p({ q3: 'yes', q10: 'yes' }), 'red');
assert.equal(p({ q7: 'unsure' }), 'yellow');
assert.equal(p({ q11: 'yes' }), 'yellow');
assert.equal(p({ q10: 'na' }), 'green');
assert.equal(p({ q1: '50-59', q14: 'never' }), 'yellow');
assert.equal(p({ q1: '25-39', q14: 'never' }), 'green');
assert.equal(p({ q2: 'yes' }), 'yellow');
console.log('ok');
