// ==========================================
// KRIFY SOFTWARE TECHNOLOGIES
// PROJECT MANAGEMENT PORTAL - MOCK DATA
// WITH ACTUAL PROJECT DATA FROM EXCEL SHEET
// ==========================================

import type { 
  User, Project, Task, TaskStatus, Milestone, MaintenanceProject, 
  Resource, Risk, WeeklyMeeting, DashboardStats, 
  Notification, WorkUpdate 
} from '../types';

// Current date for reference
const now = new Date();
const addDays = (days: number) => new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
const addMonths = (months: number) => new Date(now.getFullYear(), now.getMonth() + months, now.getDate());

// ==========================================
// USERS - ACTUAL KRIFY TEAM MEMBERS
// ==========================================

export const mockUsers: User[] = [
  {
    id: 'usr-001',
    name: 'Krishna Sir',
    email: 'krishna@krify.com',
    role: 'super_admin',
    department: 'Management',
    isActive: true,
    lastLogin: now,
    createdAt: addMonths(-24),
    permissions: ['all']
  },
  {
    id: 'usr-002',
    name: 'Madhav',
    email: 'madhav@krify.com',
    role: 'project_manager',
    department: 'Project Management',
    isActive: true,
    lastLogin: addDays(-1),
    createdAt: addMonths(-18),
    permissions: ['projects.manage', 'tasks.manage', 'resources.view']
  },
  {
    id: 'usr-003',
    name: 'Sudha',
    email: 'sudha@krify.com',
    role: 'sales_coordinator',
    department: 'Sales',
    isActive: true,
    lastLogin: addDays(-2),
    createdAt: addMonths(-12),
    permissions: ['clients.view', 'milestones.view', 'projects.view']
  },
  {
    id: 'usr-004',
    name: 'Geetha',
    email: 'geetha@krify.com',
    role: 'sales_coordinator',
    department: 'Sales',
    isActive: true,
    lastLogin: addDays(-1),
    createdAt: addMonths(-10),
    permissions: ['clients.view', 'milestones.view', 'projects.view']
  },
  // Developers
  {
    id: 'usr-005',
    name: 'Karimunnisa',
    email: 'karimunnisa@krify.com',
    role: 'developer',
    department: 'Web Development',
    isActive: true,
    lastLogin: addDays(-3),
    createdAt: addMonths(-15),
    permissions: ['tasks.view', 'tasks.update']
  },
  {
    id: 'usr-006',
    name: 'Rajyalakshmi',
    email: 'rajyalakshmi@krify.com',
    role: 'developer',
    department: 'Web Development',
    isActive: true,
    lastLogin: addDays(-1),
    createdAt: addMonths(-14),
    permissions: ['tasks.view', 'tasks.update']
  },
  {
    id: 'usr-007',
    name: 'Krishna Santhosh',
    email: 'krishnasantosh@krify.com',
    role: 'developer',
    department: 'Web Frontend',
    isActive: true,
    lastLogin: addDays(-5),
    createdAt: addMonths(-8),
    permissions: ['tasks.view', 'tasks.update']
  },
  {
    id: 'usr-008',
    name: 'Sainath',
    email: 'sainath@krify.com',
    role: 'developer',
    department: 'Web Development',
    isActive: true,
    lastLogin: addDays(-2),
    createdAt: addMonths(-6),
    permissions: ['tasks.view', 'tasks.update']
  },
  {
    id: 'usr-009',
    name: 'Sathibabu',
    email: 'sathibabu@krify.com',
    role: 'developer',
    department: 'Web Backend',
    isActive: true,
    lastLogin: addDays(-1),
    createdAt: addMonths(-9),
    permissions: ['tasks.view', 'tasks.update']
  },
  {
    id: 'usr-010',
    name: 'Pavan',
    email: 'pavan@krify.com',
    role: 'developer',
    department: 'Web Backend',
    isActive: true,
    lastLogin: addDays(-4),
    createdAt: addMonths(-7),
    permissions: ['tasks.view', 'tasks.update']
  },
  {
    id: 'usr-011',
    name: 'SriSatya',
    email: 'srisatya@krify.com',
    role: 'developer',
    department: 'Web Backend',
    isActive: true,
    lastLogin: addDays(-2),
    createdAt: addMonths(-11),
    permissions: ['tasks.view', 'tasks.update']
  },
  {
    id: 'usr-012',
    name: 'Tarun',
    email: 'tarun@krify.com',
    role: 'developer',
    department: 'Flutter/iOS',
    isActive: true,
    lastLogin: addDays(-1),
    createdAt: addMonths(-5),
    permissions: ['tasks.view', 'tasks.update']
  },
  {
    id: 'usr-013',
    name: 'Sudarshan',
    email: 'sudarshan@krify.com',
    role: 'developer',
    department: 'Android',
    isActive: true,
    lastLogin: addDays(-3),
    createdAt: addMonths(-8),
    permissions: ['tasks.view', 'tasks.update']
  },
  {
    id: 'usr-014',
    name: 'Srividya',
    email: 'srividya@krify.com',
    role: 'developer',
    department: 'iOS',
    isActive: true,
    lastLogin: addDays(-1),
    createdAt: addMonths(-10),
    permissions: ['tasks.view', 'tasks.update']
  },
  {
    id: 'usr-015',
    name: 'Bhanu',
    email: 'bhanu@krify.com',
    role: 'developer',
    department: 'Android',
    isActive: true,
    lastLogin: addDays(-2),
    createdAt: addMonths(-9),
    permissions: ['tasks.view', 'tasks.update']
  },
  {
    id: 'usr-016',
    name: 'Gopal',
    email: 'gopal@krify.com',
    role: 'developer',
    department: 'Web Frontend',
    isActive: true,
    lastLogin: addDays(-1),
    createdAt: addMonths(-16),
    permissions: ['tasks.view', 'tasks.update']
  },
  {
    id: 'usr-017',
    name: 'Anusha',
    email: 'anusha@krify.com',
    role: 'developer',
    department: 'Web Frontend',
    isActive: true,
    lastLogin: addDays(-3),
    createdAt: addMonths(-12),
    permissions: ['tasks.view', 'tasks.update']
  },
  {
    id: 'usr-018',
    name: 'Yamuna',
    email: 'yamuna@krify.com',
    role: 'developer',
    department: 'Web Backend',
    isActive: true,
    lastLogin: addDays(-2),
    createdAt: addMonths(-10),
    permissions: ['tasks.view', 'tasks.update']
  },
  {
    id: 'usr-019',
    name: 'Therissa',
    email: 'therissa@krify.com',
    role: 'developer',
    department: 'Web Backend',
    isActive: true,
    lastLogin: addDays(-1),
    createdAt: addMonths(-8),
    permissions: ['tasks.view', 'tasks.update']
  },
  // QA Team
  {
    id: 'usr-020',
    name: 'Prakash',
    email: 'prakash@krify.com',
    role: 'qa',
    department: 'QA',
    isActive: true,
    lastLogin: addDays(-2),
    createdAt: addMonths(-14),
    permissions: ['tasks.view', 'tasks.update', 'qa.manage']
  },
  {
    id: 'usr-021',
    name: 'Swathi',
    email: 'swathi@krify.com',
    role: 'qa',
    department: 'QA',
    isActive: true,
    lastLogin: addDays(-1),
    createdAt: addMonths(-12),
    permissions: ['tasks.view', 'tasks.update', 'qa.manage']
  },
  {
    id: 'usr-022',
    name: 'Venkat',
    email: 'venkat@krify.com',
    role: 'qa',
    department: 'QA',
    isActive: true,
    lastLogin: addDays(-3),
    createdAt: addMonths(-10),
    permissions: ['tasks.view', 'tasks.update', 'qa.manage']
  },
  {
    id: 'usr-023',
    name: 'Srikanth',
    email: 'srikanth@krify.com',
    role: 'qa',
    department: 'QA',
    isActive: true,
    lastLogin: addDays(-1),
    createdAt: addMonths(-8),
    permissions: ['tasks.view', 'tasks.update', 'qa.manage']
  },
  // UI/UX
  {
    id: 'usr-024',
    name: 'Siva',
    email: 'siva@krify.com',
    role: 'developer',
    department: 'UI/UX',
    isActive: true,
    lastLogin: addDays(-2),
    createdAt: addMonths(-20),
    permissions: ['tasks.view', 'tasks.update']
  },
  {
    id: 'usr-025',
    name: 'Naveen',
    email: 'naveen@krify.com',
    role: 'developer',
    department: 'UI/UX',
    isActive: true,
    lastLogin: addDays(-1),
    createdAt: addMonths(-18),
    permissions: ['tasks.view', 'tasks.update']
  },
  {
    id: 'usr-026',
    name: 'Guna',
    email: 'guna@krify.com',
    role: 'developer',
    department: 'UI/UX',
    isActive: true,
    lastLogin: addDays(-3),
    createdAt: addMonths(-15),
    permissions: ['tasks.view', 'tasks.update']
  }
];

