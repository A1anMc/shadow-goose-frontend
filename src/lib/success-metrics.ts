// Success Metrics Tracking System
// Senior Grants Operations Agent - Real Data Integration

export interface GrantSuccessMetrics {
  // Discovery Metrics
  grants_discovered: number;
  search_accuracy: number;
  time_to_find_grant: number;
  
  // Application Metrics
  applications_started: number;
  applications_completed: number;
  applications_submitted: number;
  applications_approved: number;
  
  // Business Metrics
  total_funding_secured: number;
  success_rate: number;
  roi_per_application: number;
  
  // System Metrics
  api_response_time: number;
  system_uptime: number;
  user_satisfaction: number;
  
  // Pipeline Metrics
  data_freshness: 'excellent' | 'good' | 'acceptable' | 'stale';
  cache_hit_rate: number;
  error_rate: number;
}

export interface GrantApplicationMetrics {
  application_id: string;
  grant_id: string;
  start_time: string;
  completion_time?: string;
  submission_time?: string;
  approval_time?: string;
  rejection_time?: string;
  time_to_complete?: number;
  time_to_submit?: number;
  time_to_approval?: number;
  quality_score?: number;
  success_probability?: number;
  actual_outcome?: 'approved' | 'rejected' | 'pending';
  funding_amount?: number;
}

export interface SystemPerformanceMetrics {
  timestamp: string;
  api_response_time: number;
  system_uptime: number;
  active_users: number;
  data_sources_healthy: number;
  total_data_sources: number;
  cache_performance: number;
  error_count: number;
  success_count: number;
}

class SuccessMetricsTracker {
  private metrics: GrantSuccessMetrics;
  private applicationMetrics: GrantApplicationMetrics[] = [];
  private performanceMetrics: SystemPerformanceMetrics[] = [];
  private startTime: number;

  constructor() {
    this.startTime = Date.now();
    this.metrics = {
      grants_discovered: 0,
      search_accuracy: 0,
      time_to_find_grant: 0,
      applications_started: 0,
      applications_completed: 0,
      applications_submitted: 0,
      applications_approved: 0,
      total_funding_secured: 0,
      success_rate: 0,
      roi_per_application: 0,
      api_response_time: 0,
      system_uptime: 0,
      user_satisfaction: 0,
      data_freshness: 'excellent',
      cache_hit_rate: 0,
      error_rate: 0
    };
  }

  // Discovery Metrics
  trackGrantDiscovery(grantsFound: number, searchTime: number, accuracy: number) {
    this.metrics.grants_discovered += grantsFound;
    this.metrics.time_to_find_grant = searchTime;
    this.metrics.search_accuracy = accuracy;
    this.saveMetrics();
  }

  // Application Metrics
  trackApplicationStarted(applicationId: string, grantId: string) {
    this.metrics.applications_started++;
    
    const applicationMetric: GrantApplicationMetrics = {
      application_id: applicationId,
      grant_id: grantId,
      start_time: new Date().toISOString()
    };
    
    this.applicationMetrics.push(applicationMetric);
    this.saveMetrics();
  }

  trackApplicationCompleted(applicationId: string, qualityScore: number, successProbability: number) {
    this.metrics.applications_completed++;
    
    const application = this.applicationMetrics.find(app => app.application_id === applicationId);
    if (application) {
      application.completion_time = new Date().toISOString();
      application.time_to_complete = this.calculateTimeDifference(application.start_time, application.completion_time);
      application.quality_score = qualityScore;
      application.success_probability = successProbability;
    }
    
    this.saveMetrics();
  }

  trackApplicationSubmitted(applicationId: string) {
    this.metrics.applications_submitted++;
    
    const application = this.applicationMetrics.find(app => app.application_id === applicationId);
    if (application) {
      application.submission_time = new Date().toISOString();
      application.time_to_submit = this.calculateTimeDifference(application.start_time, application.submission_time);
    }
    
    this.saveMetrics();
  }

