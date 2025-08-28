/**
 * Impact Measurement Framework Types
 * Comprehensive type definitions for SDGs, Victorian Government outcomes, and CEMP
 */

// ============================================================================
// SUSTAINABLE DEVELOPMENT GOALS (SDGs)
// ============================================================================

export interface SDGGoal {
  id: number;
  code: string;
  title: string;
  description: string;
  targets: SDGTarget[];
  indicators: SDGIndicator[];
  color: string;
  icon: string;
}

export interface SDGTarget {
  id: string;
  code: string;
  description: string;
  indicators: SDGIndicator[];
}

export interface SDGIndicator {
  id: string;
  code: string;
  description: string;
  unit: string;
  measurement_type: 'quantitative' | 'qualitative' | 'mixed';
}

export const SDG_GOALS: SDGGoal[] = [
  {
    id: 1,
    code: 'SDG1',
    title: 'No Poverty',
    description: 'End poverty in all its forms everywhere',
    color: '#E5243B',
    icon: '🏠',
    targets: [
      {
        id: '1.1',
        code: '1.1',
        description: 'By 2030, eradicate extreme poverty for all people everywhere',
        indicators: [
          {
            id: '1.1.1',
            code: '1.1.1',
            description: 'Proportion of population below the international poverty line',
            unit: 'percentage',
            measurement_type: 'quantitative'
          }
        ]
      }
    ],
    indicators: []
  },
  {
    id: 4,
    code: 'SDG4',
    title: 'Quality Education',
    description: 'Ensure inclusive and equitable quality education',
    color: '#C5192D',
    icon: '🎓',
    targets: [
      {
        id: '4.1',
        code: '4.1',
        description: 'By 2030, ensure that all girls and boys complete free, equitable and quality primary and secondary education',
        indicators: [
          {
            id: '4.1.1',
            code: '4.1.1',
            description: 'Proportion of children and young people achieving minimum proficiency in reading and mathematics',
            unit: 'percentage',
            measurement_type: 'quantitative'
          }
        ]
      }
    ],
    indicators: []
  },
  {
    id: 8,
    code: 'SDG8',
    title: 'Decent Work and Economic Growth',
    description: 'Promote sustained, inclusive and sustainable economic growth',
    color: '#A21942',
    icon: '💼',
    targets: [
      {
        id: '8.5',
        code: '8.5',
        description: 'By 2030, achieve full and productive employment and decent work for all women and men',
        indicators: [
          {
            id: '8.5.1',
            code: '8.5.1',
            description: 'Average hourly earnings of female and male employees',
            unit: 'currency',
            measurement_type: 'quantitative'
          }
        ]
      }
    ],
    indicators: []
  },
  {
    id: 10,
    code: 'SDG10',
    title: 'Reduced Inequalities',
    description: 'Reduce inequality within and among countries',
    color: '#DD1367',
    icon: '⚖️',
    targets: [
      {
        id: '10.2',
        code: '10.2',
        description: 'By 2030, empower and promote the social, economic and political inclusion of all',
        indicators: [
          {
            id: '10.2.1',
            code: '10.2.1',
            description: 'Proportion of people living below 50 per cent of median income',
            unit: 'percentage',
            measurement_type: 'quantitative'
          }
        ]
      }
    ],
    indicators: []
  },
  {
    id: 11,
    code: 'SDG11',
    title: 'Sustainable Cities and Communities',
    description: 'Make cities and human settlements inclusive, safe, resilient and sustainable',
    color: '#FD6925',
    icon: '🏙️',
    targets: [
      {
        id: '11.3',
        code: '11.3',
        description: 'By 2030, enhance inclusive and sustainable urbanization',
        indicators: [
          {
            id: '11.3.1',
            code: '11.3.1',
            description: 'Ratio of land consumption rate to population growth rate',
            unit: 'ratio',
            measurement_type: 'quantitative'
          }
        ]
      }
    ],
    indicators: []
  },
  {
    id: 13,
    code: 'SDG13',
    title: 'Climate Action',
    description: 'Take urgent action to combat climate change and its impacts',
    color: '#3F7E44',
    icon: '🌱',
    targets: [
      {
        id: '13.3',
        code: '13.3',
        description: 'Improve education, awareness-raising and human and institutional capacity',
        indicators: [
          {
            id: '13.3.1',
            code: '13.3.1',
            description: 'Number of countries that have integrated mitigation, adaptation, impact reduction and early warning',
            unit: 'count',
            measurement_type: 'quantitative'
          }
        ]
      }
    ],
    indicators: []
  },
  {
    id: 16,
    code: 'SDG16',
    title: 'Peace, Justice and Strong Institutions',
    description: 'Promote peaceful and inclusive societies for sustainable development',
    color: '#136A9F',
    icon: '⚖️',
    targets: [
      {
        id: '16.7',
        code: '16.7',
        description: 'Ensure responsive, inclusive, participatory and representative decision-making',
        indicators: [
          {
            id: '16.7.1',
            code: '16.7.1',
            description: 'Proportions of positions in national and local institutions',
            unit: 'percentage',
            measurement_type: 'quantitative'
          }
        ]
      }
    ],
    indicators: []
  },
  {
    id: 17,
    code: 'SDG17',
    title: 'Partnerships for the Goals',
    description: 'Strengthen the means of implementation and revitalize the Global Partnership',
    color: '#19486A',
    icon: '🤝',
    targets: [
      {
        id: '17.17',
        code: '17.17',
        description: 'Encourage and promote effective public, public-private and civil society partnerships',
        indicators: [
          {
            id: '17.17.1',
            code: '17.17.1',
            description: 'Amount of United States dollars committed to public-private partnerships',
            unit: 'currency',
            measurement_type: 'quantitative'
          }
        ]
      }
    ],
    indicators: []
  }
];

