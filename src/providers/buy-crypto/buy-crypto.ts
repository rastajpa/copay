import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import * as _ from 'lodash';

// providers
import { ConfigProvider } from '../config/config';
import { HomeIntegrationsProvider } from '../home-integrations/home-integrations';
import { Logger } from '../logger/logger';
import { PlatformProvider } from '../platform/platform';
import { SimplexProvider } from '../simplex/simplex';
import { WyreProvider } from '../wyre/wyre';

@Injectable()
export class BuyCryptoProvider {
  public paymentMethodsAvailable;

  constructor(
    private configProvider: ConfigProvider,
    private homeIntegrationsProvider: HomeIntegrationsProvider,
    private logger: Logger,
    private translate: TranslateService,
    private simplexProvider: SimplexProvider,
    private wyreProvider: WyreProvider,
    private platformProvider: PlatformProvider
  ) {
    this.logger.debug('BuyCrypto Provider initialized');

    this.paymentMethodsAvailable = {
      applePay: {
        label: this.translate.instant('Apple Pay'),
        method: 'applePay',
        imgSrc: 'assets/img/buy-crypto/apple-pay.svg',
        supportedExchanges: {
          simplex: false,
          wyre: true
        },
        enabled: this.platformProvider.isIOS
      },
      creditCard: {
        label: this.translate.instant('Credit Card'),
        method: 'creditCard',
        imgSrc: 'assets/img/buy-crypto/debit-card.svg',
        supportedExchanges: {
          simplex: true,
          wyre: false
        },
        enabled: true
      },
      debitCard: {
        label: this.translate.instant('Debit Card'),
        method: 'debitCard',
        imgSrc: 'assets/img/buy-crypto/debit-card.svg',
        supportedExchanges: {
          simplex: true,
          wyre: true
        },
        enabled: true
      }
    };
  }

  public register(): void {
    this.homeIntegrationsProvider.register({
      name: 'buycrypto',
      title: this.translate.instant('Buy Crypto'),
      icon: null,
      showIcon: true,
      logo: null,
      logoWidth: '110',
      background:
        'linear-gradient(to bottom,rgba(60, 63, 69, 1) 0,rgba(45, 47, 51, 1) 100%)',
      page: 'CryptoSettingsPage',
      show: !!this.configProvider.get().showIntegration['buycrypto'],
      type: 'exchange'
    });
  }

  private isCurrencySupported(exchange: string, currency: string): boolean {
    switch (exchange) {
      case 'simplex':
        return _.includes(
          this.simplexProvider.supportedFiatAltCurrencies,
          currency.toUpperCase()
        );
      case 'wyre':
        return _.includes(
          this.wyreProvider.supportedFiatAltCurrencies,
          currency.toUpperCase()
        );
      default:
        return false;
    }
  }

  private isCoinSupported(exchange: string, coin: string) {
    switch (exchange) {
      case 'simplex':
        return _.includes(this.simplexProvider.supportedCoins, coin);
      case 'wyre':
        return _.includes(this.wyreProvider.supportedCoins, coin.toUpperCase());
      default:
        return false;
    }
  }

  public isPaymentMethodSupported(
    exchange: string,
    paymentMethod,
    coin: string,
    currency: string
  ): boolean {
    console.log(exchange, paymentMethod, coin, currency);
    return (
      paymentMethod.supportedExchanges[exchange] &&
      this.isCoinSupported(exchange, coin) &&
      this.isCurrencySupported(exchange, currency)
    );
  }
}
