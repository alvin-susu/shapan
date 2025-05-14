from http import HTTPStatus
from typing import Dict
from urllib.parse import urlparse, unquote
from pathlib import PurePosixPath
import requests
from dashscope import ImageSynthesis
import os

from config.config import DASHSCOPE_API_KEY, IMG_SAVE_DIR


def qwen_text_to_img(text: Dict):
    prompt =  text['img_prompt'] + ",全图连贯无断笔"
    print("qwen generate img prompt is{}".format(prompt))

    print('----sync call, please wait a moment----')
    rsp = ImageSynthesis.call(api_key=DASHSCOPE_API_KEY,
                              model="wanx2.1-t2i-plus",
                              prompt=prompt,
                              n=1,
                              size='1024*1024',
                              prompt_extend=False,
                              watermark=False)
    print('response: %s' % rsp)
    if rsp.status_code == HTTPStatus.OK:
        # 在当前目录下保存图片
        img_urls = []
        for result in rsp.output.results:
            file_name = PurePosixPath(unquote(urlparse(result.url).path)).parts[-1]

            img_path = os.path.join(IMG_SAVE_DIR, file_name)
            print('img_path: {}'.format(img_path))
            with open(img_path, 'wb+') as f:
                f.write(requests.get(result.url).content)
            img_urls.append(result.url)
            text['img_path'] = img_path
            text['img_url'] = img_urls
        return text
    else:
        print('sync_call Failed, status_code: %s, code: %s, message: %s' %
              (rsp.status_code, rsp.code, rsp.message))
        return {"error": "Image generation failed"}
    
