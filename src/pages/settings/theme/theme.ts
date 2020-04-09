import { Component } from '@angular/core';

// providers
import { Logger, ThemeProvider } from '../../../providers';

@Component({
  selector: 'page-theme',
  templateUrl: 'theme.html'
})
export class ThemePage {
  public availableThemes;
  public selectedTheme;
  constructor(private logger: Logger, private themeProvider: ThemeProvider) {
    this.selectedTheme = this.themeProvider.getSelectedTheme();
    this.availableThemes = this.themeProvider.availableThemes;
  }

  ionViewDidLoad() {
    this.logger.info('Loaded: ThemePage');
  }

  ionViewWillLeave() {
    this.themeProvider.setConfigTheme();
  }

  public save(theme: string) {
    this.themeProvider.setActiveTheme(theme);
  }
}
