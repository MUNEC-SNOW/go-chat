import { Button, Drawer, Form, Input } from 'antd';
import { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { LoginMessage, RegisterMessage } from '../service/types';
import UserService from '../service/userService';

export default function Login(props: any) {
    const [DrawerVisible, setDrawerVisible] = useState(false);
    const userService: UserService = new UserService();
    const navigate = useNavigate();

    const onFinish = (values: LoginMessage) => {
        userService.login(values);
        navigate("/panel/" + localStorage.uuid);
    }

    const onRegister = (values: RegisterMessage) => {
        userService.register(values);
        drawerOnclose();
    }

    const onFinishFailed = (errorInfo: any) => {
        console.log('Failed:', errorInfo);
    }

    const showRegister = () => {
        setDrawerVisible(true);
    }

    const drawerOnclose = () => {
        setDrawerVisible(false);
    }

    return (
        <div>
            <Form
                name="basic"
                labelCol={{ span: 9 }}
                wrapperCol={{ span: 6 }}
                onFinish={onFinish}
                onFinishFailed={onFinishFailed}
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

                    <Button onClick={showRegister} style={{ marginLeft: 40 }}>
                        注册
                    </Button>
                </Form.Item>

            </Form>

            <Drawer width='500px' forceRender={true} title="注册" placement="right" onClose={drawerOnclose} visible={DrawerVisible}>
                <Form
                    name="basic"
                    labelCol={{ span: 4 }}
                    wrapperCol={{ span: 16 }}
                    onFinish={onRegister}
                    autoComplete="off"
                    style={{ marginTop: 150 }}
                >
                    <Form.Item
                        label="用户名"
                        name="username"
                        rules={[{ required: true, message: '用户名!' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="密码"
                        name="password"
                        rules={[{ required: true, message: '密码!' }]}
                    >
                        <Input.Password />
                    </Form.Item>

                    <Form.Item
                        label="邮箱"
                        name="email"
                        rules={[{ required: true, message: '邮箱!' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="昵称"
                        name="nickname"
                        rules={[{ required: true, message: '昵称!' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item wrapperCol={{ offset: 2, span: 6 }}>
                        <Button type="primary" htmlType="submit" style={{ marginLeft: 40 }}>
                            注册
                    </Button>
                    </Form.Item>

                </Form>
            </Drawer>
        </div>
    )
}


