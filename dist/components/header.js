/**
 * Created by Samuel Gratzl on 24.11.2014.
 */
import * as caleydoLogo from '../assets/caleydo_c.svg';
import { BaseUtils, I18nextManager } from 'phovea_core';
import '../webpack/_bootstrap';
import { BuildInfo } from './buildInfo';
import { AppMetaDataUtils } from './metaData';
import { Dialog } from './dialogs';
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
              <a href="#" data-toggle="modal" title="${I18nextManager.getInstance().i18n.t('phovea:ui.options')}">
                  <i class="fas fa-cog fa-fw" aria-hidden="true"></i>
                  <span class="sr-only">${I18nextManager.getInstance().i18n.t('phovea:ui.openOptionsDialog')}</span>
              </a>
          </li>
          <li class="hidden" data-header="aboutLink">
              <a href="#" title="${I18nextManager.getInstance().i18n.t('phovea:ui.about')}">
                  <i class="fas fa-info fa-fw" aria-hidden="true"></i>
                  <span class="sr-only">${I18nextManager.getInstance().i18n.t('phovea:ui.openAboutDialog')}</span>
              </a>
          </li>
          <li class="hidden" data-header="bugLink">
              <a href="#" data-toggle="modal" title="${I18nextManager.getInstance().i18n.t('phovea:ui.reportBug')}">
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

