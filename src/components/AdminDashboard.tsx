import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Plus, X, BarChart, List, MessageSquare, AlertCircle } from 'lucide-react';

interface AdminDashboardProps {
  onBack: () => void;
}

export function AdminDashboard({ onBack }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'tasks' | 'stats' | 'feedback'>('tasks');
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [feedbackDetail, setFeedbackDetail] = useState<any>(null); // null means modal closed

  // Mock Data
  const mockTasks = [
    { id: 'TKS-20231027-001', dept: '交通运输局', startTime: '2023-10-27 09:00', endTime: '2023-10-27 09:05', status: '已结束' },
    { id: 'TKS-20231027-002', dept: '农业农村局', startTime: '2023-10-27 10:30', endTime: '--', status: '进行中' },
    { id: 'TKS-20231027-003', dept: '教育局', startTime: '2023-10-27 14:00', endTime: '--', status: '待开始' },
  ];

  const mockFeedback = [
    { id: 'FB-001', dept: '交通运输局', proposer: '王会计', contact: '13811112222', time: '2023-10-26 15:30', text: '建议对发票核销类事项增加三级分类识别', status: '未处理', comment: '' },
    { id: 'FB-002', dept: '农业农村局', proposer: '李四', contact: '13933334444', time: '2023-10-25 10:15', text: '部分相似事项只是面向对象不同，不应判定为重复', status: '进行中', comment: '正在同技术团队复盘判断逻辑' },
    { id: 'FB-003', dept: '教育局', proposer: '张律', contact: '13700009999', time: '2023-10-20 09:00', text: '报告能否提供PDF批量下载功能', status: '已处理', comment: '已在v2.4版本中加入导出功能' },
  ];

  // Stats Data
  const stats = {
    depts: 12,
    items: 3450,
    problems: 156
  };

  const hotProblems = [
    { type: '缺失事项描述', count: 89 },
    { type: '疑似事项重复', count: 42 },
    { type: '内容规范不符', count: 18 },
    { type: '前置条件矛盾', count: 7 },
  ];

  const qualityRankings = [
    { rank: 1, dept: '教育局', validCount: 520 },
    { rank: 2, dept: '农业农村局', validCount: 480 },
    { rank: 3, dept: '交通运输局', validCount: 410 },
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
          <ArrowLeft className="w-4 h-4" />返回前台
        </button>

        <div className="px-8 mb-6">
          <h2 className="font-serif italic text-2xl text-[#1A1A1A]">后台管理</h2>
          <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400 mt-2">Admin Center</p>
        </div>

        <nav className="flex-1 flex flex-col space-y-2 px-4">
          {[
            { id: 'tasks', label: '核验任务管理', icon: List },
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
        {/* TAB: TASKS */}
        {activeTab === 'tasks' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex justify-between items-end mb-8 border-b-2 border-black pb-4">
              <div>
                <h3 className="text-3xl font-serif italic text-[#1A1A1A]">核验任务管理</h3>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Audit Tasks History</p>
              </div>
              <button 
                onClick={() => setIsTaskModalOpen(true)}
                className="flex items-center gap-2 px-6 py-2.5 bg-black text-white text-[10px] font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors"
              >
                <Plus className="w-4 h-4" /> 新增任务
              </button>
            </div>

            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="text-[10px] uppercase tracking-widest font-bold text-gray-400 border-b border-gray-200">
                  <th className="py-3 px-4 font-normal">任务 ID</th>
                  <th className="py-3 px-4 font-normal">部门</th>
                  <th className="py-3 px-4 font-normal">开始时间</th>
                  <th className="py-3 px-4 font-normal">结束时间</th>
                  <th className="py-3 px-4 font-normal">当前状态</th>
                  <th className="py-3 pl-4 font-normal text-right">操作</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {mockTasks.map(task => (
                  <tr key={task.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4 font-mono text-[11px] font-bold text-gray-500">{task.id}</td>
                    <td className="py-4 px-4 font-medium text-[#1A1A1A]">{task.dept}</td>
                    <td className="py-4 px-4 text-gray-600">{task.startTime}</td>
                    <td className="py-4 px-4 text-gray-600">{task.endTime}</td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-widest border ${
                        task.status === '已结束' ? 'border-[#1A1A1A] text-[#1A1A1A] bg-gray-50' :
                        task.status === '进行中' ? 'border-amber-500 text-amber-600 bg-amber-50' :
                        'border-gray-200 text-gray-400'
                      }`}>
                        {task.status}
                      </span>
                    </td>
                    <td className="py-4 pl-4 text-right">
                      {task.status === '已结束' ? (
                        <button onClick={() => alert('报告详情查看逻辑')} className="underline underline-offset-4 font-bold text-[#1A1A1A] hover:text-gray-500 text-[11px] uppercase tracking-widest">
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
                <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Intelligence Dashboard</p>
              </div>
            </div>

            <div className="bg-[#1A1A1A] text-white p-8 md:p-12 flex flex-col md:flex-row justify-around gap-8 mb-12 shadow-xl">
              <div className="text-center">
                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-2">核验报告总数</p>
                <p className="text-6xl font-serif italic">{stats.depts}</p>
              </div>
              <div className="hidden md:block w-px bg-white/10" />
              <div className="text-center">
                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-2">核验事项总数</p>
                <p className="text-6xl font-serif italic">{stats.items.toLocaleString()}</p>
              </div>
              <div className="hidden md:block w-px bg-white/10" />
              <div className="text-center">
                <p className="text-[10px] text-amber-500 uppercase tracking-widest font-bold mb-2">发现问题事项数</p>
                <p className="text-6xl font-serif italic text-amber-500">{stats.problems}</p>
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
                        <span className="font-medium text-[#1A1A1A]">{prob.type}</span>
                      </div>
                      <span className="text-lg font-serif italic text-gray-500">{prob.count}项</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-lg font-bold border-b border-gray-200 pb-2 mb-4 font-serif">部门质量排名 (按规范数)</h4>
                <ul className="space-y-4">
                  {qualityRankings.map((rk, i) => (
                    <li key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className={`w-8 h-8 text-[11px] flex items-center justify-center font-serif italic font-bold border ${i === 0 ? 'bg-black text-white border-black' : 'bg-transparent text-black border-black'}`}>No.{rk.rank}</span>
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
                 <AlertCircle className="w-4 h-4" /> 提示：建议后续引入“智能问答”功能以进行深层数据穿透查验。
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
                <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">User Feedback Resolution</p>
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

      {/* Task Creation Modal */}
      <AnimatePresence>
        {isTaskModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-[#FDFCFB] p-8 shadow-2xl max-w-sm w-full border-2 border-black relative"
            >
              <button onClick={() => setIsTaskModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-black">
                <X className="w-5 h-5" />
              </button>
              <h3 className="font-serif text-2xl italic mb-6 border-b border-black pb-4">新增任务</h3>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="text-[10px] uppercase font-bold text-gray-500 block mb-1">业务部门 / Department</label>
                  <input type="text" className="w-full border border-gray-300 p-2 text-sm focus:border-black focus:outline-none" defaultValue="交通运输局" />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-gray-500 block mb-1">开始时间 / Start Time</label>
                  <input type="datetime-local" className="w-full border border-gray-300 p-2 text-sm focus:border-black focus:outline-none" />
                </div>
              </div>
              <p className="text-[10px] text-gray-400 italic mb-6">建议后续可以通过指令下达的形式自动生成。</p>
              <button 
                onClick={() => setIsTaskModalOpen(false)}
                className="w-full py-3 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors"
              >
                Create Task
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
                 <button onClick={() => alert("跳转至报告页")} className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-[#1A1A1A] border-b border-black pb-1 hover:text-gray-500 transition-colors">
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
