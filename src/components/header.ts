/**
 * Created by Samuel Gratzl on 24.11.2014.
 */

import {BaseUtils, I18nextManager} from 'phovea_core';
import '../webpack/_bootstrap';
import {BuildInfo} from './buildInfo';
import {AppMetaDataUtils} from './metaData';


/**
 * header html template declared inline so we can use i18next
 */
const getTemplate = () => {
  return (`<nav class="navbar">
  <div class="navbar-header">
      <button type="button" class="navbar-toggle" data-toggle="collapse" data-target="#headerNavBar">
          <span class="icon-bar"></span>
          <span class="icon-bar"></span>
          <span class="icon-bar"></span>
      </button>
      <a class="navbar-brand" href="#" data-header="appLink"></a>
  </div>
  <div class="collapse navbar-collapse">
      <ul class="nav navbar-nav" data-header="mainMenu">

      </ul>
      <ul class="nav navbar-nav navbar-right" data-header="rightMenu">
          <li class="hidden" data-header="optionsLink">
              <a href="#" data-toggle="modal" data-target="#headerOptionsDialog" title="${I18nextManager.getInstance().i18n.t('phovea:ui.options')}">
                  <i class="fas fa-cog fa-fw" aria-hidden="true"></i>
                  <span class="sr-only">${I18nextManager.getInstance().i18n.t('phovea:ui.openOptionsDialog')}</span>
              </a>
          </li>
          <li class="hidden" data-header="aboutLink">
              <a href="#" data-toggle="modal" data-target="#headerAboutDialog" title="${I18nextManager.getInstance().i18n.t('phovea:ui.about')}">
                  <i class="fas fa-info fa-fw" aria-hidden="true"></i>
                  <span class="sr-only">${I18nextManager.getInstance().i18n.t('phovea:ui.openAboutDialog')}</span>
              </a>
          </li>
          <li class="hidden" data-header="bugLink">
              <a href="#" data-toggle="modal" data-target="#headerReportBugDialog" title="${I18nextManager.getInstance().i18n.t('phovea:ui.reportBug')}">
                  <i class="fas fa-bug fa-fw" aria-hidden="true"></i>
                  <span class="sr-only">${I18nextManager.getInstance().i18n.t('phovea:ui.reportBug')}</span>
              </a>
          </li>
          <li class="hidden" data-header="helpLink">
              <a href="//caleydo.org" target="_blank" title="${I18nextManager.getInstance().i18n.t('phovea:ui.openHelpPage')}">
                  <i class="fas fa-question fa-fw" aria-hidden="true"></i>
                  <span class="sr-only">${I18nextManager.getInstance().i18n.t('phovea:ui.openHelpPage')}</span>
              </a>
          </li>
      </ul>
  </div>
</nav>

<!-- About Dialog -->
<div class="modal fade" id="headerAboutDialog" tabindex="-1" role="dialog">
  <div class="modal-dialog" role="document">
      <div class="modal-content">
          <div class="modal-header">
              <button type="button" class="close" data-dismiss="modal" aria-label="${I18nextManager.getInstance().i18n.t('phovea:ui.close')}">
                  <span aria-hidden="true">&times;</span>
              </button>
              <h4 class="modal-title">${I18nextManager.getInstance().i18n.t('phovea:ui.about')}</h4>
          </div>
          <div class="modal-body" data-header="about">
              <div class="metaData">${I18nextManager.getInstance().i18n.t('phovea:ui.loading')}</div>
              <div class="caleydoInfo">
                  <p class="info">
                  ${I18nextManager.getInstance().i18n.t('phovea:ui.infoPart1')}
                   <strong><a href="http://phovea.caleydo.org/"  target="_blank"> ${I18nextManager.getInstance().i18n.t('phovea:ui.phoveaName')}</a></strong>
                        ${I18nextManager.getInstance().i18n.t('phovea:ui.infoPart2')}
                      <a href="http://phovea.caleydo.org" target="_blank"> ${I18nextManager.getInstance().i18n.t('phovea:ui.infoPart3')}</a>.
                  </p>
              </div>
          </div>
      </div>
  </div>
</div>

<!-- Report A Bug Dialog -->
<div class="modal fade" id="headerReportBugDialog" tabindex="-1" role="dialog">
  <div class="modal-dialog" role="document">
      <div class="modal-content">
          <div class="modal-header">
              <button type="button" class="close" data-dismiss="modal" aria-label=" ${I18nextManager.getInstance().i18n.t('phovea:ui.close')}">
                  <span aria-hidden="true">&times;</span>
              </button>
              <h4 class="modal-title"> ${I18nextManager.getInstance().i18n.t('phovea:ui.reportBug')}</h4>
          </div>
          <div class="modal-body" data-header="bug">
          ${I18nextManager.getInstance().i18n.t('phovea:ui.loading')}
          </div>
      </div>
  </div>
</div>

<!-- Options Dialog -->
<div class="modal fade" id="headerOptionsDialog" tabindex="-1" role="dialog">
  <div class="modal-dialog" role="document">
      <div class="modal-content">
          <div class="modal-header">
              <button type="button" class="close" data-dismiss="modal" aria-label=" ${I18nextManager.getInstance().i18n.t('phovea:ui.close')}">
                  <span aria-hidden="true">&times;</span>
              </button>
              <h4 class="modal-title"> ${I18nextManager.getInstance().i18n.t('phovea:ui.options')}</h4>
          </div>
          <div class="modal-body" data-header="options">
          ${I18nextManager.getInstance().i18n.t('phovea:ui.loading')}
          </div>
      </div>
  </div>
</div>

<div id="headerWaitingOverlay" class="phovea-busy hidden">
</div>
`);
};

