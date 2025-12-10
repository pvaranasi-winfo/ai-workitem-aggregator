import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clear existing data (in correct order to respect foreign keys)
  console.log('🗑️  Clearing existing data...');
  await prisma.dailyStandup.deleteMany();
  await prisma.retrospective.deleteMany();
  await prisma.sprintTicket.deleteMany();
  await prisma.sprint.deleteMany();
  await prisma.timeEntry.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.integration.deleteMany();
  await prisma.leave.deleteMany();
  await prisma.userProject.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  // Create users with different roles
  console.log('👥 Creating users with RBAC roles...');
  
  const admin = await prisma.user.create({
    data: {
      email: 'admin@company.com',
      name: 'System Administrator',
      displayName: 'System Administrator',
      jobTitle: 'System Admin',
      department: 'IT',
      officeLocation: 'HQ - Building A',
      resourceType: 'Dedicated',
      role: 'ADMIN',
    },
  });

  const pm1 = await prisma.user.create({
    data: {
      email: 'sarah.johnson@company.com',
      name: 'Sarah Johnson',
      displayName: 'Sarah Johnson',
      jobTitle: 'Project Manager',
      department: 'Engineering',
      officeLocation: 'HQ - Building B',
      resourceType: 'Dedicated',
      role: 'PROJECT_MANAGER',
    },
  });

  const pm2 = await prisma.user.create({
    data: {
      email: 'mike.chen@company.com',
      name: 'Mike Chen',
      displayName: 'Mike Chen',
      jobTitle: 'Project Manager',
      department: 'Engineering',
      officeLocation: 'Remote',
      resourceType: 'Dedicated',
      role: 'PROJECT_MANAGER',
    },
  });

  const tdm1 = await prisma.user.create({
    data: {
      email: 'alex.rivera@company.com',
      name: 'Alex Rivera',
      displayName: 'Alex Rivera',
      jobTitle: 'Technical Delivery Manager',
      department: 'Engineering',
      officeLocation: 'HQ - Building B',
      resourceType: 'Dedicated',
      role: 'TECHNICAL_DELIVERY_MANAGER',
    },
  });

  const tdm2 = await prisma.user.create({
    data: {
      email: 'priya.sharma@company.com',
      name: 'Priya Sharma',
      displayName: 'Priya Sharma',
      jobTitle: 'Technical Delivery Manager',
      department: 'Engineering',
      officeLocation: 'Bangalore Office',
      resourceType: 'Dedicated',
      role: 'TECHNICAL_DELIVERY_MANAGER',
    },
  });

  const sm1 = await prisma.user.create({
    data: {
      email: 'emma.wilson@company.com',
      name: 'Emma Wilson',
      displayName: 'Emma Wilson',
      jobTitle: 'Scrum Master',
      department: 'Engineering',
      officeLocation: 'HQ - Building C',
      resourceType: 'Dedicated',
      role: 'SCRUM_MASTER',
    },
  });

  const sm2 = await prisma.user.create({
    data: {
      email: 'david.park@company.com',
      name: 'David Park',
      displayName: 'David Park',
      jobTitle: 'Scrum Master',
      department: 'Engineering',
      officeLocation: 'Remote',
      resourceType: 'Shared',
      role: 'SCRUM_MASTER',
    },
  });

  const employees = await Promise.all([
    prisma.user.create({
      data: {
        email: 'john.doe@company.com',
        name: 'John Doe',
        displayName: 'John Doe',
        jobTitle: 'Senior Software Engineer',
        department: 'Engineering',
        officeLocation: 'HQ - Building B',
        resourceType: 'Dedicated',
        role: 'EMPLOYEE',
      },
    }),
    prisma.user.create({
      data: {
        email: 'jane.smith@company.com',
        name: 'Jane Smith',
        displayName: 'Jane Smith',
        jobTitle: 'Software Engineer',
        department: 'Engineering',
        officeLocation: 'HQ - Building B',
        resourceType: 'Dedicated',
        role: 'EMPLOYEE',
      },
    }),
    prisma.user.create({
      data: {
        email: 'robert.brown@company.com',
        name: 'Robert Brown',
        displayName: 'Robert Brown',
        jobTitle: 'Full Stack Developer',
        department: 'Engineering',
        officeLocation: 'Remote',
        resourceType: 'Dedicated',
        role: 'EMPLOYEE',
      },
    }),
    prisma.user.create({
      data: {
        email: 'lisa.anderson@company.com',
        name: 'Lisa Anderson',
        displayName: 'Lisa Anderson',
        jobTitle: 'Frontend Developer',
        department: 'Engineering',
        officeLocation: 'HQ - Building C',
        resourceType: 'Dedicated',
        role: 'EMPLOYEE',
      },
    }),
    prisma.user.create({
      data: {
        email: 'kevin.martinez@company.com',
        name: 'Kevin Martinez',
        displayName: 'Kevin Martinez',
        jobTitle: 'Backend Developer',
        department: 'Engineering',
        officeLocation: 'Bangalore Office',
        resourceType: 'Shared',
        role: 'EMPLOYEE',
      },
    }),
    prisma.user.create({
      data: {
        email: 'maria.garcia@company.com',
        name: 'Maria Garcia',
        displayName: 'Maria Garcia',
        jobTitle: 'QA Engineer',
        department: 'Quality Assurance',
        officeLocation: 'HQ - Building A',
        resourceType: 'Dedicated',
        role: 'EMPLOYEE',
      },
    }),
    prisma.user.create({
      data: {
        email: 'thomas.lee@company.com',
        name: 'Thomas Lee',
        displayName: 'Thomas Lee',
        jobTitle: 'DevOps Engineer',
        department: 'Engineering',
        officeLocation: 'Remote',
        resourceType: 'Dedicated',
        role: 'EMPLOYEE',
      },
    }),
    prisma.user.create({
      data: {
        email: 'amy.taylor@company.com',
        name: 'Amy Taylor',
        displayName: 'Amy Taylor',
        jobTitle: 'UI/UX Designer',
        department: 'Design',
        officeLocation: 'HQ - Building C',
        resourceType: 'Shared',
        role: 'EMPLOYEE',
      },
    }),
  ]);

  console.log(`✅ Created ${1 + 2 + 2 + 2 + employees.length} users (1 Admin, 2 PMs, 2 TDMs, 2 SMs, ${employees.length} Employees)`);

  // Create Projects (created by Project Managers)
  console.log('📁 Creating projects...');
  
  const project1 = await prisma.project.create({
    data: {
      title: 'E-Commerce Platform Redesign',
      description: 'Complete redesign of the customer-facing e-commerce platform with improved UX and performance',
      capacity: 160,
      location: 'HQ - Building B',
      status: 'Active',
      startDate: new Date('2024-01-01'),
      createdById: pm1.id,
      managerId: pm1.id,
    },
  });

  const project2 = await prisma.project.create({
    data: {
      title: 'Mobile App Development',
      description: 'Native mobile applications for iOS and Android platforms',
      capacity: 120,
      location: 'Remote',
      status: 'Active',
      startDate: new Date('2024-02-15'),
      createdById: pm2.id,
      managerId: pm2.id,
    },
  });

  const project3 = await prisma.project.create({
    data: {
      title: 'API Modernization',
      description: 'Migrate legacy REST APIs to GraphQL and improve performance',
      capacity: 80,
      location: 'Bangalore Office',
      status: 'Active',
      startDate: new Date('2024-03-01'),
      createdById: pm1.id,
      managerId: pm1.id,
    },
  });

  const project4 = await prisma.project.create({
    data: {
      title: 'Data Analytics Dashboard',
      description: 'Real-time analytics dashboard for business intelligence',
      capacity: 100,
      location: 'HQ - Building A',
      status: 'Planning',
      startDate: new Date('2025-01-01'),
      createdById: pm2.id,
      managerId: pm2.id,
    },
  });

  console.log('✅ Created 4 projects');

  // Assign users to projects
  console.log('🔗 Assigning users to projects...');
  
  await prisma.userProject.createMany({
    data: [
      // Project 1 team
      { userId: employees[0].id, projectId: project1.id, role: 'Tech Lead', allocationPercentage: 100 },
      { userId: employees[1].id, projectId: project1.id, role: 'Developer', allocationPercentage: 100 },
      { userId: employees[2].id, projectId: project1.id, role: 'Developer', allocationPercentage: 100 },
      { userId: employees[7].id, projectId: project1.id, role: 'UI/UX Designer', allocationPercentage: 50 },
      { userId: tdm1.id, projectId: project1.id, role: 'Technical Delivery Manager', allocationPercentage: 100 },
      { userId: sm1.id, projectId: project1.id, role: 'Scrum Master', allocationPercentage: 100 },
      
      // Project 2 team
      { userId: employees[3].id, projectId: project2.id, role: 'Frontend Lead', allocationPercentage: 100 },
      { userId: employees[4].id, projectId: project2.id, role: 'Backend Developer', allocationPercentage: 80 },
      { userId: employees[5].id, projectId: project2.id, role: 'QA Engineer', allocationPercentage: 100 },
      { userId: employees[7].id, projectId: project2.id, role: 'UI/UX Designer', allocationPercentage: 50 },
      { userId: tdm2.id, projectId: project2.id, role: 'Technical Delivery Manager', allocationPercentage: 100 },
      { userId: sm2.id, projectId: project2.id, role: 'Scrum Master', allocationPercentage: 50 },
      
      // Project 3 team
      { userId: employees[4].id, projectId: project3.id, role: 'Backend Lead', allocationPercentage: 20 },
      { userId: employees[6].id, projectId: project3.id, role: 'DevOps Engineer', allocationPercentage: 100 },
      { userId: employees[2].id, projectId: project3.id, role: 'Full Stack Developer', allocationPercentage: 0 },
      { userId: tdm1.id, projectId: project3.id, role: 'Technical Delivery Manager', allocationPercentage: 0 },
      { userId: sm2.id, projectId: project3.id, role: 'Scrum Master', allocationPercentage: 50 },
    ],
  });

  console.log(`✅ Assigned users to projects`);

  console.log('\n🎉 Database seeding completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`   - Users: ${1 + 2 + 2 + 2 + employees.length}`);
  console.log(`   - Projects: 4`);
  console.log('\n📧 Test Login Accounts:');
  console.log(`   - Admin: admin@company.com`);
  console.log(`   - Project Manager: sarah.johnson@company.com`);
  console.log(`   - Technical Delivery Manager: alex.rivera@company.com`);
  console.log(`   - Scrum Master: emma.wilson@company.com`);
  console.log(`   - Employee: john.doe@company.com`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
