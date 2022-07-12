import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, Button, Dropdown, Menu, message, Modal, Upload } from "antd";
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import UserService from "../service/userService";
import * as Param from '../common/param/Param'
import { selectUser, setUser } from "../redux/user";
import { beforeUpload, getBase64 } from "../utils/utils";
import { useAppDispatch, useAppSelector } from "../redux/hook";
import { User } from "../service/types";

export default function UserInfo(props: any) {
    const [ modalVisible, setModalVisible] = useState(false); 
    const [ loading, setLoading ] = useState(false);
    const [ imgUrl, setImgUrl ] = useState('');
    const user = useAppSelector(selectUser);
    const userService: UserService = new UserService();
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        userService.fetchUserDetails(localStorage.uuid).subscribe({
            next: res => {
                let user = {
                    ...res.data,
                    avatar: Param.HOST + "/file/" + res.data.avatar
                } as User
                dispatch(setUser(user))
            }
        })
    },[])

    const modifyAvatar = () => {
        setModalVisible(true);
    }

    const handleCancel = () => {
        setModalVisible(false);
    }

    const loginout = () => {
        navigate("/login");
    }

    const handleChange = (info:any) => {
        if (info.file.status === 'uploading') {
            setLoading(true);
            return;
        }
        if (info.file.status === 'done') {
            let response = info.file.response
            if (response.code !== 0) {
                message.error(info.file.response.msg)
            }

            let user = {
                ...props.user,
                avatar: Param.HOST + "/file/" + info.file.response.data
            }
            dispatch(setUser(user))
            // Get this url from response in real world.
            getBase64(info.file.originFileObj, (imageUrl:string) =>{
                setImgUrl(imageUrl);
                setLoading(false);
            });
        }
    };
    
    const menu = (
        <Menu>
                <Menu.Item key={1}>
                    <Button type='link'>{user.username}</Button>
                </Menu.Item>
                <Menu.Item key={2}>
                    <Button type='link' onClick={modifyAvatar}>更新头像</Button>
                </Menu.Item>
                <Menu.Item key={3}>
                    <Button type='link' onClick={loginout}>退出</Button>
                </Menu.Item>
            </Menu>
    )

    const uploadButton = (
        <div>
            {loading ? <LoadingOutlined /> : <PlusOutlined />}
            <div style={{ marginTop: 8 }}>Upload</div>
        </div>
    );

    return (
        <div>
            <Dropdown overlay={menu} placement="bottomCenter" arrow>
                <Avatar src={user.avatar} alt={user.username} />
            </Dropdown>
            <Modal title="更新头像" visible={modalVisible} onCancel={handleCancel} footer={null}>
                    <Upload
                        name="file"
                        listType="picture-card"
                        className="avatar-uploader"
                        showUploadList={false}
                        action={Param.FILE_URL}
                        beforeUpload={beforeUpload}
                        onChange={handleChange}
                        data={{ uuid: localStorage.uuid }}
                    >
                        {imgUrl ? <img src={imgUrl} alt="avatar" style={{ width: '100%' }} /> : uploadButton}
                    </Upload>
                </Modal>
        </div>
     )
}
