import Ember from 'ember';
import DS from 'ember-data';

export default DS.JSONSerializer.extend(DS.EmbeddedRecordsMixin, {
  keyForAttribute: function(key){
    return key;
  },

  _extractType: function(modelClass, resourceHash){
    return this.modelNameFromPayloadKey(resourceHash.resourceType);
  },


  normalizePayload: function(hash){
    hash.id = hash.id || Ember.generateGuid({}, hash.resourceType);
    return hash;
  }


});
