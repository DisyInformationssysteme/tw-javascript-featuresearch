"use strict";

describe("Object type detection - test if...", function() {
	it("...string is primitive", function(){
		expect(Util.isPrimitive("hallo")).toBe(true);
	});

	it("...boolean is primitive", function(){
		expect(Util.isPrimitive(true)).toBe(true);
	});

    it("...number is primitive", function(){
		expect(Util.isPrimitive(123)).toBe(true);
	});

	it("...array is not a primitive", function(){
		expect(Util.isPrimitive([1,2,3])).toBe(false);
	});

	it("...object is not a primitive", function(){
		expect(Util.isPrimitive({test : "foo"})).toBe(false);
	});

	it("...undefined is not a primitive", function(){
		expect(Util.isPrimitive(undefined)).toBe(false);
	});

	it("...null is not a primitive", function(){
		expect(Util.isPrimitive(null)).toBe(false);
	});

});