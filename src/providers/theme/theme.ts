import { Injectable } from '@angular/core';
import { StatusBar } from '@ionic-native/status-bar';

// providers
import { ConfigProvider } from '../config/config';
import { Logger } from '../logger/logger';
import { PlatformProvider } from '../platform/platform';

declare var cordova: any;

@Injectable()
export class ThemeProvider {
  private currentAppTheme: string;

  public availableThemes = {
    light: {
      name: 'Light Mode',
      backgroundColor: '#ffffff',
      fixedScrollBgColor: '#f8f8f9',
      walletDetailsBackgroundStart: '#ffffff',
      walletDetailsBackgroundEnd: '#ffffff'
    },
    dark: {
      name: 'Dark Mode',
      backgroundColor: '#121212',
      fixedScrollBgColor: '#121212',
      walletDetailsBackgroundStart: '#121212',
      walletDetailsBackgroundEnd: '#101010'
    }
  };

  public useSystemTheme: boolean = false;
  public detectedSystemTheme: string = 'light';

  constructor(
    private logger: Logger,
    private statusBar: StatusBar,
    private platformProvider: PlatformProvider,
    private configProvider: ConfigProvider
  ) {
    this.logger.debug('ThemeProvider initialized');
  }

  public load() {
    return new Promise(resolve => {
      const config = this.configProvider.get();
      if (!config.theme.system) {
        this.useSystemTheme = false;
        this.currentAppTheme = config.theme.name;
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
                    this.useSystemTheme = true;
                    this.currentAppTheme = this.detectedSystemTheme =
                      success && success.value ? 'dark' : 'light';
                    this.logger.debug(
                      'Set Mobile App Theme to: ' + this.currentAppTheme
                    );
                    return resolve();
                  },
                  _ => {
                    this.currentAppTheme = 'light';
                    return resolve();
                  }
                );
              } else {
                this.currentAppTheme = 'light';
                return resolve();
              }
            },
            _ => {
              this.currentAppTheme = 'light';
              return resolve();
            }
          );
        } else {
          this.useSystemTheme = true;
          this.currentAppTheme = this.detectedSystemTheme =
            window.matchMedia &&
            window.matchMedia('(prefers-color-scheme: dark)').matches
              ? 'dark'
              : 'light';
          this.logger.debug(
            'Set Desktop App Theme to: ' + this.currentAppTheme
          );
          return resolve();
        }
      }
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
      .classList.remove('dark', 'light');
    document
      .getElementsByTagName('ion-app')[0]
      .classList.add(this.isDarkModeEnabled() ? 'dark' : 'light');
    this.logger.debug('Apply Theme: ' + this.currentAppTheme);
  }

  public setActiveTheme(theme: string) {
    switch (theme) {
      case 'system':
        this.useSystemTheme = true;
        this.currentAppTheme = this.detectedSystemTheme;
        break;
      default:
        this.useSystemTheme = false;
        this.currentAppTheme = theme;
    }
    this.apply();
  }

  public setConfigTheme(): void {
    let opts = {
      theme: { name: this.currentAppTheme, system: this.useSystemTheme }
    };
    this.configProvider.set(opts);
  }

  public getThemeInfo(theme?: string) {
    // If no theme provided returns current theme info
    if (theme && this.availableThemes[theme])
      return this.availableThemes[theme];
    else if (this.availableThemes[this.currentAppTheme])
      return this.availableThemes[this.currentAppTheme];
    else return this.availableThemes['light'];
  }

  public isDarkModeEnabled(): boolean {
    return Boolean(this.currentAppTheme === 'dark');
  }

  public getCurrentAppTheme() {
    return this.useSystemTheme
      ? 'System Default'
      : this.availableThemes[this.currentAppTheme].name;
  }

  public getSelectedTheme() {
    return this.useSystemTheme ? 'system' : this.currentAppTheme;
  }

  private useDarkStatusBar() {
    this.statusBar.backgroundColorByHexString(
      this.availableThemes['dark'].backgroundColor
    );
    this.statusBar.styleBlackOpaque();
  }

  private useLightStatusBar() {
    this.statusBar.backgroundColorByHexString(
      this.availableThemes['light'].backgroundColor
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
