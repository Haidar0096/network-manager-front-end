"use strict";

import {
  clientsListSelector,
  statusSelector,
  errorMessageSelector,
  STATUS_LOADING,
  paginationDataSelector,
  pagesCountSelector,
  filtersSelector,
  clientsActions,
} from "/app/clients-view/clients-view.slice.js";
import TableViewData from "/app/common/table-view/table-view-data.model.js";
import PromptDialogController from "/app/common/prompt-dialog/prompt-dialog.controller.js";

angular
  .module("clientsView", ["common", "ngRedux", "ngMaterial", "clientsApi"])
  .component("clientsView", {
    templateUrl: "clients-view/clients-view.template.html",
    controller: [
      "$ngRedux",
      "$scope",
      "clientsApi",
      "$mdDialog",
      function ClientsViewController($ngRedux, $scope, clientsApi, $mdDialog) {
        let self = this;

        const mapStateToThis = (state) => {
          const clients = clientsListSelector(state);
          const paginationData = paginationDataSelector(state);
          const pagesCount = pagesCountSelector(state);
          const loading = statusSelector(state) === STATUS_LOADING;
          return {
            tableData: new TableViewData(["Client Id", "Client Name"], clients),
            page: paginationData.page,
            countPerPage: paginationData.countPerPage,
            totalCount: paginationData.totalCount,
            pagesList: Array.from({ length: pagesCount }, (_, i) => i + 1),
            clientsEmpty: clients.length === 0,
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
              clientsActions.goToPage({
                clientsApi: clientsApi,
                page: page,
              })
            );
          }
        };

        self.onSearchPressed = async (clientName) => {
          await $ngRedux.dispatch(clientsActions.changeClientNameFilter({ clientName }));
          await self.paginateTo(1);
        };

        self.onAddPressed = async ($event) => {
          await $mdDialog
            .show({
              templateUrl: "/app/common/prompt-dialog/prompt-dialog.template.html",
              parent: angular.element(document.body),
              targetEvent: $event,
              clickOutsideToClose: true,
              controller: function ($mdDialog, AddClientDialogControllerArgs) {
                return new PromptDialogController($mdDialog, AddClientDialogControllerArgs);
              },
              controllerAs: "$ctrl",
            })
            .then(
              async (clientName) => {
                if (clientName !== undefined && clientName !== null) {
                  await $ngRedux
                    .dispatch(
                      clientsActions.addClient({
                        clientsApi: clientsApi,
                        clientName: clientName,
                      })
                    )
                    .unwrap()
                    .then(
                      (_) => self.paginateTo(self.page),
                      (_) => {}
                    );
                }
              },
              () => {}
            );
        };

        self.onPaginateBackwardPressed = async () => {
          self.paginateTo(self.page - 1);
        };

        self.onPaginateForwardPressed = async () => {
          self.paginateTo(self.page + 1);
        };

        self.onCountPerPageChanged = async (countPerPage) => {
          await $ngRedux.dispatch(clientsActions.changeCountPerPage({ countPerPage }));
          await self.paginateTo(1);
        };

        self.paginateTo(self.page); // go to page set in the state when this view is initialized
      },
    ],
  })
  // constant values for the add client dialog
  .value("AddClientDialogControllerArgs", {
    title: "Add Client",
    prompt: "Enter the client name:",
    data: null,
    placeholder: "Type the client name here...",
    onConfirm: function ($mdDialog, dialogController) {
      if (!dialogController.data || dialogController.data === "") {
        dialogController.alertText = "Client name is required";
      } else {
        $mdDialog.hide(dialogController.data);
      }
    },
  });
