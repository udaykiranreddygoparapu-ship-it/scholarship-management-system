-- ============================================================================
-- UNIVERSITY SCHOLARSHIP AND FINANCIAL AID MANAGEMENT SYSTEM (SFAMS)
-- Relational Database Schema in Third Normal Form (3NF)
-- Compatible with SQLite / sql.js and standard ANSI SQL
-- ============================================================================

-- 1. ROLES TABLE
CREATE TABLE IF NOT EXISTS roles (
    role_id INTEGER PRIMARY KEY AUTOINCREMENT,
    role_code TEXT NOT NULL UNIQUE,
    role_name TEXT NOT NULL,
    description TEXT
);

-- 2. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    role_id INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'Active' CHECK(status IN ('Active', 'Inactive', 'Suspended')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE RESTRICT
);

-- 3. STUDENTS TABLE (3NF normalized master record)
CREATE TABLE IF NOT EXISTS students (
    student_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE,
    roll_number TEXT NOT NULL UNIQUE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    dob DATE NOT NULL,
    gender TEXT NOT NULL CHECK(gender IN ('Male', 'Female', 'Other')),
    email TEXT NOT NULL UNIQUE,
    phone TEXT NOT NULL,
    department TEXT NOT NULL,
    program TEXT NOT NULL,
    semester INTEGER NOT NULL CHECK(semester >= 1 AND semester <= 10),
    category TEXT NOT NULL CHECK(category IN ('General', 'OBC', 'SC', 'ST', 'EWS')),
    cgpa REAL NOT NULL CHECK(cgpa >= 0.0 AND cgpa <= 10.0),
    academic_percentage REAL NOT NULL CHECK(academic_percentage >= 0.0 AND academic_percentage <= 100.0),
    annual_income REAL NOT NULL CHECK(annual_income >= 0.0),
    attendance_pct REAL NOT NULL DEFAULT 85.0 CHECK(attendance_pct >= 0.0 AND attendance_pct <= 100.0),
    admission_year INTEGER NOT NULL,
    address TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
);

