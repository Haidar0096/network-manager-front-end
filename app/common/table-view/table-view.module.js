"use strict";

angular.module("tableView", ["ngAnimate"]).component("tableView", {
  templateUrl: "common/table-view/table-view.template.html",
  bindings: {
    tableData: "<",
    onRowClick: "<",
    rowDisabled: "<",
  },
});
