from typing import Dict

from openai import OpenAI

from common.template import system_prompt,conversion_template
from config.config import DEEPSEEK_BASE_URL, DEEPSEEK_API_KEY


def default_deep_seek_chat(text: Dict) -> Dict:
    human_message = text.messages[1].content
    content = conversation_client(system_prompt, human_message)
    responses = content.split("\n")
    original = responses[0].split(":")[-1]
    rule_check = responses[1].split(":")[-1]
    emotion = responses[2].split(":")[-1]
    img_prompt = responses[3].split(":")[-1]

    reply = conversation_client(conversion_template, human_message)

    result =  {
        'original': original,
        'rule_check': rule_check,
        'emotion': emotion,
        'img_prompt': img_prompt,
        'reply': reply,
    }
    print(f"default_deep_seek_chat response is \n {result}")
    return result



def conversation_client(system_prompt: str, human_message:str) -> str:
        client = OpenAI(api_key=DEEPSEEK_API_KEY, base_url=DEEPSEEK_BASE_URL)
        response = client.chat.completions.create(
                model="deepseek-chat",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": human_message},
                ],
                stream=False
            )
        return response.choices[0].message.content
    
