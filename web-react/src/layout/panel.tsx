import { Col, message, Row } from "antd";
import * as Params from '../common/param/Param'
import * as Constant from '../common/constant/Constant'
import {
    PoweroffOutlined,
    FileOutlined,
} from '@ant-design/icons';

import protobuf from '../proto/proto'
import { useAppDispatch, useAppSelector } from "../redux/hook";
import { selectChooseUser, setSocket } from "../redux/panel";
import Center from "./center/Center";
import Left from "./left/left";
import { useState } from "react";

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
    const [ onlineType, setOnlineType ] = useState(1);
    const [ media, setMedia ] = useState({ height: 400, width: 540 });
    const [ share, setShare ] = useState({ height: 540, width: 750 });
    const [ currentScreen, setCurrentScreen ] = useState({ height: 0, width: 0 });
    const [ videoCallModel, setVideoCallModel ] = useState(false);
    const [ callName, setCallName ] = useState('');
    const [ fromUserUuid, setFromUserUuid ] = useState('');

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



  return (
    <div>
        <Row style={{ paddingTop: 35, borderBottom: '1px solid #f0f0f0', borderTop: '1px solid #f0f0f0' }}>
            <Col span={2} style={{ borderRight: '1px solid #f0f0f0', textAlign: 'center', borderTop: '1px solid #f0f0f0' }}>
                <Left />
            </Col>

            <Col span={4} style={{ borderRight: '1px solid #f0f0f0', borderTop: '1px solid #f0f0f0' }}>
                <Center />
            </Col>

            <Col offset={1} span={16} style={{ borderTop: '1px solid #f0f0f0' }}>
                {/* <Right
                    history={this.props.history}
                    sendMessage={this.sendMessage}
                    checkMediaPermisssion={this.checkMediaPermisssion}
                /> */}
            </Col>
        </Row>
    </div>
  )
}
