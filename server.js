// ============================================================================
// UNIVERSITY SCHOLARSHIP AND FINANCIAL AID MANAGEMENT SYSTEM (SFAMS)
// Express Backend Server with Relational API & Live SQL Studio Engine
// ============================================================================

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const dbManager = require('./database/db');
const predefinedQueries = require('./database/queries');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Middleware: Ensure database is initialized before serving requests (critical for serverless)
let initPromise = null;
app.use(async (req, res, next) => {
    try {
        if (!dbManager.isInitialized) {
            if (!initPromise) {
                initPromise = dbManager.init();
            }
            await initPromise;
        }
        next();
    } catch (err) {
        console.error('Database initialization error:', err);
        res.status(500).json({ success: false, error: 'Database initialization failed: ' + err.message });
    }
});

// ----------------------------------------------------------------------------
// API: SYSTEM HEALTH & METRICS
// ----------------------------------------------------------------------------
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ----------------------------------------------------------------------------
// API: SECURE AUTHENTICATION LOGIN (3NF USERS & ROLES)
// ----------------------------------------------------------------------------
app.post('/api/auth/login', (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ success: false, error: 'Username/Roll Number and Password are required' });
        }

        const query = dbManager.query(`
            SELECT u.*, r.role_code, r.role_name, s.student_id, s.roll_number, s.first_name, s.last_name, s.department
            FROM users u
            JOIN roles r ON u.role_id = r.role_id
            LEFT JOIN students s ON u.user_id = s.user_id
            WHERE u.username = ? OR s.roll_number = ?
        `, [username.trim(), username.trim()]);

        if (!query.data || query.data.length === 0) {
            return res.status(401).json({ success: false, error: 'Invalid Username or Roll Number' });
        }

        const user = query.data[0];
        if (user.password_hash !== password.trim()) {
            return res.status(401).json({ success: false, error: 'Incorrect password' });
        }

        res.json({
            success: true,
            user: {
                userId: user.user_id,
                username: user.username,
                fullName: user.full_name,
                roleCode: user.role_code,
                roleName: user.role_name,
                studentId: user.student_id,
                rollNumber: user.roll_number,
                department: user.department
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// ----------------------------------------------------------------------------
// API: STUDENT PERSONALIZED DASHBOARD (ISOLATED TO ACTIVE STUDENT ONLY)
// ----------------------------------------------------------------------------
app.get('/api/students/:id/dashboard', (req, res) => {
    try {
        const studentId = parseInt(req.params.id);
        const studentRes = dbManager.query('SELECT * FROM students WHERE student_id = ?', [studentId]);
        if (!studentRes.data || studentRes.data.length === 0) {
            return res.status(404).json({ success: false, error: 'Student record not found' });
        }
        const student = studentRes.data[0];

        // 1. Student's own applications
        const apps = dbManager.query(`
            SELECT 
                a.*,
                sc.scheme_code,
                sc.scheme_name,
                sc.max_amount,
                COALESCE(sn.sanction_no, '') AS sanction_no,
                COALESCE(sn.sanction_amount, 0) AS sanction_amount,
                COALESCE(d.disbursement_no, '') AS disbursement_no,
                COALESCE(d.payment_status, '') AS disbursement_status,
                COALESCE(d.amount, 0) AS disbursed_amount,
                COALESCE(d.transaction_ref, '') AS transaction_ref
            FROM applications a
            JOIN scholarship_schemes sc ON a.scheme_id = sc.scheme_id
            LEFT JOIN sanctions sn ON a.application_id = sn.application_id
            LEFT JOIN disbursements d ON sn.sanction_id = d.sanction_id
            WHERE a.student_id = ?
            ORDER BY a.application_id DESC
        `, [studentId]).data;

        // 2. Student's own bank details
        const bank = dbManager.query('SELECT * FROM bank_details WHERE student_id = ?', [studentId]).data[0] || null;

        // 3. Student's own renewals
        const renewals = dbManager.query('SELECT * FROM renewals WHERE student_id = ?', [studentId]).data;

        // 4. Calculate student's personal financial stats
        let totalSanctioned = 0;
        let totalDisbursed = 0;
        apps.forEach(a => {
            totalSanctioned += (a.sanction_amount || 0);
            totalDisbursed += (a.disbursed_amount || 0);
        });

        // 5. Schemes eligible specifically for this student
        const eligibleSchemes = dbManager.query(`
            SELECT scheme_id, scheme_code, scheme_name, max_amount, description, min_cgpa, max_income
            FROM scholarship_schemes
            WHERE status = 'Active'
              AND min_cgpa <= ?
              AND max_income >= ?
              AND (eligible_departments = 'All' OR eligible_departments LIKE ?)
        `, [student.cgpa, student.annual_income, `%${student.department}%`]).data;

        res.json({
            success: true,
            student,
            bankDetails: bank,
            applications: apps,
            renewals,
            stats: {
                totalApplications: apps.length,
                pendingCount: apps.filter(a => ['Submitted', 'Under Verification'].includes(a.status)).length,
                approvedCount: apps.filter(a => ['Verified', 'Approved', 'Sanctioned', 'Disbursed'].includes(a.status)).length,
                totalSanctioned,
                totalDisbursed,
                eligibleSchemesCount: eligibleSchemes.length
            },
            eligibleSchemes
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// ----------------------------------------------------------------------------
// API: DASHBOARD SUMMARY & ANALYTICAL CHARTS
// ----------------------------------------------------------------------------
app.get('/api/dashboard/stats', (req, res) => {
    try {
        const studentCount = dbManager.query('SELECT COUNT(*) AS total FROM students').data[0].total;
        const activeSchemes = dbManager.query("SELECT COUNT(*) AS total FROM scholarship_schemes WHERE status = 'Active'").data[0].total;
        const totalApps = dbManager.query('SELECT COUNT(*) AS total FROM applications').data[0].total;
        const pendingApps = dbManager.query("SELECT COUNT(*) AS total FROM applications WHERE status IN ('Submitted', 'Under Verification')").data[0].total;
        const verifiedApps = dbManager.query("SELECT COUNT(*) AS total FROM applications WHERE status = 'Verified'").data[0].total;
        const approvedApps = dbManager.query("SELECT COUNT(*) AS total FROM applications WHERE status = 'Approved'").data[0].total;
        const rejectedApps = dbManager.query("SELECT COUNT(*) AS total FROM applications WHERE status = 'Rejected'").data[0].total;
        
        const sanctionStats = dbManager.query('SELECT COALESCE(SUM(sanction_amount), 0) AS total_sanctioned FROM sanctions').data[0];
        const disbursementStats = dbManager.query("SELECT COALESCE(SUM(amount), 0) AS total_disbursed FROM disbursements WHERE payment_status = 'Successful'").data[0];
        const pendingDisbursements = dbManager.query("SELECT COUNT(*) AS total FROM sanctions s WHERE s.sanction_status = 'Sanctioned' AND s.sanction_id NOT IN (SELECT sanction_id FROM disbursements WHERE payment_status = 'Successful')").data[0].total;
        const renewalsDue = dbManager.query("SELECT COUNT(*) AS total FROM renewals WHERE renewal_status = 'Submitted'").data[0].total;

        // Chart 1: Applications by Scheme
        const appsByScheme = dbManager.query(`
            SELECT sc.scheme_name, sc.scheme_code, COUNT(a.application_id) AS count
            FROM scholarship_schemes sc
            LEFT JOIN applications a ON sc.scheme_id = a.scheme_id
            GROUP BY sc.scheme_id, sc.scheme_name, sc.scheme_code
            ORDER BY count DESC
        `).data;

        // Chart 2: Applications by Status
        const appsByStatus = dbManager.query(`
            SELECT status, COUNT(*) AS count
            FROM applications
            GROUP BY status
        `).data;

        // Chart 3: Sanctioned vs Disbursed per Scheme
        const budgetComparison = dbManager.query(`
            SELECT 
                sc.scheme_code,
                sc.scheme_name,
                COALESCE(SUM(sn.sanction_amount), 0) AS sanctioned,
                COALESCE(SUM(d.amount), 0) AS disbursed
            FROM scholarship_schemes sc
            LEFT JOIN applications a ON sc.scheme_id = a.scheme_id
            LEFT JOIN sanctions sn ON a.application_id = sn.application_id
            LEFT JOIN disbursements d ON sn.sanction_id = d.sanction_id AND d.payment_status = 'Successful'
            GROUP BY sc.scheme_id, sc.scheme_code, sc.scheme_name
        `).data;

        // Chart 4: Department-wise Application Distribution
        const appsByDept = dbManager.query(`
            SELECT s.department, COUNT(a.application_id) AS count
            FROM students s
            LEFT JOIN applications a ON s.student_id = a.student_id
            GROUP BY s.department
            ORDER BY count DESC
        `).data;

        // Chart 5: Monthly Disbursements Timeline
        const monthlyDisbursements = [
            { month: 'Apr', amount: 0 },
            { month: 'May', amount: 0 },
            { month: 'Jun', amount: 0 },
            { month: 'Jul', amount: 35000 },
            { month: 'Aug', amount: 110000 },
            { month: 'Sep (Est)', amount: 155000 }
        ];

        res.json({
            success: true,
            kpis: {
                totalStudents: studentCount,
                activeSchemes,
                totalApplications: totalApps,
                pendingApplications: pendingApps,
                verifiedApplications: verifiedApps,
                approvedApplications: approvedApps,
                rejectedApplications: rejectedApps,
                totalSanctionedAmount: sanctionStats.total_sanctioned,
                totalDisbursedAmount: disbursementStats.total_disbursed,
                pendingDisbursements,
                renewalsDue
            },
            charts: {
                appsByScheme,
                appsByStatus,
                budgetComparison,
                appsByDept,
                monthlyDisbursements
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// ----------------------------------------------------------------------------
// API: STUDENTS MODULE
// ----------------------------------------------------------------------------
app.get('/api/students', (req, res) => {
    const { department, search, category } = req.query;
    let sql = `
        SELECT s.*, 
            COALESCE(b.bank_name, 'Not Configured') AS bank_name,
            COALESCE(b.account_number, '') AS account_number,
            COALESCE(b.is_verified, 0) AS bank_verified,
            (SELECT COUNT(*) FROM applications WHERE student_id = s.student_id) AS total_applications
        FROM students s
        LEFT JOIN bank_details b ON s.student_id = b.student_id
        WHERE 1=1
    `;
    const params = [];

    if (department && department !== 'All') {
        sql += ` AND s.department = ?`;
        params.push(department);
    }
    if (category && category !== 'All') {
        sql += ` AND s.category = ?`;
        params.push(category);
    }
    if (search) {
        sql += ` AND (s.first_name LIKE ? OR s.last_name LIKE ? OR s.roll_number LIKE ? OR s.email LIKE ?)`;
        const q = `%${search}%`;
        params.push(q, q, q, q);
    }

    sql += ` ORDER BY s.roll_number ASC`;
    const result = dbManager.query(sql, params);
    res.json(result);
});

app.get('/api/students/:id', (req, res) => {
    const studentId = parseInt(req.params.id);
    const student = dbManager.query('SELECT * FROM students WHERE student_id = ?', [studentId]);
    if (!student.data || student.data.length === 0) {
        return res.status(404).json({ success: false, error: 'Student not found' });
    }

    const bank = dbManager.query('SELECT * FROM bank_details WHERE student_id = ?', [studentId]);
    const apps = dbManager.query(`
        SELECT a.*, sc.scheme_name, sc.scheme_code, sc.max_amount
        FROM applications a
        JOIN scholarship_schemes sc ON a.scheme_id = sc.scheme_id
        WHERE a.student_id = ?
        ORDER BY a.submission_date DESC
    `, [studentId]);

    res.json({
        success: true,
        student: student.data[0],
        bankDetails: bank.data[0] || null,
        applications: apps.data
    });
});

app.post('/api/students', (req, res) => {
    const {
        roll_number, first_name, last_name, dob, gender, email, phone,
        department, program, semester, category, cgpa, academic_percentage,
        annual_income, attendance_pct, admission_year, address
    } = req.body;

    if (!roll_number || !first_name || !last_name || !email || !department) {
        return res.status(400).json({ success: false, error: 'Missing required student fields' });
    }

    const sql = `
        INSERT INTO students (
            roll_number, first_name, last_name, dob, gender, email, phone,
            department, program, semester, category, cgpa, academic_percentage,
            annual_income, attendance_pct, admission_year, address
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const result = dbManager.run(sql, [
        roll_number, first_name, last_name, dob || '2004-01-01', gender || 'Male',
        email, phone || '', department, program || 'B.Tech', parseInt(semester) || 1,
        category || 'General', parseFloat(cgpa) || 7.0, parseFloat(academic_percentage) || 70.0,
        parseFloat(annual_income) || 200000, parseFloat(attendance_pct) || 85.0,
        parseInt(admission_year) || 2024, address || ''
    ]);

    if (!result.success) {
        return res.status(400).json(result);
    }

    res.json({ success: true, message: 'Student registered successfully' });
});

// ----------------------------------------------------------------------------
// API: SCHOLARSHIP SCHEMES MODULE
// ----------------------------------------------------------------------------
app.get('/api/schemes', (req, res) => {
    const { status } = req.query;
    let sql = `
        SELECT sc.*,
            (SELECT COUNT(*) FROM applications WHERE scheme_id = sc.scheme_id) AS applications_count,
            (SELECT COUNT(*) FROM scheme_documents WHERE scheme_id = sc.scheme_id) AS required_docs_count
        FROM scholarship_schemes sc
        WHERE 1=1
    `;
    const params = [];
    if (status && status !== 'All') {
        sql += ` AND sc.status = ?`;
        params.push(status);
    }
    sql += ` ORDER BY sc.scheme_id ASC`;
    const result = dbManager.query(sql, params);
    res.json(result);
});

app.get('/api/schemes/:id', (req, res) => {
    const schemeId = parseInt(req.params.id);
    const scheme = dbManager.query('SELECT * FROM scholarship_schemes WHERE scheme_id = ?', [schemeId]);
    if (!scheme.data || scheme.data.length === 0) {
        return res.status(404).json({ success: false, error: 'Scheme not found' });
    }

    const docs = dbManager.query('SELECT * FROM scheme_documents WHERE scheme_id = ?', [schemeId]);
    res.json({
        success: true,
        scheme: scheme.data[0],
        documents: docs.data
    });
});

app.post('/api/schemes', (req, res) => {
    const {
        scheme_code, scheme_name, description, category_target,
        min_amount, max_amount, start_date, end_date, academic_year,
        status, renewal_allowed, min_cgpa, min_percentage, max_income,
        min_attendance, eligible_departments, eligible_programs, eligible_categories,
        documents
    } = req.body;

    if (!scheme_code || !scheme_name || !max_amount) {
        return res.status(400).json({ success: false, error: 'Missing mandatory scheme fields' });
    }

    const sql = `
        INSERT INTO scholarship_schemes (
            scheme_code, scheme_name, description, category_target,
            min_amount, max_amount, start_date, end_date, academic_year,
            status, renewal_allowed, min_cgpa, min_percentage, max_income,
            min_attendance, eligible_departments, eligible_programs, eligible_categories
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const result = dbManager.run(sql, [
        scheme_code, scheme_name, description || '', category_target || 'All',
        parseFloat(min_amount) || 10000, parseFloat(max_amount) || 50000,
        start_date || '2026-07-01', end_date || '2026-12-31', academic_year || '2026-27',
        status || 'Active', renewal_allowed ? 1 : 0, parseFloat(min_cgpa) || 6.0,
        parseFloat(min_percentage) || 60.0, parseFloat(max_income) || 500000,
        parseFloat(min_attendance) || 75.0, eligible_departments || 'All',
        eligible_programs || 'All', eligible_categories || 'All'
    ]);

    if (!result.success) return res.status(400).json(result);

    // If documents were specified, insert them
    if (Array.isArray(documents) && documents.length > 0) {
        const schemeQuery = dbManager.query('SELECT scheme_id FROM scholarship_schemes WHERE scheme_code = ?', [scheme_code]);
        if (schemeQuery.data && schemeQuery.data.length > 0) {
            const newSchemeId = schemeQuery.data[0].scheme_id;
            for (const docName of documents) {
                dbManager.run('INSERT INTO scheme_documents (scheme_id, document_name, is_mandatory) VALUES (?, ?, 1)', [newSchemeId, docName]);
            }
        }
    }

    res.json({ success: true, message: 'Scholarship scheme added successfully' });
});

app.put('/api/schemes/:id/status', (req, res) => {
    const schemeId = parseInt(req.params.id);
    const { status } = req.body;
    if (!['Active', 'Inactive', 'Closed'].includes(status)) {
        return res.status(400).json({ success: false, error: 'Invalid status' });
    }

    const result = dbManager.run('UPDATE scholarship_schemes SET status = ? WHERE scheme_id = ?', [status, schemeId]);
    res.json(result);
});

// ----------------------------------------------------------------------------
// API: ELIGIBILITY CHECKING ENGINE
// ----------------------------------------------------------------------------
app.post('/api/eligibility/check', (req, res) => {
    const { studentId, schemeId } = req.body;

    const studentRes = dbManager.query('SELECT * FROM students WHERE student_id = ?', [studentId]);
    const schemeRes = dbManager.query('SELECT * FROM scholarship_schemes WHERE scheme_id = ?', [schemeId]);

    if (!studentRes.data?.length || !schemeRes.data?.length) {
        return res.status(404).json({ success: false, error: 'Student or scheme not found' });
    }

    const student = studentRes.data[0];
    const scheme = schemeRes.data[0];

    const checks = [
        {
            criterion: 'Minimum CGPA Requirement',
            required: `>= ${scheme.min_cgpa}`,
            actual: `${student.cgpa}`,
            satisfied: student.cgpa >= scheme.min_cgpa,
            mandatory: true
        },
        {
            criterion: 'Academic Percentage',
            required: `>= ${scheme.min_percentage}%`,
            actual: `${student.academic_percentage}%`,
            satisfied: student.academic_percentage >= scheme.min_percentage,
            mandatory: true
        },
        {
            criterion: 'Maximum Family Annual Income',
            required: `<= ₹${scheme.max_income.toLocaleString('en-IN')}`,
            actual: `₹${student.annual_income.toLocaleString('en-IN')}`,
            satisfied: student.annual_income <= scheme.max_income,
            mandatory: true
        },
        {
            criterion: 'Minimum Attendance Requirement',
            required: `>= ${scheme.min_attendance}%`,
            actual: `${student.attendance_pct}%`,
            satisfied: student.attendance_pct >= scheme.min_attendance,
            mandatory: true
        },
        {
            criterion: 'Department Eligibility',
            required: scheme.eligible_departments,
            actual: student.department,
            satisfied: scheme.eligible_departments === 'All' || scheme.eligible_departments.includes(student.department),
            mandatory: true
        },
        {
            criterion: 'Program Eligibility',
            required: scheme.eligible_programs,
            actual: student.program,
            satisfied: scheme.eligible_programs === 'All' || scheme.eligible_programs.includes(student.program),
            mandatory: true
        },
        {
            criterion: 'Category Target',
            required: scheme.eligible_categories,
            actual: student.category,
            satisfied: scheme.eligible_categories === 'All' || scheme.eligible_categories.includes(student.category),
            mandatory: true
        }
    ];

    if (scheme.category_target === 'Female Students') {
        checks.push({
            criterion: 'Gender Eligibility (Women in STEM)',
            required: 'Female',
            actual: student.gender,
            satisfied: student.gender === 'Female',
            mandatory: true
        });
    }

    // Check if student has already applied for this specific scheme in 2026-27
    const existingApp = dbManager.query(
        'SELECT application_no FROM applications WHERE student_id = ? AND scheme_id = ? AND academic_year = ?',
        [studentId, schemeId, '2026-27']
    );
    const hasExisting = existingApp.data && existingApp.data.length > 0;
    checks.push({
        criterion: 'Prior Application Check (Session 2026-27)',
        required: 'No prior application for this scheme',
        actual: hasExisting ? `Already applied (${existingApp.data[0].application_no})` : 'First-time applicant (Eligible)',
        satisfied: !hasExisting,
        mandatory: true
    });

    const isEligible = checks.every(c => c.satisfied);
    const failedCount = checks.filter(c => !c.satisfied).length;
    const passedCount = checks.filter(c => c.satisfied).length;

    res.json({
        success: true,
        isEligible,
        passedCount,
        failedCount,
        checks,
        student,
        scheme
    });
});

// ----------------------------------------------------------------------------
// API: APPLICATIONS MODULE & MULTI-STEP WORKFLOW
// ----------------------------------------------------------------------------
app.get('/api/applications', (req, res) => {
    const { status, schemeId, department, studentId, search } = req.query;
    let sql = `
        SELECT 
            a.*,
            s.roll_number,
            (s.first_name || ' ' || s.last_name) AS student_name,
            s.department,
            s.program,
            s.cgpa,
            s.annual_income,
            s.category,
            sc.scheme_code,
            sc.scheme_name,
            sc.max_amount,
            COALESCE(sn.sanction_no, '') AS sanction_no,
            COALESCE(sn.sanction_amount, 0) AS sanction_amount,
            COALESCE(d.disbursement_no, '') AS disbursement_no,
            COALESCE(d.payment_status, '') AS disbursement_status,
            COALESCE(d.amount, 0) AS disbursed_amount
        FROM applications a
        JOIN students s ON a.student_id = s.student_id
        JOIN scholarship_schemes sc ON a.scheme_id = sc.scheme_id
        LEFT JOIN sanctions sn ON a.application_id = sn.application_id
        LEFT JOIN disbursements d ON sn.sanction_id = d.sanction_id
        WHERE 1=1
    `;
    const params = [];

    if (status && status !== 'All') {
        sql += ` AND a.status = ?`;
        params.push(status);
    }
    if (schemeId && schemeId !== 'All') {
        sql += ` AND a.scheme_id = ?`;
        params.push(parseInt(schemeId));
    }
    if (department && department !== 'All') {
        sql += ` AND s.department = ?`;
        params.push(department);
    }
    if (studentId) {
        sql += ` AND a.student_id = ?`;
        params.push(parseInt(studentId));
    }
    if (search) {
        sql += ` AND (a.application_no LIKE ? OR s.first_name LIKE ? OR s.last_name LIKE ? OR s.roll_number LIKE ? OR sc.scheme_name LIKE ?)`;
        const q = `%${search}%`;
        params.push(q, q, q, q, q);
    }

    sql += ` ORDER BY a.application_id DESC`;
    const result = dbManager.query(sql, params);
    res.json(result);
});

app.get('/api/applications/:id', (req, res) => {
    const appId = parseInt(req.params.id);
    const appQuery = dbManager.query(`
        SELECT 
            a.*,
            s.roll_number,
            s.first_name,
            s.last_name,
            (s.first_name || ' ' || s.last_name) AS student_name,
            s.email,
            s.phone,
            s.dob,
            s.gender,
            s.department,
            s.program,
            s.semester,
            s.category,
            s.cgpa,
            s.academic_percentage,
            s.annual_income,
            s.attendance_pct,
            s.address,
            sc.scheme_code,
            sc.scheme_name,
            sc.description AS scheme_description,
            sc.max_amount,
            sc.min_cgpa,
            sc.max_income,
            b.bank_name,
            b.account_number,
            b.ifsc_code,
            b.branch_name,
            b.is_verified AS bank_verified
        FROM applications a
        JOIN students s ON a.student_id = s.student_id
        JOIN scholarship_schemes sc ON a.scheme_id = sc.scheme_id
        LEFT JOIN bank_details b ON s.student_id = b.student_id
        WHERE a.application_id = ?
    `, [appId]);

    if (!appQuery.data || appQuery.data.length === 0) {
        return res.status(404).json({ success: false, error: 'Application not found' });
    }

    const application = appQuery.data[0];
    const docs = dbManager.query('SELECT * FROM application_documents WHERE application_id = ?', [appId]).data;
    const verifications = dbManager.query(`
        SELECT v.*, u.full_name AS verifier_name
        FROM verifications v
        LEFT JOIN users u ON v.verifier_id = u.user_id
        WHERE v.application_id = ?
        ORDER BY v.verification_date DESC
    `, [appId]).data;
    const approvals = dbManager.query(`
        SELECT ap.*, ast.stage_name, u.full_name AS officer_name
        FROM approvals ap
        JOIN approval_stages ast ON ap.stage_id = ast.stage_id
        LEFT JOIN users u ON ap.officer_id = u.user_id
        WHERE ap.application_id = ?
        ORDER BY ap.action_date ASC
    `, [appId]).data;
    const sanction = dbManager.query(`
        SELECT sn.*, u.full_name AS officer_name
        FROM sanctions sn
        LEFT JOIN users u ON sn.approving_officer_id = u.user_id
        WHERE sn.application_id = ?
    `, [appId]).data[0] || null;
    const disbursement = dbManager.query(`
        SELECT d.*, u.full_name AS officer_name
        FROM disbursements d
        LEFT JOIN users u ON d.processed_by = u.user_id
        WHERE d.application_id = ?
    `, [appId]).data[0] || null;

    res.json({
        success: true,
        application,
        documents: docs,
        verifications,
        approvals,
        sanction,
        disbursement
    });
});

// SUBMIT NEW APPLICATION (TRANSACTION-AWARE WITH CONSTRAINTS)
app.post('/api/applications', (req, res) => {
    const { student_id, scheme_id, academic_year, documents, remarks } = req.body;

    if (!student_id || !scheme_id) {
        return res.status(400).json({ success: false, error: 'Student ID and Scheme ID are required' });
    }

    const year = academic_year || '2026-27';

    // 1. Check Business Rule: UNIQUE (student_id, scheme_id, academic_year)
    const existing = dbManager.query(
        'SELECT application_id, application_no FROM applications WHERE student_id = ? AND scheme_id = ? AND academic_year = ?',
        [student_id, scheme_id, year]
    );

    if (existing.data && existing.data.length > 0) {
        return res.status(400).json({
            success: false,
            error: `Duplicate Application Prevented: Student has already applied for this scheme in ${year} (App No: ${existing.data[0].application_no}).`
        });
    }

    // 2. Perform Automated Eligibility Check
    const student = dbManager.query('SELECT * FROM students WHERE student_id = ?', [student_id]).data[0];
    const scheme = dbManager.query('SELECT * FROM scholarship_schemes WHERE scheme_id = ?', [scheme_id]).data[0];

    if (!student || !scheme) {
        return res.status(404).json({ success: false, error: 'Student or scheme not found' });
    }

    if (student.cgpa < scheme.min_cgpa) {
        return res.status(400).json({
            success: false,
            error: `Eligibility Failed: Student CGPA (${student.cgpa}) is lower than minimum required (${scheme.min_cgpa}).`
        });
    }
    if (student.annual_income > scheme.max_income) {
        return res.status(400).json({
            success: false,
            error: `Eligibility Failed: Family income (₹${student.annual_income}) exceeds scheme maximum limit (₹${scheme.max_income}).`
        });
    }

    // 3. Generate New Application ID
    const countQuery = dbManager.query('SELECT COUNT(*) AS total FROM applications');
    const nextNum = (countQuery.data[0].total + 101);
    const appNo = `APP-2026-00${nextNum}`;

    // 4. Run Transaction: Insert Application + Documents + Audit Log
    const statements = [
        {
            sql: `INSERT INTO applications (application_no, student_id, scheme_id, academic_year, current_stage, status, remarks) VALUES (?, ?, ?, ?, 'Submitted', 'Submitted', ?)`,
            params: [appNo, student_id, scheme_id, year, remarks || 'Student self-submitted via online portal']
        }
    ];

    const txResult = dbManager.run(
        `INSERT INTO applications (application_no, student_id, scheme_id, academic_year, current_stage, status, remarks) VALUES (?, ?, ?, ?, 'Submitted', 'Submitted', ?)`,
        [appNo, student_id, scheme_id, year, remarks || 'Student self-submitted via online portal']
    );

    if (!txResult.success) {
        return res.status(500).json({ success: false, error: `Transaction failed: ${txResult.error}` });
    }

    const createdApp = dbManager.query('SELECT application_id FROM applications WHERE application_no = ?', [appNo]).data[0];
    const newAppId = createdApp.application_id;

    // Attach documents
    if (Array.isArray(documents) && documents.length > 0) {
        for (const doc of documents) {
            dbManager.run(
                `INSERT INTO application_documents (application_id, document_name, file_name, file_size_kb, status, remarks) VALUES (?, ?, ?, ?, 'Pending', 'Uploaded during submission')`,
                [newAppId, doc.document_name, doc.file_name || `${doc.document_name.replace(/\s+/g, '_')}.pdf`, 280]
            );
        }
    } else {
        // Automatically link scheme mandatory documents
        const schemeDocs = dbManager.query('SELECT document_name FROM scheme_documents WHERE scheme_id = ?', [scheme_id]).data;
        for (const sd of schemeDocs) {
            dbManager.run(
                `INSERT INTO application_documents (application_id, document_name, file_name, file_size_kb, status, remarks) VALUES (?, ?, ?, ?, 'Pending', 'System registered mandatory document')`,
                [newAppId, sd.document_name, `${sd.document_name.replace(/[^a-zA-Z0-9]/g, '_')}_Upload.pdf`, 320]
            );
        }
    }

    // Log audit trail
    dbManager.run(
        `INSERT INTO audit_logs (action_type, entity_name, entity_id, user_id, details) VALUES ('APPLICATION_SUBMITTED', 'applications', ?, 1, ?)`,
        [newAppId, `Application ${appNo} submitted by student ID ${student_id}`]
    );

    res.json({
        success: true,
        message: 'Application registered successfully!',
        application_id: newAppId,
        application_no: appNo
    });
});

// ----------------------------------------------------------------------------
// API: DOCUMENT VERIFICATION MODULE (VERIFIER ROLE)
// ----------------------------------------------------------------------------
app.post('/api/applications/:id/verify', (req, res) => {
    const appId = parseInt(req.params.id);
    const { status, remarks, verifier_id, document_statuses } = req.body;
    // status: 'Verified' | 'Rejected' | 'Resubmission Required'

    if (!['Verified', 'Rejected', 'Resubmission Required'].includes(status)) {
        return res.status(400).json({ success: false, error: 'Invalid verification status' });
    }

    const appRecord = dbManager.query('SELECT * FROM applications WHERE application_id = ?', [appId]).data[0];
    if (!appRecord) return res.status(404).json({ success: false, error: 'Application not found' });

    // Update document statuses if passed
    if (document_statuses && typeof document_statuses === 'object') {
        for (const [docId, docStatus] of Object.entries(document_statuses)) {
            dbManager.run(
                'UPDATE application_documents SET status = ?, verified_by = ?, verification_date = CURRENT_TIMESTAMP WHERE app_doc_id = ?',
                [docStatus, verifier_id || 2, parseInt(docId)]
            );
        }
    } else if (status === 'Verified') {
        // Mark all docs as verified
        dbManager.run(
            "UPDATE application_documents SET status = 'Verified', verified_by = ?, verification_date = CURRENT_TIMESTAMP WHERE application_id = ?",
            [verifier_id || 2, appId]
        );
    }

    // Insert into verifications table
    dbManager.run(
        `INSERT INTO verifications (application_id, verifier_id, verification_date, status, eligibility_satisfied, remarks) VALUES (?, ?, CURRENT_TIMESTAMP, ?, ?, ?)`,
        [appId, verifier_id || 2, status, status === 'Verified' ? 1 : 0, remarks || 'Document verification executed']
    );

    // Update application stage & status
    let nextStage = 'Department Approval';
    let appStatus = 'Verified';

    if (status === 'Rejected') {
        nextStage = 'Rejected';
        appStatus = 'Rejected';
        dbManager.run(
            'UPDATE applications SET current_stage = ?, status = ?, rejection_reason = ?, remarks = ?, updated_at = CURRENT_TIMESTAMP WHERE application_id = ?',
            [nextStage, appStatus, remarks || 'Verification failed: invalid credentials', remarks, appId]
        );
    } else if (status === 'Resubmission Required') {
        nextStage = 'Document Verification';
        appStatus = 'Under Verification';
        dbManager.run(
            'UPDATE applications SET current_stage = ?, status = ?, remarks = ?, updated_at = CURRENT_TIMESTAMP WHERE application_id = ?',
            [nextStage, appStatus, `Resubmission required: ${remarks}`, appId]
        );
    } else {
        dbManager.run(
            'UPDATE applications SET current_stage = ?, status = ?, remarks = ?, updated_at = CURRENT_TIMESTAMP WHERE application_id = ?',
            [nextStage, appStatus, remarks || 'Documents verified and cleared for Department Review', appId]
        );
    }

    // Audit log
    dbManager.run(
        `INSERT INTO audit_logs (action_type, entity_name, entity_id, user_id, details) VALUES ('DOCUMENTS_VERIFIED', 'applications', ?, ?, ?)`,
        [appId, verifier_id || 2, `Verification completed with status: ${status}`]
    );

    res.json({ success: true, message: `Application ${status.toLowerCase()} successfully`, current_stage: nextStage, status: appStatus });
});

// ----------------------------------------------------------------------------
// API: APPROVALS WORKFLOW (APPROVING OFFICER / DEAN ROLE)
// ----------------------------------------------------------------------------
app.post('/api/applications/:id/approve', (req, res) => {
    const appId = parseInt(req.params.id);
    const { action, remarks, officer_id, stage_id } = req.body;
    // action: 'Recommended' | 'Approved' | 'Rejected'

    if (!['Recommended', 'Approved', 'Rejected'].includes(action)) {
        return res.status(400).json({ success: false, error: 'Invalid approval action' });
    }

    const appRecord = dbManager.query('SELECT * FROM applications WHERE application_id = ?', [appId]).data[0];
    if (!appRecord) return res.status(404).json({ success: false, error: 'Application not found' });

    // Business rule: Mandatory document verification before approval
    if (appRecord.status === 'Submitted' || appRecord.status === 'Under Verification') {
        return res.status(400).json({
            success: false,
            error: 'Workflow Constraint: Documents must be verified before approval can be granted.'
        });
    }

    // Insert approval audit record
    dbManager.run(
        `INSERT INTO approvals (application_id, stage_id, officer_id, action, action_date, remarks) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, ?)`,
        [appId, stage_id || 5, officer_id || 3, action, remarks || 'Academic assessment completed']
    );

    if (action === 'Rejected') {
        dbManager.run(
            "UPDATE applications SET current_stage = 'Rejected', status = 'Rejected', rejection_reason = ?, updated_at = CURRENT_TIMESTAMP WHERE application_id = ?",
            [remarks || 'Rejected by Approving Authority', appId]
        );
    } else if (action === 'Approved') {
        dbManager.run(
            "UPDATE applications SET current_stage = 'Final Approval', status = 'Approved', remarks = ?, updated_at = CURRENT_TIMESTAMP WHERE application_id = ?",
            [remarks || 'Approved by Dean / Competent Authority for Sanction Order', appId]
        );
    } else if (action === 'Recommended') {
        dbManager.run(
            "UPDATE applications SET current_stage = 'Department Approval', status = 'Verified', remarks = ?, updated_at = CURRENT_TIMESTAMP WHERE application_id = ?",
            [remarks || 'Department recommendation endorsed', appId]
        );
    }

    // Audit log
    dbManager.run(
        `INSERT INTO audit_logs (action_type, entity_name, entity_id, user_id, details) VALUES ('APPROVAL_STAGE', 'applications', ?, ?, ?)`,
        [appId, officer_id || 3, `Approval action: ${action}`]
    );

    res.json({ success: true, message: `Application ${action.toLowerCase()} successfully` });
});

// ----------------------------------------------------------------------------
// API: SANCTION MODULE
// ----------------------------------------------------------------------------
app.get('/api/sanctions', (req, res) => {
    const sql = `
        SELECT 
            sn.*,
            a.application_no,
            s.roll_number,
            (s.first_name || ' ' || s.last_name) AS student_name,
            s.department,
            sc.scheme_code,
            sc.scheme_name,
            sc.max_amount AS scheme_max_limit,
            u.full_name AS approving_officer_name,
            COALESCE(d.amount, 0) AS disbursed_amount,
            COALESCE(d.payment_status, 'Unpaid') AS disbursement_status
        FROM sanctions sn
        JOIN applications a ON sn.application_id = a.application_id
        JOIN students s ON sn.student_id = s.student_id
        JOIN scholarship_schemes sc ON sn.scheme_id = sc.scheme_id
        LEFT JOIN users u ON sn.approving_officer_id = u.user_id
        LEFT JOIN disbursements d ON sn.sanction_id = d.sanction_id
        ORDER BY sn.sanction_id DESC
    `;
    const result = dbManager.query(sql);
    res.json(result);
});

app.post('/api/sanctions', (req, res) => {
    const { application_id, sanction_amount, approving_officer_id, remarks } = req.body;

    const appQuery = dbManager.query(`
        SELECT a.*, sc.max_amount, sc.scheme_id, s.student_id
        FROM applications a
        JOIN scholarship_schemes sc ON a.scheme_id = sc.scheme_id
        JOIN students s ON a.student_id = s.student_id
        WHERE a.application_id = ?
    `, [application_id]);

    if (!appQuery.data || appQuery.data.length === 0) {
        return res.status(404).json({ success: false, error: 'Application not found' });
    }

    const appRecord = appQuery.data[0];

    // Business Rule Check: Application must be approved
    if (appRecord.status !== 'Approved' && appRecord.status !== 'Verified') {
        return res.status(400).json({ success: false, error: 'Sanction can only be issued for approved applications' });
    }

    // Business Rule Check: Sanction amount <= Maximum amount allowed by scheme
    const amount = parseFloat(sanction_amount);
    if (isNaN(amount) || amount <= 0) {
        return res.status(400).json({ success: false, error: 'Sanction amount must be a positive number' });
    }
    if (amount > appRecord.max_amount) {
        return res.status(400).json({
            success: false,
            error: `Business Rule Violation: Sanctioned amount (₹${amount.toLocaleString('en-IN')}) cannot exceed maximum allowed by scheme (₹${appRecord.max_amount.toLocaleString('en-IN')}).`
        });
    }

    // Generate Sanction Number
    const countRes = dbManager.query('SELECT COUNT(*) AS total FROM sanctions');
    const sancNo = `SANC-2026-00${countRes.data[0].total + 85}`;
    const today = new Date().toISOString().split('T')[0];

    const result = dbManager.run(
        `INSERT INTO sanctions (
            sanction_no, application_id, student_id, scheme_id, approved_amount,
            sanction_amount, sanction_date, sanction_status, approving_officer_id, remarks
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 'Sanctioned', ?, ?)`,
        [
            sancNo, application_id, appRecord.student_id, appRecord.scheme_id,
            amount, amount, today, approving_officer_id || 3, remarks || 'Sanction order confirmed'
        ]
    );

    if (!result.success) return res.status(500).json(result);

    // Update application stage & status to Sanctioned
    dbManager.run(
        "UPDATE applications SET current_stage = 'Sanctioned', status = 'Sanctioned', remarks = ?, updated_at = CURRENT_TIMESTAMP WHERE application_id = ?",
        [`Sanction order ${sancNo} issued for ₹${amount.toLocaleString('en-IN')}`, application_id]
    );

    // Audit log
    dbManager.run(
        `INSERT INTO audit_logs (action_type, entity_name, entity_id, user_id, details) VALUES ('SANCTION_ISSUED', 'sanctions', last_insert_rowid(), ?, ?)`,
        [approving_officer_id || 3, `Sanction ${sancNo} generated for ₹${amount}`]
    );

    res.json({ success: true, message: 'Sanction order created successfully', sanction_no: sancNo });
});

// ----------------------------------------------------------------------------
// API: BANK DETAILS MODULE
// ----------------------------------------------------------------------------
app.get('/api/bank-details', (req, res) => {
    const sql = `
        SELECT 
            b.*,
            s.roll_number,
            (s.first_name || ' ' || s.last_name) AS student_name,
            s.department,
            s.email,
            u.full_name AS verified_by_name
        FROM bank_details b
        JOIN students s ON b.student_id = s.student_id
        LEFT JOIN users u ON b.verified_by = u.user_id
        ORDER BY b.bank_detail_id DESC
    `;
    const result = dbManager.query(sql);
    res.json(result);
});

app.post('/api/bank-details', (req, res) => {
    const { student_id, account_holder_name, bank_name, account_number, ifsc_code, branch_name } = req.body;

    if (!student_id || !account_holder_name || !bank_name || !account_number || !ifsc_code) {
        return res.status(400).json({ success: false, error: 'All bank fields are required' });
    }

    // Check if bank detail already exists for student
    const existing = dbManager.query('SELECT bank_detail_id FROM bank_details WHERE student_id = ?', [student_id]).data;

    let result;
    if (existing.length > 0) {
        result = dbManager.run(
            `UPDATE bank_details SET account_holder_name = ?, bank_name = ?, account_number = ?, ifsc_code = ?, branch_name = ?, is_verified = 0, verified_by = NULL, verification_date = NULL WHERE student_id = ?`,
            [account_holder_name, bank_name, account_number, ifsc_code.toUpperCase(), branch_name || 'Main Branch', student_id]
        );
    } else {
        result = dbManager.run(
            `INSERT INTO bank_details (student_id, account_holder_name, bank_name, account_number, ifsc_code, branch_name, is_verified) VALUES (?, ?, ?, ?, ?, ?, 0)`,
            [student_id, account_holder_name, bank_name, account_number, ifsc_code.toUpperCase(), branch_name || 'Main Branch']
        );
    }

    res.json(result);
});

app.put('/api/bank-details/:id/verify', (req, res) => {
    const bankId = parseInt(req.params.id);
    const { is_verified, verified_by } = req.body;

    const result = dbManager.run(
        `UPDATE bank_details SET is_verified = ?, verified_by = ?, verification_date = CURRENT_TIMESTAMP WHERE bank_detail_id = ?`,
        [is_verified ? 1 : 0, verified_by || 4, bankId]
    );

    res.json(result);
});

// ----------------------------------------------------------------------------
// API: DISBURSEMENTS MODULE (FINANCE OFFICER ROLE)
// ----------------------------------------------------------------------------
app.get('/api/disbursements', (req, res) => {
    const sql = `
        SELECT 
            d.*,
            sn.sanction_no,
            sn.sanction_amount,
            a.application_no,
            s.roll_number,
            (s.first_name || ' ' || s.last_name) AS student_name,
            s.department,
            sc.scheme_name,
            b.bank_name,
            b.account_number,
            b.ifsc_code,
            u.full_name AS processed_by_name
        FROM disbursements d
        JOIN sanctions sn ON d.sanction_id = sn.sanction_id
        JOIN applications a ON d.application_id = a.application_id
        JOIN students s ON d.student_id = s.student_id
        JOIN scholarship_schemes sc ON sn.scheme_id = sc.scheme_id
        JOIN bank_details b ON d.bank_detail_id = b.bank_detail_id
        LEFT JOIN users u ON d.processed_by = u.user_id
        ORDER BY d.disbursement_id DESC
    `;
    const result = dbManager.query(sql);
    res.json(result);
});

app.post('/api/disbursements', (req, res) => {
    const { sanction_id, amount, payment_mode, remarks, processed_by } = req.body;

    // 1. Fetch Sanction and linked data
    const sancQuery = dbManager.query(`
        SELECT sn.*, a.student_id, a.application_id
        FROM sanctions sn
        JOIN applications a ON sn.application_id = a.application_id
        WHERE sn.sanction_id = ?
    `, [sanction_id]);

    if (!sancQuery.data || sancQuery.data.length === 0) {
        return res.status(404).json({ success: false, error: 'Sanction record not found' });
    }

    const sanction = sancQuery.data[0];

    // 2. Fetch Bank Details & Verify
    const bankQuery = dbManager.query('SELECT * FROM bank_details WHERE student_id = ?', [sanction.student_id]);
    if (!bankQuery.data || bankQuery.data.length === 0) {
        return res.status(400).json({ success: false, error: 'Business Rule Violation: No bank account found for student.' });
    }
    const bank = bankQuery.data[0];

    if (!bank.is_verified) {
        return res.status(400).json({
            success: false,
            error: 'Business Rule Violation: Bank account must be verified by Finance Section before disbursement can occur.'
        });
    }

    // 3. Business Rule: Total amount disbursed must never exceed the sanctioned amount
    const prevDisbQuery = dbManager.query(
        "SELECT COALESCE(SUM(amount), 0) AS total_paid FROM disbursements WHERE sanction_id = ? AND payment_status != 'Failed'",
        [sanction_id]
    );
    const previouslyPaid = prevDisbQuery.data[0].total_paid;
    const requestedAmount = parseFloat(amount);

    if (isNaN(requestedAmount) || requestedAmount <= 0) {
        return res.status(400).json({ success: false, error: 'Disbursement amount must be greater than zero' });
    }

    if (previouslyPaid + requestedAmount > sanction.sanction_amount) {
        return res.status(400).json({
            success: false,
            error: `Business Rule Violation: Cumulative disbursement (₹${previouslyPaid + requestedAmount}) cannot exceed sanctioned limit (₹${sanction.sanction_amount}).`
        });
    }

    // 4. Generate Disbursement No & UTR Transaction Ref
    const countQuery = dbManager.query('SELECT COUNT(*) AS total FROM disbursements');
    const nextDisbNum = countQuery.data[0].total + 403;
    const disbNo = `DISB-2026-00${nextDisbNum}`;
    const txnRef = `${payment_mode || 'PFMS'}2026${Date.now().toString().slice(-9)}`;
    const today = new Date().toISOString().split('T')[0];

    // 5. Execute Transaction
    const result = dbManager.run(
        `INSERT INTO disbursements (
            disbursement_no, sanction_id, application_id, student_id, bank_detail_id,
            amount, payment_mode, transaction_ref, payment_date, payment_status, processed_by, remarks
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Successful', ?, ?)`,
        [
            disbNo, sanction_id, sanction.application_id, sanction.student_id, bank.bank_detail_id,
            requestedAmount, payment_mode || 'PFMS', txnRef, today, processed_by || 4, remarks || 'DBT Payment Processed'
        ]
    );

    if (!result.success) return res.status(500).json(result);

    // Update Sanction & Application Status
    const isFullyPaid = (previouslyPaid + requestedAmount) >= sanction.sanction_amount;
    const sanctionStatus = isFullyPaid ? 'Fully Disbursed' : 'Partially Disbursed';

    dbManager.run('UPDATE sanctions SET sanction_status = ? WHERE sanction_id = ?', [sanctionStatus, sanction_id]);
    dbManager.run("UPDATE applications SET current_stage = 'Disbursed', status = 'Disbursed', updated_at = CURRENT_TIMESTAMP WHERE application_id = ?", [sanction.application_id]);

    // Audit Log
    dbManager.run(
        `INSERT INTO audit_logs (action_type, entity_name, entity_id, user_id, details) VALUES ('DISBURSEMENT_EXECUTED', 'disbursements', last_insert_rowid(), ?, ?)`,
        [processed_by || 4, `Disbursement ${disbNo} of ₹${requestedAmount} processed via ${payment_mode} (UTR: ${txnRef})`]
    );

    res.json({
        success: true,
        message: 'Disbursement processed successfully via DBT gateway',
        disbursement_no: disbNo,
        transaction_ref: txnRef,
        amount: requestedAmount
    });
});

// ----------------------------------------------------------------------------
// API: RENEWALS MODULE
// ----------------------------------------------------------------------------
app.get('/api/renewals', (req, res) => {
    const sql = `
        SELECT 
            rn.*,
            s.roll_number,
            (s.first_name || ' ' || s.last_name) AS student_name,
            s.department,
            s.program,
            sc.scheme_code,
            sc.scheme_name,
            sc.max_amount,
            prev_a.application_no AS previous_application_no,
            prev_sn.sanction_no AS previous_sanction_no,
            prev_sn.sanction_amount AS previous_sanction_amount
        FROM renewals rn
        JOIN students s ON rn.student_id = s.student_id
        JOIN scholarship_schemes sc ON rn.scheme_id = sc.scheme_id
        JOIN applications prev_a ON rn.previous_application_id = prev_a.application_id
        JOIN sanctions prev_sn ON rn.previous_sanction_id = prev_sn.sanction_id
        ORDER BY rn.renewal_id DESC
    `;
    const result = dbManager.query(sql);
    res.json(result);
});

app.post('/api/renewals', (req, res) => {
    const { previous_application_id, current_cgpa, current_attendance, remarks } = req.body;

    const prevApp = dbManager.query(`
        SELECT a.*, sn.sanction_id, sc.min_cgpa, sc.min_attendance
        FROM applications a
        JOIN sanctions sn ON a.application_id = sn.application_id
        JOIN scholarship_schemes sc ON a.scheme_id = sc.scheme_id
        WHERE a.application_id = ?
    `, [previous_application_id]);

    if (!prevApp.data || prevApp.data.length === 0) {
        return res.status(404).json({ success: false, error: 'Valid previous sanctioned application required for renewal' });
    }

    const appRecord = prevApp.data[0];
    const cgpa = parseFloat(current_cgpa);
    const attendance = parseFloat(current_attendance);

    const today = new Date().toISOString().split('T')[0];

    const result = dbManager.run(
        `INSERT INTO renewals (
            previous_application_id, previous_sanction_id, student_id, scheme_id,
            academic_year, current_cgpa, current_attendance, renewal_status, application_date, remarks
        ) VALUES (?, ?, ?, ?, '2026-27', ?, ?, 'Submitted', ?, ?)`,
        [previous_application_id, appRecord.sanction_id, appRecord.student_id, appRecord.scheme_id, cgpa, attendance, today, remarks || 'Annual Renewal Submission']
    );

    res.json(result);
});

app.put('/api/renewals/:id/status', (req, res) => {
    const renewalId = parseInt(req.params.id);
    const { renewal_status, remarks } = req.body;

    const today = new Date().toISOString().split('T')[0];
    const result = dbManager.run(
        `UPDATE renewals SET renewal_status = ?, approved_date = ?, remarks = ? WHERE renewal_id = ?`,
        [renewal_status, renewal_status === 'Approved' ? today : null, remarks || `Status changed to ${renewal_status}`, renewalId]
    );

    res.json(result);
});

// ----------------------------------------------------------------------------
// API: REPORTS MODULE (MULTI-FILTER & EXPORT SUPPORT)
// ----------------------------------------------------------------------------
app.get('/api/reports', (req, res) => {
    const { reportType, schemeId, department, program, status, academicYear } = req.query;

    let sql = '';
    const params = [];

    switch (reportType) {
        case 'disbursements':
            sql = `SELECT * FROM Disbursement_Report_View WHERE 1=1`;
            break;
        case 'pending':
            sql = `SELECT * FROM Pending_Applications_View WHERE 1=1`;
            break;
        case 'approved':
            sql = `SELECT * FROM Approved_Applications_View WHERE 1=1`;
            break;
        case 'schemes_summary':
            sql = `SELECT * FROM Scheme_Statistics_View WHERE 1=1`;
            break;
        default:
            sql = `
                SELECT 
                    a.application_no,
                    a.academic_year,
                    a.submission_date,
                    a.status,
                    a.current_stage,
                    s.roll_number,
                    (s.first_name || ' ' || s.last_name) AS student_name,
                    s.department,
                    s.program,
                    s.category,
                    s.cgpa,
                    s.annual_income,
                    sc.scheme_code,
                    sc.scheme_name,
                    COALESCE(sn.sanction_amount, 0) AS sanction_amount,
                    COALESCE(d.amount, 0) AS disbursed_amount,
                    COALESCE(d.payment_status, 'None') AS payment_status
                FROM applications a
                JOIN students s ON a.student_id = s.student_id
                JOIN scholarship_schemes sc ON a.scheme_id = sc.scheme_id
                LEFT JOIN sanctions sn ON a.application_id = sn.application_id
                LEFT JOIN disbursements d ON sn.sanction_id = d.sanction_id
                WHERE 1=1
            `;
            break;
    }

    if (department && department !== 'All') {
        sql += ` AND department = ?`;
        params.push(department);
    }
    if (status && status !== 'All') {
        sql += ` AND status = ?`;
        params.push(status);
    }
    if (academicYear && academicYear !== 'All') {
        sql += ` AND academic_year = ?`;
        params.push(academicYear);
    }

    const result = dbManager.query(sql, params);
    res.json(result);
});

// ----------------------------------------------------------------------------
// API: DBMS EXPLORER & SQL STUDIO
// ----------------------------------------------------------------------------
app.get('/api/sql/presets', (req, res) => {
    res.json({ success: true, presets: predefinedQueries });
});

app.post('/api/sql/execute', (req, res) => {
    const { sql } = req.body;
    if (!sql || typeof sql !== 'string') {
        return res.status(400).json({ success: false, error: 'SQL query string required' });
    }

    const result = dbManager.executeRawSql(sql);
    res.json(result);
});

app.get('/api/sql/tables', (req, res) => {
    try {
        const tableNamesQuery = dbManager.query(`
            SELECT name, type FROM sqlite_master 
            WHERE type IN ('table', 'view') AND name NOT LIKE 'sqlite_%'
            ORDER BY type, name ASC
        `);

        const tables = [];
        for (const t of tableNamesQuery.data) {
            const count = t.type === 'table' ? dbManager.query(`SELECT COUNT(*) AS total FROM ${t.name}`).data[0].total : 'VIEW';
            const cols = dbManager.query(`PRAGMA table_info(${t.name})`).data;
            tables.push({
                name: t.name,
                type: t.type,
                rowCount: count,
                columns: cols
            });
        }

        res.json({ success: true, tables });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.get('/api/sql/download-mysql', (req, res) => {
    const mysqlPath = path.join(__dirname, 'database', 'mysql_schema.sql');
    res.download(mysqlPath, 'university_scholarship_db_schema.sql');
});

// ----------------------------------------------------------------------------
// API: AUDIT LOGS & SYSTEM USERS
// ----------------------------------------------------------------------------
app.get('/api/users', (req, res) => {
    const sql = `
        SELECT u.user_id, u.username, u.full_name, u.email, u.phone, u.status, u.created_at, r.role_code, r.role_name
        FROM users u
        JOIN roles r ON u.role_id = r.role_id
        ORDER BY u.user_id ASC
    `;
    res.json(dbManager.query(sql));
});

app.get('/api/audit-logs', (req, res) => {
    const sql = `
        SELECT a.*, u.full_name AS user_name, u.username
        FROM audit_logs a
        LEFT JOIN users u ON a.user_id = u.user_id
        ORDER BY a.log_id DESC
        LIMIT 50
    `;
    res.json(dbManager.query(sql));
});

// ----------------------------------------------------------------------------
// START SERVER AFTER DB INITIALIZATION
// ----------------------------------------------------------------------------
async function startServer() {
    try {
        await dbManager.init();
        app.listen(PORT, () => {
            console.log(`================================================================`);
            console.log(`🚀 University Scholarship & Financial Aid System Server Started`);
            console.log(`📡 URL: http://localhost:${PORT}`);
            console.log(`🎓 Ready for DBMS Academic Project Demonstration`);
            console.log(`================================================================`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
    }
}

if (!process.env.VERCEL) {
    startServer();
}

module.exports = app;
