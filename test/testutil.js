'use strict';

var TestUtil = {

	batchAssertEquals : function(testdata, testfunction, scope) {
		for (var i = 0; i < testdata.length ; i++) {
	        var input = testdata[i][0];
	        var output = testdata[i][1];
	        expect(testfunction.apply(scope, [input])).toEqual(output);
	    };
	}
};