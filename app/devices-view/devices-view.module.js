"use strict";

import PromptDialogController from "/app/common/prompt-dialog/prompt-dialog.controller.js";
import {
  devicesActions,
  devicesListSelector,
  statusSelector,
  errorMessageSelector,
  STATUS_LOADING,
  paginationDataSelector,
  pagesCountSelector,
  filtersSelector,
} from "/app/devices-view/devices-view.slice.js";
import TableViewData from "/app/common/table-view/table-view-data.model.js";

angular
  .module("devicesView", ["common", "ngRedux", "ngMaterial"])
  .component("devicesView", {
    templateUrl: "devices-view/devices-view.template.html",
    controller: [
      "$ngRedux",
      "$scope",
      "devicesApi",
      "$mdDialog",
      function DevicesViewController($ngRedux, $scope, devicesApi, $mdDialog) {
        let self = this;

        const mapStateToThis = (state) => {
          const devices = devicesListSelector(state);
          const paginationData = paginationDataSelector(state);
          const pagesCount = pagesCountSelector(state);
          const loading = statusSelector(state) === STATUS_LOADING;
          return {
            tableData: new TableViewData(["Device Id", "Device Name"], devices),
            page: paginationData.page,
            countPerPage: paginationData.countPerPage,
            totalCount: paginationData.totalCount,
            pagesList: Array.from({ length: pagesCount }, (_, i) => i + 1),
            devicesEmpty: devices.length === 0,
            deviceNameFilter: filtersSelector(state).deviceName,
            loading: loading,
            errorMessage: errorMessageSelector(state),
            rowDisabled: (_) => loading,
          };
        };

        const unsubscribe = $ngRedux.connect(mapStateToThis, {})(self);
        $scope.$on("$destroy", unsubscribe);

        self.paginateTo = async (page) => {
          if (page !== undefined && page !== null) {
            await $ngRedux.dispatch(
              devicesActions.goToPage({
                devicesApi: devicesApi,
                page: page,
              })
            );
          }
        };

        self.onSearchPressed = async (deviceName) => {
          await $ngRedux.dispatch(devicesActions.changeDeviceNameFilter({ deviceName }));
          await self.paginateTo(1);
        };

        self.onAddPressed = async ($event) => {
          await $mdDialog
            .show({
              templateUrl: "/app/common/prompt-dialog/prompt-dialog.template.html",
              parent: angular.element(document.body),
              targetEvent: $event,
              clickOutsideToClose: true,
              controller: function ($mdDialog, AddUserDialogControllerArgs) {
                return new PromptDialogController($mdDialog, AddUserDialogControllerArgs);
              },
              controllerAs: "$ctrl",
            })
            .then(
              async (deviceName) => {
                if (deviceName !== undefined && deviceName !== null) {
                  await $ngRedux
                    .dispatch(
                      devicesActions.addDevice({
                        devicesApi: devicesApi,
                        deviceName: deviceName,
                      })
                    )
                    .unwrap()
                    .then(
                      (_) => self.paginateTo(self.page),
                      (_) => {}
                    );
                }
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
          await $ngRedux.dispatch(devicesActions.changeCountPerPage({ countPerPage }));
          await self.paginateTo(1);
        };

        self.onRowClick = async ($event, device) => {
          let updatedDeviceName = await $mdDialog
            .show({
              templateUrl: "common/prompt-dialog/prompt-dialog.template.html",
              parent: angular.element(document.body),
              targetEvent: $event,
              clickOutsideToClose: true,
              controller: function ($mdDialog, UpdateUserDialogControllerArgs) {
                return new PromptDialogController($mdDialog, { ...UpdateUserDialogControllerArgs, data: device.name });
              },
              controllerAs: "$ctrl",
            })
            .then(
              (data) => data,
              () => {}
            );
          if (updatedDeviceName && updatedDeviceName !== device.name) {
            $ngRedux
              .dispatch(
                devicesActions.updateDevice({
                  devicesApi: devicesApi,
                  deviceId: device.id,
                  deviceName: updatedDeviceName,
                })
              )
              .unwrap()
              .then(
                (_) => self.paginateTo(self.page),
                (_) => {}
              );
          }
        };

        self.paginateTo(self.page); // go to page set in the state when this view is initialized
      },
    ],
  })
  // constant values for the add user dialog
  .value("AddUserDialogControllerArgs", {
    title: "Add Device",
    prompt: "Enter the device name:",
    data: null,
    placeholder: "Type the device name here...",
    onConfirm: function ($mdDialog, dialogController) {
      if (!dialogController.data || dialogController.data === "") {
        dialogController.alertText = "Device name is required";
      } else {
        $mdDialog.hide(dialogController.data);
      }
    },
  })
  // constant values for the update user dialog
  .value("UpdateUserDialogControllerArgs", {
    title: "Update Device",
    prompt: "Enter the new device name:",
    data: null,
    placeholder: "Type the device name here...",
    onConfirm: function ($mdDialog, dialogController) {
      if (!dialogController.data || dialogController.data === "") {
        dialogController.alertText = "Device name is required";
      } else {
        $mdDialog.hide(dialogController.data);
      }
    },
  });
