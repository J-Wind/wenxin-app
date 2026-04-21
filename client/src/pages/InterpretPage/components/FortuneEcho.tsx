import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { FortuneResult } from '@/stores/fortuneStore';

interface FortuneEchoProps {
  fortune: FortuneResult;
}

export function FortuneEcho({ fortune }: FortuneEchoProps) {
  return (
    <div className="relative">
      <Card className="bg-card/50 backdrop-blur-md border border-primary/20 rounded-xl hover:bg-card/70 transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                <div className="text-primary font-serif">📜</div>
              </div>
               <div>
                 <div className="text-lg font-bold text-primary font-serif">
                   原签文回顾
                 </div>
               </div>
            </div>
          </div>
          
          <div className="text-center space-y-4">
            {/* 签文类型 */}
            <div className="text-2xl font-bold text-primary font-serif mb-6">
              {fortune.fortuneType}
            </div>
            
            {/* 签号 + 签文 */}
            <div className="text-base text-foreground font-serif leading-loose whitespace-pre-wrap">
              【{fortune.number}】{fortune.mainText}
            </div>
            
            {/* 文化引用 */}
            <div className="text-base text-foreground font-serif leading-loose whitespace-pre-wrap">
              {fortune.culturalReference}
            </div>
            
            {/* 白话解释 - 如果文化引用中已包含则不显示 */}
            
            {/* 卦象 */}
            <div className="text-sm text-muted-foreground font-medium mt-6">
              {fortune.hexagram} {fortune.hexagramSymbol}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}