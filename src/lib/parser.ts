import * as XLSX from 'xlsx';
import { ReportData, RawBusinessItem, ProcessedBusinessItem, ProblemDetail } from '../types';
import { format } from 'date-fns';

export async function parseExcelAndAnalyze(file: File): Promise<ReportData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert to JSON
        const rawJson: any[] = XLSX.utils.sheet_to_json(worksheet);
        
        const report = analyzeData(rawJson);
        resolve(report);
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
}

function analyzeData(rawJson: any[]): ReportData {
  const items: ProcessedBusinessItem[] = [];
  const problems: ProblemDetail[] = [];
  
  let missingDescCount = 0;
  let duplicateCount = 0;
  
  // To detect duplicates by item name
  const seenItems = new Set<string>();

  // Attempt to find the column names flexibly
  let deptCol = '';
  let nameCol = '';
  let descCol = '';

  if (rawJson.length > 0) {
    const keys = Object.keys(rawJson[0]);
    deptCol = keys.find(k => k.includes('处室') || k.includes('部门')) || keys[0] || 'Unknown Dept';
    nameCol = keys.find(k => k.includes('名称') && k.includes('事项')) || keys[1] || 'Unknown Item';
    descCol = keys.find(k => k.includes('描述') || k.includes('说明') || k.includes('内容')) || keys[2] || 'Unknown Desc';
  }

  // Common department fallback if missing from rows
  const departmentCounter: Record<string, number> = {};

  rawJson.forEach((row, rawIndex) => {
    const index = rawIndex + 1;
    const department = row[deptCol] ? String(row[deptCol]).trim() : '未知处室';
    const itemName = row[nameCol] ? String(row[nameCol]).trim() : '未命名事项';
    const description = row[descCol] ? String(row[descCol]).trim() : '';

    // Track most common department
    if (department !== '未知处室') {
      departmentCounter[department] = (departmentCounter[department] || 0) + 1;
    }

    const processedItem: ProcessedBusinessItem = {
      id: `item-${index}`,
      index,
      department,
      itemName,
      description
    };
    items.push(processedItem);

    // AI Check 1: Missing Description
    let hasMissingDesc = false;
    if (!description || description.length < 2) {
      missingDescCount++;
      hasMissingDesc = true;
      problems.push({
        id: `prob-m-${index}`,
        index: problems.length + 1,
        department,
        itemName,
        problem: '缺失事项描述',
        suggestion: '建议补充事项详细描述以符合业务规范'
      });
    }

    // AI Check 2: Duplicates
    if (itemName && itemName !== '未命名事项') {
      if (seenItems.has(itemName)) {
        duplicateCount++;
         problems.push({
          id: `prob-d-${index}`,
          index: problems.length + 1,
          department,
          itemName,
          problem: '疑似重复',
          suggestion: '核实后建议合并或去除重复事项'
        });
      } else {
        seenItems.add(itemName);
      }
    }
  });

  // Determine main department name
  let mainDeptName = '相关';
  if (Object.keys(departmentCounter).length > 0) {
    mainDeptName = Object.keys(departmentCounter).reduce((a, b) => departmentCounter[a] > departmentCounter[b] ? a : b);
  }

  return {
    departmentName: mainDeptName,
    totalItems: items.length,
    missingDescCount,
    duplicateCount,
    items,
    problems,
    date: format(new Date(), 'yyyy年MM月dd日')
  };
}

export async function loadMockData(): Promise<ReportData> {
  // Returns a promise that resolves after a short delay
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockJson = [
        { "处室": "财务处", "事项名称": "预算审批流程", "事项描述": "年度及月度预算审批的标准流程。" },
        { "处室": "财务处", "事项名称": "差旅报销审验", "事项描述": "" }, // Missing desc
        { "处室": "财务处", "事项名称": "发票核销", "事项描述": "增值税专用发票的验真与核销步骤。" },
        { "处室": "人事处", "事项名称": "员工入职办理", "事项描述": "新老员工入职及劳动合同签订。" },
        { "处室": "人事处", "事项名称": "员工入职办理", "事项描述": "劳动合同及相关材料复核。" }, // Duplicate
        { "处室": "技术部", "事项名称": "服务器权限开通", "事项描述": "数据中心生产服务器临时权限申请流程。" },
        { "处室": "技术部", "事项名称": "堡垒机权限分配", "事项描述": "" }, // Missing desc
        { "处室": "行政部", "事项名称": "办公用品领用", "事项描述": "常用耗材及固定资产申领。" },
        { "处室": "行政部", "事项名称": "办公用品领用", "事项描述": "耗材申领流程补充。" } // Duplicate
      ];
      resolve(analyzeData(mockJson));
    }, 1500); // simulate upload processing time
  });
}
