"use strict";
import {
  phoneNumbersActions,
  statusSelector,
  errorMessageSelector,
  STATUS_LOADING,
  paginationDataSelector,
  pagesCountSelector,
  filtersSelector,
  phonesListSelector,
} from "/app/phone-numbers-view/phone-numbers-view.slice.js";
import TableViewData from "/app/common/table-view/table-view-data.model.js";

angular.module("phoneNumbersView", ["common", "ngRedux"]).component("phoneNumbersView", {
  templateUrl: "phone-numbers-view/phone-numbers-view.template.html",
  controller: [
    "$ngRedux",
    "$scope",
    "phoneNumbersApi",
    "$mdDialog",
    "devicesApi",
    function phoneNumbersViewController($ngRedux, $scope, phoneNumbersApi, $mdDialog, devicesApi) {
      let self = this;

      const mapStateToThis = (state) => {
        const phones = phonesListSelector(state).map((phone) => ({
          number: phone.number,
          deviceName: phone.deviceName,
          status: phone.status,
        }));
        const paginationData = paginationDataSelector(state);
        const pagesCount = pagesCountSelector(state);
        const loading = statusSelector(state) === STATUS_LOADING;
        return {
          tableData: new TableViewData(["Phone Number", "Device Name", "Status"], phones),
          page: paginationData.page,
          countPerPage: paginationData.countPerPage,
          totalCount: paginationData.totalCount,
          pagesList: Array.from({ length: pagesCount }, (_, i) => i + 1),
          phonesEmpty: phones.length === 0,
          phoneNumberFilter: filtersSelector(state).phoneNumber,
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
            phoneNumbersActions.goToPage({
              phoneNumbersApi: phoneNumbersApi,
              devicesApi: devicesApi,
              page: page,
            })
          );
        }
      };

      self.onSearchPressed = async (phoneNumber) => {
        await $ngRedux.dispatch(phoneNumbersActions.changePhoneNumberFilter({ phoneNumber }));
        await self.paginateTo(1);
      };

      self.onAddPressed = async ($event) => {
        $ngRedux
          .dispatch(phoneNumbersActions.getDevices({ devicesApi: devicesApi }))
          .unwrap()
          .then(
            async (_) => {
              await $mdDialog
                .show({
                  templateUrl: "/app/phone-numbers-view/add-phone-number-dialog.template.html",
                  parent: angular.element(document.body),
                  targetEvent: $event,
                  clickOutsideToClose: true,
                  controller: "AddPhoneNumberDialogController",
                  controllerAs: "$ctrl",
                })
                .then(
                  async (data) => {
                    $ngRedux
                      .dispatch(
                        phoneNumbersActions.addPhoneNumber({
                          phoneNumbersApi: phoneNumbersApi,
                          phoneNumber: data.phoneNumber,
                          deviceId: data.device.id,
                          status: data.status,
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
        await $ngRedux.dispatch(phoneNumbersActions.changeCountPerPage({ countPerPage }));
        await self.paginateTo(1);
      };

      self.paginateTo(self.page); // go to page set in the state when this view is initialized
    },
  ],
});
