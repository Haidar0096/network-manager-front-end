"use strict";

angular.module("homeView").component("homeView", {
  templateUrl: "home-view/home-view.template.html",
  controller: [
    function HomeViewController() {
      this.message =
        "Welcome to network manager app. Choose an option from above to start!";
    },
  ],
});
