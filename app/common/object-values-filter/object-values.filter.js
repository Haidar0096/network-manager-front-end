// A filter that returns the values of an object as an array.
angular.module("common").filter("objectValues", function () {
  return function (input) {
    if (!angular.isObject(input)) {
      throw Error("Usage of non-objects with objectValues filter!");
    }
    return Object.values(input);
  };
});
