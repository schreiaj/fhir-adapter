import Ember from 'ember';
import DS from 'ember-data';

export default DS.JSONAPIAdapter.extend({
  defaultSerializer: '-fhir',

  pathForType: function(type){
    return Ember.String.capitalize(type);
  },
});
