import { Component } from '@angular/core';
import * as _ from 'lodash';
import { ActionSheetParent } from '../action-sheet/action-sheet-parent';
import { CoinbaseProvider } from '../../providers/coinbase/coinbase';
import { HomeIntegrationsProvider } from '../../providers/home-integrations/home-integrations';
@Component({
  selector: 'wallet-selector',
  templateUrl: 'wallet-selector.html'
})
export class WalletSelectorComponent extends ActionSheetParent {
  public coin: string;
  public coinbaseData: any = {};
  public coinbaseLinked: boolean;
  public walletsByKeys: any[];
  public title: string;
  public selectedWalletId: string;
  public showCoinbase: boolean;

  constructor(private coinbaseProvider: CoinbaseProvider, private homeIntegrationsProvider: HomeIntegrationsProvider) {
    super();
  }

  ngOnInit() {
    this.title = this.params.title;
    this.coin = this.params.coin;
    this.selectedWalletId = this.params.selectedWalletId;
    this.separateWallets();
    this.setCoinbase();
  }

  private separateWallets(): void {
    const wallets = this.params.wallets;
    this.walletsByKeys = _.values(_.groupBy(wallets, 'keyId'));
  }

  public optionClicked(option): void {
    this.dismiss(option);
  }

  public setCoinbase() {
    this.showCoinbase = this.homeIntegrationsProvider.shouldShowInHome(
      'coinbase'
    );
    this.coinbaseLinked = this.coinbaseProvider.isLinked();
    if (this.coinbaseLinked && this.showCoinbase) {
      this.coinbaseData = _.cloneDeep(this.coinbaseProvider.coinbaseData);
      this.coinbaseData.accounts = _.filter(this.coinbaseData.accounts, ac =>
        ac.currency.code === this.coin.toUpperCase()
      );
    }
  }

  public getNativeBalance(amount, currency): string {
    return this.coinbaseProvider.getNativeCurrencyBalance(amount, currency);
  }

  public coinbaseAccountClicked(account): void {
    const option = {
      account,
      coinbaseSelected: true
    }
    this.dismiss(option);
  }
}
