"use strict";

import { deviceIdsSelector } from "/app/ports-view/ports-view.slice.js";

angular.module("portsView").controller("AddPortDialogController", [
  "$mdDialog",
  "$ngRedux",
  function AddPortDialogController($mdDialog, $ngRedux) {
    let self = this;

    self.title = "Add Port";

    self.devicesIds = deviceIdsSelector($ngRedux.getState());

    self.onConfirm = function () {
      if (self.portNumber === undefined || self.portNumber === null) {
        self.alertText = "Port Number is required";
        return;
      }
      if (self.deviceId === undefined || self.deviceId === null) {
        self.alertText = "Device Id is required";
        return;
      }
      $mdDialog.hide({ portNumber: self.portNumber, deviceId: self.deviceId });
    };

    self.onCancel = () => {
      $mdDialog.cancel();
    };
  },
]);