// ==========================================
// PROJECTS - ACTUAL KRIFY PROJECTS FROM EXCEL
// ==========================================

export const mockProjects: Project[] = [
  {
    id: 'proj-001',
    projectNumber: 'P879',
    projectName: 'Infynix - Customer Portal',
    projectType: 'running',
    clientName: 'Mr. Umesh Chaturvedi',
    clientEmail: 'umesh@infynix.in',
    clientPhone: '+91 97381 99000',
    clientCompany: 'Infynix',
    country: 'India',
    salesCoordinator: 'Sudha',
    projectManager: 'Madhav',
    assignedTeamMembers: ['Karimunnisa', 'Guna', 'Prakash', 'Madhav'],
    primaryResources: ['Karimunnisa'],
    platforms: { android: false, ios: false, webFrontend: true, webBackend: true },
    startDate: addMonths(-6),
    plannedClosureDate: new Date('2026-01-26'),
    completionPercentage: 40,
    currentPhase: 'Development',
    currentWeekUpdates: 'We shared the excel sheet template for data uploading into Database. Explained ERD diagram. Received server details from client end.',
    nextWeekTarget: 'We are waiting Excel data from client side.',
    risks: ['API integration pending from client'],
    escalations: [],
    projectTrackerLink: 'Infynix_project_plan',
    priority: 'High',
    remarks: 'Multiple releases planned through May 2026',
    status: 'Active',
    createdAt: addMonths(-6),
    updatedAt: addDays(-2)
  },
  {
    id: 'proj-002',
    projectNumber: 'P883',
    projectName: 'MGBPL - B2C E-commerce',
    projectType: 'running',
    clientName: 'MGBPL Client',
    clientEmail: 'client@mgbpl.com',
    clientPhone: '',
    clientCompany: 'MGBPL',
    country: 'India',
    salesCoordinator: 'Sudha',
    projectManager: 'Madhav',
    assignedTeamMembers: ['Krishna Santhosh', 'Sainath', 'Sathibabu', 'Pavan', 'Siva', 'Naveen', 'Prakash'],
    primaryResources: ['Krishna Santhosh', 'Sainath'],
    platforms: { android: false, ios: false, webFrontend: true, webBackend: true },
    startDate: addMonths(-4),
    plannedClosureDate: new Date('2025-12-31'),
    completionPercentage: 5,
    currentPhase: 'UI',
    currentWeekUpdates: 'We did couple of follow up mail to client.',
    nextWeekTarget: 'We were waiting the client response',
    risks: ['Client response delayed'],
    escalations: ['Client not responding'],
    priority: 'Medium',
    remarks: 'Release 1: 26-Jan-2026',
    status: 'On Hold',
    createdAt: addMonths(-4),
    updatedAt: addDays(-5)
  },
  {
    id: 'proj-003',
    projectNumber: 'P884',
    projectName: 'MGBPL - B2B E-commerce',
    projectType: 'running',
    clientName: 'MGBPL Client',
    clientEmail: 'client@mgbpl.com',
    clientPhone: '',
    clientCompany: 'MGBPL',
    country: 'India',
    salesCoordinator: 'Sudha',
    projectManager: 'Madhav',
    assignedTeamMembers: ['Krishna Santhosh', 'Sainath', 'SriSatya', 'Pavan', 'Siva', 'Naveen'],
    primaryResources: ['Krishna Santhosh', 'Sainath'],
    platforms: { android: false, ios: false, webFrontend: true, webBackend: true },
    startDate: addMonths(-8),
    plannedClosureDate: new Date('2025-12-31'),
    actualClosureDate: new Date('2026-04-15'),
    completionPercentage: 100,
    currentPhase: 'UAT',
    currentWeekUpdates: 'We did couple of follow up mail to client.',
    nextWeekTarget: 'Waiting for client response based on that, we will take next steps.',
    risks: [],
    escalations: ['Client not responding for UAT sign-off'],
    priority: 'High',
    remarks: 'Ready for deployment, waiting for client confirmation',
    status: 'Active',
    createdAt: addMonths(-8),
    updatedAt: addDays(-1)
  },
  {
    id: 'proj-004',
    projectNumber: 'P895',
    projectName: 'Oneflow - V1.5 Sleep Mode and Device Naming',
    projectType: 'running',
    clientName: 'Mr. Marvin Mischler',
    clientEmail: 'marvin@menstruflow.de',
    clientPhone: '+49 163 2792141',
    clientCompany: 'Menstruflow',
    country: 'Germany',
    salesCoordinator: 'Sudha',
    projectManager: 'Madhav',
    assignedTeamMembers: ['Tarun', 'SriSatya', 'Prakash', 'Madhav'],
    primaryResources: ['Tarun'],
    platforms: { android: true, ios: true, webFrontend: false, webBackend: true },
    startDate: addMonths(-3),
    plannedClosureDate: new Date('2026-02-23'),
    completionPercentage: 100,
    currentPhase: 'UAT',
    currentWeekUpdates: 'Client has share few UI/UX related feedback points. Had a client discussion regarding the Feedback.',
    nextWeekTarget: 'We reviewed the feedback most of them were cosmetics changes. Requested to connect today meeting.',
    risks: ['Flutter framework updates'],
    escalations: [],
    projectTrackerLink: 'Oneflow 1.5(a) - Sleep Mode and Device Naming',
    priority: 'High',
    remarks: 'Sleep mode and Device names module - 12 days effort',
    status: 'Active',
    createdAt: addMonths(-3),
    updatedAt: addDays(-1)
  },
  {
    id: 'proj-005',
    projectNumber: 'P891',
    projectName: 'Avisdevente Mobile Apps',
    projectType: 'running',
    clientName: 'Mr. Eric CODJO',
    clientEmail: 'ericberengerpro@gmail.com',
    clientPhone: '+229 97 72 62 21',
    clientCompany: 'Avisdevente',
    country: 'Benin Republic',
    salesCoordinator: 'Geetha',
    projectManager: 'Madhav',
    assignedTeamMembers: ['Sudarshan', 'Srividya', 'Sathibabu', 'Siva', 'Madhav'],
    primaryResources: ['Sudarshan', 'Srividya'],
    platforms: { android: true, ios: true, webFrontend: false, webBackend: true },
    startDate: addMonths(-5),
    plannedClosureDate: new Date('2026-03-10'),
    completionPercentage: 90,
    currentPhase: 'QA',
    currentWeekUpdates: 'We worked on Demo-2 internal QA reported issues. Shared the Demo-2 build to client. Share the French strings to client.',
    nextWeekTarget: 'Complete In-app purchases, Social Media logins, Branch.io Ads sharing feature, Demo-2 client feedback points.',
    risks: ['New features client adding into scope', '3rd party details delay from client side'],
    escalations: [],
    projectTrackerLink: 'Avisdevente_Mobile_Applications_External_Plan',
    priority: 'High',
    remarks: 'iOS - 90%, Android - 90%, Backend - 80%',
    status: 'Active',
    createdAt: addMonths(-5),
    updatedAt: addDays(-1)
  },
  {
    id: 'proj-006',
    projectNumber: 'P870',
    projectName: '9Gains',
    projectType: 'running',
    clientName: 'George / Victoria',
    clientEmail: 'admin@extensiveng.com',
    clientPhone: '',
    clientCompany: 'Extensive NG',
    country: 'Nigeria',
    salesCoordinator: 'Sudha',
    projectManager: 'Madhav',
    assignedTeamMembers: ['Siva', 'Anusha', 'Gopal', 'Therissa', 'Yamuna', 'Swathi', 'Srikanth'],
    primaryResources: ['Anusha', 'Gopal'],
    platforms: { android: false, ios: false, webFrontend: true, webBackend: true },
    startDate: addMonths(-9),
    plannedClosureDate: new Date('2026-04-30'),
    completionPercentage: 10,
    currentPhase: 'Development',
    currentWeekUpdates: 'Team has worked and doing modification on architecture changes based on client feedback. Shared finalized Architecture document to client last week.',
    nextWeekTarget: 'Currently Team is working on vendor module and customer module. Team will release build every two weeks basis.',
    risks: ['Architecture changes', 'Requirements evolving'],
    escalations: [],
    projectTrackerLink: '9Gains- Project Plan',
    priority: 'High',
    remarks: 'User Module - 8%, Admin - 0%, Milestone-2 Frontend 100% (API integration pending), Backend 40%',
    status: 'Active',
    createdAt: addMonths(-9),
    updatedAt: addDays(-2)
  },
  {
    id: 'proj-007',
    projectNumber: 'P893',
    projectName: 'Yourmoca V1.1 Enhancements',
    projectType: 'running',
    clientName: 'Mr. Sameer',
    clientEmail: 'sameer@yourmoca.com',
    clientPhone: '',
    clientCompany: 'Yourmoca',
    country: 'India',
    salesCoordinator: 'Sudha',
    projectManager: 'Madhav',
    assignedTeamMembers: ['Siva', 'Gopal', 'Yamuna', 'Tarun', 'Bhanu', 'Venkat'],
    primaryResources: ['Tarun', 'Bhanu'],
    platforms: { android: true, ios: true, webFrontend: true, webBackend: true },
    startDate: addMonths(-4),
    plannedClosureDate: new Date('2026-04-20'),
    completionPercentage: 90,
    currentPhase: 'QA',
    currentWeekUpdates: 'Did the client follow ups. Released the builds.',
    nextWeekTarget: 'We will work on WhatsApp Integrations feature after coordination with client. Waiting for client response.',
    risks: [],
    escalations: [],
    projectTrackerLink: 'Yourmoca-Enhancements',
    priority: 'Medium',
    remarks: 'Release 1: 30-Apr-2026',
    status: 'Active',
    createdAt: addMonths(-4),
    updatedAt: addDays(-3)
  },
  {
    id: 'proj-008',
    projectNumber: 'P894',
    projectName: 'Nabfins IS17802',
    projectType: 'running',
    clientName: 'Nikesh',
    clientEmail: 'nikesh@nabfins.com',
    clientPhone: '',
    clientCompany: 'Nabfins',
    country: 'India',
    salesCoordinator: 'Krishna Sir',
    projectManager: 'Madhav',
    assignedTeamMembers: ['Krishna Santhosh', 'Sainath', 'Madhav'],
    primaryResources: ['Krishna Santhosh', 'Sainath'],
    platforms: { android: false, ios: false, webFrontend: true, webBackend: false },
    startDate: addMonths(-2),
    plannedClosureDate: new Date('2026-03-03'),
    completionPercentage: 100,
    currentPhase: 'UAT',
    currentWeekUpdates: 'Completed 100% work.',
    nextWeekTarget: 'After PO we will deliver this to client.',
    risks: [],
    escalations: ['Waiting for Purchase Order'],
    projectTrackerLink: 'IS 17802 Nabfins_IS17802_',
    priority: 'High',
    remarks: 'NA milestone - completed, waiting for PO',
    status: 'Active',
    createdAt: addMonths(-2),
    updatedAt: addDays(-1)
  },
  {
    id: 'proj-009',
    projectNumber: 'P897',
    projectName: 'APDASCAC - WhatsApp e-governance',
    projectType: 'running',
    clientName: 'APDASCAC',
    clientEmail: 'ap@apdascac.com',
    clientPhone: '',
    clientCompany: 'APDASCAC',
    country: 'India',
    salesCoordinator: 'Sudha',
    projectManager: 'Madhav',
    assignedTeamMembers: ['Pavan', 'Madhav'],
    primaryResources: ['Pavan'],
    platforms: { android: false, ios: false, webFrontend: true, webBackend: true },
    startDate: addMonths(-3),
    plannedClosureDate: new Date('2026-03-10'),
    completionPercentage: 100,
    currentPhase: 'UAT',
    currentWeekUpdates: 'Completed 100% work.',
    nextWeekTarget: 'After we received the official confirmation we can take next steps. Last time we had a meeting with RTGS team informed issues, currently they are working on it.',
    risks: ['RTGS team dependency'],
    escalations: ['Waiting for RTGS team updates'],
    projectTrackerLink: 'APDASCAC_WhatsApp',
    priority: 'Medium',
    remarks: 'After complete 100% work milestone',
    status: 'Active',
    createdAt: addMonths(-3),
    updatedAt: addDays(-2)
  },
  {
    id: 'proj-010',
    projectNumber: 'P901',
    projectName: 'Andhra Electronics',
    projectType: 'running',
    clientName: 'Sri K.V Sriram Garu',
    clientEmail: 'sriram@andhraelec.com',
    clientPhone: '+91 9849955255',
    clientCompany: 'Andhra Electronics',
    country: 'India',
    salesCoordinator: 'Geetha',
    projectManager: 'Madhav',
    assignedTeamMembers: ['Sainath', 'Krishna Santhosh', 'Siva', 'Madhav'],
    primaryResources: ['Sainath', 'Krishna Santhosh'],
    platforms: { android: false, ios: false, webFrontend: true, webBackend: false },
    startDate: addMonths(-2),
    plannedClosureDate: new Date('2026-04-10'),
    completionPercentage: 90,
    currentPhase: 'Development',
    currentWeekUpdates: 'Did client follow ups for products. Updated all products in website. Team worked on Internal reported issues.',
    nextWeekTarget: 'Product updates on the website have been completed.',
    risks: [],
    escalations: [],
    projectTrackerLink: 'AndhraElectronics_WordPress_project_plan',
    priority: 'Medium',
    remarks: 'WordPress website, product catalog updates',
    status: 'Active',
    createdAt: addMonths(-2),
    updatedAt: addDays(-1)
  },
  {
    id: 'proj-011',
    projectNumber: 'P904',
    projectName: 'Krazy Keys',
    projectType: 'running',
    clientName: 'Matt',
    clientEmail: 'matthew@krazykeys.com.au',
    clientPhone: '+61 433 067 908',
    clientCompany: 'Krazy Keys',
    country: 'Australia',
    salesCoordinator: 'Sudha',
    projectManager: 'Madhav',
    assignedTeamMembers: ['Siva', 'Krishna Santhosh', 'Pavan', 'Srividya', 'Prakash', 'Madhav'],
    primaryResources: ['Srividya'],
    platforms: { android: false, ios: true, webFrontend: true, webBackend: true },
    startDate: addMonths(-4),
    plannedClosureDate: new Date('2026-05-27'),
    completionPercentage: 80,
    currentPhase: 'Development',
    currentWeekUpdates: 'Coordinated with client and shared revised builds to client for Demo-2. Worked on Client feedback points. Coordinated with client for Domain and hosting, App developer account creations.',
    nextWeekTarget: 'Today we will release final build with client feedback points. Most next 2-3 days we will close this project.',
    risks: ['Design changes'],
    escalations: [],
    projectTrackerLink: 'Krazy_Keys_Project_Plan_External',
    priority: 'High',
    remarks: 'Release 1: 30-Apr-2026, iOS App + Admin Panel',
    status: 'Active',
    createdAt: addMonths(-4),
    updatedAt: addDays(-1)
  },
  {
    id: 'proj-012',
    projectNumber: 'P907',
    projectName: 'Durga Prasad Schools Informative Website',
    projectType: 'running',
    clientName: 'Priyanka Garu',
    clientEmail: 'priyanka@durgaprasadschools.com',
    clientPhone: '+91 836 728 7644',
    clientCompany: 'Durga Prasad School',
    country: 'India',
    salesCoordinator: 'Geetha',
    projectManager: 'Madhav',
    assignedTeamMembers: ['Siva', 'Anusha', 'Srikanth', 'Madhav'],
    primaryResources: ['Anusha'],
    platforms: { android: false, ios: false, webFrontend: true, webBackend: false },
    startDate: addMonths(-1),
    plannedClosureDate: new Date('2026-05-20'),
    completionPercentage: 1,
    currentPhase: 'UI',
    currentWeekUpdates: 'Last week we shared two design proposals.',
    nextWeekTarget: 'We are waiting for approval for designs. Today we will mostly get an update.',
    risks: [],
    escalations: [],
    projectTrackerLink: 'Durgra_Prasad_Schools_Informative_WordPress_project_plan',
    priority: 'Low',
    remarks: 'WordPress informative website',
    status: 'Active',
    createdAt: addMonths(-1),
    updatedAt: addDays(-3)
  }
];

