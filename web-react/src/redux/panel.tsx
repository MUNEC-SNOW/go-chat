import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ChooseUser, comment, Media, Peer, User, UserForList } from "../service/types";
import { RootState } from "./store";

interface PanelState { 
    userList: UserForList[],
    messageList: comment[],
    socket: WebSocket | any,
    chooseUser: ChooseUser,
    media: Media,
    peer: Peer,
}

const initialState: PanelState = {
    userList: [],
    messageList: [],
    socket: null,  
    chooseUser: {
        toUser: '',     // 接收方uuid
        toUsername: '', // 接收方用户名
        messageType: 1, // 消息类型，1.单聊 2.群聊
        avatar: '',     // 接收方的头像
    },
    media: {
        isRecord: false,
        showMediaPanel: false,
        mediaConnected: false,
        mediaReject: false,
    },
    peer: {
        localPeer: null,  // WebRTC peer 发起端
        remotePeer: null, // WebRTC peer 接收端
    }

}

export const panelSlice = createSlice({
    name: 'panel',
    initialState,
    reducers: {
        setUserList: (state, action: PayloadAction<UserForList[]>) => {
            state.userList = action.payload;
        },
        setChooseUser: (state, action: PayloadAction<ChooseUser>) => {
            state.chooseUser = action.payload;
        },
        setMessageList: (state, action: PayloadAction<comment[]>) => {
            state.messageList = action.payload
        },
        setSocket: (state, action: PayloadAction<any>) => {
            state.socket = action.payload
        },
        setMedia: (state, action: PayloadAction<Media>) => {
            state.media = action.payload
        },
        setPeer: (state, action: PayloadAction<Peer>) => {
            state.peer = action.payload
        }
    }
})

export const { setUserList, setChooseUser, setMessageList, setMedia, setPeer, setSocket } = panelSlice.actions

export const selectUserList = (state: RootState) => state.panel.userList
export const selectMessageList = (state: RootState) => state.panel.messageList
export const selectPeer = (state: RootState) => state.panel.peer
export const selectSocket = (state: RootState) => state.panel.socket
export const selectChooseUser = (state: RootState) => state.panel.chooseUser
export const selectMedia = (state: RootState) => state.panel.media

export default panelSlice.reducer