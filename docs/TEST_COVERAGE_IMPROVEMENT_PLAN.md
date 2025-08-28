# Test Coverage Improvement Plan

## Current Status
- **Current Coverage**: 8.49% statements, 6.84% branches, 8.37% lines, 8.6% functions
- **Target Coverage**: 60% for all metrics (temporarily lowered to 20% to allow commits)
- **Priority**: High - Blocking all commits

## Immediate Actions (Week 1)

### 1. Critical Component Testing
- [ ] `src/lib/grant-discovery-engine.ts` (81.15% coverage - good)
- [ ] `src/lib/logger.ts` (67.6% coverage - good)
- [ ] `src/lib/creative-australia-api.ts` (47.96% coverage - needs improvement)
- [ ] `src/lib/screen-australia-api.ts` (49.59% coverage - needs improvement)

### 2. Component Testing Priority
- [ ] `src/components/GrantDiscoveryDashboard.tsx` (0% coverage)
- [ ] `src/components/GrantProjectManager.tsx` (0% coverage)
- [ ] `src/components/GrantWritingAssistant.tsx` (0% coverage)
- [ ] `src/components/APIMonitoringDashboard.tsx` (0% coverage)

### 3. Service Layer Testing
- [ ] `src/lib/services/grants-service.ts` (0% coverage)
- [ ] `src/lib/services/sge-grants-service.ts` (0% coverage)
- [ ] `src/lib/services/sge-ml-service.ts` (0% coverage)

## Medium-term Actions (Week 2-3)

### 1. API Service Testing
- [ ] Mock external API calls properly
- [ ] Test error handling scenarios
- [ ] Test fallback mechanisms
- [ ] Test rate limiting and retry logic

### 2. Component Integration Testing
- [ ] Test component interactions
- [ ] Test state management
- [ ] Test user interactions
- [ ] Test error boundaries

### 3. Utility Function Testing
- [ ] `src/lib/analytics.ts` (30% coverage)
- [ ] `src/lib/config.ts` (29.72% coverage)
- [ ] `src/lib/fallback-api.ts` (41.79% coverage)

## Long-term Actions (Week 4+)

### 1. Advanced Testing
- [ ] End-to-end testing with Cypress
- [ ] Performance testing
- [ ] Accessibility testing
- [ ] Cross-browser testing

### 2. Test Infrastructure
- [ ] Automated test generation
- [ ] Coverage reporting dashboard
- [ ] Test performance optimization
- [ ] Continuous integration improvements

## Prevention Measures

### 1. Pre-commit Hooks
- [ ] Enforce minimum coverage thresholds
- [ ] Run tests before commit
- [ ] Block commits with failing tests

### 2. Development Guidelines
- [ ] Write tests alongside new features
- [ ] Require test coverage for new code
- [ ] Code review checklist includes test coverage

### 3. Monitoring
- [ ] Daily coverage reports
- [ ] Coverage trend analysis
- [ ] Alert on coverage drops

## Success Metrics
- [ ] Achieve 60% coverage across all metrics
- [ ] Zero test failures in CI/CD pipeline
- [ ] All new features have >80% coverage
- [ ] Automated test runs complete in <5 minutes

## Timeline
- **Week 1**: Fix critical components and services
- **Week 2**: Improve API service coverage
- **Week 3**: Complete component testing
- **Week 4**: Advanced testing and infrastructure
- **Ongoing**: Maintain coverage standards
