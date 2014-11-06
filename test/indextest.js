"use strict";

describe("Feature Search", function() {
    var index;

    beforeEach(function() {
        index = new Index();
        for (var i = 0; i < biotopeEingeschraenkt.length; i++) {
            index.add(biotopeEingeschraenkt[i]);
        }
    });

    describe("tokeniziation", function() {
        it("will split empty string", function() {
            expect(index.split("")).toEqual([]);
        });

        it("will split non whitespace string", function() {
            expect(index.split("foo")).toEqual(["foo"]);
        });

        it("will split whitespace string", function() {
            expect(index.split("   ")).toEqual([]);
        });
        it("will ignore all separators", function() {
            expect(index.split("., :;!?\t\r\n")).toEqual([]);
        });
        it("will return single tokens from a string with separators", function() {
            expect(index.split("dr. martin anderer-basinger")).toEqual([
                "dr", "martin", "anderer-basinger"
            ]);
        });
        it("will ignore separators at the beginning and end of the string", function() {
            expect(index.split(" dr. martin anderer-basinger,")).toEqual([
                "dr", "martin", "anderer-basinger"
            ]);
        });

    });

    describe("FR4 - Document ranking", function() {


        var indexForRanking;

        beforeEach(function() {
            indexForRanking = new Index();
            for (var i = 0; i < testDocumentsRanked.length; i++) {
                indexForRanking.add(testDocumentsRanked[i]);
            }
        });

        it("returns correct ranked documents for 'und'", function() {
            assertRankedSearchResult("und", [2, 3]);
        });

        it("returns correct ranked documents for 'Feature'", function() {
            assertRankedSearchResult("Feature", [3, 2]);
        });

        it("returns correct ranked documents for 'und' und 'Feature'", function() {
            assertRankedSearchResult("und Feature", [3, 2]);
        });

        it("returns correct ranked documents for 'und' und 'Feature' even with unknowns", function() {
            assertRankedSearchResult("und Feature unknown", []);
        });

        it("returns correct ranked documents for double 'und' und 'Feature'", function() {
            assertRankedSearchResult("und und Feature", [3, 2]);
        });


        function assertRankedSearchResult(searchInput, expectedRankedSids) {
            var results = indexForRanking.search(searchInput);
            var rankedResultSids = _.map(results, function(result) {
                return result.id;
            });
            expect(rankedResultSids).toEqual(expectedRankedSids);
        }


        describe('We can count the frequency of tokens in a document', function() {

            it("Count token in empty document", function() {
                expect(index._countFrequency("feldheckend", {})).toEqual(0);
            });

            it("Count single token in document", function() {
                expect(index._countFrequency("feldheckend", {
                    fobar: "FEldheckend"
                })).toEqual(1);
            });

            it("Count single token in document with more than one token", function() {
                expect(index._countFrequency("feldheckend", {
                    fobar: "FEldheckend",
                    foo: "anders"
                })).toEqual(1);
            });

            it("Count multiple occuring token in document with more than one token", function() {
                expect(index._countFrequency("feldheckend", {
                    fobar: "FEldheckend",
                    foo: "FEldheckend"
                })).toEqual(2);
            });

        });

        describe('We can calculate the inverse document frequency of a token in an index', function() {
            it("idf for empty index", function() {
                var fun = function () {
                  new Index()._inverseDocumentFrequency("ignored");  
                };
                expect(fun).toThrow();
            });

            it("idf for existing index", function() {
                expect(indexForRanking._inverseDocumentFrequency("und")).toEqual(Math.log(1.5));
            });

            it("idf for another existing index", function() {
                expect(indexForRanking._inverseDocumentFrequency("feature")).toEqual(Math.log(1.5));
            });

            it("idf for non-existing token", function() {
                var fun = function () {
                  indexForRanking._inverseDocumentFrequency("missing");  
                };
                expect(fun).toThrow();
            });

        });
        
        describe('We can calculate document relevance for', function() {

            it("an existing token in a document", function() {
                expect(indexForRanking._getDocumentRelevanceForToken("und", testDocumentsRanked[1])).toEqual(2 * Math.log(1.5));
            });

            it("another existing token in a document", function() {
                expect(indexForRanking._getDocumentRelevanceForToken("feature", testDocumentsRanked[1])).toEqual(1 * Math.log(1.5));
            });

            it("a non-existing token in a document", function() {
                expect(indexForRanking._getDocumentRelevanceForToken("abc", testDocumentsRanked[1])).toEqual(0);
            });


        });

        describe('We can calculate document relevance for', function() {

            it("the queried term consisting of several tokens", function() {
                expect(indexForRanking._getDocumentRelevance(["feature", "und"], testDocumentsRanked[1])).toEqual((2 * Math.log(1.5)) + (1 * Math.log(1.5)));
            });

        });
    });



    describe("FR1 - Ich muss über beliebige Objekte nach beliebige Wörter suchen können", function() {

        var allTestSIDs = [180, 184, 179];

        it("returns results over subset of features when no field is specified", function() {
            assertSearchResult("Feldhecken", allTestSIDs);
        });

        it("returns results regardless of case", function() {
            assertSearchResult("FELDHECKEN", allTestSIDs);
        });

        it("returns no results when a term is searched which is not available", function() {
            assertSearchResult("Radoslav", []);
        });

        it("finds results for more than one search token", function() {
            assertSearchResult("Feldhecken, Feldgehölze", allTestSIDs);
        });

        it("returns results regardless of case with more than one search token", function() {
            assertSearchResult("FELDHECKEN, FELDGEHÖLZE", allTestSIDs);
        });

        it("finds results for integers", function() {
            assertSearchResult("300", [180]);
        });

        it("finds results for floats", function() {
            assertSearchResult(854.5, [184]);
        });

        it("finds no results for empty search token", function() {
            assertSearchResult("", []);
        });

        it("finds no results for whitespace search token", function() {
            assertSearchResult("     ", []);
        });

        it("finds no results for undefined search token", function() {
            assertSearchResult(undefined, []);
        });

        it("finds no results for null as search token", function() {
            assertSearchResult(null, []);
        });

        it("finds results for more than one search token over several fields", function() {
            assertSearchResult("Feldhecken, Feldgehölze Schießmauer", [184]);
        });

        it("finds no results when one token cannot be found", function() {
            assertSearchResult("Feldhecken, Feldgehölze Schießmauer Radoslav", []);
        });


        describe("We can tokenize a given object", function() {

            it("tokenizes primitives, null and undefined", function() {
                var testdata = [
                    [undefined, []],
                    [null, []],
                    [3, ["3"]],
                    [-3, ["-3"]],
                    [2.56, ["2.56"]],
                    [2e+6, ["2000000"]],
                    [-2.6, ["-2.6"]],
                    [true, ["true"]],
                    [false, ["false"]],
                    ["", []],
                    [new String("Hello"), ["hello"]],
                    ["Hallo noch ein Hallo", ["hallo", "noch", "ein", "hallo"]]
                ];
                TestUtil.batchAssertEquals(testdata, index._tokenize, index);
            });

            it("tokenizes arrays", function() {
                var testdata = [
                    [
                        [],
                        []
                    ],
                    [
                        [undefined],
                        []
                    ],
                    [
                        [null],
                        []
                    ],
                    [
                        ["foo", undefined],
                        ["foo"]
                    ],
                    [
                        ["bar"],
                        ["bar"]
                    ],
                    [
                        ["abc", "def"],
                        ["abc", "def"]
                    ],
                    [
                        [0, "foo", 42, true, null, 0.1337],
                        ["0", "foo", "42", "true", "0.1337"]
                    ],
                    [
                        ["foo", "bar", "foo"],
                        ["foo", "bar", "foo"]
                    ],
                    [
                        [
                            ["foo", "bar"],
                            ["buz", "baz"],
                            []
                        ],
                        ["foo", "bar", "buz", "baz"]
                    ]
                ];
                TestUtil.batchAssertEquals(testdata, index._tokenize, index);
            });

            it("tokenizes plain objects", function() {
                var testdata = [
                    [{},
                        []
                    ],
                    [{
                            booleanValue: true
                        },
                        ["true"]
                    ],
                    [{
                            stringValue: "Hallo"
                        },
                        ["hallo"]
                    ],
                    [{
                            numberValue: 123.456
                        },
                        ["123.456"]
                    ],
                    [{
                            nullValue: null
                        },
                        []
                    ],
                    [{
                            undefinedValue: undefined
                        },
                        []
                    ],
                    [{
                            arrayValue: [0, "foo", 42, true, null, 0.1337]
                        },
                        ["0", "foo", "42", "true", "0.1337"]
                    ],
                    [{
                            nestedObject: {
                                stringValue: "foo"
                            },
                            nestedObject2: {
                                stringValue: "foo"
                            }
                        },
                        ["foo", "foo"]
                    ],
                ];
                TestUtil.batchAssertEquals(testdata, index._tokenize, index);
            });

            it("does not tokenizes objects created with own constructor", function() {
                function Foo() {
                    this.bar = "buz";
                };
                var testdata = [
                    [new Foo(), []],
                    [
                        [new Foo(), new Foo()],
                        []
                    ],
                    [
                        [new Foo(), new Foo(), null],
                        []
                    ]
                ];
                TestUtil.batchAssertEquals(testdata, index._tokenize, index);
            });

        });

    });

    describe("FR1 - reduce benutzen", function() {
      
        it("it reduces", function() {
            expect(_.reduce([1,2,3], 
                function(count, token) {
            return count + token;
            }, 0)).toEqual(6);
        });
    });


    function assertSearchResult(searchInput, expectedSids) {
        var results = index.search(searchInput);
        var searchResultSids = _.map(results, function(result) {
            return result.properties.SID;
        });
        expect(Util.arrayEqualsWithoutOrdering(expectedSids, searchResultSids)).toBe(true);
    }






});