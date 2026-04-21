import { Injectable } from '@nestjs/common';
import { callCapabilities } from '@server/capabilities/ai_text_generate_oracle';

@Injectable()
export class FortuneTextService {
  async generateFortune(mood: string): Promise<any> {
    try {
      // 调用AI签文生成Capability
      const result = await callCapabilities({ mood });
      
      if (result.code === 0 && result.data?.output?.response) {
        const aiResponse = result.data.output.response;
        
        // 解析AI返回的签文内容
        const parsedFortune = this.parseFortuneResponse(aiResponse);
        
        return {
          success: true,
          ...parsedFortune,
          rawResponse: aiResponse
        };
      } else {
        // 如果AI调用失败，返回默认签文
        return this.getDefaultFortune(mood);
      }
    } catch (error) {
      // 如果出现异常，返回默认签文
      return this.getDefaultFortune(mood);
    }
  }

  private parseFortuneResponse(response: string): any {
    const lines = response.split('\n').filter(line => line.trim());
    
    let number = '上上签';
    const numberMatch = response.match(/【签号】\s*([^\n【]+)/);
    if (numberMatch && numberMatch[1]) {
      number = numberMatch[1].trim();
    }

    let fortuneType = '上上签';
    const fortuneTypeMatch = response.match(/【签文类型】\s*([^\n【]+)/);
    if (fortuneTypeMatch && fortuneTypeMatch[1]) {
      fortuneType = fortuneTypeMatch[1].trim();
    }

    let mainText = '花开富贵，心想事成。贵人相助，事业通达。';
    const mainTextMatch = response.match(/【主签文】\s*([^【]+)/);
    if (mainTextMatch && mainTextMatch[1]) {
      mainText = mainTextMatch[1].trim();
    }

    let culturalReference = '《易经》有云："天行健，君子以自强不息。"';
    const referenceMatch = response.match(/【文化引用】\s*([^【]+)/);
    if (referenceMatch && referenceMatch[1]) {
      culturalReference = referenceMatch[1].trim();
    }

    let hexagram = '乾卦';
    let hexagramSymbol = '☰☰';
    const hexagramMatch = response.match(/【卦象】\s*([^\n【]+)/);
    if (hexagramMatch && hexagramMatch[1]) {
      const hexagramFull = hexagramMatch[1].trim();
      const symbolMatch = hexagramFull.match(/([☰☷☳☴☵☲☶☱]+)/);
      if (symbolMatch) {
        hexagramSymbol = symbolMatch[1];
        hexagram = hexagramFull.replace(symbolMatch[1], '').trim();
      } else {
        hexagram = hexagramFull;
      }
    }

    return {
      number,
      fortuneType,
      mainText,
      culturalReference,
      hexagram,
      hexagramSymbol
    };
  }

  private getDefaultFortune(mood: string): any {
    const defaultFortunes = [
      {
        number: '上上签',
        fortuneType: '上上签',
        mainText: '花开富贵，心想事成。贵人相助，事业通达。',
        culturalReference: '《诗经》有云："桃之夭夭，灼灼其华。之子于归，宜其室家。"',
        hexagram: '乾卦',
        hexagramSymbol: '☰☰'
      },
      {
        number: '中吉签',
        fortuneType: '上签',
        mainText: '静待时机，厚积薄发。守得云开见月明。',
        culturalReference: '《道德经》曰："上善若水，水善利万物而不争。"',
        hexagram: '坤卦',
        hexagramSymbol: '☷☷'
      },
      {
        number: '上吉签',
        fortuneType: '上签',
        mainText: '福星高照，喜气盈门。机缘巧合，收获满满。',
        culturalReference: '《论语》云："有朋自远方来，不亦乐乎？"',
        hexagram: '泰卦',
        hexagramSymbol: '☷☰'
      }
    ];

    const hash = this.hashString(mood);
    const index = hash % defaultFortunes.length;
    
    return {
      success: false,
      ...defaultFortunes[index],
      message: 'AI签文生成服务暂时不可用，使用默认签文'
    };
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }
}