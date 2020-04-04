import { Injectable } from '@angular/core';
import { StatusBar } from '@ionic-native/status-bar';

// providers
import { Logger } from '../logger/logger';
import { PersistenceProvider } from '../persistence/persistence';
import { PlatformProvider } from '../platform/platform';

declare var cordova: any;

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

  public load() {
    return new Promise(resolve => {
      this.persistenceProvider.getAppTheme().then(theme => {
        if (theme == 'dark-theme' || theme == 'light-theme') {
          this.currentAppTheme = theme;
          this.logger.debug(
            'Set App Theme from storage: ' + this.currentAppTheme
          );
          return resolve();
        } else {
          if (this.platformProvider.isCordova) {
            cordova.plugins.ThemeDetection.isAvailable(
              res => {
                if (res && res.value) {
                  cordova.plugins.ThemeDetection.isDarkModeEnabled(
                    success => {
                      this.currentAppTheme =
                        success && success.value ? 'dark-theme' : 'light-theme';
                      this.logger.debug(
                        'Set Mobile App Theme to: ' + this.currentAppTheme
                      );
                      return resolve();
                    },
                    _ => {
                      this.currentAppTheme = 'light-theme';
                      return resolve();
                    }
                  );
                } else {
                  this.currentAppTheme = 'light-theme';
                  return resolve();
                }
              },
              _ => {
                this.currentAppTheme = 'light-theme';
                return resolve();
              }
            );
          } else {
            this.currentAppTheme =
              window.matchMedia &&
              window.matchMedia('(prefers-color-scheme: dark)').matches
                ? 'dark-theme'
                : 'light-theme';
            this.logger.debug(
              'Set Desktop App Theme to: ' + this.currentAppTheme
            );
            return resolve();
          }
        }
      });
    });
  }

  public apply() {
    if (this.platformProvider.isCordova) {
      setTimeout(() => {
        if (this.isDarkModeEnabled()) {
          this.useDarkStatusBar();
        } else {
          this.useLightStatusBar();
        }
      }, 150);
    }

    document
      .getElementsByTagName('ion-app')[0]
      .classList.remove('dark-theme', 'light-theme');
    document
      .getElementsByTagName('ion-app')[0]
      .classList.add(this.isDarkModeEnabled() ? 'dark-theme' : 'light-theme');
    this.logger.debug('Apply Theme: ' + this.currentAppTheme);
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

  public getCurrentAppTheme() {
    return this.currentAppTheme;
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
