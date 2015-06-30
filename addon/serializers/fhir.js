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


  normalize: function(modelClass, hash){
    hash.id = hash.id || Ember.generateGuid({}, this._extractType(modelClass, hash));
    let data = null;

    if (hash) {
      this.normalizeUsingDeclaredMapping(modelClass, hash);

      data = {
        id:            this.extractId(hash),
        type:          modelClass.modelName,
        attributes:    this.extractAttributes(modelClass, hash),
        included:      this.extractIncluded(modelClass, hash),
        relationships: this.extractRelationships(modelClass, hash)

      };

      this.applyTransforms(modelClass, data.attributes);
    }
    console.log(data);
    return { data };
  },

  extractIncluded: function (modelClass, resourceHash) {
    let includes = [];
    // let relationships = {};

    modelClass.eachRelationship(function (key, relationshipMeta) {
      let relationshipKey = this.keyForRelationship(key, relationshipMeta.kind, 'deserialize');
      if (resourceHash.hasOwnProperty(relationshipKey)) {
        let relationshipHash = resourceHash[relationshipKey];
        if (relationshipMeta.options.included === true) {
          if (relationshipMeta.kind === 'hasMany') {
            Ember.A(relationshipHash).forEach(function(item){
              includes.push(this.extractRelationship(relationshipMeta.type, item, true));
            }, this);
          }
          if (relationshipMeta.kind === 'belongsTo') {
            includes.push(this.extractRelationship(relationshipMeta.type, relationshipHash, true));
          }


        }
      }
    }, this);
    return includes;
  },


  extractRelationship: function (relationshipModelName, relationshipHash, isInclude){
    if(isInclude){
      relationshipHash.type = relationshipModelName;
    }
    return this._super(relationshipModelName, relationshipHash);
  }

});

// function extractEmbeddedRecords(serializer, store, typeClass, partial) {
//
//   typeClass.eachRelationship(function(key, relationship) {
//     if (serializer.hasDeserializeRecordsOption(key) || serializer.hasEmbeddedOption(typeClass, key)) {
//       var embeddedTypeClass = store.modelFor(relationship.type);
//       if (relationship.kind === "hasMany") {
//         extractEmbeddedHasMany(store, key, embeddedTypeClass, partial);
//       }
//       if (relationship.kind === "belongsTo") {
//         extractEmbeddedBelongsTo(store, key, embeddedTypeClass, partial);
//       }
//     }
//   });
//
//   return partial;
// }
//
// // handles embedding for `hasMany` relationship
// function extractEmbeddedHasMany(store, key, embeddedTypeClass, hash) {
//   if (!hash[key]) {
//     return hash;
//   }
//
//   var ids = [];
//
//   var embeddedSerializer = store.serializerFor(embeddedTypeClass.modelName);
//   hash[key].forEach(function(data) {
//     var embeddedRecord = embeddedSerializer.normalize(embeddedTypeClass, data, null);
//     store.push(embeddedTypeClass.modelName, embeddedRecord);
//     ids.push(embeddedRecord.id);
//   });
//
//   hash[key] = ids;
//   return hash;
// }
//
//
// function extractEmbeddedBelongsTo(store, key, embeddedTypeClass, hash) {
//   if (!hash[key]) {
//     return hash;
//   }
//
//   var embeddedSerializer = store.serializerFor(embeddedTypeClass.modelName);
//   var embeddedRecord = embeddedSerializer.normalize(embeddedTypeClass, hash[key], null);
//   store.push(embeddedTypeClass.modelName, embeddedRecord);
//
//   hash[key] = embeddedRecord.id;
//   //TODO Need to add a reference to the parent later so relationship works between both `belongsTo` records
//   return hash;
// }
