"use strict";

import { devicesSelector } from "/app/phone-numbers-view/phone-numbers-view.slice.js";

angular.module("phoneNumbersView").controller("AddPhoneNumberDialogController", [
  "$mdDialog",
  "$ngRedux",
  function AddPhoneNumberDialogController($mdDialog, $ngRedux) {
    let self = this;

    self.title = "Add Phone";

    self.devices = devicesSelector($ngRedux.getState());

    self.onConfirm = function () {
      if (self.phoneNumber === undefined || self.phoneNumber === null) {
        self.alertText = "Phone Number is required";
        return;
      }
      if (self.device === undefined || self.device === null) {
        self.alertText = "Device is required";
        return;
      }
      if (self.status === undefined || self.status === null) {
        self.alertText = "Status is required";
        return;
      }
      $mdDialog.hide({ phoneNumber: self.phoneNumber, device: self.device, status: self.status });
    };

    self.onCancel = () => {
      $mdDialog.cancel();
    };
  },
]);
