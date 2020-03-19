/**
 * Created by Samuel Gratzl on 19.11.2015.
 */
// to resolve the jquery extensions
/// <reference types="bootstrap" />
import './_bootstrap';
import * as $ from 'jquery';
import {mixin, randomId} from 'phovea_core/src';
import i18n from 'phovea_core/src/i18n';

export class Dialog {
  protected readonly $dialog: JQuery;
  private bakKeyDownListener: (ev: KeyboardEvent) => any = null; // temporal for restoring an old keydown listener
  static openDialogs: number = 0;

  constructor(title: string, primaryBtnText = 'OK', additionalCSSClasses: string = '') {
    const dialog = document.createElement('div');
    dialog.setAttribute('role', 'dialog');
    dialog.classList.add('modal', 'fade');
    dialog.innerHTML = `
       <div class="modal-dialog ${additionalCSSClasses}" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <button type="button" class="close" data-dismiss="modal" aria-label="${i18n.t('phovea:ui.close')}"><span aria-hidden="true">×</span></button>
            <h4 class="modal-title">${title}</h4>
          </div>
          <div class="modal-body">

          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-default btn-primary submit-dialog">${primaryBtnText}</button>
          </div>
        </div>
      </div>`;
    document.body.appendChild(dialog);
    this.$dialog = $(dialog);
  }

  show() {
    this.bakKeyDownListener = document.onkeydown;
    document.onkeydown = (evt) => {
      evt = evt || <KeyboardEvent>window.event;
      if (evt.keyCode === 27) { // 27 === ESC key
        this.hide();
      }
    };

    ++Dialog.openDialogs;
    return this.$dialog.modal('show');
  }

  hide() {
    document.onkeydown = this.bakKeyDownListener;
    return this.$dialog.modal('hide');
  }

  get body() {
    return <HTMLElement>this.$dialog[0].querySelector('.modal-body');
  }

  get footer() {
    return <HTMLElement>this.$dialog.find('.modal-footer')[0];
  }

  get header() {
    return <HTMLElement>this.$dialog[0].querySelector('.modal-header');
  }


  onHide(callback: () => void) {
    this.$dialog.on('hidden.bs.modal', callback);
  }

  onSubmit(callback: () => any) {
    return this.$dialog.find('.modal-footer > .submit-dialog').on('click', callback);
  }

  hideOnSubmit() {
    this.onSubmit(this.hide.bind(this));
  }

  destroy() {
    if (--Dialog.openDialogs > 0) {
      $('body').addClass('modal-open');
    }
    return this.$dialog.remove();
  }
}

export class FormDialog extends Dialog {
  constructor(title: string, primaryBtnText = 'OK', private readonly formId = 'form' + randomId(5), additionalCSSClasses: string = '') {
    super(title, primaryBtnText, additionalCSSClasses);

    this.body.innerHTML = `<form id="${formId}"></form>`;
    const b = this.footer.querySelector('button');
    b.setAttribute('type', 'submit');
    b.setAttribute('form', formId);
  }

  get form() {
    return this.body.querySelector('form');
  }

  getFormData() {
    return new FormData(this.form);
  }

  onSubmit(callback: () => boolean) {
    return this.$dialog.find('.modal-body > form').on('submit', callback);
  }
}

export function generateDialog(title: string, primaryBtnText = 'OK', additionalCSSClasses: string = '') {
  return new Dialog(title, primaryBtnText, additionalCSSClasses);
}

export function msg(text: string, category = 'info'): Promise<void> {
  return new Promise<void>((resolve) => {
    const div = $(`<div class="alert alert-${category} alert-dismissible fade in" role="alert">
        <button type="button" class="close" data-dismiss="modal" aria-label="${i18n.t('phovea:ui.close')}"><span aria-hidden="true">×</span></button>
        ${text}
    </div>`).appendTo('body');
    div.on('closed.bs.alert', () => resolve);
    div.alert();
  });
}

export interface IDialogOptions {
  title?: string;
  placeholder?: string;
  primaryBtnText?: string;
  additionalCSSClasses?: string;
}

export interface IPromptOptions extends IDialogOptions {
  multiline?: boolean;
}

/**
 * simple prompt dialog
 * @param text
 * @param options
 * @returns {Promise}
 */
