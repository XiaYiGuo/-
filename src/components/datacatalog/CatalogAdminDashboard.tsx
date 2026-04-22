import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, X, BarChart, FileText, MessageSquare, AlertCircle } from 'lucide-react';

interface CatalogAdminDashboardProps {
  onBack: () => void;
}

export function CatalogAdminDashboard({ onBack }: CatalogAdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'reports' | 'stats' | 'feedback'>('reports');
  const [feedbackDetail, setFeedbackDetail] = useState<any>(null); // null means modal closed

  // Mock Data
  const mockReports = [
    { id: 'REP-20231102-001', dept: '农业农村局', startTime: '2023-11-02 09:00', endTime: '2023-11-02 09:12', status: '已生成' },
    { id: 'REP-20231102-002', dept: '交通运输局', startTime: '2023-11-02 10:30', endTime: '--', status: '进行中' },
    { id: 'REP-20231102-003', dept: '教育局', startTime: '2023-11-01 14:00', endTime: '2023-11-01 14:08', status: '已生成' },
    { id: 'REP-20231101-004', dept: '医保局', startTime: '2023-11-01 09:15', endTime: '2023-11-01 09:25', status: '已生成' },
  ];

  const mockFeedback = [
    { id: 'FB-C001', dept: '农业农村局', proposer: '王工', contact: '13800001111', time: '2023-11-02 15:30', text: '部分农机登记目录无法匹配旧版SQL脚本，是否有兼容模式？', status: '未处理', comment: '' },
    { id: 'FB-C002', dept: '教育局', proposer: '李老师', contact: '13900002222', time: '2023-11-01 10:15', text: '学籍系统的数据目录定级建议AI能结合表名字段自动推断敏感级别。', status: '进行中', comment: '需求已记录，正在同算法部门探讨可行性方案。' },
    { id: 'FB-C003', dept: '交通运输局', proposer: '张处', contact: '13700003333', time: '2023-10-28 09:00', text: '核验报告的PDF格式排版有点错位，希望能优化。', status: '已处理', comment: '已在最新补丁中修复 PDF 渲染引擎换行问题。' },
  ];

  // Stats Data
  const stats = {
    depts: 4,
    catalogs: 1248,
    problemCatalogs: 156,
    problemDataItems: 432
  };

  const hotProblems = [
    { type: '[数据项] 字段数据类型不一致', count: 189 },
    { type: '[数据项] 主键约束条件模糊', count: 95 },
    { type: '[目录] 重点领域分类不合理', count: 82 },
    { type: '[目录] 目录名称命名不规范', count: 47 },
  ];

  const qualityRankings = [
    { rank: 1, dept: '医保局', validCount: 425 },
    { rank: 2, dept: '教育局', validCount: 380 },
    { rank: 3, dept: '农业农村局', validCount: 290 },
    { rank: 4, dept: '交通运输局', validCount: 210 },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex-1 w-full bg-[#FDFCFB] flex flex-col md:flex-row border-t border-black/10 min-h-[calc(100vh-80px)]"
    >
      {/* Sidebar Nav */}
      <aside className="w-full md:w-[240px] border-r border-black/10 flex flex-col pt-8 bg-white/50">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 px-8 mb-12 text-[10px] uppercase font-bold tracking-widest text-gray-500 hover:text-black transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />返回平台
        </button>

        <div className="px-8 mb-6">
          <h2 className="font-serif italic text-2xl text-[#1A1A1A]">目录管理后台</h2>
          <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400 mt-2">Catalog Admin</p>
        </div>

        <nav className="flex-1 flex flex-col space-y-2 px-4">
          {[
            { id: 'reports', label: '核验报告管理', icon: FileText },
            { id: 'stats', label: '统计分析', icon: BarChart },
            { id: 'feedback', label: '问题反馈管理', icon: MessageSquare }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`flex items-center gap-3 px-4 py-3 text-sm font-bold tracking-wide rounded-sm transition-all ${
                activeTab === item.id 
                  ? 'bg-black text-white' 
                  : 'text-gray-600 hover:bg-black/5 hover:text-black'
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 md:p-12 overflow-y-auto">
        {/* TAB: REPORTS */}
        {activeTab === 'reports' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex justify-between items-end mb-8 border-b-2 border-black pb-4">
              <div>
                <h3 className="text-3xl font-serif italic text-[#1A1A1A]">核验报告管理</h3>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Catalog Reports History</p>
              </div>
            </div>

            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="text-[10px] uppercase tracking-widest font-bold text-gray-400 border-b border-gray-200">
                  <th className="py-3 px-4 font-normal">报告 ID</th>
                  <th className="py-3 px-4 font-normal">业务部门</th>
                  <th className="py-3 px-4 font-normal">开始时间</th>
                  <th className="py-3 px-4 font-normal">结束时间</th>
                  <th className="py-3 px-4 font-normal">当前状态</th>
                  <th className="py-3 pl-4 font-normal text-right">操作</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {mockReports.map(report => (
                  <tr key={report.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4 font-mono text-[11px] font-bold text-gray-500">{report.id}</td>
                    <td className="py-4 px-4 font-medium text-[#1A1A1A]">{report.dept}</td>
                    <td className="py-4 px-4 text-gray-600">{report.startTime}</td>
                    <td className="py-4 px-4 text-gray-600">{report.endTime}</td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-widest border ${
                        report.status === '已生成' ? 'border-[#1A1A1A] text-[#1A1A1A] bg-gray-50' :
                        'border-amber-500 text-amber-600 bg-amber-50'
                      }`}>
                        {report.status}
                      </span>
                    </td>
                    <td className="py-4 pl-4 text-right">
                      {report.status === '已生成' ? (
                        <button onClick={() => alert('报告详情查看逻辑 (待联调)')} className="underline underline-offset-4 font-bold text-[#1A1A1A] hover:text-gray-500 text-[11px] uppercase tracking-widest">
                          报告详情
                        </button>
                      ) : (
                        <span className="text-gray-300 text-[11px] uppercase tracking-widest">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}

        {/* TAB: STATS */}
        {activeTab === 'stats' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
             <div className="flex justify-between items-end mb-8 border-b-2 border-black pb-4">
              <div>
                <h3 className="text-3xl font-serif italic text-[#1A1A1A]">统计分析</h3>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Catalog Intelligence Dashboard</p>
              </div>
            </div>

            <div className="bg-[#1A1A1A] text-white p-8 md:p-12 grid grid-cols-2 md:grid-cols-4 gap-8 mb-12 shadow-xl border-t-8 border-gray-400">
              <div className="text-center border-r border-white/10 last:border-0 md:last:border-r-0">
                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-2">核验报告数</p>
                <p className="text-5xl font-serif italic">{stats.depts}</p>
              </div>
              <div className="text-center border-r-0 md:border-r border-white/10 last:border-0">
                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-2">核验目录数</p>
                <p className="text-5xl font-serif italic">{stats.catalogs.toLocaleString()}</p>
              </div>
              <div className="text-center border-r border-white/10 last:border-0">
                <p className="text-[10px] text-amber-500 uppercase tracking-widest font-bold mb-2">发现问题目录数</p>
                <p className="text-5xl font-serif italic text-amber-500">{stats.problemCatalogs}</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] text-red-400 uppercase tracking-widest font-bold mb-2">发现异常数据项</p>
                <p className="text-5xl font-serif italic text-red-500">{stats.problemDataItems}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div>
                <h4 className="text-lg font-bold border-b border-gray-200 pb-2 mb-4 font-serif">热门问题分布</h4>
                <ul className="space-y-4">
                  {hotProblems.map((prob, i) => (
                    <li key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 text-[10px] flex items-center justify-center font-bold bg-gray-100 text-gray-500 rounded-full">{i + 1}</span>
                        <span className="font-medium text-[#1A1A1A] truncate max-w-[200px]" title={prob.type}>{prob.type}</span>
                      </div>
                      <span className="text-lg font-serif italic text-gray-500">{prob.count} 项</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-lg font-bold border-b border-gray-200 pb-2 mb-4 font-serif">部门质量排名 (按无瑕疵目录数)</h4>
                <ul className="space-y-4">
                  {qualityRankings.map((rk, i) => (
                    <li key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className={`w-8 h-8 text-[11px] flex items-center justify-center font-serif italic font-bold border ${i === 0 ? 'bg-black text-white border-black' : 'bg-transparent text-black border-black/20'}`}>No.{rk.rank}</span>
                        <span className="font-medium text-[#1A1A1A]">{rk.dept}</span>
                      </div>
                      <span className="font-bold text-[#1A1A1A]">{rk.validCount} <span className="text-xs uppercase text-gray-400">Valid</span></span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div className="mt-12 p-4 bg-blue-50/50 border border-blue-100 text-center rounded-sm">
               <p className="text-sm font-medium text-blue-800 tracking-wide flex items-center justify-center gap-2">
                 <AlertCircle className="w-4 h-4" /> 提示：建议后续引入“智能问答”功能以进行深层模型数据穿透查验。
               </p>
            </div>
          </motion.div>
        )}

        {/* TAB: FEEDBACK */}
        {activeTab === 'feedback' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
             <div className="flex justify-between items-end mb-8 border-b-2 border-black pb-4">
              <div>
                <h3 className="text-3xl font-serif italic text-[#1A1A1A]">问题反馈管理</h3>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Catalog Feedback Resolution</p>
              </div>
            </div>

            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="text-[10px] uppercase tracking-widest font-bold text-gray-400 border-b border-gray-200">
                  <th className="py-3 px-4 font-normal">提出部门</th>
                  <th className="py-3 px-4 font-normal">提出意见</th>
                  <th className="py-3 px-4 font-normal w-40">提出时间</th>
                  <th className="py-3 px-4 font-normal w-28">状态</th>
                  <th className="py-3 pl-4 font-normal text-right w-24">操作</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {mockFeedback.map(fb => (
                  <tr key={fb.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4 font-medium text-[#1A1A1A]">{fb.dept}</td>
                    <td className="py-4 px-4 text-gray-600 truncate max-w-[250px]">{fb.text}</td>
                    <td className="py-4 px-4 font-mono text-[11px] text-gray-500">{fb.time}</td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-widest border ${
                        fb.status === '未处理' ? 'border-red-400 text-red-500 bg-red-50' :
                        fb.status === '进行中' ? 'border-amber-500 text-amber-600 bg-amber-50' :
                        'border-[#1A1A1A] bg-gray-50 text-[#1A1A1A]'
                      }`}>
                        {fb.status}
                      </span>
                    </td>
                    <td className="py-4 pl-4 text-right">
                      <button 
                        onClick={() => setFeedbackDetail(fb)}
                        className={`underline underline-offset-4 text-[11px] uppercase tracking-widest font-bold ${
                          fb.status === '已处理' ? 'text-gray-400 hover:text-black' : 'text-[#1A1A1A] hover:text-gray-500'
                        }`}
                      >
                        {fb.status === '已处理' ? '详情' : '处置'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}
      </main>

      {/* Feedback Resolution Modal */}
      <AnimatePresence>
        {feedbackDetail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-[#FDFCFB] p-8 md:p-10 shadow-2xl max-w-2xl w-full border-2 border-black relative max-h-[90vh] overflow-y-auto"
            >
              <button onClick={() => setFeedbackDetail(null)} className="absolute top-6 right-6 text-gray-400 hover:text-black">
                <X className="w-6 h-6" />
              </button>
              <h3 className="font-serif text-3xl italic mb-8 border-b-2 border-black pb-4">问题处置记录</h3>
              
              <div className="grid grid-cols-2 gap-6 mb-8 text-sm">
                 <div>
                   <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">提出部门</p>
                   <p className="font-medium text-[#1A1A1A]">{feedbackDetail.dept}</p>
                 </div>
                 <div>
                   <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">提出时间</p>
                   <p className="font-mono text-gray-600">{feedbackDetail.time}</p>
                 </div>
                 <div>
                   <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">提出人员</p>
                   <p className="font-medium text-[#1A1A1A]">{feedbackDetail.proposer}</p>
                 </div>
                 <div>
                   <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">联系方式</p>
                   <p className="font-mono text-gray-600">{feedbackDetail.contact}</p>
                 </div>
              </div>

              <div className="mb-6">
                <p className="text-[10px] uppercase font-bold text-gray-400 mb-2">用户意见</p>
                <div className="p-4 bg-gray-50 border border-gray-200 text-[#1A1A1A] text-sm leading-relaxed">
                  {feedbackDetail.text}
                </div>
              </div>

              <div className="mb-8">
                 <button onClick={() => alert("跳转至核验报告详情页")} className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-[#1A1A1A] border-b border-black pb-1 hover:text-gray-500 transition-colors">
                   <BarChart className="w-4 h-4" /> 关联报告详情
                 </button>
              </div>

              <div className="space-y-6 mb-8 border-t border-gray-100 pt-6">
                <div>
                  <label className="text-[10px] uppercase font-bold text-gray-400 block mb-2">当前处理状态</label>
                  <select defaultValue={feedbackDetail.status} className="w-full md:w-1/2 border border-black p-3 text-sm font-bold bg-transparent focus:outline-none">
                    <option value="未处理">🔴 未处理</option>
                    <option value="进行中">🟡 进行中</option>
                    <option value="已处理">🟢 已处理</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-gray-400 block mb-2">处置意见（管理员填写）</label>
                  <textarea 
                    defaultValue={feedbackDetail.comment}
                    placeholder="输入内部处置进度或结论..."
                    className="w-full border border-gray-300 p-4 text-sm min-h-[100px] focus:outline-none focus:border-black resize-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-4">
                <button 
                  onClick={() => setFeedbackDetail(null)}
                  className="px-6 py-2 text-xs font-bold text-gray-500 hover:text-black transition-colors"
                >
                  取消
                </button>
                <button 
                  onClick={() => {
                    alert("处置记录已保存！")
                    setFeedbackDetail(null)
                  }}
                  className="px-8 py-3 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors"
                >
                  保存记录
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
