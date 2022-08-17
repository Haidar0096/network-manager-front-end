"use strict";

angular.module("devicesView").controller("deviceDialogPromptController", [
  "$mdDialog",
  "devicesViewState",
  function deviceDialogPromptController($mdDialog, devicesViewState) {
    let self = this;

    self.title = devicesViewState.title;
    self.prompt = devicesViewState.prompt;
    self.confirmMessage = devicesViewState.confirmMessage;
    self.cancelMessage = devicesViewState.cancelMessage;
    self.placeholder = devicesViewState.placeholder;
    self.data = devicesViewState.data;

    self.hide = function () {
      $mdDialog.hide();
    };

    self.onCancel = function () {
      $mdDialog.cancel();
    };

    self.onConfirm = function (answer) {
      $mdDialog.hide(answer);
    };
  },
]);