// ============================================================================
// VICTORIAN GOVERNMENT OUTCOMES FRAMEWORK
// ============================================================================

export interface VictorianOutcome {
  id: string;
  department: 'DFFH' | 'DJPR' | 'CreativeVic' | 'Other';
  code: string;
  title: string;
  description: string;
  category: string;
  indicators: VictorianIndicator[];
}

export interface VictorianIndicator {
  id: string;
  code: string;
  description: string;
  unit: string;
  target?: number;
  baseline?: number;
}

export const VICTORIAN_OUTCOMES: VictorianOutcome[] = [
  // DFFH (Department of Families, Fairness and Housing)
  {
    id: 'DFFH-1',
    department: 'DFFH',
    code: 'DFFH-1',
    title: 'Strong and Resilient Communities',
    description: 'Communities are connected, inclusive and resilient',
    category: 'Community Development',
    indicators: [
      {
        id: 'DFFH-1.1',
        code: 'DFFH-1.1',
        description: 'Community participation in local initiatives',
        unit: 'percentage',
        target: 75
      },
      {
        id: 'DFFH-1.2',
        code: 'DFFH-1.2',
        description: 'Social cohesion index score',
        unit: 'score (0-100)',
        target: 80
      }
    ]
  },
  {
    id: 'DFFH-2',
    department: 'DFFH',
    code: 'DFFH-2',
    title: 'Inclusive and Accessible Services',
    description: 'Services are accessible and meet diverse community needs',
    category: 'Service Delivery',
    indicators: [
      {
        id: 'DFFH-2.1',
        code: 'DFFH-2.1',
        description: 'Service accessibility rating',
        unit: 'rating (1-5)',
        target: 4.5
      }
    ]
  },

  // DJPR (Department of Jobs, Precincts and Regions)
  {
    id: 'DJPR-1',
    department: 'DJPR',
    code: 'DJPR-1',
    title: 'Economic Growth and Innovation',
    description: 'Support economic growth through innovation and job creation',
    category: 'Economic Development',
    indicators: [
      {
        id: 'DJPR-1.1',
        code: 'DJPR-1.1',
        description: 'Jobs created through supported projects',
        unit: 'number',
        target: 1000
      },
      {
        id: 'DJPR-1.2',
        code: 'DJPR-1.2',
        description: 'Economic impact of supported initiatives',
        unit: 'million AUD',
        target: 50
      }
    ]
  },

  // Creative Victoria
  {
    id: 'CreativeVic-1',
    department: 'CreativeVic',
    code: 'CreativeVic-1',
    title: 'Creative Industry Development',
    description: 'Support the growth and sustainability of creative industries',
    category: 'Creative Industries',
    indicators: [
      {
        id: 'CreativeVic-1.1',
        code: 'CreativeVic-1.1',
        description: 'Creative projects supported',
        unit: 'number',
        target: 500
      },
      {
        id: 'CreativeVic-1.2',
        code: 'CreativeVic-1.2',
        description: 'Audience engagement with creative content',
        unit: 'number',
        target: 100000
      }
    ]
  }
];

