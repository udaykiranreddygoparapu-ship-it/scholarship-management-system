// ============================================================================
// UNIVERSITY SCHOLARSHIP AND FINANCIAL AID MANAGEMENT SYSTEM
// Standard Relational SQL Queries for DBMS Academic Project Evaluation
// ============================================================================

const predefinedQueries = [
    {
        id: 'inner_join_pipeline',
        category: 'Relational JOINs',
        title: 'Full Pipeline INNER JOIN: Applications, Students, Schemes & Sanctions',
        description: 'Demonstrates multi-table INNER JOIN tracking student details, scheme parameters, approval status, and financial sanctions.',
        sql: `SELECT 
    a.application_no,
    (s.first_name || ' ' || s.last_name) AS student_name,
    s.roll_number,
    s.department,
    sc.scheme_name,
    sc.max_amount AS scheme_cap,
    a.status AS current_status,
    COALESCE(sn.sanction_no, 'N/A') AS sanction_number,
    COALESCE(sn.sanction_amount, 0) AS sanctioned_inr,
    COALESCE(d.payment_status, 'Unprocessed') AS disbursement_status
FROM applications a
INNER JOIN students s ON a.student_id = s.student_id
INNER JOIN scholarship_schemes sc ON a.scheme_id = sc.scheme_id
LEFT JOIN sanctions sn ON a.application_id = sn.application_id
LEFT JOIN disbursements d ON sn.sanction_id = d.sanction_id
ORDER BY a.application_id DESC;`
    },
    {
        id: 'left_join_summary',
        category: 'Relational JOINs',
        title: 'LEFT JOIN: Scheme-wise Application Demand & Budget Utilisation',
        description: 'Demonstrates LEFT OUTER JOIN ensuring all schemes are listed, even if no applications have been submitted yet.',
        sql: `SELECT 
    sc.scheme_code,
    sc.scheme_name,
    sc.max_amount AS max_grant_per_student,
    COUNT(a.application_id) AS total_applied,
    COALESCE(SUM(sn.sanction_amount), 0) AS total_sanctioned,
    COALESCE(SUM(d.amount), 0) AS total_disbursed
FROM scholarship_schemes sc
LEFT JOIN applications a ON sc.scheme_id = a.scheme_id
LEFT JOIN sanctions sn ON a.application_id = sn.application_id
LEFT JOIN disbursements d ON sn.sanction_id = d.sanction_id AND d.payment_status = 'Successful'
GROUP BY sc.scheme_id, sc.scheme_code, sc.scheme_name, sc.max_amount
ORDER BY total_applied DESC;`
    },
    {
        id: 'group_by_having_dept',
        category: 'Grouping & Filtering',
        title: 'GROUP BY with HAVING: Departments with 2 or More Applications',
        description: 'Demonstrates aggregation with GROUP BY on Department and program, filtered using HAVING clause.',
        sql: `SELECT 
    s.department,
    s.program,
    COUNT(a.application_id) AS applicant_count,
    ROUND(AVG(s.cgpa), 2) AS avg_cgpa,
    ROUND(AVG(s.annual_income), 2) AS avg_family_income,
    COALESCE(SUM(sn.sanction_amount), 0) AS total_sanctioned_amount
FROM students s
INNER JOIN applications a ON s.student_id = a.student_id
LEFT JOIN sanctions sn ON a.application_id = sn.application_id
GROUP BY s.department, s.program
HAVING COUNT(a.application_id) >= 2
ORDER BY applicant_count DESC;`
    },
    {
        id: 'nested_subquery_income',
        category: 'Subqueries & Nested SQL',
        title: 'Nested Subquery: Students with Family Income Below Overall Average',
        description: 'Demonstrates nested SELECT subquery comparing individual student annual income against average income of all applicants.',
        sql: `SELECT 
    s.roll_number,
    (s.first_name || ' ' || s.last_name) AS student_name,
    s.department,
    s.category,
    s.annual_income,
    (SELECT ROUND(AVG(annual_income), 2) FROM students) AS overall_avg_income,
    s.cgpa
FROM students s
WHERE s.annual_income < (
    SELECT AVG(annual_income) FROM students
)
ORDER BY s.annual_income ASC;`
    },
    {
        id: 'correlated_subquery_max',
        category: 'Subqueries & Nested SQL',
        title: 'Correlated Subquery: Highest CGPA Student per Department',
        description: 'Demonstrates correlated subquery finding the academic topper within each university department.',
        sql: `SELECT 
    s.department,
    s.roll_number,
    (s.first_name || ' ' || s.last_name) AS student_name,
    s.cgpa,
    s.category
FROM students s
WHERE s.cgpa = (
    SELECT MAX(sub.cgpa)
    FROM students sub
    WHERE sub.department = s.department
)
ORDER BY s.cgpa DESC;`
    },
    {
        id: 'aggregate_metrics',
        category: 'Aggregate Functions',
        title: 'Aggregate Summary: Statistical Analysis across Social Categories',
        description: 'Demonstrates aggregate functions: COUNT(), SUM(), AVG(), MIN(), MAX() grouped by student reservation category.',
        sql: `SELECT 
    s.category,
    COUNT(s.student_id) AS total_students,
    ROUND(AVG(s.cgpa), 2) AS average_cgpa,
    ROUND(MIN(s.cgpa), 2) AS min_cgpa,
    ROUND(MAX(s.cgpa), 2) AS max_cgpa,
    ROUND(AVG(s.annual_income), 0) AS avg_annual_income,
    ROUND(MIN(s.annual_income), 0) AS lowest_income,
    ROUND(MAX(s.annual_income), 0) AS highest_income
FROM students s
GROUP BY s.category
ORDER BY total_students DESC;`
    },
    {
        id: 'view_pending',
        category: 'Database Views',
        title: 'Database View: Pending_Applications_View',
        description: 'Queries the predefined view for applications in initial queues needing verification.',
        sql: `SELECT * FROM Pending_Applications_View ORDER BY submission_date ASC;`
    },
    {
        id: 'view_disbursements',
        category: 'Database Views',
        title: 'Database View: Disbursement_Report_View',
        description: 'Queries the comprehensive treasury payment tracking view joining 6 tables.',
        sql: `SELECT * FROM Disbursement_Report_View;`
    },
    {
        id: 'view_scheme_stats',
        category: 'Database Views',
        title: 'Database View: Scheme_Statistics_View',
        description: 'Queries the pre-aggregated summary view across all institutional scholarship schemes.',
        sql: `SELECT * FROM Scheme_Statistics_View;`
    },
    {
        id: 'transaction_simulation',
        category: 'Transactions & ACID Properties',
        title: 'Transaction Demo: Atomic Application & Document Registration',
        description: 'Simulates BEGIN TRANSACTION, checking duplicate constraint, inserting application and documents, and executing COMMIT.',
        sql: `-- TRANSACTION DEMONSTRATION SCRIPT
-- Illustrates ACID atomicity during online student scholarship submission:
BEGIN TRANSACTION;

-- 1. Insert New Application (rolls back if UNIQUE constraint violated)
INSERT INTO applications (
    application_no, student_id, scheme_id, academic_year, current_stage, status, remarks
) VALUES (
    'APP-2026-DEMO99', 5, 1, '2026-27', 'Submitted', 'Submitted', 'Test Transaction Application'
);

-- 2. Associate Required Uploaded Document
INSERT INTO application_documents (
    application_id, document_name, file_name, file_size_kb, status, remarks
) VALUES (
    last_insert_rowid(), 'Income Certificate', 'Income_Proof_Demo.pdf', 310, 'Pending', 'Awaiting verification'
);

-- 3. Log Audit Trail
INSERT INTO audit_logs (
    action_type, entity_name, entity_id, user_id, details
) VALUES (
    'TRANSACTION_DEMO', 'applications', last_insert_rowid(), 1, 'ACID transaction demonstrated'
);

COMMIT;

-- Verify the committed record:
SELECT * FROM applications WHERE application_no = 'APP-2026-DEMO99';`
    }
];

if (typeof module !== 'undefined' && module.exports) {
    module.exports = predefinedQueries;
}
