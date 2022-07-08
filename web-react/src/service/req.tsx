import { map, Observable } from 'rxjs';
import { ajax,type AjaxResponse, type AjaxConfig } from 'rxjs/ajax';
import { Res } from './types';

export function post(postConfig: AjaxConfig) :Observable<Res<any>> {
    const headers: Readonly<Record<string, any>> = {'content-type': 'application/x-www-form-urlencoded'}
    postConfig.headers = headers;
    return ajax(postConfig)
    .pipe(
        map((res:AjaxResponse<any>) => res.response as Res<any>)
    )    
}