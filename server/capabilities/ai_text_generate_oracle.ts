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
    
    const prompt = `你是一位精通易经与东方古典文化的隐世占卜师。请根据以下用户心境：${input.mood}，生成一段签文。

严格按照以下格式输出，不要添加任何额外说明：

【XX签】四句七言古诗（每句七个字，共四句，蕴含哲理）

【易经引】《易经·XX卦》："卦辞原文。"白话解：用通俗易懂的语言解释卦辞含义。

卦象：卦名（卦象符号）

要求：
1. 签号用天干地支格式，如"甲子"、"乙巳"等
2. 古诗要有意境，不要直白
3. 易经引用要准确
4. 白话解释要通俗易懂
5. 整体不超过150字`;

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
