import { getActiveRoute } from '../routes/url-parser';
import {
  generateAuthenticatedNavigationListTemplate,
  generateMainNavigationListTemplate,
  generateSubscribeButtonTemplate,
  generateUnauthenticatedNavigationListTemplate,
  generateUnsubscribeButtonTemplate,
} from '../templates';
import { setupSkipToContent } from '../utils';
import { getAccessToken, getLogout } from '../utils/auth';
import { routes } from '../routes/routes';
import {
  subscribe,
  unsubscribe,
  isCurrentPushSubscriptionAvailable,
} from '../utils/notification-helper';

export default class App {
  #content;
  #drawerButton;
  #drawerNavigation;
  #skipLinkButton;

  constructor({ content, drawerNavigation, drawerButton, skipLinkButton }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#drawerNavigation = drawerNavigation;
    this.#skipLinkButton = skipLinkButton;

    this.#init();
  }

  #init() {
    setupSkipToContent(this.#skipLinkButton, this.#content);
    this.#setupDrawer();
    this.#setupNavigationList();
  }

  #setupDrawer() {
    if (!this.#drawerButton || !this.#drawerNavigation) return;

    this.#drawerButton.addEventListener('click', (event) => {
      event.stopPropagation();
      this.#drawerNavigation.classList.toggle('open');
    });

    document.body.addEventListener('click', (event) => {
      const isInsideDrawer = this.#drawerNavigation.contains(event.target);
      const isInsideButton = this.#drawerButton.contains(event.target);
      if (!isInsideDrawer && !isInsideButton) {
        this.#drawerNavigation.classList.remove('open');
      }
    });

    this.#drawerNavigation.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        this.#drawerNavigation.classList.remove('open');
      });
    });
  }

  async #setupNavigationList() {
    const isLoggedIn = !!getAccessToken();
    const navListMain = this.#drawerNavigation.querySelector('#navlist-main');
    const navListAuth = this.#drawerNavigation.querySelector('#navlist');

    if (!navListMain || !navListAuth) {
      console.error('Elemen navigasi tidak ditemukan.');
      return;
    }

    if (isLoggedIn) {
      navListMain.innerHTML = generateMainNavigationListTemplate();
      navListAuth.innerHTML = generateAuthenticatedNavigationListTemplate();

      const logoutButton = navListAuth.querySelector('#logout-button');
      if (logoutButton) {
        const newLogoutButton = logoutButton.cloneNode(true);
        logoutButton.parentNode.replaceChild(newLogoutButton, logoutButton);

        newLogoutButton.addEventListener('click', (event) => {
          event.preventDefault();
          if (confirm('Apakah Anda yakin ingin keluar?')) {
            getLogout();
            this.#setupNavigationList();
            location.hash = '#/login';
          }
        });
      }
    } else {
      navListMain.innerHTML = `
        <li><a href="#/">LIST YOUR STORY</a></li>
        <li><a href="#/bookmark">BOOKMARK</a></li>
        <!-- menu lain -->
      `;
      navListAuth.innerHTML = generateUnauthenticatedNavigationListTemplate();
    }

    await this.#setupPushNotification(navListAuth);
  }

  async #setupPushNotification(container) {
    const pushTools = container.querySelector('#push-notification-tools');
    if (!pushTools) return;

    const isSubscribed = await isCurrentPushSubscriptionAvailable();
    pushTools.innerHTML = isSubscribed
      ? generateUnsubscribeButtonTemplate()
      : generateSubscribeButtonTemplate();

    const subscribeButton = pushTools.querySelector('#subscribe-button');
    const unsubscribeButton = pushTools.querySelector('#unsubscribe-button');

    if (subscribeButton) {
      subscribeButton.addEventListener('click', async () => {
        const success = await subscribe();
        if (success) this.#setupNavigationList();
      });
    }

    if (unsubscribeButton) {
      unsubscribeButton.addEventListener('click', async () => {
        const success = await unsubscribe();
        if (success) this.#setupNavigationList();
      });
    }
  }

  async renderPage() {
    const url = getActiveRoute();
    const routeHandlerFunction = url ? routes[url] : undefined;

    if (!this.#content) {
      console.error('Element content tidak tersedia.');
      return;
    }

    try {
      if (typeof routeHandlerFunction === 'function') {
        const pageInstance = await routeHandlerFunction();

        if (pageInstance && typeof pageInstance.render === 'function') {
          if (document.startViewTransition) {
            const transition = document.startViewTransition(async () => {
              this.#content.innerHTML = await pageInstance.render();
              if (typeof pageInstance.afterRender === 'function') {
                await pageInstance.afterRender();
              }
            });

            await transition.ready;
            await transition.updateCallbackDone;
          } else {
            this.#content.innerHTML = await pageInstance.render();
            if (typeof pageInstance.afterRender === 'function') {
              await pageInstance.afterRender();
            }
          }

          scrollTo({ top: 0, behavior: 'smooth' });
          await this.#setupNavigationList();
        } else if (pageInstance === null) {
          console.warn(`Rute "${url}" dibatalkan oleh auth guard.`);
        } else {
          console.error(`Handler rute "${url}" tidak mengembalikan instance valid.`);
          this.#content.innerHTML = '<h1>Error: Halaman tidak valid</h1>';
          await this.#setupNavigationList();
        }
      } else {
        console.warn(`Rute "${url}" tidak ditemukan.`);
        this.#content.innerHTML = '<h1>404 - Halaman Tidak Ditemukan</h1>';
        await this.#setupNavigationList();
      }
    } catch (error) {
      console.error('Error saat merender halaman:', error);
      this.#content.innerHTML = '<h1>Oops! Terjadi Kesalahan</h1>';
      await this.#setupNavigationList();
    }
  }
}
