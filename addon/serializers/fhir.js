import Ember from 'ember';
import DS from 'ember-data';

export default DS.JSONSerializer.extend(DS.EmbeddedRecordsMixin, {
  isNewSerializerAPI: true,

  keyForAttribute: function(key){
    return key;
  },

  _extractType: function(modelClass, resourceHash){
    return this.modelNameFromPayloadKey(resourceHash.resourceType);
  },


  normalizePayload: function(hash){
    hash.id = hash.id || Ember.generateGuid({}, hash.resourceType);
    return extractEmbeddedRecords(this, this.store, this.store.modelFor(this._extractType(hash)), hash);
  }


});

function extractEmbeddedRecords(serializer, store, typeClass, partial) {

  typeClass.eachRelationship(function(key, relationship) {
    if (serializer.hasDeserializeRecordsOption(key) || serializer.hasEmbeddedOption(typeClass, key)) {
      var embeddedTypeClass = store.modelFor(relationship.type);
      if (relationship.kind === "hasMany") {
        extractEmbeddedHasMany(store, key, embeddedTypeClass, partial);
      }
      if (relationship.kind === "belongsTo") {
        extractEmbeddedBelongsTo(store, key, embeddedTypeClass, partial);
      }
    }
  });

  return partial;
}

// handles embedding for `hasMany` relationship
function extractEmbeddedHasMany(store, key, embeddedTypeClass, hash) {
  if (!hash[key]) {
    return hash;
  }

  var ids = [];

  var embeddedSerializer = store.serializerFor(embeddedTypeClass.modelName);
  hash[key].forEach(function(data) {
    var embeddedRecord = embeddedSerializer.normalize(embeddedTypeClass, data, null);
    store.push(embeddedTypeClass.modelName, embeddedRecord);
    ids.push(embeddedRecord.id);
  });

  hash[key] = ids;
  return hash;
}


function extractEmbeddedBelongsTo(store, key, embeddedTypeClass, hash) {
  if (!hash[key]) {
    return hash;
  }

  var embeddedSerializer = store.serializerFor(embeddedTypeClass.modelName);
  var embeddedRecord = embeddedSerializer.normalize(embeddedTypeClass, hash[key], null);
  store.push(embeddedTypeClass.modelName, embeddedRecord);

  hash[key] = embeddedRecord.id;
  //TODO Need to add a reference to the parent later so relationship works between both `belongsTo` records
  return hash;
}
