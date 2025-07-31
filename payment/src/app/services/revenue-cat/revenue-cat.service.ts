import { Injectable } from '@angular/core';
import { Purchases } from '@revenuecat/purchases-js';

@Injectable({ providedIn: 'root' })
export class RevenueCatService {
  init(userId: string) {
    Purchases.configure({
      apiKey: 'REVENUECAT_PUBLIC_API_KEY',
      appUserId: userId,
    });
    // Purchases.setDebugLogsEnabled(true);
  }

  async getCustomerInfo() {
    // return await Purchases.getCustomerInfo();
  }
}