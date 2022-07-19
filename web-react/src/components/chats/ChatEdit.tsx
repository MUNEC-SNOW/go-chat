import { Button, Form, Input, Comment } from 'antd';
import React, { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../redux/hook';
import { selectChooseUser, selectMessageList } from '../../redux/panel';
import { setUser } from '../../redux/user';
import { User } from '../../service/types';

const { TextArea } = Input;

const Editor = ({ onChange, onSubmit, submitting, value, toUser } : any) => (
    <>
        <Form.Item>
            <TextArea rows={4} onChange={onChange} value={value} id="messageArea" />
        </Form.Item>
        <Form.Item>
            <Button htmlType="submit" loading={submitting} onClick={onSubmit} type="primary" disabled={toUser === ''}>
                Send
            </Button>
        </Form.Item>
    </>
);

export default function ChatEdit(
    props: {
        appendMessage: (message: any) => void,
        appendImgToPanel: (imgData: any) => void,
        sendMessage: (message: any) => void
    }) {
    const dispatch = useAppDispatch();
    const chooseUser = useAppSelector(selectChooseUser);
    const messageList = useAppSelector(selectMessageList);
    const setUserFn = (user: User) => dispatch(setUser(user));

    const [ submitting, setSubmitting ] = useState(false);
    const [ value, setValue ] = useState('');

    const bindParse = () => {
        document.getElementById("messageArea")?.addEventListener("paste", (e: any) => {
            let data = e.clipboardData;
            if (!data.items) {
                return;
            }
            let items = data.items;
            if (null == items || items.length <= 0) {
                return;
            }

            let item = items[0]
            if (item.kind !== 'file') {
                return;
            }
            let blob = item.getAsFile()
            let reader = new FileReader()
            reader.readAsArrayBuffer(blob)

            reader.onload = ((e: any) => {
                let imgData = e.target.result

                // 上传文件必须将ArrayBuffer转换为Uint8Array
                let data = {
                    content: value,
                    contentType: 3,
                    file: new Uint8Array(imgData)
                }
                props.sendMessage(data)
                props.appendImgToPanel(imgData)
            })
        }, false)
    }

    useEffect(() => {
        bindParse()
    },[])

    const handleChange = (e:any) => {
        setValue(e.target.value);
    }

    const handleSubmit = () => {
        if (!value) {
            return;
        }
        let message = {
            content: value,
            contentType: 1
        }

        props.sendMessage(message);
        props.appendMessage(value);

        setSubmitting(false);
        setValue('');
    }
  return (
    <>
        <Comment
            content={
                <Editor
                    onChange={handleChange}
                    onSubmit={handleSubmit}
                    submitting={submitting}
                    value={value}
                    toUser={chooseUser.toUser}
                />
            }
        />
    </>
  )
}