<div id="headerWaitingOverlay" class="phovea-busy hidden"></div>
`);
};
/**
 * Header link extends the header link with a  flag for disabling the logo
 */
export class AppHeaderLink {
    constructor(name = 'Phovea', action = (event) => false, href = '#', addLogo = true) {
        this.name = name;
        this.action = action;
        this.href = href;
        this.addLogo = addLogo;
    }
}
/**
 * Helper function to create a list item for the header menus
 * @param name
 * @param action
 * @param href
 * @returns {HTMLElement}
 */
function createLi(name, action, href = '#') {
    const li = document.createElement('li');
    li.innerHTML = `<a href="${href}">${name}</a>`;
    if (action) {
        li.querySelector('a').onclick = action;
    }
    return li;
}
/**
 * The Caleydo App Header provides an app name and customizable menus
 */
export class AppHeader {
    /**
     * Constructor overrides the default options with the given options
     * @param parent
     * @param options
     */
    constructor(parent, options = {}) {
        this.parent = parent;
        /**
         * Default options that can be overridden in the constructor
         * @private
         */
        this.options = {
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
            mainMenu: [],
            /**
             * a list of links that should be shown in the right menu
             */
            rightMenu: [],
            /**
             * show/hide the options link
             */
            showAboutLink: true,
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
        BaseUtils.mixin(this.options, options);
        this.addEUCookieDisclaimer();
        this.build();
    }
    addEUCookieDisclaimer() {
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
    async build() {
        // legacy support
        if (this.options.app !== undefined && this.options.appLink === undefined) {
            this.options.appLink.name = this.options.app;
        }
        if (this.options.addLogo !== undefined && !this.options.appLink === undefined) {
            this.options.appLink.addLogo = this.options.addLogo;
        }
        // create the content and copy it in the parent
        const helper = document.createElement('div');
        helper.innerHTML = getTemplate();
        while (helper.lastChild) {
            this.parent.insertBefore(helper.lastChild, this.parent.firstChild);
        }
        // use the inverse color scheme
        if (this.options.inverse) {
            this.parent.querySelector('nav.navbar').classList.add('navbar-inverse');
        }
        // modify app header link
        const appLink = this.parent.querySelector('*[data-header="appLink"]');
        appLink.innerHTML = this.options.appLink.name;
        appLink.onclick = this.options.appLink.action;
        appLink.setAttribute('href', this.options.appLink.href);
        if (this.options.appLink.addLogo) {
            appLink.classList.add('caleydo_app');
        }
        this.mainMenu = this.parent.querySelector('*[data-header="mainMenu"]');
        this.rightMenu = this.parent.querySelector('*[data-header="rightMenu"]');
        // show/hide links
        this.toggleOptionsLink(this.options.showOptionsLink);
        this.toggleAboutLink(this.options.showAboutLink);
        this.toggleReportBugLink(this.options.showReportBugLink);
        this.toggleHelpLink(this.options.showHelpLink);
        this.options.mainMenu.forEach((l) => this.addMainMenu(l.name, l.action, l.href));
        this.options.rightMenu.forEach((l) => this.addRightMenu(l.name, l.action, l.href));
    }
    addMainMenu(name, action, href = '#') {
        const li = createLi(name, action, href);
        this.mainMenu.appendChild(li);
        return li;
    }
    addRightMenu(name, action, href = '#') {
        const li = createLi(name, action, href);
        this.rightMenu.insertBefore(li, this.rightMenu.firstChild);
        return li;
    }
    insertCustomMenu(element) {
        this.rightMenu.parentElement.insertBefore(element, this.rightMenu);
    }
    insertCustomRightMenu(element) {
        this.rightMenu.parentElement.appendChild(element);
    }
    wait() {
        AppHeader.setVisibility(document.querySelector('#headerWaitingOverlay'), true);
    }
    ready() {
        AppHeader.setVisibility(document.querySelector('#headerWaitingOverlay'), false);
    }
    static setVisibility(element, isVisible) {
        element.classList.toggle('hidden', !isVisible);
    }
    openModalDialog({ link, contentGenerator, title, cssClass }) {
        link.addEventListener('click', (evt) => {
            // stop event from jQuery/Bootstrap propagation
            evt.preventDefault();
            evt.stopPropagation();
            const dialog = Dialog.generateDialog(title, I18nextManager.getInstance().i18n.t('phovea:ui.close'), cssClass);
            contentGenerator(dialog.header.querySelector('.modal-title'), dialog.body);
            dialog.show();
            return false;
        });
    }
    toggleOptionsLink(link) {
        const isVisible = !!link; // cast to boolean
        const listItem = this.parent.querySelector('[data-header="optionsLink"]');
        AppHeader.setVisibility(listItem, isVisible);
        // set the URL to GitHub issues dynamically
        if (isVisible) {
            this.openModalDialog({
                link: listItem.querySelector('a'),
                title: I18nextManager.getInstance().i18n.t('phovea:ui.options'),
                contentGenerator: (typeof link === 'function') ? link : defaultOptionsInfo,
                cssClass: 'header-options-dialog'
            });
        }
    }
    toggleHelpLink(link) {
        const isVisible = !!link; // cast to boolean
        const listItem = this.parent.querySelector('[data-header="helpLink"]');
        AppHeader.setVisibility(listItem, isVisible);
        if (isVisible && typeof link === 'string') {
            listItem.querySelector('a').href = link;
        }
    }
    toggleReportBugLink(link) {
        const isVisible = !!link; // cast to boolean
        const listItem = this.parent.querySelector('[data-header="bugLink"]');
        AppHeader.setVisibility(listItem, isVisible);
        // set the URL to GitHub issues dynamically
        if (isVisible) {
            this.openModalDialog({
                link: listItem.querySelector('a'),
                title: I18nextManager.getInstance().i18n.t('phovea:ui.reportBug'),
                contentGenerator: (typeof link === 'function') ? link : defaultBuildInfo,
                cssClass: 'header-report-bug-dialog'
            });
        }
    }
    toggleAboutLink(link) {
        const isVisible = !!link; // cast to boolean
        const listItem = this.parent.querySelector('[data-header="aboutLink"]');
        AppHeader.setVisibility(listItem, isVisible);
        if (isVisible) {
            this.openModalDialog({
                link: listItem.querySelector('a'),
                title: I18nextManager.getInstance().i18n.t('phovea:ui.about'),
                contentGenerator: (typeof link === 'function') ? link : defaultAboutInfo,
                cssClass: 'header-about-dialog'
            });
        }
    }
    hideDialog(selector) {
        import('jquery').then((jquery) => {
            $(selector).modal('hide');
        });
    }
    showAndFocusOn(selector, focusSelector) {
        import('jquery').then((jquery) => {
            const $selector = $(selector);
            $selector.modal('show')
                .on('shown.bs.modal', function () {
                $(focusSelector, $selector).focus();
            });
        });
    }
    static create(parent, options = {}) {
        return new AppHeader(parent, options);
    }
}
function defaultBuildInfo(_title, content) {
    content.innerHTML = I18nextManager.getInstance().i18n.t('phovea:ui.loading');
    BuildInfo.build().then((buildInfo) => {
        content.innerHTML = buildInfo.toHTML();
    }).catch((error) => {
        content.innerHTML = error.toString();
    });
}
function defaultAboutInfo(title, content) {
    content.innerHTML = `<div class="metaData">${I18nextManager.getInstance().i18n.t('phovea:ui.loading')}</div>
  <div class="caleydoInfo">
      <a class="logo" href="https://phovea.caleydo.org" target="_blank"><img src="${caleydoLogo}"></a>
      <p class="info">
      ${I18nextManager.getInstance().i18n.t('phovea:ui.infoPart1')}
        <strong><a href="http://phovea.caleydo.org/"  target="_blank"> ${I18nextManager.getInstance().i18n.t('phovea:ui.phoveaName')}</a></strong>
            ${I18nextManager.getInstance().i18n.t('phovea:ui.infoPart2')}
          <a href="http://phovea.caleydo.org" target="_blank"> ${I18nextManager.getInstance().i18n.t('phovea:ui.infoPart3')}</a>.
      </p>
  </div>`;
    content = content.querySelector('.metaData');
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
function defaultOptionsInfo(_title, content) {
    content.innerHTML = I18nextManager.getInstance().i18n.t('phovea:ui.noOptionsAvailable');
}
//# sourceMappingURL=header.js.map