angular.module("devicesApi").service("devicesApi", [
  "$resource",
  function DevicesApiService($resource) {
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
        filterDevicesByName: {
          url: baseUrl + "/filter-by-name:name",
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
        getDevicesPaginated: {
          url: baseUrl + "/paginated?offset=:offset&count=:count",
          method: "GET",
        },
        getDevicesCount: {
          url: baseUrl + "/count",
          method: "GET",
        },
      }
    );

    let httpDevicesMapper = (httpDevices) =>
      httpDevices.map((httpDevice) => new Device({ id: httpDevice.Id, name: httpDevice.Name }));

    self.getAllDevices = () =>
      DevicesResource.getAllDevices().$promise.then((response) => httpDevicesMapper(response.Data));

    self.filterDevicesByName = (name) =>
      DevicesResource.filterDevicesByName({ deviceName: name }).$promise.then((response) =>
        httpDevicesMapper(response.Data)
      );

    self.addDevice = (request) => DevicesResource.addDevice(request).$promise.then((response) => response.Data);

    self.updateDevice = (request) => DevicesResource.updateDevice(request).$promise.then((response) => response.Data);

    self.getDevicesPaginated = (request) =>
      DevicesResource.getDevicesPaginated({
        offset: request.offset,
        count: request.count,
      }).$promise.then((response) => httpDevicesMapper(response.Data));

    self.getDevicesCount = () => DevicesResource.getDevicesCount().$promise.then((response) => response.Data);
  },
]);
