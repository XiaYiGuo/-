import React, { useState } from 'react';
import { UploadView } from './components/UploadView';
import { AnalyzingView } from './components/AnalyzingView';
import { ReportView } from './components/ReportView';
import { AdminDashboard } from './components/AdminDashboard';
import { LandingView } from './components/LandingView';
import { CatalogOverview } from './components/datacatalog/CatalogOverview';
import { CatalogReportView } from './components/datacatalog/CatalogReportView';
import { CatalogAdminDashboard } from './components/datacatalog/CatalogAdminDashboard';
import { HistoryModal, HistoryItem } from './components/HistoryModal';
import { parseExcelAndAnalyze, loadMockData } from './lib/parser';
import { ReportData } from './types';

const MOCK_CORE_HISTORY: HistoryItem[] = [
  { id: '1', name: '市直各部门核心业务事项核验报告', date: '2023-11-20 15:30:00', status: '已归档' },
  { id: '2', name: '交通运输局核心业务事项补充核验', date: '2023-10-15 10:00:00', status: '已归档' }
];

const MOCK_CATALOG_HISTORY: HistoryItem[] = [
  { id: '1', name: '市政数据目录自动化核验（全量）', date: '2023-11-18 14:20:00', status: '已归档' },
  { id: '2', name: '卫健委数据目录核验报告', date: '2023-10-10 09:12:00', status: '已归档' }
];

export default function App() {
  const [appMode, setAppMode] = useState<'landing' | 'core' | 'catalog'>('landing');
  
  // Core Business State
  const [coreView, setCoreView] = useState<'upload' | 'analyzing' | 'report' | 'admin'>('upload');
  const [reportData, setReportData] = useState<ReportData | null>(null);

  // Data Catalog State
  const [catalogView, setCatalogView] = useState<'overview' | 'report' | 'admin'>('overview');

  // History Modals State
  const [isCoreHistoryOpen, setIsCoreHistoryOpen] = useState(false);
  const [isCatalogHistoryOpen, setIsCatalogHistoryOpen] = useState(false);

  const handleCoreUpload = async (file: File) => {
    setCoreView('analyzing');
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      const result = await parseExcelAndAnalyze(file);
      await new Promise(resolve => setTimeout(resolve, 2000));
      setReportData(result);
      setCoreView('report');
    } catch (err) {
      console.error(err);
      alert('解析文件时发生错误，请检查 Excel 格式');
      setCoreView('upload');
    }
  };

  const handleCoreReset = () => {
    setReportData(null);
    setCoreView('upload');
  };

  const currentTitle = appMode === 'landing' 
    ? 'AI数据服务场景' 
    : appMode === 'core' 
      ? '核心业务核验智能体'
      : '数据目录核验智能体';

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFCFB] text-[#1A1A1A]">
      {/* Top Navbar */}
      <header className="border-b border-black/10 px-8 py-6 w-full flex justify-between items-center bg-[#FDFCFB]">
        <div className="flex items-center gap-4">
          <div 
             onClick={() => { setAppMode('landing'); setCoreView('upload'); setCatalogView('overview'); }}
             className="w-8 h-8 bg-black flex items-center justify-center rounded-sm cursor-pointer hover:-translate-y-0.5 transition-transform"
          >
             <span className="text-white font-serif text-lg">AI</span>
          </div>
          <span className="font-serif  text-xl tracking-tight">{currentTitle}</span>
        </div>
        
        {appMode === 'core' && (
          <div className="flex items-center gap-6">
            {coreView !== 'admin' && (
              <button 
                onClick={() => setCoreView('admin')}
                className="text-[10px] font-bold uppercase tracking-widest px-4 py-2 border border-black hover:bg-black hover:text-white transition-colors hidden sm:block"
              >
                进入后台管理
              </button>
            )}
            <div className="text-[10px] text-gray-400 uppercase tracking-widest text-right leading-relaxed hidden sm:block">
              AI事项核验智能体<br/>
              v2.4.1
            </div>
          </div>
        )}

        {appMode === 'catalog' && (
          <div className="flex items-center gap-6">
            {catalogView !== 'admin' && (
              <button 
                onClick={() => setCatalogView('admin')}
                className="text-[11px] font-bold uppercase tracking-widest text-gray-500 hover:text-black transition-colors"
               >
                进入后台管理
              </button>
            )}
            <div className="text-[10px] text-gray-400 uppercase tracking-widest text-right leading-relaxed hidden sm:block">
              数据目录智能管理<br/>
              v1.0.0
            </div>
          </div>
        )}
      </header>

      {/* Landing Mode */}
      {appMode === 'landing' && (
        <main className="flex-1 w-full flex p-8 md:p-12 max-w-6xl mx-auto">
          <LandingView onSelectMode={(mode) => setAppMode(mode)} />
        </main>
      )}

      {/* Core Business Mode */}
      {appMode === 'core' && (
        <>
          {coreView === 'admin' ? (
             <AdminDashboard onBack={() => setCoreView('upload')} />
          ) : (
            <main className="flex-1 w-full flex p-8 md:p-12 max-w-6xl mx-auto">
              {coreView === 'upload' && (
                <UploadView 
                  onUpload={handleCoreUpload} 
                  onViewHistory={() => setIsCoreHistoryOpen(true)} 
                />
              )}
              
              {coreView === 'analyzing' && (
                <div className="m-auto w-full">
                  <AnalyzingView />
                </div>
              )}
              
              {coreView === 'report' && reportData && (
                <ReportView 
                  data={reportData} 
                  onReset={handleCoreReset} 
                  onViewHistory={() => setIsCoreHistoryOpen(true)}
                />
              )}
            </main>
          )}
        </>
      )}

      {/* Data Catalog Mode */}
      {appMode === 'catalog' && (
        <>
          {catalogView === 'admin' ? (
             <CatalogAdminDashboard onBack={() => setCatalogView('overview')} />
          ) : (
            <main className="flex-1 w-full flex p-8 md:p-12 max-w-6xl mx-auto">
               {catalogView === 'overview' && (
                 <CatalogOverview 
                    onGenerateReport={() => setCatalogView('report')} 
                    onViewHistory={() => setIsCatalogHistoryOpen(true)}
                 />
               )}
               {catalogView === 'report' && (
                 <CatalogReportView onBack={() => setCatalogView('overview')} />
               )}
            </main>
          )}
        </>
      )}

      {/* History Modals */}
      <HistoryModal
        isOpen={isCoreHistoryOpen}
        onClose={() => setIsCoreHistoryOpen(false)}
        title="核心业务事项历史报告"
        items={MOCK_CORE_HISTORY}
        onSelectItem={async (item) => {
          setIsCoreHistoryOpen(false);
          // Simulate loading history report data
          const data = await loadMockData();
          setReportData(data);
          setCoreView('report');
        }}
      />

      <HistoryModal
        isOpen={isCatalogHistoryOpen}
        onClose={() => setIsCatalogHistoryOpen(false)}
        title="数据目录核验历史报告"
        items={MOCK_CATALOG_HISTORY}
        onSelectItem={(item) => {
          setIsCatalogHistoryOpen(false);
          setCatalogView('report');
        }}
      />
    </div>
  );
}
