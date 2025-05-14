import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))


from pathlib import Path

import langserve
import uvicorn
from fastapi import FastAPI
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnableLambda
from langserve import add_routes
from fastapi.staticfiles import StaticFiles
from starlette.responses import HTMLResponse

from common.template import system_prompt
from config.config import LANGSMITH_API_KEY, DEEPSEEK_API_KEY, PROJECT_NAME, DASHSCOPE_API_KEY
from doc.generate_img.src.preprocess.deepseek_chat import default_deep_seek_chat
from doc.generate_img.src.process.qwen_text_to_img import qwen_text_to_img


# 加载配置
os.environ.update({
    "LANGSMITH_TRACING": "true",
    "LANGSMITH_ENDPOINT": "https://api.smith.langchain.com",
    "LANGSMITH_API_KEY": LANGSMITH_API_KEY,
    "OPENAI_API_KEY": DEEPSEEK_API_KEY,
    "LANGSMITH_PROJECT": PROJECT_NAME,
    "DASHSCOPE_API_KEY": DASHSCOPE_API_KEY
})

def get_img():
    # 创建消息模板
    messages = ChatPromptTemplate.from_messages([
        ('system', system_prompt),
        ("user", "{请输入文本}")
    ])

    # 创建链式调用
    default_deep_seek_chat_func = RunnableLambda(lambda x: default_deep_seek_chat(x))
    qwen_text_to_img_func = RunnableLambda(lambda x: qwen_text_to_img(x))
    chain = messages | default_deep_seek_chat_func | qwen_text_to_img_func

    print(chain.invoke)
