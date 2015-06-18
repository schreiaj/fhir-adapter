import { moduleFor, test } from 'ember-qunit';

moduleFor('adapter:fhir', 'Unit | Adapter | fhir', {
  // Specify the other units that are required for this test.
  // needs: ['serializer:fhir']
});

// Replace this with your real tests.
test('it exists', function(assert) {
  var adapter = this.subject();
  assert.ok(adapter);
});

test('pathForType properly builds path', function(assert){
  var adapter = this.subject();
  assert.equal(adapter.pathForType("patient"), "Patient");
});
