"use strict";

function Index() {
    // Mapping zwischen tokens und array von Dokumenten wo das 
    // Token enthalten ist
    this.indexMap = {};

    this.add = function(document) {
        var tokens = this._tokenize(document);
        for (var i = 0; i < tokens.length; i++) {
            var token = tokens[i];
            if (this.indexMap[token] === undefined) {
                this.indexMap[token] = [document];
            } else {
                if (!this.indexMap[token].some(function(element, index, array) {
                    return element === document;
                })) {
                    this.indexMap[token].push(document);
                }
            }
        }
    };

    this._tokenize = function(object) {
        var that = this;
        if (_.isUndefined(object) || _.isNull(object)) {
            return [];
        }
        if (_.isString(object)) {
            return this.split(object);
        }
        if (Util.isPrimitive(object)) {
            return [object.toString()];
        }
        if (_.isArray(object)) {
            var tokens = [];
            for (var i = 0; i < object.length; i++) {
                tokens = tokens.concat(this._tokenize(object[i]));
            };
            return tokens;
        }
        if (_.isPlainObject(object)) {
            var tokens = [];
            _.forOwn(object, function(num, key) {
                tokens = tokens.concat(that._tokenize(object[key]));
            });
            return tokens;
        }
        return [];
    };

    this.search = function(term) {
        var searchTermTokens = this._tokenize(term);
        var that = this;
        var allTokenDocuments = _.map(searchTermTokens, function(token) {
            return that.indexMap[token] || [];
        });
        var minimalTokenDocuments = _.min(allTokenDocuments, function(tokenDocuments) {
            return tokenDocuments.length;
        });
        var searchResults = [];
        for (var i = 0; i < minimalTokenDocuments.length; i++) {
            var document = minimalTokenDocuments[i];
            var includeDocument = _.every(allTokenDocuments, function(tokenDocuments) {
                return _.contains(tokenDocuments, document);
            });
            if (includeDocument) {
                searchResults.push(document);
            }
        }
        return searchResults;
    };

    this.split = function(text) {
        return _.without(text.split(/[., :;!?\t\r\n]/), "");
    };

}