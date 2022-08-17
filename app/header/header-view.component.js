angular.module("headerView").component("headerView", {
  templateUrl: "header/header-view.template.html",
  controller: [
    "$location",
    "devicesViewState",
    function headerViewController($location, devicesViewState) {
      let self = this;

      self.title = "Network Manager";
      self.version = "1.0.0";

      self.redirectToHome = () => $location.path("/home");
      self.redirectToDevices = function () {
        $location.path("/devices");
        $location.search({ offset: 0, count: 10 });
      };
      self.redirectToPorts = () => $location.path("/ports");
      self.redirectToClients = () => $location.path("/clients");
    },
  ],
});
