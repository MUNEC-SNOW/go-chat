import { Button, Col, Drawer, message, Modal, Row, Tooltip } from "antd";
import * as Params from '../common/param/Param'
import * as Constant from '../common/constant/Constant'
import {
    PoweroffOutlined,
    FileOutlined,
} from '@ant-design/icons';

import protobuf from '../proto/proto'
import { useAppDispatch, useAppSelector } from "../redux/hook";
import { selectChooseUser, selectMedia, setSocket, setMedia, selectUserList, setUserList, selectPeer, selectMessageList, setMessageList } from "../redux/panel";
import Center from "./center/Center";
import Left from "./left/left";
import { useEffect, useState } from "react";
import { Media } from "../service/types";
import Right from "./right/Right";
import moment from "moment";

var socket: WebSocket | null = null
var peer: RTCPeerConnection | any = null;
var lockConnection = false;
var heartCheck = {
    timeout: 10000,
    timeoutObj: null as NodeJS.Timeout | null,
    serverTimeoutObj: null as NodeJS.Timeout | null,
    num: 3,
    start: function() {
        let self = this;
        var _num = this.num
        this.timeoutObj && clearTimeout(this.timeoutObj);
        this.serverTimeoutObj && clearTimeout(this.serverTimeoutObj);
        this.timeoutObj = setTimeout(function () {
            //这里发送一个心跳，后端收到后，返回一个心跳消息，
            //onmessage拿到返回的心跳就说明连接正常
            let data = {
                type: "heatbeat",
                content: "ping",
            }

            if (socket != null && socket.readyState === 1) {
                let message = protobuf.lookup("protocol.Message")
                const messagePB = message.create(data)
                socket.send(message.encode(messagePB).finish())
            }

            self.serverTimeoutObj = setTimeout(function () {
                _num--
                if (_num <= 0) {
                    console.log("the ping num is more then 3, close socket!")
                    socket!.close();
                }
            }, self.timeout);

        }, this.timeout)
    }
}

