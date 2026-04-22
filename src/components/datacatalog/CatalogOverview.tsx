import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DataCatalogItem, DataCatalogReportData } from '../../types';
import { Database, FileCode, Check, X as CloseIcon, ChevronDown, ChevronRight } from 'lucide-react';

interface CatalogOverviewProps {
  onGenerateReport: () => void;
}

const mockCatalogs: DataCatalogItem[] = [
  { id: '1', department: '医保局', systemName: 'XXX医保系统', catalogName: '救助记录信息', createTime: '2023-11-01', isLinkedToSource: false },
  { id: '2', department: '医保局', systemName: 'XXX医保系统', catalogName: '困难申报记录信息', createTime: '2023-11-02', isLinkedToSource: false },
  { id: '3', department: '医保局', systemName: 'XXX医保系统', catalogName: '困难申请人家庭成员信息', createTime: '2023-11-05', isLinkedToSource: false },
  { id: '4', department: '医保局', systemName: 'XXX医保系统', catalogName: '困难申请人家庭信息', createTime: '2023-10-15', isLinkedToSource: false },
  { id: '5', department: '医保局', systemName: 'XXX医保系统', catalogName: '救助金管理信息', createTime: '2023-10-20', isLinkedToSource: false },
  { id: '6', department: '医保局', systemName: 'XXX医保系统', catalogName: '用户管理数据', createTime: '2023-10-21', isLinkedToSource: false },
  { id: '7', department: '交通运输局', systemName: 'YYY交通执法系统', catalogName: '执法记录信息', createTime: '2023-11-10', isLinkedToSource: false },
];

