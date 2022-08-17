"use strict";

angular.module("clientsView").component("clientsView", {
  templateUrl: "clients-view/clients-view.template.html",
  controller: [
    function ClientsViewController() {
      let self = this;

      self.tableData = new TableViewData(
        ["Client Id", "Client Name"],
        [
          { Id: 1, Name: "Client 1" },
          { Id: 2, Name: "Client 2" },
          { Id: 3, Name: "Client 3" },
        ]
      );

      self.title = "Clients";
    },
  ],
});