// declare the function name of the `cookie-bar` for the TS compiler (see addEUCookieDisclaimer())
declare var setupCookieBar: any;


/**
 * Defines a header link
 */
export interface IHeaderLink {
  /**
   * Text of the link
   */
  name: string;

  /**
   * Action that should be performed on click (instead of href)
   */
  action: (event: MouseEvent) => any;

  /**
   * The href of the link
   */
  href: string;
}

/**
 * Header link extends the header link with a  flag for disabling the logo
 */
export class AppHeaderLink implements IHeaderLink {
  constructor(public name = 'Phovea', public readonly action = (event: MouseEvent) => false, public readonly href: string = '#', public addLogo: boolean = true) {
  }
}

/**
 * Helper function to create a list item for the header menus
 * @param name
 * @param action
 * @param href
 * @returns {HTMLElement}
 */
function createLi(name: string, action: (event: MouseEvent) => any, href: string = '#') {
  const li = <HTMLElement>document.createElement('li');
  li.innerHTML = `<a href="${href}">${name}</a>`;
  if (action) {
    (<HTMLElement>li.querySelector('a')).onclick = action;
  }
  return li;
}

export interface IAppHeaderOptions {
  /**
   * insert as first-child or append as child node to the given parent node
   * default: true
   */
  prepend?: boolean;

  /**
   * color scheme: bright (= false) or dark (= true)
   * default: false
   */
  inverse?: boolean;

  /**
   * the app link with the app name
   */
  appLink?: AppHeaderLink;

  /**
   * a list of links that should be shown in the main menu
   */
  mainMenu?: IHeaderLink[];

  /**
   * a list of links that should be shown in the right menu
   */
  rightMenu?: IHeaderLink[];

  showAboutLink?: boolean | ((title: HTMLElement, content: HTMLElement) => void);

  /**
   * show/hide the options link
   * default: false
   */
  showOptionsLink?: boolean | ((title: HTMLElement, content: HTMLElement) => void);

  /**
   * show/hide the bug report link
   * default: true
   */
  showReportBugLink?: boolean | ((title: HTMLElement, content: HTMLElement) => void);

  /**
   * show/hide the EU cookie disclaimer bar from `cookie-bar.eu`
   */
  showCookieDisclaimer?: boolean;

  /**
   * show help link true or the url to link
   * default: false
   */
  showHelpLink?: boolean | string;
}

/**
 * The Caleydo App Header provides an app name and customizable menus
 */
export class AppHeader {

  /**
   * Default options that can be overridden in the constructor
   * @private
   */
  private options: IAppHeaderOptions = {
    /**
     * insert as first-child or append as child node to the given parent node
     */
    prepend: true,

    /**
     * color scheme: bright (= false) or dark (= true)
     */
    inverse: false,

    /**
     * @DEPRECATED use `appLink.name` instead
     */
    //app: 'Caleydo Web',

    /**
     * @DEPRECATED use `appLink.addLogo` instead
     */
    //addLogo: true,

    /**
     * the app link with the app name
     */
    appLink: new AppHeaderLink(),

    /**
     * a list of links that should be shown in the main menu
     */
    mainMenu: <IHeaderLink[]>[],

    /**
     * a list of links that should be shown in the right menu
     */
    rightMenu: <IHeaderLink[]>[],

    /**
     * show/hide the options link
     */
    showOptionsLink: false,

    /**
     * show/hide the bug report link
     */
    showReportBugLink: true,

    /**
     * show/hide the EU cookie disclaimer bar from `cookie-bar.eu`
     */
    showCookieDisclaimer: false,

    /**
     * show help link
     */
    showHelpLink: false
  };

