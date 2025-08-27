# 🔍 **COMPREHENSIVE COMMIT CHECK RULE**

## **🎯 MAJOR RULE: MANDATORY CHECKS BEFORE EVERY COMMIT**

**This rule is NON-NEGOTIABLE and applies to ALL commits in the SGE V3 GIIS system.**

---

## **✅ MANDATORY PRE-COMMIT CHECKS**

### **1. TypeScript Compilation Check**
```bash
npm run typecheck
```
**REQUIREMENT**: Must pass with 0 errors
**PURPOSE**: Ensures code compiles correctly and maintains type safety

### **2. Build System Check**
```bash
npm run build
```
**REQUIREMENT**: Must complete successfully
**PURPOSE**: Verifies production build works and all dependencies are correct

### **3. Linting Check**
```bash
npm run lint
```
**REQUIREMENT**: Must pass with 0 errors (warnings are acceptable)
**PURPOSE**: Maintains code quality and consistency

### **4. File Status Check**
```bash
git status
git diff --cached
```
**REQUIREMENT**: Review all changes before committing
**PURPOSE**: Ensures only intended changes are committed

### **5. Outdated Data Check**
```bash
# Check for outdated monitoring files
ls -la *.txt *.log

# Check for outdated documentation
find . -name "*.md" -exec grep -l "outdated\|old\|deprecated\|obsolete" {} \;
```
**REQUIREMENT**: Remove or update outdated files before committing
**PURPOSE**: Keeps repository clean and current

---

## **🔧 API-SPECIFIC CHECKS**

### **6. API Health Check**
```bash
# Test backend connectivity
curl -s https://shadow-goose-api.onrender.com/health | jq .

# Test authentication
curl -s -X POST https://shadow-goose-api.onrender.com/auth/login -H "Content-Type: application/json" -d '{"username":"test","password":"test"}' | jq .
```
**REQUIREMENT**: APIs must be responding correctly
**PURPOSE**: Ensures backend integration is working

### **7. Frontend Service Check**
```bash
# Test local development server
npm run dev
```
**REQUIREMENT**: Must start without errors
**PURPOSE**: Verifies frontend is functional

---

## **📊 COMPREHENSIVE AUDIT CHECKLIST**

### **Before Every Commit:**

- [ ] **TypeScript**: `npm run typecheck` passes
- [ ] **Build**: `npm run build` succeeds
- [ ] **Lint**: `npm run lint` passes
- [ ] **Files**: Review `git status` and `git diff --cached`
- [ ] **Outdated**: Remove/update outdated files
- [ ] **APIs**: Test backend connectivity
- [ ] **Frontend**: Test local development server
- [ ] **Documentation**: Update relevant docs if needed

### **Before Major Commits:**

- [ ] **All above checks** ✅
- [ ] **Integration Tests**: Run full system test
- [ ] **Performance**: Check bundle size and load times
- [ ] **Security**: Review for security implications
- [ ] **Documentation**: Update all relevant documentation
- [ ] **Deployment**: Verify deployment readiness

---

## **🚨 FAILURE HANDLING**

### **If Checks Fail:**

1. **STOP** - Do not commit until all issues are resolved
2. **FIX** - Address all TypeScript, build, or lint errors
3. **RETEST** - Run all checks again
4. **COMMIT** - Only commit when all checks pass

### **Emergency Bypass (Rare Cases Only):**
```bash
git commit --no-verify -m "EMERGENCY: [Brief description]"
```
**REQUIREMENT**: Must be followed by immediate fix commit
**PURPOSE**: For critical fixes that cannot wait

---

## **📋 IMPLEMENTATION**

### **Automated Checks (Pre-commit Hooks):**
- ✅ TypeScript compilation
- ✅ Linting
- ✅ File formatting
- ✅ Security checks

### **Manual Checks (Developer Responsibility):**
- ✅ Build verification
- ✅ API testing
- ✅ Outdated file cleanup
- ✅ Documentation updates

---

## **🎯 SUCCESS CRITERIA**

### **Commit is Ready When:**
- [ ] All automated checks pass
- [ ] All manual checks pass
- [ ] Code is production-ready
- [ ] Documentation is updated
- [ ] No outdated data remains
- [ ] APIs are functional
- [ ] Frontend is working

### **Quality Standards:**
- **Zero TypeScript errors**
- **Zero build failures**
- **Zero linting errors**
- **Clean git status**
- **Updated documentation**
- **Functional APIs**
- **Working frontend**

---

## **📚 EXAMPLES**

### **✅ Good Commit Process:**
```bash
# 1. Make changes
# 2. Run checks
npm run typecheck    # ✅ Passes
npm run build        # ✅ Passes
npm run lint         # ✅ Passes
# 3. Review changes
git status
git diff --cached
# 4. Clean up outdated files
rm outdated-file.txt
# 5. Commit
git add .
git commit -m "✅ Feature: [Description]"
```

### **❌ Bad Commit Process:**
```bash
# 1. Make changes
# 2. Skip checks
# 3. Commit immediately
git add .
git commit -m "Quick fix"  # ❌ No checks performed
```

---

## **🔒 ENFORCEMENT**

### **Team Responsibility:**
- **Every developer** must follow this rule
- **Code reviews** must verify checks were performed
- **CI/CD pipeline** enforces automated checks
- **Team leads** ensure compliance

### **Consequences of Non-Compliance:**
- **Build failures** in CI/CD
- **TypeScript errors** in production
- **API integration issues**
- **Poor user experience**
- **Technical debt accumulation**

---

## **📈 BENEFITS**

### **Immediate Benefits:**
- ✅ **Zero production errors**
- ✅ **Consistent code quality**
- ✅ **Reliable deployments**
- ✅ **Clean repository**

### **Long-term Benefits:**
- ✅ **Reduced technical debt**
- ✅ **Faster development**
- ✅ **Better user experience**
- ✅ **Professional standards**

---

**🎯 This rule ensures the SGE V3 GIIS system maintains the highest standards of quality, reliability, and professionalism. Every commit must meet these standards before being accepted into the codebase.**
