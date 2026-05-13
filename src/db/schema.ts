import { pgTable, text, integer, date, decimal, jsonb, timestamp, serial, varchar } from "drizzle-orm/pg-core";

// Clients table
export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  contactPerson: varchar("contact_person", { length: 255 }),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  company: varchar("company", { length: 255 }),
  website: varchar("website", { length: 255 }),
  address: text("address"),
  country: varchar("country", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Team members/Resources table
export const teamMembers = pgTable("team_members", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  role: varchar("role", { length: 100 }),
  skills: jsonb("skills").$type<string[]>(),
  email: varchar("email", { length: 255 }),
  isAvailable: varchar("is_available", { length: 20 }).default("available"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Projects table
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  projectNo: varchar("project_no", { length: 50 }).notNull().unique(),
  projectName: varchar("project_name", { length: 255 }).notNull(),
  platforms: jsonb("platforms").$type<string[]>().default([]),
  primaryResources: jsonb("primary_resources").$type<{ name: string; role: string }[]>().default([]),
  projectPhase: varchar("project_phase", { length: 50 }).default("Planning"),
  projectTracker: text("project_tracker"),
  plannedClosureDate: date("planned_closure_date"),
  salesMilestones: jsonb("sales_milestones").$type<{ name: string; percentage: number }[]>().default([]),
  operationalMilestones: jsonb("operational_milestones").$type<string[]>().default([]),
  percentageCompletion: decimal("percentage_completion", { precision: 5, scale: 2 }).default("0"),
  lastWeekProgress: text("last_week_progress"),
  thisWeekTarget: text("this_week_target"),
  projectRisks: text("project_risks"),
  salesCoordinator: varchar("sales_coordinator", { length: 100 }),
  clientId: integer("client_id").references(() => clients.id),
  status: varchar("status", { length: 50 }).default("active"),
  priority: varchar("priority", { length: 20 }).default("medium"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Project progress history
export const projectProgress = pgTable("project_progress", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id).notNull(),
  weekNumber: integer("week_number").notNull(),
  weekStartDate: date("week_start_date").notNull(),
  weekEndDate: date("week_end_date").notNull(),
  progress: text("progress").notNull(),
  target: text("target").notNull(),
  percentageCompletion: decimal("percentage_completion", { precision: 5, scale: 2 }),
  risks: text("risks"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Milestones table
export const milestones = pgTable("milestones", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  description: text("description"),
  targetDate: date("target_date"),
  completedDate: date("completed_date"),
  percentage: decimal("percentage", { precision: 5, scale: 2 }),
  status: varchar("status", { length: 50 }).default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Weekly reports
export const weeklyReports = pgTable("weekly_reports", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id).notNull(),
  reportDate: date("report_date").notNull(),
  achievements: text("achievements"),
  targets: text("targets"),
  blockers: text("blockers"),
  teamMembers: jsonb("team_members").$type<string[]>().default([]),
  hoursSpent: decimal("hours_spent", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Tasks table
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  assignedTo: integer("assigned_to").references(() => teamMembers.id),
  createdBy: integer("created_by").references(() => teamMembers.id),
  status: varchar("status", { length: 50 }).default("todo"), // todo, in_progress, review, done, blocked
  priority: varchar("priority", { length: 20 }).default("medium"), // low, medium, high, critical
  estimatedHours: decimal("estimated_hours", { precision: 10, scale: 2 }),
  actualHours: decimal("actual_hours", { precision: 10, scale: 2 }),
  startDate: date("start_date"),
  dueDate: date("due_date"),
  completedDate: date("completed_date"),
  tags: jsonb("tags").$type<string[]>().default([]),
  relatedMilestone: varchar("related_milestone", { length: 255 }),
  progress: decimal("progress", { precision: 5, scale: 2 }).default("0"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
