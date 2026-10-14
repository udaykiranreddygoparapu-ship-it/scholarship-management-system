// ============================================================================
// UNIVERSITY SCHOLARSHIP AND FINANCIAL AID MANAGEMENT SYSTEM
// Relational Database Management Layer using sql.js (WebAssembly SQLite)
// Provides 100% genuine ANSI SQL execution, Transactions, & Schema Integrity
// ============================================================================

const fs = require('fs');
const path = require('path');
const initSqlJs = require('sql.js');
const seedData = require('./seed_data');

class DatabaseManager {
    constructor() {
        this.db = null;
        this.isInitialized = false;
    }

    async init() {
        if (this.isInitialized) return this.db;

        let SQL;
        try {
            SQL = await initSqlJs({
                locateFile: file => {
                    const localPath = path.join(__dirname, file);
                    if (fs.existsSync(localPath)) return localPath;
                    const nodeModulesPath = path.join(__dirname, '..', 'node_modules', 'sql.js', 'dist', file);
                    if (fs.existsSync(nodeModulesPath)) return nodeModulesPath;
                    return file;
                }
            });
        } catch (e) {
            SQL = await initSqlJs();
        }
        this.db = new SQL.Database();

        // 1. Load and execute DDL Schema
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');
        this.db.run(schemaSql);

        // 2. Populate Seed Data
        this.populateSeedData();

        this.isInitialized = true;
        console.log('✅ Relational Database initialized in 3NF with 15 normalized tables and 5 views.');
        return this.db;
    }