export function prompt(text: string, options: IPromptOptions | string = {}): Promise<string> {
  const o: IPromptOptions = {
    title: 'Input',
    placeholder: 'Enter...',
    multiline: false
  };
  if (typeof options === 'string') {
    options = {title: options};
  }
  mixin(o, options);
  return new Promise((resolve) => {
    const dialog = generateDialog(o.title, o.primaryBtnText, o.additionalCSSClasses);
    if (o.multiline) {
      dialog.body.innerHTML = `<form><textarea class="form-control" rows="5" placeholder="${o.placeholder}" autofocus="autofocus">${text}</textarea></form>`;
    } else {
      dialog.body.innerHTML = `<form><input type="text" class="form-control" value="${text}" autofocus="autofocus" placeholder="${o.placeholder}"></form>`;
    }
    // Resolve with content of form
    const submit = () => {
      resolve((<HTMLInputElement>dialog.body.querySelector('input, textarea')).value);
      dialog.hide();
    };
    // Resolve when dialog is submitted (on button click)
    dialog.onSubmit(submit);
    // Resolve when form is submitted
    (<HTMLFormElement>dialog.body.querySelector('form')).onsubmit = () => {
      submit();
      return false;
    };
    dialog.onHide(() => {
      // Resolve with null if dialog is hidden (by clicking the x).
      // This might be the second call to resolve after the actual form resolve, but it will not have any effect.
      resolve(null);
      dialog.destroy();
    });
    dialog.show();
  });
}


export interface IChooseOptions extends IDialogOptions {
  editable?: boolean;
}

/**
 * simple choose dialog
 * @param items
 * @param options
 * @returns {Promise}
 */
export function choose(items: string[], options: IChooseOptions | string = {}): Promise<string> {
  const o: IChooseOptions = {
    title: 'Choose',
    placeholder: 'Enter...',
    editable: false
  };
  if (typeof options === 'string') {
    options = {title: options};
  }
  mixin(o, options);

  return new Promise((resolve) => {
    const dialog = generateDialog(o.title, o.primaryBtnText, o.additionalCSSClasses);
    const option = items.map((d) => `<option value="${d}">${d}</option>`).join('\n');
    if (o.editable) {
      dialog.body.innerHTML = `<form><input type="text" list="chooseList" class="form-control" autofocus="autofocus" placeholder="${o.placeholder}">
        <datalist id="chooseList">${option}</datalist>
      </form>`;
    } else {
      dialog.body.innerHTML = `<form><select class="form-control">${option}</select></form>`;
    }

    (<HTMLFormElement>dialog.body.querySelector('form')).onsubmit = () => {
      dialog.hide();
      return false;
    };
    dialog.hideOnSubmit();
    dialog.onHide(() => {
      if (o.editable) {
        resolve((<HTMLInputElement>dialog.body.querySelector('input')).value);
      } else {
        resolve(items[(<HTMLSelectElement>dialog.body.querySelector('select')).selectedIndex]);
      }
      dialog.destroy();
    });
    dialog.show();
  });
}

export interface IAreYouSureOptions extends Pick<IDialogOptions, 'title' | 'additionalCSSClasses'> {
  button?: string;
  cancelButton?: string;
}

export function areyousure(msg: string = '', options: IAreYouSureOptions | string = {}): Promise<boolean> {
  const o: IAreYouSureOptions = {
    title: i18n.t('phovea:ui.areYouSure'),
    button: `<i class="fa fa-trash" aria-hidden="true"></i>  ${i18n.t('phovea:ui.delete')}`,
    cancelButton:  i18n.t('phovea:ui.cancel')
  };
  if (typeof options === 'string') {
    options = {title: options};
  }
  mixin(o, options);

  return new Promise((resolve) => {
    const dialog = generateDialog(o.title, o.cancelButton, o.additionalCSSClasses);
    dialog.body.innerHTML = msg;
    $(`<button class="btn btn-danger">${o.button}</button>`).appendTo(dialog.footer);
    let clicked = false;
    $(dialog.footer).find('button.btn-primary').on('click', function () {
      dialog.hide();
    });
    $(dialog.footer).find('button.btn-danger').on('click', function () {
      clicked = true;
      dialog.hide();
    });
    dialog.onHide(() => {
      dialog.destroy();
      resolve(clicked);
    });
    dialog.show();
  });
}
