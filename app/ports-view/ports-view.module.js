"use strict";

import TableViewData from "/app/common/table-view/table-view-data.model.js";

angular.module("portsView", ["common", "ngRedux"]).component("portsView", {
  templateUrl: "ports-view/ports-view.template.html",
  controller: [
    function PortsViewController() {
      let self = this;

      self.tableData = new TableViewData(
        ["Port Id", "Port Number", "Device Id"],
        [
          { Id: 1, Number: "10022" , DeviceId: 1},
          { Id: 2, Number: "65430" , DeviceId: 27},
          { Id: 3, Number: "2234" , DeviceId: 53},
        ]
      );

      // TODO: implement

      self.title = "Ports";
    },
  ],
});