// ==========================================
// TASKS - SAMPLES FOR ACTIVE PROJECTS
// ==========================================

export const mockTasks: Task[] = [
  {
    id: 'task-001',
    taskId: 'TASK-879-001',
    projectId: 'proj-001',
    projectName: 'Infynix - Customer Portal',
    moduleName: 'Database Integration',
    title: 'Excel Data Upload Template',
    description: 'Create and share excel sheet template for data uploading into Database',
    priority: 'High',
    assignedTo: 'Karimunnisa',
    assignedBy: 'Madhav',
    startDate: addDays(-10),
    dueDate: addDays(2),
    estimatedHours: 24,
    actualHours: 20,
    status: 'Completed',
    comments: [],
    attachments: [],
    createdAt: addDays(-10),
    updatedAt: addDays(-2)
  },
  {
    id: 'task-002',
    taskId: 'TASK-879-002',
    projectId: 'proj-001',
    projectName: 'Infynix - Customer Portal',
    moduleName: 'API Integration',
    title: 'API Integration from Client',
    description: 'Waiting for client to provide API details for integration',
    priority: 'Critical',
    assignedTo: 'Karimunnisa',
    assignedBy: 'Madhav',
    startDate: addDays(-5),
    dueDate: addDays(5),
    estimatedHours: 40,
    actualHours: 0,
    status: 'Open',
    comments: [],
    attachments: [],
    createdAt: addDays(-5),
    updatedAt: addDays(-1)
  },
  {
    id: 'task-003',
    taskId: 'TASK-891-001',
    projectId: 'proj-005',
    projectName: 'Avisdevente Mobile Apps',
    moduleName: 'Payments',
    title: 'In-App Purchases Integration',
    description: 'Implement in-app purchases for iOS and Android',
    priority: 'High',
    assignedTo: 'Sudarshan',
    assignedBy: 'Madhav',
    startDate: addDays(-7),
    dueDate: addDays(7),
    estimatedHours: 32,
    actualHours: 16,
    status: 'In Progress',
    comments: [],
    attachments: [],
    createdAt: addDays(-7),
    updatedAt: addDays(-2)
  },
  {
    id: 'task-004',
    taskId: 'TASK-891-002',
    projectId: 'proj-005',
    projectName: 'Avisdevente Mobile Apps',
    moduleName: 'Authentication',
    title: 'Social Media Logins',
    description: 'Integrate Google, Apple, Facebook, Twitter and LinkedIn login',
    priority: 'High',
    assignedTo: 'Srividya',
    assignedBy: 'Madhav',
    startDate: addDays(-5),
    dueDate: addDays(5),
    estimatedHours: 24,
    actualHours: 12,
    status: 'In Progress',
    comments: [],
    attachments: [],
    createdAt: addDays(-5),
    updatedAt: addDays(-1)
  },
  {
    id: 'task-005',
    taskId: 'TASK-895-001',
    projectId: 'proj-004',
    projectName: 'Oneflow - V1.5 Sleep Mode and Device Naming',
    moduleName: 'UI/UX',
    title: 'UI Feedback Fixes',
    description: 'Address UI/UX feedback points shared by client',
    priority: 'Medium',
    assignedTo: 'Tarun',
    assignedBy: 'Madhav',
    startDate: addDays(-3),
    dueDate: addDays(2),
    estimatedHours: 16,
    actualHours: 12,
    status: 'In Progress',
    comments: [],
    attachments: [],
    createdAt: addDays(-3),
    updatedAt: addDays(-1)
  },
  {
    id: 'task-006',
    taskId: 'TASK-870-001',
    projectId: 'proj-006',
    projectName: '9Gains',
    moduleName: 'Vendor Module',
    title: 'Vendor Module Development',
    description: 'Develop vendor module functionality',
    priority: 'High',
    assignedTo: 'Anusha',
    assignedBy: 'Madhav',
    startDate: addDays(-10),
    dueDate: addDays(5),
    estimatedHours: 40,
    actualHours: 30,
    status: 'In Progress',
    comments: [],
    attachments: [],
    createdAt: addDays(-10),
    updatedAt: addDays(-2)
  },
  {
    id: 'task-007',
    taskId: 'TASK-870-002',
    projectId: 'proj-006',
    projectName: '9Gains',
    moduleName: 'Customer Module',
    title: 'Customer Module Development',
    description: 'Develop customer module functionality',
    priority: 'High',
    assignedTo: 'Gopal',
    assignedBy: 'Madhav',
    startDate: addDays(-8),
    dueDate: addDays(7),
    estimatedHours: 40,
    actualHours: 25,
    status: 'In Progress',
    comments: [],
    attachments: [],
    createdAt: addDays(-8),
    updatedAt: addDays(-2)
  },
  {
    id: 'task-008',
    taskId: 'TASK-904-001',
    projectId: 'proj-011',
    projectName: 'Krazy Keys',
    moduleName: 'Demo 2',
    title: 'Demo-2 Build Release',
    description: 'Release final build with client feedback points',
    priority: 'High',
    assignedTo: 'Srividya',
    assignedBy: 'Madhav',
    startDate: addDays(-2),
    dueDate: addDays(1),
    estimatedHours: 16,
    actualHours: 8,
    status: 'In Progress',
    comments: [],
    attachments: [],
    createdAt: addDays(-2),
    updatedAt: addDays(-1)
  }
];

