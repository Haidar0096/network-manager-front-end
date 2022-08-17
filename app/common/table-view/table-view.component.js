angular.module("tableView").component("tableView", {
  templateUrl: "common/table-view/table-view.template.html",
  bindings: {
    tableData: "<",
    onRowClick: "<",
  },
});
