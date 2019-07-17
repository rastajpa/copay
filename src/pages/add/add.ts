import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NavController, NavParams } from 'ionic-angular';

// pages
import { JoinWalletPage } from './join-wallet/join-wallet';
import { SelectCurrencyPage } from './select-currency/select-currency';

// providers
import { Logger } from '../../providers/logger/logger';
import { ProfileProvider } from '../../providers/profile/profile';
import { ReplaceParametersProvider } from '../../providers/replace-parameters/replace-parameters';

@Component({
  selector: 'page-add',
  templateUrl: 'add.html'
})
export class AddPage {
  public title: string;

  constructor(
    private navCtrl: NavController,
    private logger: Logger,
    private navParam: NavParams,
    private profileProvider: ProfileProvider,
    private translate: TranslateService,
    private replaceParametersProvider: ReplaceParametersProvider
  ) {
    const keyId = this.navParam.data.keyId;
    const walletGroup = this.profileProvider.getWalletGroup(keyId);
    if (walletGroup && walletGroup.name && keyId) {
      this.title = this.replaceParametersProvider.replace(
        this.translate.instant('{{walletGroupName}}'),
        {
          walletGroupName: walletGroup.name
        }
      );
    } else {
      this.title = this.translate.instant('Add Wallet');
    }
  }

  ionViewDidLoad() {
    this.logger.info('Loaded: AddPage');
  }

  public goToSelectCurrencyPage(isShared: boolean): void {
    this.navCtrl.push(SelectCurrencyPage, {
      isShared,
      keyId: this.navParam.data.keyId
    });
  }

  public goToJoinWallet(): void {
    this.navCtrl.push(JoinWalletPage, {
      keyId: this.navParam.data.keyId
    });
  }
}
