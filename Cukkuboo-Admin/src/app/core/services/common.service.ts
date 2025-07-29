import { DatePipe } from '@angular/common';
import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';

@Injectable({
    providedIn: 'root'
})
export class CommonService {


    private Pipe = new DatePipe('en-US');

    constructor(
    ) {
    }
    //#region "functions"
    roundN(num: any, n = 2) {
        return ((Math.round(num * Math.pow(10, n)) / Math.pow(10, n)).toFixed(n));
    }
    trimRSpaces(Data: any) {
        if (typeof (Data) == 'string')
            Data = Data.replace(/\s+$/g, '');
        else if (Array.isArray(Data))
            for (let item of Data) {
                for (let obj in item) {
                    if (item[obj] && typeof (item[obj]) == 'string')
                        item[obj] = item[obj].replace(/\s+$/g, '');
                }
            }
        else if (typeof (Data) == 'object')
            for (let obj in Data) {
                if (Data[obj] && typeof (Data[obj]) == 'string')
                    Data[obj] = Data[obj].replace(/\s+$/g, '');
            }
        return Data
    }
    formatData(Data: any) {
        for (let obj in Data) {
            if (Data[obj] != null) {
                if (Data[obj] === '')
                    Data[obj] = null
                else if (Array.isArray(Data[obj]) || typeof Data[obj] === 'object')
                    Data[obj] = JSON.stringify(Data[obj])
                else if (Data[obj] instanceof Date)
                    Data[obj] = this.transformDate(Data[obj])
            }
        }
        return Data
    }
    formatArrayData(Array: any[]) {
        for (let Data of Array) {
            for (let obj in Data) {
                if (Data[obj] === '')
                    Data[obj] = null
                else if (Data[obj] instanceof Date)
                    Data[obj] = this.transformDate(Data[obj])
            }
        }
        return Array
    }
    transformDate(date: any, format = 'yyyy/MM/dd h:mm:ss a') {
        if (date instanceof Date)
            return this.Pipe.transform(new Date(date), format);
        return date;
    }
    transformId(Id: number) {
        return Id === 0 ? null : Id
    }
    focusControl(key: any, nativeElement: any, attrName: any = null) {
        let control = nativeElement.querySelector('[formcontrolname="' + key + '"]');
        if (attrName) {
            if (nativeElement.querySelector('[selector="' + attrName + key + '"]')) {
                control = nativeElement.querySelector('[selector="' + attrName + key + '"]')
            }
        }
        if (control)
            control.focus();
    }
    focusInvalidControl(Controls: any, nativeElement: any, attrName = null) {
        var count = 0
        for (const key of Object.keys(Controls)) {
            if (Controls[key].invalid) {
                count++
                if (Array.isArray(Controls[key].value) && Controls[key].value) {
                    var native = nativeElement.querySelector('[formarrayname="' + key + '"]') || nativeElement.querySelector('[ng-reflect-name="' + key + '"]') || nativeElement;
                    this.focusInvalidControl(Controls[key].controls, native, attrName);
                    break;
                }
                else if (typeof (Controls[key].value) == 'object' && Controls[key].value) {
                    var native = nativeElement.querySelector('[formgroupname="' + key + '"]') || nativeElement.querySelector('[ng-reflect-name="' + key + '"]') || nativeElement;
                    this.focusInvalidControl(Controls[key].controls, native, attrName);
                    break;
                }
                else {
                    let invalidControl = nativeElement.querySelector('[formcontrolname="' + key + '"]');
                    if (attrName) {
                        if (nativeElement.querySelector('[selector="' + attrName + key + '"]')) {
                            invalidControl = nativeElement.querySelector('[selector="' + attrName + key + '"]')
                        }
                    }
                    Controls[key].touched = true;
                    for (let propertyName in Controls[key].errors) {
                        if (Controls[key].errors.hasOwnProperty(propertyName)) {
                            var placeHolder;
                            var errMsg = 'required'
                            if (propertyName != errMsg)
                                errMsg = 'not valid'
                            if (invalidControl) {
                                if (invalidControl.placeholder)
                                    placeHolder = invalidControl.placeholder
                                else if (invalidControl.dataset.placeholder)
                                    placeHolder = invalidControl.dataset.placeholder
                                else if (invalidControl.attributes.placeholder)
                                    placeHolder = invalidControl.attributes.placeholder.value
                                // else
                                //     placeHolder = invalidControl.innerText;
                                invalidControl.focus();
                                if (invalidControl.children?.length) {
                                    var focusElement = invalidControl.querySelector('input')
                                    if (focusElement)
                                        focusElement.focus();
                                }
                            }
                            if (!placeHolder) {
                                placeHolder = key.replace('_', '')
                                placeHolder = this.addSpacesToCamelCase(placeHolder)
                            }
                            // alert(placeHolder + ' is ' + errMsg);
                            break;
                        }
                    }
                    break;
                }
            }
        }
        if (count == 0) {
            alert('Form not valid.')
        }
        return count;
    }
    addSpacesToCamelCase(inputString: string) {
        return inputString.replace(/([a-z])([A-Z])/g, '$1 $2');
    }

