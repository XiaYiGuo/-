import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DataCatalogReportData } from '../../types';
import { Check } from 'lucide-react';

interface CatalogReportViewProps {
  onBack: () => void;
}

// Temporary Local Mock Data to represent what's passed in
const mockReport: DataCatalogReportData = {
  departmentName: '医保局',
  totalItems: 42,
  missingCatalogCount: 5,
  invalidNameCount: 3,
  invalidRuleCount: 7,
  missingFieldCount: 8,
  typeErrorCount: 12,
  date: '2023-10-30',
  items: [
    { id: '1', index: 1, systemName: 'XXX医保系统', catalogName: 'XXX医保系统救助金管理数据' },
    { id: '2', index: 2, systemName: 'XXX医保系统', catalogName: 'XXX医保系统医保管理数据' },
    { id: '3', index: 3, systemName: 'XXX医保系统', catalogName: 'XXX医保系统参保人员信息' },
  ],
  catalogProblems: [
    { id: 'c1', index: 1, systemName: 'XXX医保系统', catalogName: 'XXX医保系统救助金管理数据', problem: '目录名称和表名不对应', suggestion: '区域+应用系统+表信息' },
    { id: 'c2', index: 2, systemName: 'XXX医保系统', catalogName: 'XXX医保系统测试用表', problem: '重点领域分类不合理', suggestion: '建议改为“科技创新”' },
  ],
  dataItemProblems: [
    { id: 'd1', index: 1, catalogName: 'XXX医保系统救助金管理数据', dataItem: 'apply_fund', problem: '数据类型不一致', suggestion: '建议修改为“VARCHAR”' },
    { id: 'd2', index: 2, catalogName: 'XXX医保系统医保管理数据', dataItem: 'user_id', problem: '主键不一致', suggestion: '建议改为ID字段' },
  ]
};

