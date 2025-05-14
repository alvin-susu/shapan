import {
  AppstoreAddOutlined,
  CloseOutlined,
  CloudUploadOutlined,
  CommentOutlined,
  CopyOutlined,
  DislikeOutlined,
  LikeOutlined,
  OpenAIFilled,
  PaperClipOutlined,
  PlusOutlined,
  ProductOutlined,
  ReloadOutlined,
  ScheduleOutlined,
} from '@ant-design/icons';
import {
  Attachments,
  Bubble,
  Conversations,
  Prompts,
  Sender,
  Suggestion,
  Welcome,
  useXAgent,
  useXChat,
} from '@ant-design/x';
import { Button, Image, Popover, Space, Spin, message } from 'antd';
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



const MOCK_SESSION_LIST = [
  {
    key: '5',
    label: 'New session',
    group: 'Today',
  },
  {
    key: '4',
    label: 'What has Ant Design X upgraded?',
    group: 'Today',
  },
  {
    key: '3',
    label: 'New AGI Hybrid Interface',
    group: 'Today',
  },
  {
    key: '2',
    label: 'How to quickly install and import components?',
    group: 'Yesterday',
  },
  {
    key: '1',
    label: 'What is Ant Design X?',
    group: 'Yesterday',
  },
];
const MOCK_SUGGESTIONS = [
  { label: 'Write a report', value: 'report' },
  { label: 'Draw a picture', value: 'draw' },
  {
    label: 'Check some knowledge',
    value: 'knowledge',
    icon: <OpenAIFilled />,
    children: [
      { label: 'About React', value: 'react' },
      { label: 'About Ant Design', value: 'antd' },
    ],
  },
];
const MOCK_QUESTIONS = [
  'What has Ant Design X upgraded?',
  'What components are in Ant Design X?',
  'How to quickly install and import components?',
];
const AGENT_PLACEHOLDER = 'Generating content, please wait...';
const useCopilotStyle = createStyles(({ token, css }) => {
  return {
    copilotChat: css`
      display: flex;
      flex-direction: column;
      background: ${token.colorBgContainer};
      color: ${token.colorText};
    `,
    // chatHeader 样式
    chatHeader: css`
      height: 52px;
      box-sizing: border-box;
      border-bottom: 1px solid ${token.colorBorder};
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 10px 0 16px;
    `,
    headerTitle: css`
      font-weight: 600;
      font-size: 15px;
    `,
    headerButton: css`
      font-size: 18px;
    `,
    conversations: css`
      width: 300px;
      .ant-conversations-list {
        padding-inline-start: 0;
      }
    `,
    // chatList 样式
    chatList: css`
      overflow: auto;
      padding-block: 16px;
      flex: 1;
    `,
    chatWelcome: css`
      margin-inline: 16px;
      padding: 12px 16px;
      border-radius: 2px 12px 12px 12px;
      background: ${token.colorBgTextHover};
      margin-bottom: 16px;
    `,
    loadingMessage: css`
      background-image: linear-gradient(90deg, #ff6b23 0%, #af3cb8 31%, #53b6ff 89%);
      background-size: 100% 2px;
      background-repeat: no-repeat;
      background-position: bottom;
    `,
    // chatSend 样式
    chatSend: css`
      padding: 12px;
    `,
    sendAction: css`
      display: flex;
      align-items: center;
      margin-bottom: 12px;
      gap: 8px;
    `,
    speechButton: css`
      font-size: 18px;
      color: ${token.colorText} !important;
    `,
  };
});