export function CatalogOverview({ onGenerateReport }: CatalogOverviewProps) {
  const [items, setItems] = useState<DataCatalogItem[]>(
    [...mockCatalogs].sort((a, b) => a.systemName.localeCompare(b.systemName))
  );

  // --- Grouping Logic for Tree View ---
  const groupedItems = useMemo(() => {
    const groups: Record<string, { systemName: string, department: string, items: DataCatalogItem[] }> = {};
    items.forEach(item => {
      if (!groups[item.systemName]) {
        groups[item.systemName] = { systemName: item.systemName, department: item.department, items: [] };
      }
      groups[item.systemName].items.push(item);
    });
    return Object.values(groups);
  }, [items]);

  const [expandedSystems, setExpandedSystems] = useState<Record<string, boolean>>({});

  // Initialize expansion state when groupedItems loads
  useEffect(() => {
    setExpandedSystems(prev => {
      if (Object.keys(prev).length === 0) {
        const initial: Record<string, boolean> = {};
        groupedItems.forEach(g => { initial[g.systemName] = true; });
        return initial;
      }
      return prev;
    });
  }, [groupedItems]);

  const toggleSystem = (sysName: string) => {
    setExpandedSystems(prev => ({ ...prev, [sysName]: !prev[sysName] }));
  };

  // Modal States
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [activeCatalogId, setActiveCatalogId] = useState<string | null>(null);
  const [manualSqlInput, setManualSqlInput] = useState('');
  
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [activeAISystem, setActiveAISystem] = useState('');
  const [aiSqlInput, setAiSqlInput] = useState('');
  
  const [isAIResultOpen, setIsAIResultOpen] = useState(false);
  const [aiResult, setAiResult] = useState<{ successCount: number; failCount: number; failedNames: string[] }>({
    successCount: 0, failCount: 0, failedNames: []
  });
  const [isAIDetailsOpen, setIsAIDetailsOpen] = useState(false);

  const handleOpenAI = (sysName: string) => {
    setActiveAISystem(sysName);
    setAiSqlInput('');
    setIsAIModalOpen(true);
  };

  // --- Actions ---
  const handleOpenManual = (id: string) => {
    setActiveCatalogId(id);
    const item = items.find(i => i.id === id);
    setManualSqlInput(item?.sourceSql || '');
    setIsManualModalOpen(true);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeCatalogId) {
      setItems(prev => prev.map(item => 
        item.id === activeCatalogId 
          ? { ...item, isLinkedToSource: true, sourceSql: manualSqlInput } 
          : item
      ));
    }
    setIsManualModalOpen(false);
  };

  const handleAIFillSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAISystem || !aiSqlInput.trim()) return;
    
    setIsAIModalOpen(false);
    // Mimic processing delay
    setTimeout(() => {
      let successCount = 0;
      let failCount = 0;
      const failedNames: string[] = [];

      setItems(prev => {
        return prev.map(item => {
          if (item.systemName === activeAISystem && !item.isLinkedToSource) {
            // Simple heuristic to extract the table SQL if pasted, otherwise fallback
            const tableName = item.catalogName;
            const escapedName = tableName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(`CREATE TABLE.*?\\\`${escapedName}\\\`[\\s\\S]*?;`, 'i');
            const match = aiSqlInput.match(regex);
            
            if (match) {
              successCount++;
              const matchedSql = `-- [AI 智能匹配提取的库表结构 - 来源系统: ${activeAISystem}]\n${match[0]}`;
              return { ...item, isLinkedToSource: true, sourceSql: matchedSql };
            } else {
              failCount++;
              failedNames.push(item.catalogName);
            }
          }
          return item;
        });
      });

      setAiResult({ successCount, failCount, failedNames });
      setIsAIResultOpen(true);
    }, 1500);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full">
      <div className="flex justify-between items-end mb-8 border-b-2 border-black pb-4">
        <div>
          <h2 className="text-3xl font-serif italic text-[#1A1A1A]">数据目录总览</h2>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Data Catalog Management</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={onGenerateReport}
            className="flex items-center gap-2 px-6 py-2.5 bg-black text-white text-[10px] font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors"
          >
            <FileCode className="w-4 h-4" /> 生成报告
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="w-full overflow-x-auto bg-white border border-gray-100 shadow-sm p-4">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="text-[11px] uppercase tracking-widest font-bold text-gray-400 border-b border-gray-200">
              <th className="py-4 px-4 font-normal w-32">业务部门</th>
              <th className="py-4 px-4 font-normal w-56">系统名称</th>
              <th className="py-4 px-4 font-normal">数据目录名称</th>
              <th className="py-4 px-4 font-normal w-32">创建时间</th>
              <th className="py-4 px-4 font-normal text-center w-36">是否引用源库表</th>
              <th className="py-4 pl-4 font-normal text-right w-36">操作</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {groupedItems.map(group => {
              const isAllLinked = group.items.length > 0 && group.items.every(i => i.isLinkedToSource);
              const isExpanded = expandedSystems[group.systemName];

              return (
                <React.Fragment key={group.systemName}>
                  {/* System Level Row */}
                  <tr 
                    className="border-b border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer group"
                    onClick={() => toggleSystem(group.systemName)}
                  >
                    <td className="py-4 px-4 font-bold text-[#1A1A1A]">{group.department}</td>
                    <td className="py-4 px-4 font-bold text-[#1A1A1A] flex items-center gap-2">
                      {isExpanded ? <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-black"/> : <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-black"/>}
                      {group.systemName}
                    </td>
                    <td className="py-4 px-4 text-gray-400 text-[11px] font-medium tracking-widest uppercase">[{group.items.length} 个目录项]</td>
                    <td className="py-4 px-4 text-gray-400 font-mono text-[11px]">--</td>
                    <td className="py-4 px-4 text-center">
                      <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-widest border ${
                        isAllLinked ? 'border-[#1A1A1A] text-[#1A1A1A] bg-white' : 'border-amber-400 text-amber-500 bg-amber-50'
                      }`}>
                        {isAllLinked ? '是' : '否'}
                      </span>
                    </td>
                    <td className="py-4 pl-4 text-right">
                      {!isAllLinked && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleOpenAI(group.systemName); }}
                          className="flex items-center ml-auto gap-1 text-[11px] font-bold uppercase tracking-widest text-[#1A1A1A] hover:bg-gray-200 px-3 py-1.5 rounded-sm transition-colors border border-black"
                        >
                          <Database className="w-3 h-3" /> AI 填报
                        </button>
                      )}
                    </td>
                  </tr>

                  {/* Children Directory Rows */}
                  {isExpanded && group.items.map((item, index) => (
                    <tr key={item.id} className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${index === group.items.length - 1 ? 'border-b-2 border-black/10' : ''}`}>
                      <td className="py-3 px-4"></td>
                      <td className="py-3 px-4"></td>
                      <td className="py-3 px-4 text-gray-700 font-medium flex items-center gap-2">
                        <span className="text-gray-300 font-serif">└─</span>
                        {item.catalogName}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-gray-500">{item.createTime}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-widest border ${
                          item.isLinkedToSource ? 'border-[#1A1A1A] text-[#1A1A1A] bg-gray-50' : 'border-amber-400 text-amber-500 bg-amber-50'
                        }`}>
                          {item.isLinkedToSource ? '是' : '否'}
                        </span>
                      </td>
                      <td className="py-3 pl-4 text-right">
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleOpenManual(item.id); }}
                          className="underline underline-offset-4 text-[11px] font-bold uppercase tracking-widest text-[#1A1A1A] hover:text-gray-500"
                        >
                          {item.isLinkedToSource ? '编辑源库表' : '填报源库表'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Manual Fill Modal */}
      <AnimatePresence>
        {isManualModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} className="bg-[#FDFCFB] p-8 shadow-2xl max-w-lg w-full border-2 border-black relative">
              <h3 className="font-serif text-2xl italic tracking-tight text-[#1A1A1A] mb-6 border-b border-black pb-4">源库表SQL填报</h3>
              <form onSubmit={handleManualSubmit}>
                <textarea
                  className="w-full border border-gray-300 p-4 font-mono text-sm min-h-[200px] focus:outline-none focus:border-black resize-none mb-6 bg-white placeholder:text-gray-400 placeholder:font-sans"
                  placeholder="请输入源库表 SQL 建表语句..."
                  value={manualSqlInput}
                  onChange={e => setManualSqlInput(e.target.value)}
                  autoFocus
                  required
                />
                <div className="flex justify-end gap-4">
                  <button type="button" onClick={() => setIsManualModalOpen(false)} className="px-6 py-2 text-xs font-bold text-gray-500 hover:text-black">取消</button>
                  <button type="submit" className="px-8 py-2 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors">确认</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* AI Fill Modal */}
      <AnimatePresence>
        {isAIModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} className="bg-[#FDFCFB] p-8 shadow-2xl max-w-2xl w-full border-2 border-black relative">
              <h3 className="font-serif text-2xl italic tracking-tight text-[#1A1A1A] mb-2">AI自动填报源库表</h3>
              <p className="text-xs text-gray-500 mb-6 border-b border-black pb-4">
                正在为 <span className="font-bold text-[#1A1A1A]">{activeAISystem}</span> 匹配关联信息。<br/>
                提交该应用系统的全量SQL，AI将自动解析并匹配现有数据目录。
              </p>
              <form onSubmit={handleAIFillSubmit}>
                <div className="mb-6">
                  <label className="text-[10px] uppercase font-bold text-gray-500 block mb-2">全量 SQL 脚本 / Full SQL Dump</label>
                  <textarea className="w-full border border-gray-300 p-4 font-mono text-sm min-h-[250px] focus:outline-none focus:border-black resize-none bg-white placeholder:text-gray-400 placeholder:font-sans" placeholder="在这里粘贴完整的应用系统 SQL 建表语句集合..." value={aiSqlInput} onChange={e => setAiSqlInput(e.target.value)} required />
                </div>
                <div className="flex justify-end gap-4">
                  <button type="button" onClick={() => setIsAIModalOpen(false)} className="px-6 py-2 text-xs font-bold text-gray-500 hover:text-black">取消</button>
                  <button type="submit" className="px-8 py-3 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors">提交解析</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* AI Result Notice Modal */}
      <AnimatePresence>
        {isAIResultOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} className="bg-[#FDFCFB] p-8 shadow-2xl max-w-md w-full border-2 border-black relative text-center">
              <div className="w-16 h-16 bg-black text-white flex items-center justify-center mx-auto mb-6">
                <Check className="w-8 h-8" />
              </div>
              <h3 className="font-serif text-2xl italic tracking-tight text-[#1A1A1A] mb-4">自动匹配完成</h3>
              <p className="text-sm font-medium text-gray-600 mb-6 leading-relaxed">
                针对 <span className="font-bold text-black border-b border-black">{activeAISystem}</span> 已为您自动匹配数据目录成功 <span className="font-bold underline decoration-black underline-offset-4 mx-1">{aiResult.successCount}</span> 条、
                失败 <span className="font-bold text-amber-600 underline decoration-amber-600 underline-offset-4 mx-1">{aiResult.failCount}</span> 条。
              </p>
              
              {aiResult.failCount > 0 && (
                <div className="text-left bg-gray-50 border border-gray-200 p-4 mb-8 text-sm text-[#1A1A1A] max-h-[150px] overflow-y-auto">
                  <p className="text-[10px] uppercase font-bold text-gray-500 mb-2">失败表名：</p>
                  <ol className="list-decimal pl-4 space-y-1">
                    {aiResult.failedNames.map((name, i) => (
                      <li key={i}>{name}</li>
                    ))}
                  </ol>
                </div>
              )}

              <div className="flex justify-center gap-4">
                <button onClick={() => setIsAIResultOpen(false)} className="px-6 py-2 text-xs font-bold text-gray-500 hover:text-black border border-transparent">关闭</button>
                <button onClick={() => { setIsAIResultOpen(false); setIsAIDetailsOpen(true); }} className="px-8 py-2 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors">
                  查看详情
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* AI Details View Modal */}
      <AnimatePresence>
        {isAIDetailsOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} className="bg-[#FDFCFB] p-8 shadow-2xl max-w-3xl w-full max-h-[85vh] overflow-y-auto border-2 border-black relative">
              <button onClick={() => setIsAIDetailsOpen(false)} className="absolute top-6 right-6 text-gray-400 hover:text-black">
                <CloseIcon className="w-6 h-6" />
              </button>
              
              <h3 className="font-serif text-3xl italic tracking-tight text-[#1A1A1A] mb-8 border-b-2 border-black pb-4">匹配记录明细</h3>
              
              <div className="mb-8">
                <h4 className="text-[11px] uppercase font-bold text-gray-500 border-l-2 border-black pl-2 mb-4 tracking-widest">操作记录</h4>
                <ul className="space-y-2 text-sm text-[#1A1A1A] font-medium ml-3 list-disc list-inside">
                  <li>数据目录-救助记录信息，是否引用源库表状态“否” ➡ “是”</li>
                  <li>数据目录-困难申报记录信息，是否引用源库表状态“否” ➡ “是”</li>
                  <li>数据目录-困难申请人家庭成员信息，是否引用源库表状态“否” ➡ “是”</li>
                  <li>数据目录-困难申请人家庭信息，是否引用源库表状态“否” ➡ “是”</li>
                  <li>数据目录-救助金管理信息，是否引用源库表状态“否” ➡ “是”</li>
                </ul>
              </div>

              <div className="mb-8">
                <h4 className="text-[11px] uppercase font-bold text-amber-600 border-l-2 border-amber-500 pl-2 mb-4 tracking-widest">操作失败记录</h4>
                <ul className="space-y-2 text-sm text-[#1A1A1A] font-medium ml-3 list-disc list-inside">
                  <li>数据目录-用户管理数据，未找到已有数据目录资源，请返回首页找到对应目录右侧点击填报按钮。</li>
                </ul>
              </div>

              <div className="mb-6">
                 <h4 className="text-[11px] uppercase font-bold text-gray-500 border-l-2 border-black pl-2 mb-4 tracking-widest">匹配明细-救助金管理</h4>
                 
                 <div className="bg-white border border-gray-200 p-6 shadow-sm">
                   <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                      <div><span className="text-gray-500 mr-2">应用系统:</span><span className="font-medium">XX医保系统</span></div>
                      <div><span className="text-gray-500 mr-2">目录名称:</span><span className="font-medium">救助金管理信息</span></div>
                      <div className="col-span-2"><span className="text-gray-500 mr-2">数据项:</span><span className="font-medium">申请人、申请救助金金额</span></div>
                   </div>

                   <div className="border-t border-gray-100 pt-4">
                     <span className="text-[10px] uppercase font-bold text-gray-400 mb-2 block">源库表信息 :</span>
                     <pre className="bg-gray-50 p-4 text-[12px] font-mono text-[#1A1A1A] overflow-x-auto whitespace-pre-wrap">
{`CREATE TABLE \`救助金管理信息\` (
  \`year\` VARCHAR(200) DEFAULT NULL COMMENT '年度',
  \`difficulty_id\` VARCHAR(200)  COMMENT '困难申报ID',
  \`apply_num\` VARCHAR(200) DEFAULT NULL COMMENT '申请编码',
  \`apply_user_id\` VARCHAR(200) DEFAULT NULL COMMENT '申请人',
  \`apply_fund\` VARCHAR(200) DEFAULT NULL COMMENT '申请救助金金额',
  \`apply_fund_use\` VARCHAR(200) DEFAULT NULL COMMENT '救助金用途',
  \`account_name\` VARCHAR(200) DEFAULT NULL COMMENT '账户名',
  \`bank_name\` VARCHAR(200) DEFAULT NULL COMMENT '银行名',
  \`account_bank_no\` VARCHAR(200) DEFAULT NULL COMMENT '银行卡号',
  \`apply_time\` VARCHAR(200) DEFAULT NULL COMMENT '申请时间',
  \`apply_status\` VARCHAR(200) DEFAULT NULL COMMENT '状态',
  \`operate_id\` VARCHAR(200) DEFAULT NULL COMMENT '操作人',
  \`handle_comment\` VARCHAR(200) DEFAULT NULL COMMENT '初审不通过原因/复审不通过原因/失效原因'
,
  PRIMARY KEY (\`difficulty_id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='救助金管理信息'`}
                     </pre>
                   </div>
                 </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
