import os
from pathlib import Path

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
from generate_img.preprocess.deepseek_chat import default_deep_seek_chat
from generate_img.process.qwen_text_to_img import qwen_text_to_img
from generate_img.postprocess.img_2_grbl import img_2_grbl
from fastapi.middleware.cors import CORSMiddleware

from fastapi import Request
from fastapi.responses import JSONResponse



# 加载配置
os.environ.update({
    "LANGSMITH_TRACING": "true",
    "LANGSMITH_ENDPOINT": "https://api.smith.langchain.com",
    "LANGSMITH_API_KEY": LANGSMITH_API_KEY,
    "OPENAI_API_KEY": DEEPSEEK_API_KEY,
    "LANGSMITH_PROJECT": PROJECT_NAME,
    "DASHSCOPE_API_KEY": DASHSCOPE_API_KEY
})

def input_adapter(input_dict):
    print(input_dict)
    
    if "messages" in input_dict and input_dict["messages"]:
        user_content = input_dict["messages"][0]["content"]
    elif "message" in input_dict and "content" in input_dict["message"]:
        user_content = input_dict["message"]["content"]
    else:
        raise ValueError("未找到用户输入内容")
    return {"请输入文本": user_content}

# 创建消息模板
messages = ChatPromptTemplate.from_messages([
    ('system', system_prompt),
    ("user", "{请输入文本}")
])

# 创建链式调用
default_deep_seek_chat_func = RunnableLambda(lambda x: default_deep_seek_chat(x))
qwen_text_to_img_func = RunnableLambda(lambda x: qwen_text_to_img(x))
img_2_grbl_func = RunnableLambda(lambda x: img_2_grbl(x))

chain = RunnableLambda(input_adapter) | messages | default_deep_seek_chat_func | qwen_text_to_img_func | img_2_grbl_func

# 初始化 FastAPI
app = FastAPI(
    title='wx graduate project',
    version='1.0',
    description='A simple API server using LangChains Runnable interfaces'
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 生产环境建议写前端实际地址，如 ["http://localhost:3000"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 添加链式路由（启用 Playground）
# add_routes(
#     app=app,
#     runnable=chain,
#     path="/chain"
# )

@app.post("/chain/invoke")
async def chain_invoke(request: Request):
    body = await request.json()
    # 如果没有 input 字段，自动包一层
    print(body)
    if "input" not in body:
        body = {"input": body}
    # 调用 chain
    result = await chain.ainvoke(body["input"])
    # result = """
    # {"content":{"original":"[What components are in Ant Design X?]  ","rule_check":"[不符合]  ","emotion":"[快乐]  ","img_prompt":"[单线条矩形框架，内部包含三个分散小圆点]","img_url":["https://dashscope-result-wlcb.oss-cn-wulanchabu.aliyuncs.com/1d/b3/20250510/11701983/317514f2-19ea-4ca3-a8f1-719a7959bdb7.png?Expires=1746960965&OSSAccessKeyId=LTAI5tQZd8AEcZX6KZV4G8qL&Signature=MkeKRwnPmV654NW7xqxnir%2FyAww%3D"]},"role":"assistant"}
    # """
    print(f"JSONResponse is {result}")

    return JSONResponse(content=result)

if __name__ == '__main__':

    uvicorn.run(
        app=app,
        host="localhost",
        port=8001
    )