const Copilot = props => {
  const { copilotOpen, setCopilotOpen } = props;
  const { styles } = useCopilotStyle();
  const attachmentsRef = useRef(null);
  const abortController = useRef(null);
  // ==================== State ====================
  const [messageHistory, setMessageHistory] = useState({});
  const [sessionList, setSessionList] = useState(MOCK_SESSION_LIST);
  const [curSession, setCurSession] = useState(sessionList[0].key);
  const [attachmentsOpen, setAttachmentsOpen] = useState(false);
  const [files, setFiles] = useState([]);
  const [inputValue, setInputValue] = useState('');
  // ==================== Runtime ====================
  const [agent] = useXAgent({
    baseURL: 'http://localhost:8001/chain/invoke',
    model: 'deepseek-ai/DeepSeek-R1-Distill-Qwen-7B',
    dangerouslyApiKey: 'Bearer sk-ravoadhrquyrkvaqsgyeufqdgphwxfheifujmaoscudjgldr',
  });
  
  const loading = agent.isRequesting();
  const { messages, onRequest, setMessages } = useXChat({
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
          console.log("chunk的类型为",typeof chunk)
          if (typeof chunk === 'string') {
            outputObj = JSON.parse(chunk);
            console.log("outputObj JSON parse is:",outputObj)
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
      console.log("content:",content)
      console.log("role:",role)
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
  const handleUserSubmit = val => {
    var _a;
    onRequest({
      stream: true,
      message: { content: val, role: 'user' },
    });
    // session title mock
    if (
      ((_a = sessionList.find(i => i.key === curSession)) === null || _a === void 0
        ? void 0
        : _a.label) === 'New session'
    ) {
      setSessionList(
        sessionList.map(i =>
          i.key !== curSession
            ? i
            : Object.assign(Object.assign({}, i), {
              label: val === null || val === void 0 ? void 0 : val.slice(0, 20),
            }),
        ),
      );
    }
  };
  const onPasteFile = (_, files) => {
    var _a;
    for (const file of files) {
      (_a = attachmentsRef.current) === null || _a === void 0 ? void 0 : _a.upload(file);
    }
    setAttachmentsOpen(true);
  };
  // ==================== Nodes ====================
  const chatHeader = (
    <div className={styles.chatHeader}>
      <div className={styles.headerTitle}>✨ AI Copilot</div>
      <Space size={0}>
        <Button
          type="text"
          icon={<PlusOutlined />}
          onClick={() => {
            var _a;
            if (messages === null || messages === void 0 ? void 0 : messages.length) {
              const timeNow = dayjs().valueOf().toString();
              (_a = abortController.current) === null || _a === void 0 ? void 0 : _a.abort();
              // The abort execution will trigger an asynchronous requestFallback, which may lead to timing issues.
              // In future versions, the sessionId capability will be added to resolve this problem.
              setTimeout(() => {
                setSessionList([
                  { key: timeNow, label: 'New session', group: 'Today' },
                  ...sessionList,
                ]);
                setCurSession(timeNow);
                setMessages([]);
              }, 100);
            } else {
              message.error('It is now a new conversation.');
            }
          }}
          className={styles.headerButton}
        />
        <Popover
          placement="bottom"
          styles={{ body: { padding: 0, maxHeight: 600 } }}
          content={
            <Conversations
              items={
                sessionList === null || sessionList === void 0
                  ? void 0
                  : sessionList.map(i =>
                    i.key === curSession
                      ? Object.assign(Object.assign({}, i), { label: `[current] ${i.label}` })
                      : i,
                  )
              }
              activeKey={curSession}
              groupable
              onActiveChange={val =>
                __awaiter(void 0, void 0, void 0, function () {
                  var _a;
                  (_a = abortController.current) === null || _a === void 0 ? void 0 : _a.abort();
                  // The abort execution will trigger an asynchronous requestFallback, which may lead to timing issues.
                  // In future versions, the sessionId capability will be added to resolve this problem.
                  setTimeout(() => {
                    setCurSession(val);
                    setMessages(
                      (messageHistory === null || messageHistory === void 0
                        ? void 0
                        : messageHistory[val]) || [],
                    );
                  }, 100);
                })
              }
              styles={{ item: { padding: '0 8px' } }}
              className={styles.conversations}
            />
          }
        >
          <Button type="text" icon={<CommentOutlined />} className={styles.headerButton} />
        </Popover>
        <Button
          type="text"
          icon={<CloseOutlined />}
          onClick={() => setCopilotOpen(false)}
          className={styles.headerButton}
        />
      </Space>
    </div>
  );

  
  const bubbleItems = messages?.map(i => {
    const msg = i.message || i;
    let renderContent;
    if (typeof msg.content === 'object' && msg.content !== null) {
      renderContent = (
        <div>
          <div><b>原文：</b>{msg.content.original}</div>
          <div><b>规则检测：</b>{msg.content.rule_check}</div>
          <div><b>情感标签：</b>{msg.content.emotion}</div>
          <div><b>简笔画提示：</b>{msg.content.img_prompt}</div>
          {msg.content.img_url && Array.isArray(msg.content.img_url) && msg.content.img_url.length > 0 && (
            <div>
              <b>图片：</b>
              <img src={msg.content.img_url[0]} alt="AI图片" style={{maxWidth: 200}} />
            </div>
          )}
        </div>
      );
    } else {
      renderContent = msg.content;
    }
    return {
      ...msg,
      content: renderContent,
      classNames: {
        content: i.status === 'loading' ? styles.loadingMessage : '',
      },
      typing: i.status === 'loading' ? { step: 5, interval: 20, suffix: <>💗</> } : false,
    };
  });

  // console.log('Bubble items for render:', bubbleItems);

  const chatList = (
    <div className={styles.chatList} >
      
      {(messages === null || messages === void 0 ? void 0 : messages.length) ? (
        /** 消息列表 */
        <Bubble.List
          style={{ height: '100%', paddingInline: 16 }}
          items={bubbleItems}
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
              loadingRender: () => (
                <Space>
                  <Spin size="small" />
                  {AGENT_PLACEHOLDER}
                </Space>
              ),
            },
            user: { placement: 'end' },
          }}
        />
      ) : (
        /** 没有消息时的 welcome */
        <>
          <Welcome
            variant="borderless"
            title="👋 Hello, I'm Ant Design X"
            description="Base on Ant Design, AGI product interface solution, create a better intelligent vision~"
            className={styles.chatWelcome}
          />

          <Prompts
            vertical
            title="I can help："
            items={MOCK_QUESTIONS.map(i => ({ key: i, description: i }))}
            onItemClick={info => {
              var _a;
              return handleUserSubmit(
                (_a = info === null || info === void 0 ? void 0 : info.data) === null ||
                  _a === void 0
                  ? void 0
                  : _a.description,
              );
            }}
            style={{
              marginInline: 16,
            }}
            styles={{
              title: { fontSize: 14 },
            }}
          />
        </>
      )}
    </div>
  );
  const sendHeader = (
    <Sender.Header
      title="Upload File"
      styles={{ content: { padding: 0 } }}
      open={attachmentsOpen}
      onOpenChange={setAttachmentsOpen}
      forceRender
    >
      <Attachments
        ref={attachmentsRef}
        beforeUpload={() => false}
        items={files}
        onChange={({ fileList }) => setFiles(fileList)}
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
    <div className={styles.chatSend}>
      <div className={styles.sendAction}>
        <Button
          icon={<ScheduleOutlined />}
          onClick={() => handleUserSubmit('What has Ant Design X upgraded?')}
        >
          Upgrades
        </Button>
        <Button
          icon={<ProductOutlined />}
          onClick={() => handleUserSubmit('What component assets are available in Ant Design X?')}
        >
          Components
        </Button>
        <Button icon={<AppstoreAddOutlined />}>More</Button>
      </div>

      {/** 输入框 */}
      <Suggestion items={MOCK_SUGGESTIONS} onSelect={itemVal => setInputValue(`[${itemVal}]:`)}>
        {({ onTrigger, onKeyDown }) => (
          <Sender
            loading={loading}
            value={inputValue}
            onChange={v => {
              onTrigger(v === '/');
              setInputValue(v);
            }}
            onSubmit={() => {
              handleUserSubmit(inputValue);
              setInputValue('');
            }}
            onCancel={() => {
              var _a;
              (_a = abortController.current) === null || _a === void 0 ? void 0 : _a.abort();
            }}
            allowSpeech
            placeholder="Ask or input / use skills"
            onKeyDown={onKeyDown}
            header={sendHeader}
            prefix={
              <Button
                type="text"
                icon={<PaperClipOutlined style={{ fontSize: 18 }} />}
                onClick={() => setAttachmentsOpen(!attachmentsOpen)}
              />
            }
            onPasteFile={onPasteFile}
            actions={(_, info) => {
              const { SendButton, LoadingButton, SpeechButton } = info.components;
              return (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <SpeechButton className={styles.speechButton} />
                  {loading ? <LoadingButton type="default" /> : <SendButton type="primary" />}
                </div>
              );
            }}
          />
        )}
      </Suggestion>
    </div>
  );
  useEffect(() => {
    // history mock
    if (messages === null || messages === void 0 ? void 0 : messages.length) {
      setMessageHistory(prev => Object.assign(Object.assign({}, prev), { [curSession]: messages }));
    }
  }, [messages,curSession]);
  useEffect(() => {
    console.log('messages:', messages);
  }, [messages]);
  return (
    <div className={styles.copilotChat} style={{ width: copilotOpen ? 400 : 0 }}>
      {/** 对话区 - header */}
      {chatHeader}

      {/** 对话区 - 消息列表 */}
      {chatList}

      {/** 对话区 - 输入框 */}
      {chatSender}
    </div>
  );
};
const useWorkareaStyle = createStyles(({ token, css }) => {
  return {
    copilotWrapper: css`
      min-width: 1000px;
      height: 100vh;
      display: flex;
    `,
    workarea: css`
      flex: 1;
      background: ${token.colorBgLayout};
      display: flex;
      flex-direction: column;
    `,
    workareaHeader: css`
      box-sizing: border-box;
      height: 52px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 48px 0 28px;
      border-bottom: 1px solid ${token.colorBorder};
    `,
    headerTitle: css`
      font-weight: 600;
      font-size: 15px;
      color: ${token.colorText};
      display: flex;
      align-items: center;
      gap: 8px;
    `,
    headerButton: css`
      background-image: linear-gradient(78deg, #8054f2 7%, #3895da 95%);
      border-radius: 12px;
      height: 24px;
      width: 93px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      cursor: pointer;
      font-size: 12px;
      font-weight: 600;
      transition: all 0.3s;
      &:hover {
        opacity: 0.8;
      }
    `,
    workareaBody: css`
      flex: 1;
      padding: 16px;
      background: ${token.colorBgContainer};
      border-radius: 16px;
      min-height: 0;
    `,
    bodyContent: css`
      overflow: auto;
      height: 100%;
      padding-right: 10px;
    `,
    bodyText: css`
      color: ${token.colorText};
      padding: 8px;
    `,
  };
});
const CopilotDemo = () => {
  const { styles: workareaStyles } = useWorkareaStyle();
  // ==================== State =================
  const [copilotOpen, setCopilotOpen] = useState(true);
  // ==================== Render =================
  return (
    <div className={workareaStyles.copilotWrapper}>
      {/** 左侧工作区 */}
      <div className={workareaStyles.workarea}>
        <div className={workareaStyles.workareaHeader}>
          <div className={workareaStyles.headerTitle}>
            <img
              src="https://mdn.alipayobjects.com/huamei_iwk9zp/afts/img/A*eco6RrQhxbMAAAAAAAAAAAAADgCCAQ/original"
              draggable={false}
              alt="logo"
              width={20}
              height={20}
            />
            Ant Design X
          </div>
          {!copilotOpen && (
            <div onClick={() => setCopilotOpen(true)} className={workareaStyles.headerButton}>
              ✨ AI Copilot
            </div>
          )}
        </div>

        <div
          className={workareaStyles.workareaBody}
          style={{ margin: copilotOpen ? 16 : '16px 48px' }}
        >
          <div className={workareaStyles.bodyContent}>
            <Image
              src="https://mdn.alipayobjects.com/huamei_iwk9zp/afts/img/A*48RLR41kwHIAAAAAAAAAAAAADgCCAQ/fmt.webp"
              preview={false}
            />
            <div className={workareaStyles.bodyText}>
              <h4>What is the RICH design paradigm?</h4>
              <div>
                RICH is an AI interface design paradigm we propose, similar to how the WIMP paradigm
                relates to graphical user interfaces.
              </div>
              <br />
              <div>
                The ACM SIGCHI 2005 (the premier conference on human-computer interaction) defined
                that the core issues of human-computer interaction can be divided into three levels:
              </div>
              <ul>
                <li>
                  Interface Paradigm Layer: Defines the design elements of human-computer
                  interaction interfaces, guiding designers to focus on core issues.
                </li>
                <li>
                  User model layer: Build an interface experience evaluation model to measure the
                  quality of the interface experience.
                </li>
                <li>
                  Software framework layer: The underlying support algorithms and data structures
                  for human-computer interfaces, which are the contents hidden behind the front-end
                  interface.
                </li>
              </ul>
              <div>
                The interface paradigm is the aspect that designers need to focus on and define the
                most when a new human-computer interaction technology is born. The interface
                paradigm defines the design elements that designers should pay attention to, and
                based on this, it is possible to determine what constitutes good design and how to
                achieve it.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/** 右侧对话区 */}
      <Copilot copilotOpen={copilotOpen} setCopilotOpen={setCopilotOpen} />
    </div>
  );
};
export default CopilotDemo;