"use strict";

angular.module("tableView", ["ngAnimate"]).component("tableView", {
  templateUrl: "common/table-view/table-view.template.html",
  bindings: {
    tableData: "<",
    onRowClick: "<",
    rowDisabled: "<",
    animations: "<",
  },
  controller: function () {
    let self = this;
    self.$onInit = function () {
      self.animations = self.animations ?? true;
    };
  },
});
