/**
 * Analytics Integration Service
 * Comprehensive integration with Instant Analytics and Google Analytics
 * Connects real-time data with OKRs and impact measurement
 */


// ============================================================================
// ANALYTICS DATA TYPES
// ============================================================================

export interface InstantAnalyticsData {
  // Real-time metrics
  active_users: number;
  page_views: number;
  sessions: number;
  bounce_rate: number;
  avg_session_duration: number;
  
  // User engagement
  user_engagement_score: number;
  feature_adoption_rate: number;
  user_satisfaction_score: number;
  
  // Performance metrics
  page_load_time: number;
  api_response_time: number;
  error_rate: number;
  
  // Business metrics
  conversion_rate: number;
  revenue_generated: number;
  user_acquisition_cost: number;
  
  // Custom events
  custom_events: {
    [event_name: string]: {
      count: number;
      unique_users: number;
      conversion_value: number;
    };
  };
  
  timestamp: string;
}

export interface GoogleAnalyticsData {
  // Traffic sources
  organic_search: number;
  direct_traffic: number;
  social_media: number;
  email_marketing: number;
  paid_search: number;
  referrals: number;
  
  // User demographics
  age_groups: Record<string, number>;
  gender_distribution: Record<string, number>;
  geographic_locations: Record<string, number>;
  device_types: Record<string, number>;
  
  // Content performance
  top_pages: Array<{
    page_path: string;
    page_views: number;
    unique_page_views: number;
    avg_time_on_page: number;
    bounce_rate: number;
  }>;
  
  // E-commerce (if applicable)
  ecommerce_metrics: {
    transactions: number;
    revenue: number;
    average_order_value: number;
    conversion_rate: number;
  };
  
  // Goals and conversions
  goal_completions: Record<string, number>;
  conversion_funnels: Array<{
    stage: string;
    users: number;
    conversion_rate: number;
  }>;
  
  date_range: {
    start_date: string;
    end_date: string;
  };
}

export interface AnalyticsInsights {
  // Performance insights
  performance_trends: {
    user_growth_rate: number;
    engagement_trend: 'increasing' | 'decreasing' | 'stable';
    conversion_improvement: number;
    performance_issues: string[];
  };
  
  // User behavior insights
  user_behavior: {
    most_engaged_features: string[];
    drop_off_points: string[];
    user_journey_optimization: string[];
    feature_adoption_insights: string[];
  };
  
  // Business impact insights
  business_impact: {
    revenue_attribution: Record<string, number>;
    roi_by_channel: Record<string, number>;
    customer_lifetime_value: number;
    churn_prediction: number;
  };
  
  // Recommendations
  recommendations: {
    immediate_actions: string[];
    strategic_improvements: string[];
    optimization_opportunities: string[];
  };
}

export interface AnalyticsOKRMapping {
  okr_id: string;
  analytics_metric: string;
  target_value: number;
  current_value: number;
  data_source: 'instant_analytics' | 'google_analytics' | 'combined';
  last_updated: string;
  trend: 'improving' | 'declining' | 'stable';
  confidence_level: 'high' | 'medium' | 'low';
}

export interface AnalyticsImpactMapping {
  impact_framework: 'SDG' | 'Victorian' | 'CEMP' | 'Triple_Bottom_Line';
  framework_id: string;
  analytics_metrics: string[];
  correlation_strength: number; // 0-1
  evidence: string[];
  last_updated: string;
}

// ============================================================================
// ANALYTICS INTEGRATION SERVICE
// ============================================================================

export class AnalyticsIntegrationService {
  private baseUrl: string;
  private authToken: string | null;
  private instantAnalyticsApiKey: string | null;
  private googleAnalyticsApiKey: string | null;

  constructor(baseUrl: string = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000') {
    this.baseUrl = baseUrl;
    this.authToken = null;
    this.instantAnalyticsApiKey = process.env.NEXT_PUBLIC_INSTANT_ANALYTICS_API_KEY || null;
    this.googleAnalyticsApiKey = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_API_KEY || null;
  }

  setAuthToken(token: string) {
    this.authToken = token;
  }

  setAnalyticsApiKeys(instantKey: string, googleKey: string) {
    this.instantAnalyticsApiKey = instantKey;
    this.googleAnalyticsApiKey = googleKey;
  }

  // ============================================================================
  // INSTANT ANALYTICS INTEGRATION
  // ============================================================================

