import {
    AppstoreAddOutlined,
    CloudUploadOutlined,
    CommentOutlined,
    CopyOutlined,
    DeleteOutlined,
    DislikeOutlined,
    EditOutlined,
    EllipsisOutlined,
    FileSearchOutlined,
    HeartOutlined,
    LikeOutlined,
    PaperClipOutlined,
    PlusOutlined,
    ProductOutlined,
    QuestionCircleOutlined,
    ReloadOutlined,
    ScheduleOutlined,
    ShareAltOutlined,
    SmileOutlined,
} from '@ant-design/icons';
import {
    Attachments,
    Bubble,
    Conversations,
    Prompts,
    Sender,
    Welcome,
    useXAgent,
    useXChat,
} from '@ant-design/x';
import { Avatar, Button, Flex, Space, Spin, message } from 'antd';
import { createStyles } from 'antd-style';
import dayjs from 'dayjs';
import React, { useEffect, useRef, useState } from 'react';

var __awaiter =
    (this && this.__awaiter) ||
    function (thisArg, _arguments, P, generator) {
        function adopt(value) {
            return value instanceof P
                ? value
                : new P(function (resolve) {
                    resolve(value);
                });
        }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) {
                try {
                    step(generator.next(value));
                } catch (e) {
                    reject(e);
                }
            }
            function rejected(value) {
                try {
                    step(generator['throw'](value));
                } catch (e) {
                    reject(e);
                }
            }
            function step(result) {
                result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
            }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };

const DEFAULT_CONVERSATIONS_ITEMS = [
    {
        key: 'default-0',
        label: 'What is Ant Design X?',
        group: 'Today',
    },
    {
        key: 'default-1',
        label: 'How to quickly install and import components?',
        group: 'Today',
    },
    {
        key: 'default-2',
        label: 'New AGI Hybrid Interface',
        group: 'Yesterday',
    },
];
const HOT_TOPICS = {
    key: '1',
    label: 'Hot Topics',
    children: [
        {
            key: '1-1',
            description: 'What has Ant Design X upgraded?',
            icon: <span style={{ color: '#f93a4a', fontWeight: 700 }}>1</span>,
        },
        {
            key: '1-2',
            description: 'New AGI Hybrid Interface',
            icon: <span style={{ color: '#ff6565', fontWeight: 700 }}>2</span>,
        },
        {
            key: '1-3',
            description: 'What components are in Ant Design X?',
            icon: <span style={{ color: '#ff8f1f', fontWeight: 700 }}>3</span>,
        },
        {
            key: '1-4',
            description: 'Come and discover the new design paradigm of the AI era.',
            icon: <span style={{ color: '#00000040', fontWeight: 700 }}>4</span>,
        },
        {
            key: '1-5',
            description: 'How to quickly install and import components?',
            icon: <span style={{ color: '#00000040', fontWeight: 700 }}>5</span>,
        },
    ],
};
const DESIGN_GUIDE = {
    key: '2',
    label: 'Design Guide',
    children: [
        {
            key: '2-1',
            icon: <HeartOutlined />,
            label: 'Intention',
            description: 'AI understands user needs and provides solutions.',
        },
        {
            key: '2-2',
            icon: <SmileOutlined />,
            label: 'Role',
            description: "AI's public persona and image",
        },
        {
            key: '2-3',
            icon: <CommentOutlined />,
            label: 'Chat',
            description: 'How AI Can Express Itself in a Way Users Understand',
        },
        {
            key: '2-4',
            icon: <PaperClipOutlined />,
            label: 'Interface',
            description: 'AI balances "chat" & "do" behaviors.',
        },
    ],
};
const SENDER_PROMPTS = [
    {
        key: '1',
        description: '我今天心情很不错！',
        icon: <ScheduleOutlined />,
    },
    {
        key: '2',
        description: '今天天气很晴朗诶，我好开心！',
        icon: <ProductOutlined />,
    }
];
const useStyle = createStyles(({ token, css }) => {
    return {
        layout: css`
      width: 100%;
      min-width: 1000px;
      height: 100vh;
      display: flex;
      background: ${token.colorBgContainer};
      font-family: AlibabaPuHuiTi, ${token.fontFamily}, sans-serif;
    `,
        // sider 样式
        sider: css`
      background: ${token.colorBgLayout}80;
      width: 280px;
      height: 100%;
      display: flex;
      flex-direction: column;
      padding: 0 12px;
      box-sizing: border-box;
    `,
        logo: css`
      display: flex;
      align-items: center;
      justify-content: start;
      padding: 0 24px;
      box-sizing: border-box;
      gap: 8px;
      margin: 24px 0;

      span {
        font-weight: bold;
        color: ${token.colorText};
        font-size: 16px;
      }
    `,
        addBtn: css`
      background: #1677ff0f;
      border: 1px solid #1677ff34;
      height: 40px;
    `,
        conversations: css`
      flex: 1;
      overflow-y: auto;
      margin-top: 12px;
      padding: 0;

      .ant-conversations-list {
        padding-inline-start: 0;
      }
    `,
        siderFooter: css`
      border-top: 1px solid ${token.colorBorderSecondary};
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    `,
        // chat list 样式
        chat: css`
      height: 100%;
      width: 100%;
      max-width: 700px;
      margin: 0 auto;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      padding: ${token.paddingLG}px;
      gap: 16px;
    `,
        chatPrompt: css`
      .ant-prompts-label {
        color: #000000e0 !important;
      }
      .ant-prompts-desc {
        color: #000000a6 !important;
        width: 100%;
      }
      .ant-prompts-icon {
        color: #000000a6 !important;
      }
    `,
        chatList: css`
      flex: 1;
      overflow: auto;
      padding-right: 10px;
    `,
        loadingMessage: css`
      background-image: linear-gradient(90deg, #ff6b23 0%, #af3cb8 31%, #53b6ff 89%);
      background-size: 100% 2px;
      background-repeat: no-repeat;
      background-position: bottom;
    `,
        placeholder: css`
      padding-top: 32px;
    `,
        // sender 样式
        sender: css`
      box-shadow: ${token.boxShadow};
      color: ${token.colorText};
    `,
        speechButton: css`
      font-size: 18px;
      color: ${token.colorText} !important;
    `,
        senderPrompt: css`
      color: ${token.colorText};
    `,
    };
});
const Independent = () => {
    const { styles } = useStyle();
    const abortController = useRef(null);
    // ==================== State ====================
    const [messageHistory, setMessageHistory] = useState({});
    const [conversations, setConversations] = useState(DEFAULT_CONVERSATIONS_ITEMS);
    const [curConversation, setCurConversation] = useState(DEFAULT_CONVERSATIONS_ITEMS[0].key);
    const [attachmentsOpen, setAttachmentsOpen] = useState(false);
    const [attachedFiles, setAttachedFiles] = useState([]);
    const [inputValue, setInputValue] = useState('');
    // ==================== Runtime ====================
    const [agent] = useXAgent({
        baseURL: 'http://localhost:8001/chain/invoke',
        model: 'deepseek-ai/DeepSeek-R1-Distill-Qwen-7B',
        dangerouslyApiKey: 'Bearer sk-ravoadhrquyrkvaqsgyeufqdgphwxfheifujmaoscudjgldr',
    });
    const loading = agent.isRequesting();
    const { onRequest, messages, setMessages } = useXChat({
        agent,
        requestFallback: (_, { error }) => {
            if (error.name === 'AbortError') {
                return {
                    content: 'Request is aborted',
                    role: 'assistant',
                };
            }
            return {
                content: 'Request failed, please try again!',
                role: 'assistant',
            };
        },
        transformMessage: info => {
            const { originMessage, chunk } = info || {};
            let content = '';
            let role = 'assistant';
            try {
                if (chunk) {
                    let outputObj;
                    if (typeof chunk === 'string') {
                        outputObj = JSON.parse(chunk);
                    } else {
                        outputObj = chunk;
                    }
                    if (outputObj.content && typeof outputObj.content === 'object') {
                        content = outputObj.content;
                    } else {
                        content = outputObj.content || '';
                    }
                    role = outputObj.role || 'assistant';
                } else if (originMessage) {
                    if (originMessage.content !== undefined) {
                        content = originMessage.content;
                        role = originMessage.role || 'user';
                    } else if (originMessage.message && originMessage.message.content !== undefined) {
                        content = originMessage.message.content;
                        role = originMessage.message.role || 'assistant';
                    }
                }
            } catch (error) {
                console.error(error);
            }
            return {
                content,
                role
            };
        },
        resolveAbortController: controller => {
            abortController.current = controller;
        },
    });
    // ==================== Event ====================
    const onSubmit = val => {
        if (!val) return;
        if (loading) {
            message.error('Request is in progress, please wait for the request to complete.');
            return;
        }
        onRequest({
            stream: true,
            message: { role: 'user', content: val },
        });
    };
    // ==================== Nodes ====================
    const chatSider = (
        <div className={styles.sider}>
            {/* 🌟 Logo */}
            <div className={styles.logo}>
                <img
                    src="https://mdn.alipayobjects.com/huamei_iwk9zp/afts/img/A*eco6RrQhxbMAAAAAAAAAAAAADgCCAQ/original"
                    draggable={false}
                    alt="logo"
                    width={24}
                    height={24}
                />
                <span>Ant Design X</span>
            </div>

            {/* 🌟 添加会话 */}
            <Button
                onClick={() => {
                    const now = dayjs().valueOf().toString();
                    setConversations([
                        {
                            key: now,
                            label: `New Conversation ${conversations.length + 1}`,
                            group: 'Today',
                        },
                        ...conversations,
                    ]);
                    setCurConversation(now);
                    setMessages([]);
                }}
                type="link"
                className={styles.addBtn}
                icon={<PlusOutlined />}
            >
                New Conversation
            </Button>

            {/* 🌟 会话管理 */}
            <Conversations
                items={conversations}
                className={styles.conversations}
                activeKey={curConversation}
                onActiveChange={val =>
                    __awaiter(void 0, void 0, void 0, function* () {
                        var _a;
                        (_a = abortController.current) === null || _a === void 0 ? void 0 : _a.abort();
                        // The abort execution will trigger an asynchronous requestFallback, which may lead to timing issues.
                        // In future versions, the sessionId capability will be added to resolve this problem.
                        setTimeout(() => {
                            setCurConversation(val);
                            setMessages(
                                (messageHistory === null || messageHistory === void 0
                                    ? void 0
                                    : messageHistory[val]) || [],
                            );
                        }, 100);
                    })
                }
                groupable
                styles={{ item: { padding: '0 8px' } }}
                menu={conversation => ({
                    items: [
                        {
                            label: 'Rename',
                            key: 'rename',
                            icon: <EditOutlined />,
                        },
                        {
                            label: 'Delete',
                            key: 'delete',
                            icon: <DeleteOutlined />,
                            danger: true,
                            onClick: () => {
                                var _a;
                                const newList = conversations.filter(item => item.key !== conversation.key);
                                const newKey =
                                    (_a = newList === null || newList === void 0 ? void 0 : newList[0]) === null ||
                                        _a === void 0
                                        ? void 0
                                        : _a.key;
                                setConversations(newList);
                                // The delete operation modifies curConversation and triggers onActiveChange, so it needs to be executed with a delay to ensure it overrides correctly at the end.
                                // This feature will be fixed in a future version.
                                setTimeout(() => {
                                    if (conversation.key === curConversation) {
                                        setCurConversation(newKey);
                                        setMessages(
                                            (messageHistory === null || messageHistory === void 0
                                                ? void 0
                                                : messageHistory[newKey]) || [],
                                        );
                                    }
                                }, 200);
                            },
                        },
                    ],
                })}
            />

            <div className={styles.siderFooter}>
                <Avatar size={24} />
                <Button type="text" icon={<QuestionCircleOutlined />} />
            </div>
        </div>
    );
    const chatList = (
        <div className={styles.chatList}>
            {(messages === null || messages === void 0 ? void 0 : messages.length) ? (
                /* 🌟 消息列表 */
                <Bubble.List
                    items={
                        messages.map(i => {
                            const msg = i.message;
                            let imgNode = null;
                            let textNode = '';
                            // 判断 content 是否为对象且有 img_url
                            if (msg.content && typeof msg.content === 'object') {
                                textNode = `
                                    规则检测：${msg.content.rule_check || ''}
                                    情感标签：${msg.content.emotion || ''}
                                    简笔画提示：${msg.content.img_prompt || ''}
                                    ${msg.content.reply || ''}
                                `.trim();
                                if (Array.isArray(msg.content.img_url) && msg.content.img_url.length > 0) {
                                    imgNode = (
                                        <img
                                            src={msg.content.img_url[0]}
                                            alt="AI图片"
                                            style={{ maxWidth: 200, display: 'block', marginTop: 8 }}
                                        />
                                    );
                                }
                            } else {
                                textNode = msg.content;
                            }
                            return {
                                ...msg,
                                content: (
                                    <div>
                                        <div style={{ whiteSpace: 'pre-line' }}>{textNode}</div>
                                        {imgNode}
                                    </div>
                                ),
                                classNames: {
                                    content: i.status === 'loading' ? styles.loadingMessage : '',
                                },
                                typing: i.status === 'loading' ? { step: 5, interval: 20, suffix: <>💗</> } : false,
                            };
                        })
                    }
                    style={{ height: '100%' }}
                    roles={{
                        assistant: {
                            placement: 'start',
                            footer: (
                                <div style={{ display: 'flex' }}>
                                    <Button type="text" size="small" icon={<ReloadOutlined />} />
                                    <Button type="text" size="small" icon={<CopyOutlined />} />
                                    <Button type="text" size="small" icon={<LikeOutlined />} />
                                    <Button type="text" size="small" icon={<DislikeOutlined />} />
                                </div>
                            ),
                            loadingRender: () => <Spin size="small" />,
                        },
                        user: { placement: 'end' },
                    }}
                />
            ) : (
                <Space direction="vertical" size={16} className={styles.placeholder}>
                    <Welcome
                        variant="borderless"
                        icon="https://mdn.alipayobjects.com/huamei_iwk9zp/afts/img/A*s5sNRo5LjfQAAAAAAAAAAAAADgCCAQ/fmt.webp"
                        title="Hello, I'm Ant Design X"
                        description="Base on Ant Design, AGI product interface solution, create a better intelligent vision~"
                        extra={
                            <Space>
                                <Button icon={<ShareAltOutlined />} />
                                <Button icon={<EllipsisOutlined />} />
                            </Space>
                        }
                    />
                    <Flex gap={16}>
                        <Prompts
                            items={[HOT_TOPICS]}
                            styles={{
                                list: { height: '100%' },
                                item: {
                                    flex: 1,
                                    backgroundImage: 'linear-gradient(123deg, #e5f4ff 0%, #efe7ff 100%)',
                                    borderRadius: 12,
                                    border: 'none',
                                },
                                subItem: { padding: 0, background: 'transparent' },
                            }}
                            onItemClick={info => {
                                onSubmit(info.data.description);
                            }}
                            className={styles.chatPrompt}
                        />

                        <Prompts
                            items={[DESIGN_GUIDE]}
                            styles={{
                                item: {
                                    flex: 1,
                                    backgroundImage: 'linear-gradient(123deg, #e5f4ff 0%, #efe7ff 100%)',
                                    borderRadius: 12,
                                    border: 'none',
                                },
                                subItem: { background: '#ffffffa6' },
                            }}
                            onItemClick={info => {
                                onSubmit(info.data.description);
                            }}
                            className={styles.chatPrompt}
                        />
                    </Flex>
                </Space>
            )}
        </div>
    );
    const senderHeader = (
        <Sender.Header
            title="Upload File"
            open={attachmentsOpen}
            onOpenChange={setAttachmentsOpen}
            styles={{ content: { padding: 0 } }}
        >
            <Attachments
                beforeUpload={() => false}
                items={attachedFiles}
                onChange={info => setAttachedFiles(info.fileList)}
                placeholder={type =>
                    type === 'drop'
                        ? { title: 'Drop file here' }
                        : {
                            icon: <CloudUploadOutlined />,
                            title: 'Upload files',
                            description: 'Click or drag files to this area to upload',
                        }
                }
            />
        </Sender.Header>
    );
    const chatSender = (
        <>
            {/* 🌟 提示词 */}
            <Prompts
                items={SENDER_PROMPTS}
                onItemClick={info => {
                    onSubmit(info.data.description);
                }}
                styles={{ item: { padding: '6px 12px' } }}
                className={styles.senderPrompt}
            />
            {/* 🌟 输入框 */}
            <Sender
                value={inputValue}
                header={senderHeader}
                onSubmit={() => {
                    onSubmit(inputValue);
                    setInputValue('');
                }}
                onChange={setInputValue}
                onCancel={() => {
                    var _a;
                    (_a = abortController.current) === null || _a === void 0 ? void 0 : _a.abort();
                }}
                prefix={
                    <Button
                        type="text"
                        icon={<PaperClipOutlined style={{ fontSize: 18 }} />}
                        onClick={() => setAttachmentsOpen(!attachmentsOpen)}
                    />
                }
                loading={loading}
                className={styles.sender}
                allowSpeech
                actions={(_, info) => {
                    const { SendButton, LoadingButton, SpeechButton } = info.components;
                    return (
                        <Flex gap={4}>
                            <SpeechButton className={styles.speechButton} />
                            {loading ? <LoadingButton type="default" /> : <SendButton type="primary" />}
                        </Flex>
                    );
                }}
                placeholder="Ask or input / use skills"
            />
        </>
    );
    useEffect(() => {
        // history mock
        if (messages === null || messages === void 0 ? void 0 : messages.length) {
            setMessageHistory(prev =>
                Object.assign(Object.assign({}, prev), { [curConversation]: messages }),
            );
        }
    }, [messages]);
    // ==================== Render =================
    return (
        <div className={styles.layout}>
            {chatSider}

            <div className={styles.chat}>
                {chatList}
                {chatSender}
            </div>
        </div>
    );
};
export default Independent;