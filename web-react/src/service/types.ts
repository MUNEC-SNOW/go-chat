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