  /**
   * Get real-time Instant Analytics data
   */
  async getInstantAnalyticsData(timeRange: '1h' | '24h' | '7d' | '30d' = '24h'): Promise<InstantAnalyticsData> {
    const response = await this.request<InstantAnalyticsData>(`/analytics/instant?time_range=${timeRange}`);
    return response.data;
  }

  /**
   * Get Instant Analytics historical data
   */
  async getInstantAnalyticsHistory(startDate: string, endDate: string): Promise<InstantAnalyticsData[]> {
    const response = await this.request<InstantAnalyticsData[]>(`/analytics/instant/history?start_date=${startDate}&end_date=${endDate}`);
    return response.data;
  }

  /**
   * Get Instant Analytics custom events
   */
  async getInstantAnalyticsEvents(eventName?: string): Promise<{
    [event_name: string]: {
      count: number;
      unique_users: number;
      conversion_value: number;
      trend: number;
    };
  }> {
    const params = eventName ? `?event_name=${eventName}` : '';
    const response = await this.request<{
      [event_name: string]: {
        count: number;
        unique_users: number;
        conversion_value: number;
        trend: number;
      };
    }>(`/analytics/instant/events${params}`);
    return response.data;
  }

  /**
   * Track custom event in Instant Analytics
   */
  async trackInstantAnalyticsEvent(eventName: string, eventData: Record<string, any>): Promise<void> {
    await this.request('/analytics/instant/track', {
      method: 'POST',
      body: JSON.stringify({
        event_name: eventName,
        event_data: eventData,
        timestamp: new Date().toISOString()
      })
    });
  }

  // ============================================================================
  // GOOGLE ANALYTICS INTEGRATION
  // ============================================================================

  /**
   * Get Google Analytics data
   */
  async getGoogleAnalyticsData(startDate: string, endDate: string, metrics: string[]): Promise<GoogleAnalyticsData> {
    const response = await this.request<GoogleAnalyticsData>('/analytics/google', {
      method: 'POST',
      body: JSON.stringify({
        start_date: startDate,
        end_date: endDate,
        metrics: metrics
      })
    });
    return response.data;
  }

  /**
   * Get Google Analytics real-time data
   */
  async getGoogleAnalyticsRealTime(): Promise<{
    active_users: number;
    page_views: number;
    top_pages: Array<{ page_path: string; active_users: number }>;
  }> {
    const response = await this.request<{
      active_users: number;
      page_views: number;
      top_pages: Array<{ page_path: string; active_users: number }>;
    }>('/analytics/google/realtime');
    return response.data;
  }

  /**
   * Get Google Analytics user demographics
   */
  async getGoogleAnalyticsDemographics(startDate: string, endDate: string): Promise<{
    age_groups: Record<string, number>;
    gender_distribution: Record<string, number>;
    geographic_locations: Record<string, number>;
    device_types: Record<string, number>;
  }> {
    const response = await this.request<GoogleAnalyticsData>('/analytics/google/demographics', {
      method: 'POST',
      body: JSON.stringify({
        start_date: startDate,
        end_date: endDate
      })
    });
    return response.data;
  }

  /**
   * Get Google Analytics conversion funnels
   */
  async getGoogleAnalyticsFunnels(goalId: string, startDate: string, endDate: string): Promise<{
    funnel_stages: Array<{
      stage: string;
      users: number;
      conversion_rate: number;
      drop_off_rate: number;
    }>;
  }> {
    const response = await this.request<{
      funnel_stages: Array<{
        stage: string;
        users: number;
        conversion_rate: number;
        drop_off_rate: number;
      }>;
    }>('/analytics/google/funnels', {
      method: 'POST',
      body: JSON.stringify({
        goal_id: goalId,
        start_date: startDate,
        end_date: endDate
      })
    });
    return response.data;
  }

  // ============================================================================
  // COMBINED ANALYTICS & INSIGHTS
  // ============================================================================

  /**
   * Get combined analytics insights
   */
  async getAnalyticsInsights(timeRange: '7d' | '30d' | '90d' = '30d'): Promise<AnalyticsInsights> {
    const response = await this.request<AnalyticsInsights>(`/analytics/insights?time_range=${timeRange}`);
    return response.data;
  }

  /**
   * Get analytics performance dashboard
   */
  async getAnalyticsDashboard(): Promise<{
    instant_analytics: InstantAnalyticsData;
    google_analytics: GoogleAnalyticsData;
    insights: AnalyticsInsights;
    okr_mappings: AnalyticsOKRMapping[];
    impact_mappings: AnalyticsImpactMapping[];
  }> {
    const response = await this.request<{
      instant_analytics: InstantAnalyticsData;
      google_analytics: GoogleAnalyticsData;
      insights: AnalyticsInsights;
      okr_mappings: AnalyticsOKRMapping[];
      impact_mappings: AnalyticsImpactMapping[];
    }>('/analytics/dashboard');
    return response.data;
  }

