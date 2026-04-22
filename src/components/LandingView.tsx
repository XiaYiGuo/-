import React from 'react';
import { motion } from 'motion/react';
import { FileText, Database } from 'lucide-react';

interface LandingViewProps {
  onSelectMode: (mode: 'core' | 'catalog') => void;
}

export function LandingView({ onSelectMode }: LandingViewProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto w-full pt-16 flex flex-col justify-center"
    >
      <header className="mb-16 text-center">
        <h2 className="text-4xl font-serif leading-tight italic border-b-2 border-black inline-block pb-4 mb-4">
          AI数据服务场景
        </h2>
        <p className="text-sm text-gray-500 font-medium">请选择您要核验的业务场景</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Scenario 1: Core Business Items */}
        <button
          onClick={() => onSelectMode('core')}
          className="flex flex-col items-center justify-center p-12 border-2 border-gray-200 hover:border-black bg-white hover:bg-gray-50 transition-all duration-300 text-left group"
        >
          <div className="w-16 h-16 bg-black text-white flex items-center justify-center mb-8 rounded-sm group-hover:-translate-y-1 transition-transform">
            <FileText className="w-8 h-8" />
          </div>
          <h3 className="text-2xl font-serif italic font-bold mb-4 text-[#1A1A1A]">核心业务事项核验</h3>
          <p className="text-sm text-gray-500 text-center leading-relaxed">
            上传业务清单Excel文件，AI自动审核内容是否缺失、重复，并出具对齐规范的核验报告。
          </p>
          <div className="mt-8 text-[10px] uppercase font-bold tracking-widest text-black border-b border-black pb-1">
            进入核验 &rarr;
          </div>
        </button>

        {/* Scenario 2: Data Catalog Quality */}
        <button
          onClick={() => onSelectMode('catalog')}
          className="flex flex-col items-center justify-center p-12 border-2 border-gray-200 hover:border-black bg-white hover:bg-gray-50 transition-all duration-300 text-left group"
        >
          <div className="w-16 h-16 bg-black text-white flex items-center justify-center mb-8 rounded-sm group-hover:-translate-y-1 transition-transform">
            <Database className="w-8 h-8" />
          </div>
          <h3 className="text-2xl font-serif italic font-bold mb-4 text-[#1A1A1A]">数据目录质量核验</h3>
          <p className="text-sm text-gray-500 text-center leading-relaxed">
            管理存量数据目录，支持AI一键匹配源库表SQL文件，自动检查字段合规性并生成报告。
          </p>
          <div className="mt-8 text-[10px] uppercase font-bold tracking-widest text-[#1A1A1A] border-b border-[#1A1A1A] pb-1">
            进入核验 &rarr;
          </div>
        </button>
      </div>
    </motion.div>
  );
}
