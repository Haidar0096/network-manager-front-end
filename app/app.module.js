"use strict";

import devicesViewReducer from "/app/devices-view/devices-view.slice.js";
import portsViewReducer from "/app/ports-view/ports-view.slice.js";

angular
  .module("networkManagerApp", [
    "ngRoute",
    "ngRedux",
    "headerView",
    "homeView",
    "devicesView",
    "portsView",
    "phoneNumbersView",
    "clientsView",
  ])
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
        .when("/phone-numbers", {
          template: "<phone-numbers-view></phone-numbers-view>",
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
          portsViewState: portsViewReducer,
        },
        middleware: (getDefaultMiddleware) => getDefaultMiddleware({ serializableCheck: false }), // this is to disable undesired serialization errors
      });
      $ngReduxProvider.provideStore(store);
    },
  ]);
