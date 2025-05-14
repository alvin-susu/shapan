import unittest

import uvicorn
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnableLambda

from common.template import system_prompt
from config.config import BASE_DIR, IMG_SAVE_DIR
from src.preprocess.deepseek_chat import default_deep_seek_chat
from src.process.qwen_text_to_img import qwen_text_to_img


class TestFileMethod(unittest.TestCase):
    def test_split(self):
        text = "规则检测：符合\n情感标签：生气\n简笔画提示：锯齿状线条勾勒的茶杯碎片，放射状短线表现飞溅液体，颤抖的波浪线组成人形轮廓，粗黑点象征怒视的眼睛，所有元素间保留大面积留白"
        text = text.split("\n")
        print(text)

    def test_text_2_deep_seek_chat(self):
        messages = ChatPromptTemplate.from_messages([
            ('system', system_prompt),
            ('user', "{input}")
        ])
        default_deep_seek_chat_func = RunnableLambda(lambda x: default_deep_seek_chat(x))
        qwen_text_to_img_func = RunnableLambda(lambda x: qwen_text_to_img(x))
        # 测试 1：仅测试 messages 和 default_deep_seek_chat
        test_chain_1 = messages | default_deep_seek_chat_func | qwen_text_to_img_func
        print(test_chain_1.invoke({"input": "老师 我有个问题 就是我跨行的话 之前的工作经验还需要写么"}))

    def test_text_2_qwen_text_to_img(self):
        #     return {
        #         'original':responses[0],
        #         'rule_check': responses[1],
        #         'emotion': responses[2],
        #         'img_prompt': responses[3],
        #     }
        messages = ChatPromptTemplate.from_messages([
            ('system', system_prompt),
            ('user', "{input}")
        ])

        input = {
            'original':"老师 我有个问题 就是我跨行的话 之前的工作经验还需要写么",
            'rule_check':"不符合",
            'emotion': "开心",
            'img_prompt':"跨栏运动员跃过断裂时间轴，简历纸飞机穿越云层，放大镜聚焦重叠时间节点，虚线路径连接不同职业图标"
        }

        qwen_text_to_img_func = RunnableLambda(lambda x: qwen_text_to_img(x))

        test_chain_2 = dict | qwen_text_to_img_func

        test_chain_2.invoke(input)

    def test_base_dir(self):
        print(IMG_SAVE_DIR)


    def test_api(self):
        from fastapi import FastAPI
        app = FastAPI()

        @app.get("/test")
        def test():
            return {"status": "ok"}

        if __name__ == '__main__':
            uvicorn.run(app, host='0.0.0.0', port=8888)