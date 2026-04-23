import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DataCatalogItem, DataCatalogReportData } from '../../types';
import { Database, FileCode, Check, X as CloseIcon, ChevronDown, ChevronRight } from 'lucide-react';

interface CatalogOverviewProps {
  onGenerateReport: () => void;
  onViewHistory: () => void;
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

export function CatalogOverview({ onGenerateReport, onViewHistory }: CatalogOverviewProps) {
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
  const [manualFileName, setManualFileName] = useState('');
  
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [activeAISystem, setActiveAISystem] = useState('');
  const [aiSqlInput, setAiSqlInput] = useState('');
  const [aiFileName, setAiFileName] = useState('');
  
  const [isAIResultOpen, setIsAIResultOpen] = useState(false);
  const [aiResult, setAiResult] = useState<{ successCount: number; failCount: number; failedNames: string[] }>({
    successCount: 0, failCount: 0, failedNames: []
  });
  const [isAIDetailsOpen, setIsAIDetailsOpen] = useState(false);

  const [returnToAIDetails, setReturnToAIDetails] = useState(false);

  // Pending match states for AI Details Confirm
  const [pendingMatches, setPendingMatches] = useState<any[]>([]);
  const [pendingFailures, setPendingFailures] = useState<any[]>([]);

  const handleOpenAI = (sysName: string) => {
    setActiveAISystem(sysName);
    setAiSqlInput('');
    setAiFileName('');
    setIsAIModalOpen(true);
  };

  // --- Actions ---
  const handleOpenManual = (id: string) => {
    setActiveCatalogId(id);
    const item = items.find(i => i.id === id);
    setManualSqlInput(item?.sourceSql || '');
    setManualFileName('');
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
    if (returnToAIDetails) {
      setIsAIDetailsOpen(true);
      setReturnToAIDetails(false);
    }
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
      const tempMatches: any[] = [];
      const tempFailures: any[] = [];

      items.forEach(item => {
        if (item.systemName === activeAISystem && !item.isLinkedToSource) {
          const tableName = item.catalogName;
          const escapedName = tableName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const regex = new RegExp(`CREATE TABLE.*?\\\`${escapedName}\\\`[\\s\\S]*?;`, 'i');
          const match = aiSqlInput.match(regex);
          
          if (match) {
            successCount++;
            tempMatches.push({ 
              catalogId: item.id, 
              catalogName: item.catalogName, 
              tableName: tableName, 
              sql: `-- [AI 智能匹配提取的库表结构 - 来源系统: ${activeAISystem}]\n${match[0]}` 
            });
          } else {
            failCount++;
            failedNames.push(item.catalogName);
            tempFailures.push({ 
              catalogId: item.id, 
              catalogName: item.catalogName 
            });
          }
        }
      });
      
      setPendingMatches(tempMatches);
      setPendingFailures(tempFailures);
      setAiResult({ successCount, failCount, failedNames });
      setIsAIResultOpen(true);
    }, 1500);
  };

  const handleConfirmAIDetails = () => {
    setItems(prev => prev.map(item => {
      const match = pendingMatches.find(m => m.catalogId === item.id);
      if (match) {
        return { ...item, isLinkedToSource: true, sourceSql: match.sql };
      }
      return item;
    }));
    setIsAIDetailsOpen(false);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full">
      <div className="flex justify-between items-end mb-8 border-b-2 border-black pb-4">
        <div>
          <h2 className="text-3xl font-serif  text-[#1A1A1A]">数据目录总览</h2>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Data Catalog Management</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={onViewHistory}
            className="flex items-center gap-2 px-6 py-2.5 border-2 border-black text-black bg-white text-[10px] font-bold uppercase tracking-widest hover:bg-gray-50 transition-colors"
          >
            历史报告
          </button>
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
              <th className="py-4 px-4 font-normal w-56">系统名称</th>
              <th className="py-4 px-4 font-normal">数据目录名称</th>
              <th className="py-4 px-4 font-normal w-32">创建时间</th>
              <th className="py-4 px-4 font-normal text-center w-36">是否上传SQL</th>
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
                          <Database className="w-3 h-3" /> 上传SQL
                        </button>
                      )}
                    </td>
                  </tr>

                  {/* Children Directory Rows */}
                  {isExpanded && group.items.map((item, index) => (
                    <tr key={item.id} className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${index === group.items.length - 1 ? 'border-b-2 border-black/10' : ''}`}>
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
                          {item.isLinkedToSource ? '修改SQL' : '上传SQL'}
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
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} className="bg-[#FDFCFB] p-8 shadow-2xl max-w-2xl w-full border-2 border-black relative">
              <h3 className="font-serif text-2xl  tracking-tight text-[#1A1A1A] mb-6 border-b border-black pb-4">上传源库表 SQL</h3>
              <form onSubmit={handleManualSubmit}>
                <div className="border border-dashed border-gray-400 p-6 text-center bg-gray-50 mb-4 relative hover:bg-gray-100 transition-colors">
                  <input type="file" accept=".sql,.txt" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if(file) {
                      setManualFileName(file.name);
                      const r = new FileReader();
                      r.onload = ev => setManualSqlInput(ev.target?.result as string);
                      r.readAsText(file);
                    }
                  }} />
                  <Database className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-[#1A1A1A] font-bold">点击或拖拽上传 SQL 文件</p>
                  <p className="text-[10px] text-gray-500 mt-1 uppercase">{manualFileName || '支持 .sql, .txt 格式'}</p>
                </div>
                
                <div className="text-center text-xs text-gray-400 mb-4 uppercase tracking-widest">- 或者直接输入 -</div>
                
                <textarea
                  className="w-full border border-gray-300 p-4 font-mono text-xs min-h-[160px] focus:outline-none focus:border-black resize-none mb-6 bg-white placeholder:text-gray-400 placeholder:font-sans"
                  placeholder="在此处粘贴你的 SQL 建表语句..."
                  value={manualSqlInput}
                  onChange={e => {
                    setManualSqlInput(e.target.value);
                    if (!e.target.value) setManualFileName('');
                  }}
                  required
                />
                
                <div className="flex justify-end gap-4">
                  <button type="button" onClick={() => {
                      setIsManualModalOpen(false);
                      if (returnToAIDetails) {
                          setIsAIDetailsOpen(true);
                          setReturnToAIDetails(false);
                      }
                  }} className="px-6 py-2 text-xs font-bold text-gray-500 hover:text-black">取消</button>
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
              <h3 className="font-serif text-2xl  tracking-tight text-[#1A1A1A] mb-2">上传全量系统 SQL</h3>
              <p className="text-xs text-gray-500 mb-6 border-b border-black pb-4">
                正在为 <span className="font-bold text-[#1A1A1A]">{activeAISystem}</span> 匹配关联信息。<br/>
                上传或直接输入该应用系统的全量SQL，系统将自动解析并匹配现有数据目录。
              </p>
              <form onSubmit={handleAIFillSubmit}>
                <div className="mb-6">
                  <label className="text-[10px] uppercase font-bold text-gray-500 block mb-2">全量 SQL 脚本文件 / Full SQL Dump</label>
                  <div className="border border-dashed border-gray-400 p-8 text-center bg-gray-50 relative hover:bg-gray-100 transition-colors mb-4">
                    <input type="file" accept=".sql,.txt" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={(e) => {
                      const file = e.target.files?.[0];
                      if(file) {
                        setAiFileName(file.name);
                        const r = new FileReader();
                        r.onload = ev => setAiSqlInput(ev.target?.result as string);
                        r.readAsText(file);
                      }
                    }} />
                    <Database className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-[#1A1A1A] font-bold">点击或拖拽上传该系统全量 SQL 文件</p>
                    <p className="text-xs text-gray-500 mt-1 uppercase">{aiFileName || '支持 .sql, .txt 格式'}</p>
                  </div>

                  <div className="text-center text-xs text-gray-400 mb-4 uppercase tracking-widest">- 或者直接输入 -</div>

                  <textarea
                    className="w-full border border-gray-300 p-4 font-mono text-xs min-h-[160px] focus:outline-none focus:border-black resize-none bg-white placeholder:text-gray-400 placeholder:font-sans"
                    placeholder="在此处粘贴完整的应用系统 SQL 建表语句集合..."
                    value={aiSqlInput}
                    onChange={e => {
                        setAiSqlInput(e.target.value);
                        if(!e.target.value) setAiFileName('');
                    }}
                    required
                  />
                </div>
                <div className="flex justify-end gap-4">
                  <button type="button" onClick={() => setIsAIModalOpen(false)} className="px-6 py-2 text-xs font-bold text-gray-500 hover:text-black">取消</button>
                  <button type="submit" className="px-8 py-3 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors" disabled={!aiSqlInput.trim()}>提交解析</button>
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
              <h3 className="font-serif text-2xl  tracking-tight text-[#1A1A1A] mb-4">自动匹配完成</h3>
              <p className="text-sm font-medium text-gray-600 mb-6 leading-relaxed">
                已为匹配数据目录 <span className="font-bold underline decoration-black underline-offset-4 mx-1">{aiResult.successCount}</span> 条、
                失败 <span className="font-bold text-amber-600 underline decoration-amber-600 underline-offset-4 mx-1">{aiResult.failCount}</span> 条。
              </p>
              
              {aiResult.failCount > 0 && (
                <div className="text-left bg-gray-50 border border-gray-200 p-4 mb-8 text-sm text-[#1A1A1A] max-h-[150px] overflow-y-auto">
                  <p className="text-[10px] uppercase font-bold text-gray-500 mb-2">失败表名如下：</p>
                  <ol className="list-decimal pl-4 space-y-1">
                    {aiResult.failedNames.map((name, i) => (
                      <li key={i}>{name}</li>
                    ))}
                  </ol>
                </div>
              )}

              <div className="flex justify-center gap-4">
                <button onClick={() => { setIsAIResultOpen(false); setIsAIDetailsOpen(true); }} className="px-8 py-3 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors">
                  下一步
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
              
              <h3 className="font-serif text-3xl  tracking-tight text-[#1A1A1A] mb-8 border-b-2 border-black pb-4">确认匹配详情</h3>
              
              <div className="mb-8">
                <h4 className="text-[13px] font-bold text-black mb-4 flex items-center gap-2">
                  <span className="w-4 h-4 bg-green-100 text-green-600 flex items-center justify-center rounded-sm">✓</span> 
                  请确认匹配目录：
                </h4>
                <table className="w-full text-left border-collapse border border-gray-200 mb-2">
                  <thead className="bg-[#1A1A1A] text-white">
                    <tr className="text-[11px] font-bold border-b border-gray-200">
                      <th className="py-2.5 px-4 w-1/2">数据目录名称</th>
                      <th className="py-2.5 px-4 w-1/3">数据表名称</th>
                      <th className="py-2.5 px-4 w-24 text-center">操作</th>
                    </tr>
                  </thead>
                  <tbody className="text-[13px] text-[#1A1A1A]">
                    {pendingMatches.map((m, i) => (
                      <tr key={i} className="border-b border-gray-100 transition-colors hover:bg-gray-50">
                        <td className="py-3 px-4 border-r border-gray-100">{m.catalogName}</td>
                        <td className="py-3 px-4 border-r border-gray-100 font-mono text-xs">{m.tableName}</td>
                        <td className="py-3 px-4 text-center">
                          <button onClick={(e) => {
                             setReturnToAIDetails(true);
                             setIsAIDetailsOpen(false);
                             handleOpenManual(m.catalogId);
                          }} className="text-gray-500 hover:text-black underline underline-offset-4 text-[11px] tracking-wider uppercase font-bold">修改</button>
                        </td>
                      </tr>
                    ))}
                    {pendingMatches.length === 0 && (
                       <tr><td colSpan={3} className="py-6 text-center text-gray-400  font-serif">暂无匹配记录</td></tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="mb-8">
                <h4 className="text-[13px] font-bold text-black mb-4 flex items-center gap-2">
                  <span className="w-4 h-4 bg-amber-100 text-amber-600 flex items-center justify-center rounded-sm">!</span>
                  请确认失败记录：
                </h4>
                <table className="w-full text-left border-collapse border border-gray-200 mb-6">
                  <thead className="bg-[#1A1A1A] text-white">
                    <tr className="text-[11px] font-bold border-b border-gray-200">
                      <th className="py-2.5 px-4 w-1/2">数据目录名称</th>
                      <th className="py-2.5 px-4 w-1/3">数据表名称</th>
                      <th className="py-2.5 px-4 w-24 text-center">操作</th>
                    </tr>
                  </thead>
                  <tbody className="text-[13px] text-[#1A1A1A]">
                    {pendingFailures.map((f, i) => (
                      <tr key={i} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4 border-r border-gray-100 text-gray-600">{f.catalogName}</td>
                        <td className="py-3 px-4 border-r border-gray-100 text-center text-gray-400">-</td>
                        <td className="py-3 px-4 text-center">
                          <button onClick={(e) => {
                             setReturnToAIDetails(true);
                             setIsAIDetailsOpen(false);
                             handleOpenManual(f.catalogId);
                          }} className="text-gray-500 hover:text-black underline underline-offset-4 text-[11px] tracking-wider uppercase font-bold">上传SQL</button>
                        </td>
                      </tr>
                    ))}
                    {pendingFailures.length === 0 && (
                       <tr><td colSpan={3} className="py-6 text-center text-gray-400  font-serif">暂无失败记录</td></tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end pt-6 border-t border-black/10">
                 <button onClick={handleConfirmAIDetails} className="px-8 py-3 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors">
                   确认
                 </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
