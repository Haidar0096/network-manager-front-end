"use strict";

import devicesViewReducer from "./devices-view/devices-view.slice.js";

angular
  .module("networkManagerApp")
  // Route Configuration
  .config([
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
  ])
  // Redux Store Configuration
  .config([
    "$ngReduxProvider",
    function config($ngReduxProvider) {
      const store = RTK.configureStore({
        reducer: {
          // Define a top-level state field named `devicesViewState`, handled by `devicesViewReducer`
          devicesViewState: devicesViewReducer,
        },
        middleware: (getDefaultMiddleware) => getDefaultMiddleware({ serializableCheck: false }),
      });
      $ngReduxProvider.provideStore(store);
    },
  ]);
