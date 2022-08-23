"use strict";

/**
 * @param title - the title of the dialog
 * @param prompt - the message of the dialog
 * @param confirmText - the text of the confirm button
 * @param cancelText - the text of the cancel button
 * @param placeholder - the placeholder of the input field
 * @param data - the initial value of the input field
 */
class PromptDialogController {
  constructor($mdDialog, args) {
    this.title = args.title;
    this.prompt = args.prompt ?? "";
    this.confirmText = args.confirmText ?? "Confirm";
    this.cancelText = args.cancelText ?? "Cancel";
    this.placeholder = args.placeholder ?? "";
    this.data = args.data;

    this.hide = function () {
      if (!args.onHide) {
        $mdDialog.hide();
      } else {
        args.onHide($mdDialog, this);
      }
    };

    this.onCancel = function () {
      if (!args.onCancel) {
        $mdDialog.hide();
      } else {
        args.onCancel($mdDialog, this);
      }
    };

    this.onConfirm = function (answer) {
      if (!args.onConfirm) {
        $mdDialog.hide(answer);
      } else {
        args.onConfirm($mdDialog, this);
      }
    };
  }
}

export default PromptDialogController;
