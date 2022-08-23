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
} from "./devices-view.slice.js";

angular
  .module("devicesView", ["common"])
  .component("devicesView", {
    templateUrl: "devices-view/devices-view.template.html",
    controller: [
      "$ngRedux",
      "$scope",
      "devicesApi",
      "$mdDialog",
      function DevicesViewController($ngRedux, $scope, devicesApi, $mdDialog) {
        let self = this;

        const mapStateToThis = function (state) {
          const devices = devicesListSelector(state);
          const paginationData = paginationDataSelector(state);
          const pagesCount = pagesCountSelector(state);
          return {
            tableData: new TableViewData(["Device Id", "Device Name"], devices),
            page: paginationData.page,
            countPerPage: paginationData.countPerPage,
            pagesList: Array.from({ length: pagesCount }, (_, i) => i + 1),
            devicesEmpty: devices.length === 0,
            loading: statusSelector(state) === STATUS_LOADING,
            errorMessage: errorMessageSelector(state),
          };
        };

        // todo: implement getDevicesByNamePaginated
        self.getDevicesByNamePaginated = (deviceName) => {
          console.log("getDevicesByNamePaginated called with deviceName: " + deviceName);
        };

        const unsubscribe = $ngRedux.connect(mapStateToThis, {})(self);
        $scope.$on("$destroy", unsubscribe);

        self.paginateTo = async (page) =>
          await $ngRedux.dispatch(
            devicesActions.goToPage({
              devicesApi: devicesApi,
              page: page,
            })
          );

        self.paginateForward = () => self.paginateTo(self.page + 1);

        self.paginateBackward = () => self.paginateTo(self.page - 1);

        self.changeCountPerPage = async (countPerPage) =>
          await $ngRedux.dispatch(
            devicesActions.changeCountPerPage({
              devicesApi: devicesApi,
              countPerPage: countPerPage,
            })
          );

        self.addDevice = async ($event) => {
          let deviceName = await $mdDialog.show({
            templateUrl: "common/prompt-dialog/prompt-dialog.template.html",
            parent: angular.element(document.body),
            targetEvent: $event,
            clickOutsideToClose: true,
            controller: function ($mdDialog, AddUserDialogControllerArgs) {
              return new PromptDialogController($mdDialog, AddUserDialogControllerArgs);
            },
            controllerAs: "$ctrl",
          });
          if (deviceName) {
            await $ngRedux.dispatch(
              devicesActions.addDevice({
                devicesApi: devicesApi,
                deviceName: deviceName,
              })
            );
            await self.paginateTo(self.page); // refresh the data
          }
        };

        // todo implement onRowClick
        self.onRowClick = async ($event, device) => {
          let deviceName = await $mdDialog.show({
            templateUrl: "common/prompt-dialog/prompt-dialog.template.html",
            parent: angular.element(document.body),
            targetEvent: $event,
            clickOutsideToClose: true,
            controller: function ($mdDialog, UpdateUserDialogControllerArgs) {
              return new PromptDialogController($mdDialog, { ...UpdateUserDialogControllerArgs, data: device.name });
            },
            controllerAs: "$ctrl",
          });
          if (deviceName && deviceName !== device.name) {
            await $ngRedux.dispatch(
              devicesActions.updateDevice({
                devicesApi: devicesApi,
                deviceId: device.id,
                deviceName: deviceName,
              })
            );
            await self.paginateTo(self.page); // refresh the data
          }
        };

        self.paginateTo(self.page); // go to page 1 initially
      },
    ],
  })
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
