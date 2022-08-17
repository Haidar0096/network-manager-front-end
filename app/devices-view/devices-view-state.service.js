"use strict";

angular.module("devicesView").service("devicesViewState", [
  "devicesApi",
  "$location",
  "$mdDialog",
  "$rootScope",
  function devicesViewState(devicesApi, $location, $mdDialog, $rootScope) {
    let self = this;

    self.initState = function () {
      self.processingState = new ViewProcessingState();
      self.tableData = new TableViewData(["Device Id", "Device Name"], []);
      self.searchText = "";
      self.offset = 0;
      self.count = 5;
      self.devicesCount = 0;
      self.selectedPage = 1;
      self.selectedCount = 10;
      self.fetchLocation();
      self.refreshDevices(self.offset, self.count);
    };

    self.initializeAddDeviceDialogParams = function () {
      self.title = "Add Device";
      self.prompt = "Enter the device name:";
      self.data = null;
      self.placeholder = "Type the device name here...";
      self.confirmMessage = "Confirm";
      self.cancelMessage = "Cancel";
    };

    self.initializeUpdateDeviceDialogParams = function (device) {
      self.title = "Edit Device";
      self.prompt = "Edit the device name:";
      self.data = device.name;
      self.placeholder = "Type the new device name here...";
      self.confirmMessage = "Confirm";
      self.cancelMessage = "Cancel";
    };

    self.refreshDevicesCount = () =>
      self.processingState.process({
        callback: devicesApi.getDevicesCount,
        processingMessage: "Loading Devices",
        errorMessage: "Error loading Devices",
        onDone: function (count) {
          self.devicesCount = count;
        },
      });

    self.fetchLocation = function () {
      self.offset = parseInt($location.search()["offset"]);
      self.count = parseInt($location.search()["count"]);
    };

    self.updateLocation = function () {
      $location.search({ offset: self.offset, count: self.count });
    };

    self.refreshDevices = (offset, count) =>
      self.processingState.process({
        callback: () => devicesApi.getDevicesPaginated(new GetDevicesPaginatedRequest(offset, count)),
        processingMessage: "Loading Devices",
        errorMessage: "Error loading Devices",
        onDone: function (devices) {
          self.tableData.rows = devices;
          self.refreshDevicesCount();
        },
      });

    self.goToPage = function (pageNumber) {
      self.offset = self.count * (pageNumber - 1);
      self.processingState.process({
        callback: () => self.updateLocation(),
        processingMessage: "Loading Devices",
        errorMessage: "Error loading Devices",
        onDone: function () {
          self.refreshDevices(self.offset, self.count);
        },
      });
    };

    self.changeCount = function () {
      self.count = self.selectedCount;
      self.refreshDevices(self.offset, self.count);
      self.updateLocation();
    };

    self.getPagesCount = () => parseInt(self.devicesCount / self.count, 10);

    self.paginateForward = function () {
      self.processingState.process({
        callback: devicesApi.getDevicesCount,
        processingMessage: "Loading Devices",
        errorMessage: "Error loading Devices",
        onDone: function (devicesCount) {
          self.offset += self.count;
          if (self.offset > devicesCount) {
            self.offset -= self.count;
          }
          self.updateLocation();
          self.refreshDevices(self.offset, self.count);
        },
      });
    };

    self.paginateBackward = function () {
      self.offset -= self.count;
      if (self.offset < 0) {
        self.offset = 0;
      }
      self.updateLocation();
      self.processingState.process({
        callback: () => self.refreshDevices(self.offset, self.count),
        processingMessage: "Loading Devices",
        errorMessage: "Error loading Devices",
      });
    };

    self.onSearch = function (searchText) {
      if (searchText !== "") {
        self.processingState.process({
          callback: () => devicesApi.filterDevicesByName(searchText),
          processingMessage: "Loading Devices",
          errorMessage: "Error loading Devices",
          onDone: (devices) => (self.tableData.rows = devices),
        });
      } else {
        self.refreshDevices(self.offset, self.count);
      }
    };

    self.onAdd = function (event) {
      self.initializeAddDeviceDialogParams();
      $mdDialog
        .show({
          controller: "deviceDialogPromptController as $ctrl",
          templateUrl: "common/prompt-dialog/prompt-dialog.template.html",
          parent: angular.element(document.body),
          targetEvent: event,
          clickOutsideToClose: true,
        })
        .then(
          function (deviceName) {
            if (deviceName !== "" && deviceName !== null) {
              let addDeviceRequest = new AddDeviceRequest(deviceName);
              self.processingState.process({
                callback: () => devicesApi.addDevice(addDeviceRequest),
                processingMessage: "Adding Device",
                errorMessage: "Error Adding Device",
                onDone: function (deviceId) {
                  self.refreshDevices(self.offset, self.count);
                },
              });
            }
          },
          function () {
            // on cancel, do nothing
          }
        );
    };

    self.onUpdate = function (event, device) {
      self.initializeUpdateDeviceDialogParams(device);
      $mdDialog
        .show({
          controller: "deviceDialogPromptController as $ctrl",
          templateUrl: "common/prompt-dialog/prompt-dialog.template.html",
          parent: angular.element(document.body),
          targetEvent: event,
          clickOutsideToClose: true,
        })
        .then(
          function (updatedDeviceName) {
            if (updatedDeviceName !== "" && updatedDeviceName !== null) {
              let updateDeviceRequest = new UpdateDeviceRequest(device.id, updatedDeviceName);
              self.processingState.process({
                callback: () => devicesApi.updateDevice(updateDeviceRequest),
                processingMessage: "Updating Device",
                errorMessage: "Error Updating Device",
                onDone: function () {
                  self.refreshDevices(self.offset, self.count);
                },
              });
            }
          },
          function () {
            // on cancel, do nothing
          }
        );
    };

    self.initState();
  },
]);
