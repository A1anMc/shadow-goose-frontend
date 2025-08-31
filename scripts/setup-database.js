#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function setupDatabase() {
  try {
    console.log('🔧 Setting up PostgreSQL database...');

    // Test connection
    await prisma.$connect();
    console.log('✅ Database connection successful');

    // Create sample users
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@sge.com' },
      update: {},
      create: {
        email: 'admin@sge.com',
        name: 'System Administrator',
        role: 'ADMIN',
      },
    });

    const managerUser = await prisma.user.upsert({
      where: { email: 'manager@sge.com' },
      update: {},
      create: {
        email: 'manager@sge.com',
        name: 'Project Manager',
        role: 'MANAGER',
      },
    });

    const regularUser = await prisma.user.upsert({
      where: { email: 'user@sge.com' },
      update: {},
      create: {
        email: 'user@sge.com',
        name: 'Regular User',
        role: 'USER',
      },
    });

    console.log('✅ Sample users created');

    // Create sample grants
    const grants = await Promise.all([
      prisma.grant.upsert({
        where: { id: 'grant_001' },
        update: {},
        create: {
          id: 'grant_001',
          title: 'Climate Action Grant',
          description: 'Supporting innovative climate change solutions',
          amount: 50000,
          deadline: new Date('2025-12-31'),
          category: 'Environment',
          status: 'OPEN',
          organization: 'Department of Environment',
          eligibility: 'Non-profit organizations working on climate solutions',
          requirements: 'Detailed project proposal, budget breakdown, impact assessment',
        },
      }),
      prisma.grant.upsert({
        where: { id: 'grant_002' },
        update: {},
        create: {
          id: 'grant_002',
          title: 'Community Health Initiative',
          description: 'Improving health outcomes in underserved communities',
          amount: 75000,
          deadline: new Date('2025-11-30'),
          category: 'Health',
          status: 'OPEN',
          organization: 'Health Department',
          eligibility: 'Healthcare providers and community organizations',
          requirements: 'Health impact metrics, community engagement plan',
        },
      }),
      prisma.grant.upsert({
        where: { id: 'grant_003' },
        update: {},
        create: {
          id: 'grant_003',
          title: 'Digital Innovation Fund',
          description: 'Supporting digital transformation projects',
          amount: 100000,
          deadline: new Date('2025-10-31'),
          category: 'Technology',
          status: 'CLOSING_SOON',
          organization: 'Innovation Department',
          eligibility: 'Technology startups and digital transformation projects',
          requirements: 'Technical feasibility study, market analysis, implementation timeline',
        },
      }),
    ]);

    console.log('✅ Sample grants created');

    // Create sample projects
    const projects = await Promise.all([
      prisma.project.upsert({
        where: { id: 'project_001' },
        update: {},
        create: {
          id: 'project_001',
          name: 'Renewable Energy Initiative',
          description: 'Implementing solar and wind energy solutions',
          status: 'ACTIVE',
          userId: adminUser.id,
        },
      }),
      prisma.project.upsert({
        where: { id: 'project_002' },
        update: {},
        create: {
          id: 'project_002',
          name: 'Community Health Program',
          description: 'Improving access to healthcare services',
          status: 'ACTIVE',
          userId: managerUser.id,
        },
      }),
    ]);

    console.log('✅ Sample projects created');

    // Create sample grant applications
    const applications = await Promise.all([
      prisma.grantApplication.upsert({
        where: { id: 'app_001' },
        update: {},
        create: {
          id: 'app_001',
          grantId: 'grant_001',
          userId: adminUser.id,
          title: 'Solar Energy Implementation',
          description: 'Installing solar panels in community centers',
          budget: 45000,
          timeline: '12 months',
          status: 'SUBMITTED',
          priority: 'HIGH',
        },
      }),
      prisma.grantApplication.upsert({
        where: { id: 'app_002' },
        update: {},
        create: {
          id: 'app_002',
          grantId: 'grant_002',
          userId: managerUser.id,
          title: 'Mobile Health Clinic',
          description: 'Providing healthcare services to remote communities',
          budget: 70000,
          timeline: '18 months',
          status: 'IN_PROGRESS',
          priority: 'CRITICAL',
        },
      }),
    ]);

    console.log('✅ Sample grant applications created');

    // Create sample impact measurements
    const impactMeasurements = await Promise.all([
      prisma.impactMeasurement.upsert({
        where: { id: 'impact_001' },
        update: {},
        create: {
          id: 'impact_001',
          grantId: 'grant_001',
          metric: 'Carbon Emissions Reduced',
          value: 150,
          unit: 'tonnes CO2',
          period: 'Annual',
        },
      }),
      prisma.impactMeasurement.upsert({
        where: { id: 'impact_002' },
        update: {},
        create: {
          id: 'impact_002',
          grantId: 'grant_002',
          metric: 'People Served',
          value: 500,
          unit: 'individuals',
          period: 'Monthly',
        },
      }),
    ]);

    console.log('✅ Sample impact measurements created');

    // Create sample impact stories
    const impactStories = await Promise.all([
      prisma.impactStory.upsert({
        where: { id: 'story_001' },
        update: {},
        create: {
          id: 'story_001',
          applicationId: 'app_001',
          title: 'Community Solar Success',
          description: 'Our solar energy project successfully reduced carbon emissions by 150 tonnes annually while providing clean energy to 3 community centers.',
          category: 'Environmental Impact',
        },
      }),
      prisma.impactStory.upsert({
        where: { id: 'story_002' },
        update: {},
        create: {
          id: 'story_002',
          applicationId: 'app_002',
          title: 'Healthcare Access Improved',
          description: 'Our mobile health clinic reached 500 people in underserved communities, providing essential healthcare services and education.',
          category: 'Health Impact',
        },
      }),
    ]);

    console.log('✅ Sample impact stories created');

    // Create sample notifications
    const notifications = await Promise.all([
      prisma.notification.upsert({
        where: { id: 'notif_001' },
        update: {},
        create: {
          id: 'notif_001',
          userId: adminUser.id,
          type: 'DEADLINE',
          title: 'Grant Deadline Approaching',
          message: 'Climate Action Grant deadline is in 30 days',
          priority: 'HIGH',
          actionUrl: '/grants/grant_001',
        },
      }),
      prisma.notification.upsert({
        where: { id: 'notif_002' },
        update: {},
        create: {
          id: 'notif_002',
          userId: managerUser.id,
          type: 'STATUS_UPDATE',
          title: 'Application Status Updated',
          message: 'Your Community Health Initiative application has been approved',
          priority: 'MEDIUM',
          actionUrl: '/applications/app_002',
        },
      }),
    ]);

    console.log('✅ Sample notifications created');

    // Create sample OKRs
    const okrs = await Promise.all([
      prisma.oKR.upsert({
        where: { id: 'okr_001' },
        update: {},
        create: {
          id: 'okr_001',
          objective: 'Increase Grant Success Rate',
          keyResults: ['Achieve 80% approval rate', 'Submit 50 applications', 'Improve application quality'],
          status: 'IN_PROGRESS',
        },
      }),
      prisma.oKR.upsert({
        where: { id: 'okr_002' },
        update: {},
        create: {
          id: 'okr_002',
          objective: 'Expand Impact Measurement',
          keyResults: ['Track 100% of projects', 'Implement new metrics', 'Generate quarterly reports'],
          status: 'ON_TRACK',
        },
      }),
    ]);

    console.log('✅ Sample OKRs created');

    // Create sample relationships
    const relationships = await Promise.all([
      prisma.relationship.upsert({
        where: { id: 'rel_001' },
        update: {},
        create: {
          id: 'rel_001',
          name: 'Department of Environment',
          type: 'FUNDER',
          stage: 'ACTIVE',
          priority: 'HIGH',
          notes: 'Primary funding partner for environmental projects',
        },
      }),
      prisma.relationship.upsert({
        where: { id: 'rel_002' },
        update: {},
        create: {
          id: 'rel_002',
          name: 'Community Health Partners',
          type: 'PARTNER',
          stage: 'ENGAGED',
          priority: 'MEDIUM',
          notes: 'Collaborative partner for health initiatives',
        },
      }),
    ]);

    console.log('✅ Sample relationships created');

    console.log('🎉 Database setup completed successfully!');
    console.log('\n📊 Sample data created:');
    console.log('- 3 users (admin, manager, regular)');
    console.log('- 3 grants');
    console.log('- 2 projects');
    console.log('- 2 grant applications');
    console.log('- 2 impact measurements');
    console.log('- 2 impact stories');
    console.log('- 2 notifications');
    console.log('- 2 OKRs');
    console.log('- 2 relationships');

    console.log('\n🔑 Test credentials:');
    console.log('- Admin: admin@sge.com');
    console.log('- Manager: manager@sge.com');
    console.log('- User: user@sge.com');

  } catch (error) {
    console.error('❌ Database setup failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run setup if called directly
if (require.main === module) {
  setupDatabase()
    .then(() => {
      console.log('✅ Setup completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Setup failed:', error);
      process.exit(1);
    });
}

module.exports = { setupDatabase };
