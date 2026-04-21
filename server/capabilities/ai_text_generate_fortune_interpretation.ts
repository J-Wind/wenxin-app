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
    
    const prompt = `你是一位精通易经与东方古典文化的隐世占卜师，擅长深度解读签文。请对以下签文进行深度解读，严格按照以下四个模块格式输出：

1. 时节呼应：分析当前时节与签文的关联，反映用户内心的季节感受和情感波动；
2. 卦象智慧：解读易经卦象的深层含义和智慧启示；
3. 具体指引：针对用户当前具体情况，给出具体的关注和调整方向；
4. 行动建议：提供具体的行动建议和心态调整方向。

每个模块用清晰的标题标识，内容要个性化、有深度。

签文内容：${input.fortune_text}`;

    const requestData = {
      model: 'qwen-max',
      messages: [
        {
          role: 'system',
          content: '你是一位精通易经与东方古典文化的隐世占卜师，擅长深度解读签文。'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
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
