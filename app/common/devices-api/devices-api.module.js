"use strict";

angular.module("devicesApi", ["ngResource"]).service("devicesApi", [
  "$resource",
  function DevicesApi($resource) {
    let self = this;

    let baseUrl = "https://localhost:44382/api/devices";

    let DevicesResource = $resource(
      "",
      {},
      {
        getAllDevices: {
          url: baseUrl + "/all",
          method: "GET",
        },
        getDevicesPaginated: {
          url: baseUrl + "/paginated?offset=:offset&count=:count",
          method: "GET",
        },
        getDevicesByNamePaginated: {
          url: baseUrl + "/by-name-paginated?deviceName=:name&offset=:offset&count=:count&exactMatch=:exactMatch",
          method: "GET",
        },
        getDevicesCount: {
          url: baseUrl + "/count",
          method: "GET",
        },
        getDevicesCountForName: {
          url: baseUrl + "/count-for-name?deviceName=:name&exactMatch=:exactMatch",
          method: "GET",
        },
        getDeviceById:{
          url: baseUrl + "/device/:id",
          method: "GET",
        },
        addDevice: {
          url: baseUrl + "/add",
          method: "POST",
        },
        updateDevice: {
          url: baseUrl + "/update",
          method: "POST",
        },
        getDeviceIds: {
          url: baseUrl + "/ids",
          method: "GET",
        },
      }
    );

    const httpDevicesMapper = (httpDevices) =>
      httpDevices.map((httpDevice) => new Device({ id: httpDevice.Id, name: httpDevice.Name }));

    const getResponseDataOrThrow = (response) => {
      if (response.HasError) {
        throw new Error(response.Message);
      } else {
        return response.Data;
      }
    };

    self.getAllDevices = () =>
      DevicesResource.getAllDevices().$promise.then((response) => httpDevicesMapper(getResponseDataOrThrow(response)));

    self.getDevicesPaginated = (offset, count) =>
      DevicesResource.getDevicesPaginated({
        offset: offset,
        count: count,
      }).$promise.then((response) => httpDevicesMapper(getResponseDataOrThrow(response)));

    self.getDevicesByNamePaginated = (name, offset, count, exactMatch = false) =>
      DevicesResource.getDevicesByNamePaginated({
        name: name,
        offset: offset,
        count: count,
        exactMatch: exactMatch,
      }).$promise.then((response) => httpDevicesMapper(getResponseDataOrThrow(response)));

    self.getDevicesCount = () =>
      DevicesResource.getDevicesCount().$promise.then((response) => getResponseDataOrThrow(response));

    self.getDevicesCountForName = (name, exactMatch = false) =>
      DevicesResource.getDevicesCountForName({ name, exactMatch }).$promise.then((response) =>
        getResponseDataOrThrow(response)
      );

    self.getDeviceById = (id) =>
      DevicesResource.getDeviceById({ id }).$promise.then((response) => getResponseDataOrThrow(response));

    self.addDevice = (deviceName) =>
      DevicesResource.addDevice(new AddDeviceRequest(deviceName)).$promise.then((response) =>
        getResponseDataOrThrow(response)
      );

    self.updateDevice = (deviceId, deviceName) =>
      DevicesResource.updateDevice(new UpdateDeviceRequest(deviceId, deviceName)).$promise.then((response) =>
        getResponseDataOrThrow(response)
      );

    self.getDeviceIds = () =>
      DevicesResource.getDeviceIds().$promise.then((response) => getResponseDataOrThrow(response));
  },
]);

export class Device {
  constructor(params) {
    this.id = params.id;
    this.name = params.name;
  }
}

export class AddDeviceRequest {
  constructor(deviceName) {
    this.Name = deviceName;
  }
}

export class UpdateDeviceRequest {
  constructor(deviceId, deviceName) {
    this.Id = deviceId;
    this.Name = deviceName;
  }
}
