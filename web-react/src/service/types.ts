export type LoginMessage = {
    username: string,
    password: string
}

export type RegisterMessage = {
    username: string,
    password: string,
    email: string,
    nickname: string
}

export type Res<T> = {
    code: number,
    msg: string,
    data: T
}

export type User = {
    username: string,
    password: string,
    uuid: string,
    email: string,
    nickname: string,
    avatar: string,
}

export type UserForList = {
    hasUnreadMessage: boolean,
    username: string,
    uuid: string,
    messageType: number,
    avatar: string,
}

export type comment ={
    author: string,
    avatar: string,
    content: JSX.Element,
    datetime: string,
}

export type ChooseUser = {
    toUser: string,     // 接收方uuid
    toUsername: string, // 接收方用户名
    messageType: number, // 消息类型，1.单聊 2.群聊
    avatar: string,     // 接收方的头像
}

export type Media = {
    isRecord: boolean, 
    showMediaPanel: boolean, 
    mediaConnected: boolean, 
    mediaReject: boolean, 
}
export type Peer = {
    localPeer: any,  // WebRTC peer 发起端
    remotePeer: any, // WebRTC peer 接收端
}

export type AddUser = {
    uuid: string,
    friendUsername: string,
}