"use strict";

angular.module("errorView", ["ngMaterial"]).component("errorView", {
  templateUrl: "common/error-view/error-view.template.html",
  bindings: {
    text: "<",
    visible: "<",
  },
});