-- 4. SCHOLARSHIP SCHEMES TABLE
CREATE TABLE IF NOT EXISTS scholarship_schemes (
    scheme_id INTEGER PRIMARY KEY AUTOINCREMENT,
    scheme_code TEXT NOT NULL UNIQUE,
    scheme_name TEXT NOT NULL,
    description TEXT NOT NULL,
    category_target TEXT NOT NULL DEFAULT 'All',
    min_amount REAL NOT NULL CHECK(min_amount >= 0.0),
    max_amount REAL NOT NULL CHECK(max_amount >= min_amount),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    academic_year TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Active' CHECK(status IN ('Active', 'Inactive', 'Closed')),
    renewal_allowed INTEGER NOT NULL DEFAULT 1 CHECK(renewal_allowed IN (0, 1)),
    min_cgpa REAL NOT NULL DEFAULT 6.0 CHECK(min_cgpa >= 0.0 AND min_cgpa <= 10.0),
    min_percentage REAL NOT NULL DEFAULT 60.0 CHECK(min_percentage >= 0.0 AND min_percentage <= 100.0),
    max_income REAL NOT NULL DEFAULT 500000.0 CHECK(max_income >= 0.0),
    min_attendance REAL NOT NULL DEFAULT 75.0 CHECK(min_attendance >= 0.0 AND min_attendance <= 100.0),
    eligible_departments TEXT NOT NULL DEFAULT 'All',
    eligible_programs TEXT NOT NULL DEFAULT 'All',
    eligible_categories TEXT NOT NULL DEFAULT 'All',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 5. SCHEME REQUIRED DOCUMENTS MASTER
CREATE TABLE IF NOT EXISTS scheme_documents (
    scheme_doc_id INTEGER PRIMARY KEY AUTOINCREMENT,
    scheme_id INTEGER NOT NULL,
    document_name TEXT NOT NULL,
    is_mandatory INTEGER NOT NULL DEFAULT 1 CHECK(is_mandatory IN (0, 1)),
    description TEXT,
    FOREIGN KEY (scheme_id) REFERENCES scholarship_schemes(scheme_id) ON DELETE CASCADE
);

-- 6. APPLICATIONS TABLE
CREATE TABLE IF NOT EXISTS applications (
    application_id INTEGER PRIMARY KEY AUTOINCREMENT,
    application_no TEXT NOT NULL UNIQUE,
    student_id INTEGER NOT NULL,
    scheme_id INTEGER NOT NULL,
    academic_year TEXT NOT NULL,
    submission_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    current_stage TEXT NOT NULL DEFAULT 'Submitted' CHECK(
        current_stage IN ('Submitted', 'Document Verification', 'Eligibility Verification', 'Department Approval', 'Final Approval', 'Sanctioned', 'Disbursed', 'Rejected')
    ),
    status TEXT NOT NULL DEFAULT 'Submitted' CHECK(
        status IN ('Submitted', 'Under Verification', 'Verified', 'Approved', 'Sanctioned', 'Disbursed', 'Rejected')
    ),
    rejection_reason TEXT,
    remarks TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE RESTRICT,
    FOREIGN KEY (scheme_id) REFERENCES scholarship_schemes(scheme_id) ON DELETE RESTRICT,
    UNIQUE(student_id, scheme_id, academic_year) -- Enforces business rule: 1 application per student per scheme per academic year
);

-- 7. APPLICATION DOCUMENTS TABLE
CREATE TABLE IF NOT EXISTS application_documents (
    app_doc_id INTEGER PRIMARY KEY AUTOINCREMENT,
    application_id INTEGER NOT NULL,
    document_name TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_size_kb INTEGER NOT NULL DEFAULT 250,
    file_type TEXT NOT NULL DEFAULT 'application/pdf',
    upload_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    status TEXT NOT NULL DEFAULT 'Pending' CHECK(
        status IN ('Pending', 'Verified', 'Rejected', 'Resubmission Required')
    ),
    remarks TEXT,
    verified_by INTEGER,
    verification_date DATETIME,
    FOREIGN KEY (application_id) REFERENCES applications(application_id) ON DELETE CASCADE,
    FOREIGN KEY (verified_by) REFERENCES users(user_id) ON DELETE SET NULL
);

-- 8. VERIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS verifications (
    verification_id INTEGER PRIMARY KEY AUTOINCREMENT,
    application_id INTEGER NOT NULL,
    verifier_id INTEGER NOT NULL,
    verification_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    status TEXT NOT NULL CHECK(status IN ('Verified', 'Rejected', 'Resubmission Required')),
    eligibility_satisfied INTEGER NOT NULL CHECK(eligibility_satisfied IN (0, 1)),
    remarks TEXT NOT NULL,
    FOREIGN KEY (application_id) REFERENCES applications(application_id) ON DELETE CASCADE,
    FOREIGN KEY (verifier_id) REFERENCES users(user_id) ON DELETE RESTRICT
);

-- 9. APPROVAL STAGES MASTER TABLE
CREATE TABLE IF NOT EXISTS approval_stages (
    stage_id INTEGER PRIMARY KEY AUTOINCREMENT,
    stage_name TEXT NOT NULL UNIQUE,
    stage_order INTEGER NOT NULL UNIQUE,
    role_required TEXT NOT NULL,
    description TEXT
);

-- 10. APPROVALS TABLE (Audit log of each stage approval)
CREATE TABLE IF NOT EXISTS approvals (
    approval_id INTEGER PRIMARY KEY AUTOINCREMENT,
    application_id INTEGER NOT NULL,
    stage_id INTEGER NOT NULL,
    officer_id INTEGER NOT NULL,
    action TEXT NOT NULL CHECK(action IN ('Recommended', 'Approved', 'Rejected')),
    action_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    remarks TEXT,
    FOREIGN KEY (application_id) REFERENCES applications(application_id) ON DELETE CASCADE,
    FOREIGN KEY (stage_id) REFERENCES approval_stages(stage_id) ON DELETE RESTRICT,
    FOREIGN KEY (officer_id) REFERENCES users(user_id) ON DELETE RESTRICT
);

-- 11. SANCTIONS TABLE
CREATE TABLE IF NOT EXISTS sanctions (
    sanction_id INTEGER PRIMARY KEY AUTOINCREMENT,
    sanction_no TEXT NOT NULL UNIQUE,
    application_id INTEGER NOT NULL UNIQUE,
    student_id INTEGER NOT NULL,
    scheme_id INTEGER NOT NULL,
    approved_amount REAL NOT NULL CHECK(approved_amount > 0.0),
    sanction_amount REAL NOT NULL CHECK(sanction_amount > 0.0),
    sanction_date DATE NOT NULL,
    sanction_status TEXT NOT NULL DEFAULT 'Sanctioned' CHECK(sanction_status IN ('Sanctioned', 'Partially Disbursed', 'Fully Disbursed', 'Revoked')),
    approving_officer_id INTEGER NOT NULL,
    remarks TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (application_id) REFERENCES applications(application_id) ON DELETE RESTRICT,
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE RESTRICT,
    FOREIGN KEY (scheme_id) REFERENCES scholarship_schemes(scheme_id) ON DELETE RESTRICT,
    FOREIGN KEY (approving_officer_id) REFERENCES users(user_id) ON DELETE RESTRICT
);

-- 12. BANK DETAILS TABLE
CREATE TABLE IF NOT EXISTS bank_details (
    bank_detail_id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    account_holder_name TEXT NOT NULL,
    bank_name TEXT NOT NULL,
    account_number TEXT NOT NULL,
    ifsc_code TEXT NOT NULL,
    branch_name TEXT NOT NULL,
    is_verified INTEGER NOT NULL DEFAULT 0 CHECK(is_verified IN (0, 1)),
    verified_by INTEGER,
    verification_date DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    FOREIGN KEY (verified_by) REFERENCES users(user_id) ON DELETE SET NULL
);

-- 13. DISBURSEMENTS TABLE
CREATE TABLE IF NOT EXISTS disbursements (
    disbursement_id INTEGER PRIMARY KEY AUTOINCREMENT,
    disbursement_no TEXT NOT NULL UNIQUE,
    sanction_id INTEGER NOT NULL,
    application_id INTEGER NOT NULL,
    student_id INTEGER NOT NULL,
    bank_detail_id INTEGER NOT NULL,
    amount REAL NOT NULL CHECK(amount > 0.0),
    payment_mode TEXT NOT NULL CHECK(payment_mode IN ('PFMS', 'NEFT', 'RTGS', 'Direct DBT')),
    transaction_ref TEXT NOT NULL UNIQUE,
    payment_date DATE NOT NULL,
    payment_status TEXT NOT NULL DEFAULT 'Processing' CHECK(payment_status IN ('Pending', 'Processing', 'Successful', 'Failed')),
    processed_by INTEGER NOT NULL,
    remarks TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sanction_id) REFERENCES sanctions(sanction_id) ON DELETE RESTRICT,
    FOREIGN KEY (application_id) REFERENCES applications(application_id) ON DELETE RESTRICT,
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE RESTRICT,
    FOREIGN KEY (bank_detail_id) REFERENCES bank_details(bank_detail_id) ON DELETE RESTRICT,
    FOREIGN KEY (processed_by) REFERENCES users(user_id) ON DELETE RESTRICT
);

