"use strict";

function Index() {
    // Mapping zwischen tokens und array von Dokumenten wo das 
    // Token enthalten ist
    this.indexMap = {};
    this.documentCount = 0;
    var that = this;

    this.add = function(document) {
        var tokens = this._tokenize(document);
        this.documentCount++;
        for (var i = 0; i < tokens.length; i++) {
            var token = tokens[i].toLowerCase();
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
        return _.map(this._createTokens(object), function (token) {
            return token.toLowerCase();
        });
    };

    this._createTokens = function(object) {
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

        // searchTermTokens = this._dropDuplicates(searchTermTokens);

        var allTokenDocuments = _.map(searchTermTokens, function(token) {
            return that.indexMap[token.toLowerCase()] || [];
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
        return searchResults.sort(this._createDocumentComparator(searchTermTokens));
    };


    this._createDocumentComparator = function (searchTermTokens){
        return function (doc1, doc2) {
            return that._getDocumentRelevance(searchTermTokens, doc2) - that._getDocumentRelevance(searchTermTokens, doc1);
        }
    };

    this._getDocumentRelevance = function (searchTermTokens, document) {
        var that = this;
        return _.reduce(searchTermTokens, function(sum, token) {           
            return sum + that._getDocumentRelevanceForToken(token, document);
        }, 0);
    };

    this._getDocumentRelevanceForToken = function(token, document){
        return this._countFrequency(token, document) * this._inverseDocumentFrequency (token); 
    };

    this._countFrequency = function(token, document) {
        var tokens = this._tokenize(document);

        /* Die Schleife ist lesbarer

        return _.reduce(tokens, function(count, currentToken) {
            if (token === currentToken) {
                count++;
            }
            return count;
        }, 0);
*/
        var count = 0;
        for (var i = 0; i < tokens.length; i++) {
            if (tokens[i] === token) {
                count++;
            }
        };
        return count;
    };

    this._inverseDocumentFrequency = function(token) {
        if (this.indexMap[token] === undefined) {
            throw "Token war nicht im Index: " + token; 
            return 1;       
        } else {
            return Math.log(this.documentCount / this.indexMap[token].length);
        }
    }

    this.split = function(text) {
        return _.without(text.split(/[., :;!?\t\r\n]/), "");
    };

}