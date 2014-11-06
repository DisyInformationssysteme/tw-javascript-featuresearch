"use strict";

var Util = {
    isPrimitive: function(value) {
        return typeof value === "boolean" ||
            typeof value === "number" ||
            typeof value === "string";
    },

    arrayEqualsWithoutOrdering: function(array1, array2) {
        if (!_.isArray(array1) || !_.isArray(array2) || array1.length !== array2.length) {
            return false;
        }
        var sortedArray1 = array1.slice(0).sort();
        var sortedArray2 = array2.slice(0).sort();
        for (var i = 0; i < sortedArray1.length; i++) {
            if (sortedArray1[i] !== sortedArray2[i]) {
                return false;
            }
        }
        return true;
    },

    dropDuplicates: function (items) {
        // leeres array result
        // Schleife über alle items
        // zu result hinzufügen falls item noch nicht in result enthalten ist
        // oder halt Lodash!
        return items;
    }
};