-- 14. RENEWALS TABLE
CREATE TABLE IF NOT EXISTS renewals (
    renewal_id INTEGER PRIMARY KEY AUTOINCREMENT,
    previous_application_id INTEGER NOT NULL,
    previous_sanction_id INTEGER NOT NULL,
    new_application_id INTEGER,
    student_id INTEGER NOT NULL,
    scheme_id INTEGER NOT NULL,
    academic_year TEXT NOT NULL,
    current_cgpa REAL NOT NULL CHECK(current_cgpa >= 0.0 AND current_cgpa <= 10.0),
    current_attendance REAL NOT NULL CHECK(current_attendance >= 0.0 AND current_attendance <= 100.0),
    renewal_status TEXT NOT NULL DEFAULT 'Submitted' CHECK(renewal_status IN ('Submitted', 'Verified', 'Approved', 'Rejected')),
    application_date DATE NOT NULL,
    approved_date DATE,
    remarks TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (previous_application_id) REFERENCES applications(application_id) ON DELETE RESTRICT,
    FOREIGN KEY (previous_sanction_id) REFERENCES sanctions(sanction_id) ON DELETE RESTRICT,
    FOREIGN KEY (new_application_id) REFERENCES applications(application_id) ON DELETE SET NULL,
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE RESTRICT,
    FOREIGN KEY (scheme_id) REFERENCES scholarship_schemes(scheme_id) ON DELETE RESTRICT
);

-- 15. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS audit_logs (
    log_id INTEGER PRIMARY KEY AUTOINCREMENT,
    action_type TEXT NOT NULL,
    entity_name TEXT NOT NULL,
    entity_id INTEGER,
    user_id INTEGER,
    details TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
);

-- ============================================================================
-- INDEXES FOR FREQUENTLY SEARCHED FIELDS (Performance & Query Optimization)
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_students_roll ON students(roll_number);
CREATE INDEX IF NOT EXISTS idx_students_dept ON students(department);
CREATE INDEX IF NOT EXISTS idx_students_email ON students(email);
CREATE INDEX IF NOT EXISTS idx_apps_student ON applications(student_id);
CREATE INDEX IF NOT EXISTS idx_apps_scheme ON applications(scheme_id);
CREATE INDEX IF NOT EXISTS idx_apps_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_apps_academic_year ON applications(academic_year);
CREATE INDEX IF NOT EXISTS idx_sanctions_app ON sanctions(application_id);
CREATE INDEX IF NOT EXISTS idx_disburse_sanction ON disbursements(sanction_id);