// ============================================================================
// CEMP (COMMUNITY ENGAGEMENT MEASUREMENT PROTOCOL)
// ============================================================================

export interface CEMPPrinciple {
  id: string;
  code: string;
  title: string;
  description: string;
  indicators: CEMPIndicator[];
  weight: number; // 1-10 scale
}

export interface CEMPIndicator {
  id: string;
  code: string;
  description: string;
  measurement_type: 'quantitative' | 'qualitative' | 'mixed';
  unit: string;
  target?: number;
}

export const CEMP_PRINCIPLES: CEMPPrinciple[] = [
  {
    id: 'CEMP-1',
    code: 'CEMP-1',
    title: 'Inclusive Participation',
    description: 'Ensure diverse and representative community participation',
    weight: 9,
    indicators: [
      {
        id: 'CEMP-1.1',
        code: 'CEMP-1.1',
        description: 'Diversity of participants (age, gender, ethnicity, ability)',
        measurement_type: 'quantitative',
        unit: 'percentage representation',
        target: 80
      },
      {
        id: 'CEMP-1.2',
        code: 'CEMP-1.2',
        description: 'Barriers to participation identified and addressed',
        measurement_type: 'qualitative',
        unit: 'narrative assessment'
      }
    ]
  },
  {
    id: 'CEMP-2',
    code: 'CEMP-2',
    title: 'Cultural Sensitivity',
    description: 'Respect and incorporate cultural values and practices',
    weight: 8,
    indicators: [
      {
        id: 'CEMP-2.1',
        code: 'CEMP-2.1',
        description: 'Cultural protocols observed and respected',
        measurement_type: 'qualitative',
        unit: 'compliance rating (1-5)',
        target: 5
      },
      {
        id: 'CEMP-2.2',
        code: 'CEMP-2.2',
        description: 'Indigenous knowledge and practices incorporated',
        measurement_type: 'mixed',
        unit: 'implementation score (0-100)',
        target: 90
      }
    ]
  },
  {
    id: 'CEMP-3',
    code: 'CEMP-3',
    title: 'Meaningful Engagement',
    description: 'Ensure engagement leads to meaningful outcomes and influence',
    weight: 10,
    indicators: [
      {
        id: 'CEMP-3.1',
        code: 'CEMP-3.1',
        description: 'Community input reflected in final outcomes',
        measurement_type: 'quantitative',
        unit: 'percentage of input incorporated',
        target: 75
      },
      {
        id: 'CEMP-3.2',
        code: 'CEMP-3.2',
        description: 'Community satisfaction with engagement process',
        measurement_type: 'quantitative',
        unit: 'satisfaction score (1-10)',
        target: 8
      }
    ]
  },
  {
    id: 'CEMP-4',
    code: 'CEMP-4',
    title: 'Transparency and Accountability',
    description: 'Maintain transparency in process and accountability for outcomes',
    weight: 7,
    indicators: [
      {
        id: 'CEMP-4.1',
        code: 'CEMP-4.1',
        description: 'Information sharing and communication effectiveness',
        measurement_type: 'quantitative',
        unit: 'communication score (1-10)',
        target: 8
      },
      {
        id: 'CEMP-4.2',
        code: 'CEMP-4.2',
        description: 'Follow-through on commitments made during engagement',
        measurement_type: 'quantitative',
        unit: 'commitment fulfillment percentage',
        target: 90
      }
    ]
  }
];

