"use strict";

angular.module("networkManagerApp").config([
  "$routeProvider",
  function config($routeProvider) {
    $routeProvider
      .when("/", {
        template: "<home-view></home-view>",
      })
      .when("/devices", {
        template: "<devices-view></devices-view>",
      })
      .when("/ports", {
        template: "<ports-view></ports-view>",
      })
      .when("/clients", {
        template: "<clients-view></clients-view>",
      })
      .otherwise("/");
  },
]);
