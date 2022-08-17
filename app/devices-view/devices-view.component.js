"use strict";

angular.module("devicesView").component("devicesView", {
  templateUrl: "devices-view/devices-view.template.html",
  controller: [
    "devicesViewState",
    function DevicesViewController(devicesViewState) {
      let self = this;

      self.state = devicesViewState;
      devicesViewState.initState();
    },
  ],
});
