// ============================================================================
// UNIVERSITY SCHOLARSHIP AND FINANCIAL AID MANAGEMENT SYSTEM
// Comprehensive Realistic Seed Data (Indian University Context)
// ============================================================================

const seedData = {
    roles: [
        { role_id: 1, role_code: 'ROLE_ADMIN', role_name: 'System Administrator', description: 'Complete system oversight, scheme management, reports, user configuration' },
        { role_id: 2, role_code: 'ROLE_STUDENT', role_name: 'University Student', description: 'View schemes, verify eligibility, apply, upload documents, track disbursements, renewals' },
        { role_id: 3, role_code: 'ROLE_VERIFIER', role_name: 'Verification Officer', description: 'Scrutinizes student credentials, certificates, income slips, marksheet authenticity' },
        { role_id: 4, role_code: 'ROLE_APPROVER', role_name: 'Approving Officer / Dean', description: 'Evaluates verified applications, grants department & academic approvals, issues sanctions' },
        { role_id: 5, role_code: 'ROLE_FINANCE', role_name: 'Finance & Accounts Officer', description: 'Validates bank coordinates, executes DBT/PFMS disbursements, maintains treasury audit' }
    ],

    users: [
        { user_id: 1, username: 'admin', password_hash: 'admin123', full_name: 'Prof. Dr. Rajesh K. Sharma', email: 'dean.dsw@centraluniv.ac.in', phone: '+91 98110 23456', role_id: 1, status: 'Active' },
        { user_id: 2, username: 'verifier', password_hash: 'verifier123', full_name: 'Dr. Suresh Rao', email: 'suresh.rao@centraluniv.ac.in', phone: '+91 94481 67890', role_id: 3, status: 'Active' },
        { user_id: 3, username: 'approver', password_hash: 'approver123', full_name: 'Prof. A. K. Verma', email: 'dean.acad@centraluniv.ac.in', phone: '+91 98260 11223', role_id: 4, status: 'Active' },
        { user_id: 4, username: 'finance', password_hash: 'finance123', full_name: 'Mrs. Kavita Nair', email: 'cfo.accounts@centraluniv.ac.in', phone: '+91 97112 44556', role_id: 5, status: 'Active' },
        // Student linked user accounts
        { user_id: 5, username: 'rahul.sharma', password_hash: 'student123', full_name: 'Rahul Sharma', email: 'rahul.s23@univ.ac.in', phone: '+91 98765 43210', role_id: 2, status: 'Active' },
        { user_id: 6, username: 'priya.patel', password_hash: 'student123', full_name: 'Priya Patel', email: 'priya.p22@univ.ac.in', phone: '+91 97654 32109', role_id: 2, status: 'Active' },
        { user_id: 7, username: 'amit.kumar', password_hash: 'student123', full_name: 'Amit Kumar', email: 'amit.k23@univ.ac.in', phone: '+91 96543 21098', role_id: 2, status: 'Active' },
        { user_id: 8, username: 'ananya.iyer', password_hash: 'student123', full_name: 'Ananya Iyer', email: 'ananya.i21@univ.ac.in', phone: '+91 95432 10987', role_id: 2, status: 'Active' }
    ],

    approval_stages: [
        { stage_id: 1, stage_name: 'Application Submission', stage_order: 1, role_required: 'ROLE_STUDENT', description: 'Application received and registered in portal' },
        { stage_id: 2, stage_name: 'Document Verification', stage_order: 2, role_required: 'ROLE_VERIFIER', description: 'Scrutiny of income certificate, marksheet, caste & bonafide credentials' },
        { stage_id: 3, stage_name: 'Eligibility Verification', stage_order: 3, role_required: 'ROLE_VERIFIER', description: 'Automated and manual confirmation of academic and financial thresholds' },
        { stage_id: 4, stage_name: 'Department Approval', stage_order: 4, role_required: 'ROLE_APPROVER', description: 'Head of Department / Academic Committee review and recommendation' },
        { stage_id: 5, stage_name: 'Final Approval', stage_order: 5, role_required: 'ROLE_APPROVER', description: 'Dean of Student Welfare final assent' },
        { stage_id: 6, stage_name: 'Sanction Order Generation', stage_order: 6, role_required: 'ROLE_APPROVER', description: 'Official financial sanction grant letter issued' },
        { stage_id: 7, stage_name: 'Bank & PFMS Disbursement', stage_order: 7, role_required: 'ROLE_FINANCE', description: 'Direct Benefit Transfer processed into student bank account' }
    ],

    students: [
        {
            student_id: 1, user_id: 5, roll_number: '25WU0102085', first_name: 'Rahul', last_name: 'Sharma',
            dob: '2004-05-14', gender: 'Male', email: 'rahul.s23@univ.ac.in', phone: '+91 98765 43210',
            department: 'Computer Science & Engineering', program: 'B.Tech', semester: 5, category: 'EWS',
            cgpa: 8.85, academic_percentage: 86.4, annual_income: 180000, attendance_pct: 92.0,
            admission_year: 2023, address: 'Flat 402, Ganga Heights, Varanasi, Uttar Pradesh - 221005'
        },
        {
            student_id: 2, user_id: 6, roll_number: '25WU0102086', first_name: 'Priya', last_name: 'Patel',
            dob: '2003-09-22', gender: 'Female', email: 'priya.p22@univ.ac.in', phone: '+91 97654 32109',
            department: 'Electronics & Communication', program: 'B.Tech', semester: 6, category: 'OBC',
            cgpa: 9.42, academic_percentage: 91.8, annual_income: 320000, attendance_pct: 94.5,
            admission_year: 2022, address: '12 Shivalik Enclave, Ahmedabad, Gujarat - 380015'
        },
        {
            student_id: 3, user_id: 7, roll_number: '25WU0102087', first_name: 'Amit', last_name: 'Kumar',
            dob: '2004-11-08', gender: 'Male', email: 'amit.k23@univ.ac.in', phone: '+91 96543 21098',
            department: 'Mechanical Engineering', program: 'B.Tech', semester: 4, category: 'SC',
            cgpa: 7.95, academic_percentage: 78.5, annual_income: 120000, attendance_pct: 88.0,
            admission_year: 2023, address: 'Village Rampur, P.O. Dhanbad, Jharkhand - 826001'
        },
        {
            student_id: 4, user_id: 8, roll_number: '25WU0102088', first_name: 'Ananya', last_name: 'Iyer',
            dob: '2002-12-19', gender: 'Female', email: 'ananya.i21@univ.ac.in', phone: '+91 95432 10987',
            department: 'Computer Science & Engineering', program: 'B.Tech', semester: 8, category: 'General',
            cgpa: 9.78, academic_percentage: 95.2, annual_income: 540000, attendance_pct: 96.0,
            admission_year: 2021, address: 'Plot 55, Anna Nagar West, Chennai, Tamil Nadu - 600040'
        },
        {
            student_id: 5, user_id: null, roll_number: '25WU0102089', first_name: 'Vikram', last_name: 'Singh',
            dob: '2004-03-30', gender: 'Male', email: 'vikram.s23@univ.ac.in', phone: '+91 94321 09876',
            department: 'Civil Engineering', program: 'B.Tech', semester: 4, category: 'OBC',
            cgpa: 8.10, academic_percentage: 80.0, annual_income: 240000, attendance_pct: 86.5,
            admission_year: 2023, address: 'Ward 8, Rajendra Nagar, Patna, Bihar - 800016'
        },
        {
            student_id: 6, user_id: null, roll_number: '25WU0102090', first_name: 'Sneha', last_name: 'Reddy',
            dob: '2003-07-15', gender: 'Female', email: 'sneha.r22@univ.ac.in', phone: '+91 93210 98765',
            department: 'Biotechnology', program: 'B.Tech', semester: 6, category: 'General',
            cgpa: 8.65, academic_percentage: 84.8, annual_income: 420000, attendance_pct: 89.0,
            admission_year: 2022, address: 'H.No 3-4-512, Barkatpura, Hyderabad, Telangana - 500027'
        },
        {
            student_id: 7, user_id: null, roll_number: '25WU0102091', first_name: 'Rohan', last_name: 'Gupta',
            dob: '2001-01-25', gender: 'Male', email: 'rohan.g24@univ.ac.in', phone: '+91 92109 87654',
            department: 'Computer Science & Engineering', program: 'M.Tech', semester: 2, category: 'General',
            cgpa: 9.15, academic_percentage: 89.5, annual_income: 380000, attendance_pct: 93.0,
            admission_year: 2024, address: 'B-24 Sector 62, Noida, Uttar Pradesh - 201309'
        },
        {
            student_id: 8, user_id: null, roll_number: '25WU0102092', first_name: 'Pooja', last_name: 'Mehra',
            dob: '2004-08-11', gender: 'Female', email: 'pooja.m23@univ.ac.in', phone: '+91 91098 76543',
            department: 'Electrical Engineering', program: 'B.Tech', semester: 4, category: 'SC',
            cgpa: 8.35, academic_percentage: 82.0, annual_income: 150000, attendance_pct: 91.5,
            admission_year: 2023, address: 'Kailash Nagar, Gwalior, Madhya Pradesh - 474006'
        },
        {
            student_id: 9, user_id: null, roll_number: '25WU0102093', first_name: 'Deepak', last_name: 'Verma',
            dob: '2002-04-18', gender: 'Male', email: 'deepak.v23@univ.ac.in', phone: '+91 90987 65432',
            department: 'Computer Science & Engineering', program: 'MCA', semester: 4, category: 'OBC',
            cgpa: 8.50, academic_percentage: 83.2, annual_income: 260000, attendance_pct: 87.0,
            admission_year: 2023, address: 'House 14, Tagore Road, Kanpur, Uttar Pradesh - 208002'
        },
        {
            student_id: 10, user_id: null, roll_number: '25WU0102094', first_name: 'Neha', last_name: 'Joshi',
            dob: '2003-10-05', gender: 'Female', email: 'neha.j22@univ.ac.in', phone: '+91 89876 54321',
            department: 'Computer Science & Engineering', program: 'B.Tech', semester: 6, category: 'EWS',
            cgpa: 9.30, academic_percentage: 90.5, annual_income: 195000, attendance_pct: 95.0,
            admission_year: 2022, address: 'Near Clock Tower, Dehradun, Uttarakhand - 248001'
        },
        {
            student_id: 11, user_id: null, roll_number: '25WU0102095', first_name: 'Karthik', last_name: 'Nair',
            dob: '2004-06-29', gender: 'Male', email: 'karthik.n23@univ.ac.in', phone: '+91 88765 43210',
            department: 'Mechanical Engineering', program: 'B.Tech', semester: 4, category: 'General',
            cgpa: 8.70, academic_percentage: 85.0, annual_income: 480000, attendance_pct: 90.0,
            admission_year: 2023, address: 'TC 15/482, Vazhuthacaud, Thiruvananthapuram, Kerala - 695014'
        },
        {
            student_id: 12, user_id: null, roll_number: '25WU0102096', first_name: 'Sunita', last_name: 'Murmu',
            dob: '2004-02-14', gender: 'Female', email: 'sunita.m23@univ.ac.in', phone: '+91 87654 32109',
            department: 'Civil Engineering', program: 'B.Tech', semester: 4, category: 'ST',
            cgpa: 7.75, academic_percentage: 76.2, annual_income: 95000, attendance_pct: 84.0,
            admission_year: 2023, address: 'Baripada, Mayurbhanj, Odisha - 757001'
        },
        {
            student_id: 13, user_id: null, roll_number: '25WU0102097', first_name: 'Tariq', last_name: 'Alam',
            dob: '2003-11-28', gender: 'Male', email: 'tariq.a22@univ.ac.in', phone: '+91 86543 21098',
            department: 'Information Technology', program: 'B.Tech', semester: 6, category: 'OBC',
            cgpa: 8.40, academic_percentage: 82.5, annual_income: 210000, attendance_pct: 89.5,
            admission_year: 2022, address: 'Dargah Road, Mahendru, Patna, Bihar - 800006'
        },
        {
            student_id: 14, user_id: null, roll_number: '25WU0102098', first_name: 'Divya', last_name: 'Deshmukh',
            dob: '2004-09-02', gender: 'Female', email: 'divya.d23@univ.ac.in', phone: '+91 85432 10987',
            department: 'Electronics & Communication', program: 'B.Tech', semester: 4, category: 'General',
            cgpa: 8.92, academic_percentage: 87.6, annual_income: 340000, attendance_pct: 92.5,
            admission_year: 2023, address: 'Shivaji Chowk, Pune, Maharashtra - 411004'
        },
        {
            student_id: 15, user_id: null, roll_number: '25WU0102099', first_name: 'Sandeep', last_name: 'Yadav',
            dob: '2004-12-03', gender: 'Male', email: 'sandeep.y23@univ.ac.in', phone: '+91 84321 09876',
            department: 'Mechanical Engineering', program: 'B.Tech', semester: 4, category: 'OBC',
            cgpa: 6.95, academic_percentage: 68.2, annual_income: 280000, attendance_pct: 72.0,
            admission_year: 2023, address: 'Civil Lines, Rewari, Haryana - 123401'
        },
        {
            student_id: 16, user_id: null, roll_number: '25WU0102100', first_name: 'Meenakshi', last_name: 'Sundaram',
            dob: '2001-08-20', gender: 'Female', email: 'meenakshi.s24@univ.ac.in', phone: '+91 83210 98765',
            department: 'Electronics & Communication', program: 'M.Tech', semester: 2, category: 'General',
            cgpa: 9.55, academic_percentage: 93.0, annual_income: 450000, attendance_pct: 97.0,
            admission_year: 2024, address: 'Gandhi Road, Madurai, Tamil Nadu - 625001'
        }
    ],

    scholarship_schemes: [
        {
            scheme_id: 1,
            scheme_code: 'SCH-MCM-2026',
            scheme_name: 'Post-Matric Merit-cum-Means Financial Assistance',
            description: 'Institutional scholarship for bright, meritorious students belonging to economically disadvantaged backgrounds to cover tuition and laboratory fees.',
            category_target: 'All',
            min_amount: 25000,
            max_amount: 50000,
            start_date: '2026-07-01',
            end_date: '2026-11-30',
            academic_year: '2026-27',
            status: 'Active',
            renewal_allowed: 1,
            min_cgpa: 7.50,
            min_percentage: 75.0,
            max_income: 300000,
            min_attendance: 80.0,
            eligible_departments: 'All',
            eligible_programs: 'B.Tech, M.Tech, MCA',
            eligible_categories: 'General, OBC, SC, ST, EWS'
        },
        {
            scheme_id: 2,
            scheme_code: 'SCH-NTA-2026',
            scheme_name: 'National Academic Excellence & Chancellor Gold Medal Award',
            description: 'Premier merit endowment awarding top 5% academic performers across engineering and science streams with direct research stipend.',
            category_target: 'Merit',
            min_amount: 50000,
            max_amount: 75000,
            start_date: '2026-07-15',
            end_date: '2026-12-15',
            academic_year: '2026-27',
            status: 'Active',
            renewal_allowed: 1,
            min_cgpa: 9.00,
            min_percentage: 90.0,
            max_income: 800000,
            min_attendance: 85.0,
            eligible_departments: 'All',
            eligible_programs: 'B.Tech, M.Tech',
            eligible_categories: 'All'
        },
        {
            scheme_id: 3,
            scheme_code: 'SCH-STEM-2026',
            scheme_name: 'Pragati Grant for Women in STEM & Computing',
            description: 'Special university grant designed to encourage and empower meritorious female students pursuing STEM programs with comprehensive financial aid.',
            category_target: 'Female Students',
            min_amount: 40000,
            max_amount: 60000,
            start_date: '2026-08-01',
            end_date: '2026-12-31',
            academic_year: '2026-27',
            status: 'Active',
            renewal_allowed: 1,
            min_cgpa: 8.00,
            min_percentage: 80.0,
            max_income: 500000,
            min_attendance: 80.0,
            eligible_departments: 'Computer Science & Engineering, Electronics & Communication, Biotechnology, Information Technology',
            eligible_programs: 'B.Tech, M.Tech',
            eligible_categories: 'All'
        },
        {
            scheme_id: 4,
            scheme_code: 'SCH-EWS-2026',
            scheme_name: 'Economically Weaker Section (EWS) Full Tuition Support',
            description: 'Complete tuition and semester fee waiver for students from families with total gross annual income below statutory limits.',
            category_target: 'EWS, SC, ST',
            min_amount: 60000,
            max_amount: 80000,
            start_date: '2026-06-15',
            end_date: '2026-11-15',
            academic_year: '2026-27',
            status: 'Active',
            renewal_allowed: 1,
            min_cgpa: 7.00,
            min_percentage: 70.0,
            max_income: 200000,
            min_attendance: 75.0,
            eligible_departments: 'All',
            eligible_programs: 'All',
            eligible_categories: 'EWS, SC, ST'
        },
        {
            scheme_id: 5,
            scheme_code: 'SCH-PGRF-2026',
            scheme_name: 'Post-Graduate Research Fellowship Assistance',
            description: 'Financial fellowship grant to assist M.Tech and Ph.D. students in hardware prototypes, conference participation, and journal publications.',
            category_target: 'Post-Graduate',
            min_amount: 80000,
            max_amount: 120000,
            start_date: '2026-08-15',
            end_date: '2027-01-15',
            academic_year: '2026-27',
            status: 'Active',
            renewal_allowed: 1,
            min_cgpa: 8.20,
            min_percentage: 82.0,
            max_income: 600000,
            min_attendance: 85.0,
            eligible_departments: 'Computer Science & Engineering, Electronics & Communication',
            eligible_programs: 'M.Tech',
            eligible_categories: 'All'
        },
        {
            scheme_id: 6,
            scheme_code: 'SCH-SPT-2026',
            scheme_name: 'University Sports & Cultural Talent Endowment',
            description: 'Encouraging national and inter-university sportspersons and classical artists with semester fee subsidies and equipment allowance.',
            category_target: 'Sports / Cultural',
            min_amount: 20000,
            max_amount: 35000,
            start_date: '2026-07-01',
            end_date: '2026-10-31',
            academic_year: '2026-27',
            status: 'Active',
            renewal_allowed: 1,
            min_cgpa: 6.50,
            min_percentage: 65.0,
            max_income: 600000,
            min_attendance: 75.0,
            eligible_departments: 'All',
            eligible_programs: 'All',
            eligible_categories: 'All'
        }
    ],

    scheme_documents: [
        { scheme_doc_id: 1, scheme_id: 1, document_name: 'Income Certificate (Tehsildar/Revenue Authority)', is_mandatory: 1, description: 'Issued by competent revenue authority within current financial year' },
        { scheme_doc_id: 2, scheme_id: 1, document_name: 'Previous Semester Grade Card / Marksheet', is_mandatory: 1, description: 'Official marksheet verified by University Examination Cell' },
        { scheme_doc_id: 3, scheme_id: 1, document_name: 'Bonafide Student Certificate', is_mandatory: 1, description: 'Issued by Department HOD or Academic Section' },
        { scheme_doc_id: 4, scheme_id: 1, document_name: 'Cancelled Cheque / Bank Passbook Copy', is_mandatory: 1, description: 'Showing Account Number and IFSC Code clearly' },
        { scheme_doc_id: 5, scheme_id: 2, document_name: 'Consolidated Academic Transcript', is_mandatory: 1, description: 'Showing CGPA >= 9.0 without backlogs' },
        { scheme_doc_id: 6, scheme_id: 2, document_name: 'Dean/HOD Letter of Recommendation', is_mandatory: 1, description: 'Signed on departmental letterhead' },
        { scheme_doc_id: 7, scheme_id: 3, document_name: 'Academic Marksheet', is_mandatory: 1, description: 'Latest semester grade report' },
        { scheme_doc_id: 8, scheme_id: 3, document_name: 'Income Declaration Affidavit', is_mandatory: 1, description: 'Notarized affidavit of family income' },
        { scheme_doc_id: 9, scheme_id: 4, document_name: 'Government EWS / Caste Certificate', is_mandatory: 1, description: 'Valid government certificate for reservation quota' },
        { scheme_doc_id: 10, scheme_id: 4, document_name: 'Annual Income Tax Return (ITR) or BPL Card', is_mandatory: 1, description: 'Proof of annual income under ₹2,00,000' }
    ],

    bank_details: [
        { bank_detail_id: 1, student_id: 1, account_holder_name: 'Rahul Sharma', bank_name: 'State Bank of India', account_number: '38920194821', ifsc_code: 'SBIN0001234', branch_name: 'BHU Main Branch, Varanasi', is_verified: 1, verified_by: 4, verification_date: '2026-08-10 11:30:00' },
        { bank_detail_id: 2, student_id: 2, account_holder_name: 'Priya Patel', bank_name: 'HDFC Bank', account_number: '50100492817234', ifsc_code: 'HDFC0000456', branch_name: 'Navrangpura Branch, Ahmedabad', is_verified: 1, verified_by: 4, verification_date: '2026-08-11 14:15:00' },
        { bank_detail_id: 3, student_id: 3, account_holder_name: 'Amit Kumar', bank_name: 'Punjab National Bank', account_number: '18290001928374', ifsc_code: 'PUNB0182900', branch_name: 'Station Road, Dhanbad', is_verified: 1, verified_by: 4, verification_date: '2026-08-12 16:45:00' },
        { bank_detail_id: 4, student_id: 4, account_holder_name: 'Ananya Iyer', bank_name: 'ICICI Bank', account_number: '004701582910', ifsc_code: 'ICIC0000047', branch_name: 'Anna Nagar Branch, Chennai', is_verified: 1, verified_by: 4, verification_date: '2026-08-14 10:20:00' },
        { bank_detail_id: 5, student_id: 5, account_holder_name: 'Vikram Singh', bank_name: 'Bank of Baroda', account_number: '29810100048291', ifsc_code: 'BARB0PATNAX', branch_name: 'Kankarbagh, Patna', is_verified: 0, verified_by: null, verification_date: null },
        { bank_detail_id: 6, student_id: 6, account_holder_name: 'Sneha Reddy', bank_name: 'Canara Bank', account_number: '1290101038491', ifsc_code: 'CNRB0001290', branch_name: 'Abids Branch, Hyderabad', is_verified: 1, verified_by: 4, verification_date: '2026-08-15 11:00:00' },
        { bank_detail_id: 7, student_id: 7, account_holder_name: 'Rohan Gupta', bank_name: 'Union Bank of India', account_number: '562102010049281', ifsc_code: 'UBIN0556211', branch_name: 'Sector 62, Noida', is_verified: 1, verified_by: 4, verification_date: '2026-08-16 15:30:00' },
        { bank_detail_id: 8, student_id: 8, account_holder_name: 'Pooja Mehra', bank_name: 'State Bank of India', account_number: '39201948572', ifsc_code: 'SBIN0004928', branch_name: 'City Centre, Gwalior', is_verified: 1, verified_by: 4, verification_date: '2026-08-17 12:40:00' },
        { bank_detail_id: 9, student_id: 10, account_holder_name: 'Neha Joshi', bank_name: 'Punjab National Bank', account_number: '28490001928371', ifsc_code: 'PUNB0284900', branch_name: 'Rajpur Road, Dehradun', is_verified: 1, verified_by: 4, verification_date: '2026-08-18 10:15:00' },
        { bank_detail_id: 10, student_id: 12, account_holder_name: 'Sunita Murmu', bank_name: 'State Bank of India', account_number: '37482910485', ifsc_code: 'SBIN0000130', branch_name: 'Main Road, Baripada', is_verified: 0, verified_by: null, verification_date: null }
    ],

    applications: [
        {
            application_id: 1,
            application_no: 'APP-2026-00101',
            student_id: 1,
            scheme_id: 1,
            academic_year: '2026-27',
            submission_date: '2026-07-10 10:15:00',
            current_stage: 'Disbursed',
            status: 'Disbursed',
            rejection_reason: null,
            remarks: 'All documents verified and DBT payment successfully credited via PFMS'
        },
        {
            application_id: 2,
            application_no: 'APP-2026-00102',
            student_id: 2,
            scheme_id: 3,
            academic_year: '2026-27',
            submission_date: '2026-07-12 11:30:00',
            current_stage: 'Disbursed',
            status: 'Disbursed',
            rejection_reason: null,
            remarks: 'Pragati STEM grant processed to HDFC account'
        },
        {
            application_id: 3,
            application_no: 'APP-2026-00103',
            student_id: 3,
            scheme_id: 4,
            academic_year: '2026-27',
            submission_date: '2026-07-15 14:20:00',
            current_stage: 'Sanctioned',
            status: 'Sanctioned',
            rejection_reason: null,
            remarks: 'Full tuition support sanction order issued, sent to treasury for batch disbursement'
        },
        {
            application_id: 4,
            application_no: 'APP-2026-00104',
            student_id: 4,
            scheme_id: 2,
            academic_year: '2026-27',
            submission_date: '2026-07-18 09:45:00',
            current_stage: 'Sanctioned',
            status: 'Sanctioned',
            rejection_reason: null,
            remarks: 'Chancellor Gold Medal Award sanction confirmed. Awaiting payment processing window.'
        },
        {
            application_id: 5,
            application_no: 'APP-2026-00105',
            student_id: 6,
            scheme_id: 3,
            academic_year: '2026-27',
            submission_date: '2026-07-22 16:10:00',
            current_stage: 'Final Approval',
            status: 'Approved',
            rejection_reason: null,
            remarks: 'Department recommendation approved by Dean. Ready for financial sanction.'
        },
        {
            application_id: 6,
            application_no: 'APP-2026-00106',
            student_id: 7,
            scheme_id: 5,
            academic_year: '2026-27',
            submission_date: '2026-07-25 12:00:00',
            current_stage: 'Department Approval',
            status: 'Verified',
            rejection_reason: null,
            remarks: 'Document verification cleared with 100% compliance. Pending HoD endorsement.'
        },
        {
            application_id: 7,
            application_no: 'APP-2026-00107',
            student_id: 8,
            scheme_id: 4,
            academic_year: '2026-27',
            submission_date: '2026-08-01 10:30:00',
            current_stage: 'Document Verification',
            status: 'Under Verification',
            rejection_reason: null,
            remarks: 'Documents submitted by student under scrutiny by verification officer.'
        },
        {
            application_id: 8,
            application_no: 'APP-2026-00108',
            student_id: 9,
            scheme_id: 1,
            academic_year: '2026-27',
            submission_date: '2026-08-05 15:40:00',
            current_stage: 'Document Verification',
            status: 'Under Verification',
            rejection_reason: null,
            remarks: 'Awaiting verification of Tehsildar income certificate validity.'
        },
        {
            application_id: 9,
            application_no: 'APP-2026-00109',
            student_id: 10,
            scheme_id: 4,
            academic_year: '2026-27',
            submission_date: '2026-08-08 11:20:00',
            current_stage: 'Department Approval',
            status: 'Verified',
            rejection_reason: null,
            remarks: 'EWS criteria verified. Forwarded to Computer Science HoD for clearance.'
        },
        {
            application_id: 10,
            application_no: 'APP-2026-00110',
            student_id: 11,
            scheme_id: 1,
            academic_year: '2026-27',
            submission_date: '2026-08-10 14:00:00',
            current_stage: 'Submitted',
            status: 'Submitted',
            rejection_reason: null,
            remarks: 'Newly registered application. Pending initial queue assignment.'
        },
        {
            application_id: 11,
            application_no: 'APP-2026-00111',
            student_id: 12,
            scheme_id: 4,
            academic_year: '2026-27',
            submission_date: '2026-08-12 09:30:00',
            current_stage: 'Submitted',
            status: 'Submitted',
            rejection_reason: null,
            remarks: 'Application submitted with ST certificate. Queue position: #3.'
        },
        {
            application_id: 12,
            application_no: 'APP-2026-00112',
            student_id: 15,
            scheme_id: 1,
            academic_year: '2026-27',
            submission_date: '2026-08-02 16:20:00',
            current_stage: 'Rejected',
            status: 'Rejected',
            rejection_reason: 'Academic CGPA (6.95) does not meet mandatory threshold (7.50) and attendance is below 80%.',
            remarks: 'Automatic eligibility check failed during verification stage.'
        }
    ],

    application_documents: [
        { app_doc_id: 1, application_id: 1, document_name: 'Income Certificate', file_name: 'Income_Cert_Rahul_Sharma_2026.pdf', file_size_kb: 340, status: 'Verified', remarks: 'Valid income ₹1.80 Lakh authenticated', verified_by: 2, verification_date: '2026-07-15 14:00:00' },
        { app_doc_id: 2, application_id: 1, document_name: 'Semester Marksheet', file_name: 'Sem4_Marksheet_25WU0102085.pdf', file_size_kb: 512, status: 'Verified', remarks: 'CGPA 8.85 verified from university database', verified_by: 2, verification_date: '2026-07-15 14:05:00' },
        { app_doc_id: 3, application_id: 1, document_name: 'Bank Passbook Copy', file_name: 'SBI_Passbook_Rahul.pdf', file_size_kb: 280, status: 'Verified', remarks: 'Account number and IFSC match profile', verified_by: 2, verification_date: '2026-07-15 14:10:00' },
        { app_doc_id: 4, application_id: 2, document_name: 'Academic Transcript', file_name: 'BTech_Sem5_Priya_Patel.pdf', file_size_kb: 420, status: 'Verified', remarks: 'CGPA 9.42 confirmed', verified_by: 2, verification_date: '2026-07-16 11:20:00' },
        { app_doc_id: 5, application_id: 2, document_name: 'Income Affidavit', file_name: 'Income_Affidavit_Patel.pdf', file_size_kb: 310, status: 'Verified', remarks: 'Family income ₹3.20 Lakh within STEM grant bounds', verified_by: 2, verification_date: '2026-07-16 11:25:00' },
        { app_doc_id: 6, application_id: 3, document_name: 'Government Caste Certificate', file_name: 'SC_Certificate_Amit_Kumar.pdf', file_size_kb: 290, status: 'Verified', remarks: 'Authenticated by Dhanbad revenue board', verified_by: 2, verification_date: '2026-07-20 10:15:00' },
        { app_doc_id: 7, application_id: 3, document_name: 'Income Certificate', file_name: 'Income_Slip_120k.pdf', file_size_kb: 250, status: 'Verified', remarks: 'Income ₹1.20 Lakh verified', verified_by: 2, verification_date: '2026-07-20 10:20:00' },
        { app_doc_id: 8, application_id: 4, document_name: 'Consolidated Academic Transcript', file_name: 'Gold_Medal_Transcript_Ananya.pdf', file_size_kb: 640, status: 'Verified', remarks: 'CGPA 9.78 top of university batch', verified_by: 2, verification_date: '2026-07-22 15:40:00' },
        { app_doc_id: 9, application_id: 5, document_name: 'Academic Marksheet', file_name: 'Marksheet_Sneha_Reddy.pdf', file_size_kb: 390, status: 'Verified', remarks: 'CGPA 8.65 confirmed', verified_by: 2, verification_date: '2026-07-26 12:10:00' },
        { app_doc_id: 10, application_id: 6, document_name: 'M.Tech Research Synopsis', file_name: 'Synopsis_Rohan_Gupta.pdf', file_size_kb: 850, status: 'Verified', remarks: 'Accepted by PG Research Board', verified_by: 2, verification_date: '2026-07-28 16:30:00' },
        { app_doc_id: 11, application_id: 7, document_name: 'Income Certificate', file_name: 'Income_Pooja_Mehra.pdf', file_size_kb: 220, status: 'Pending', remarks: 'Pending verification in queue', verified_by: null, verification_date: null },
        { app_doc_id: 12, application_id: 8, document_name: 'Income Certificate', file_name: 'Income_Deepak_Verma.pdf', file_size_kb: 310, status: 'Pending', remarks: 'Seal unclear, under scrutiny', verified_by: null, verification_date: null },
        { app_doc_id: 13, application_id: 12, document_name: 'Income Certificate', file_name: 'Income_Sandeep_Yadav.pdf', file_size_kb: 280, status: 'Rejected', remarks: 'Attendance requirement 80% not met', verified_by: 2, verification_date: '2026-08-04 11:00:00' }
    ],

    verifications: [
        { verification_id: 1, application_id: 1, verifier_id: 2, verification_date: '2026-07-15 14:15:00', status: 'Verified', eligibility_satisfied: 1, remarks: 'Verified all 4 documents. Family income <= ₹3 Lakh and CGPA 8.85 > 7.50.' },
        { verification_id: 2, application_id: 2, verifier_id: 2, verification_date: '2026-07-16 11:30:00', status: 'Verified', eligibility_satisfied: 1, remarks: 'Female STEM student with CGPA 9.42 verified against scheme guidelines.' },
        { verification_id: 3, application_id: 3, verifier_id: 2, verification_date: '2026-07-20 10:30:00', status: 'Verified', eligibility_satisfied: 1, remarks: 'SC Category and Income under ₹2 Lakh criteria fully fulfilled.' },
        { verification_id: 4, application_id: 4, verifier_id: 2, verification_date: '2026-07-22 15:50:00', status: 'Verified', eligibility_satisfied: 1, remarks: 'Merit criteria verified. Exceptional CGPA 9.78.' },
        { verification_id: 5, application_id: 5, verifier_id: 2, verification_date: '2026-07-26 12:20:00', status: 'Verified', eligibility_satisfied: 1, remarks: 'STEM Biotechnology applicant verified with 8.65 CGPA.' },
        { verification_id: 6, application_id: 6, verifier_id: 2, verification_date: '2026-07-28 16:40:00', status: 'Verified', eligibility_satisfied: 1, remarks: 'M.Tech research credentials and proposal verified.' },
        { verification_id: 7, application_id: 9, verifier_id: 2, verification_date: '2026-08-10 16:00:00', status: 'Verified', eligibility_satisfied: 1, remarks: 'EWS documents certified by Tehsildar.' },
        { verification_id: 8, application_id: 12, verifier_id: 2, verification_date: '2026-08-04 11:15:00', status: 'Rejected', eligibility_satisfied: 0, remarks: 'CGPA 6.95 fails minimum requirement of 7.50. Rejected.' }
    ],

    approvals: [
        { approval_id: 1, application_id: 1, stage_id: 4, officer_id: 3, action: 'Recommended', action_date: '2026-07-18 11:00:00', remarks: 'Recommended by HoD Computer Science & Engineering' },
        { approval_id: 2, application_id: 1, stage_id: 5, officer_id: 3, action: 'Approved', action_date: '2026-07-20 15:30:00', remarks: 'Approved for sanction grant by Dean Academic' },
        { approval_id: 3, application_id: 2, stage_id: 4, officer_id: 3, action: 'Recommended', action_date: '2026-07-19 14:00:00', remarks: 'Recommended for Pragati STEM grant' },
        { approval_id: 4, application_id: 2, stage_id: 5, officer_id: 3, action: 'Approved', action_date: '2026-07-21 16:45:00', remarks: 'Approved by Dean Academic' },
        { approval_id: 5, application_id: 3, stage_id: 4, officer_id: 3, action: 'Recommended', action_date: '2026-07-23 10:30:00', remarks: 'Full tuition fee waiver recommended by Mech Dept' },
        { approval_id: 6, application_id: 3, stage_id: 5, officer_id: 3, action: 'Approved', action_date: '2026-07-25 14:15:00', remarks: 'Sanction approved by Dean' },
        { approval_id: 7, application_id: 4, stage_id: 4, officer_id: 3, action: 'Recommended', action_date: '2026-07-24 11:30:00', remarks: 'Recommended with highest honors for Chancellor Award' },
        { approval_id: 8, application_id: 4, stage_id: 5, officer_id: 3, action: 'Approved', action_date: '2026-07-26 12:00:00', remarks: 'Approved for ₹75,000 maximum sanction grant' },
        { approval_id: 9, application_id: 5, stage_id: 4, officer_id: 3, action: 'Recommended', action_date: '2026-07-29 15:00:00', remarks: 'Recommended by Biotechnology Department' },
        { approval_id: 10, application_id: 5, stage_id: 5, officer_id: 3, action: 'Approved', action_date: '2026-07-30 16:30:00', remarks: 'Final Dean Approval recorded' }
    ],

    sanctions: [
        {
            sanction_id: 1,
            sanction_no: 'SANC-2026-00081',
            application_id: 1,
            student_id: 1,
            scheme_id: 1,
            approved_amount: 50000,
            sanction_amount: 50000,
            sanction_date: '2026-07-22',
            sanction_status: 'Fully Disbursed',
            approving_officer_id: 3,
            remarks: 'Full sanctioned amount of ₹50,000 under Merit-cum-Means scheme'
        },
        {
            sanction_id: 2,
            sanction_no: 'SANC-2026-00082',
            application_id: 2,
            student_id: 2,
            scheme_id: 3,
            approved_amount: 60000,
            sanction_amount: 60000,
            sanction_date: '2026-07-23',
            sanction_status: 'Fully Disbursed',
            approving_officer_id: 3,
            remarks: 'Full sanctioned amount of ₹60,000 under Pragati STEM grant'
        },
        {
            sanction_id: 3,
            sanction_no: 'SANC-2026-00083',
            application_id: 3,
            student_id: 3,
            scheme_id: 4,
            approved_amount: 80000,
            sanction_amount: 80000,
            sanction_date: '2026-07-28',
            sanction_status: 'Sanctioned',
            approving_officer_id: 3,
            remarks: 'Full tuition assistance sanction letter generated'
        },
        {
            sanction_id: 4,
            sanction_no: 'SANC-2026-00084',
            application_id: 4,
            student_id: 4,
            scheme_id: 2,
            approved_amount: 75000,
            sanction_amount: 75000,
            sanction_date: '2026-07-29',
            sanction_status: 'Sanctioned',
            approving_officer_id: 3,
            remarks: 'Chancellor Academic Excellence Sanction of ₹75,000 approved'
        }
    ],

    disbursements: [
        {
            disbursement_id: 1,
            disbursement_no: 'DISB-2026-00401',
            sanction_id: 1,
            application_id: 1,
            student_id: 1,
            bank_detail_id: 1,
            amount: 50000,
            payment_mode: 'PFMS',
            transaction_ref: 'PFMS202608129038102',
            payment_date: '2026-08-12',
            payment_status: 'Successful',
            processed_by: 4,
            remarks: 'Direct Benefit Transfer credited successfully to SBI A/c 38920194821'
        },
        {
            disbursement_id: 2,
            disbursement_no: 'DISB-2026-00402',
            sanction_id: 2,
            application_id: 2,
            student_id: 2,
            bank_detail_id: 2,
            amount: 60000,
            payment_mode: 'Direct DBT',
            transaction_ref: 'DBT202608147728190',
            payment_date: '2026-08-14',
            payment_status: 'Successful',
            processed_by: 4,
            remarks: 'Disbursed via RBI DBT gateway to HDFC Bank'
        }
    ],

    renewals: [
        {
            renewal_id: 1,
            previous_application_id: 1,
            previous_sanction_id: 1,
            new_application_id: null,
            student_id: 1,
            scheme_id: 1,
            academic_year: '2026-27',
            current_cgpa: 8.85,
            current_attendance: 92.0,
            renewal_status: 'Approved',
            application_date: '2026-06-25',
            approved_date: '2026-07-05',
            remarks: 'Maintained CGPA above 8.5 in previous year. Renewal sanctioned.'
        },
        {
            renewal_id: 2,
            previous_application_id: 2,
            previous_sanction_id: 2,
            new_application_id: null,
            student_id: 2,
            scheme_id: 3,
            academic_year: '2026-27',
            current_cgpa: 9.42,
            current_attendance: 94.5,
            renewal_status: 'Approved',
            application_date: '2026-06-28',
            approved_date: '2026-07-08',
            remarks: 'Continued academic brilliance in STEM. Renewal approved.'
        },
        {
            renewal_id: 3,
            previous_application_id: 4,
            previous_sanction_id: 4,
            new_application_id: null,
            student_id: 4,
            scheme_id: 2,
            academic_year: '2026-27',
            current_cgpa: 9.78,
            current_attendance: 96.0,
            renewal_status: 'Submitted',
            application_date: '2026-08-01',
            approved_date: null,
            remarks: 'Renewal submitted for final year continuation. Pending review.'
        }
    ],

    audit_logs: [
        { log_id: 1, action_type: 'SCHEME_CREATED', entity_name: 'scholarship_schemes', entity_id: 1, user_id: 1, details: 'Created scheme: Post-Matric Merit-cum-Means Financial Assistance', timestamp: '2026-06-01 10:00:00' },
        { log_id: 2, action_type: 'APPLICATION_SUBMITTED', entity_name: 'applications', entity_id: 1, user_id: 5, details: 'Rahul Sharma submitted application APP-2026-00101', timestamp: '2026-07-10 10:15:00' },
        { log_id: 3, action_type: 'DOCUMENTS_VERIFIED', entity_name: 'verifications', entity_id: 1, user_id: 2, details: 'Dr. Suresh Rao verified all credentials for APP-2026-00101', timestamp: '2026-07-15 14:15:00' },
        { log_id: 4, action_type: 'APPROVAL_GRANTED', entity_name: 'approvals', entity_id: 2, user_id: 3, details: 'Prof. A. K. Verma approved APP-2026-00101 for sanctioning', timestamp: '2026-07-20 15:30:00' },
        { log_id: 5, action_type: 'SANCTION_ISSUED', entity_name: 'sanctions', entity_id: 1, user_id: 3, details: 'Sanction SANC-2026-00081 generated for ₹50,000', timestamp: '2026-07-22 11:20:00' },
        { log_id: 6, action_type: 'DISBURSEMENT_EXECUTED', entity_name: 'disbursements', entity_id: 1, user_id: 4, details: 'Disbursed ₹50,000 via PFMS UTR: PFMS202608129038102', timestamp: '2026-08-12 12:45:00' }
    ]
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = seedData;
}