    removeUnderscoreKeys<T>(obj: T): T {
        if (Array.isArray(obj)) {
            return obj.map(item => this.removeUnderscoreKeys(item)) as unknown as T;
        } else if (typeof obj === 'object' && obj !== null) {
            const result: any = {};
            for (const key in obj) {
                if (Object.prototype.hasOwnProperty.call(obj, key)) {
                    if (!key.startsWith('_')) {
                        result[key] = this.removeUnderscoreKeys((obj as any)[key]);
                    }
                }
            }
            return result;
        }
        return obj;
    }

    remove_char(Model: any, char = '_', All = true) {
        var model: any = {}
        for (let obj in Model) {
            // if (Model[obj] instanceof Date)
            //     Model[obj] = this.transformDate(Model[obj], 'yyyy-MM-dd')
            if (obj.startsWith(char) || All)
                model[obj.replace(char, "")] = Model[obj]
        }
        return model
    }
    add_char(Model: any, char = '_') {
        var model: any = {}
        for (let obj in Model) {
            model[char + obj] = Model[obj]
        }
        return model
    }
    ParseData(Data: any) {
        for (let obj in Data) {
            if (typeof Data[obj] === 'string') {
                if (Data[obj].startsWith('{'))
                    Data[obj] = Data[obj] ? JSON.parse(Data[obj]) : null;
                else if (Data[obj].startsWith('['))
                    Data[obj] = Data[obj] ? JSON.parse(Data[obj]) : [];
            }
        }
        return Data;
    }
    getMonthName(dt = new Date()) {
        var mlist = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
        return mlist[dt.getMonth()];
    }

    SortData(List: any[], field: any, OrderBy: 'asce' | 'desc' = "asce") {
        if (field) {
            if (OrderBy == 'asce')
                List.sort(function (a, b) {
                    if (a[field]?.toString().replace(/\s/g, '').toLowerCase() < b[field]?.toString().replace(/\s/g, '').toLowerCase()) { return -1; }
                    if (a[field]?.toString().replace(/\s/g, '').toLowerCase() > b[field]?.toString().replace(/\s/g, '').toLowerCase()) { return 1; }
                    return 0;
                })
            else
                List.sort(function (a, b) {
                    if (a[field]?.toString().replace(/\s/g, '').toLowerCase() > b[field]?.toString().replace(/\s/g, '').toLowerCase()) { return -1; }
                    if (a[field]?.toString().replace(/\s/g, '').toLowerCase() < b[field]?.toString().replace(/\s/g, '').toLowerCase()) { return 1; }
                    return 0;
                })
        }
        else {
            if (OrderBy == 'asce')
                List.sort(function (a, b) {
                    if (a?.replace(/\s/g, '').toLowerCase() < b?.replace(/\s/g, '').toLowerCase()) { return -1; }
                    if (a?.replace(/\s/g, '').toLowerCase() > b?.replace(/\s/g, '').toLowerCase()) { return 1; }
                    return 0;
                })
            else
                List.sort(function (a, b) {
                    if (a?.replace(/\s/g, '').toLowerCase() > b?.replace(/\s/g, '').toLowerCase()) { return -1; }
                    if (a?.replace(/\s/g, '').toLowerCase() < b?.replace(/\s/g, '').toLowerCase()) { return 1; }
                    return 0;
                })
        }
        return List
    }

    SortNumber(List: any[], field: any, OrderBy: 'asce' | 'desc' = "asce") {
        if (field) {
            if (OrderBy == 'asce')
                List.sort(function (a, b) {
                    if (Number(a[field]) < Number(b[field])) { return -1; }
                    if (Number(a[field]) > Number(b[field])) { return 1; }
                    return 0;
                })
            else
                List.sort(function (a, b) {
                    if (Number(a[field]) > Number(b[field])) { return -1; }
                    if (Number(a[field]) < Number(b[field])) { return 1; }
                    return 0;
                })
        }
        else {
            if (OrderBy == 'asce')
                List.sort(function (a, b) {
                    if (Number(a) < Number(b)) { return -1; }
                    if (Number(a) > Number(b)) { return 1; }
                    return 0;
                })
            else
                List.sort(function (a, b) {
                    if (Number(a) > Number(b)) { return -1; }
                    if (Number(a) < Number(b)) { return 1; }
                    return 0;
                })
        }
        return List
    }

