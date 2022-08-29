"use strict";

angular.module("phoneNumbersApi", ["ngResource"]).service("phoneNumbersApi", [
  "$resource",
  function PhoneNumbersApi($resource) {
    let self = this;

    let baseUrl = "https://localhost:44382/api/phones";

    let PhoneNumbersResource = $resource(
      "",
      {},
      {
        getAllPhoneNumbers: {
          url: baseUrl + "/all",
          method: "GET",
        },
        getPhoneNumbersPaginated: {
          url: baseUrl + "/paginated?offset=:offset&count=:count",
          method: "GET",
        },
        getPhoneNumbersByPhoneNumberPaginated: {
          url: baseUrl + "/by-phone-number-paginated?number=:number&offset=:offset&count=:count",
          method: "GET",
        },
        getPhoneNumbersCount: {
          url: baseUrl + "/count",
          method: "GET",
        },
        getPhoneNumbersCountForPhoneNumber: {
          url: baseUrl + "/count-for-phone-number?number=:number&exactMatch=:exactMatch",
          method: "GET",
        },
        addPhoneNumber: {
          url: baseUrl + "/add",
          method: "POST",
        },
        getReservationsPaginated: {
          url: baseUrl + "/reservations-paginated?offset=:offset&count=:count",
          method: "GET",
        },
        getReservationsByClientNamePaginated: {
          url:
            baseUrl +
            "/reservations-by-client-name-paginated?name=:clientName&offset=:offset&count=:count&exactMatch=:exactMatch",
          method: "GET",
        },
        addReservation: {
          url: baseUrl + "/add-reservation",
          method: "POST",
        },
        getReservationsCount: {
          url: baseUrl + "/reservations-count",
          method: "GET",
        },
        getReservationsCountForClientName: {
          url: baseUrl + "/reservations-count-for-client-name?name=:clientName&exactMatch=:exactMatch",
          method: "GET",
        },
        getPhoneNumberById: {
          url: baseUrl + "/:id",
          method: "GET",
        },
      }
    );

    const httpPhoneNumbersMapper = (httpPhoneNumbers) =>
      httpPhoneNumbers.map(
        (httpPhoneNumber) =>
          new PhoneNumber({
            id: httpPhoneNumber.Id,
            number: httpPhoneNumber.Number,
            deviceId: httpPhoneNumber.DeviceId,
            status: httpPhoneNumber.Status,
          })
      );

    const httpReservationsMapper = (httpReservations) =>
      httpReservations.map(
        (httpReservation) =>
          new Reservation({
            id: httpReservation.Id,
            phoneNumberId: httpReservation.PhoneNumberId,
            clientId: httpReservation.ClientId,
            BED: httpReservation.BED,
            EED: httpReservation.EED,
          })
      );
    const getResponseDataOrThrow = (response) => {
      if (response.HasError) {
        throw new Error(response.Message);
      } else {
        return response.Data;
      }
    };

    self.getAllPhoneNumbers = () =>
      PhoneNumbersResource.getAllPhoneNumbers().$promise.then((response) =>
        httpPhoneNumbersMapper(getResponseDataOrThrow(response))
      );

    self.getPhoneNumbersPaginated = (offset, count) =>
      PhoneNumbersResource.getPhoneNumbersPaginated({
        offset: offset,
        count: count,
      }).$promise.then((response) => httpPhoneNumbersMapper(getResponseDataOrThrow(response)));

    self.getPhoneNumbersByPhoneNumberPaginated = (number, offset, count, exactMatch = false) =>
      PhoneNumbersResource.getPhoneNumbersByPhoneNumberPaginated({
        number: number,
        offset: offset,
        count: count,
        exactMatch: exactMatch,
      }).$promise.then((response) => httpPhoneNumbersMapper(getResponseDataOrThrow(response)));

    self.getPhoneNumbersCount = () =>
      PhoneNumbersResource.getPhoneNumbersCount().$promise.then((response) => getResponseDataOrThrow(response));

    self.getPhoneNumbersCountForPhoneNumber = (number, exactMatch = false) =>
      PhoneNumbersResource.getPhoneNumbersCountForPhoneNumber({ number: number, exactMatch: exactMatch }).$promise.then(
        (response) => getResponseDataOrThrow(response)
      );

    self.addPhoneNumber = (number, deviceId, status) =>
      PhoneNumbersResource.addPhoneNumber(new AddPhoneNumberRequest({ number, deviceId, status })).$promise.then(
        (response) => getResponseDataOrThrow(response)
      );

    self.getReservationsPaginated = (offset, count) =>
      PhoneNumbersResource.getReservationsPaginated({
        offset: offset,
        count: count,
      }).$promise.then((response) => httpReservationsMapper(getResponseDataOrThrow(response)));

    self.addReservation = (phoneNumberId, clientId, BED, EED) =>
      PhoneNumbersResource.addReservation(
        new AddReservationRequest({ phoneNumberId, clientId, BED, EED })
      ).$promise.then((response) => getResponseDataOrThrow(response));

    self.getReservationsCount = () =>
      PhoneNumbersResource.getReservationsCount().$promise.then((response) => getResponseDataOrThrow(response));

    self.getReservationsCountForClientName = (clientName, exactMatch = false) =>
      PhoneNumbersResource.getReservationsCountForClientName({
        clientName: clientName,
        exactMatch: exactMatch,
      }).$promise.then((response) => getResponseDataOrThrow(response));

    self.getPhoneNumberById = (id) =>
      PhoneNumbersResource.getPhoneNumberById({ id }).$promise.then((response) => getResponseDataOrThrow(response));

    self.getReservationsByClientNamePaginated = (clientName, offset, count, exactMatch = false) =>
      PhoneNumbersResource.getReservationsByClientNamePaginated({
        clientName: clientName,
        offset: offset,
        count: count,
        exactMatch: exactMatch,
      }).$promise.then((response) => httpReservationsMapper(getResponseDataOrThrow(response)));
  },
]);

export class PhoneNumber {
  constructor(params) {
    this.id = params.id;
    this.number = params.number;
    this.deviceId = params.deviceId;
    this.status = params.status;
  }
}

export class Reservation {
  constructor(params) {
    this.id = params.id;
    this.phoneNumberId = params.phoneNumberId;
    this.clientId = params.clientId;
    this.BED = params.BED;
    this.EED = params.EED;
  }
}

export class AddPhoneNumberRequest {
  constructor(params) {
    this.number = params.number;
    this.deviceId = params.deviceId;
    this.status = params.status;
  }
}

export class AddReservationRequest {
  constructor(params) {
    this.phoneNumberId = params.phoneNumberId;
    this.clientId = params.clientId;
    this.BED = params.BED;
    this.EED = params.EED;
  }
}
