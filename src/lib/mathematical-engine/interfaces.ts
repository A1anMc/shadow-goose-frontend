/**
 * Mathematical Engine Interfaces
 * Type definitions for all mathematical components
 */

export interface BayesCalculator {
  update(_prior: any, _data: any): Promise<any>;
  calculateCredibleInterval(_posterior: any, _confidence: number): Promise<any>;
  hierarchicalUpdate(_priors: any[], _data: any[]): Promise<any>;
}

export interface SensitivityAnalyzer {
  analyze(_model: any): Promise<any>;
  calculateSobolIndices(_model: any): Promise<any>;
  generateTornadoChart(_model: any): Promise<any>;
}

export interface DecisionOptimizer {
  optimize(_decisions: any[]): Promise<any>;
  calculateEVPI(_decisions: any[]): Promise<number>;
  calculateEVSI(_decisions: any[], _sampleSize: number): Promise<number>;
  findParetoFrontier(_objectives: any[]): Promise<any>;
}

export interface CalibrationEngine {
  calibrate(_forecast: any): Promise<any>;
  calculateBrierScore(_forecasts: number[], _outcomes: number[]): Promise<number>;
  generateReliabilityCurve(_forecasts: number[], _outcomes: number[]): Promise<any>;
}

export interface CausalAnalyzer {
  analyze(_data: any): Promise<any>;
  buildDAG(_variables: any[]): Promise<any>;
  calculateCausalEffect(_dag: any, _data: any): Promise<any>;
}

export interface PortfolioOptimizer {
  optimize(_projects: any[]): Promise<any>;
  knapsackOptimization(_projects: any[], _budget: number): Promise<any[]>;
  meanCVaROptimization(_projects: any[], _riskTolerance: number): Promise<any>;
}

export interface MathematicalEngineConfig {
  bayes: any;
  sensitivity: any;
  decision: any;
  calibration: any;
  causal: any;
  portfolio: any;
}
