"use strict";

import {
  portsActions,
  statusSelector,
  errorMessageSelector,
  STATUS_LOADING,
  paginationDataSelector,
  pagesCountSelector,
  filtersSelector,
  portsListSelector,
} from "/app/ports-view/ports-view.slice.js";
import TableViewData from "/app/common/table-view/table-view-data.model.js";

angular.module("portsView", ["common", "ngRedux", "ngMaterial"]).component("portsView", {
  templateUrl: "ports-view/ports-view.template.html",
  controller: [
    "$ngRedux",
    "$scope",
    "portsApi",
    "$mdDialog",
    "devicesApi",
    function PortsViewController($ngRedux, $scope, portsApi, $mdDialog, devicesApi) {
      let self = this;

      const mapStateToThis = (state) => {
        const ports = portsListSelector(state).map((port) => ({ number: port.number, deviceName: port.deviceName }));
        const paginationData = paginationDataSelector(state);
        const pagesCount = pagesCountSelector(state);
        const loading = statusSelector(state) === STATUS_LOADING;
        return {
          tableData: new TableViewData(["Port Number", "Device Name"], ports),
          page: paginationData.page,
          countPerPage: paginationData.countPerPage,
          totalCount: paginationData.totalCount,
          pagesList: Array.from({ length: pagesCount }, (_, i) => i + 1),
          portsEmpty: ports.length === 0,
          portNumberFilter: filtersSelector(state).portNumber,
          loading: loading,
          errorMessage: errorMessageSelector(state),
          rowDisabled: (_) => true,
        };
      };

      const unsubscribe = $ngRedux.connect(mapStateToThis, {})(self);
      $scope.$on("$destroy", unsubscribe);

      self.paginateTo = async (page) => {
        if (page !== undefined && page !== null) {
          await $ngRedux.dispatch(
            portsActions.goToPage({
              portsApi: portsApi,
              devicesApi: devicesApi,
              page: page,
            })
          );
        }
      };

      self.onSearchPressed = async (portNumber) => {
        await $ngRedux.dispatch(portsActions.changePortNumberFilter({ portNumber }));
        await self.paginateTo(1);
      };

      self.onAddPressed = async ($event) => {
        $ngRedux
          .dispatch(portsActions.getDevices({ devicesApi: devicesApi }))
          .unwrap()
          .then(
            async (_) => {
              await $mdDialog
                .show({
                  templateUrl: "/app/ports-view/add-port-dialog.template.html",
                  parent: angular.element(document.body),
                  targetEvent: $event,
                  clickOutsideToClose: true,
                  controller: "AddPortDialogController",
                  controllerAs: "$ctrl",
                })
                .then(
                  async (data) => {
                    $ngRedux
                      .dispatch(
                        portsActions.addPort({
                          portsApi: portsApi,
                          portNumber: data.portNumber,
                          deviceId: data.device.id,
                        })
                      )
                      .unwrap()
                      .then(
                        (_) => self.paginateTo(self.page),
                        (_) => {}
                      );
                  },
                  () => {}
                );
            },
            (_) => {}
          );
      };

      self.onPaginateBackwardPressed = async () => {
        self.paginateTo(self.page - 1);
      };

      self.onPaginateForwardPressed = async () => {
        self.paginateTo(self.page + 1);
      };

      self.onCountPerPageChanged = async (countPerPage) => {
        await $ngRedux.dispatch(portsActions.changeCountPerPage({ countPerPage }));
        await self.paginateTo(1);
      };

      self.paginateTo(self.page); // go to page set in the state when this view is initialized
    },
  ],
});
