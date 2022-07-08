import { message } from "antd";
import type { AjaxConfig } from "rxjs/ajax";
import { post } from "./req";
import { AddUser, LoginMessage, RegisterMessage, Res, User } from "./types";
import * as Params from '../common/param/Param'
import { useDispatch } from "react-redux";
import { setUser } from "../redux/user";
import { Observable } from "rxjs";

export default class UserService {   
    dispatch = useDispatch() 
    login(values: LoginMessage) {
        const ajaxConfig : AjaxConfig = {
            method: 'POST',
            url: Params.LOGIN_URL,
            body: values
        }
        post(ajaxConfig).subscribe({
            next: (values:Res<User>) => {
                message.success("login success!");
                localStorage.username = values.data.username
                localStorage.uuid = values.data.uuid
                this.dispatch(setUser(values.data))
            }
        })
    };

    register(values: RegisterMessage){
        const ajaxConfig : AjaxConfig = {
            method: "POST",
            url: Params.REGISTER_URL,
            body: values
        }
        post(ajaxConfig).subscribe({
            next: (values:Res<User>) =>{ 
                message.success("register success!");
                localStorage.username = values.data.username;
                console.log(values)
            }
        })
    };

    fetchUserDetails(values: string) :Observable<Res<any>> {
        const ajaxConfig : AjaxConfig = {
            method: 'GET',
            url: `${Params.USER_URL}${values}`
        }
        return post(ajaxConfig);
    };

    searchUser(values: string) :Observable<Res<any>> {
        const ajaxConfig : AjaxConfig = {
            method: 'GET',
            url: `${Params.USER_NAME_URL}`,
            body: values
        }
        return post(ajaxConfig)
    };

    addUser(userUuid: string, friendName: string) :Observable<Res<any>> {
        const values: AddUser = {
            uuid: userUuid,
            friendUsername: friendName
        }
        const ajaxConfig : AjaxConfig = {
            method: 'POST',
            url: Params.USER_FRIEND_URL,
            body: values,
        }
        return post(ajaxConfig);
    };

    joinGroup(userUuid: string, groupUuid: string) :Observable<Res<any>> {
        const ajaxConfig : AjaxConfig = {
            method: 'POST',
            url: `${Params.GROUP_JOIN_URL}${userUuid}/${groupUuid}`
        }
        return post(ajaxConfig);
    };

    createGroup(uuid: string, groupName: string) :Observable<Res<any>> {
        const ajaxConfig : AjaxConfig = {
            method: 'POST',
            url: `${Params.GROUP_LIST_URL}/${uuid}`,
            body: {
                name: groupName
            }
        }
        return post(ajaxConfig);
    }
}