-- ==========================================
-- KRIFY SOFTWARE TECHNOLOGIES
-- PROJECT MANAGEMENT PORTAL
-- DATABASE SCHEMA
-- ==========================================
-- 
-- This is the complete database schema for production deployment.
-- Supports: PostgreSQL / MySQL / SQL Server
--
-- To connect:
-- 1. Create this database
-- 2. Run this SQL to create all tables
-- 3. Update src/services/api.ts — replace localStorage calls with fetch() to your API
-- 4. Build your backend API (Node.js/Express, Python/Django, etc.)
-- ==========================================

-- ─── USERS ───
CREATE TABLE users (
    id              VARCHAR(50) PRIMARY KEY,
    name            VARCHAR(200) NOT NULL,
    email           VARCHAR(200) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    role            VARCHAR(30) NOT NULL CHECK (role IN ('super_admin','management','project_manager','team_lead','developer','qa','sales_coordinator','client_viewer')),
    department      VARCHAR(100),
    phone           VARCHAR(30),
    avatar_url      VARCHAR(500),
    is_active       BOOLEAN DEFAULT TRUE,
    last_login      TIMESTAMP,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─── PROJECTS ───
CREATE TABLE projects (
    id                      VARCHAR(50) PRIMARY KEY,
    project_number          VARCHAR(30) NOT NULL UNIQUE,
    project_name            VARCHAR(300) NOT NULL,
    project_type            VARCHAR(20) NOT NULL CHECK (project_type IN ('running','dedicated','maintenance')),
    client_name             VARCHAR(200),
    client_email            VARCHAR(200),
    client_phone            VARCHAR(50),
    client_company          VARCHAR(200),
    country                 VARCHAR(100),
    sales_coordinator       VARCHAR(200),
    project_manager         VARCHAR(200) NOT NULL,
    platforms_android       BOOLEAN DEFAULT FALSE,
    platforms_ios            BOOLEAN DEFAULT FALSE,
    platforms_web_frontend  BOOLEAN DEFAULT FALSE,
    platforms_web_backend   BOOLEAN DEFAULT FALSE,
    start_date              DATE,
    planned_closure_date    DATE,
    actual_closure_date     DATE,
    completion_percentage   INTEGER DEFAULT 0 CHECK (completion_percentage BETWEEN 0 AND 100),
    current_phase           VARCHAR(20) CHECK (current_phase IN ('UI','Development','QA','UAT','Live')),
    current_week_updates    TEXT,
    next_week_target        TEXT,
    project_tracker_link    VARCHAR(500),
    figma_link              VARCHAR(500),
    git_repository          VARCHAR(500),
    server_details          TEXT,
    hosting_details         TEXT,
    priority                VARCHAR(20) CHECK (priority IN ('Low','Medium','High','Critical')),
    remarks                 TEXT,
    status                  VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active','On Hold','Completed','Cancelled')),
    created_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─── PROJECT TEAM MEMBERS (many-to-many) ───
CREATE TABLE project_team_members (
    id              SERIAL PRIMARY KEY,
    project_id      VARCHAR(50) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_name       VARCHAR(200) NOT NULL,
    is_primary      BOOLEAN DEFAULT FALSE,
    assigned_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_ptm_project ON project_team_members(project_id);
CREATE INDEX idx_ptm_user ON project_team_members(user_name);

-- ─── PROJECT RISKS ───
CREATE TABLE project_risks (
    id              SERIAL PRIMARY KEY,
    project_id      VARCHAR(50) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    risk_text       TEXT NOT NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─── PROJECT ESCALATIONS ───
CREATE TABLE project_escalations (
    id              SERIAL PRIMARY KEY,
    project_id      VARCHAR(50) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    escalation_text TEXT NOT NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─── TASKS ───
CREATE TABLE tasks (
    id              VARCHAR(50) PRIMARY KEY,
    task_id         VARCHAR(30) NOT NULL UNIQUE,
    project_id      VARCHAR(50) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    project_name    VARCHAR(300),
    module_name     VARCHAR(200),
    title           VARCHAR(500) NOT NULL,
    description     TEXT,
    priority        VARCHAR(20) CHECK (priority IN ('Low','Medium','High','Critical')),
    assigned_to     VARCHAR(200) NOT NULL,
    assigned_by     VARCHAR(200),
    start_date      DATE,
    due_date        DATE NOT NULL,
    estimated_hours DECIMAL(8,2) DEFAULT 0,
    actual_hours    DECIMAL(8,2) DEFAULT 0,
    status          VARCHAR(20) DEFAULT 'Open' CHECK (status IN ('Open','In Progress','QA','Completed','Reopened')),
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_tasks_project ON tasks(project_id);
CREATE INDEX idx_tasks_assigned ON tasks(assigned_to);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due ON tasks(due_date);

-- ─── TASK COMMENTS ───
CREATE TABLE task_comments (
    id              VARCHAR(50) PRIMARY KEY,
    task_id         VARCHAR(50) NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    user_id         VARCHAR(50) NOT NULL,
    user_name       VARCHAR(200) NOT NULL,
    content         TEXT NOT NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─── RESOURCES ───
CREATE TABLE resources (
    id                      VARCHAR(50) PRIMARY KEY,
    name                    VARCHAR(200) NOT NULL,
    email                   VARCHAR(200) NOT NULL UNIQUE,
    role                    VARCHAR(30),
    department              VARCHAR(100),
    hourly_rate             DECIMAL(8,2) DEFAULT 0,
    availability_hours      INTEGER DEFAULT 40,
    occupancy_percentage    INTEGER DEFAULT 0 CHECK (occupancy_percentage BETWEEN 0 AND 100),
    join_date               DATE,
    is_active               BOOLEAN DEFAULT TRUE,
    created_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─── RESOURCE SKILLS ───
CREATE TABLE resource_skills (
    id              SERIAL PRIMARY KEY,
    resource_id     VARCHAR(50) NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
    skill           VARCHAR(100) NOT NULL
);
CREATE INDEX idx_skills_resource ON resource_skills(resource_id);

-- ─── MILESTONES ───
CREATE TABLE milestones (
    id                      VARCHAR(50) PRIMARY KEY,
    project_id              VARCHAR(50) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    project_name            VARCHAR(300),
    name                    VARCHAR(300) NOT NULL,
    type                    VARCHAR(30) CHECK (type IN ('Advance','Demo-1','Demo-2','Demo-3','UAT','Go Live','Maintenance Renewal')),
    category                VARCHAR(20) NOT NULL CHECK (category IN ('sales','operational')),
    amount                  DECIMAL(12,2) DEFAULT 0,
    due_date                DATE NOT NULL,
    invoice_number          VARCHAR(50),
    payment_status          VARCHAR(20) DEFAULT 'Pending' CHECK (payment_status IN ('Pending','Partial','Received')),
    payment_received_date   DATE,
    notes                   TEXT,
    created_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_milestones_project ON milestones(project_id);
CREATE INDEX idx_milestones_status ON milestones(payment_status);

-- ─── WEEKLY MEETINGS ───
CREATE TABLE weekly_meetings (
    id              VARCHAR(50) PRIMARY KEY,
    meeting_date    DATE NOT NULL,
    meeting_notes   TEXT,
    created_by      VARCHAR(200),
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─── MEETING PROJECT STATUS ───
CREATE TABLE meeting_project_statuses (
    id                      SERIAL PRIMARY KEY,
    meeting_id              VARCHAR(50) NOT NULL REFERENCES weekly_meetings(id) ON DELETE CASCADE,
    project_id              VARCHAR(50),
    project_name            VARCHAR(300),
    last_week_summary       TEXT,
    current_week_progress   TEXT,
    next_week_targets       TEXT,
    collections_status      VARCHAR(200),
    demo_status             VARCHAR(200),
    live_status             VARCHAR(200),
    completion_percentage   INTEGER DEFAULT 0
);

-- ─── MEETING RESOURCE AVAILABILITY ───
CREATE TABLE meeting_resource_availability (
    id              SERIAL PRIMARY KEY,
    meeting_id      VARCHAR(50) NOT NULL REFERENCES weekly_meetings(id) ON DELETE CASCADE,
    resource_name   VARCHAR(200),
    department      VARCHAR(100),
    occupancy       INTEGER DEFAULT 0,
    current_project VARCHAR(300),
    available_hours INTEGER DEFAULT 0,
    notes           TEXT
);

-- ─── MEETING ACHIEVEMENTS ───
CREATE TABLE meeting_achievements (
    id              SERIAL PRIMARY KEY,
    meeting_id      VARCHAR(50) NOT NULL REFERENCES weekly_meetings(id) ON DELETE CASCADE,
    type            VARCHAR(30) CHECK (type IN ('project_fund','amc_fund','go_live','other')),
    project_name    VARCHAR(300),
    amount          DECIMAL(12,2) DEFAULT 0,
    notes           TEXT
);

-- ─── NOTIFICATIONS ───
CREATE TABLE notifications (
    id              VARCHAR(50) PRIMARY KEY,
    title           VARCHAR(300) NOT NULL,
    message         TEXT NOT NULL,
    type            VARCHAR(20) CHECK (type IN ('info','warning','error','success')),
    is_read         BOOLEAN DEFAULT FALSE,
    for_user        VARCHAR(200),
    for_role        VARCHAR(30),
    project_name    VARCHAR(300),
    task_id         VARCHAR(30),
    link            VARCHAR(200),
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_notif_user ON notifications(for_user);
CREATE INDEX idx_notif_role ON notifications(for_role);
CREATE INDEX idx_notif_read ON notifications(is_read);

-- ─── MAINTENANCE PROJECTS ───
CREATE TABLE maintenance_projects (
    id                      VARCHAR(50) PRIMARY KEY,
    project_number          VARCHAR(30) NOT NULL UNIQUE,
    project_name            VARCHAR(300) NOT NULL,
    client_name             VARCHAR(200),
    client_email            VARCHAR(200),
    client_phone            VARCHAR(50),
    billing_cycle           VARCHAR(20) CHECK (billing_cycle IN ('3 Months','6 Months','12 Months')),
    maintenance_start_date  DATE,
    renewal_date            DATE,
    ssl_expiry_date         DATE,
    hosting_expiry_date     DATE,
    domain_expiry_date      DATE,
    last_backup_date        DATE,
    issues_worked           INTEGER DEFAULT 0,
    updates_done            INTEGER DEFAULT 0,
    change_requests         INTEGER DEFAULT 0,
    status                  VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active','Expired','Pending Renewal')),
    created_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─── RESOURCE ALLOCATIONS (Dedicated) ───
CREATE TABLE resource_allocations (
    id                      VARCHAR(50) PRIMARY KEY,
    resource_id             VARCHAR(50) REFERENCES resources(id),
    resource_name           VARCHAR(200),
    project_id              VARCHAR(50) REFERENCES projects(id),
    project_name            VARCHAR(300),
    allocation_percentage   INTEGER DEFAULT 100 CHECK (allocation_percentage BETWEEN 0 AND 100),
    start_date              DATE,
    end_date                DATE,
    billing_rate            DECIMAL(8,2) DEFAULT 0,
    is_dedicated            BOOLEAN DEFAULT TRUE,
    created_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─── AUDIT LOG ───
CREATE TABLE audit_log (
    id              SERIAL PRIMARY KEY,
    user_id         VARCHAR(50),
    user_name       VARCHAR(200),
    action          VARCHAR(50) NOT NULL,
    module          VARCHAR(50) NOT NULL,
    record_id       VARCHAR(50),
    details         TEXT,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_audit_user ON audit_log(user_id);
CREATE INDEX idx_audit_module ON audit_log(module);
