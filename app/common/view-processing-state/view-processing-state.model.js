"use strict";

class ViewProcessingState {
  constructor() {
    this.processing = false;
    this.processingMessage = "";
    this.hasError = false;
    this.errorMessage = "";
  }

  process(params) {
    let self = this;
    self.processing = true;
    self.processingMessage = params.processingMessage;
    self.hasError = false;
    try {
      params.callback()?.then(
        function onDone(data) {
          self.processing = false;
          return params?.onDone?.(data);
        },
        function onError(error) {
          console.log("an error has occurrred: ");
          console.log(error);
          self.processing = false;
          self.hasError = true;
          self.errorMessage = params.errorMessage;
          return params?.onError?.(error);
        }
      );
    } catch (error) {
      console.log("an error has occurrred: " + error);
      console.log(error);
      self.processing = false;
      self.hasError = true;
      self.errorMessage = params.errorMessage;
      return params?.onError?.(error);
    }
  }
}
