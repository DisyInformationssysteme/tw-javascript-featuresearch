"use strict";

var idExtractor = function(f) {
    return f.properties.SID;
};

var fieldExtractors = {
    "type": function(f) {
        return f.properties.BIOTOPTY_3;
    },
    "kartierung": function(f) {
        return f.properties.KARTIERU_1;
    },
    "name": function(f) {
        return f.properties.BIOTOP_NAM;
    }
};

describe("Feature Search", function() {
    var index;

    beforeEach(function() {
        index = new Index(idExtractor, fieldExtractors);
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

    describe("FR1 - Ich muss über beliebige Objekte nach beliebige Wörter suchen können", function() {

        it("returns results over subset of features when no field is specified", function() {
            var results = index.search("Feldhecken");
            expect(results.length).toBe(3);
        });


        it("returns no results when a term is searched which is not available", function() {
            var results = index.search("Feldheckens");
            expect(results.length).toBe(0);
        });

        it("finds results for more than one search token", function() {
            var results = index.search("Feldhecken, Feldgehölze");
            expect(results.length).toBe(3);
        });

        it("finds results for integers", function() {
            var results = index.search("300");
            expect(results.length).toBe(1);
        });

        it("finds results for floats", function() {
            var results = index.search(854.5);
            expect(results.length).toBe(1);
        });

        it("finds results for more than one search token over several fields", function() {
            var results = index.search("Feldhecken, Feldgehölze Schießmauer");
            expect(results.length).toBe(1);
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
                    [new String("Hello"), ["Hello"]],
                    ["Hallo noch ein Hallo", ["Hallo", "noch", "ein", "Hallo"]]
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
                        ["Hallo"]
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

});