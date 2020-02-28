import { Injectable } from '@angular/core';
import { StatusBar } from '@ionic-native/status-bar';

// providers
import { Logger } from '../logger/logger';
import { PersistenceProvider } from '../persistence/persistence';
import { PlatformProvider } from '../platform/platform';

@Injectable()
export class ThemeProvider {
  private currentAppTheme: string;

  public themes = {
    'light-theme': {
      backgroundColor: '#ffffff',
      fixedScrollBgColor: '#f8f8f9',
      walletDetailsBackgroundStart: '#ffffff',
      walletDetailsBackgroundEnd: '#ffffff'
    },
    'dark-theme': {
      backgroundColor: '#121212',
      fixedScrollBgColor: '#121212',
      walletDetailsBackgroundStart: '#121212',
      walletDetailsBackgroundEnd: '#101010'
    }
  };

  constructor(
    private logger: Logger,
    private persistenceProvider: PersistenceProvider,
    private statusBar: StatusBar,
    private platformProvider: PlatformProvider
  ) {
    this.logger.debug('ThemeProvider initialized');
  }

  public init() {
    this.persistenceProvider.getAppTheme().then(theme => {
      this.currentAppTheme = theme;
    });
  }

  public apply() {
    let newTheme, previousTheme: string;

    if (this.platformProvider.isCordova) {
      setTimeout(() => {
        if (this.isDarkModeEnabled()) {
          this.useDarkStatusBar();
        } else {
          this.useLightStatusBar();
        }
      }, 150);
    }
    if (this.isDarkModeEnabled()) {
      newTheme = 'dark-theme';
      previousTheme = 'light-theme';
    } else {
      newTheme = 'light-theme';
      previousTheme = 'dark-theme';
    }

    document.getElementsByTagName('ion-app')[0].classList.remove(previousTheme);
    document.getElementsByTagName('ion-app')[0].classList.add(newTheme);
  }

  public setActiveTheme(theme) {
    this.persistenceProvider.setAppTheme(theme);
    this.currentAppTheme = theme;
    this.apply();
  }

  public toggleTheme() {
    this.setActiveTheme(
      this.isDarkModeEnabled() ? 'light-theme' : 'dark-theme'
    );
  }

  public getThemeInfo(theme?: string) {
    // If no theme provided returns current theme info
    if (theme && this.themes[theme]) return this.themes[theme];
    else if (this.themes[this.currentAppTheme])
      return this.themes[this.currentAppTheme];
    else return this.themes['light-theme'];
  }

  public isDarkModeEnabled(): boolean {
    return Boolean(this.currentAppTheme === 'dark-theme');
  }

  private useDarkStatusBar() {
    this.statusBar.backgroundColorByHexString(
      this.themes['dark-theme'].backgroundColor
    );
    this.statusBar.styleBlackOpaque();
  }

  private useLightStatusBar() {
    this.statusBar.backgroundColorByHexString(
      this.themes['light-theme'].backgroundColor
    );
    this.statusBar.styleDefault();
  }

  public useCustomStatusBar(color) {
    this.statusBar.backgroundColorByHexString(color);
    this.statusBar.styleBlackOpaque();
  }

  public useDefaultStatusBar() {
    if (this.isDarkModeEnabled()) {
      this.useDarkStatusBar();
    } else {
      this.useLightStatusBar();
    }
  }
}
