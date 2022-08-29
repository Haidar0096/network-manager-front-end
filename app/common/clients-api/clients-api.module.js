"use strict";

angular.module("clientsApi", ["ngResource"]).service("clientsApi", [
  "$resource",
  function ClientsApi($resource) {
    let self = this;

    let baseUrl = "https://localhost:44382/api/clients";

    let ClientsResource = $resource(
      "",
      {},
      {
        getAllClients: {
          url: baseUrl + "/all",
          method: "GET",
        },
        getClientsPaginated: {
          url: baseUrl + "/paginated?offset=:offset&count=:count",
          method: "GET",
        },
        getClientsByNamePaginated: {
          url: baseUrl + "/by-name-paginated?name=:name&offset=:offset&count=:count",
          method: "GET",
        },
        getClientsCount: {
          url: baseUrl + "/count",
          method: "GET",
        },
        getClientsCountForName: {
          url: baseUrl + "/count-for-name?name=:name&exactMatch=:exactMatch",
          method: "GET",
        },
        addClient: {
          url: baseUrl + "/add",
          method: "POST",
        },
        getClientById: {
          url: baseUrl + "/:id",
          method: "GET",
        },
      }
    );

    const httpClientsMapper = (httpClients) =>
      httpClients.map((httpClient) => new Client({ id: httpClient.Id, name: httpClient.Name }));

    const getResponseDataOrThrow = (response) => {
      if (response.HasError) {
        throw new Error(response.Message);
      } else {
        return response.Data;
      }
    };

    self.getAllClients = () =>
      ClientsResource.getAllClients().$promise.then((response) => httpClientsMapper(getResponseDataOrThrow(response)));

    self.getClientsPaginated = (offset, count) =>
      ClientsResource.getClientsPaginated({
        offset: offset,
        count: count,
      }).$promise.then((response) => httpClientsMapper(getResponseDataOrThrow(response)));

    self.getClientsByNamePaginated = (name, offset, count, exactMatch = false) =>
      ClientsResource.getClientsByNamePaginated({
        name: name,
        offset: offset,
        count: count,
        exactMatch: exactMatch,
      }).$promise.then((response) => httpClientsMapper(getResponseDataOrThrow(response)));

    self.getClientsCount = () =>
      ClientsResource.getClientsCount().$promise.then((response) => getResponseDataOrThrow(response));

    self.getClientsCountForName = (name, exactMatch = false) =>
      ClientsResource.getClientsCountForName({ name: name, exactMatch: exactMatch }).$promise.then((response) =>
        getResponseDataOrThrow(response)
      );

    self.addClient = (name) =>
      ClientsResource.addClient(new AddClientRequest({ name })).$promise.then((response) =>
        getResponseDataOrThrow(response)
      );

    self.getClientById = (id) =>
      ClientsResource.getClientById({ id }).$promise.then((response) => getResponseDataOrThrow(response));
  },
]);

export class Client {
  constructor(params) {
    this.id = params.id;
    this.name = params.name;
  }
}

export class AddClientRequest {
  constructor(params) {
    this.Name = params.name;
  }
}