// ==========================================
// MILESTONES - ACTUAL FROM PROJECTS
// ==========================================

export const mockMilestones: Milestone[] = [
  // Infynix Milestones
  {
    id: 'mil-001',
    projectId: 'proj-001',
    projectName: 'Infynix - Customer Portal',
    name: 'Kickstart Payment',
    type: 'Advance',
    amount: 5000,
    dueDate: addMonths(-5),
    paymentStatus: 'Received',
    paymentReceivedDate: addMonths(-5),
    notes: '25% Kickstart received'
  },
  {
    id: 'mil-002',
    projectId: 'proj-001',
    projectName: 'Infynix - Customer Portal',
    name: 'UI/UX Payment',
    type: 'Demo-1',
    amount: 5000,
    dueDate: addMonths(-3),
    paymentStatus: 'Received',
    paymentReceivedDate: addMonths(-3),
    notes: '25% UI/UX completed'
  },
  {
    id: 'mil-003',
    projectId: 'proj-001',
    projectName: 'Infynix - Customer Portal',
    name: 'Demo-1 Payment',
    type: 'Demo-2',
    amount: 5000,
    dueDate: addDays(-15),
    paymentStatus: 'Pending',
    notes: '25% Demo-1 pending'
  },
  {
    id: 'mil-004',
    projectId: 'proj-001',
    projectName: 'Infynix - Customer Portal',
    name: 'Demo-2 Payment',
    type: 'Demo-3',
    amount: 5000,
    dueDate: addDays(30),
    paymentStatus: 'Pending',
    notes: '25% Demo-2 pending'
  },
  // Oneflow Milestones
  {
    id: 'mil-005',
    projectId: 'proj-004',
    projectName: 'Oneflow - V1.5',
    name: 'Sleep Mode and Device Names Payment',
    type: 'UAT',
    amount: 3500,
    dueDate: addDays(7),
    paymentStatus: 'Pending',
    notes: '12 days effort - Sleep mode and Device names module'
  },
  // Avisdevente Milestones
  {
    id: 'mil-006',
    projectId: 'proj-005',
    projectName: 'Avisdevente Mobile Apps',
    name: 'Kickstart',
    type: 'Advance',
    amount: 2000,
    dueDate: addMonths(-4),
    paymentStatus: 'Received',
    paymentReceivedDate: addMonths(-4),
    notes: '20% Kickstart received'
  },
  {
    id: 'mil-007',
    projectId: 'proj-005',
    projectName: 'Avisdevente Mobile Apps',
    name: 'Demo-1',
    type: 'Demo-1',
    amount: 4000,
    dueDate: addMonths(-2),
    paymentStatus: 'Received',
    paymentReceivedDate: addMonths(-2),
    notes: '40% Demo-1 received'
  },
  {
    id: 'mil-008',
    projectId: 'proj-005',
    projectName: 'Avisdevente Mobile Apps',
    name: 'Demo-2',
    type: 'Demo-2',
    amount: 4000,
    dueDate: addDays(15),
    paymentStatus: 'Pending',
    notes: '40% Demo-2 pending'
  },
  // 9Gains Milestones
  {
    id: 'mil-009',
    projectId: 'proj-006',
    projectName: '9Gains',
    name: 'Milestone 1',
    type: 'Advance',
    amount: 2500,
    dueDate: addMonths(-8),
    paymentStatus: 'Received',
    paymentReceivedDate: addMonths(-8),
    notes: 'Kickstart 5% + Milestone 1 5%'
  },
  {
    id: 'mil-010',
    projectId: 'proj-006',
    projectName: '9Gains',
    name: 'Milestone 2',
    type: 'Demo-1',
    amount: 12500,
    dueDate: addDays(30),
    paymentStatus: 'Pending',
    notes: '25% Milestone 2'
  }
];

