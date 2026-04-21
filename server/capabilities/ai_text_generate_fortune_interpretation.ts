import axios from 'axios';
import { Logger } from '@nestjs/common';

const logger = new Logger('ai_text_generate_fortune_interpretation');

interface InputParams {
  fortune_text: string;
}

interface Output {
  response: string;
}

interface Response {
  code: number;
  data?: {
    output?: Output;
  };
  message?: string;
}

export const callCapabilities = async (input: InputParams): Promise<Response> => {
  try {
    const apiKey = 'sk-368063b63be646edac7d2fa4bceb069a';
    
    const prompt = `你是一位精通易经的民间高人，说话接地气，用大白话给人指点迷津。请对以下签文进行深度解读，要求：

1. 绝对不要使用任何星号(*)、井号(#)、markdown符号
2. 用通俗易懂的大白话，像一位有经验的老朋友在给你建议
3. 不要堆砌华丽辞藻，说人话，让人一听就懂
4. 给出实实在在的建议，不要空话套话
5. 提供具体可操作的行动步骤

请严格按照以下四个模块输出，每个模块用纯文本段落，不要加任何特殊符号：

时节呼应：分析当前时节与签文的关联，用接地气的语言描述季节感受和情感波动

卦象智慧：用大白话解读易经卦象的含义，就像给普通人讲故事一样

具体指引：针对用户当前情况，给出实实在在的建议

行动建议：提供具体可操作的行动步骤，就像朋友之间的真诚建议

签文内容：${input.fortune_text}`;

    const requestData = {
      model: 'qwen-max',
      messages: [
        {
          role: 'system',
          content: '你是一位精通易经的民间高人，说话接地气，用大白话给人指点迷津，就像邻家大爷一样亲切。'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 1500
    };

    logger.log('接口请求数据：' + JSON.stringify(requestData));
    logger.log('请求 URL: https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions');
    
    const response = await axios.post(
      'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
      requestData,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      },
    );
    
    logger.log(`接口响应状态：${response.status}`);
    logger.log('接口响应数据：' + JSON.stringify(response.data));

    if (response.data.choices && response.data.choices.length > 0) {
      const aiResponse = response.data.choices[0].message.content;
      
      return {
        code: 0,
        data: {
          output: {
            response: aiResponse
          }
        }
      };
    } else {
      return {
        code: -1,
        message: '千问模型返回结果为空'
      };
    }
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      logger.error(`Axios 错误类型：${error.code || 'UNKNOWN'}`);
      logger.error(`错误消息：${error.message}`);

      if (error.response) {
        logger.error(`HTTP 状态码：${error.response.status}`);
        logger.error(`HTTP 状态文本：${error.response.statusText}`);
        logger.error(`响应数据：${JSON.stringify(error.response.data)}`);
      }

      return {
        code: -1,
        message: `千问 API 请求失败：${error.message}`
      };
    } else {
      logger.error(`未知错误：${error}`);
      return {
        code: -1,
        message: '未知错误'
      };
    }
  }
};
