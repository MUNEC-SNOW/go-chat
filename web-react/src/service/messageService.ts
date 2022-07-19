import { Observable } from "rxjs";
import type { AjaxConfig } from "rxjs/ajax";
import * as Params from '../common/param/Param'

import { post } from "./req";

export type MessageReq = {
    Uuid: string,
    FriendUsername: string,
    MessageType: number
}

export default class MessageService {
    ajaxConfig: AjaxConfig = {
        method: 'GET',
        url: Params.MESSAGE_URL,
        body: null
    }

    fetchMessage(values: MessageReq): Observable<any>{
        this.ajaxConfig = {
            method: 'GET',
            url: Params.MESSAGE_URL,
            body: values
        }
        return post(this.ajaxConfig);
    }

    chatDetail(url: string): Observable<any>{
        this.ajaxConfig = {
            method: 'GET',
            url: url
        }
        return post(this.ajaxConfig);
    }
}