  /**
   * Main menu is positioned next to the app name
   */
  mainMenu: HTMLElement;

  /**
   * Right menu is positioned to the right of the document
   */
  rightMenu: HTMLElement;

  /**
   * About dialog
   */
  aboutDialog: HTMLElement;

  /**
   * Options dialog
   */
  optionsDialog: HTMLElement;

  /**
   * Constructor overrides the default options with the given options
   * @param parent
   * @param options
   */
  constructor(private parent: HTMLElement, options: IAppHeaderOptions = {}) {
    BaseUtils.mixin(this.options, options);
    this.addEUCookieDisclaimer();
    this.build();
  }

  private addEUCookieDisclaimer() {
    if (!this.options.showCookieDisclaimer) {
      return;
    }

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.src = 'https://cdn.jsdelivr.net/npm/cookie-bar/cookiebar-latest.min.js?theme=flying';
    script.onload = () => {
      setupCookieBar();
    };
    this.parent.ownerDocument.body.appendChild(script);
  }

  private async build() {
    // legacy support
    if ((<any>this.options).app !== undefined && this.options.appLink === undefined) {
      this.options.appLink.name = (<any>this.options).app;
    }
    if ((<any>this.options).addLogo !== undefined && !this.options.appLink === undefined) {
      this.options.appLink.addLogo = (<any>this.options).addLogo;
    }

    // create the content and copy it in the parent
    const helper = document.createElement('div');
    helper.innerHTML = getTemplate();
    while (helper.lastChild) {
      this.parent.insertBefore(helper.lastChild, this.parent.firstChild);
    }

    // use the inverse color scheme
    if (this.options.inverse) {
      (<HTMLElement>this.parent.querySelector('nav.navbar')).classList.add('navbar-inverse');
    }

    // modify app header link
    const appLink = (<HTMLElement>this.parent.querySelector('*[data-header="appLink"]'));

    appLink.innerHTML = this.options.appLink.name;
    appLink.onclick = this.options.appLink.action;
    appLink.setAttribute('href', this.options.appLink.href);

    if (this.options.appLink.addLogo) {
      appLink.classList.add('caleydo_app');
    }

    this.mainMenu = <HTMLElement>this.parent.querySelector('*[data-header="mainMenu"]');
    this.rightMenu = <HTMLElement>this.parent.querySelector('*[data-header="rightMenu"]');
    this.aboutDialog = <HTMLElement>this.parent.querySelector('*[data-header="about"]');
    this.optionsDialog = <HTMLElement>this.parent.querySelector('*[data-header="options"]');

    // show/hide links
    this.toggleOptionsLink(this.options.showOptionsLink !== false, typeof this.options.showOptionsLink === 'function' ? this.options.showOptionsLink : null);
    this.toggleAboutLink(this.options.showAboutLink !== false, typeof this.options.showAboutLink === 'function' ? this.options.showAboutLink : null);
    this.toggleReportBugLink(this.options.showReportBugLink !== false, typeof this.options.showReportBugLink === 'function' ? this.options.showReportBugLink : null);
    this.toggleHelpLink(this.options.showHelpLink !== false, typeof this.options.showHelpLink === 'string' ? this.options.showHelpLink : null);

    this.options.mainMenu.forEach((l) => this.addMainMenu(l.name, l.action, l.href));
    this.options.rightMenu.forEach((l) => this.addRightMenu(l.name, l.action, l.href));
  }

  addMainMenu(name: string, action: (event: MouseEvent) => any, href = '#') {
    const li = createLi(name, action, href);
    this.mainMenu.appendChild(li);
    return li;
  }

  addRightMenu(name: string, action: (event: MouseEvent) => any, href = '#') {
    const li = createLi(name, action, href);
    this.rightMenu.insertBefore(li, this.rightMenu.firstChild);
    return li;
  }

  insertCustomMenu(element: Element) {
    this.rightMenu.parentElement.insertBefore(element, this.rightMenu);
  }

  insertCustomRightMenu(element: Element) {
    this.rightMenu.parentElement.appendChild(element);
  }

  wait() {
    AppHeader.setVisibility(<HTMLElement>document.querySelector('#headerWaitingOverlay'), true);
  }

  ready() {
    AppHeader.setVisibility(<HTMLElement>document.querySelector('#headerWaitingOverlay'), false);
  }

  private static setVisibility(element: HTMLElement, isVisible: boolean) {
    element.classList.toggle('hidden', !isVisible);
  }

