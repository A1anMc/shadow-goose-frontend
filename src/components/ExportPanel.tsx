import { useState } from 'react';
import { exportService } from '../lib/export';
import { excelService } from '../lib/excel';

interface ExportPanelProps {
  data: any;
  dataType: 'dashboard' | 'projects' | 'okrs' | 'grants' | 'custom';
  onExport?: () => void;
}

export default function ExportPanel({ data, dataType, onExport }: ExportPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportType, setExportType] = useState<'pdf' | 'excel' | 'csv'>('pdf');

  const handleExport = async (type: 'pdf' | 'excel' | 'csv') => {
    try {
      setExporting(true);
      setExportType(type);

      switch (type) {
        case 'pdf':
          await handlePDFExport();
          break;
        case 'excel':
          await handleExcelExport();
          break;
        case 'csv':
          await handleCSVExport();
          break;
      }

      onExport?.();
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const handlePDFExport = async () => {
    switch (dataType) {
      case 'dashboard':
        await exportService.generateExecutiveSummary(data);
        break;
      case 'projects':
        if (Array.isArray(data)) {
          data.forEach(project => {
            exportService.generateProjectReport(project);
          });
        } else {
          await exportService.generateProjectReport(data);
        }
        break;
      case 'okrs':
        await exportService.generateOKRReport(Array.isArray(data) ? data : [data]);
        break;
      case 'grants':
        await exportService.generateCustomReport({
          title: 'SGE Grants Report',
          subtitle: 'Grant Management Overview',
          generatedAt: new Date().toLocaleDateString(),
          data,
          type: 'grant',
        });
        break;
      default:
        await exportService.generateCustomReport({
          title: 'SGE Custom Report',
          generatedAt: new Date().toLocaleDateString(),
          data,
          type: 'custom',
        });
    }
  };

  const handleExcelExport = async () => {
    switch (dataType) {
      case 'dashboard':
        excelService.exportDashboardData(data);
        break;
      case 'projects':
        excelService.exportProjects(Array.isArray(data) ? data : [data]);
        break;
      case 'okrs':
        excelService.exportOKRs(Array.isArray(data) ? data : [data]);
        break;
      case 'grants':
        excelService.exportGrants(Array.isArray(data) ? data : [data]);
        break;
      default:
        excelService.exportToExcel([{
          sheetName: 'Custom Data',
          data: Array.isArray(data) ? data : [data],
        }]);
    }
  };

  const handleCSVExport = async () => {
    const headers = Object.keys(Array.isArray(data) ? data[0] || {} : data);
    const csvData = Array.isArray(data) ? data : [data];
    excelService.exportToCSV(csvData, headers);
  };

  const getExportOptions = () => {
    switch (dataType) {
      case 'dashboard':
        return [
          { type: 'pdf', label: 'Executive Summary PDF', icon: '📊' },
          { type: 'excel', label: 'Full Dashboard Excel', icon: '📈' },
          { type: 'csv', label: 'Summary CSV', icon: '📋' },
        ];
      case 'projects':
        return [
          { type: 'pdf', label: 'Project Report PDF', icon: '📄' },
          { type: 'excel', label: 'Projects Excel', icon: '📊' },
          { type: 'csv', label: 'Projects CSV', icon: '📋' },
        ];
      case 'okrs':
        return [
          { type: 'pdf', label: 'OKR Report PDF', icon: '🎯' },
          { type: 'excel', label: 'OKRs Excel', icon: '📊' },
          { type: 'csv', label: 'OKRs CSV', icon: '📋' },
        ];
      case 'grants':
        return [
          { type: 'pdf', label: 'Grants Report PDF', icon: '💰' },
          { type: 'excel', label: 'Grants Excel', icon: '📊' },
          { type: 'csv', label: 'Grants CSV', icon: '📋' },
        ];
      default:
        return [
          { type: 'pdf', label: 'Custom Report PDF', icon: '📄' },
          { type: 'excel', label: 'Custom Excel', icon: '📊' },
          { type: 'csv', label: 'Custom CSV', icon: '📋' },
        ];
    }
  };

  return (
    <div className="relative">
      {/* Export Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-sg-primary text-white px-4 py-2 rounded-md text-sm hover:bg-sg-primary/90 transition-colors flex items-center space-x-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <span>Export</span>
      </button>

      {/* Export Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Export Data</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-3">
              {getExportOptions().map((option) => (
                <button
                  key={option.type}
                  onClick={() => handleExport(option.type as 'pdf' | 'excel' | 'csv')}
                  disabled={exporting}
                  className={`w-full p-3 text-left rounded-lg border transition-colors ${
                    exporting && exportType === option.type
                      ? 'bg-gray-100 border-gray-300 cursor-not-allowed'
                      : 'hover:bg-gray-50 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">{option.icon}</span>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{option.label}</div>
                      <div className="text-sm text-gray-500">
                        {exporting && exportType === option.type ? 'Generating...' : 'Click to download'}
                      </div>
                    </div>
                    {exporting && exportType === option.type && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-sg-primary"></div>
                    )}
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="text-xs text-gray-500">
                <p>• PDF reports include charts and formatting</p>
                <p>• Excel files support multiple sheets</p>
                <p>• CSV files are compatible with all spreadsheet software</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
