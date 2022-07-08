import { post } from "./req";
import * as Params from '../common/param/Param'
import { AjaxConfig } from "rxjs/ajax";


export default class FriendService {
    fetchFriendList(values: string) {
        const ajaxConfig : AjaxConfig = {
            method: 'GET',
            url: `${Params.USER_LIST_URL}?uuid=${values}`
        }
        return post(ajaxConfig);
    };
    fetchGroupList(values: string) {
        const ajaxConfig : AjaxConfig = {
            method: 'GET',
            url: `${Params.GROUP_LIST_URL}/${values}`
        }
        return post(ajaxConfig);
    }
}