    populateSeedData() {
        // Roles
        const roleStmt = this.db.prepare(`INSERT OR IGNORE INTO roles (role_id, role_code, role_name, description) VALUES (?, ?, ?, ?)`);
        for (const r of seedData.roles) {
            roleStmt.run([r.role_id, r.role_code, r.role_name, r.description]);
        }
        roleStmt.free();

        // Users
        const userStmt = this.db.prepare(`INSERT OR IGNORE INTO users (user_id, username, password_hash, full_name, email, phone, role_id, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
        for (const u of seedData.users) {
            userStmt.run([u.user_id, u.username, u.password_hash, u.full_name, u.email, u.phone, u.role_id, u.status]);
        }
        userStmt.free();

        // Approval stages
        const stageStmt = this.db.prepare(`INSERT OR IGNORE INTO approval_stages (stage_id, stage_name, stage_order, role_required, description) VALUES (?, ?, ?, ?, ?)`);
        for (const s of seedData.approval_stages) {
            stageStmt.run([s.stage_id, s.stage_name, s.stage_order, s.role_required, s.description]);
        }
        stageStmt.free();

        // Students
        const studentStmt = this.db.prepare(`
            INSERT OR IGNORE INTO students (
                student_id, user_id, roll_number, first_name, last_name, dob, gender, email, phone,
                department, program, semester, category, cgpa, academic_percentage, annual_income,
                attendance_pct, admission_year, address
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        for (const st of seedData.students) {
            studentStmt.run([
                st.student_id, st.user_id, st.roll_number, st.first_name, st.last_name,
                st.dob, st.gender, st.email, st.phone, st.department, st.program,
                st.semester, st.category, st.cgpa, st.academic_percentage, st.annual_income,
                st.attendance_pct, st.admission_year, st.address
            ]);
        }
        studentStmt.free();

        // Schemes
        const schemeStmt = this.db.prepare(`
            INSERT OR IGNORE INTO scholarship_schemes (
                scheme_id, scheme_code, scheme_name, description, category_target,
                min_amount, max_amount, start_date, end_date, academic_year, status,
                renewal_allowed, min_cgpa, min_percentage, max_income, min_attendance,
                eligible_departments, eligible_programs, eligible_categories
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        for (const sc of seedData.scholarship_schemes) {
            schemeStmt.run([
                sc.scheme_id, sc.scheme_code, sc.scheme_name, sc.description, sc.category_target,
                sc.min_amount, sc.max_amount, sc.start_date, sc.end_date, sc.academic_year,
                sc.status, sc.renewal_allowed, sc.min_cgpa, sc.min_percentage, sc.max_income,
                sc.min_attendance, sc.eligible_departments, sc.eligible_programs, sc.eligible_categories
            ]);
        }
        schemeStmt.free();

        // Scheme Documents
        const schemeDocStmt = this.db.prepare(`INSERT OR IGNORE INTO scheme_documents (scheme_doc_id, scheme_id, document_name, is_mandatory, description) VALUES (?, ?, ?, ?, ?)`);
        for (const sd of seedData.scheme_documents) {
            schemeDocStmt.run([sd.scheme_doc_id, sd.scheme_id, sd.document_name, sd.is_mandatory, sd.description]);
        }
        schemeDocStmt.free();

        // Bank Details
        const bankStmt = this.db.prepare(`INSERT OR IGNORE INTO bank_details (bank_detail_id, student_id, account_holder_name, bank_name, account_number, ifsc_code, branch_name, is_verified, verified_by, verification_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
        for (const b of seedData.bank_details) {
            bankStmt.run([b.bank_detail_id, b.student_id, b.account_holder_name, b.bank_name, b.account_number, b.ifsc_code, b.branch_name, b.is_verified, b.verified_by, b.verification_date]);
        }
        bankStmt.free();

        // Applications
        const appStmt = this.db.prepare(`INSERT OR IGNORE INTO applications (application_id, application_no, student_id, scheme_id, academic_year, submission_date, current_stage, status, rejection_reason, remarks) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
        for (const a of seedData.applications) {
            appStmt.run([a.application_id, a.application_no, a.student_id, a.scheme_id, a.academic_year, a.submission_date, a.current_stage, a.status, a.rejection_reason, a.remarks]);
        }
        appStmt.free();

        // Application Documents
        const appDocStmt = this.db.prepare(`INSERT OR IGNORE INTO application_documents (app_doc_id, application_id, document_name, file_name, file_size_kb, status, remarks, verified_by, verification_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);
        for (const ad of seedData.application_documents) {
            appDocStmt.run([ad.app_doc_id, ad.application_id, ad.document_name, ad.file_name, ad.file_size_kb, ad.status, ad.remarks, ad.verified_by, ad.verification_date]);
        }
        appDocStmt.free();

        // Verifications
        const verifStmt = this.db.prepare(`INSERT OR IGNORE INTO verifications (verification_id, application_id, verifier_id, verification_date, status, eligibility_satisfied, remarks) VALUES (?, ?, ?, ?, ?, ?, ?)`);
        for (const v of seedData.verifications) {
            verifStmt.run([v.verification_id, v.application_id, v.verifier_id, v.verification_date, v.status, v.eligibility_satisfied, v.remarks]);
        }
        verifStmt.free();

        // Approvals
        const apprStmt = this.db.prepare(`INSERT OR IGNORE INTO approvals (approval_id, application_id, stage_id, officer_id, action, action_date, remarks) VALUES (?, ?, ?, ?, ?, ?, ?)`);
        for (const ap of seedData.approvals) {
            apprStmt.run([ap.approval_id, ap.application_id, ap.stage_id, ap.officer_id, ap.action, ap.action_date, ap.remarks]);
        }
        apprStmt.free();

        // Sanctions
        const sancStmt = this.db.prepare(`INSERT OR IGNORE INTO sanctions (sanction_id, sanction_no, application_id, student_id, scheme_id, approved_amount, sanction_amount, sanction_date, sanction_status, approving_officer_id, remarks) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
        for (const s of seedData.sanctions) {
            sancStmt.run([s.sanction_id, s.sanction_no, s.application_id, s.student_id, s.scheme_id, s.approved_amount, s.sanction_amount, s.sanction_date, s.sanction_status, s.approving_officer_id, s.remarks]);
        }
        sancStmt.free();

        // Disbursements
        const disbStmt = this.db.prepare(`INSERT OR IGNORE INTO disbursements (disbursement_id, disbursement_no, sanction_id, application_id, student_id, bank_detail_id, amount, payment_mode, transaction_ref, payment_date, payment_status, processed_by, remarks) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
        for (const d of seedData.disbursements) {
            disbStmt.run([d.disbursement_id, d.disbursement_no, d.sanction_id, d.application_id, d.student_id, d.bank_detail_id, d.amount, d.payment_mode, d.transaction_ref, d.payment_date, d.payment_status, d.processed_by, d.remarks]);
        }
        disbStmt.free();

        // Renewals
        const renStmt = this.db.prepare(`INSERT OR IGNORE INTO renewals (renewal_id, previous_application_id, previous_sanction_id, new_application_id, student_id, scheme_id, academic_year, current_cgpa, current_attendance, renewal_status, application_date, approved_date, remarks) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
        for (const rn of seedData.renewals) {
            renStmt.run([rn.renewal_id, rn.previous_application_id, rn.previous_sanction_id, rn.new_application_id, rn.student_id, rn.scheme_id, rn.academic_year, rn.current_cgpa, rn.current_attendance, rn.renewal_status, rn.application_date, rn.approved_date, rn.remarks]);
        }
        renStmt.free();

        // Audit Logs
        const logStmt = this.db.prepare(`INSERT OR IGNORE INTO audit_logs (log_id, action_type, entity_name, entity_id, user_id, details, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?)`);
        for (const l of seedData.audit_logs) {
            logStmt.run([l.log_id, l.action_type, l.entity_name, l.entity_id, l.user_id, l.details, l.timestamp]);
        }
        logStmt.free();
    }

    // Helper: Execute SELECT query and return array of objects
    query(sql, params = []) {
        try {
            const stmt = this.db.prepare(sql);
            if (params.length > 0) stmt.bind(params);
            
            const results = [];
            while (stmt.step()) {
                results.push(stmt.getAsObject());
            }
            stmt.free();
            return { success: true, data: results, count: results.length };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Helper: Execute single statement (INSERT, UPDATE, DELETE)
    run(sql, params = []) {
        try {
            this.db.run(sql, params);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Helper: Execute multiple statements or Transaction
    runTransaction(statements) {
        try {
            this.db.run("BEGIN TRANSACTION;");
            for (const item of statements) {
                if (typeof item === 'string') {
                    this.db.run(item);
                } else {
                    this.db.run(item.sql, item.params || []);
                }
            }
            this.db.run("COMMIT;");
            return { success: true, message: 'Transaction committed successfully' };
        } catch (error) {
            this.db.run("ROLLBACK;");
            return { success: false, error: `Transaction rolled back: ${error.message}` };
        }
    }

    // Raw SQL execution for the interactive SQL Studio
    executeRawSql(sql) {
        const startTime = Date.now();
        try {
            const res = this.db.exec(sql);
            const duration = Date.now() - startTime;
            if (!res || res.length === 0) {
                return { success: true, duration, columns: [], rows: [], rowCount: 0, message: 'Query executed successfully with 0 rows affected or returned.' };
            }
            const firstResult = res[0];
            return {
                success: true,
                duration,
                columns: firstResult.columns,
                rows: firstResult.values,
                rowCount: firstResult.values.length,
                allResults: res
            };
        } catch (error) {
            const duration = Date.now() - startTime;
            return {
                success: false,
                duration,
                error: error.message
            };
        }
    }
}

const dbManager = new DatabaseManager();
module.exports = dbManager;
