/**
 * Mathematical Engine Interfaces
 * Type definitions for all mathematical components
 */

export interface BayesCalculator {
  update(prior: any, data: any): Promise<any>;
  calculateCredibleInterval(posterior: any, confidence: number): Promise<any>;
  hierarchicalUpdate(priors: any[], data: any[]): Promise<any>;
}

export interface SensitivityAnalyzer {
  analyze(model: any): Promise<any>;
  calculateSobolIndices(model: any): Promise<any>;
  generateTornadoChart(model: any): Promise<any>;
}

export interface DecisionOptimizer {
  optimize(decisions: any[]): Promise<any>;
  calculateEVPI(decisions: any[]): Promise<number>;
  calculateEVSI(decisions: any[], sampleSize: number): Promise<number>;
  findParetoFrontier(objectives: any[]): Promise<any>;
}

export interface CalibrationEngine {
  calibrate(forecast: any): Promise<any>;
  calculateBrierScore(forecasts: number[], outcomes: number[]): Promise<number>;
  generateReliabilityCurve(forecasts: number[], outcomes: number[]): Promise<any>;
}

export interface CausalAnalyzer {
  analyze(data: any): Promise<any>;
  buildDAG(variables: any[]): Promise<any>;
  calculateCausalEffect(dag: any, data: any): Promise<any>;
}

export interface PortfolioOptimizer {
  optimize(projects: any[]): Promise<any>;
  knapsackOptimization(projects: any[], budget: number): Promise<any[]>;
  meanCVaROptimization(projects: any[], riskTolerance: number): Promise<any>;
}

export interface MathematicalEngineConfig {
  bayes: any;
  sensitivity: any;
  decision: any;
  calibration: any;
  causal: any;
  portfolio: any;
}
