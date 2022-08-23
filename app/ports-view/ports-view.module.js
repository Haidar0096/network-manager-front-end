"use strict";

import TableViewData from "/app/common/table-view/table-view-data.model.js";

angular.module("portsView", ["common"]).component("portsView", {
  templateUrl: "ports-view/ports-view.template.html",
  controller: [
    function PortsViewController() {
      let self = this;

      self.tableData = new TableViewData(
        ["Port Id", "Port Name"],
        [
          { Id: 1, Name: "Port 1" },
          { Id: 2, Name: "Port 2" },
          { Id: 3, Name: "Port 3" },
        ]
      );

      self.title = "Ports";
    },
  ],
});