export default function panel() {
    let reconnectTimeoutObj: NodeJS.Timeout | null= null;
    const dispatch = useAppDispatch();
    const chooseUser = useAppSelector(selectChooseUser);
    const storeMedia = useAppSelector(selectMedia);
    const userList = useAppSelector(selectUserList);
    const messageList = useAppSelector(selectMessageList);
    const [ onlineType, setOnlineType ] = useState(1);
    const [ mediaSize, setMediaSize ] = useState({ height: 400, width: 540 });
    const [ share, setShare ] = useState({ height: 540, width: 750 });
    const [ currentScreen, setCurrentScreen ] = useState({ height: 0, width: 0 });
    const [ videoCallModel, setVideoCallModel ] = useState(false);
    const [ isRecord, setIsRecord ] = useState(false);
    const [ callName, setCallName ] = useState('');
    const [ fromUserUuid, setFromUserUuid ] = useState('');

    useEffect(() => {
        connection()
    },[])

    const connection = () => {
        console.log("connect...");
        peer = new RTCPeerConnection();
        let image = document.getElementById("receiver");
        socket = new WebSocket("ws://" + Params.IP_PORT + "/socket.io?user=" + localStorage.uuid);

        socket.onopen = () => {
            heartCheck.start();
            console.log("connected");
            webrtcConnection();
            dispatch(setSocket(socket));
        }

        socket.onmessage = (message) => {
            heartCheck.start();

            let messageProto = protobuf.lookup("protocol.Message")
            let reader = new FileReader();
            reader.readAsArrayBuffer(message.data);
            reader.onload = ((event: ProgressEvent<FileReader>) => {
                let messagePB = messageProto.decode(new Uint8Array(event.target!.result as ArrayBuffer))
                console.log(messagePB)
                if (messagePB.type === "heatbeat") {
                    return;
                }

                if (messagePB.type === Constant.MESSAGE_TRANS_TYPE) {
                    dealWebRtcMessage(messagePB);
                    return;
                }

                if (chooseUser.toUser !== messagePB.from) {
                    showUnreadMessageDot(messagePB.from);
                    return;
                }

                if (messagePB.contentType === 8) {
                    let currentScreen = {
                        width: mediaSize.width,
                        height: mediaSize.height
                    }
                    setCurrentScreen(currentScreen);
                    (image as HTMLImageElement).src = messagePB.content
                    return;
                }

                if (messagePB.contentType === 9) {
                    let currentScreen = {
                        width: share.width,
                        height: share.height
                    }
                    setCurrentScreen(currentScreen);
                    (image as HTMLImageElement).src = messagePB.content
                    return;
                }

                let avatar = chooseUser.avatar
                if (messagePB.messageType === 2) {
                    avatar = Params.HOST + "/file/" + messagePB.avatar
                }

                let content = getContentByType(messagePB.contentType, messagePB.url, messagePB.content)
                let newMessageList = [
                    ...messageList,
                    {
                        author: messagePB.fromUsername,
                        avatar: avatar,
                        content: <p>{content}</p>,
                        datetime: moment().fromNow(),
                    },
                ];
                dispatch(setMessageList(newMessageList));
            })
        }

        socket.onclose = (_message) => {
            console.log("close and reconnect-->--->")
            reconnect()
        }

        socket.onerror = (_message) => {
            console.log("error----->>>>")
            reconnect()
        }
    }

    const webrtcConnection = () => {
        peer.onicecandidate = (e: any) => {
            if (e.candidate) {
                let candidate = {
                    type: 'answer_ice', 
                    iceCandidate: e.candidate
                }
                let message = {
                    content: JSON.stringify(candidate),
                    type: Constant.MESSAGE_TRANS_TYPE,
                }
                sendMessage(message);
            }
        };

        peer.ontrack = (e: any) => {
            if (e && e.streams) {
                if (onlineType === 1) {
                    let remoteVideo = document.getElementById("remoteVideoReceiver") as HTMLVideoElement;
                    remoteVideo.srcObject = e.streams[0];
                } else {
                    let remoteAudio = document.getElementById("audioPhone") as HTMLVideoElement;
                    remoteAudio.srcObject = e.streams[0];
                }
            }
        }
    }

    const dealWebRtcMessage = (messagePB: any) => {
        if (messagePB.contentType >= Constant.DIAL_MEDIA_START && messagePB.contentType <= Constant.DIAL_MEDIA_END) {
            dealMediaCall(messagePB);
            return;
        }
        const { type, sdp, iceCandidate } = JSON.parse(messagePB.content);

        if (type === "answer") {
            const answerSdp = new RTCSessionDescription({ type, sdp });
            peer.localPeer.setRemoteDescription(answerSdp)
        } else if (type === "answer_ice") {
            peer.localPeer.addIceCandidate(iceCandidate)
        } else if (type === "offer_ice") {
            peer.addIceCandidate(iceCandidate)
        } else if (type === "offer") {
            if (!checkMediaPermisssion()) {
                return;
            }
            let preview: HTMLAudioElement | HTMLVideoElement |null;
            let video = false;
            if (messagePB.contentType === Constant.VIDEO_ONLINE) {
                preview = document.getElementById("localVideoReceiver") as HTMLVideoElement;
                video = true
                setOnlineType(1)
            } else {
                preview = document.getElementById("audioPhone") as HTMLAudioElement;
                setOnlineType(2)
            }

            navigator.mediaDevices
                .getUserMedia({
                    audio: true,
                    video: video,
                }).then((stream: MediaStream) => {
                    preview!.srcObject = stream;
                    stream.getTracks().forEach((track: MediaStreamTrack) => {
                        peer.addTrack(track, stream);
                    });

                    const offerSdp = new RTCSessionDescription({ type, sdp });
                    peer.setRemoteDescription(offerSdp)
                        .then(() => {
                            peer.createAnwser().then((answer: any) => {
                                peer.setLocalDescription(answer)

                                let message = {
                                    content: JSON.stringify(answer),
                                    type: Constant.MESSAGE_TRANS_TYPE,
                                    messageType: messagePB.contentType
                                }
                                sendMessage(message)
                            })
                        });
                });
        }
    }

    const reconnect = () => {
        if (lockConnection) return;
        lockConnection = true;

        reconnectTimeoutObj && clearTimeout(reconnectTimeoutObj);
        reconnectTimeoutObj = setTimeout(() =>{
            if (socket?.readyState !== 1) {
                connection()
            }
            lockConnection = false;
        }, 10000)
    }

    const checkMediaPermisssion = () => {
        navigator.mediaDevices.getUserMedia
        if (!navigator || !navigator.mediaDevices.getUserMedia) {
            message.error("获取摄像头权限失败！")
            return false;
        }
        return true;
    } 

    const sendMessage = (message: any) => {
        let toUser = message.toUser;
        if (toUser == null) {
            toUser = chooseUser.toUser;
        }
        let data = {
            ...message,
            messageType: chooseUser.messageType, // 消息类型，1.单聊 2.群聊
            fromUsername: localStorage.username,
            from: localStorage.uuid,
            to: toUser,
        }
        let messageData = protobuf.lookup("protocol.Message")
        const messagePB = messageData.create(data)
        console.log(data);
        socket!.send(messageData.encode(messagePB).finish());
    }

    /**
     * @description get content according to file type
     * @param {file type} type 
     * @param {file address} url 
     * @returns 
     */
    const getContentByType = (type: number, url: string, content: JSX.Element) => {
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

    /**
     * @TODO type check
     * @description stop video call and screen share
     */
    const stopVideoOnline = () => {
        setIsRecord(false);

        let localVideoReciever = document.getElementById("localVideoReciever") as HTMLVideoElement;
        if (localVideoReciever && localVideoReciever.srcObject && (localVideoReciever.srcObject as MediaStream).getTracks) {
            (localVideoReciever.srcObject as MediaStream)
            .getTracks()
            .forEach((track: MediaStreamTrack) => track.stop());
        }

        let preview = document.getElementById("preview") as HTMLVideoElement;
        if (preview && preview.srcObject && (preview.srcObject as MediaStream).getTracks) {
            (preview.srcObject as MediaStream)
            .getTracks()
            .forEach((track: MediaStreamTrack) => track.stop());
        }

        let audioPhone = document.getElementById("audioPhone") as HTMLAudioElement;
        if (audioPhone && audioPhone.srcObject && (audioPhone.srcObject as MediaStream).getTracks) {
            (audioPhone.srcObject as MediaStream)
            .getTracks()
            .forEach((track: MediaStreamTrack) => track.stop());
        }
        let dataChunks = [];
        let cS = {
            width: 0, 
            height: 0
        }
        setCurrentScreen(cS);
    }

    const mediaPanelDrawerOnClose = () => {
        let media: Media = {
            ...storeMedia,
            showMediaPanel: true,
        }
        dispatch(setMedia(media))
    }

    /**
     * @description if msg which has received is not the person who are connected, metion msg not read.
     */
    const showUnreadMessageDot = (toUuid: string) => {
        for (let index in userList) {
            if (userList[index].uuid === toUuid) {
                userList[index].hasUnreadMessage = true;
                dispatch(setUserList(userList));
                break
            }
        }
    }

    /**
     * @description accept phone call, send acquire msg, show media panel
     */
    const handleOk = () => {
        setVideoCallModel(true);
        let data = {
            contentType: Constant.ACCEPT_VIDEO_ONLINE,
            type: Constant.MESSAGE_TRANS_TYPE,
            toUser: fromUserUuid
        }
        sendMessage(data);
        let media: Media = {
            ...storeMedia,
            showMediaPanel: true,
        }
        dispatch(setMedia(media))
    }

    /**
     * @description cancel phone call, send acquire msg, close media panel
     */
    const handleCancel = () => {
        let data = {
            contentType: Constant.REJECT_VIDEO_ONLINE,
            type: Constant.MESSAGE_TRANS_TYPE,
        }
        sendMessage(data);
        setVideoCallModel(false);
    }

    /**
     * @description deal different situations when media running...
     */
    const dealMediaCall = (message: any) => {
        if (message.contentType === Constant.DIAL_AUDIO_ONLINE || message.contentType === Constant.DIAL_VIDEO_ONLINE) {
            setVideoCallModel(true);
            setCallName(message.fromUsername);
            setFromUserUuid(message.from);
        }
        if (message.contentType === Constant.CANCELL_AUDIO_ONLINE || message.contentType === Constant.CANCELL_VIDEO_ONLINE) {
            setVideoCallModel(false);
            return;
        }
        if (message.contentType === Constant.REJECT_AUDIO_ONLINE || message.contentType === Constant.REJECT_VIDEO_ONLINE) {
            let media: Media= {
                ...storeMedia,
                mediaReject: true,
            }
            dispatch(setMedia(media));
            return;
        }
        if (message.contentType === Constant.ACCEPT_VIDEO_ONLINE || message.contentType === Constant.ACCEPT_AUDIO_ONLINE) {
            let media: Media= {
                ...storeMedia,
                mediaConnected: true,
            }
            dispatch(setMedia(media));
        }
    }

    return (
        <>
            <Row style={{ paddingTop: 35, borderBottom: '1px solid #f0f0f0', borderTop: '1px solid #f0f0f0' }}>
                <Col span={2} style={{ borderRight: '1px solid #f0f0f0', textAlign: 'center', borderTop: '1px solid #f0f0f0' }}>
                    <Left />
                </Col>

                <Col span={4} style={{ borderRight: '1px solid #f0f0f0', borderTop: '1px solid #f0f0f0' }}>
                    <Center />
                </Col>

                <Col offset={1} span={16} style={{ borderTop: '1px solid #f0f0f0' }}>
                    <Right
                        sendMessage={sendMessage}
                        checkMediaPermisssion={checkMediaPermisssion}
                    />
                </Col>
            </Row>

            <Drawer width='820px' forceRender={true} title="媒体面板" placement="right" onClose={mediaPanelDrawerOnClose} visible={storeMedia.showMediaPanel}>
                <Tooltip title="结束视频语音">
                    <Button
                        shape="circle"
                        onClick={stopVideoOnline}
                        style={{ marginRight: 10, float: 'right' }}
                        icon={<PoweroffOutlined style={{ color: 'red' }} />}
                    />
                </Tooltip>
                <br />
                <video id="localVideoReceiver" width="700px" height="auto" autoPlay muted controls />
                <video id="remoteVideoReceiver" width="700px" height="auto" autoPlay muted controls />

                <img id="receiver" width={currentScreen.width} height="auto" alt="" />
                <canvas id="canvas" width={currentScreen.width} height={currentScreen.height} />
                <audio id="audioPhone" autoPlay controls />
            </Drawer>

            <Modal
                title="视频电话"
                visible={videoCallModel}
                onOk={handleOk}
                onCancel={handleCancel}
                okText="接听"
                cancelText="挂断"
            >
                <p>{callName}来电</p>
            </Modal>
        </>
    )
}
