import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ReportData } from '../types';
import { Check } from 'lucide-react';

interface ReportViewProps {
  data: ReportData;
  onReset: () => void;
}

export function ReportView({ data, onReset }: ReportViewProps) {
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const downloadReport = () => {
    alert("报告下载功能已模拟触发！");
  };

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim()) return;
    setIsSubmitted(true);
    setTimeout(() => {
      setIsFeedbackOpen(false);
      setTimeout(() => {
        setIsSubmitted(false);
        setFeedbackText('');
      }, 300); // 弹窗关闭动画缓冲时间
    }, 3000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex-1 w-full flex flex-col bg-white border border-gray-100 p-8 md:p-12 shadow-sm"
    >
      <div className="max-w-4xl mx-auto w-full relative">
        <header className="mb-10 text-center">
          <h2 className="text-3xl md:text-4xl font-serif leading-tight border-b-2 border-black pb-8 mb-8 inline-block px-4">
            {data.departmentName}部门核心业务事项核验报告
          </h2>
          <p className="text-[#1A1A1A] font-medium leading-relaxed text-left text-base mb-6">
            本次针对{data.departmentName}共计{data.totalItems}条核心业务事项进行审核，审核内容包括是否缺失、是否重复、内容是否符合业务规范，审查的事项清单如下：
          </p>
        </header>

        {/* Section: List of items */}
        <section className="mb-12 w-full">
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[13px] font-bold border-b-2 border-black text-[#1A1A1A]">
                  <th className="py-3 px-4 font-normal w-24">序号</th>
                  <th className="py-3 px-4 font-normal w-40">处室</th>
                  <th className="py-3 px-4 font-normal">事项名称</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {data.items.slice(0, 10).map((item) => (
                  <tr key={item.id} className="border-b border-gray-100">
                    <td className="py-3 px-4 font-serif text-gray-500">{item.index}</td>
                    <td className="py-3 px-4 font-medium text-[#1A1A1A]">{item.department}</td>
                    <td className="py-3 px-4 text-[#1A1A1A]">{item.itemName}</td>
                  </tr>
                ))}
                {data.items.length > 10 && (
                  <tr className="border-b border-gray-100 bg-gray-50/30">
                    <td colSpan={3} className="py-4 text-center text-gray-400 italic">
                      ... 余下 {data.items.length - 10} 条数据隐藏展示 ...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 1: Conclusion */}
        <section className="mb-10 w-full">
          <h3 className="text-lg font-bold mb-4 font-serif">一、结论总结</h3>
          <p className="text-[#1A1A1A] leading-relaxed">
            本次累计核验业务事项<span className="font-bold underline decoration-black underline-offset-4 mx-1">{data.totalItems}</span>条，其中缺失事项描述字段<span className="font-bold underline decoration-black underline-offset-4 mx-1">{data.missingDescCount}</span>条，疑似重复<span className="font-bold underline decoration-black underline-offset-4 mx-1">{data.duplicateCount}</span>条。
          </p>
        </section>

        {/* Section 2: Details */}
        <section className="flex-1 overflow-hidden flex flex-col mb-16 w-full">
          <h3 className="text-lg font-bold mb-4 font-serif">二、问题明细</h3>
          
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="text-[13px] font-bold border-b-2 border-black text-[#1A1A1A]">
                  <th className="py-3 px-4 font-normal w-20">序号</th>
                  <th className="py-3 px-4 font-normal w-32">处室</th>
                  <th className="py-3 px-4 font-normal w-64">事项名称</th>
                  <th className="py-3 px-4 font-normal w-32">问题项</th>
                  <th className="py-3 px-4 font-normal">修改建议</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {data.problems.map((prob) => (
                  <tr key={prob.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-4 font-serif text-gray-500">{prob.index}</td>
                    <td className="py-4 px-4 font-medium text-[#1A1A1A]">{prob.department}</td>
                    <td className="py-4 px-4 text-[#1A1A1A]">{prob.itemName}</td>
                    <td className="py-4 px-4 font-medium text-black">
                      {prob.problem}
                    </td>
                    <td className="py-4 px-4 text-[#1A1A1A]">
                      {prob.suggestion}
                    </td>
                  </tr>
                ))}
                {data.problems.length === 0 && (
                   <tr className="border-b border-gray-100">
                     <td colSpan={5} className="py-8 text-center text-gray-500 italic font-serif">当前数据集中未发现缺失或重复问题。</td>
                   </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <footer className="mt-auto w-full">
          <div className="text-right text-sm font-bold text-[#1A1A1A] space-y-2 mb-12">
            <p>[AI事项核验智能体]</p>
            <p>[{data.date}]</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center pt-8 border-t border-black/10">
            <div className="flex items-center gap-2 -ml-4">
              <button onClick={onReset} className="text-xs font-bold text-gray-500 px-4 py-2 hover:text-black transition-colors bg-transparent">
                重新核验
              </button>
              <span className="text-gray-300">|</span>
              <button onClick={() => setIsFeedbackOpen(true)} className="text-xs font-bold text-gray-500 px-4 py-2 hover:text-black transition-colors bg-transparent underline underline-offset-4">
                对报告有异议
              </button>
            </div>
            <button onClick={downloadReport} className="text-xs uppercase font-bold border border-black px-8 py-3 hover:bg-black hover:text-white transition-colors bg-white">
              导出报告
            </button>
          </div>
        </footer>
      </div>

      {/* Feedback Modal */}
      <AnimatePresence>
        {isFeedbackOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-[#FDFCFB] p-8 shadow-2xl max-w-lg w-full border-2 border-black relative"
            >
              {!isSubmitted ? (
                <form onSubmit={handleFeedbackSubmit}>
                  <header className="mb-6 border-b-2 border-black pb-4">
                    <h3 className="font-serif text-2xl italic tracking-tight text-[#1A1A1A]">对报告有异议</h3>
                    <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest">Report Issue / Feedback</p>
                  </header>
                  <textarea
                    className="w-full border border-gray-300 p-4 text-sm min-h-[160px] focus:outline-none focus:border-black resize-none mb-6 bg-white placeholder:text-gray-400"
                    placeholder="请输入您的建议或发现的问题..."
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    autoFocus
                  />
                  <div className="flex justify-end gap-4">
                    <button type="button" onClick={() => setIsFeedbackOpen(false)} className="px-6 py-2 text-xs font-bold text-gray-500 hover:text-black border border-transparent">取消</button>
                    <button type="submit" disabled={!feedbackText.trim()} className="px-8 py-2 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">提交记录</button>
                  </div>
                </form>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-black text-white flex items-center justify-center mx-auto mb-6">
                    <Check className="w-8 h-8" />
                  </div>
                  <p className="text-xl font-serif italic text-[#1A1A1A] mb-2">感谢您的反馈</p>
                  <p className="text-sm font-medium text-gray-600">后续将由专人联系处理。</p>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
