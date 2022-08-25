"use strict";

angular.module("paginatedDataActionsView", []).component("paginatedDataActionsView", {
  templateUrl: "common/paginated-data-actions-view/paginated-data-actions-view.template.html",
  bindings: {
    onSearchPressed: "<",
    searchDisabled: "<",
    onAddPressed: "<",
    addDisabled: "<",
    onPaginateBackwardPressed: "<",
    paginateBackwardDisabled: "<",
    onPaginateForwardPressed: "<",
    paginateForwardDisabled: "<",
    page: "=",
    onPageChanged: "<",
    changePageDisabled: "<",
    pagesList: "<",
    countPerPage: "<",
    onCountPerPageChanged: "<",
    changeCountPerPageDisabled: "<",
    countPerPageList: "<",
    loading: "=",
    searchFieldInputType: "<",
  },
  controller: function () {
    let self = this;
    self.$onInit = function () {
      self.searchFieldInputType = self.searchFieldInputType ?? 'text';
    };
  },
});