export function CatalogReportView({ onBack }: CatalogReportViewProps) {
  const data = mockReport;

  // Group suggestions by catalog
  const suggestionsByCatalog: Record<string, string[]> = {};
  data.catalogProblems.forEach(p => {
    if (!suggestionsByCatalog[p.catalogName]) suggestionsByCatalog[p.catalogName] = [];
    suggestionsByCatalog[p.catalogName].push(`目录问题：${p.problem}；建议：${p.suggestion}`);
  });
  data.dataItemProblems.forEach(p => {
    if (!suggestionsByCatalog[p.catalogName]) suggestionsByCatalog[p.catalogName] = [];
    suggestionsByCatalog[p.catalogName].push(`字段【${p.dataItem}】问题：${p.problem}；建议：${p.suggestion}`);
  });

  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim()) return;
    setIsSubmitted(true);
    setTimeout(() => {
      setIsFeedbackOpen(false);
      setTimeout(() => {
        setIsSubmitted(false);
        setFeedbackText('');
      }, 300);
    }, 3000);
  };

  const downloadReport = () => {
    alert("数据目录核验报告下载功能已模拟触发！");
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
            {data.departmentName}部门数据目录核验报告
          </h2>
          <p className="text-[#1A1A1A] font-medium leading-relaxed text-left text-base mb-6">
            本次针对{data.departmentName}共计{data.totalItems}条数据目录进行核验，核验范围仅针对部门内容自建系统的数据目录进行核验，省统建或无业务系统不在核验范围。核验内容包括数据目录及数据项，核验的目录清单如下：
          </p>
        </header>

        {/* List of Catalogs */}
        <section className="mb-12 w-full">
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[13px] font-bold border-b-2 border-black text-[#1A1A1A]">
                  <th className="py-3 px-4 font-normal w-24">序号</th>
                  <th className="py-3 px-4 font-normal w-48">业务系统</th>
                  <th className="py-3 px-4 font-normal">数据目录名称</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {data.items.map((item) => (
                  <tr key={item.id} className="border-b border-gray-100">
                    <td className="py-3 px-4 font-serif text-gray-500">{item.index}</td>
                    <td className="py-3 px-4 font-medium text-[#1A1A1A]">{item.systemName}</td>
                    <td className="py-3 px-4 text-[#1A1A1A]">{item.catalogName}</td>
                  </tr>
                ))}
                 <tr className="border-b border-gray-100 bg-gray-50/30">
                    <td colSpan={3} className="py-4 text-center text-gray-400 ">
                      ... 余下 {data.totalItems - data.items.length} 条数据隐藏展示 ...
                    </td>
                  </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 1: Conclusion */}
        <section className="mb-12 w-full">
          <h3 className="text-lg font-bold mb-4 font-serif">一、结论总结</h3>
          <p className="text-[#1A1A1A] leading-relaxed">
            本次累计核验数据目录<span className="font-bold underline decoration-black underline-offset-4 mx-1">{data.totalItems}</span>条，其中数据目录缺失<span className="font-bold underline decoration-black underline-offset-4 mx-1">{data.missingCatalogCount || 0}</span>条，名称不规范<span className="font-bold underline decoration-black underline-offset-4 mx-1">{data.invalidNameCount}</span>条，不符合规范<span className="font-bold underline decoration-black underline-offset-4 mx-1">{data.invalidRuleCount}</span>条，其中数据项问题有字段缺失<span className="font-bold underline decoration-black underline-offset-4 mx-1">{data.missingFieldCount || 0}</span>条、数据类型错误<span className="font-bold underline decoration-black underline-offset-4 mx-1">{data.typeErrorCount}</span>条。
          </p>
        </section>

        {/* Section 2: Catalog Problem Details */}
        <section className="mb-12 w-full">
          <h3 className="text-lg font-bold mb-4 font-serif">二、数据目录问题明细</h3>
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="text-[13px] font-bold border-b-2 border-black text-[#1A1A1A]">
                  <th className="py-3 px-4 font-normal w-20">序号</th>
                  <th className="py-3 px-4 font-normal w-40">应用系统</th>
                  <th className="py-3 px-4 font-normal w-48">数据目录</th>
                  <th className="py-3 px-4 font-normal w-40">问题项</th>
                  <th className="py-3 px-4 font-normal">修改建议</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {data.catalogProblems.map((prob) => (
                  <tr key={prob.id} className="border-b border-gray-100">
                    <td className="py-4 px-4 font-serif text-gray-500">{prob.index}</td>
                    <td className="py-4 px-4 font-medium text-[#1A1A1A]">{prob.systemName}</td>
                    <td className="py-4 px-4 text-[#1A1A1A]">{prob.catalogName}</td>
                    <td className="py-4 px-4 font-medium text-black">{prob.problem}</td>
                    <td className="py-4 px-4 text-[#1A1A1A]">{prob.suggestion}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        
        {/* Section 3: Data Item Problem Details */}
        <section className="mb-12 w-full">
          <h3 className="text-lg font-bold mb-4 font-serif">三、数据项问题明细</h3>
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="text-[13px] font-bold border-b-2 border-black text-[#1A1A1A]">
                  <th className="py-3 px-4 font-normal w-20">序号</th>
                  <th className="py-3 px-4 font-normal w-48">数据目录</th>
                  <th className="py-3 px-4 font-normal w-40">数据项</th>
                  <th className="py-3 px-4 font-normal w-40">问题项</th>
                  <th className="py-3 px-4 font-normal">修改建议</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {data.dataItemProblems.map((prob) => (
                  <tr key={prob.id} className="border-b border-gray-100">
                    <td className="py-4 px-4 font-serif text-gray-500">{prob.index}</td>
                    <td className="py-4 px-4 font-medium text-[#1A1A1A]">{prob.catalogName}</td>
                    <td className="py-4 px-4 text-[#1A1A1A]">{prob.dataItem}</td>
                    <td className="py-4 px-4 font-medium text-black">{prob.problem}</td>
                    <td className="py-4 px-4 text-[#1A1A1A]">{prob.suggestion}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 4: Suggestions */}
        <section className="mb-16 w-full">
          <h3 className="text-lg font-bold mb-6 font-serif">四、修改建议</h3>
          <div className="space-y-6">
            {Object.entries(suggestionsByCatalog).map(([catalogName, suggestions], idx) => (
              <div key={catalogName} className="bg-gray-50 p-5 border border-gray-200">
                <h4 className="font-bold text-[#1A1A1A] mb-3 border-l-[3px] border-black pl-3 text-[15px]">
                  4.{idx + 1} {catalogName} 目录
                </h4>
                <ul className="space-y-2 pl-4">
                  {suggestions.map((sug, sIdx) => (
                    <li key={sIdx} className="text-sm text-gray-700 font-medium">
                      {sIdx + 1}. {sug}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            {Object.keys(suggestionsByCatalog).length === 0 && (
               <div className="py-6 text-center text-gray-400 ">全部目录状态良好，暂无修改建议</div>
            )}
          </div>
        </section>

        <footer className="mt-auto w-full">
          <div className="text-right text-base font-bold font-serif text-[#1A1A1A] space-y-2 mb-12">
            <p>[AI数据目录核验智能体]</p>
            <p>[{data.date}]</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center pt-8 border-t border-black/10">
            <div className="flex items-center gap-2 -ml-4">
              <button onClick={onBack} className="text-xs font-bold text-gray-500 px-4 py-2 hover:text-black transition-colors bg-transparent">
                返回总览
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
                    <h3 className="font-serif text-2xl  tracking-tight text-[#1A1A1A]">对报告有异议</h3>
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
                  <p className="text-xl font-serif  text-[#1A1A1A] mb-2">感谢您的反馈</p>
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
