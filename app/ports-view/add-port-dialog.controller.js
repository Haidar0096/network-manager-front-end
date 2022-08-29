"use strict";

import { devicesSelector } from "/app/ports-view/ports-view.slice.js";

angular.module("portsView").controller("AddPortDialogController", [
  "$mdDialog",
  "$ngRedux",
  function AddPortDialogController($mdDialog, $ngRedux) {
    let self = this;

    self.title = "Add Port";

    self.devices = devicesSelector($ngRedux.getState());

    self.onConfirm = function () {
      if (self.portNumber === undefined || self.portNumber === null) {
        self.alertText = "Port Number is required";
        return;
      }
      if (self.device === undefined || self.device === null) {
        self.alertText = "Device is required";
        return;
      }
      $mdDialog.hide({ portNumber: self.portNumber, device: self.device });
    };

    self.onCancel = () => {
      $mdDialog.cancel();
    };
  },
]);