  /**
   * Generate analytics report
   */
  async generateAnalyticsReport(startDate: string, endDate: string, includeInsights: boolean = true): Promise<{
    instant_analytics: InstantAnalyticsData[];
    google_analytics: GoogleAnalyticsData;
    insights: AnalyticsInsights | null;
    summary: {
      total_users: number;
      total_sessions: number;
      conversion_rate: number;
      revenue_generated: number;
      performance_score: number;
    };
  }> {
    const response = await this.request<{
      instant_analytics: InstantAnalyticsData[];
      google_analytics: GoogleAnalyticsData;
      insights: AnalyticsInsights | null;
      summary: {
        total_users: number;
        total_sessions: number;
        conversion_rate: number;
        revenue_generated: number;
        performance_score: number;
      };
    }>('/analytics/report', {
      method: 'POST',
      body: JSON.stringify({
        start_date: startDate,
        end_date: endDate,
        include_insights: includeInsights
      })
    });
    return response.data;
  }

  // ============================================================================
  // OKR INTEGRATION
  // ============================================================================

  /**
   * Map analytics metrics to OKRs
   */
  async mapAnalyticsToOKR(mapping: Omit<AnalyticsOKRMapping, 'last_updated'>): Promise<AnalyticsOKRMapping> {
    const response = await this.request<AnalyticsOKRMapping>('/analytics/okr-mappings', {
      method: 'POST',
      body: JSON.stringify(mapping)
    });
    return response.data;
  }

  /**
   * Get OKR analytics mappings
   */
  async getOKRAnalyticsMappings(okrId?: string): Promise<AnalyticsOKRMapping[]> {
    const params = okrId ? `?okr_id=${okrId}` : '';
    const response = await this.request<AnalyticsOKRMapping[]>(`/analytics/okr-mappings${params}`);
    return response.data;
  }

  /**
   * Update OKR progress from analytics
   */
  async updateOKRFromAnalytics(okrId: string): Promise<{
    updated_key_results: number;
    new_measurements: number;
    insights_generated: string[];
  }> {
    const response = await this.request<{
      updated_key_results: number;
      new_measurements: number;
      insights_generated: string[];
    }>(`/analytics/update-okr/${okrId}`, {
      method: 'POST'
    });
    return response.data;
  }

  /**
   * Get OKR analytics insights
   */
  async getOKRAnalyticsInsights(okrId: string): Promise<{
    performance_trends: Record<string, number>;
    user_behavior_insights: string[];
    optimization_recommendations: string[];
    risk_factors: string[];
  }> {
    const response = await this.request<{
      performance_trends: Record<string, number>;
      user_behavior_insights: string[];
      optimization_recommendations: string[];
      risk_factors: string[];
    }>(`/analytics/okr-insights/${okrId}`);
    return response.data;
  }

  // ============================================================================
  // IMPACT MEASUREMENT INTEGRATION
  // ============================================================================

  /**
   * Map analytics to impact frameworks
   */
  async mapAnalyticsToImpact(mapping: Omit<AnalyticsImpactMapping, 'last_updated'>): Promise<AnalyticsImpactMapping> {
    const response = await this.request<AnalyticsImpactMapping>('/analytics/impact-mappings', {
      method: 'POST',
      body: JSON.stringify(mapping)
    });
    return response.data;
  }

  /**
   * Get impact analytics mappings
   */
  async getImpactAnalyticsMappings(framework?: string): Promise<AnalyticsImpactMapping[]> {
    const params = framework ? `?framework=${framework}` : '';
    const response = await this.request<AnalyticsImpactMapping[]>(`/analytics/impact-mappings${params}`);
    return response.data;
  }

  /**
   * Update impact measurements from analytics
   */
  async updateImpactFromAnalytics(projectId: string): Promise<{
    updated_measurements: number;
    new_evidence: string[];
    framework_contributions: Record<string, number>;
  }> {
    const response = await this.request<{
      updated_measurements: number;
      new_evidence: string[];
      framework_contributions: Record<string, number>;
    }>(`/analytics/update-impact/${projectId}`, {
      method: 'POST'
    });
    return response.data;
  }

