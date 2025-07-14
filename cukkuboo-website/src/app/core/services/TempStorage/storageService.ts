import { Injectable } from '@angular/core'
import { BehaviorSubject, Observable } from 'rxjs';
import { storage } from './Storage';

@Injectable({
    providedIn: 'root'
})
export class StorageService {

    private _onUpdateItem: BehaviorSubject<any>;

    constructor(
    ) {
        this._onUpdateItem = new BehaviorSubject(null);
    }

    /**
     * Get onUpdateItem
     *
     * @returns {Observable<any>}
     */
    get onUpdateItem(): Observable<any> {
        return this._onUpdateItem.asObservable();
    }

    // updateItem(name: any, value: any) {
    //     var storageList: any[] = storage;
    //     storageList.find((item: any) => item.name === name).value = value;
    //     this._onUpdateItem.next(true);
    // }
updateItem(name: any, value: any): void {
  const storageList: any[] = storage;
  const item = storageList.find((item: any) => item.name === name);

  if (item) {
    item.value = value;
  } else {
    storageList.push({ name, value });
  }

  this._onUpdateItem.next(true);
}

    getItem(name: any) {
        var storageList: any[] = storage;
        return storageList.find((item: any) => item.name === name).value;
    }

    // this.StorageService.onUpdateItem.pipe(takeUntil(this._unsubscribeAll)).
    // subscribe(() => {
    //     // Load the navigation
    // });
}