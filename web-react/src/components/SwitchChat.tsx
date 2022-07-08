import { Button } from "antd";
import { UserOutlined, TeamOutlined } from '@ant-design/icons';
import { useEffect, useState } from "react"
import * as Params from '../common/param/Param'

import FriendService from "../service/friendService";
import { UserForList } from "../service/types";
import { useDispatch } from "react-redux";
import { setUserList } from "../redux/panel";

export default function SwitchChat() {
    const [menuType, setMenuType] = useState(1);
    const friendService: FriendService = new FriendService();
    const dispatch = useDispatch();

    const getFriendList = () => {
        setMenuType(1);
        friendService.fetchFriendList(localStorage.uuid)
            .subscribe({
                next: res => {
                    console.log(localStorage.uuid);
                    console.log(res);
                    let users = res.data;
                    let data: UserForList[] = [];
                    for (var index in users) {
                        let d: UserForList = {
                            hasUnreadMessage: false,
                            username: users[index].username,
                            uuid: users[index].uuid,
                            messageType: 1,
                            avatar: Params.HOST + "/file/" + users[index].avatar,
                        }
                        data.push(d)
                        dispatch(setUserList(data))
                    }
                }
            })
    }

    useEffect(() => {
        getFriendList();
    },[])

    

    const getGroupList = () => {
        setMenuType(2);
        friendService.fetchGroupList(localStorage.uuid)
            .subscribe({
                next: res => {
                    let users = res.data
                    let data = []
                    for (var index in users) {
                        let d = {
                            username: users[index].name,
                            uuid: users[index].uuid,
                            messageType: 2,
                        }
                        data.push(d)
                    }
                }
            })
    }

  return (
        <div style={{ marginTop: 25 }}>
            <p >
                <Button
                    icon={<UserOutlined />}
                    size="large"
                    type='link'
                    disabled={menuType === 1}
                    onClick={getFriendList}
                    style={{color: menuType === 1 ? '#1890ff' : 'gray'}}
                >
                </Button>
            </p>
            <p onClick={getGroupList}>
                <Button
                    icon={<TeamOutlined />}
                    size="large"
                    type='link'
                    disabled={menuType === 2}
                    style={{color: menuType === 2 ? '#1890ff' : 'gray'}}
                >
                </Button>
            </p>
        </div>
  )
}
