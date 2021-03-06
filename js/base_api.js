'use strict'

var request = require('request')

var base_api = function() {
    function BaseAPI() {}

    BaseAPI.prototype.retrieveHeaders = function() {
        return {
            'Accept': 'application/json'
            }        
        }
  
    BaseAPI.prototype.updateHeaders = function(etag) {
        return {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'If-Match': etag
            }      
        }
  
    BaseAPI.prototype.deleteHeaders = function() {
        return {
            'Accept': 'application/json'
            }        
        }
  
    BaseAPI.prototype.createHeaders = function() {
        return {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
            }      
        }
  
    BaseAPI.prototype.retrieve = function(url, callback, entity, headers) {
        // issue a GET to retrieve a resource from the API and create an object for it
        var self = this; 
        request({
            url: url,
            headers: headers || self.retrieveHeaders()
            },
            function (error, response, body) {
                self.processResourceResult(error, response, body, url, callback, entity)
           })
    }            

    BaseAPI.prototype.update = function(url, etag, changes, callback, entity, headers) {
        var self = this; 
        request.patch({
            url: url,
            headers: headers || self.updateHeaders(),
            body: JSON.stringify(changes)
            },
            function (error, response, body) {
                self.processResourceResult(error, response, body, url, callback, entity)
           })
    }

    BaseAPI.prototype.delete = function(url, callback, entity, headers) {
        var self = this; 
        request.del({
            url: url,
            headers: headers || self.deleteHeaders()
            },
            function (error, response, body) {
                self.processResourceResult(error, response, body, url, callback, entity)
           })
    }

    BaseAPI.prototype.create = function(url, body, callback, entity, headers) {
        var self = this; 
        request.post({
            url: url,
            headers: headers || self.createHeaders(),
            body: JSON.stringify(body)
            },
            function (error, response, body) {
                self.processResourceResult(error, response, body, url, callback, entity, 'location')
           });
    }
  
    BaseAPI.prototype.processResourceResult = function(error, response, body, url, callback, entity, location_header) {
        location_header = location_header ? location_header : 'content-location';
        if (!error) {
            if (response.statusCode == 200 || response.statusCode == 201) {
                if (location_header in response.headers) {
                    var location = response.headers[location_header];
                    if ('etag' in response.headers) {
                        var etag = response.headers['etag'];
                        if ('content-type' in response.headers) {
                            var content_type = response.headers['content-type'].split(';')[0]
                            if (content_type == 'application/json') {
                                var jso = JSON.parse(body);
                                try {
                                    callback(null, this.buildResourceFromJson(jso, location, etag, entity))
                                } catch(err) {
                                    callback(err)
                                }
                            } else {
                                callback({args: ['non-json content_type ' + response.headers['content-type']]})
                            }
                        } else {
                            callback({args: ['server did not declare content_type']})
                        }
                    } else {
                        callback({args: ['server did not provide etag']})
                    }
                } else {
                    callback({args: ['server failed to provide ' + location_header + ' header for url ' + url + 'headers ' + JSON.stringify(response.headers)]})
                }
            } else {
                callback({args: ['unexpected HTTP statusCode code: ' + response.statusCode + ' url: ' + url + ' text: ' + response.body]})
            }
        } else {
            callback({args: ['http error' + error]})
        }
    }
            
    BaseAPI.prototype.buildResourceFromJson = function(jso, url, etag, entity) {
        if ('kind' in jso) {
            var kind = jso.kind; 
            if (entity) {
                if (!('kind' in entity) || entity.kind == kind) {
                    entity.updateProperties(url, jso, etag);
                    return entity
                } else {
                    throw {args: ['SDK cannot handle change of kind from' + entity.kind + ' to ' + kind]}
                } 
            } else {        
                var resourceClass = this.resourceClass(kind);
                if (resourceClass) {
                    return new resourceClass(url, jso, etag)
                } else {
                    throw {args: ['no resourceClass for kind ' + kind]}
                }
            }
        } else {
            if (!!entity && entity.kind) {
                entity.updateProperties(url, jso, etag);
                return entity
            } else {
                throw {args: ['no kind property in json ' + jso]}
            }   
        }            
    }

    BaseAPI.prototype._className = 'BaseAPI' 
    
    function BaseResource(url, jso, etag) {
        this.kind =  Object.getPrototypeOf(this)._className
        this.updateProperties(url, jso, etag)
    }
    
    BaseResource.prototype.updateProperties = function(url, jso, etag) {
        if (jso) {
            for (var key in jso) {
                this[key] = jso[key]
            }
            if ('_location' in jso) {
                this._location = jso._location
            } else if ('_self' in jso) {
                this._location = jso._self
            }
            this._jso = jso
        }
        if (url) {
            this._location = url
        }
        if (etag) {
            this._etag = etag
        }
    }

    BaseResource.prototype.refresh = function(callback) {
        if (!this._location) {
            callback({args: ['no _location property' + JSON.stringify(this)]})
        }
        this.api().retrieve(this._location, callback, this)

    }

    BaseResource.prototype._className = 'BaseResource' 

    function BaseEntity(url, jso, etag) {
        this._related = {}
        this.kind =  Object.getPrototypeOf(this)._className
        BaseResource.call(this, url, jso, etag)
    }
    
    BaseEntity.prototype = Object.create(BaseResource.prototype);
    BaseEntity.prototype.constructor = BaseEntity;

    BaseEntity.prototype.getUpdateRepresentation = function() {
        var jso = '_jso' in this ? this._jso : {}
        var rslt = {}
        for (var key in this) {
            if (key.indexOf('_') !== 0 && (!(key in jso) || jso[key] != this[key])) {
                rslt[key] = this[key]
            }
        }
        return rslt
    }

    BaseEntity.prototype.update = function(callback) {
        // issue a PATCH or PUT to update this object from API
        var changes = this.getUpdateRepresentation()
        if (! ('_location' in this) || !this._location) {
            callback({args: ['this _location not set']})
        }
        if (! ('_etag' in this) || !this._location) {
            callback({args: ['self _etag not set']})
        }
        this.api().update(this._location, this._etag, changes, callback, this)
    }

    BaseEntity.prototype.delete = function(callback) {
        // issue a DELETE to remove this object from API
        if (!this._location) {
            callback({args: ['self location not set']})
        } else {
            return this.api().delete(this._location, callback, this)
        }
    }
    
    BaseEntity.prototype.retrieve = function(relationship, callback) {
        // fetch a related resource
        var self = this;
        if (relationship in this) {
            var url = this[relationship];
            this.api().retrieve(url, function(error, entity) {
                if (!error) {
                    self._related[relationship] = entity;
                }
                callback(error, entity);
            });
        } else {
            throw {args: ['no value set for property ' + relationship]}
        }
    }

    BaseEntity.prototype._className = 'BaseEntity' 
      
    function BaseCollection(url, jso, etag) {
        BaseResource.call(this, url, jso, etag)
    }
    
    BaseCollection.prototype = Object.create(BaseResource.prototype);
    BaseCollection.prototype.constructor = BaseCollection;

    BaseCollection.prototype.updateProperties = function(url, jso, etag) {
        BaseResource.prototype.updateProperties.call(this, url, jso, etag)
        if (jso && 'items' in jso) {
            var items = jso['items'];
            this.items = {}
            for (var i = 0; i < items.length; i++) {
                var item = this.api().buildResourceFromJson(items[i]);
                this.items[item._location] = item
            }
        }
    }

    BaseCollection.prototype.create = function(entity, callback) {
        // create a new entity in the API by POSTing
        var self = this;
        if (this._location) {
            if ('_self' in entity && entity._self) {
                throw 'entity already exists in API: ' + entity
            }
            this.api().create(this._location, entity.getUpdateRepresentation(), function(error, entity) {
                if (!error && 'items' in self) {
                    if (entity._self in self.items) {
                        throw 'Duplicate id'
                    } else {
                        self.items[entity._self] = entity
                    }
                }
                callback(error, entity)                
            }, entity)
        } else {
            throw 'Collection has no _self property'
        }
    }
    
    BaseCollection.prototype._className = 'BaseCollection' 
    
    return {
      BaseAPI: BaseAPI,    
      BaseResource: BaseResource,
      BaseEntity: BaseEntity,
      BaseCollection: BaseCollection
    }
}

module.exports = base_api()