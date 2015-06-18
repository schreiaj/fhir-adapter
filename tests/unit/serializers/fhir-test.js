import { test } from 'ember-qunit';
import Ember from 'ember';
import DS from 'ember-data';
import Adapter from 'fhir-adapter/adapters/fhir';
import Serializer from 'fhir-adapter/serializers/fhir';

var buildContainer = function() {
    var container = new Ember.Container();
    DS._setupContainer( container );

    container.register( 'adapter:-fhir', Adapter );
    container.register( 'serializer:-fhir', Serializer );

    return container;
  },
  container,
  store,
  serializer,
  Patient,
  patientJSON;

module( 'Unit - serializer:application', {
  beforeEach: function() {
    patientJSON = {
       "resourceType":"Patient",
       "id":1,
       "identifier":[
           {
               "system":"www.renaper.gov.ar/dni",
               "value":"DNI20425239"
           },
           {
               "system":"www.cdrossi.com/pacientes",
               "value":"291891"
           }
       ],
       "name":[
           {
               "family":[
                   "PEREZ"
               ],
               "given":[
                   "GONZALO"
               ]
           }
       ],
       "gender":"male",
       "birthDate":"1964-03-20"
     };
    container  = buildContainer();
    serializer = container.lookup( 'serializer:-fhir' );
    store      = container.lookup( 'service:store' );

    container.register( 'model:human-name', DS.Model.extend({
      family    : DS.attr( 'string' ),
      name      : DS.attr('given')
    }));


    container.register( 'model:patient', DS.Model.extend({
      gender    : DS.attr( 'string' ),
      name      : DS.hasMany('human-name', {async:false})
    }));

    Patient = store.modelFor( 'patient' );

    container.register( 'serializer:patient', Serializer );
  },

  afterEach: function() {
    Ember.run( container, 'destroy' );
  }
});

test('attributeForKey is properly built', function(assert){
  assert.equal(serializer.keyForAttribute('patient'), 'patient');
});

test( 'Requires id as key', function( assert ) {
  assert.equal( Ember.get( serializer, 'primaryKey' ), 'id', 'Should be id.' );
});

test('payload should be properly extracted for single model', function(assert){
  var res = serializer.extractSingle(store, Patient, patientJSON);
  assert.equal(res.gender, "male", "Gender should have been male");
  assert.equal(res.id, 1, "id should equal 1");
});

test('extract resource type', function(assert){
  assert.equal(serializer._extractType(null, patientJSON), "patient");
});



test('assert embedded record loads properly', function(assert){
  var pat;
  store.push('patient', patientJSON);
  pat = store.findRecord("patient", 1);
  assert.ok(pat);
});
