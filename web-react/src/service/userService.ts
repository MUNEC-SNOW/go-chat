import { message } from "antd";
import type { AjaxConfig } from "rxjs/ajax";
import { post } from "./request";
import { LoginMessage, RegisterMessage, Res, User } from "./types";
import * as Params from '../common/param/Param'
import { useDispatch } from "react-redux";
import { setUser } from "../redux/user";

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
    register = function (values: RegisterMessage) {
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
    }
    fetchUserDetails(values: string) {
        const ajaxConfig : AjaxConfig = {
            method: 'GET',
            url: Params.USER_URL,
            body: values
        }
        return post(ajaxConfig);
    }
}