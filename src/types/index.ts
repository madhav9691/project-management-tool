// ==========================================
// KRIFY SOFTWARE TECHNOLOGIES
// PROJECT MANAGEMENT PORTAL - TYPES
// ==========================================

export type UserRole = 
  | 'super_admin' 
  | 'management' 
  | 'project_manager' 
  | 'team_lead' 
  | 'developer' 
  | 'qa' 
  | 'sales_coordinator' 
  | 'client_viewer';

export type ProjectPhase = 'UI' | 'Development' | 'QA' | 'UAT' | 'Live';
export type ProjectType = 'running' | 'dedicated' | 'maintenance';
export type TaskStatus = 'Open' | 'In Progress' | 'QA' | 'Completed' | 'Reopened';
export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Critical';
export type PaymentStatus = 'Pending' | 'Partial' | 'Received';
export type RiskSeverity = 'Low' | 'Medium' | 'High' | 'Critical';
export type BillingCycle = '3 Months' | '6 Months' | '12 Months';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  avatar?: string;
  phone?: string;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  permissions: string[];
}

export interface Project {
  id: string;
  projectNumber: string;
  projectName: string;
  projectType: ProjectType;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  clientCompany: string;
  country: string;
  salesCoordinator: string;
  projectManager: string;
  assignedTeamMembers: string[];
  primaryResources: string[];
  platforms: {
    android: boolean;
    ios: boolean;
    webFrontend: boolean;
    webBackend: boolean;
  };
  startDate: Date;
  plannedClosureDate: Date;
  actualClosureDate?: Date;
  completionPercentage: number;
  currentPhase: ProjectPhase;
  currentWeekUpdates: string;
  nextWeekTarget: string;
  risks: string[];
  escalations: string[];
  projectTrackerLink?: string;
  figmaLink?: string;
  gitRepository?: string;
  serverDetails?: string;
  hostingDetails?: string;
  priority: TaskPriority;
  remarks?: string;
  status: 'Active' | 'On Hold' | 'Completed' | 'Cancelled';
  createdAt: Date;
  updatedAt: Date;
}

export interface Task {
  id: string;
  taskId: string;
  projectId: string;
  projectName: string;
  moduleName: string;
  title: string;
  description: string;
  priority: TaskPriority;
  assignedTo: string;
  assignedBy: string;
  startDate: Date;
  dueDate: Date;
  estimatedHours: number;
  actualHours: number;
  status: TaskStatus;
  comments: Comment[];
  attachments: Attachment[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: Date;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedBy: string;
  uploadedAt: Date;
}

export interface Milestone {
  id: string;
  projectId: string;
  projectName: string;
  name: string;
  type: 'Advance' | 'Demo-1' | 'Demo-2' | 'Demo-3' | 'UAT' | 'Go Live' | 'Maintenance Renewal';
  amount: number;
  dueDate: Date;
  invoiceNumber?: string;
  paymentStatus: PaymentStatus;
  paymentReceivedDate?: Date;
  notes?: string;
}

export interface MaintenanceProject {
  id: string;
  projectNumber: string;
  projectName: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  billingCycle: BillingCycle;
  maintenanceStartDate: Date;
  renewalDate: Date;
  sslExpiryDate?: Date;
  hostingExpiryDate?: Date;
  domainExpiryDate?: Date;
  lastBackupDate?: Date;
  assignedResources: string[];
  weeklyHours: Record<string, number>;
  monthlyHours: Record<string, number>;
  issuesWorked: number;
  updatesDone: number;
  changeRequests: number;
  ticketReferences: string[];
  status: 'Active' | 'Expired' | 'Pending Renewal';
}

export interface ResourceAllocation {
  id: string;
  resourceId: string;
  resourceName: string;
  projectId: string;
  projectName: string;
  allocationPercentage: number;
  startDate: Date;
  endDate?: Date;
  billingRate?: number;
  isDedicated: boolean;
}

export interface Resource {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  skills: string[];
  hourlyRate?: number;
  availability: number;
  currentProjects: string[];
  occupancyPercentage: number;
  joinDate: Date;
  isActive: boolean;
  allocations: ResourceAllocation[];
}

export interface Risk {
  id: string;
  title: string;
  projectId: string;
  projectName: string;
  severity: RiskSeverity;
  impact: string;
  description: string;
  assignedOwner: string;
  resolutionPlan: string;
  status: 'Open' | 'In Progress' | 'Mitigated' | 'Closed';
  expectedClosureDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface WeeklyMeeting {
  id: string;
  meetingDate: Date;
  meetingNotes: string;
  projectStatuses: ProjectWeeklyStatus[];
  createdBy: string;
  createdAt: Date;
}

export interface ProjectWeeklyStatus {
  projectId: string;
  projectName: string;
  lastWeekSummary: string;
  currentWeekProgress: string;
  nextWeekTargets: string;
  risks: string[];
  escalations: string[];
  collectionsStatus: string;
  demoStatus: string;
  liveStatus: string;
  completionPercentage: number;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  isRead: boolean;
  createdAt: Date;
  link?: string;
}

export interface DashboardStats {
  totalRunningProjects: number;
  totalDedicatedProjects: number;
  totalMaintenanceProjects: number;
  liveProjects: number;
  uatProjects: number;
  delayedProjects: number;
  highRiskProjects: number;
  upcomingRenewals: number;
  sslExpiryAlerts: number;
  pendingCollections: number;
  resourceAvailability: number;
  occupiedResources: number;
  availableBenchResources: number;
}

export interface WorkUpdate {
  id: string;
  resourceId: string;
  resourceName: string;
  date: Date;
  tasksCompleted: string[];
  workingHours: number;
  blockers: string[];
  remainingWork: string;
  createdAt: Date;
}
