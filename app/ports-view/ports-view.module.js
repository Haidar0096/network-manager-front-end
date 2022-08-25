"use strict";

import {
  portsActions,
  portsListSelector,
  statusSelector,
  errorMessageSelector,
  STATUS_LOADING,
  paginationDataSelector,
  pagesCountSelector,
  filtersSelector,
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
        const ports = portsListSelector(state);
        const paginationData = paginationDataSelector(state);
        const pagesCount = pagesCountSelector(state);
        const loading = statusSelector(state) === STATUS_LOADING;
        return {
          tableData: new TableViewData(["Port Id", "Port Number", "Device Id"], ports),
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
        await $ngRedux.dispatch(portsActions.getDeviceIds({ devicesApi: devicesApi }));
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
              await $ngRedux.dispatch(
                portsActions.addPort({ portsApi: portsApi, portNumber: data.portNumber, deviceId: data.deviceId })
              );
              await self.paginateTo(self.page);
            },
            () => {}
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
