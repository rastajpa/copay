import { Component } from '@angular/core';
import { ModalController, NavController, NavParams } from 'ionic-angular';

// Providers
import { BitPayProvider } from '../../../providers/bitpay/bitpay';
import { Logger } from '../../../providers/logger/logger';
import { PersistenceProvider } from '../../../providers/persistence/persistence';
import { ProfileProvider } from '../../../providers/profile/profile';
import { SimplexProvider } from '../../../providers/simplex/simplex';
import { WalletProvider } from '../../../providers/wallet/wallet';

// Pages
import { CountrySelectorPage } from '../../../pages/buy-crypto/country-selector/country-selector';
import { CryptoOffersPage } from '../../../pages/buy-crypto/crypto-offers/crypto-offers';
import { CryptoPaymentMethodPage } from '../../../pages/buy-crypto/crypto-payment-method/crypto-payment-method';
import { AmountPage } from '../../../pages/send/amount/amount';
@Component({
  selector: 'page-crypto-order-summary',
  templateUrl: 'crypto-order-summary.html'
})
export class CryptoOrderSummaryPage {
  public wallet: any;
  public walletId: any;
  public coin: string;
  public paymentMethod: any;
  public country: string;
  public currency: string;
  public currencies;
  public amount: any;
  public address: string;
  public countryList: any[] = [];
  public selectedCountry;

  constructor(
    private logger: Logger,
    private navParams: NavParams,
    private modalCtrl: ModalController,
    private simplexProvider: SimplexProvider,
    private navCtrl: NavController,
    private persistenceProvider: PersistenceProvider,
    private profileProvider: ProfileProvider,
    private walletProvider: WalletProvider,
    private bitPayProvider: BitPayProvider
  ) {
    this.currencies = this.simplexProvider.supportedCoins;
  }

  ionViewDidLoad() {
    this.logger.info('Loaded: CryptoOrderSummaryPage');
  }

  ionViewWillEnter() {
    this.amount = this.navParams.data.amount;
    this.currency = this.navParams.data.currency;
    this.paymentMethod = this.navParams.data.paymentMethod;
    this.coin = this.navParams.data.coin;
    this.walletId = this.navParams.data.walletId;
    this.wallet = this.profileProvider.getWallet(this.walletId);
    this.walletProvider.getAddress(this.wallet, false).then(addr => {
      this.address = addr;
    });

    this.selectedCountry = {
      name: 'United States',
      phonePrefix: '+1',
      shortCode: 'US',
      threeLetterCode: 'USA'
    };
    this.persistenceProvider.getCountries().then(data => {
      if (data) {
        this.countryList = data;
      } else {
        this.bitPayProvider.get(
          '/countries',
          ({ data }) => {
            this.persistenceProvider.setCountries(data);
            this.countryList = data;
          },
          () => {}
        );
      }
    });
  }

  public openAmountModal() {
    let modal = this.modalCtrl.create(
      AmountPage,
      {
        fromBuyCrypto: true,
        walletId: this.walletId,
        coin: this.coin,
        useAsModal: true,
        currency: this.currency
      },
      {
        showBackdrop: true,
        enableBackdropDismiss: true
      }
    );
    modal.present();
    modal.onDidDismiss(data => {
      if (data) {
        this.amount = data.fiatAmount;
        this.currency = data.currency;
      }
    });
  }

  public openCountrySelectorModal() {
    let modal = this.modalCtrl.create(
      CountrySelectorPage,
      {
        countryList: this.countryList,
        useAsModal: true
      },
      {
        showBackdrop: true,
        enableBackdropDismiss: true
      }
    );
    modal.present();
    modal.onDidDismiss(data => {
      if (data) {
        this.selectedCountry = data.selectedCountry;
      }
    });
  }

  public openCryptoPaymentMethodModal() {
    let modal = this.modalCtrl.create(
      CryptoPaymentMethodPage,
      {
        paymentMethod: this.paymentMethod.method,
        useAsModal: true
      },
      {
        showBackdrop: true,
        enableBackdropDismiss: true
      }
    );
    modal.present();
    modal.onDidDismiss(data => {
      if (data) {
        this.paymentMethod = data.paymentMethod;
      }
    });
  }

  public goToCryptoOffersPage() {
    const params = {
      amount: this.amount,
      currency: this.currency,
      paymentMethod: this.paymentMethod,
      coin: this.coin,
      walletId: this.walletId,
      selectedCountry: this.selectedCountry
    };
    this.navCtrl.push(CryptoOffersPage, params);
  }

  public getDigitsInfo(currency: string) {
    if (!this.coin || this.coin.toUpperCase() === currency) return '';
    else return '1.2-2';
  }
}
