import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export interface ExcelData {
  sheetName: string;
  data: any[];
  headers?: string[];
}

export interface ExportOptions {
  filename?: string;
  format?: 'xlsx' | 'csv';
  includeHeaders?: boolean;
}

class ExcelService {
  // Export data to Excel file
  exportToExcel(data: ExcelData[], options: ExportOptions = {}): void {
    try {
      const workbook = XLSX.utils.book_new();

      data.forEach((sheetData) => {
        let worksheet;
        
        if (sheetData.headers) {
          // Create worksheet with headers
          const dataWithHeaders = [sheetData.headers, ...sheetData.data];
          worksheet = XLSX.utils.aoa_to_sheet(dataWithHeaders);
        } else {
          // Create worksheet from array of objects
          worksheet = XLSX.utils.json_to_sheet(sheetData.data);
        }

        XLSX.utils.book_append_sheet(workbook, worksheet, sheetData.sheetName);
      });

      const filename = options.filename || `sge-export-${Date.now()}.xlsx`;
      XLSX.writeFile(workbook, filename);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      throw new Error('Failed to export to Excel');
    }
  }

  // Export projects data
  exportProjects(projects: any[], options: ExportOptions = {}): void {
    const headers = [
      'ID',
      'Name',
      'Description',
      'Status',
      'Progress (%)',
      'Participants',
      'Funding ($)',
      'Start Date',
      'End Date',
      'Created At',
    ];

    const data = projects.map(project => [
      project.id,
      project.name,
      project.description,
      project.status,
      project.progress || 0,
      project.participants || 0,
      project.funding || 0,
      project.start_date,
      project.end_date,
      project.created_at,
    ]);

    this.exportToExcel([{
      sheetName: 'Projects',
      data,
      headers,
    }], options);
  }

  // Export OKRs data
  exportOKRs(okrs: any[], options: ExportOptions = {}): void {
    const headers = [
      'OKR ID',
      'Objective',
      'Description',
      'Status',
      'Priority',
      'Progress (%)',
      'Target Date',
      'Project ID',
      'Grant ID',
      'Created At',
    ];

    const data = okrs.map(okr => [
      okr.id,
      okr.objective,
      okr.description,
      okr.status,
      okr.priority,
      Math.round(okr.keyResults?.reduce((sum: number, kr: any) => sum + kr.progress, 0) / (okr.keyResults?.length || 1) || 0),
      okr.targetDate,
      okr.projectId,
      okr.grantId,
      okr.created_at,
    ]);

    this.exportToExcel([{
      sheetName: 'OKRs',
      data,
      headers,
    }], options);
  }

  // Export OKR Key Results
  exportKeyResults(okrs: any[], options: ExportOptions = {}): void {
    const headers = [
      'OKR ID',
      'Key Result ID',
      'Description',
      'Target',
      'Current',
      'Unit',
      'Progress (%)',
      'Status',
      'Last Updated',
    ];

    const data: any[] = [];
    
    okrs.forEach(okr => {
      okr.keyResults?.forEach((kr: any) => {
        data.push([
          okr.id,
          kr.id,
          kr.description,
          kr.target,
          kr.current,
          kr.unit,
          kr.progress,
          kr.status,
          kr.last_updated,
        ]);
      });
    });

    this.exportToExcel([{
      sheetName: 'Key Results',
      data,
      headers,
    }], options);
  }

  // Export grants data
  exportGrants(grants: any[], options: ExportOptions = {}): void {
    const headers = [
      'ID',
      'Title',
      'Description',
      'Amount',
      'Deadline',
      'Category',
      'Status',
      'Eligibility',
      'Requirements',
      'Created At',
    ];

    const data = grants.map(grant => [
      grant.id,
      grant.title,
      grant.description,
      grant.amount,
      grant.deadline,
      grant.category,
      grant.status,
      grant.eligibility,
      grant.requirements,
      grant.created_at,
    ]);

    this.exportToExcel([{
      sheetName: 'Grants',
      data,
      headers,
    }], options);
  }

  // Export grant applications
  exportGrantApplications(applications: any[], options: ExportOptions = {}): void {
    const headers = [
      'Application ID',
      'Grant ID',
      'Grant Title',
      'Status',
      'Submitted Date',
      'Review Date',
      'Score',
      'Comments',
      'Created At',
    ];

    const data = applications.map(app => [
      app.id,
      app.grant_id,
      app.grant_title,
      app.status,
      app.submitted_date,
      app.review_date,
      app.score,
      app.comments,
      app.created_at,
    ]);

    this.exportToExcel([{
      sheetName: 'Grant Applications',
      data,
      headers,
    }], options);
  }

