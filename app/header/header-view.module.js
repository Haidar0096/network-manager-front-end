"use strict";

angular.module("headerView", []).component("headerView", {
  templateUrl: "header/header-view.template.html",
  controller: [
    "$location",
    "$ngRedux",
    function headerViewController($location, $ngRedux) {
      let self = this;

      self.title = "Network Manager";
      self.version = "1.0.0";

      self.redirectToHome = () => $location.path("/home");
      self.redirectToDevices = () => $location.path("/devices");
      self.redirectToPorts = () => $location.path("/ports");
      self.redirectToPhoneNumbers = () => $location.path("/phone-numbers");
      self.redirectToClients = () => $location.path("/clients");
      self.redirectToReservations = () => $location.path("/reservations");
    },
  ],
});
