import { map, Observable } from 'rxjs';
import { ajax, type AjaxConfig } from 'rxjs/ajax';

type Options = {
    dealError?: boolean
}

function axiosPost(postConfig: AjaxConfig) :Observable<Response> {
    return ajax(postConfig)
    .pipe(
        map(res => res.response as Response)
    )    
}