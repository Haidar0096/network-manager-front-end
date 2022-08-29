"use strict";
import {
  reservationsActions,
  statusSelector,
  errorMessageSelector,
  STATUS_LOADING,
  paginationDataSelector,
  pagesCountSelector,
  filtersSelector,
  reservationsListSelector,
} from "/app/reservations-view/reservations-view.slice.js";
import TableViewData from "/app/common/table-view/table-view-data.model.js";

angular.module("reservationsView", ["common", "ngRedux"]).component("reservationsView", {
  templateUrl: "reservations-view/reservations-view.template.html",
  controller: [
    "$ngRedux",
    "$scope",
    "phoneNumbersApi",
    "$mdDialog",
    "clientsApi",
    function phoneNumbersViewController($ngRedux, $scope, phoneNumbersApi, $mdDialog, clientsApi) {
      let self = this;

      const mapStateToThis = (state) => {
        const reservations = reservationsListSelector(state).map((reservation) => ({
          clientName: reservation.clientName,
          phoneNumber: reservation.phoneNumber,
          BED: reservation.BED,
          EED: reservation.EED,
        }));
        const paginationData = paginationDataSelector(state);
        const pagesCount = pagesCountSelector(state);
        const loading = statusSelector(state) === STATUS_LOADING;
        return {
          tableData: new TableViewData(["Client Name", "Phone Number", "BED", "EED"], reservations),
          page: paginationData.page,
          countPerPage: paginationData.countPerPage,
          totalCount: paginationData.totalCount,
          pagesList: Array.from({ length: pagesCount }, (_, i) => i + 1),
          reservationsEmpty: reservations.length === 0,
          clientNameFilter: filtersSelector(state).clientName,
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
            reservationsActions.goToPage({
              phoneNumbersApi: phoneNumbersApi,
              clientsApi: clientsApi,
              page: page,
            })
          );
        }
      };

      self.onSearchPressed = async (clientName) => {
        await $ngRedux.dispatch(reservationsActions.changeClientNameFilter({ clientName }));
        await self.paginateTo(1);
      };

      self.onAddPressed = async ($event) => {
        $ngRedux
          .dispatch(reservationsActions.getClients({ clientsApi: clientsApi }))
          .unwrap()
          .then(
            async (_) => {
              $ngRedux
                .dispatch(reservationsActions.getPhoneNumbers({ phoneNumbersApi: phoneNumbersApi }))
                .unwrap()
                .then(async (_) => {
                  await $mdDialog
                    .show({
                      templateUrl: "reservations-view/add-reservation-dialog.template.html",
                      parent: angular.element(document.body),
                      targetEvent: $event,
                      clickOutsideToClose: true,
                      controller: "addReservationDialogController",
                      controllerAs: "$ctrl",
                    })
                    .then(
                      async (data) => {
                        $ngRedux
                          .dispatch(
                            reservationsActions.addReservation({
                              phoneNumbersApi: phoneNumbersApi,
                              phoneNumberId: data.phoneNumberId,
                              clientId: data.clientId,
                              BED: data.BED,
                              EED: data.EED,
                            })
                          )
                          .unwrap()
                          .then(
                            (_) => self.paginateTo(self.page),
                            (_) => {}
                          );
                      },
                      () => {}
                    );
                });
            },
            (_) => {}
          );
      };

      self.onPaginateBackwardPressed = async () => {
        self.paginateTo(self.page - 1);
      };

      self.onPaginateForwardPressed = async () => {
        self.paginateTo(self.page + 1);
      };

      self.onCountPerPageChanged = async (countPerPage) => {
        await $ngRedux.dispatch(reservationsActions.changeCountPerPage({ countPerPage }));
        await self.paginateTo(1);
      };

      self.paginateTo(self.page); // go to page set in the state when this view is initialized
    },
  ],
});
