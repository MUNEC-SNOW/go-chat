import { Button, Tag, Tooltip } from 'antd';
import {
  SyncOutlined,
  UngroupOutlined
} from '@ant-design/icons';
import moment from 'moment';
import ChatAudio from '../../components/chats/ChatAudio';
import ChatEdit from '../../components/chats/ChatEdit';
import { useAppDispatch, useAppSelector } from '../../redux/hook'
import { selectChooseUser, selectMedia, selectMessageList, selectSocket, setMedia, setMessageList } from '../../redux/panel';
import { selectUser } from '../../redux/user'
import { comment, Media } from '../../service/types';
import ChatDetails from '../../components/chats/ChatDetails';

export default function Right(props: {sendMessage: any, checkMediaPermisssion: any}) {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const media = useAppSelector(selectMedia);
  const chooseUser = useAppSelector(selectChooseUser);
  const messageList = useAppSelector(selectMessageList);
  const socket = useAppSelector(selectSocket);

  const setMsgListFn = (data: comment[]) => dispatch(setMessageList(data));
  const setMediaFn = (data: Media) => dispatch(setMedia(data));
    
  const appendMessage = (content: JSX.Element) => {
    let msgList: comment[] = [
      ...messageList,
      {
        author: localStorage.username,
        avatar: user.avatar,
        content: <p>{content}</p>,
        datetime: moment().fromNow(),
      }
    ];
    setMsgListFn(msgList);
  }

  const appendImgToPanel = (imgData: any) => {
    let binary = '';
    let bytes = new Uint8Array(imgData);
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);      
    }
    let base64String = `data:image/jpeg;base64,${window.btoa(binary)}`;
    appendMessage(<img src={base64String} alt="" width="150px" />);
  }

  const showMediaPanel = () => {
    let md: Media = {
      ...media,
      showMediaPanel: true
    }
    setMediaFn(media);
  }

  return (
    <div style={{
      height: document.body.scrollHeight - 80,
      overflow: 'hidden',
      }}
    >
      <ChatDetails appendMessage={appendMessage} />
      <br />
      {/* <ChatFile
          history={this.props.history}
          appendMessage={this.appendMessage}
          appendImgToPanel={this.appendImgToPanel}
          sendMessage={this.props.sendMessage}
      />  */}
      <ChatAudio
          appendMessage={appendMessage}
          sendMessage={props.sendMessage}
      />

      {/* <ChatVideo
          history={this.props.history}
          appendMessage={this.appendMessage}
          sendMessage={this.props.sendMessage}
          checkMediaPermisssion={this.props.checkMediaPermisssion}
      />

      <ChatShareScreen
          history={this.props.history}
          sendMessage={this.props.sendMessage}
          checkMediaPermisssion={this.props.checkMediaPermisssion}
      />

      <ChatAudioOline
          history={this.props.history}
          sendMessage={this.props.sendMessage}
          checkMediaPermisssion={this.props.checkMediaPermisssion}
      />

      <ChatVideoOline
          history={this.props.history}
          sendMessage={this.props.sendMessage}
          checkMediaPermisssion={this.props.checkMediaPermisssion}
    /> */}

      <Tooltip title="显示视频面板">
          <Button
              shape="circle"
              onClick={showMediaPanel}
              style={{ marginRight: 10 }}
              icon={<UngroupOutlined />}
          />
      </Tooltip>

      <Tag icon={<SyncOutlined spin />} color="processing" hidden={!media.isRecord}>
          录制中
      </Tag> 

      <ChatEdit
          appendMessage={appendMessage}
          appendImgToPanel={appendImgToPanel}
          sendMessage={props.sendMessage}
      />

  </div>
  )
}