// ==========================================
// MAINTENANCE PROJECTS
// ==========================================

export const mockMaintenanceProjects: MaintenanceProject[] = [
  {
    id: 'maint-001',
    projectNumber: 'TM-127',
    projectName: 'Handdy Technical Maintenance',
    clientName: 'Krify Products',
    clientEmail: 'products@krify.com',
    clientPhone: '',
    billingCycle: '12 Months',
    maintenanceStartDate: addMonths(-18),
    renewalDate: addMonths(6),
    sslExpiryDate: addDays(180),
    hostingExpiryDate: addDays(200),
    domainExpiryDate: addDays(300),
    lastBackupDate: addDays(-1),
    assignedResources: ['Vinodini'],
    weeklyHours: { 'Week 1': 2, 'Week 2': 3, 'Week 3': 2, 'Week 4': 2 },
    monthlyHours: { 'Jan': 9, 'Feb': 10, 'Mar': 8, 'Apr': 9, 'May': 10, 'Jun': 9 },
    issuesWorked: 5,
    updatesDone: 3,
    changeRequests: 1,
    ticketReferences: ['TKT-001'],
    status: 'Active'
  }
];

// ==========================================
// RESOURCES
// ==========================================

export const mockResources: Resource[] = [
  {
    id: 'res-001',
    name: 'Karimunnisa',
    email: 'karimunnisa@krify.com',
    role: 'developer',
    department: 'Web Development',
    skills: ['React', 'Node.js', 'Database', 'API Integration'],
    hourlyRate: 22,
    availability: 40,
    currentProjects: ['Infynix - Customer Portal'],
    occupancyPercentage: 80,
    joinDate: addMonths(-24),
    isActive: true,
    allocations: []
  },
  {
    id: 'res-002',
    name: 'Krishna Santhosh',
    email: 'krishnasantosh@krify.com',
    role: 'developer',
    department: 'Web Frontend',
    skills: ['React', 'Vue.js', 'JavaScript', 'HTML/CSS'],
    hourlyRate: 24,
    availability: 40,
    currentProjects: ['MGBPL - B2C', 'MGBPL - B2B', 'Andhra Electronics', 'Krazy Keys', 'Nabfins'],
    occupancyPercentage: 100,
    joinDate: addMonths(-30),
    isActive: true,
    allocations: []
  },
  {
    id: 'res-003',
    name: 'Sainath',
    email: 'sainath@krify.com',
    role: 'developer',
    department: 'Web Development',
    skills: ['React', 'Node.js', 'WordPress', 'PHP'],
    hourlyRate: 22,
    availability: 40,
    currentProjects: ['MGBPL - B2C', 'MGBPL - B2B', 'Andhra Electronics', 'Nabfins'],
    occupancyPercentage: 100,
    joinDate: addMonths(-28),
    isActive: true,
    allocations: []
  },
  {
    id: 'res-004',
    name: 'Tarun',
    email: 'tarun@krify.com',
    role: 'developer',
    department: 'Flutter/iOS',
    skills: ['Flutter', 'Dart', 'iOS', 'Swift'],
    hourlyRate: 26,
    availability: 40,
    currentProjects: ['Oneflow - V1.5', 'Yourmoca V1.1'],
    occupancyPercentage: 90,
    joinDate: addMonths(-20),
    isActive: true,
    allocations: []
  },
  {
    id: 'res-005',
    name: 'Sudarshan',
    email: 'sudarshan@krify.com',
    role: 'developer',
    department: 'Android',
    skills: ['Android', 'Kotlin', 'Java', 'Firebase'],
    hourlyRate: 24,
    availability: 40,
    currentProjects: ['Avisdevente Mobile Apps'],
    occupancyPercentage: 85,
    joinDate: addMonths(-22),
    isActive: true,
    allocations: []
  },
  {
    id: 'res-006',
    name: 'Srividya',
    email: 'srividya@krify.com',
    role: 'developer',
    department: 'iOS',
    skills: ['iOS', 'Swift', 'Objective-C', 'Flutter'],
    hourlyRate: 26,
    availability: 40,
    currentProjects: ['Avisdevente Mobile Apps', 'Krazy Keys'],
    occupancyPercentage: 95,
    joinDate: addMonths(-24),
    isActive: true,
    allocations: []
  },
  {
    id: 'res-007',
    name: 'Anusha',
    email: 'anusha@krify.com',
    role: 'developer',
    department: 'Web Frontend',
    skills: ['React', 'JavaScript', 'HTML/CSS', 'Tailwind'],
    hourlyRate: 20,
    availability: 40,
    currentProjects: ['9Gains', 'Durga Prasad Schools'],
    occupancyPercentage: 80,
    joinDate: addMonths(-18),
    isActive: true,
    allocations: []
  },
  {
    id: 'res-008',
    name: 'Gopal',
    email: 'gopal@krify.com',
    role: 'developer',
    department: 'Web Frontend',
    skills: ['React', 'Vue.js', 'JavaScript', 'TypeScript'],
    hourlyRate: 22,
    availability: 40,
    currentProjects: ['9Gains', 'Yourmoca V1.1'],
    occupancyPercentage: 85,
    joinDate: addMonths(-26),
    isActive: true,
    allocations: []
  },
  {
    id: 'res-009',
    name: 'Pavan',
    email: 'pavan@krify.com',
    role: 'developer',
    department: 'Web Backend',
    skills: ['Node.js', 'Python', 'PostgreSQL', 'AWS'],
    hourlyRate: 24,
    availability: 40,
    currentProjects: ['MGBPL - B2C', 'MGBPL - B2B', 'APDASCAC', 'Krazy Keys'],
    occupancyPercentage: 100,
    joinDate: addMonths(-20),
    isActive: true,
    allocations: []
  },
  {
    id: 'res-010',
    name: 'Prakash',
    email: 'prakash@krify.com',
    role: 'qa',
    department: 'QA',
    skills: ['Manual Testing', 'Automation', 'Selenium', 'API Testing'],
    hourlyRate: 18,
    availability: 40,
    currentProjects: ['Infynix', 'MGBPL - B2C', 'Oneflow', 'Avisdevente', 'Krazy Keys'],
    occupancyPercentage: 100,
    joinDate: addMonths(-36),
    isActive: true,
    allocations: []
  }
];

