import { map, Observable } from 'rxjs';
import { ajax,type AjaxResponse, type AjaxConfig } from 'rxjs/ajax';


export function post(postConfig: AjaxConfig) :Observable<Response> {
    return ajax(postConfig)
    .pipe(
        map((res:AjaxResponse<any>) => res.response as Response)
    )    
}