  // Export comprehensive dashboard data
  exportDashboardData(data: any, options: ExportOptions = {}): void {
    const sheets: ExcelData[] = [];

    // Projects sheet
    if (data.projects) {
      sheets.push({
        sheetName: 'Projects',
        data: data.projects.map((project: any) => ({
          ID: project.id,
          Name: project.name,
          Description: project.description,
          Status: project.status,
          'Progress (%)': project.progress || 0,
          Participants: project.participants || 0,
          'Funding ($)': project.funding || 0,
          'Start Date': project.start_date,
          'End Date': project.end_date,
        })),
      });
    }

    // OKRs sheet
    if (data.okrs) {
      sheets.push({
        sheetName: 'OKRs',
        data: data.okrs.map((okr: any) => ({
          'OKR ID': okr.id,
          Objective: okr.objective,
          Description: okr.description,
          Status: okr.status,
          Priority: okr.priority,
          'Progress (%)': Math.round(okr.keyResults?.reduce((sum: number, kr: any) => sum + kr.progress, 0) / (okr.keyResults?.length || 1) || 0),
          'Target Date': okr.targetDate,
          'Project ID': okr.projectId,
        })),
      });
    }

    // Summary sheet
    if (data.summary) {
      sheets.push({
        sheetName: 'Summary',
        data: [
          { Metric: 'Total Projects', Value: data.summary.totalProjects || 0 },
          { Metric: 'Active Projects', Value: data.summary.activeProjects || 0 },
          { Metric: 'Total Participants', Value: data.summary.totalParticipants || 0 },
          { Metric: 'Total Funding ($)', Value: data.summary.totalFunding || 0 },
          { Metric: 'Average Progress (%)', Value: data.summary.averageProgress || 0 },
          { Metric: 'OKRs On Track', Value: data.summary.okrsOnTrack || 0 },
          { Metric: 'OKRs At Risk', Value: data.summary.okrsAtRisk || 0 },
          { Metric: 'OKRs Completed', Value: data.summary.okrsCompleted || 0 },
        ],
      });
    }

    this.exportToExcel(sheets, {
      filename: options.filename || `sge-dashboard-export-${Date.now()}.xlsx`,
      ...options,
    });
  }

  // Export to CSV
  exportToCSV(data: any[], headers: string[], filename?: string): void {
    try {
      const csvContent = [
        headers.join(','),
        ...data.map(row => 
          Array.isArray(row) 
            ? row.map(cell => `"${cell}"`).join(',')
            : headers.map(header => `"${row[header] || ''}"`).join(',')
        ),
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      saveAs(blob, filename || `sge-export-${Date.now()}.csv`);
    } catch (error) {
      console.error('Error exporting to CSV:', error);
      throw new Error('Failed to export to CSV');
    }
  }

  // Generate sample data for testing
  generateSampleData(): any {
    return {
      projects: [
        {
          id: 1,
          name: 'Youth Employment Initiative',
          description: 'Supporting young people in finding meaningful employment',
          status: 'active',
          progress: 68.4,
          participants: 342,
          funding: 180000,
          start_date: '2025-01-15',
          end_date: '2025-12-31',
        },
        {
          id: 2,
          name: 'Community Health Program',
          description: 'Improving health outcomes in underserved communities',
          status: 'active',
          progress: 62.3,
          participants: 187,
          funding: 95000,
          start_date: '2025-02-01',
          end_date: '2025-11-30',
        },
      ],
      okrs: [
        {
          id: 1,
          objective: 'Increase Youth Employment in Creative Industries',
          description: 'Support young people in finding meaningful employment opportunities',
          status: 'on-track',
          priority: 'high',
          progress: 78.5,
          targetDate: '2025-12-31',
          projectId: 1,
        },
        {
          id: 2,
          objective: 'Enhance Community Digital Literacy',
          description: 'Improve digital skills and access to technology',
          status: 'at-risk',
          priority: 'medium',
          progress: 75.0,
          targetDate: '2025-11-30',
          projectId: 2,
        },
      ],
      summary: {
        totalProjects: 2,
        activeProjects: 2,
        totalParticipants: 529,
        totalFunding: 275000,
        averageProgress: 65.4,
        okrsOnTrack: 1,
        okrsAtRisk: 1,
        okrsCompleted: 0,
      },
    };
  }
}

export const excelService = new ExcelService();
