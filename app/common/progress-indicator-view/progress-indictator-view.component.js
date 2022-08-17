angular.module("progressIndicatorView").component("progressIndicatorView", {
  templateUrl:
    "common/progress-indicator-view/progress-indicator-view.template.html",
  bindings: {
    text: "<",
    visible: "<",
  },
});
