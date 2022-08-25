"use strict";

angular.module("portsApi", ["ngResource"]).service("portsApi", [
  "$resource",
  function PortsApi($resource) {
    let self = this;

    let baseUrl = "https://localhost:44382/api/ports";

    let PortsResource = $resource(
      "",
      {},
      {
        getPortsPaginated: {
          url: baseUrl + "/paginated?offset=:offset&count=:count",
          method: "GET",
        },
        getPortsByPortNumberPaginated: {
          url: baseUrl + "/by-port-number-paginated?portNumber=:number&offset=:offset&count=:count",
          method: "GET",
        },
        getPortsCount: {
          url: baseUrl + "/count",
          method: "GET",
        },
        getPortsCountForPortNumber: {
          url: baseUrl + "/count-for-port-number?portNumber=:number&exactMatch=:exactMatch",
          method: "GET",
        },
        addPort: {
          url: baseUrl + "/add",
          method: "POST",
        },
      }
    );

    const httpPortsMapper = (httpPorts) =>
      httpPorts.map((httpPort) => new Port({ id: httpPort.Id, number: httpPort.Number, deviceId: httpPort.DeviceId }));

    const getResponseDataOrThrow = (response) => {
      if (response.HasError) {
        throw new Error(response.Message);
      } else {
        return response.Data;
      }
    };

    self.getPortsPaginated = (offset, count) =>
      PortsResource.getPortsPaginated({
        offset: offset,
        count: count,
      }).$promise.then((response) => httpPortsMapper(getResponseDataOrThrow(response)));

    self.getPortsByPortNumberPaginated = (number, offset, count, exactMatch = false) =>
      PortsResource.getPortsByPortNumberPaginated({
        number: number,
        offset: offset,
        count: count,
        exactMatch: exactMatch,
      }).$promise.then((response) => httpPortsMapper(getResponseDataOrThrow(response)));

    self.getPortsCount = () =>
      PortsResource.getPortsCount().$promise.then((response) => getResponseDataOrThrow(response));

    self.getPortsCountForPortNumber = (number, exactMatch = false) =>
      PortsResource.getPortsCountForPortNumber({ number: number, exactMatch: exactMatch }).$promise.then(
        (response) => getResponseDataOrThrow(response)
      );

    self.addPort = (number, deviceId) =>
      PortsResource.addPort(new AddPortRequest({ number, deviceId })).$promise.then((response) =>
        getResponseDataOrThrow(response)
      );
  },
]);

export class Port {
  constructor(params) {
    this.id = params.id;
    this.number = params.number;
    this.deviceId = params.deviceId;
  }
}

export class AddPortRequest {
  constructor(params) {
    this.number = params.number;
    this.deviceId = params.deviceId;
  }
}
