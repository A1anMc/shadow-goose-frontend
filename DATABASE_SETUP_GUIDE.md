# 🗄️ **DATABASE SETUP GUIDE**

## **OVERVIEW**

This guide will help you set up PostgreSQL for the SGE Grants System, replacing the current SQLite implementation with a production-ready database.

## **STEP 1: CHOOSE YOUR DATABASE PROVIDER**

### **Option A: Render (Recommended - Easy Setup)**
```bash
# 1. Go to https://render.com
# 2. Sign up/Login
# 3. Create New > PostgreSQL
# 4. Configure:
#    - Name: sge-grants-db
#    - Database: sge_grants_db
#    - User: sge_user
#    - Region: Choose closest to you
# 5. Copy the connection string
```

### **Option B: Supabase (PostgreSQL + Features)**
```bash
# 1. Go to https://supabase.com
# 2. Create new project
# 3. Go to Settings > Database
# 4. Copy the connection string
```

### **Option C: AWS RDS (Enterprise)**
```bash
# 1. AWS Console > RDS
# 2. Create database
# 3. Choose PostgreSQL
# 4. Configure security groups
# 5. Get connection string
```

## **STEP 2: CONFIGURE ENVIRONMENT**

### **Create .env.local file:**
```bash
# Database Configuration
DATABASE_URL="postgresql://username:password@host:port/database"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# API Configuration
NEXT_PUBLIC_API_URL="http://localhost:3000/api"

# External APIs
CREATIVE_AUSTRALIA_API_KEY="your-api-key"
SCREEN_AUSTRALIA_API_KEY="your-api-key"
VICSCREEN_API_KEY="your-api-key"
```

### **Generate NextAuth Secret:**
```bash
# Run this command to generate a secure secret
openssl rand -base64 32
```

## **STEP 3: SETUP DATABASE**

### **1. Generate Prisma Client:**
```bash
npm run db:generate
```

### **2. Run Database Migration:**
```bash
npm run db:migrate
```

### **3. Setup Sample Data:**
```bash
npm run db:setup
```

### **4. Verify Setup:**
```bash
npm run db:studio
```

## **STEP 4: UPDATE API ROUTES**

The API routes have been updated to use Prisma instead of SQLite. Key changes:

### **Before (SQLite):**
```typescript
import { db } from '../../../src/lib/database';
const result = db.prepare(query).all(params);
```

### **After (Prisma):**
```typescript
import { db } from '../../../src/lib/database';
const result = await db.grants.findMany();
```

## **STEP 5: TEST THE SETUP**

### **1. Start Development Server:**
```bash
npm run dev
```

### **2. Test API Endpoints:**
```bash
# Health check
curl http://localhost:3000/api/health

# Get grants
curl http://localhost:3000/api/grants

# Get users
curl http://localhost:3000/api/users
```

### **3. Test Database Connection:**
```bash
# Check database health
curl http://localhost:3000/api/status
```

## **STEP 6: DEPLOY TO PRODUCTION**

### **1. Update Vercel Environment Variables:**
```bash
# Go to Vercel Dashboard > Your Project > Settings > Environment Variables
# Add:
DATABASE_URL="your-production-database-url"
NEXTAUTH_SECRET="your-production-secret"
NEXTAUTH_URL="https://your-domain.vercel.app"
```

### **2. Deploy:**
```bash
npm run deploy:vercel
```

### **3. Run Production Migration:**
```bash
# Connect to production database and run:
npx prisma migrate deploy
```

## **DATABASE SCHEMA**

### **Core Tables:**
- **users** - User management and authentication
- **grants** - Available grants and funding opportunities
- **grant_applications** - User applications for grants
- **projects** - User projects and initiatives
- **impact_measurements** - Impact metrics and measurements
- **impact_stories** - Success stories and case studies
- **notifications** - User notifications and alerts
- **okrs** - Objectives and Key Results
- **relationships** - Stakeholder and partner relationships

### **Relationships:**
- Users can have multiple applications and projects
- Grants can have multiple applications and impact measurements
- Applications can have multiple documents and impact stories
- Projects can have multiple mappings

## **SAMPLE DATA**

The setup script creates:

### **Users:**
- **Admin**: admin@sge.com (ADMIN role)
- **Manager**: manager@sge.com (MANAGER role)
- **User**: user@sge.com (USER role)

### **Grants:**
- Climate Action Grant ($50,000)
- Community Health Initiative ($75,000)
- Digital Innovation Fund ($100,000)

### **Projects:**
- Renewable Energy Initiative
- Community Health Program

### **Applications:**
- Solar Energy Implementation
- Mobile Health Clinic

## **TROUBLESHOOTING**

### **Common Issues:**

#### **1. Connection Failed**
```bash
# Check DATABASE_URL format
# Ensure database is accessible
# Verify credentials
```

#### **2. Migration Errors**
```bash
# Reset database
npm run db:reset

# Regenerate client
npm run db:generate
```

#### **3. Prisma Client Issues**
```bash
# Regenerate client
npm run db:generate

# Restart development server
npm run dev
```

#### **4. Environment Variables**
```bash
# Check .env.local exists
# Verify DATABASE_URL format
# Ensure NEXTAUTH_SECRET is set
```

## **SECURITY CONSIDERATIONS**

### **1. Database Security:**
- Use strong passwords
- Enable SSL connections
- Restrict network access
- Regular backups

### **2. Environment Variables:**
- Never commit .env files
- Use different secrets for dev/prod
- Rotate secrets regularly

### **3. Connection Pooling:**
- Configure appropriate pool size
- Monitor connection usage
- Handle connection errors

## **MONITORING**

### **1. Database Health:**
```bash
# Check health endpoint
curl http://localhost:3000/api/health
```

### **2. Prisma Studio:**
```bash
# Open database browser
npm run db:studio
```

### **3. Logs:**
```bash
# Check application logs
tail -f logs/app.log
```

## **NEXT STEPS**

After database setup:

1. **Implement Authentication** (NextAuth.js)
2. **Connect Real APIs** (Creative Australia, etc.)
3. **Add File Upload** (S3/Cloudinary)
4. **Implement Notifications** (Email/SMS)
5. **Add Monitoring** (Sentry, etc.)

## **SUPPORT**

If you encounter issues:

1. Check the troubleshooting section
2. Review Prisma documentation
3. Check database provider status
4. Contact support team

---

**🎉 Your PostgreSQL database is now ready for production!**