// ==========================================
// RISKS
// ==========================================

export const mockRisks: Risk[] = [
  {
    id: 'risk-001',
    title: 'Client Not Responding - MGBPL B2B',
    projectId: 'proj-003',
    projectName: 'MGBPL - B2B E-commerce',
    severity: 'High',
    impact: 'Project completion blocked, cannot deploy to production',
    description: 'Client not responding for UAT sign-off despite project being 100% complete',
    assignedOwner: 'Sudha',
    resolutionPlan: 'Escalate to management, schedule direct call with client leadership',
    status: 'Open',
    expectedClosureDate: addDays(7),
    createdAt: addDays(-15),
    updatedAt: addDays(-2)
  },
  {
    id: 'risk-002',
    title: 'Scope Creep - Avisdevente',
    projectId: 'proj-005',
    projectName: 'Avisdevente Mobile Apps',
    severity: 'Medium',
    impact: 'Additional development time and cost overruns',
    description: 'New features client adding into Mobile application scope',
    assignedOwner: 'Madhav',
    resolutionPlan: 'Document new requirements, get client approval on additional timeline/cost',
    status: 'In Progress',
    expectedClosureDate: addDays(14),
    createdAt: addDays(-10),
    updatedAt: addDays(-3)
  },
  {
    id: 'risk-003',
    title: 'API Delay from Client - Infynix',
    projectId: 'proj-001',
    projectName: 'Infynix - Customer Portal',
    severity: 'High',
    impact: 'Blocking further development, may delay release dates',
    description: 'Waiting for Excel data and API details from client side',
    assignedOwner: 'Sudha',
    resolutionPlan: 'Continuous follow-up, escalate to client management',
    status: 'Open',
    expectedClosureDate: addDays(5),
    createdAt: addDays(-7),
    updatedAt: addDays(-1)
  },
  {
    id: 'risk-004',
    title: 'RTGS Team Dependency - APDASCAC',
    projectId: 'proj-009',
    projectName: 'APDASCAC - WhatsApp e-governance',
    severity: 'Medium',
    impact: 'Project delivery blocked by third party',
    description: 'Waiting for RTGS team updates on issues',
    assignedOwner: 'Madhav',
    resolutionPlan: 'Schedule meeting with RTGS team leadership',
    status: 'In Progress',
    expectedClosureDate: addDays(10),
    createdAt: addDays(-5),
    updatedAt: addDays(-2)
  }
];