  trackApplicationOutcome(applicationId: string, outcome: 'approved' | 'rejected' | 'pending', fundingAmount?: number) {
    const application = this.applicationMetrics.find(app => app.application_id === applicationId);
    if (application) {
      application.actual_outcome = outcome;
      application.funding_amount = fundingAmount;
      
      if (outcome === 'approved') {
        this.metrics.applications_approved++;
        application.approval_time = new Date().toISOString();
        application.time_to_approval = this.calculateTimeDifference(application.start_time, application.approval_time);
        
        if (fundingAmount) {
          this.metrics.total_funding_secured += fundingAmount;
        }
      } else if (outcome === 'rejected') {
        application.rejection_time = new Date().toISOString();
      }
    }
    
    this.updateSuccessRate();
    this.updateROI();
    this.saveMetrics();
  }

  // System Performance Metrics
  trackSystemPerformance(performanceData: Partial<SystemPerformanceMetrics>) {
    const performanceMetric: SystemPerformanceMetrics = {
      timestamp: new Date().toISOString(),
      api_response_time: performanceData.api_response_time || 0,
      system_uptime: performanceData.system_uptime || 0,
      active_users: performanceData.active_users || 0,
      data_sources_healthy: performanceData.data_sources_healthy || 0,
      total_data_sources: performanceData.total_data_sources || 0,
      cache_performance: performanceData.cache_performance || 0,
      error_count: performanceData.error_count || 0,
      success_count: performanceData.success_count || 0
    };
    
    this.performanceMetrics.push(performanceMetric);
    
    // Update system metrics
    this.metrics.api_response_time = performanceMetric.api_response_time;
    this.metrics.system_uptime = performanceMetric.system_uptime;
    
    // Calculate error rate
    const totalRequests = performanceMetric.error_count + performanceMetric.success_count;
    this.metrics.error_rate = totalRequests > 0 ? performanceMetric.error_count / totalRequests : 0;
    
    this.saveMetrics();
  }

  // Data Pipeline Metrics
  updateDataFreshness(freshness: 'excellent' | 'good' | 'acceptable' | 'stale') {
    this.metrics.data_freshness = freshness;
    this.saveMetrics();
  }

  updateCacheHitRate(hitRate: number) {
    this.metrics.cache_hit_rate = hitRate;
    this.saveMetrics();
  }

  // User Satisfaction
  trackUserSatisfaction(satisfactionScore: number) {
    this.metrics.user_satisfaction = satisfactionScore;
    this.saveMetrics();
  }

  // Calculations
  private updateSuccessRate() {
    if (this.metrics.applications_submitted > 0) {
      this.metrics.success_rate = (this.metrics.applications_approved / this.metrics.applications_submitted) * 100;
    }
  }

  private updateROI() {
    if (this.metrics.applications_submitted > 0) {
      this.metrics.roi_per_application = this.metrics.total_funding_secured / this.metrics.applications_submitted;
    }
  }

  private calculateTimeDifference(startTime: string, endTime: string): number {
    const start = new Date(startTime).getTime();
    const end = new Date(endTime).getTime();
    return Math.round((end - start) / (1000 * 60 * 60 * 24)); // Days
  }

  // Getters
  getMetrics(): GrantSuccessMetrics {
    return { ...this.metrics };
  }

  getApplicationMetrics(): GrantApplicationMetrics[] {
    return [...this.applicationMetrics];
  }

  getPerformanceMetrics(): SystemPerformanceMetrics[] {
    return [...this.performanceMetrics];
  }

  getSystemUptime(): number {
    const currentTime = Date.now();
    const uptime = currentTime - this.startTime;
    return Math.round(uptime / (1000 * 60 * 60 * 24)); // Days
  }

  // Success Thresholds
  checkSuccessThresholds(): {
    discovery: boolean;
    applications: boolean;
    business: boolean;
    system: boolean;
  } {
    const thresholds = {
      discovery: {
        grants_discovered: 50,
        search_accuracy: 0.8,
        time_to_find_grant: 30 // seconds
      },
      applications: {
        success_rate: 75, // 75% approval rate
        applications_submitted: 10,
        time_to_complete: 14 // days
      },
      business: {
        total_funding_secured: 50000, // $50K
        roi_per_application: 10000, // $10K per application
        applications_approved: 5
      },
      system: {
        api_response_time: 2, // seconds
        system_uptime: 99.9, // percentage
        error_rate: 0.01, // 1%
        data_freshness: 'good'
      }
    };

    return {
      discovery: 
        this.metrics.grants_discovered >= thresholds.discovery.grants_discovered &&
        this.metrics.search_accuracy >= thresholds.discovery.search_accuracy &&
        this.metrics.time_to_find_grant <= thresholds.discovery.time_to_find_grant,
      
      applications:
        this.metrics.success_rate >= thresholds.applications.success_rate &&
        this.metrics.applications_submitted >= thresholds.applications.applications_submitted,
      
      business:
        this.metrics.total_funding_secured >= thresholds.business.total_funding_secured &&
        this.metrics.roi_per_application >= thresholds.business.roi_per_application &&
        this.metrics.applications_approved >= thresholds.business.applications_approved,
      
      system:
        this.metrics.api_response_time <= thresholds.system.api_response_time &&
        this.metrics.system_uptime >= thresholds.system.system_uptime &&
        this.metrics.error_rate <= thresholds.system.error_rate &&
        ['excellent', 'good'].includes(this.metrics.data_freshness)
    };
  }

