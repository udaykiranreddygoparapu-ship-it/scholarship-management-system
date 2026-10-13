-- ============================================================================
-- UNIVERSITY SCHOLARSHIP AND FINANCIAL AID MANAGEMENT SYSTEM (SFAMS)
-- MySQL 8.0 / MariaDB Relational Database Schema (Third Normal Form - 3NF)
-- Designed for University DBMS Course Evaluation & Academic Demonstration
-- ============================================================================

DROP DATABASE IF EXISTS university_scholarship_db;
CREATE DATABASE university_scholarship_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE university_scholarship_db;

-- 1. ROLES TABLE
CREATE TABLE roles (
    role_id INT AUTO_INCREMENT PRIMARY KEY,
    role_code VARCHAR(30) NOT NULL UNIQUE,
    role_name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. USERS TABLE
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(20),
    role_id INT NOT NULL,
    status ENUM('Active', 'Inactive', 'Suspended') NOT NULL DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles(role_id) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

-- 3. STUDENTS TABLE (3NF master record)
CREATE TABLE students (
    student_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNIQUE,
    roll_number VARCHAR(30) NOT NULL UNIQUE,
    first_name VARCHAR(80) NOT NULL,
    last_name VARCHAR(80) NOT NULL,
    dob DATE NOT NULL,
    gender ENUM('Male', 'Female', 'Other') NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL,
    department VARCHAR(100) NOT NULL,
    program VARCHAR(100) NOT NULL,
    semester INT NOT NULL CHECK (semester BETWEEN 1 AND 10),
    category ENUM('General', 'OBC', 'SC', 'ST', 'EWS') NOT NULL,
    cgpa DECIMAL(4,2) NOT NULL CHECK (cgpa BETWEEN 0.00 AND 10.00),
    academic_percentage DECIMAL(5,2) NOT NULL CHECK (academic_percentage BETWEEN 0.00 AND 100.00),
    annual_income DECIMAL(12,2) NOT NULL CHECK (annual_income >= 0.00),
    attendance_pct DECIMAL(5,2) NOT NULL DEFAULT 85.00 CHECK (attendance_pct BETWEEN 0.00 AND 100.00),
    admission_year INT NOT NULL,
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_students_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB;

-- 4. SCHOLARSHIP SCHEMES TABLE
CREATE TABLE scholarship_schemes (
    scheme_id INT AUTO_INCREMENT PRIMARY KEY,
    scheme_code VARCHAR(30) NOT NULL UNIQUE,
    scheme_name VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    category_target VARCHAR(100) NOT NULL DEFAULT 'All',
    min_amount DECIMAL(12,2) NOT NULL CHECK (min_amount >= 0.00),
    max_amount DECIMAL(12,2) NOT NULL CHECK (max_amount >= min_amount),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    status ENUM('Active', 'Inactive', 'Closed') NOT NULL DEFAULT 'Active',
    renewal_allowed TINYINT(1) NOT NULL DEFAULT 1,
    min_cgpa DECIMAL(4,2) NOT NULL DEFAULT 6.00 CHECK (min_cgpa BETWEEN 0.00 AND 10.00),
    min_percentage DECIMAL(5,2) NOT NULL DEFAULT 60.00 CHECK (min_percentage BETWEEN 0.00 AND 100.00),
    max_income DECIMAL(12,2) NOT NULL DEFAULT 500000.00 CHECK (max_income >= 0.00),
    min_attendance DECIMAL(5,2) NOT NULL DEFAULT 75.00 CHECK (min_attendance BETWEEN 0.00 AND 100.00),
    eligible_departments VARCHAR(255) NOT NULL DEFAULT 'All',
    eligible_programs VARCHAR(255) NOT NULL DEFAULT 'All',
    eligible_categories VARCHAR(255) NOT NULL DEFAULT 'All',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 5. SCHEME REQUIRED DOCUMENTS MASTER TABLE
CREATE TABLE scheme_documents (
    scheme_doc_id INT AUTO_INCREMENT PRIMARY KEY,
    scheme_id INT NOT NULL,
    document_name VARCHAR(150) NOT NULL,
    is_mandatory TINYINT(1) NOT NULL DEFAULT 1,
    description TEXT,
    CONSTRAINT fk_scheme_docs FOREIGN KEY (scheme_id) REFERENCES scholarship_schemes(scheme_id) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

-- 6. APPLICATIONS TABLE
CREATE TABLE applications (
    application_id INT AUTO_INCREMENT PRIMARY KEY,
    application_no VARCHAR(40) NOT NULL UNIQUE,
    student_id INT NOT NULL,
    scheme_id INT NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    submission_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    current_stage ENUM(
        'Submitted', 
        'Document Verification', 
        'Eligibility Verification', 
        'Department Approval', 
        'Final Approval', 
        'Sanctioned', 
        'Disbursed', 
        'Rejected'
    ) NOT NULL DEFAULT 'Submitted',
    status ENUM(
        'Submitted', 
        'Under Verification', 
        'Verified', 
        'Approved', 
        'Sanctioned', 
        'Disbursed', 
        'Rejected'
    ) NOT NULL DEFAULT 'Submitted',
    rejection_reason TEXT,
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_app_student FOREIGN KEY (student_id) REFERENCES students(student_id) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_app_scheme FOREIGN KEY (scheme_id) REFERENCES scholarship_schemes(scheme_id) ON UPDATE CASCADE ON DELETE RESTRICT,
    -- Business Rule: One application per student per scholarship scheme per academic year
    CONSTRAINT uq_student_scheme_year UNIQUE(student_id, scheme_id, academic_year)
) ENGINE=InnoDB;

-- 7. APPLICATION DOCUMENTS TABLE
CREATE TABLE application_documents (
    app_doc_id INT AUTO_INCREMENT PRIMARY KEY,
    application_id INT NOT NULL,
    document_name VARCHAR(150) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size_kb INT NOT NULL DEFAULT 250,
    file_type VARCHAR(50) NOT NULL DEFAULT 'application/pdf',
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('Pending', 'Verified', 'Rejected', 'Resubmission Required') NOT NULL DEFAULT 'Pending',
    remarks TEXT,
    verified_by INT,
    verification_date DATETIME,
    CONSTRAINT fk_appdoc_app FOREIGN KEY (application_id) REFERENCES applications(application_id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_appdoc_verifier FOREIGN KEY (verified_by) REFERENCES users(user_id) ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB;

-- 8. VERIFICATIONS TABLE
CREATE TABLE verifications (
    verification_id INT AUTO_INCREMENT PRIMARY KEY,
    application_id INT NOT NULL,
    verifier_id INT NOT NULL,
    verification_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('Verified', 'Rejected', 'Resubmission Required') NOT NULL,
    eligibility_satisfied TINYINT(1) NOT NULL,
    remarks TEXT NOT NULL,
    CONSTRAINT fk_verif_app FOREIGN KEY (application_id) REFERENCES applications(application_id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_verif_officer FOREIGN KEY (verifier_id) REFERENCES users(user_id) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

-- 9. APPROVAL STAGES MASTER TABLE
CREATE TABLE approval_stages (
    stage_id INT AUTO_INCREMENT PRIMARY KEY,
    stage_name VARCHAR(100) NOT NULL UNIQUE,
    stage_order INT NOT NULL UNIQUE,
    role_required VARCHAR(50) NOT NULL,
    description TEXT
) ENGINE=InnoDB;

-- 10. APPROVALS AUDIT TABLE
CREATE TABLE approvals (
    approval_id INT AUTO_INCREMENT PRIMARY KEY,
    application_id INT NOT NULL,
    stage_id INT NOT NULL,
    officer_id INT NOT NULL,
    action ENUM('Recommended', 'Approved', 'Rejected') NOT NULL,
    action_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    remarks TEXT,
    CONSTRAINT fk_appr_app FOREIGN KEY (application_id) REFERENCES applications(application_id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_appr_stage FOREIGN KEY (stage_id) REFERENCES approval_stages(stage_id) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_appr_officer FOREIGN KEY (officer_id) REFERENCES users(user_id) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

-- 11. SANCTIONS TABLE
CREATE TABLE sanctions (
    sanction_id INT AUTO_INCREMENT PRIMARY KEY,
    sanction_no VARCHAR(40) NOT NULL UNIQUE,
    application_id INT NOT NULL UNIQUE,
    student_id INT NOT NULL,
    scheme_id INT NOT NULL,
    approved_amount DECIMAL(12,2) NOT NULL CHECK (approved_amount > 0.00),
    sanction_amount DECIMAL(12,2) NOT NULL CHECK (sanction_amount > 0.00),
    sanction_date DATE NOT NULL,
    sanction_status ENUM('Sanctioned', 'Partially Disbursed', 'Fully Disbursed', 'Revoked') NOT NULL DEFAULT 'Sanctioned',
    approving_officer_id INT NOT NULL,
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_sanc_app FOREIGN KEY (application_id) REFERENCES applications(application_id) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_sanc_student FOREIGN KEY (student_id) REFERENCES students(student_id) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_sanc_scheme FOREIGN KEY (scheme_id) REFERENCES scholarship_schemes(scheme_id) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_sanc_officer FOREIGN KEY (approving_officer_id) REFERENCES users(user_id) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

-- 12. BANK DETAILS TABLE
CREATE TABLE bank_details (
    bank_detail_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    account_holder_name VARCHAR(150) NOT NULL,
    bank_name VARCHAR(150) NOT NULL,
    account_number VARCHAR(30) NOT NULL,
    ifsc_code VARCHAR(20) NOT NULL,
    branch_name VARCHAR(150) NOT NULL,
    is_verified TINYINT(1) NOT NULL DEFAULT 0,
    verified_by INT,
    verification_date DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_bank_student FOREIGN KEY (student_id) REFERENCES students(student_id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_bank_verifier FOREIGN KEY (verified_by) REFERENCES users(user_id) ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB;

-- 13. DISBURSEMENTS TABLE
CREATE TABLE disbursements (
    disbursement_id INT AUTO_INCREMENT PRIMARY KEY,
    disbursement_no VARCHAR(40) NOT NULL UNIQUE,
    sanction_id INT NOT NULL,
    application_id INT NOT NULL,
    student_id INT NOT NULL,
    bank_detail_id INT NOT NULL,
    amount DECIMAL(12,2) NOT NULL CHECK (amount > 0.00),
    payment_mode ENUM('PFMS', 'NEFT', 'RTGS', 'Direct DBT') NOT NULL,
    transaction_ref VARCHAR(80) NOT NULL UNIQUE,
    payment_date DATE NOT NULL,
    payment_status ENUM('Pending', 'Processing', 'Successful', 'Failed') NOT NULL DEFAULT 'Processing',
    processed_by INT NOT NULL,
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_disb_sanction FOREIGN KEY (sanction_id) REFERENCES sanctions(sanction_id) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_disb_app FOREIGN KEY (application_id) REFERENCES applications(application_id) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_disb_student FOREIGN KEY (student_id) REFERENCES students(student_id) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_disb_bank FOREIGN KEY (bank_detail_id) REFERENCES bank_details(bank_detail_id) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_disb_officer FOREIGN KEY (processed_by) REFERENCES users(user_id) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

-- 14. RENEWALS TABLE
CREATE TABLE renewals (
    renewal_id INT AUTO_INCREMENT PRIMARY KEY,
    previous_application_id INT NOT NULL,
    previous_sanction_id INT NOT NULL,
    new_application_id INT,
    student_id INT NOT NULL,
    scheme_id INT NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    current_cgpa DECIMAL(4,2) NOT NULL CHECK (current_cgpa BETWEEN 0.00 AND 10.00),
    current_attendance DECIMAL(5,2) NOT NULL CHECK (current_attendance BETWEEN 0.00 AND 100.00),
    renewal_status ENUM('Submitted', 'Verified', 'Approved', 'Rejected') NOT NULL DEFAULT 'Submitted',
    application_date DATE NOT NULL,
    approved_date DATE,
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_ren_prev_app FOREIGN KEY (previous_application_id) REFERENCES applications(application_id) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_ren_prev_sanc FOREIGN KEY (previous_sanction_id) REFERENCES sanctions(sanction_id) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_ren_new_app FOREIGN KEY (new_application_id) REFERENCES applications(application_id) ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT fk_ren_student FOREIGN KEY (student_id) REFERENCES students(student_id) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_ren_scheme FOREIGN KEY (scheme_id) REFERENCES scholarship_schemes(scheme_id) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

-- 15. AUDIT LOGS TABLE
CREATE TABLE audit_logs (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    action_type VARCHAR(50) NOT NULL,
    entity_name VARCHAR(50) NOT NULL,
    entity_id INT,
    user_id INT,
    details TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_audit_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB;

-- ============================================================================
-- INDEXES FOR FREQUENTLY SEARCHED FIELDS
-- ============================================================================
CREATE INDEX idx_students_roll ON students(roll_number);
CREATE INDEX idx_students_dept ON students(department);
CREATE INDEX idx_students_email ON students(email);
CREATE INDEX idx_apps_student ON applications(student_id);
CREATE INDEX idx_apps_scheme ON applications(scheme_id);
CREATE INDEX idx_apps_status ON applications(status);
CREATE INDEX idx_apps_academic_year ON applications(academic_year);
CREATE INDEX idx_sanctions_app ON sanctions(application_id);
CREATE INDEX idx_disburse_sanction ON disbursements(sanction_id);

-- ============================================================================
-- DATABASE VIEWS (Required for DBMS Viva / Reporting)
-- ============================================================================

-- View 1: Pending_Applications_View
CREATE OR REPLACE VIEW Pending_Applications_View AS
SELECT 
    a.application_id,
    a.application_no,
    s.student_id,
    s.roll_number,
    CONCAT(s.first_name, ' ', s.last_name) AS student_name,
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
CREATE OR REPLACE VIEW Eligible_Students_View AS
SELECT 
    s.student_id,
    s.roll_number,
    CONCAT(s.first_name, ' ', s.last_name) AS student_name,
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
             AND (sc.eligible_categories = 'All' OR FIND_IN_SET(s.category, sc.eligible_categories) > 0)
        THEN 'Eligible'
        ELSE 'Not Eligible'
    END AS eligibility_status
FROM students s
CROSS JOIN scholarship_schemes sc
WHERE sc.status = 'Active';

-- View 3: Approved_Applications_View
CREATE OR REPLACE VIEW Approved_Applications_View AS
SELECT 
    a.application_id,
    a.application_no,
    s.student_id,
    s.roll_number,
    CONCAT(s.first_name, ' ', s.last_name) AS student_name,
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
CREATE OR REPLACE VIEW Disbursement_Report_View AS
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
    CONCAT(s.first_name, ' ', s.last_name) AS student_name,
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
CREATE OR REPLACE VIEW Scheme_Statistics_View AS
SELECT 
    sc.scheme_id,
    sc.scheme_name,
    sc.max_amount,
    COUNT(a.application_id) AS total_applications,
    SUM(CASE WHEN a.status IN ('Approved', 'Sanctioned', 'Disbursed') THEN 1 ELSE 0 END) AS approved_count,
    SUM(CASE WHEN a.status = 'Rejected' THEN 1 ELSE 0 END) AS rejected_count,
    COALESCE(SUM(sn.sanction_amount), 0.00) AS total_sanctioned_amount,
    COALESCE(SUM(d.amount), 0.00) AS total_disbursed_amount
FROM scholarship_schemes sc
LEFT JOIN applications a ON sc.scheme_id = a.scheme_id
LEFT JOIN sanctions sn ON a.application_id = sn.application_id
LEFT JOIN disbursements d ON sn.sanction_id = d.sanction_id AND d.payment_status = 'Successful'
GROUP BY sc.scheme_id, sc.scheme_name, sc.max_amount;
