import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';

export function AnalyzingView() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timer1 = setTimeout(() => setStep(1), 1200);
    const timer2 = setTimeout(() => setStep(2), 2500);
    const timer3 = setTimeout(() => setStep(3), 3500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  const steps = [
    { text: "读取并解析源数据..." },
    { text: "构建 AI 业务上下文..." },
    { text: "校验规则并执行去重分析..." },
    { text: "生成最终核验报告..." }
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-sm mx-auto w-full">
      <div className="mb-12">
         <div className="w-16 h-16 bg-black flex items-center justify-center rounded-sm mx-auto mb-6">
            <span className="text-white font-serif text-3xl">AI</span>
          </div>
         <h2 className="text-2xl font-serif italic text-center text-[#1A1A1A]">AI 处理中</h2>
      </div>

      <div className="space-y-6 w-full">
        {steps.map((s, idx) => {
          const isActive = idx === step;
          const isDone = idx < step;
          const isPending = idx > step;

          return (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: isPending ? 0 : 1, y: isPending ? 10 : 0 }}
              className="flex justify-between items-center border-b border-gray-100 pb-2"
            >
              <span className={`text-[10px] uppercase tracking-widest font-bold ${
                isDone ? 'text-[#1A1A1A]' : 
                isActive ? 'text-[#1A1A1A]' : 
                'text-gray-300'
              }`}>
                {s.text}
              </span>
              
              {isActive && (
                <span className="w-2 h-2 bg-black rounded-full animate-pulse" />
              )}
              {isDone && (
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#1A1A1A]">已完成</span>
              )}
            </motion.div>
          )
        })}
      </div>
    </div>
  );
}