-- ============================================================================
-- DATABASE VIEWS (Required for DBMS Viva / Reporting)
-- ============================================================================

-- View 1: Pending_Applications_View
CREATE VIEW IF NOT EXISTS Pending_Applications_View AS
SELECT 
    a.application_id,
    a.application_no,
    s.student_id,
    s.roll_number,
    (s.first_name || ' ' || s.last_name) AS student_name,
    s.department,
    s.program,
    s.cgpa,
    s.annual_income,
    sc.scheme_id,
    sc.scheme_name,
    sc.max_amount,
    a.submission_date,
    a.current_stage,
    a.status
FROM applications a
JOIN students s ON a.student_id = s.student_id
JOIN scholarship_schemes sc ON a.scheme_id = sc.scheme_id
WHERE a.status IN ('Submitted', 'Under Verification');

-- View 2: Eligible_Students_View
CREATE VIEW IF NOT EXISTS Eligible_Students_View AS
SELECT 
    s.student_id,
    s.roll_number,
    (s.first_name || ' ' || s.last_name) AS student_name,
    s.department,
    s.category,
    s.cgpa,
    s.annual_income,
    sc.scheme_id,
    sc.scheme_name,
    sc.max_amount,
    CASE 
        WHEN s.cgpa >= sc.min_cgpa 
             AND s.annual_income <= sc.max_income 
             AND s.attendance_pct >= sc.min_attendance
             AND (sc.eligible_categories = 'All' OR instr(sc.eligible_categories, s.category) > 0)
        THEN 'Eligible'
        ELSE 'Not Eligible'
    END AS eligibility_status
FROM students s
CROSS JOIN scholarship_schemes sc
WHERE sc.status = 'Active';

-- View 3: Approved_Applications_View
CREATE VIEW IF NOT EXISTS Approved_Applications_View AS
SELECT 
    a.application_id,
    a.application_no,
    s.student_id,
    s.roll_number,
    (s.first_name || ' ' || s.last_name) AS student_name,
    s.department,
    sc.scheme_id,
    sc.scheme_name,
    sc.max_amount,
    a.status,
    a.current_stage,
    a.updated_at AS approval_date
FROM applications a
JOIN students s ON a.student_id = s.student_id
JOIN scholarship_schemes sc ON a.scheme_id = sc.scheme_id
WHERE a.status IN ('Approved', 'Sanctioned', 'Disbursed');

-- View 4: Disbursement_Report_View
CREATE VIEW IF NOT EXISTS Disbursement_Report_View AS
SELECT 
    d.disbursement_id,
    d.disbursement_no,
    d.transaction_ref,
    d.payment_date,
    d.amount AS disbursed_amount,
    d.payment_mode,
    d.payment_status,
    sn.sanction_no,
    sn.sanction_amount,
    a.application_no,
    s.roll_number,
    (s.first_name || ' ' || s.last_name) AS student_name,
    s.department,
    sc.scheme_name,
    b.bank_name,
    b.account_number,
    b.ifsc_code
FROM disbursements d
JOIN sanctions sn ON d.sanction_id = sn.sanction_id
JOIN applications a ON d.application_id = a.application_id
JOIN students s ON d.student_id = s.student_id
JOIN scholarship_schemes sc ON sn.scheme_id = sc.scheme_id
JOIN bank_details b ON d.bank_detail_id = b.bank_detail_id;

-- View 5: Scheme_Statistics_View
CREATE VIEW IF NOT EXISTS Scheme_Statistics_View AS
SELECT 
    sc.scheme_id,
    sc.scheme_name,
    sc.max_amount,
    COUNT(a.application_id) AS total_applications,
    SUM(CASE WHEN a.status = 'Approved' OR a.status = 'Sanctioned' OR a.status = 'Disbursed' THEN 1 ELSE 0 END) AS approved_count,
    SUM(CASE WHEN a.status = 'Rejected' THEN 1 ELSE 0 END) AS rejected_count,
    COALESCE(SUM(sn.sanction_amount), 0.0) AS total_sanctioned_amount,
    COALESCE(SUM(d.amount), 0.0) AS total_disbursed_amount
FROM scholarship_schemes sc
LEFT JOIN applications a ON sc.scheme_id = a.scheme_id
LEFT JOIN sanctions sn ON a.application_id = sn.application_id
LEFT JOIN disbursements d ON sn.sanction_id = d.sanction_id AND d.payment_status = 'Successful'
GROUP BY sc.scheme_id, sc.scheme_name, sc.max_amount;