// ==========================================
// WEEKLY MEETINGS
// ==========================================

export const mockWeeklyMeetings: WeeklyMeeting[] = [
  {
    id: 'wm-001',
    meetingDate: addDays(-4),
    meetingNotes: 'Weekly status review completed. All PMs presented project updates. Critical discussion on MGBPL B2B client response delay.',
    projectStatuses: [
      {
        projectId: 'proj-001',
        projectName: 'Infynix - Customer Portal',
        lastWeekSummary: 'Shared Excel template, explained ERD diagram, received server details',
        currentWeekProgress: 'Waiting for client data, 40% complete',
        nextWeekTargets: 'Receive client data and begin integration',
        risks: ['API delay from client'],
        escalations: [],
        collectionsStatus: 'Demo-1 payment pending',
        demoStatus: 'Demo-1 in progress',
        liveStatus: 'Scheduled for Jan 2026',
        completionPercentage: 40
      },
      {
        projectId: 'proj-005',
        projectName: 'Avisdevente Mobile Apps',
        lastWeekSummary: 'Worked on Demo-2 QA issues, shared build to client',
        currentWeekProgress: '90% complete, working on In-app purchases and social logins',
        nextWeekTargets: 'Complete remaining features for Demo-2',
        risks: ['Scope creep from client'],
        escalations: [],
        collectionsStatus: 'Demo-2 payment pending',
        demoStatus: 'Demo-2 in progress',
        liveStatus: 'Scheduled for March 2026',
        completionPercentage: 90
      },
      {
        projectId: 'proj-004',
        projectName: 'Oneflow - V1.5',
        lastWeekSummary: 'Received client UI feedback, had discussion meeting',
        currentWeekProgress: '100% complete, addressing cosmetic changes',
        nextWeekTargets: 'Complete feedback fixes and close project',
        risks: [],
        escalations: [],
        collectionsStatus: 'Payment pending',
        demoStatus: 'UAT completed',
        liveStatus: 'Ready for deployment',
        completionPercentage: 100
      }
    ],
    createdBy: 'Krishna Sir',
    createdAt: addDays(-4)
  }
];

