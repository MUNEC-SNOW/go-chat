
import { Button, message, Tooltip } from 'antd';
import Recorder from 'js-audio-recorder';
import { useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../redux/hook';
import { selectChooseUser, selectSocket, setMedia } from '../../redux/panel';
import {
    AudioOutlined,
} from '@ant-design/icons';
import { Media } from '../../service/types';
import { isNonNullExpression } from 'typescript';

export default function ChatAudio(props: {
    appendMessage: (content: JSX.Element) => void,  
    sendMessage: (message: any) => void,
}) {
    const dispatch = useAppDispatch();
    const chooseUser = useAppSelector(selectChooseUser);
    const socket = useAppSelector(selectSocket);
    const setMediaFn = (data: Media) => dispatch(setMedia(data));

    const [ audioRecorder, setAudioRecorder ] = useState<Recorder | null>();
    const [ audioPermission, setAudioPermission ] = useState(true);

    const startAudio = () => {
        let media: Media = {
            isRecord: true,
        }
        setMediaFn(media);
        setAudioRecorder(new Recorder());
        setAudioPermission(true);
        audioRecorder!
            .start()
            .then(() => {
                console.log('start audio...');
            }, (err) => {
                setAudioPermission(false);
                message.error("get audio permission failed")
            })
    }

    const stopAudio = () => {
        const media: Media = {
            isRecord: false,
        }
        setMedia(media);
        if (!audioPermission) {
            return;
        }
        if (audioRecorder != null || audioRecorder != undefined) {
            let blob: Blob = audioRecorder.getWAVBlob();
            audioRecorder.stop();
            audioRecorder.destroy()
                .then(() => {
                    setAudioRecorder(null);
                })
            setAudioRecorder(null);
            const reader = new FileReader();
            reader.readAsArrayBuffer(blob);
            reader.onload = ((e) => {
                const imgData: ArrayBuffer = e.target?.result as ArrayBuffer;
                let data = {
                    // @TODO type check
                    content: isNonNullExpression,
                    contentType: 3,
                    fileSuffix: "wav",
                    file: new Uint8Array(imgData)
                }
                props.sendMessage(data);
            })
            props.appendMessage(<audio src={window.URL.createObjectURL(blob)} controls autoPlay={false} preload="auto" />);
        }  
    }

    return (
        <>
            <Tooltip title="发送语音">
                <Button
                    shape="circle"
                    onMouseDown={startAudio}
                    onMouseUp={stopAudio}
                    onTouchStart={startAudio}
                    onTouchEnd={stopAudio}
                    style={{ marginRight: 10 }}
                    icon={<AudioOutlined />}
                    disabled={chooseUser.toUser === ''}
                />
            </Tooltip>
        </>
    )
}
