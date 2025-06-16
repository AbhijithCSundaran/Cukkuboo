import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core'
import { Observable } from 'rxjs';
// import { Observable } from 'rxjs-compat';
import 'rxjs/add/observable/throw';
// import { Response } from '@angular/http'
// import {Observable} from 'rxjs/Rx';
// import { Observable }     from "rxjs/Observable";

@Injectable()
export class SharedUtilityService {
    public extractData(res: HttpErrorResponse) {
        let body = res.error//json();
        return body || {};
    }
    public handleError(error: HttpErrorResponse | any) {
        // logging infrastructure
        let errMsg: string;
        if (error instanceof HttpErrorResponse) {
            const body = error.error//json() || '';
            const err = body.error || JSON.stringify(body);
            errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
        } else {
            errMsg = error.message ? error.message : error.toString();
        }
        console.error(errMsg);
        // return Observable.throw(errMsg);
        // return Observable.throw(errMsg);
    }
}