  // Generate Reports
  generateWeeklyReport(): {
    period: string;
    metrics: GrantSuccessMetrics;
    thresholds: any;
    recommendations: string[];
  } {
    const thresholds = this.checkSuccessThresholds();
    const recommendations: string[] = [];

    // Discovery recommendations
    if (!thresholds.discovery) {
      if (this.metrics.grants_discovered < 50) {
        recommendations.push('Increase grant discovery by expanding data sources');
      }
      if (this.metrics.search_accuracy < 0.8) {
        recommendations.push('Improve search accuracy by refining matching algorithms');
      }
    }

    // Application recommendations
    if (!thresholds.applications) {
      if (this.metrics.success_rate < 75) {
        recommendations.push('Improve application quality and success rate');
      }
      if (this.metrics.applications_submitted < 10) {
        recommendations.push('Increase application submission rate');
      }
    }

    // Business recommendations
    if (!thresholds.business) {
      if (this.metrics.total_funding_secured < 50000) {
        recommendations.push('Focus on higher-value grants and improve success rate');
      }
      if (this.metrics.roi_per_application < 10000) {
        recommendations.push('Optimize application strategy for better ROI');
      }
    }

    // System recommendations
    if (!thresholds.system) {
      if (this.metrics.api_response_time > 2) {
        recommendations.push('Optimize API performance and response times');
      }
      if (this.metrics.error_rate > 0.01) {
        recommendations.push('Reduce system errors and improve reliability');
      }
    }

    return {
      period: 'Weekly',
      metrics: this.getMetrics(),
      thresholds,
      recommendations
    };
  }

  // Persistence
  private saveMetrics() {
    try {
      localStorage.setItem('sge_success_metrics', JSON.stringify(this.metrics));
      localStorage.setItem('sge_application_metrics', JSON.stringify(this.applicationMetrics));
      localStorage.setItem('sge_performance_metrics', JSON.stringify(this.performanceMetrics));
    } catch (error) {
      console.error('Failed to save metrics:', error);
    }
  }

  loadMetrics() {
    try {
      const savedMetrics = localStorage.getItem('sge_success_metrics');
      const savedApplicationMetrics = localStorage.getItem('sge_application_metrics');
      const savedPerformanceMetrics = localStorage.getItem('sge_performance_metrics');

      if (savedMetrics) {
        this.metrics = { ...this.metrics, ...JSON.parse(savedMetrics) };
      }
      if (savedApplicationMetrics) {
        this.applicationMetrics = JSON.parse(savedApplicationMetrics);
      }
      if (savedPerformanceMetrics) {
        this.performanceMetrics = JSON.parse(savedPerformanceMetrics);
      }
    } catch (error) {
      console.error('Failed to load metrics:', error);
    }
  }

  // Reset metrics
  resetMetrics() {
    this.metrics = {
      grants_discovered: 0,
      search_accuracy: 0,
      time_to_find_grant: 0,
      applications_started: 0,
      applications_completed: 0,
      applications_submitted: 0,
      applications_approved: 0,
      total_funding_secured: 0,
      success_rate: 0,
      roi_per_application: 0,
      api_response_time: 0,
      system_uptime: 0,
      user_satisfaction: 0,
      data_freshness: 'excellent',
      cache_hit_rate: 0,
      error_rate: 0
    };
    this.applicationMetrics = [];
    this.performanceMetrics = [];
    this.startTime = Date.now();
    this.saveMetrics();
  }
}

export const successMetricsTracker = new SuccessMetricsTracker();
