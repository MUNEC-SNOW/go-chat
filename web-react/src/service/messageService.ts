import type { AjaxConfig } from "rxjs/ajax";
import * as Params from '../common/param/Param'

import { post } from "./req";

export type MessageReq = {
    Uuid: string,
    FriendUsername: string,
    MessageType: number
}

export default class MessageService {
    fetchMessage(values: MessageReq){
        const ajaxConfig: AjaxConfig = {
            method: 'GET',
            url: Params.MESSAGE_URL,
            body: values
        }
        return post(ajaxConfig);
    }
}