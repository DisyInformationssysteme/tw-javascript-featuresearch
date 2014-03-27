"use strict";

var Util = {
	isPrimitive : function (value) {
		return typeof value === "boolean" ||
			   typeof value === "number" ||
			   typeof value === "string";
	}
};