"use strict";

describe("Utility test", function() {
    describe("Object type detection - test if...", function() {
        it("...string is primitive", function() {
            expect(Util.isPrimitive("hallo")).toBe(true);
        });

        it("...boolean is primitive", function() {
            expect(Util.isPrimitive(true)).toBe(true);
        });

        it("...number is primitive", function() {
            expect(Util.isPrimitive(123)).toBe(true);
        });

        it("...array is not a primitive", function() {
            expect(Util.isPrimitive([1, 2, 3])).toBe(false);
        });

        it("...object is not a primitive", function() {
            expect(Util.isPrimitive({
                test: "foo"
            })).toBe(false);
        });

        it("...undefined is not a primitive", function() {
            expect(Util.isPrimitive(undefined)).toBe(false);
        });

        it("...null is not a primitive", function() {
            expect(Util.isPrimitive(null)).toBe(false);
        });
    });
    describe("Array equality without ordering - test if...", function() {
        it("...array and not array are not equal", function() {
            expect(Util.arrayEqualsWithoutOrdering([1], "1")).toBe(false);
            expect(Util.arrayEqualsWithoutOrdering([1], null)).toBe(false);
            expect(Util.arrayEqualsWithoutOrdering(null, null)).toBe(false);
            expect(Util.arrayEqualsWithoutOrdering("1", "1")).toBe(false);
        });
        it("...arrays with different length are not equals", function() {
            expect(Util.arrayEqualsWithoutOrdering([1], [1, 2])).toBe(false);
        });
        it("... empty arrays are equals", function() {
            expect(Util.arrayEqualsWithoutOrdering([], [])).toBe(true);
        });
        it("... arrays with same length and different elements are not equals", function() {
            expect(Util.arrayEqualsWithoutOrdering([1], [2])).toBe(false);
        });
        it("... arrays with same elements are equal", function() {
            expect(Util.arrayEqualsWithoutOrdering([1], [1])).toBe(true);
            expect(Util.arrayEqualsWithoutOrdering([1, 2], [1, 2])).toBe(true);
        });
        it("... arrays with same elements in different order are equal", function() {
            expect(Util.arrayEqualsWithoutOrdering([1, 2], [2, 1])).toBe(true);
        });

        it("... does not change input parameters", function() {
            var param1 = [1, 2];
            var param2 = [2, 1];
            Util.arrayEqualsWithoutOrdering(param1, param2);
            expect(param1).toEqual([1, 2]);
            expect(param2).toEqual([2, 1]);
        });
    });
});