    getRandomString(length: number = 4): any {
        var randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var result = '';
        for (var i = 0; i < length; i++) {
            result += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
        }
        return result;
    }
    getRandomNumber(length: number = 4): any {
        var randomChars = '0123456789';
        var result = '';
        for (var i = 0; i < length; i++) {
            result += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
        }
        if (Number(result) >= Math.pow(10, length - 1))
            return Number(result);
        else
            return this.getRandomNumber(length)
    }
    compareJson(obj1: any, obj2: any): boolean {
        if (obj1 === obj2) return true; // Same reference or primitive values

        if (typeof obj1 !== 'object' || typeof obj2 !== 'object' || obj1 === null || obj2 === null) {
            return false; // If not objects or if one is null, they are not equal
        }

        // Handle arrays
        if (Array.isArray(obj1) && Array.isArray(obj2)) {
            if (obj1.length !== obj2.length) return false;
            const sortedArr1 = [...obj1].sort((a, b) => (a > b ? 1 : -1));
            const sortedArr2 = [...obj2].sort((a, b) => (a > b ? 1 : -1));
            return sortedArr1.every((value, index) => this.compareJson(value, sortedArr2[index]));
        }

        // Handle objects
        const keys1 = Object.keys(obj1).sort();
        const keys2 = Object.keys(obj2).sort();
        if (keys1.length !== keys2.length) return false;

        return keys1.every((key, index) => {
            return keys2[index] === key && this.compareJson(obj1[key], obj2[key]);
        });
    }


    Encode(data: any): any {
        data = btoa(data)
        data = data.replace(/K/g, "6Y7YvCoyZVGQlovv");
        data = data.replace(/M/g, "CSry46");
        data = data.replace(/N/g, "2SrzR8");
        data = data.replace(/==/g, "00p3LC@>2hIOR7#Pv7");
        data = data.replace(/=/g, "ErYl9Cy");
        data = data.replace(/ey/g, "sgmyzcc1Eiy9xI73");
        let charArray: string[] = data.split('');
        let reverseArray: string[] = charArray.reverse();
        let reversedData: string = reverseArray.join('');
        return reversedData
    }
    Decode(data: any): any {
        let charArray: string[] = data.split('');
        let reverseArray: string[] = charArray.reverse();
        let reversedData: string = reverseArray.join('');
        reversedData = reversedData.replace(/6Y7YvCoyZVGQlovv/g, "K");
        reversedData = reversedData.replace(/CSry46/g, "M");
        reversedData = reversedData.replace(/2SrzR8/g, "N");
        reversedData = reversedData.replace(/00p3LC@>2hIOR7#Pv7/g, "==");
        reversedData = reversedData.replace(/ErYl9Cy/g, "=");
        reversedData = reversedData.replace(/sgmyzcc1Eiy9xI73/g, "ey");
        atob(reversedData)
        return atob(reversedData)
    }

    decryptData(encryptedBase64: string, key: string = 'Abhijith123456789'): string {
        // Convert Base64 string to WordArray
        const encryptedData = CryptoJS.enc.Base64.parse(encryptedBase64);

        // Extract IV (first 16 bytes = 4 words)
        const iv = CryptoJS.lib.WordArray.create(encryptedData.words.slice(0, 4), 16);

        // Extract HMAC (next 32 bytes = 8 words)
        const hmac = CryptoJS.lib.WordArray.create(encryptedData.words.slice(4, 12), 32);

        // Ciphertext starts after 12 words (IV + HMAC)
        const ciphertext = CryptoJS.lib.WordArray.create(encryptedData.words.slice(12), encryptedData.sigBytes - 48);

        // Generate SHA256-based key
        const hashedKey = CryptoJS.SHA256(key);

        // Verify HMAC
        const computedHmac = CryptoJS.HmacSHA256(ciphertext, hashedKey);
        const encodedHmac = CryptoJS.enc.Base64.stringify(hmac);
        const encodedComputedHmac = CryptoJS.enc.Base64.stringify(computedHmac);

        if (encodedHmac.substring(0, 43) !== encodedComputedHmac.substring(0, 43)) {
            throw new Error('HMAC verification failed');
        }

        // Wrap ciphertext in CipherParams object
        const cipherParams = CryptoJS.lib.CipherParams.create({
            ciphertext: ciphertext
        });

        // Decrypt
        const decrypted = CryptoJS.AES.decrypt(cipherParams, hashedKey, {
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });

        return decrypted.toString(CryptoJS.enc.Utf8);
    }

}
