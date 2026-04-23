import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, FileText } from 'lucide-react';

export interface HistoryItem {
  id: string;
  name: string;
  date: string;
  status: string;
}

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  items: HistoryItem[];
  onSelectItem: (item: HistoryItem) => void;
}

export function HistoryModal({ isOpen, onClose, title, items, onSelectItem }: HistoryModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 10 }} 
          animate={{ opacity: 1, scale: 1, y: 0 }} 
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-[#FDFCFB] p-8 shadow-2xl max-w-2xl w-full border-2 border-black relative max-h-[80vh] flex flex-col"
        >
          <button onClick={onClose} className="absolute top-6 right-6 text-gray-400 hover:text-black">
            <X className="w-5 h-5" />
          </button>
          
          <h3 className="font-serif text-2xl  tracking-tight text-[#1A1A1A] mb-6 border-b border-black pb-4">
            {title}
          </h3>

          <div className="overflow-y-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[10px] uppercase tracking-widest font-bold text-gray-400 border-b border-gray-200">
                  <th className="py-3 px-4 font-normal">报告名称</th>
                  <th className="py-3 px-4 font-normal w-40">核验时间</th>
                  <th className="py-3 px-4 font-normal text-center w-28">状态</th>
                  <th className="py-3 px-4 font-normal text-right w-24">操作</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-gray-400  font-serif">
                      暂无历史报告
                    </td>
                  </tr>
                ) : (
                  items.map((item, i) => (
                    <tr key={i} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-4 font-medium text-[#1A1A1A] flex items-center gap-2">
                        <FileText className="w-4 h-4 text-gray-400" />
                        {item.name}
                      </td>
                      <td className="py-4 px-4 font-mono text-[11px] text-gray-500">
                        {item.date}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="px-2 py-1 text-[10px] font-bold uppercase tracking-widest border border-black bg-white text-black">
                          {item.status}
                        </span>
                      </td>
                      <td className="py-4 pl-4 text-right">
                        <button 
                          onClick={() => onSelectItem(item)}
                          className="underline underline-offset-4 text-[11px] font-bold uppercase tracking-widest text-[#1A1A1A] hover:text-gray-500"
                        >
                          查看
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
