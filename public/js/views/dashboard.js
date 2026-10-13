// ============================================================================
// UNIVERSITY SCHOLARSHIP AND FINANCIAL AID MANAGEMENT SYSTEM (SFAMS)
// Enhanced Executive Dashboard with Clickable KPI Drill-downs,
// National Portal External References, and Student Credentials Viewer
// ============================================================================

const DashboardView = {
    cachedData: null,

    // Real-world external portal schemes referenced from national portals
    externalPortalSchemes: [
        {
            name: "Central Sector Scheme of Scholarships for College & University Students (CSSS)",
            portal: "National Scholarship Portal (NSP)",
            portalUrl: "https://scholarships.gov.in",
            ministry: "Department of Higher Education, Ministry of Education, Govt. of India",
            grantAmount: "₹12,000 / yr (UG) to ₹20,000 / yr (PG)",
            eligibility: "Top 80th percentile in Class 12 board examination; Family annual income <= ₹4,50,000; Regular full-time course.",
            deadline: "31 Oct 2026",
            quota: "All States / Central Quota",
            badgeColor: "#0284c7"
        },
        {
            name: "AICTE Pragati Scholarship Scheme for Girl Students (Technical Degree)",
            portal: "AICTE Portal / NSP",
            portalUrl: "https://www.aicte-india.org/schemes/students-development-schemes/Pragati",
            ministry: "All India Council for Technical Education (AICTE)",
            grantAmount: "₹50,000 per annum (Tuition & Device Grant)",
            eligibility: "Female students admitted to 1st year B.Tech/B.E in AICTE approved institutions; Family income <= ₹8,00,000.",
            deadline: "30 Nov 2026",
            quota: "5,000 Scholarships Annually",
            badgeColor: "#7c3aed"
        },
        {
            name: "INSPIRE Scholarship for Higher Education (SHE)",
            portal: "DST INSPIRE Portal",
            portalUrl: "https://online-inspire.gov.in",
            ministry: "Department of Science & Technology, Ministry of Science & Tech, Govt. of India",
            grantAmount: "₹80,000 per annum (₹60,000 Cash + ₹20,000 Mentorship Project)",
            eligibility: "Top 1% ranking in Class 12 boards; pursuing B.Sc/BS-MS in Basic & Natural Sciences; CGPA >= 7.0.",
            deadline: "15 Dec 2026",
            quota: "10,000 Scholarships Nationwide",
            badgeColor: "#059669"
        },
        {
            name: "Ishan Uday Special Scholarship for North Eastern Region (NER)",
            portal: "UGC / National Scholarship Portal",
            portalUrl: "https://www.ugc.gov.in",
            ministry: "University Grants Commission (UGC) & Ministry of DoNER",
            grantAmount: "₹7,800 per month for Technical / Medical degrees",
            eligibility: "Students having permanent domicile of North Eastern Region; Family annual income <= ₹4,50,000.",
            deadline: "31 Oct 2026",
            quota: "10,000 Fresh Awards Yearly",
            badgeColor: "#d97706"
        },
        {
            name: "Post-Matric Scholarship Scheme for SC & ST Students",
            portal: "Ministry of Social Justice & Empowerment",
            portalUrl: "https://scholarships.gov.in",
            ministry: "Ministry of Social Justice and Empowerment, Govt. of India",
            grantAmount: "100% Non-refundable Compulsory Tuition Fees + Monthly Maintenance Allowance",
            eligibility: "Students belonging to SC/ST categories enrolled in post-matriculation courses; Family income <= ₹2,50,000.",
            deadline: "31 Dec 2026",
            quota: "Open DBT Scheme",
            badgeColor: "#dc2626"
        },
        {
            name: "Reliance Foundation Undergraduate & Postgraduate Scholarships",
            portal: "Reliance Foundation Portal",
            portalUrl: "https://www.reliancefoundation.org",
            ministry: "Reliance Foundation Educational Trust",
            grantAmount: "Up to ₹2,00,000 (UG) and ₹6,00,000 (PG)",
            eligibility: "Regular 1st year degree students; Minimum 60% in Class 12; Annual family income <= ₹15,00,000; Merit test.",
            deadline: "15 Oct 2026",
            quota: "5,000 Scholars per Year",
            badgeColor: "#0891b2"
        }
    ],

    async render(container) {
        if (App.currentRole === 'ROLE_STUDENT') {
            await this.renderStudentDashboard(container, App.activeStudentId || 1);
        } else {
            await this.renderExecutiveDashboard(container);
        }
    },

    // ------------------------------------------------------------------------
    // ISOLATED STUDENT DASHBOARD (STRICTLY CONFINED TO HIS OWN PERSONAL DATA)
    // ------------------------------------------------------------------------
    async renderStudentDashboard(container, studentId) {
        container.innerHTML = `
            <div id="student-dash-loading" style="text-align: center; padding: 60px;">
                <div class="spinner"></div>
                <p style="margin-top: 14px; color: var(--primary-500);">Loading your personal scholarship records...</p>
            </div>
            <div id="student-dash-content" style="display: none;"></div>
        `;

        try {
            const res = await API.getStudentDashboard(studentId);
            if (!res.success) throw new Error(res.error || 'Failed to load student profile');

            const { student, bankDetails, applications, stats, eligibleSchemes } = res;
            const contentEl = document.getElementById('student-dash-content');
            const loadingEl = document.getElementById('student-dash-loading');

            const hasBank = !!bankDetails;
            const maskedAcc = hasBank ? `•••• •••• ${bankDetails.account_number.slice(-4)}` : 'Not Linked';

            contentEl.innerHTML = `
                <!-- HEADER -->
                <div class="page-header">
                    <div class="page-title-group">
                        <h1>Student Financial Aid Dashboard</h1>
                        <p class="page-subtitle">Welcome, <strong>${student.first_name} ${student.last_name}</strong> (Roll: <code>${student.roll_number}</code>) &bull; AY 2026-27 Portal</p>
                    </div>
                    <div class="page-actions">
                        <button class="btn btn-secondary" onclick="App.navigate('schemes')">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
                            Explore Schemes
                        </button>
                        <button class="btn btn-primary" onclick="ApplicationsView.startApplicationWizard()">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>
                            Apply for Scholarship
                        </button>
                    </div>
                </div>

                <!-- VERIFIED PERSONAL ACADEMIC STANDING -->
                <div class="card" style="margin-bottom: 24px; border-left: 4px solid #2563eb; background: #ffffff;">
                    <div class="card-header" style="background: transparent; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center;">
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <span style="font-size: 1.3rem;">🎓</span>
                            <h3 class="card-title" style="color: var(--primary-900);">My Authenticated Academic & Personal Profile</h3>
                        </div>
                        <span class="badge badge-verified">✓ Verified 3NF Student Record</span>
                    </div>
                    <div class="card-body" style="padding: 18px 22px;">
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); gap: 14px; font-size: 0.88rem;">
                            <div>
                                <span style="font-size: 0.74rem; text-transform: uppercase; color: var(--primary-500); font-weight: 600;">Student Name</span>
                                <div style="font-weight: 700; color: var(--primary-900); font-size: 0.95rem;">${student.first_name} ${student.last_name}</div>
                            </div>
                            <div>
                                <span style="font-size: 0.74rem; text-transform: uppercase; color: var(--primary-500); font-weight: 600;">Roll Number</span>
                                <div style="font-weight: 700; color: var(--primary-900); font-size: 0.95rem;"><code>${student.roll_number}</code></div>
                            </div>
                            <div>
                                <span style="font-size: 0.74rem; text-transform: uppercase; color: var(--primary-500); font-weight: 600;">Department & Program</span>
                                <div style="font-weight: 700; color: var(--primary-900); font-size: 0.92rem;">${student.department} (${student.program} Sem ${student.semester})</div>
                            </div>
                            <div>
                                <span style="font-size: 0.74rem; text-transform: uppercase; color: var(--primary-500); font-weight: 600;">Academic CGPA</span>
                                <div style="font-weight: 700; color: #2563eb; font-size: 0.95rem;">${student.cgpa} CGPA (${student.academic_percentage}%)</div>
                            </div>
                            <div>
                                <span style="font-size: 0.74rem; text-transform: uppercase; color: var(--primary-500); font-weight: 600;">Category Quota</span>
                                <div style="font-weight: 700; color: var(--primary-900); font-size: 0.95rem;">${student.category}</div>
                            </div>
                            <div>
                                <span style="font-size: 0.74rem; text-transform: uppercase; color: var(--primary-500); font-weight: 600;">Annual Family Income</span>
                                <div style="font-weight: 700; color: #059669; font-size: 0.95rem;">${Utils.formatINR(student.annual_income)}</div>
                            </div>
                            <div>
                                <span style="font-size: 0.74rem; text-transform: uppercase; color: var(--primary-500); font-weight: 600;">Class Attendance</span>
                                <div style="font-weight: 700; color: var(--primary-900); font-size: 0.95rem;">${student.attendance_pct}%</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 4 PERSONAL FINANCIAL KPI CARDS -->
                <div class="stats-grid" style="grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); margin-bottom: 24px;">
                    <div class="stat-card" onclick="App.navigate('applications')">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                            <span style="font-size: 1.5rem;">📝</span>
                            <span class="stat-card-click-hint">Track Status &rarr;</span>
                        </div>
                        <div class="stat-card-title">My Applications</div>
                        <div class="stat-card-value" style="font-size: 1.5rem;">${stats.totalApplications}</div>
                        <div class="stat-card-trend">${stats.pendingCount} Under Scrutiny</div>
                    </div>

                    <div class="stat-card" onclick="App.navigate('applications')">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                            <span style="font-size: 1.5rem;">🏛️</span>
                            <span class="stat-card-click-hint">View Sanction &rarr;</span>
                        </div>
                        <div class="stat-card-title">Sanctioned Grants</div>
                        <div class="stat-card-value" style="font-size: 1.5rem; color: #059669;">${Utils.formatINR(stats.totalSanctioned)}</div>
                        <div class="stat-card-trend">Approved for Session 2026-27</div>
                    </div>

                    <div class="stat-card" onclick="App.navigate('bank')">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                            <span style="font-size: 1.5rem;">💸</span>
                            <span class="stat-card-click-hint">DBT Voucher &rarr;</span>
                        </div>
                        <div class="stat-card-title">Disbursed to My Bank</div>
                        <div class="stat-card-value" style="font-size: 1.5rem; color: #0284c7;">${Utils.formatINR(stats.totalDisbursed)}</div>
                        <div class="stat-card-trend">PFMS Direct Benefit Transfer</div>
                    </div>

                    <div class="stat-card" onclick="App.navigate('bank')">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                            <span style="font-size: 1.5rem;">🏦</span>
                            <span class="stat-card-click-hint">Manage Bank &rarr;</span>
                        </div>
                        <div class="stat-card-title">My DBT Bank Account</div>
                        <div class="stat-card-value" style="font-size: 1.15rem; color: var(--primary-900);">${hasBank ? bankDetails.bank_name : 'No Account'}</div>
                        <div class="stat-card-trend">${hasBank && bankDetails.is_verified ? '✓ Aadhaar Seeded (' + maskedAcc + ')' : 'Verification Pending'}</div>
                    </div>
                </div>

                <!-- MY APPLICATIONS STATUS CARD -->
                <div class="card" style="margin-bottom: 24px;">
                    <div class="card-header" style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <h3 class="card-title">My Active Scholarship Applications (${applications.length})</h3>
                            <p style="font-size: 0.8rem; color: var(--primary-500); margin-top: 2px;">Track multi-stage clearance: Document Verification &rarr; Dean Approval &rarr; Sanction &rarr; PFMS/DBT</p>
                        </div>
                        <button class="btn btn-primary btn-sm" onclick="ApplicationsView.startApplicationWizard()">
                            + Apply for Another Scheme
                        </button>
                    </div>
                    <div class="table-responsive">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Application No</th>
                                    <th>Scheme Name</th>
                                    <th>Academic Year</th>
                                    <th>Current Stage</th>
                                    <th>Status</th>
                                    <th>Sanction / DBT</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${applications.length === 0 ? `
                                    <tr><td colspan="7" style="text-align: center; padding: 30px; color: var(--primary-500);">You have not submitted any applications yet. Click 'Apply for Scholarship' above.</td></tr>
                                ` : applications.map(a => `
                                    <tr>
                                        <td><strong>${a.application_no}</strong></td>
                                        <td>
                                            <strong>${a.scheme_name}</strong>
                                            <div style="font-size: 0.74rem; color: var(--primary-500);">${a.scheme_code} &bull; Max ${Utils.formatINR(a.max_amount)}</div>
                                        </td>
                                        <td>${a.academic_year}</td>
                                        <td><span class="badge badge-submitted">${a.current_stage}</span></td>
                                        <td><span class="badge ${Utils.getStatusBadgeClass(a.status)}">${a.status}</span></td>
                                        <td>
                                            ${a.disbursed_amount > 0 ? `
                                                <div style="font-weight: 700; color: #059669;">${Utils.formatINR(a.disbursed_amount)} Disbursed</div>
                                                <div style="font-size: 0.72rem; color: var(--primary-500);">UTR: <code>${a.transaction_ref || 'PFMS-PROCESSED'}</code></div>
                                            ` : (a.sanction_amount > 0 ? `
                                                <div style="font-weight: 700; color: #2563eb;">${Utils.formatINR(a.sanction_amount)} Sanctioned</div>
                                                <div style="font-size: 0.72rem; color: var(--primary-500);">Order: ${a.sanction_no}</div>
                                            ` : `<span style="color: var(--primary-400); font-size: 0.82rem;">Under Review</span>`)}
                                        </td>
                                        <td>
                                            <button class="btn btn-secondary btn-sm" onclick="ApplicationsView.viewApplicationDetails(${a.application_id})">
                                                Track Details
                                            </button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- PERSONAL SCHOLARSHIP MATCHMAKER (ONLY SCHEMES ELIGIBLE FOR HIM) -->
                <div class="card" style="margin-bottom: 24px; background: linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%); border: 1px solid #bfdbfe;">
                    <div class="card-header" style="background: transparent; border-bottom: 1px solid rgba(0,0,0,0.06); display: flex; justify-content: space-between; align-items: center;">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <span style="font-size: 1.4rem;">🎯</span>
                            <div>
                                <h3 class="card-title" style="color: #1e40af;">Scholarships Recommended Specifically for You</h3>
                                <p style="font-size: 0.8rem; color: #1e3a8a; margin: 0;">Matched against your verified CGPA (${student.cgpa}), Department (${student.department}), and Income (${Utils.formatINR(student.annual_income)})</p>
                            </div>
                        </div>
                        <button class="btn btn-secondary btn-sm" onclick="App.navigate('eligibility')">
                            ⚖️ Run Criteria Evaluation
                        </button>
                    </div>
                    <div class="card-body" style="padding: 18px 22px;">
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(290px, 1fr)); gap: 14px;">
                            ${eligibleSchemes.map(sc => `
                                <div style="background: #ffffff; border: 1px solid #dbeafe; border-radius: 10px; padding: 16px; display: flex; flex-direction: column; justify-content: space-between; box-shadow: var(--shadow-xs);">
                                    <div>
                                        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px;">
                                            <strong style="color: var(--primary-900); font-size: 0.92rem;">${sc.scheme_name}</strong>
                                            <span class="badge badge-disbursed">100% Eligible</span>
                                        </div>
                                        <div style="font-size: 0.74rem; color: #2563eb; font-weight: 600; margin-bottom: 6px;">${sc.scheme_code}</div>
                                        <p style="font-size: 0.8rem; color: var(--primary-600); margin-bottom: 12px; line-height: 1.4;">
                                            ${sc.description || 'Institutional grant supporting meritorious scholars.'}
                                        </p>
                                    </div>
                                    <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-color); padding-top: 10px;">
                                        <strong style="color: #059669; font-size: 0.92rem;">Max Grant: ${Utils.formatINR(sc.max_amount)}</strong>
                                        <button class="btn btn-primary btn-sm" onclick="ApplicationsView.startApplicationWizard(${sc.scheme_id})">
                                            Apply Now &rarr;
                                        </button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `;

            loadingEl.style.display = 'none';
            contentEl.style.display = 'block';
        } catch (err) {
            document.getElementById('student-dash-loading').innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">⚠️</div>
                    <div class="empty-state-title">Error Loading Your Profile</div>
                    <div class="empty-state-desc">${err.message}</div>
                </div>
            `;
        }
    },

    // ------------------------------------------------------------------------
    // EXECUTIVE UNIVERSITY DASHBOARD (ADMIN & INSTITUTIONAL OFFICERS)
    // ------------------------------------------------------------------------
    async renderExecutiveDashboard(container) {
        container.innerHTML = `
            <div class="page-header">
                <div class="page-title-group">
                    <h1>Executive Scholarship Dashboard</h1>
                    <p class="page-subtitle">Central University Financial Aid, Workflow Pipeline & Treasury Metrics (AY 2026-27)</p>
                </div>
                <div class="page-actions">
                    <button class="btn btn-secondary" onclick="App.navigate('reports')">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                        Export Summary
                    </button>
                    <button class="btn btn-primary" onclick="ApplicationsView.startApplicationWizard()">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>
                        New Application
                    </button>
                </div>
            </div>

            <!-- INTERACTIVE QUICK ACTION BAR -->
            <div style="background: linear-gradient(90deg, #1e293b 0%, #0f172a 100%); color: #ffffff; border-radius: var(--border-radius-lg); padding: 16px 22px; margin-bottom: 24px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 14px; box-shadow: var(--shadow-md);">
                <div style="display: flex; align-items: center; gap: 14px;">
                    <div style="width: 42px; height: 42px; border-radius: 10px; background: rgba(37, 99, 235, 0.3); border: 1px solid rgba(59, 130, 246, 0.5); display: flex; align-items: center; justify-content: center; font-size: 1.3rem;">
                        💡
                    </div>
                    <div>
                        <h4 style="color: #ffffff; margin-bottom: 2px;">Interactive Data Drill-Down Active</h4>
                        <p style="font-size: 0.8rem; color: #94a3b8; margin: 0;">Click on any KPI card below to immediately open the filtered student records, application lists, or external national portal references.</p>
                    </div>
                </div>

                <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                    <button class="btn btn-sm" onclick="DashboardView.showActiveSchemesModal()" style="background: rgba(255,255,255,0.15); color: #ffffff; border: 1px solid rgba(255,255,255,0.25);">
                        🌐 National Schemes (NSP / AICTE)
                    </button>
                    <button class="btn btn-sm" onclick="DashboardView.showStudentsModal()" style="background: rgba(37, 99, 235, 0.4); color: #93c5fd; border: 1px solid #3b82f6;">
                        🎓 Student Roster
                    </button>
                    <button class="btn btn-sm" onclick="DashboardView.showApplicationsWithStudentsModal('All')" style="background: rgba(124, 58, 237, 0.4); color: #c4b5fd; border: 1px solid #8b5cf6;">
                        📝 Applications & Student Info
                    </button>
                </div>
            </div>

            <div id="dashboard-loading" style="text-align: center; padding: 40px;">
                <div class="spinner"></div>
                <p style="margin-top: 10px; color: var(--primary-500);">Fetching relational metrics from database views...</p>
            </div>

            <div id="dashboard-content" style="display: none;">
                <!-- SUMMARY METRICS KPI CARDS (ALL CLICKABLE) -->
                <div class="stats-grid" id="stats-container"></div>

                <!-- ANALYTICAL CHARTS GRID -->
                <div class="charts-grid">
                    <!-- Chart 1: Applications by Scheme -->
                    <div class="chart-card">
                        <div class="chart-header">
                            <div>
                                <h3 class="chart-title">Applications by Scholarship Scheme</h3>
                                <p class="chart-subtitle">Demand distribution across active schemes</p>
                            </div>
                            <button class="btn btn-secondary btn-sm" onclick="DashboardView.showActiveSchemesModal()">View Schemes</button>
                        </div>
                        <div class="chart-body" id="chart-schemes"></div>
                    </div>

                    <!-- Chart 2: Status Breakdown -->
                    <div class="chart-card">
                        <div class="chart-header">
                            <div>
                                <h3 class="chart-title">Applications by Lifecycle Status</h3>
                                <p class="chart-subtitle">Pipeline progression breakdown</p>
                            </div>
                            <button class="btn btn-secondary btn-sm" onclick="DashboardView.showApplicationsWithStudentsModal('All')">View All Apps</button>
                        </div>
                        <div class="chart-body" id="chart-status"></div>
                    </div>

                    <!-- Chart 3: Sanctioned vs Disbursed -->
                    <div class="chart-card">
                        <div class="chart-header">
                            <div>
                                <h3 class="chart-title">Sanctioned vs Disbursed Amount</h3>
                                <p class="chart-subtitle">Scheme budget commitment vs actual treasury payment</p>
                            </div>
                            <button class="btn btn-secondary btn-sm" onclick="DashboardView.showSanctionsModal()">Sanctions</button>
                        </div>
                        <div class="chart-body" id="chart-budget"></div>
                    </div>

                    <!-- Chart 4: Department Distribution -->
                    <div class="chart-card">
                        <div class="chart-header">
                            <div>
                                <h3 class="chart-title">Scholarship Distribution by Department</h3>
                                <p class="chart-subtitle">Beneficiary count across academic faculties</p>
                            </div>
                            <button class="btn btn-secondary btn-sm" onclick="DashboardView.showStudentsModal()">Student List</button>
                        </div>
                        <div class="chart-body" id="chart-departments"></div>
                    </div>
                </div>

                <!-- MONTHLY DISBURSEMENT TIMELINE -->
                <div class="card">
                    <div class="card-header">
                        <div>
                            <h3 class="chart-title">Monthly Treasury DBT Disbursements (FY 2026-27)</h3>
                            <p style="font-size: 0.8rem; color: var(--primary-500); margin-top: 2px;">Direct Benefit Transfer expenditure trends</p>
                        </div>
                        <button class="btn btn-secondary btn-sm" onclick="DashboardView.showDisbursementsModal()">
                            Payment Register & Vouchers
                        </button>
                    </div>
                    <div class="card-body">
                        <div id="chart-monthly"></div>
                    </div>
                </div>
            </div>
        `;           </div>
                </div>
            </div>
        `;

        try {
            const res = await API.getDashboardStats();
            if (!res.success) throw new Error(res.error || 'Failed to load dashboard data');

            this.cachedData = res;
            document.getElementById('dashboard-loading').style.display = 'none';
            document.getElementById('dashboard-content').style.display = 'block';

            this.renderKpiCards(res.kpis);
            Charts.renderSchemeChart('chart-schemes', res.charts.appsByScheme);
            Charts.renderStatusDonut('chart-status', res.charts.appsByStatus);
            Charts.renderBudgetComparison('chart-budget', res.charts.budgetComparison);
            Charts.renderDeptDistribution('chart-departments', res.charts.appsByDept);
            Charts.renderMonthlyTrend('chart-monthly', res.charts.monthlyDisbursements);
        } catch (err) {
            document.getElementById('dashboard-loading').innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">⚠️</div>
                    <div class="empty-state-title">Error Loading Metrics</div>
                    <div class="empty-state-desc">${err.message}</div>
                </div>
            `;
        }
    },

    renderKpiCards(kpis) {
        const container = document.getElementById('stats-container');
        if (!container) return;

        if (App.currentRole === 'ROLE_STUDENT') {
            const sInfo = App.studentsCatalog[App.activeStudentId] || App.studentsCatalog[1];
            const cards = [
                { 
                    id: 'card-my-apps',
                    title: 'My Submitted Applications', 
                    value: '1 Application', 
                    trend: 'Track Progress', 
                    accent: 'accent-blue', 
                    icon: '📝',
                    hint: 'Open My Tracker',
                    action: "App.navigate('applications')" 
                },
                { 
                    id: 'card-schemes',
                    title: 'Available Schemes', 
                    value: `${kpis.activeSchemes} Schemes`, 
                    trend: 'University & National', 
                    accent: 'accent-cyan', 
                    icon: '📜',
                    hint: 'Browse & Apply',
                    action: "App.navigate('schemes')" 
                },
                { 
                    id: 'card-my-academic',
                    title: 'My Academic Standing', 
                    value: `${sInfo.cgpa} CGPA`, 
                    trend: `${sInfo.dept} (${sInfo.roll})`, 
                    accent: 'accent-purple', 
                    icon: '🎓',
                    hint: 'Check Rules',
                    action: "App.navigate('eligibility')" 
                },
                { 
                    id: 'card-my-bank',
                    title: 'Direct Benefit Transfer (DBT)', 
                    value: 'Aadhaar Verified', 
                    trend: 'State Bank of India', 
                    accent: 'accent-emerald', 
                    icon: '🏦',
                    hint: 'Bank Details',
                    action: "App.navigate('bank')" 
                }
            ];

            container.innerHTML = cards.map(c => `
                <div class="stat-card" onclick="${c.action}">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                        <span style="font-size: 1.4rem;">${c.icon}</span>
                        <span class="stat-card-click-hint">${c.hint} &rarr;</span>
                    </div>
                    <div class="stat-card-title">${c.title}</div>
                    <div class="stat-card-value" style="font-size: 1.4rem;">${c.value}</div>
                    <div class="stat-card-trend">${c.trend}</div>
                </div>
            `).join('');
            return;
        }

        // Config with click actions for all 11 cards!
        const cards = [
            { 
                id: 'card-students',
                title: 'Total Students', 
                value: kpis.totalStudents, 
                trend: 'Enrolled', 
                accent: 'accent-blue', 
                icon: '🎓',
                hint: 'View Student List',
                action: 'DashboardView.showStudentsModal()' 
            },
            { 
                id: 'card-schemes',
                title: 'Active Scholarship Schemes', 
                value: kpis.activeSchemes, 
                trend: 'Internal & National', 
                accent: 'accent-cyan', 
                icon: '📜',
                hint: 'Explore Schemes',
                action: 'DashboardView.showActiveSchemesModal()' 
            },
            { 
                id: 'card-apps',
                title: 'Total Applications', 
                value: kpis.totalApplications, 
                trend: 'AY 2026-27', 
                accent: 'accent-purple', 
                icon: '📝',
                hint: 'View Student Details',
                action: "DashboardView.showApplicationsWithStudentsModal('All')" 
            },
            { 
                id: 'card-pending',
                title: 'Pending Applications', 
                value: kpis.pendingApplications, 
                trend: 'Awaiting Action', 
                accent: 'accent-amber', 
                icon: '⏳',
                hint: 'Review Queue',
                action: "DashboardView.showApplicationsWithStudentsModal('Pending')" 
            },
            { 
                id: 'card-verified',
                title: 'Verified Applications', 
                value: kpis.verifiedApplications, 
                trend: 'Docs Cleared', 
                accent: 'accent-blue', 
                icon: '🛡️',
                hint: 'View Verified',
                action: "DashboardView.showApplicationsWithStudentsModal('Verified')" 
            },
            { 
                id: 'card-approved',
                title: 'Approved Applications', 
                value: kpis.approvedApplications, 
                trend: 'Ready to Sanction', 
                accent: 'accent-emerald', 
                icon: '✅',
                hint: 'View Approved',
                action: "DashboardView.showApplicationsWithStudentsModal('Approved')" 
            },
            { 
                id: 'card-rejected',
                title: 'Rejected Applications', 
                value: kpis.rejectedApplications, 
                trend: 'Ineligible / Incomplete', 
                accent: 'accent-red', 
                icon: '❌',
                hint: 'View Ineligible',
                action: "DashboardView.showApplicationsWithStudentsModal('Rejected')" 
            },
            { 
                id: 'card-sanctioned',
                title: 'Total Sanctioned Amount', 
                value: Utils.formatINR(kpis.totalSanctionedAmount), 
                trend: 'Committed Aid', 
                accent: 'accent-purple', 
                icon: '🏛️',
                hint: 'Sanction Register',
                action: 'DashboardView.showSanctionsModal()' 
            },
            { 
                id: 'card-disbursed',
                title: 'Total Disbursed Amount', 
                value: Utils.formatINR(kpis.totalDisbursedAmount), 
                trend: 'DBT Credited', 
                accent: 'accent-emerald', 
                icon: '💸',
                hint: 'Payment Register',
                action: 'DashboardView.showDisbursementsModal()' 
            },
            { 
                id: 'card-pending-disb',
                title: 'Pending Disbursements', 
                value: kpis.pendingDisbursements, 
                trend: 'Ready in Treasury', 
                accent: 'accent-amber', 
                icon: '🏦',
                hint: 'Process Payments',
                action: 'App.navigate(\'disbursements\')' 
            },
            { 
                id: 'card-renewals',
                title: 'Renewals Due', 
                value: kpis.renewalsDue, 
                trend: 'Previous Awardees', 
                accent: 'accent-cyan', 
                icon: '🔄',
                hint: 'Renewal Requests',
                action: 'DashboardView.showRenewalsModal()' 
            }
        ];

        container.innerHTML = cards.map(c => `
            <div class="stat-card ${c.accent}" onclick="${c.action}" title="Click to view details">
                <div class="stat-card-header">
                    <span class="stat-card-title">${c.title}</span>
                    <div class="stat-card-icon">${c.icon}</div>
                </div>
                <div class="stat-card-value">${c.value}</div>
                <div class="stat-card-footer">
                    <span class="stat-trend neutral">${c.trend}</span>
                    <span class="stat-card-click-hint">${c.hint} ↗</span>
                </div>
            </div>
        `).join('');
    },

    // ------------------------------------------------------------------------
    // 1. CLICK TOTAL STUDENTS -> SHOW STUDENTS LIST WITH DETAILS
    // ------------------------------------------------------------------------
    async showStudentsModal() {
        const res = await API.getStudents();
        if (!res.success) {
            Utils.showToast('Could not load students list: ' + res.error, 'error');
            return;
        }

        const students = res.data;

        Utils.openModal({
            title: `Enrolled Student Directory (${students.length} Master Records)`,
            sizeClass: 'modal-xl',
            contentHtml: `
                <div style="margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
                    <div style="flex: 1; min-width: 260px;">
                        <input type="text" id="modal-student-search" class="form-control" placeholder="Search by roll number, student name, department..." oninput="DashboardView.filterStudentsModal(this.value)">
                    </div>
                    <div style="display: flex; gap: 8px;">
                        <button class="btn btn-secondary btn-sm" onclick="Utils.closeModal(); App.navigate('students')">
                            Open Full Directory &rarr;
                        </button>
                    </div>
                </div>

                <div class="table-responsive" style="max-height: 480px;">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Roll No / ID</th>
                                <th>Student Name</th>
                                <th>Department & Program</th>
                                <th>Category</th>
                                <th>Academic Merit</th>
                                <th>Annual Income</th>
                                <th>Attendance</th>
                                <th>Bank Account</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody id="modal-students-tbody">
                            ${students.map(s => `
                                <tr class="modal-student-row" data-search="${(s.roll_number + ' ' + s.first_name + ' ' + s.last_name + ' ' + s.department).toLowerCase()}">
                                    <td>
                                        <strong>${s.roll_number}</strong>
                                        <div style="font-size: 0.72rem; color: var(--primary-500);">ID: #${s.student_id}</div>
                                    </td>
                                    <td>
                                        <div style="font-weight: 600; color: var(--primary-900);">${s.first_name} ${s.last_name}</div>
                                        <div style="font-size: 0.74rem; color: var(--primary-500);">${s.email}</div>
                                    </td>
                                    <td>
                                        <div style="font-weight: 500;">${s.department}</div>
                                        <div style="font-size: 0.74rem; color: var(--primary-500);">${s.program} (Sem ${s.semester})</div>
                                    </td>
                                    <td><span class="badge badge-submitted">${s.category}</span></td>
                                    <td>
                                        <strong style="color: var(--accent-blue);">${s.cgpa} CGPA</strong>
                                        <div style="font-size: 0.72rem; color: var(--primary-500);">${s.academic_percentage}%</div>
                                    </td>
                                    <td>
                                        <strong style="color: #047857;">${Utils.formatINR(s.annual_income)}</strong>
                                        <div style="font-size: 0.7rem; color: var(--primary-500);">per year</div>
                                    </td>
                                    <td>
                                        <span style="font-weight: 600; color: ${s.attendance_pct >= 80 ? '#059669' : '#d97706'};">${s.attendance_pct}%</span>
                                    </td>
                                    <td>
                                        <div style="font-size: 0.8rem;">${s.bank_name}</div>
                                        <div style="font-size: 0.72rem; font-family: var(--font-mono); color: var(--primary-500);">${Utils.maskAccount(s.account_number)}</div>
                                    </td>
                                    <td>
                                        <button class="btn btn-secondary btn-sm" onclick="Utils.closeModal(); StudentsView.showProfile(${s.student_id})">
                                            View Profile
                                        </button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `,
            footerHtml: `
                <button class="btn btn-secondary" onclick="Utils.closeModal()">Close</button>
                <button class="btn btn-primary" onclick="Utils.closeModal(); StudentsView.showAddStudentModal()">Enroll New Student</button>
            `
        });
    },

    filterStudentsModal(query) {
        const q = query.toLowerCase().trim();
        const rows = document.querySelectorAll('.modal-student-row');
        rows.forEach(r => {
            const text = r.getAttribute('data-search') || '';
            r.style.display = !q || text.includes(q) ? '' : 'none';
        });
    },

    // ------------------------------------------------------------------------
    // 2. CLICK ACTIVE SCHEMES -> SHOW ACTIVE SCHEMES & EXTERNAL PORTAL REFERENCES
    // ------------------------------------------------------------------------
    async showActiveSchemesModal() {
        const res = await API.getSchemes({ status: 'Active' });
        const internalSchemes = res.success ? res.data : [];

        Utils.openModal({
            title: `Active Scholarship Schemes & Official National Portal References`,
            sizeClass: 'modal-xl',
            contentHtml: `
                <!-- TAB BUTTONS -->
                <div style="display: flex; gap: 8px; margin-bottom: 18px; border-bottom: 1px solid var(--border-color); padding-bottom: 8px;">
                    <button class="btn btn-primary btn-sm" id="modal-tab-btn-internal" onclick="DashboardView.switchSchemeModalTab('internal')">
                        🏛️ University Institutional Schemes (${internalSchemes.length})
                    </button>
                    <button class="btn btn-secondary btn-sm" id="modal-tab-btn-external" onclick="DashboardView.switchSchemeModalTab('external')">
                        🌐 National & Portal Referenced Schemes (${DashboardView.externalPortalSchemes.length})
                    </button>
                </div>

                <!-- TAB 1: INTERNAL UNIVERSITY SCHEMES -->
                <div id="modal-scheme-tab-internal">
                    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 16px; max-height: 480px; overflow-y: auto; padding: 4px;">
                        ${internalSchemes.map(sc => `
                            <div class="card" style="margin-bottom: 0; display: flex; flex-direction: column; justify-content: space-between;">
                                <div class="card-header" style="padding: 12px 16px;">
                                    <div>
                                        <div style="display: flex; gap: 6px; align-items: center; margin-bottom: 4px;">
                                            <span class="badge badge-verified">Active</span>
                                            <code>${sc.scheme_code}</code>
                                        </div>
                                        <strong style="color: var(--primary-900); font-size: 0.95rem;">${sc.scheme_name}</strong>
                                    </div>
                                </div>
                                <div class="card-body" style="padding: 12px 16px; font-size: 0.82rem;">
                                    <p style="color: var(--primary-600); margin-bottom: 10px;">${sc.description}</p>
                                    <div style="background: var(--bg-surface-alt); padding: 8px 12px; border-radius: 6px; line-height: 1.7;">
                                        <div><strong>Max Grant:</strong> <span style="color: #059669; font-weight: 700;">${Utils.formatINR(sc.max_amount)}</span></div>
                                        <div><strong>Min CGPA:</strong> ${sc.min_cgpa} | <strong>Income Cap:</strong> ${Utils.formatINR(sc.max_income)}</div>
                                        <div><strong>Deadline:</strong> ${Utils.formatDate(sc.end_date)}</div>
                                        <div><strong>Target Quota:</strong> ${sc.category_target}</div>
                                    </div>
                                </div>
                                <div class="card-header" style="background: var(--bg-surface-alt); padding: 8px 16px; border-top: 1px solid var(--border-color); border-bottom: none; gap: 6px;">
                                    <button class="btn btn-secondary btn-sm" onclick="Utils.closeModal(); EligibilityView.openCheckModal(null, ${sc.scheme_id})">Check Eligibility</button>
                                    <button class="btn btn-primary btn-sm" onclick="Utils.closeModal(); ApplicationsView.startApplicationWizard(${sc.scheme_id})">Apply Now</button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- TAB 2: NATIONAL & EXTERNAL PORTAL SCHEMES (REFERENCES) -->
                <div id="modal-scheme-tab-external" style="display: none;">
                    <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 12px 16px; margin-bottom: 14px; font-size: 0.82rem; color: #1e40af;">
                        💡 <strong>National Portals & External References:</strong> These schemes are sourced directly from the <strong>National Scholarship Portal (scholarships.gov.in)</strong>, <strong>AICTE</strong>, <strong>UGC</strong>, and national endowment foundations. Students can consult the University Scholarship Cell for bonafide verification and portal nomination.
                    </div>

                    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 16px; max-height: 450px; overflow-y: auto; padding: 4px;">
                        ${DashboardView.externalPortalSchemes.map(ext => `
                            <div class="card" style="margin-bottom: 0; display: flex; flex-direction: column; justify-content: space-between; border-top: 3px solid ${ext.badgeColor};">
                                <div class="card-header" style="padding: 12px 16px;">
                                    <div>
                                        <div style="display: flex; gap: 6px; align-items: center; margin-bottom: 4px; flex-wrap: wrap;">
                                            <span class="badge" style="background: ${ext.badgeColor}22; color: ${ext.badgeColor}; border: 1px solid ${ext.badgeColor}55; font-weight: 700;">
                                                ${ext.portal}
                                            </span>
                                            <span class="badge badge-verified">Accepting Applications</span>
                                        </div>
                                        <strong style="color: var(--primary-900); font-size: 0.95rem;">${ext.name}</strong>
                                        <div style="font-size: 0.72rem; color: var(--primary-500); margin-top: 2px;">Authority: ${ext.ministry}</div>
                                    </div>
                                </div>

                                <div class="card-body" style="padding: 12px 16px; font-size: 0.82rem;">
                                    <div style="background: var(--bg-surface-alt); padding: 10px 12px; border-radius: 6px; line-height: 1.7; margin-bottom: 8px;">
                                        <div><strong>Sanction Aid:</strong> <span style="color: #059669; font-weight: 700;">${ext.grantAmount}</span></div>
                                        <div><strong>Eligibility Benchmark:</strong> ${ext.eligibility}</div>
                                        <div><strong>Application Window:</strong> Deadline ${ext.deadline}</div>
                                        <div><strong>Scope / Quota:</strong> ${ext.quota}</div>
                                    </div>
                                </div>

                                <div class="card-header" style="background: var(--bg-surface-alt); padding: 8px 16px; border-top: 1px solid var(--border-color); border-bottom: none; gap: 6px;">
                                    <a href="${ext.portalUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm" style="flex: 1; text-align: center;">
                                        Visit Official Portal ↗
                                    </a>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `,
            footerHtml: `
                <button class="btn btn-secondary" onclick="Utils.closeModal()">Close</button>
                <button class="btn btn-primary" onclick="Utils.closeModal(); App.navigate('schemes')">Open Full Schemes Catalog &rarr;</button>
            `
        });
    },

    switchSchemeModalTab(tab) {
        const internalBtn = document.getElementById('modal-tab-btn-internal');
        const externalBtn = document.getElementById('modal-tab-btn-external');
        const internalContent = document.getElementById('modal-scheme-tab-internal');
        const externalContent = document.getElementById('modal-scheme-tab-external');

        if (tab === 'internal') {
            internalBtn.className = 'btn btn-primary btn-sm';
            externalBtn.className = 'btn btn-secondary btn-sm';
            internalContent.style.display = 'block';
            externalContent.style.display = 'none';
        } else {
            internalBtn.className = 'btn btn-secondary btn-sm';
            externalBtn.className = 'btn btn-primary btn-sm';
            internalContent.style.display = 'none';
            externalContent.style.display = 'block';
        }
    },

    // ------------------------------------------------------------------------
    // 3. CLICK TOTAL APPLICATIONS -> SHOW APPLICATIONS WITH FULL STUDENT DETAILS
    // ------------------------------------------------------------------------
    async showApplicationsWithStudentsModal(filterStatus = 'All') {
        const res = await API.getApplications();
        if (!res.success) {
            Utils.showToast('Could not load applications: ' + res.error, 'error');
            return;
        }

        let apps = res.data;
        if (filterStatus && filterStatus !== 'All') {
            if (filterStatus === 'Pending') {
                apps = apps.filter(a => a.status === 'Submitted' || a.status === 'Under Verification');
            } else {
                apps = apps.filter(a => a.status.toLowerCase().includes(filterStatus.toLowerCase()));
            }
        }

        Utils.openModal({
            title: `Application Registry & Student Credentials (${apps.length} Applications)`,
            sizeClass: 'modal-xl',
            contentHtml: `
                <div style="margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
                    <div style="flex: 1; min-width: 240px;">
                        <input type="text" id="modal-app-search" class="form-control" placeholder="Search by student name, roll number, app ID..." oninput="DashboardView.filterAppsModal(this.value)">
                    </div>
                    <div style="display: flex; gap: 8px; align-items: center;">
                        <label style="font-weight: 600; font-size: 0.8rem; color: var(--primary-600);">Filter Status:</label>
                        <select class="form-control" style="width: auto; padding: 5px 10px;" onchange="DashboardView.showApplicationsWithStudentsModal(this.value)">
                            <option value="All" ${filterStatus === 'All' ? 'selected' : ''}>All Applications</option>
                            <option value="Pending" ${filterStatus === 'Pending' ? 'selected' : ''}>Pending Verification</option>
                            <option value="Verified" ${filterStatus === 'Verified' ? 'selected' : ''}>Verified by Cell</option>
                            <option value="Approved" ${filterStatus === 'Approved' ? 'selected' : ''}>Approved by Dean</option>
                            <option value="Sanctioned" ${filterStatus === 'Sanctioned' ? 'selected' : ''}>Sanctioned</option>
                            <option value="Disbursed" ${filterStatus === 'Disbursed' ? 'selected' : ''}>Disbursed via DBT</option>
                            <option value="Rejected" ${filterStatus === 'Rejected' ? 'selected' : ''}>Rejected</option>
                        </select>
                    </div>
                </div>

                <div class="table-responsive" style="max-height: 480px;">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>App ID & Date</th>
                                <th>Student Beneficiary</th>
                                <th>Department & Program</th>
                                <th>Category & Family Income</th>
                                <th>Merit (CGPA)</th>
                                <th>Scholarship Scheme</th>
                                <th>Lifecycle Stage</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="modal-apps-tbody">
                            ${apps.map(a => `
                                <tr class="modal-app-row" data-search="${(a.application_no + ' ' + a.student_name + ' ' + a.roll_number + ' ' + a.scheme_name).toLowerCase()}">
                                    <td>
                                        <strong>${a.application_no}</strong>
                                        <div style="font-size: 0.72rem; color: var(--primary-500);">${Utils.formatDate(a.submission_date)}</div>
                                    </td>
                                    <td>
                                        <div style="font-weight: 600; color: var(--primary-900);">${a.student_name}</div>
                                        <div style="font-size: 0.74rem; color: var(--primary-500);">Roll: <code>${a.roll_number}</code></div>
                                    </td>
                                    <td>
                                        <div style="font-weight: 500;">${a.department}</div>
                                        <div style="font-size: 0.72rem; color: var(--primary-500);">${a.program}</div>
                                    </td>
                                    <td>
                                        <span class="badge badge-submitted">${a.category}</span>
                                        <div style="font-size: 0.74rem; color: #047857; font-weight: 600; margin-top: 2px;">${Utils.formatINR(a.annual_income)}</div>
                                    </td>
                                    <td>
                                        <strong style="color: var(--accent-blue);">${a.cgpa} CGPA</strong>
                                    </td>
                                    <td>
                                        <div style="font-weight: 500; font-size: 0.82rem;">${a.scheme_name}</div>
                                        <div style="font-size: 0.72rem; color: #059669; font-weight: 600;">Max: ${Utils.formatINR(a.max_amount)}</div>
                                    </td>
                                    <td>
                                        <span style="font-size: 0.8rem; font-weight: 600; color: var(--accent-blue);">${a.current_stage}</span>
                                    </td>
                                    <td>${Utils.getStatusBadge(a.status)}</td>
                                    <td>
                                        <button class="btn btn-secondary btn-sm" onclick="Utils.closeModal(); ApplicationsView.showApplicationDetail(${a.application_id})">
                                            View Pipeline
                                        </button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `,
            footerHtml: `
                <button class="btn btn-secondary" onclick="Utils.closeModal()">Close</button>
                <button class="btn btn-primary" onclick="Utils.closeModal(); App.navigate('applications')">Open Full Applications Desk &rarr;</button>
            `
        });
    },

    filterAppsModal(query) {
        const q = query.toLowerCase().trim();
        const rows = document.querySelectorAll('.modal-app-row');
        rows.forEach(r => {
            const text = r.getAttribute('data-search') || '';
            r.style.display = !q || text.includes(q) ? '' : 'none';
        });
    },

    // ------------------------------------------------------------------------
    // 4. CLICK SANCTIONS / DISBURSEMENTS / RENEWALS MODALS
    // ------------------------------------------------------------------------
    async showSanctionsModal() {
        const res = await API.getSanctions();
        if (!res.success) return;

        const sanctions = res.data;

        Utils.openModal({
            title: `Sanction Order Register (${sanctions.length} Sanction Orders)`,
            sizeClass: 'modal-xl',
            contentHtml: `
                <div class="table-responsive" style="max-height: 480px;">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Sanction No</th>
                                <th>App ID</th>
                                <th>Beneficiary Student</th>
                                <th>Scheme Name</th>
                                <th>Sanction Amount</th>
                                <th>Date</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${sanctions.map(s => `
                                <tr>
                                    <td><strong>${s.sanction_no}</strong></td>
                                    <td><code>${s.application_no}</code></td>
                                    <td>
                                        <div style="font-weight: 600;">${s.student_name}</div>
                                        <div style="font-size: 0.72rem; color: var(--primary-500);">${s.roll_number} (${s.department})</div>
                                    </td>
                                    <td>${s.scheme_name}</td>
                                    <td><strong style="color: #7c3aed; font-size: 1rem;">${Utils.formatINR(s.sanction_amount)}</strong></td>
                                    <td>${Utils.formatDate(s.sanction_date)}</td>
                                    <td>${Utils.getStatusBadge(s.sanction_status)}</td>
                                    <td>
                                        <button class="btn btn-secondary btn-sm" onclick="Utils.closeModal(); SanctionsView.printSanctionOrder(${s.sanction_id})">
                                            🖨️ Sanction Letter
                                        </button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `,
            footerHtml: `
                <button class="btn btn-secondary" onclick="Utils.closeModal()">Close</button>
                <button class="btn btn-primary" onclick="Utils.closeModal(); App.navigate('sanctions')">Open Full Sanctions Desk &rarr;</button>
            `
        });
    },

    async showDisbursementsModal() {
        const res = await API.getDisbursements();
        if (!res.success) return;

        const disbs = res.data;

        Utils.openModal({
            title: `Treasury Direct Benefit Transfer (DBT) Payouts (${disbs.length} Transactions)`,
            sizeClass: 'modal-xl',
            contentHtml: `
                <div class="table-responsive" style="max-height: 480px;">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Disbursement No</th>
                                <th>Sanction Ref</th>
                                <th>Beneficiary Student</th>
                                <th>Credited Account</th>
                                <th>Amount Paid</th>
                                <th>Mode & UTR Ref</th>
                                <th>Date</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${disbs.map(d => `
                                <tr>
                                    <td><strong>${d.disbursement_no}</strong></td>
                                    <td><code>${d.sanction_no}</code></td>
                                    <td>
                                        <div style="font-weight: 600;">${d.student_name}</div>
                                        <div style="font-size: 0.72rem; color: var(--primary-500);">${d.roll_number}</div>
                                    </td>
                                    <td>${d.bank_name} (<code>${Utils.maskAccount(d.account_number)}</code>)</td>
                                    <td><strong style="color: #059669; font-size: 1rem;">${Utils.formatINR(d.amount)}</strong></td>
                                    <td>
                                        <span class="badge badge-submitted">${d.payment_mode}</span>
                                        <div style="font-family: var(--font-mono); font-size: 0.72rem; color: var(--primary-600); margin-top: 2px;">UTR: ${d.transaction_ref}</div>
                                    </td>
                                    <td>${Utils.formatDate(d.payment_date)}</td>
                                    <td>${Utils.getStatusBadge(d.payment_status)}</td>
                                    <td>
                                        <button class="btn btn-secondary btn-sm" onclick="Utils.closeModal(); DisbursementsView.printVoucher(${d.disbursement_id})">
                                            🖨️ Voucher
                                        </button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `,
            footerHtml: `
                <button class="btn btn-secondary" onclick="Utils.closeModal()">Close</button>
                <button class="btn btn-primary" onclick="Utils.closeModal(); App.navigate('disbursements')">Open Full Treasury Desk &rarr;</button>
            `
        });
    },

    async showRenewalsModal() {
        const res = await API.getRenewals();
        if (!res.success) return;

        const renewals = res.data;

        Utils.openModal({
            title: `Scholarship Renewal Applications (${renewals.length} Records)`,
            sizeClass: 'modal-lg',
            contentHtml: `
                <div class="table-responsive" style="max-height: 450px;">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Renewal ID</th>
                                <th>Beneficiary</th>
                                <th>Scheme</th>
                                <th>Latest CGPA</th>
                                <th>Attendance</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${renewals.map(r => `
                                <tr>
                                    <td><strong>#REN-${r.renewal_id}</strong></td>
                                    <td>${r.student_name} (<code>${r.roll_number}</code>)</td>
                                    <td><strong>${r.scheme_code}</strong></td>
                                    <td><strong style="color: var(--accent-blue);">${r.current_cgpa}</strong></td>
                                    <td><strong style="color: #059669;">${r.current_attendance}%</strong></td>
                                    <td>${Utils.getStatusBadge(r.renewal_status)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `,
            footerHtml: `
                <button class="btn btn-secondary" onclick="Utils.closeModal()">Close</button>
                <button class="btn btn-primary" onclick="Utils.closeModal(); App.navigate('renewals')">Open Full Renewals Desk &rarr;</button>
            `
        });
    }
};
