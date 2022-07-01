import React from 'react';
import type { AjaxConfig } from 'rxjs/ajax';
import {
    Button,
    Form,
    Input,
    Drawer,
    message
} from 'antd';
import type { ValidateErrorEntity } from 'rc-field-form/lib/interface';
import { post } from '../service/request';
import * as Params from '../common/param/Param'

export type LoginMessage = {
    username: string,
    password: string
}

export default class Login extends React.Component {
    constructor(props: any) {
        super(props);
        this.state = {
            registerDrawerVisible: false
        }
    }

    onFinish = (values: LoginMessage) => {
        const ajaxConfig : AjaxConfig = {
            method: 'POST',
            url: Params.LOGIN_URL,
            body: values
        }
        post(ajaxConfig).subscribe({
            next: (values:Response) => console.log(values),
            complete: () =>console.log("complete")
        })
    }

    onFinishFailed = (errorInfo: ValidateErrorEntity<LoginMessage>) => {
        console.log('Fail:', errorInfo);
    }

    render() {
        return (
            <div>
                <Form
                    name="basic"
                    labelCol={{ span: 9 }}
                    wrapperCol={{ span: 6 }}
                    onFinish={this.onFinish}
                    onFinishFailed={this.onFinishFailed}
                    autoComplete="off"
                    style={{ marginTop: 150 }}
                >
                    <Form.Item
                        label="用户名"
                        name="username"
                        rules={[{ required: true, message: 'Please input your username!' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="密码"
                        name="password"
                        rules={[{ required: true, message: 'Please input your password!' }]}
                    >
                        <Input.Password />
                    </Form.Item>

                    <Form.Item wrapperCol={{ offset: 9, span: 6 }}>
                        <Button type="primary" htmlType="submit">
                            登录
                        </Button>
                    </Form.Item>

                </Form>
            </div>
        )
    }
}