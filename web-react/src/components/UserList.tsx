import { useDispatch, useSelector } from "react-redux";
import MessageService, { MessageReq } from "../service/messageService";
import * as Params from '../common/param/Param';
import moment from 'moment';
import { ChooseUser, comment, UserForList} from "../service/types";
import {
    FileOutlined,
} from '@ant-design/icons';
import InfiniteScroll from 'react-infinite-scroll-component';
import { setMessageList, setChooseUser, setUserList, selectUserList } from "../redux/panel";
import { Avatar, Badge, List } from "antd";
import { useAppSelector } from "../redux/hook";

export default function UserList() {
    const dispatch = useDispatch();
    const userList: UserForList[] = useAppSelector(selectUserList)
    const messageService = new MessageService();

    const chooseUser = (value: any) => {
        getMessage(value);
        removeUnreadMessageDot(value.toUser);
    }

    const getMessage = (value: ChooseUser) => {
        const msgReq:MessageReq = {
            Uuid: value.toUser,
            FriendUsername: value.toUsername,
            MessageType: value.messageType,
        }
        messageService.fetchMessage(msgReq)
            .subscribe({
                next: res => {
                    let comments:comment[] = [];
                    let data = res.data;
                    if (null == data) {
                        data = [];
                    }
                    for (let i = 0; i < data.length; i++) {
                        let contentType: number = data[i].contentType
                        let content: JSX.Element = getContentByType(contentType, data[i].url, data[i].content);
                        let comment: comment ={
                            author: data[i].fromUsername,
                            avatar: Params.HOST + "/file/" + data[i].avatar,
                            content: <p>{content}</p>,
                            datetime: moment(data[i].createAt).fromNow(),
                        } 
                        comments.push(comment);
                        dispatch(setMessageList(comments))
                        dispatch(setChooseUser(value))
                    }   
                }
            })
    }

    const getContentByType = (type: number, url:string, content: any):JSX.Element => {
        if (type === 2) {
            content = <FileOutlined style={{ fontSize: 38 }} />
        } else if (type === 3) {
            content = <img src={Params.HOST + "/file/" + url} alt="" width="150px" />
        } else if (type === 4) {
            content = <audio src={Params.HOST + "/file/" + url} controls autoPlay={false} preload="auto" />
        } else if (type === 5) {
            content = <video src={Params.HOST + "/file/" + url} controls autoPlay={false} preload="auto" width='200px' />
        }
        return content;
    }

    const removeUnreadMessageDot = (toUuid: string) => {
        for (var index in userList){
            if (userList[index].uuid === toUuid) {
                userList[index].hasUnreadMessage = false;
                dispatch(setUserList(userList))
                break;
            }
        }
    }   

    return (
        <>
            <div id="userList" style={{
                height: document.body.scrollHeight - 125,
                overflow: 'auto',
            }}>
                <InfiniteScroll
                    dataLength={userList.length}
                    next={() => {}}
                    hasMore={true}
                    loader={null}
                    scrollableTarget="userList"
                    endMessage={
                        <p style={{ textAlign: 'center' }}>
                          <b>Yay! You have seen it all</b>
                        </p>
                    }
                >
                    <List
                        itemLayout="horizontal"
                        dataSource={userList}
                        renderItem={item => (
                            <List.Item                                     
                                onClick={() => chooseUser(item)}
                            >
                                <List.Item.Meta
                                    style={{ paddingLeft: 30 }}
                                    avatar={<Badge dot={item.hasUnreadMessage}><Avatar src={item.avatar} /></Badge>}
                                    title={item.username}
                                    description=""
                                />
                            </List.Item>
                        )}
                    />
                </InfiniteScroll>
            </div>
        </>
    )
}
