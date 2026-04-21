import axios from 'axios';
import { Logger } from '@nestjs/common';

const logger = new Logger('ai_image_generate_mysterious_oriental');

interface InputParams {
  fortune_text: string;
  image_ratio?: string;
}

interface Output {
  images: string[];
}

interface Response {
  code: number;
  data?: {
    output?: Output;
  };
  message?: string;
}

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export const callCapabilities = async (input: InputParams): Promise<Response> => {
  try {
    const apiKey = 'sk-368063b63be646edac7d2fa4bceb069a';
    
    const prompt = `中国水墨画风格，${input.fortune_text}。画面要求：传统中国水墨画技法，淡雅色调，留白意境，山水花鸟元素，文人画风格，宣纸质感，墨色晕染效果，古朴典雅，富有文化底蕴。不要任何文字出现在画面中。`;
    
    const sizeMap: Record<string, string> = {
      '16:9': '1280*720',
      '3:2': '1200*800',
      '4:3': '1024*768',
      '1:1': '1024*1024',
      '2:3': '768*1152',
      '9:16': '720*1280'
    };
    
    const size = sizeMap[input.image_ratio || '1:1'] || '1024*1024';

    const createTaskData = {
      model: 'wanx-v1',
      input: {
        prompt: prompt
      },
      parameters: {
        size: size,
        style: '<auto>',
        n: 1
      }
    };

    logger.log('创建图片生成任务，请求数据：' + JSON.stringify(createTaskData));
    logger.log('请求 URL: https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis');
    
    const createResponse = await axios.post(
      'https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis',
      createTaskData,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'X-DashScope-Async': 'enable'
        },
      },
    );
    
    logger.log(`任务创建响应状态：${createResponse.status}`);
    logger.log('任务创建响应数据：' + JSON.stringify(createResponse.data));

    if (!createResponse.data.output || !createResponse.data.output.task_id) {
      return {
        code: -1,
        message: '创建图片生成任务失败'
      };
    }

    const taskId = createResponse.data.output.task_id;
    logger.log(`任务创建成功，task_id: ${taskId}`);

    const queryUrl = `https://dashscope.aliyuncs.com/api/v1/tasks/${taskId}`;
    logger.log(`开始轮询任务状态，查询 URL: ${queryUrl}`);

    const maxRetries = 60;
    const retryInterval = 2000;

    for (let i = 0; i < maxRetries; i++) {
      await sleep(retryInterval);

      const queryResponse = await axios.get(
        queryUrl,
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      logger.log(`第${i + 1}次轮询，任务状态：${queryResponse.data.output?.task_status}`);

      const taskStatus = queryResponse.data.output?.task_status;

      if (taskStatus === 'SUCCEEDED') {
        logger.log('任务执行成功');
        if (queryResponse.data.output?.results && queryResponse.data.output.results.length > 0) {
          const images = queryResponse.data.output.results.map((result: any) => result.url);
          
          return {
            code: 0,
            data: {
              output: {
                images: images
              }
            }
          };
        } else {
          return {
            code: -1,
            message: '任务成功但未返回图片结果'
          };
        }
      } else if (taskStatus === 'FAILED') {
        logger.error('任务执行失败');
        return {
          code: -1,
          message: queryResponse.data.output?.message || '图片生成任务失败'
        };
      } else if (taskStatus === 'PENDING' || taskStatus === 'RUNNING') {
        logger.log(`任务仍在处理中，状态：${taskStatus}`);
        continue;
      } else {
        logger.warn(`未知任务状态：${taskStatus}`);
      }
    }

    logger.error('轮询超时');
    return {
      code: -1,
      message: '图片生成超时，请稍后重试'
    };

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