  toggleOptionsLink(isVisible: boolean, contentGenerator?: (title: HTMLElement, content: HTMLElement) => void) {
    const link = <HTMLElement>this.parent.querySelector('*[data-header="optionsLink"]');
    AppHeader.setVisibility(link, isVisible);

    // set the URL to GitHub issues dynamically
    if (isVisible) {
      contentGenerator = contentGenerator || defaultOptionsInfo;
      import('jquery').then((jquery) => {
        $('#headerOptionsDialog').one('show.bs.modal', () => {
          const content = <HTMLElement>this.parent.querySelector('*[data-header="options"]');
          const title = <HTMLElement>this.parent.querySelector('#headerOptionsDialog .modal-title');
          content.innerHTML = 'Loading...';
          contentGenerator(title, content);
        });
      });
    }
  }

  toggleHelpLink(isVisible: boolean, helpUrl?: string) {
    const link = <HTMLElement>this.parent.querySelector('*[data-header="helpLink"]');
    AppHeader.setVisibility(link, isVisible);

    if (isVisible && helpUrl) {
      link.querySelector('a')!.href = helpUrl;
    }
  }

  toggleReportBugLink(isVisible: boolean, contentGenerator?: (title: HTMLElement, content: HTMLElement) => void) {
    const link = <HTMLElement>this.parent.querySelector('*[data-header="bugLink"]');
    AppHeader.setVisibility(link, isVisible);

    // set the URL to GitHub issues dynamically
    if (isVisible) {
      contentGenerator = contentGenerator || defaultBuildInfo;
      import('jquery').then((jquery) => {
        $('#headerReportBugDialog').one('show.bs.modal', () => {
          const content = <HTMLElement>this.parent.querySelector('*[data-header="bug"]');
          const title = <HTMLElement>this.parent.querySelector('#headerReportBugDialog .modal-title');
          content.innerHTML = 'Loading...';
          contentGenerator(title, content);
        });
      });
    }
  }

  private toggleAboutLink(isVisible: boolean, contentGenerator?: (title: HTMLElement, content: HTMLElement) => void) {
    const link = <HTMLElement>this.parent.querySelector('*[data-header="aboutLink"]');
    AppHeader.setVisibility(link, isVisible);
    if (isVisible) {
      contentGenerator = contentGenerator || defaultAboutInfo;
      const modifyDialogOnce = () => {
        // request last deployment data
        const content = <HTMLElement>this.aboutDialog;
        const title = <HTMLElement>this.aboutDialog.parentElement.querySelector('.modal-title');

        contentGenerator(title, content);
        // remove event listener to prevent another DOM modification
        link.removeEventListener('click', modifyDialogOnce);
      };
      link.addEventListener('click', modifyDialogOnce);
    }
  }

  hideDialog(selector: string) {
    import('jquery').then((jquery) => {
      $(selector).modal('hide');
    });
  }

  showAndFocusOn(selector: string, focusSelector: string) {
    import('jquery').then((jquery) => {
      const $selector = $(selector);
      $selector.modal('show')
        .on('shown.bs.modal', function () {
          $(focusSelector, $selector).focus();
        });
    });
  }

  static create(parent: HTMLElement, options: IAppHeaderOptions = {}) {
    return new AppHeader(parent, options);
  }
}



function defaultBuildInfo(_title: HTMLElement, content: HTMLElement) {
  BuildInfo.build().then((buildInfo) => {
    content.innerHTML = buildInfo.toHTML();
  }).catch((error) => {
    content.innerHTML = error.toString();
  });
}

function defaultAboutInfo(title: HTMLElement, content: HTMLElement) {
  content = <HTMLElement>content.querySelector('.metaData');
  AppMetaDataUtils.getMetaData().then((metaData) => {
    title.innerHTML = (metaData.displayName || metaData.name).replace('_', ' ');
    let contentTpl = `<p class="description">${metaData.description}</p>`;
    if (metaData.homepage) {
      contentTpl += `<p class="homepage"><strong>${I18nextManager.getInstance().i18n.t('phovea:ui.homepage')}</strong>: <a href="${metaData.homepage}" target="_blank" rel="noopener">${metaData.homepage}</a></p>`;
    }
    contentTpl += `<p class="version"><strong>${I18nextManager.getInstance().i18n.t('phovea:ui.version')}</strong>: ${metaData.version}</p>`;
    if (metaData.screenshot) {
      contentTpl += `<img src="${metaData.screenshot}" class="center-block img-responsive img-thumbnail"/>`;
    }
    content.innerHTML = contentTpl;
  });
}

function defaultOptionsInfo(_title: HTMLElement, content: HTMLElement) {
  content.innerHTML = I18nextManager.getInstance().i18n.t('phovea:ui.noOptionsAvailable');
}
