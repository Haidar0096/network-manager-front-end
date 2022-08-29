"use strict";

import { clientsSelector, phoneNumbersSelector } from "/app/reservations-view/reservations-view.slice.js";

angular.module("reservationsView").controller("addReservationDialogController", [
  "$mdDialog",
  "$ngRedux",
  function AddReservationDialogController($mdDialog, $ngRedux) {
    let self = this;

    self.title = "Add Reservation";

    self.clients = clientsSelector($ngRedux.getState());
    self.phoneNumbers = phoneNumbersSelector($ngRedux.getState());

    self.onConfirm = function () {
      if (self.phoneNumber === undefined || self.phoneNumber === null) {
        self.alertText = "Phone Number is required";
        return;
      }
      if (self.client === undefined || self.client === null) {
        self.alertText = "Client Name is required";
        return;
      }
      if (self.BEDString === undefined || self.BEDString === null) {
        self.alertText = "BED is required";
        return;
      }

      self.BED = moment(self.BEDString).utcOffset(0, true).format();
      if (self.EEDString !== null && self.EEDString !== undefined) {
        self.EED = moment(self.EEDString).utcOffset(0, true).format();
      }
      $mdDialog.hide({ phoneNumberId: self.phoneNumber.id, clientId: self.client.id, BED: self.BED, EED: self.EED });
    };

    self.onCancel = () => {
      $mdDialog.cancel();
    };
  },
]);