// ============================================================================
// PROJECT IMPACT MAPPING
// ============================================================================

export interface ProjectImpactMapping {
  project_id: string;
  sdg_mappings: SDGMapping[];
  victorian_mappings: VictorianMapping[];
  cemp_mappings: CEMPMapping[];
  attribution_percentage: number; // 0-100
  evidence_quality: 'high' | 'medium' | 'low';
  last_updated: string;
}

export interface SDGMapping {
  sdg_goal: SDGGoal;
  target: SDGTarget;
  indicator: SDGIndicator;
  current_value: number;
  target_value: number;
  contribution_percentage: number; // 0-100
  evidence: string[];
}

export interface VictorianMapping {
  outcome: VictorianOutcome;
  indicator: VictorianIndicator;
  current_value: number;
  target_value: number;
  contribution_percentage: number; // 0-100
  evidence: string[];
}

export interface CEMPMapping {
  principle: CEMPPrinciple;
  indicator: CEMPIndicator;
  current_value: number;
  target_value: number;
  contribution_percentage: number; // 0-100
  evidence: string[];
}

// ============================================================================
// IMPACT MEASUREMENT DATA
// ============================================================================

export interface ImpactMeasurement {
  id: string;
  project_id: string;
  measurement_date: string;
  framework: 'SDG' | 'Victorian' | 'CEMP' | 'Custom';
  indicator_id: string;
  value: number;
  unit: string;
  data_source: string;
  methodology: string;
  confidence_level: 'high' | 'medium' | 'low';
  notes: string;
  evidence_files: string[];
  created_by: string;
  created_at: string;
}

export interface ImpactStory {
  id: string;
  project_id: string;
  title: string;
  description: string;
  participant_name?: string;
  participant_type: 'individual' | 'group' | 'community';
  impact_category: 'social' | 'economic' | 'environmental' | 'cultural';
  frameworks: string[]; // SDG, Victorian, CEMP codes
  media_files: string[];
  permissions: {
    photo_release: boolean;
    story_publication: boolean;
    contact_for_followup: boolean;
  };
  created_at: string;
  updated_at: string;
}

// ============================================================================
// TRIPLE BOTTOM LINE
// ============================================================================

export interface TripleBottomLine {
  social_impact: {
    employment_created: number;
    skills_developed: number;
    community_engagement: number;
    social_cohesion: number;
    health_improvements: number;
  };
  economic_impact: {
    jobs_created: number;
    income_generated: number;
    local_spending: number;
    business_development: number;
    economic_multiplier: number;
  };
  environmental_impact: {
    carbon_reduction: number;
    waste_reduction: number;
    energy_efficiency: number;
    biodiversity_improvement: number;
    sustainable_practices: number;
  };
}

// ============================================================================
// IMPACT REPORTING
// ============================================================================

export interface ImpactReport {
  id: string;
  project_id: string;
  report_period: {
    start_date: string;
    end_date: string;
  };
  frameworks: {
    sdg_summary: SDGSummary;
    victorian_summary: VictorianSummary;
    cemp_summary: CEMPSummary;
    triple_bottom_line: TripleBottomLine;
  };
  stories: ImpactStory[];
  metrics: ImpactMeasurement[];
  recommendations: string[];
  generated_at: string;
  generated_by: string;
}

export interface SDGSummary {
  goals_impacted: number;
  targets_achieved: number;
  indicators_measured: number;
  overall_progress: number; // 0-100
  top_contributing_goals: SDGGoal[];
}

export interface VictorianSummary {
  outcomes_impacted: number;
  indicators_achieved: number;
  overall_progress: number; // 0-100
  department_breakdown: Record<string, number>;
}

export interface CEMPSummary {
  principles_implemented: number;
  indicators_achieved: number;
  overall_score: number; // 0-100
  principle_scores: Record<string, number>;
}
