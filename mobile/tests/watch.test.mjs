import test from 'node:test';
import assert from 'node:assert/strict';
import { watchResponse, watchMood } from '../src/watch-model.ts';
const base = { id: 'watch-test', patientId: '1', patientName: 'Sophia Reed', createdAt: '2026-09-25T08:00:00Z' };
test('okay response never becomes an alarm or asserts medical safety', () => {
  const event = watchResponse({ ...base, trigger: 'heartbeat', needsHelp: false });
  assert.equal(event.kind, 'watch-response');
  assert.equal(event.simulated, true);
  assert.match(event.body, /does not establish/);
});
test('help request preserves incident ID and trigger for both scenarios', () => {
  for (const trigger of ['heartbeat', 'breathing']) {
    const event = watchResponse({ ...base, trigger, needsHelp: true });
    assert.equal(event.id, base.id);
    assert.equal(event.kind, 'watch-alert');
    assert.equal(event.trigger, trigger);
    assert.equal(event.simulated, true);
    assert.match(event.body, /I need help/);
  }
});
test('watch mood does not invent a pain score', () => {
  assert.throws(() => watchMood({ ...base, mood: 0 }));
  const event = watchMood({ ...base, mood: 5 });
  assert.equal(event.kind, 'watch-checkin');
  assert.match(event.body, /Great \(5\/5\)/);
  assert.match(event.body, /Pain was not assessed/);
});
