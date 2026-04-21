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
          <div className="flex items-center justify-between">
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
          
          <div className="mt-4 flex justify-center">
            <div className="writing-mode-vertical-rl text-start space-y-6">
              <div className="text-xl text-foreground font-serif leading-loose">
                {fortune.mainText}
              </div>
              
              <div className="text-sm text-muted-foreground italic leading-relaxed">
                {fortune.culturalReference}
              </div>
              
              <div className="text-sm text-muted-foreground font-medium">
                {fortune.hexagram} {fortune.hexagramSymbol}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}