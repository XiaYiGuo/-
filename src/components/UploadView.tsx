import React, { useCallback, useState } from 'react';
import { UploadCloud } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

interface UploadViewProps {
  onUpload: (file: File) => void;
}

export function UploadView({ onUpload }: UploadViewProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls') || file.type.includes('excel') || file.type.includes('spreadsheetml')) {
        onUpload(file);
      } else {
        alert('请上传 Excel 格式文件 (.xlsx, .xls)');
      }
    }
  }, [onUpload]);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onUpload(e.target.files[0]);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-xl mx-auto w-full pt-16 flex flex-col justify-center"
    >
      <header className="mb-12">
        <h2 className="text-4xl font-serif leading-tight italic border-b-2 border-black pb-4 mb-2">
          核心业务事项上传
        </h2>
        <p className="text-sm text-gray-500 font-medium">上传存量核心业务事项清单以进行自动化核验</p>
      </header>

      <div className="mb-10">
        <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400 block mb-4">1. 数据文件来源</label>
        
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={cn(
            "relative border-2 border-dashed rounded-lg p-12 text-center transition-all duration-200",
            isDragOver 
              ? "border-black bg-gray-50/50" 
              : "border-gray-200 hover:border-black cursor-pointer bg-transparent"
          )}
        >
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileInput}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <UploadCloud className="w-8 h-8 mx-auto mb-4 text-gray-400" />
          <p className="text-sm font-medium text-[#1A1A1A] mb-1">拖拽 Excel 文件至此处或点击</p>
          <p className="text-[10px] text-gray-400 uppercase tracking-[0.1em]">支持 .xlsx / .xls 格式</p>
        </div>
      </div>
    </motion.div>
  );
}
