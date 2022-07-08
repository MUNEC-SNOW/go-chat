import { createSlice } from "@reduxjs/toolkit";
import { ChooseUser, comment, Media, Peer, User, UserForList } from "../service/types";

export const panelSlice = createSlice({
    name: 'panel',
    initialState: {
        value : {} as User,
        userList: [] as UserForList[],
        messageList: [] as comment[],
        socket: null,
        chooseUser: {
            toUser: '',     // 接收方uuid
            toUsername: '', // 接收方用户名
            messageType: 1, // 消息类型，1.单聊 2.群聊
            avatar: '',     // 接收方的头像
        } as ChooseUser,
        media: {
            isRecord: false,
            showMediaPanel: false,
            mediaConnected: false,
            mediaReject: false,
        } as Media,
        peer: {
            localPeer: null,  // WebRTC peer 发起端
            remotePeer: null, // WebRTC peer 接收端
        } as Peer

    },
    reducers: {
        setUserList: (state, action) => {
            state.userList = action.payload;
        },
        setChooseUser: (state, action) => {
            state.chooseUser = action.payload;
        },
        setMessageList: (state, action) => {
            state.messageList = action.payload
        },
        setSocket: (state, action) => {
            state.socket = action.payload
        },
        setMedia: (state, action) => {
            state.media = action.payload
        },
        setPeer: (state, action) => {
            state.peer = action.payload
        }
    }
})

export const { setUserList, setChooseUser, setMessageList, setMedia, setPeer, setSocket } = panelSlice.actions

export default panelSlice.reducer