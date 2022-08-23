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
        getDevicesByName: {
          url: baseUrl + "/by-name?name=name&exactMatch=exactMatch",
          method: "GET",
        },
        getDevicesByNamePaginated: {
          url: baseUrl + "/by-name-paginated?name=name&offset=offset&count=count&exactMatch=exactMatch",
          method: "GET",
        },
        getDevicesCount: {
          url: baseUrl + "/count",
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
      }
    );

    const httpDevicesMapper = (httpDevices) =>
      httpDevices.map((httpDevice) => new Device({ id: httpDevice.Id, name: httpDevice.Name }));

    self.getAllDevices = () =>
      DevicesResource.getAllDevices().$promise.then((response) => httpDevicesMapper(response.Data));

    self.getDevicesByName = (name, exactMatch = false) =>
      DevicesResource.getDevicesByName({ name: name, exactMatch: exactMatch }).$promise.then((response) =>
        httpDevicesMapper(response.Data)
      );

    self.getDevicesByNamePaginated = (name, offset, count, exactMatch = false) =>
      DevicesResource.getDevicesByNamePaginated({
        name: name,
        offset: offset,
        count: count,
        exactMatch: exactMatch,
      }).$promise.then((response) => httpDevicesMapper(response.Data));

    self.addDevice = (deviceName) =>
      DevicesResource.addDevice(new AddDeviceRequest(deviceName)).$promise.then((response) => response.Data);

    self.updateDevice = (deviceId, deviceName) =>
      DevicesResource.updateDevice(new UpdateDeviceRequest(deviceId, deviceName)).$promise.then(
        (response) => response.Data
      );

    self.getDevicesPaginated = (offset, count) =>
      DevicesResource.getDevicesPaginated({
        offset: offset,
        count: count,
      }).$promise.then((response) => httpDevicesMapper(response.Data));

    self.getDevicesCount = () => DevicesResource.getDevicesCount().$promise.then((response) => response.Data);
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
