import React, { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../redux/hook';
import { selectChooseUser, selectPeer, selectSocket, setMedia, setPeer } from '../../redux/panel';
import { Media, Peer } from '../../service/types';
import * as Constant from '../../common/constant/Constant';
import { Button, Drawer, Tooltip } from 'antd';
import {
    PhoneOutlined,
    PoweroffOutlined
} from '@ant-design/icons';

export default function ChatAudioOnline(props: any) {
    const dispatch = useAppDispatch();
    const chooseUser = useAppSelector(selectChooseUser);
    const socket = useAppSelector(selectSocket);
    const peer = useAppSelector(selectPeer);
    const setMediaFn = (media: Media) => dispatch(setMedia(media));
    const setPeerFn = (peer: Peer) => dispatch(setPeer(peer));

    let localPeer: RTCPeerConnection | null = null;
    const [ mediaPanelDrawerVisible, setMediaDrawerVisible ] = useState(false);

    useEffect(() => {
        localPeer = new RTCPeerConnection();
        let pee: Peer = {
            ...peer,
            localPeer: localPeer
        }
        setPeerFn(pee);
    }, [])

    const startAudioOnline = () => {
        if (props.checkMediaPermisssion()) {
            return;
        }

        webrtcConnection();
        navigator.mediaDevices
            .getUserMedia({
                audio: true,
                video: false,
            }).then((stream: MediaStream) => {
                stream.getTracks().forEach((track: MediaStreamTrack) => {
                    localPeer!.addTrack(track, stream);
                });

                localPeer!.createOffer()
                    .then(offer => {
                        localPeer!.setLocalDescription(offer);
                        let data = {
                            contentType: Constant.AUDIO_ONLINE,  // 消息内容类型
                            content: JSON.stringify(offer),
                            type: Constant.MESSAGE_TRANS_TYPE,   // 消息传输类型
                        }
                        props.sendMessage(data);
                    });
            });
        setMediaDrawerVisible(true);
    }

    const webrtcConnection = () => {
        localPeer!.onicecandidate = (e) => {
            if (e.candidate) {
                let candidate = {
                    type: 'offer_ice',
                    iceCandidate: e.candidate
                }
                let message = {
                    content: JSON.stringify(candidate),
                    type: Constant.MESSAGE_TRANS_TYPE,
                }
                props.sendMessage(message);
            }
        };

        localPeer!.ontrack = (e) => {
            if (e && e.streams) {
                let remoteAudio = document.getElementById("remoteAudioPhone") as HTMLAudioElement;
                remoteAudio.srcObject = e.streams[0];
            }
        };
    }

    const stopAudioOnline = () => {
        let audioPhone = document.getElementById("remoteAudioPhone") as HTMLAudioElement;
        if (audioPhone && audioPhone.srcObject && (audioPhone.srcObject as MediaStream).getTracks()) {
            (audioPhone.srcObject as MediaStream).getTracks().forEach((track) => track.stop());
        }
    }

    const mediaPanelDrawerOnClose = () => {
        setMediaDrawerVisible(false)
    }

  return (
    <>
        <Tooltip title="语音聊天">
            <Button
                shape="circle"
                onClick={startAudioOnline}
                style={{ marginRight: 10 }}
                icon={<PhoneOutlined />}
                disabled={chooseUser.toUser === ''}
            />
        </Tooltip>

        <Drawer width='420px'
            forceRender={true}
            title="媒体面板"
            placement="right"
            onClose={mediaPanelDrawerOnClose}
            visible={mediaPanelDrawerVisible}
        >
            <Tooltip title="结束视频语音">
                <Button
                    shape="circle"
                    onClick={stopAudioOnline}
                    style={{ marginRight: 10, float: 'right' }}
                    icon={<PoweroffOutlined style={{ color: 'red' }} />}
                />
            </Tooltip>
            <br />

            <audio id="remoteAudioPhone" autoPlay controls />
        </Drawer>
    </>
  )
}
