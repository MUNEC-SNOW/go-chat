import { Button, Col, Dropdown, Form, FormInstance, Input, Menu, message, Modal, Row } from "antd";
import React, { useState } from "react"
import { PlusCircleOutlined } from '@ant-design/icons';
import UserService from "../service/userService";

export default function UserSearch(props: any) {
    const userService = new UserService();
    const groupForm = React.createRef<FormInstance>();
    const [ showCreateGroup, setShowCreateGroup ] = useState(false);
    const [ hasUser, setHasUser ] = useState(false);
    const [ queryUser, setQueryUser ] = useState({
        username: '',     
        nickname: '',
        groupUuid: '',
        groupName: '',
    });

    const searchUser = (value: string, _event: any) => {
        userService.searchUser(value)
            .subscribe({
                next: res => {
                    const { data } = res;
                    if (data.user.username === "" && data.group.name === "") {
                        message.error("未查找到群或者用户")
                        return
                    }
                    let queryUser = {
                        username: data.user.username,
                        nickname: data.user.nickname,
    
                        groupUuid: data.group.uuid,
                        groupName: data.group.name,
                    }
                    setQueryUser(queryUser);
                }
            })
    }

    const addUser = () => {
        userService.addUser(localStorage.uuid, queryUser.username)
            .subscribe({
                next: () => {
                    message.success("add success!");
                    setHasUser(false);
                }
            })
    }

    const joinGroup = () => {
        userService.joinGroup(localStorage.uuid, queryUser.groupUuid)
            .subscribe({
                next: () => {
                    message.success("join success!");
                    setHasUser(false);
                }
            })
    }

    const createGroup = () => {
        const values = groupForm.current?.getFieldValue('groupName');
        console.log(values);
        userService.createGroup(localStorage.uuid, values.groupName)
            .subscribe({
                next: () => {
                    message.success("create success!");
                    setShowCreateGroup(false);
                }
            })
    }

    const userModalHandler = () => {
        hasUser ? setHasUser(false) : setHasUser(true);
    }

    const groupModalHandler = () => {
        showCreateGroup ? setShowCreateGroup(false) : setShowCreateGroup(true);
    }

    const menu = (
        <Menu>
            <Menu.Item key={1}>
                <Button type='link' onClick={userModalHandler}>添加用户</Button>
            </Menu.Item>
            <Menu.Item key={2}>
                <Button type='link' onClick={userModalHandler}>添加群</Button>
            </Menu.Item>
            <Menu.Item key={3}>
                <Button type='link' onClick={groupModalHandler}>创建群</Button>
            </Menu.Item>
        </Menu>
    )

    return (
        <>
                <Row>
                    <Col span={20} >
                        <Input.Group compact>
                            <Input.Search allowClear style={{ width: '100%' }} onSearch={searchUser} />
                        </Input.Group>
                    </Col>
                    <Col>
                        <Dropdown overlay={menu} placement="bottomCenter" arrow>
                            <PlusCircleOutlined style={{ fontSize: 22, color: 'gray', marginLeft: 3, marginTop: 5 }} />
                        </Dropdown>
                    </Col>
                </Row>


                <Modal title="用户信息" visible={hasUser} onCancel={userModalHandler} okText="添加用户" footer={null}>
                    <Input.Group compact>
                        <Input.Search allowClear style={{ width: '100%' }} onSearch={searchUser} />
                    </Input.Group>
                    <br /><hr /><br />

                    <p>用户名：{queryUser.username}</p>
                    <p>昵称：{queryUser.nickname}</p>
                    <Button type='primary' onClick={addUser} disabled={queryUser.username == null || queryUser.username === ''}>添加用户</Button>
                    <br /><br /><hr /><br /><br />

                    <p>群信息：{queryUser.groupName}</p>
                    <Button type='primary' onClick={joinGroup} disabled={queryUser.groupUuid == null || queryUser.groupUuid === ''}>添加群</Button>
                </Modal>

                <Modal title="创建群" visible={showCreateGroup} onCancel={groupModalHandler} onOk={createGroup} okText="创建群">
                    <Form
                        name="groupForm"
                        ref={groupForm}
                        layout="vertical"
                        autoComplete="off"
                    >
                        <Form.Item
                            name="groupName"
                            label="群名称"
                            rules={[{ required: true }]}
                        >
                            <Input placeholder="群名称" />
                        </Form.Item>
                    </Form>

                </Modal>
            </>
    )
}
