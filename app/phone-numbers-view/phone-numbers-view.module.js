"use strict";

import TableViewData from "/app/common/table-view/table-view-data.model.js";

angular.module("phoneNumbersView", ["common", "ngRedux"]).component("phoneNumbersView", {
  templateUrl: "phone-numbers-view/phone-numbers-view.template.html",
  controller: [
    function phoneNumbersViewController() {
      let self = this;

      self.tableData = new TableViewData(
        ["Id", "Phone Number", "Device Id", "Status"],
        [
          { Id: 1, Number: "03123456", DeviceId: 1, status: "Reserved" },
          { Id: 2, Number: "03384175", DeviceId: 20, status: "Available" },
          { Id: 3, Number: "03283424", DeviceId: 3, status: "Reserved" },
        ]
      );

      self.title = "Phone Numbers";
    },
  ],
});