// ==========================================
// DASHBOARD STATS
// ==========================================

export const mockDashboardStats: DashboardStats = {
  totalRunningProjects: 12,
  totalDedicatedProjects: 0,
  totalMaintenanceProjects: 1,
  liveProjects: 0,
  uatProjects: 4,
  delayedProjects: 2,
  highRiskProjects: 4,
  upcomingRenewals: 1,
  sslExpiryAlerts: 0,
  pendingCollections: 48500,
  resourceAvailability: 20,
  occupiedResources: 80,
  availableBenchResources: 5
};

// ==========================================
// NOTIFICATIONS
// ==========================================

export const mockNotifications: Notification[] = [
  {
    id: 'notif-001',
    title: 'MGBPL Client Not Responding',
    message: 'B2B E-commerce project 100% complete but waiting for UAT sign-off for 2 weeks',
    type: 'error',
    isRead: false,
    createdAt: addDays(-1),
    link: '/projects'
  },
  {
    id: 'notif-002',
    title: 'Oneflow Project Ready for Closure',
    message: 'V1.5 Sleep Mode and Device Naming 100% complete - pending final payment',
    type: 'success',
    isRead: false,
    createdAt: addDays(-1),
    link: '/projects'
  },
  {
    id: 'notif-003',
    title: 'New Task Assigned',
    message: 'TASK-904-001: Demo-2 Build Release for Krazy Keys',
    type: 'info',
    isRead: false,
    createdAt: addDays(-1),
    link: '/tasks'
  },
  {
    id: 'notif-004',
    title: 'Avisdevente Scope Change',
    message: 'Client requesting additional features beyond original scope',
    type: 'warning',
    isRead: false,
    createdAt: addDays(-2),
    link: '/risks'
  },
  {
    id: 'notif-005',
    title: 'Weekly Board Meeting Tomorrow',
    message: 'Wednesday board meeting - prepare project updates',
    type: 'info',
    isRead: true,
    createdAt: addDays(-3),
    link: '/weekly-meetings'
  }
];

// ==========================================
// WORK UPDATES
// ==========================================

export const mockWorkUpdates: WorkUpdate[] = [
  {
    id: 'wu-001',
    resourceId: 'res-001',
    resourceName: 'Karimunnisa',
    date: addDays(-1),
    tasksCompleted: ['Excel template creation', 'ERD diagram explanation'],
    workingHours: 8,
    blockers: ['Waiting for client API details'],
    remainingWork: 'API integration pending client data',
    createdAt: addDays(-1)
  },
  {
    id: 'wu-002',
    resourceId: 'res-002',
    resourceName: 'Krishna Santhosh',
    date: addDays(-1),
    tasksCompleted: ['MGBPL B2C UI components', 'Andhra Electronics product updates'],
    workingHours: 8.5,
    blockers: ['Client not responding on B2C'],
    remainingWork: 'Waiting for client feedback',
    createdAt: addDays(-1)
  },
  {
    id: 'wu-003',
    resourceId: 'res-006',
    resourceName: 'Srividya',
    date: addDays(-1),
    tasksCompleted: ['Krazy Keys iOS Demo-2 fixes', 'Social login integration'],
    workingHours: 9,
    blockers: [],
    remainingWork: 'Final build preparation',
    createdAt: addDays(-1)
  }
];

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

export const getProjectsByType = (type: 'running' | 'dedicated' | 'maintenance') => {
  return mockProjects.filter(p => p.projectType === type);
};

export const getTasksByResource = (resourceName: string) => {
  return mockTasks.filter(t => t.assignedTo === resourceName);
};

export const getTasksByStatus = (status: TaskStatus) => {
  return mockTasks.filter(t => t.status === status);
};

export const getUpcomingMilestones = (days: number = 30) => {
  const cutoff = addDays(days);
  return mockMilestones.filter(m => m.dueDate <= cutoff && m.paymentStatus !== 'Received');
};

export const getExpiringSSL = (days: number = 30) => {
  const cutoff = addDays(days);
  return mockMaintenanceProjects.filter(m => 
    m.sslExpiryDate && m.sslExpiryDate <= cutoff
  );
};
