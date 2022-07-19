import { List, Comment, type CommentProps, Badge, Card, Drawer, Avatar } from "antd";
import { useEffect, useState } from "react";
import {
    MoreOutlined,
} from '@ant-design/icons';
import * as Params from '../../common/param/Param'
import InfiniteScroll from "react-infinite-scroll-component";
import { useAppDispatch, useAppSelector } from "../../redux/hook";
import { selectChooseUser } from "../../redux/panel";
import { User } from "../../service/types";
import MessageService from "../../service/messageService";
import { Subscription } from "rxjs";

const CommentList = ({ comments } : { comments: CommentProps[] }) => {
    return (
        <InfiniteScroll
            next={() => {}}
            hasMore={true}
            loader={null}
            dataLength={comments.length}
            scrollableTarget="scrollableDiv"
        >
            <List
                dataSource={comments}
                itemLayout="horizontal"
                renderItem={(props: CommentProps) => <Comment {...props} />}
            />
        </InfiniteScroll>
    )
}

export default function ChatDetails(props: any) {
    const chooseUser = useAppSelector(selectChooseUser);
  
    const [ groupUsers, setGroupUsers ] = useState<User[]>([]);
    const [ drawerVisible, setDrawerVisible ] = useState(false);
    const [ msgList, setMsgList ] = useState([]);
    const messageService = new MessageService();
    let chatDe: Subscription | null = null;

    useEffect(() => {
        return function() {
            chatDe?.unsubscribe()
        }
    }, [])

    const scrollToBottom = () => {
        let div = document.getElementById("scrollableDiv");
        div!.scrollTop = div!.scrollHeight;
    }

    const chatDetails = () => {
        chatDe = messageService.chatDetail(Params.GROUP_USER_URL + chooseUser.toUser)
            .subscribe({
            next: (res: any) => {
                if (res.data == null) {
                    return
                }
                setDrawerVisible(true);
                if (res.data.length == msgList.length) {
                    setGroupUsers(res.data);
                    scrollToBottom();
                }  
            }
        })
    }

    const drawerOnclose = () => {
        setDrawerVisible(false);
    }
    return (
        <>
            <Badge.Ribbon text={<MoreOutlined onClick={chatDetails} />}>
                <Card title={chooseUser.toUsername} size="default">
                    <div
                        id="scrollableDiv"
                        style={{
                            height: document.body.scrollHeight / 3 * 1.4,
                            overflow: 'auto',
                            padding: '0 16px',
                            border: '0px solid rgba(140, 140, 140, 0.35)',
                        }}
                    >
                        {msgList.length > 0 && <CommentList comments={msgList} />}

                    </div>
                </Card>
            </Badge.Ribbon>
            <Drawer title="成员列表" placement="right" onClose={drawerOnclose} visible={drawerVisible}>
                <List
                    itemLayout="horizontal"
                    dataSource={groupUsers}
                    renderItem={(item: User) => (
                        <List.Item>
                            <List.Item.Meta
                                style={{ paddingLeft: 30 }}
                                avatar={<Avatar src={Params.HOST + "/file/" + item.avatar} />}
                                title={item.username}
                                description=""
                            />
                        </List.Item>
                    )}
                />
            </Drawer>
        </>
    )
}
