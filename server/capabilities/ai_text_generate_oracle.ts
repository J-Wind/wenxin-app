import axios from 'axios';
import { Logger } from '@nestjs/common';

const logger = new Logger('ai_text_generate_oracle');

interface InputParams {
  mood: string;
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
    
    const prompt = `你是一位精通易经与东方古典文化的隐世占卜师。请根据以下用户心境：${input.mood}，生成一段神秘东方风格的签文，要求：
1. 签号：用天干地支格式给出，如"甲子"。
2. 主签文：四句七言古诗，蕴含哲理。
3. 文化引用：引用一句易经卦辞或诗经原文，并给出白话解释。
4. 卦象：给出对应的易经卦名、卦象符号（如☰）及其含义。
整体语言保持古雅神秘，不超过 200 字。`;

    const requestData = {
      model: 'qwen-max',
      messages: [
        {
          role: 'system',
          content: '你是一位精通易经与东方古典文化的隐世占卜师，语言古雅神秘。'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.5,
      max_tokens: 1024
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