  // ============================================================================
  // REAL-TIME MONITORING
  // ============================================================================

  /**
   * Set up real-time analytics monitoring
   */
  async setupRealTimeMonitoring(config: {
    okr_alerts: boolean;
    impact_alerts: boolean;
    performance_alerts: boolean;
    user_behavior_alerts: boolean;
  }): Promise<{
    monitoring_active: boolean;
    alert_channels: string[];
    update_frequency: string;
  }> {
    const response = await this.request<{
      monitoring_active: boolean;
      alert_channels: string[];
      update_frequency: string;
    }>('/analytics/monitoring/setup', {
      method: 'POST',
      body: JSON.stringify(config)
    });
    return response.data;
  }

  /**
   * Get real-time monitoring status
   */
  async getMonitoringStatus(): Promise<{
    is_active: boolean;
    last_update: string;
    active_alerts: number;
    performance_score: number;
  }> {
    const response = await this.request<{
      is_active: boolean;
      last_update: string;
      active_alerts: number;
      performance_score: number;
    }>('/analytics/monitoring/status');
    return response.data;
  }

  // ============================================================================
  // PREDICTIVE ANALYTICS
  // ============================================================================

  /**
   * Get predictive analytics insights
   */
  async getPredictiveInsights(timeframe: '30d' | '90d' | '180d' = '90d'): Promise<{
    user_growth_prediction: number;
    revenue_forecast: number;
    churn_prediction: number;
    feature_adoption_forecast: Record<string, number>;
    risk_factors: string[];
    opportunities: string[];
  }> {
    const response = await this.request<{
      user_growth_prediction: number;
      revenue_forecast: number;
      churn_prediction: number;
      feature_adoption_forecast: Record<string, number>;
      risk_factors: string[];
      opportunities: string[];
    }>(`/analytics/predictive?timeframe=${timeframe}`);
    return response.data;
  }

  /**
   * Get anomaly detection results
   */
  async getAnomalyDetection(): Promise<{
    anomalies: Array<{
      metric: string;
      detected_at: string;
      severity: 'high' | 'medium' | 'low';
      description: string;
      recommended_action: string;
    }>;
    overall_health_score: number;
  }> {
    const response = await this.request<{
      anomalies: Array<{
        metric: string;
        detected_at: string;
        severity: 'high' | 'medium' | 'low';
        description: string;
        recommended_action: string;
      }>;
      overall_health_score: number;
    }>('/analytics/anomaly-detection');
    return response.data;
  }

  // ============================================================================
  // EXPORT & INTEGRATION
  // ============================================================================

  /**
   * Export analytics data
   */
  async exportAnalyticsData(format: 'pdf' | 'excel' | 'csv' | 'json', filters?: {
    date_range?: { start: string; end: string };
    data_sources?: string[];
    metrics?: string[];
  }): Promise<Blob> {
    const response = await this.request<Blob>('/analytics/export', {
      method: 'POST',
      body: JSON.stringify({ format, filters }),
      headers: {
        'Accept': this.getAcceptHeader(format)
      }
    });
    return response.data;
  }

  /**
   * Sync analytics data with external systems
   */
  async syncAnalyticsData(systems: string[]): Promise<{
    synced_systems: string[];
    sync_status: Record<string, 'success' | 'failed' | 'partial'>;
    errors: string[];
  }> {
    const response = await this.request<{
      synced_systems: string[];
      sync_status: Record<string, 'success' | 'failed' | 'partial'>;
      errors: string[];
    }>('/analytics/sync', {
      method: 'POST',
      body: JSON.stringify({ systems })
    });
    return response.data;
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<{ data: T }> {
    const url = `${this.baseUrl}/api${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.authToken) {
      headers.Authorization = `Bearer ${this.authToken}`;
    }

    if (this.instantAnalyticsApiKey) {
      headers['X-Instant-Analytics-Key'] = this.instantAnalyticsApiKey;
    }

    if (this.googleAnalyticsApiKey) {
      headers['X-Google-Analytics-Key'] = this.googleAnalyticsApiKey;
    }

    if (options.headers) {
      Object.assign(headers, options.headers);
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return { data: data as T };
  }

  private getAcceptHeader(format: string): string {
    switch (format) {
      case 'pdf':
        return 'application/pdf';
      case 'excel':
        return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      case 'csv':
        return 'text/csv';
      case 'json':
        return 'application/json';
      default:
        return 'application/json';
    }
  }
}

// Export singleton instance
export const analyticsIntegrationService = new AnalyticsIntegrationService();
