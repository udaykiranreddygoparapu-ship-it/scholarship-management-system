// ============================================================================
// UNIVERSITY SCHOLARSHIP AND FINANCIAL AID MANAGEMENT SYSTEM (SFAMS)
// Scholarship Schemes Management, Catalog & External Portal References Component
// ============================================================================

const SchemesView = {
    schemesList: [],
    activeTab: 'internal', // 'internal' | 'external'

    // National & Central Portal External References
    externalSchemes: [
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
        },
        {
            name: "Tata Trusts Means and Merit Grant for Higher Education",
            portal: "Tata Trusts Portal",
            portalUrl: "https://www.tatatrusts.org",
            ministry: "Sir Ratan Tata & Allied Educational Trusts",
            grantAmount: "Up to 80% Tuition Waiver Assistance",
            eligibility: "Meritorious students from recognized universities; Family income <= ₹3,00,000; Minimum 65% aggregate.",
            deadline: "15 Nov 2026",
            quota: "Merit & Means Basis",
            badgeColor: "#4f46e5"
        }
    ],

    async render(container) {
        container.innerHTML = `
            <div class="page-header">
                <div class="page-title-group">
                    <h1>Scholarship Schemes Management & National References</h1>
                    <p class="page-subtitle">Configure university institutional endowments & explore active national government portal schemes</p>
                </div>
                <div class="page-actions">
                    ${App.currentRole === 'ROLE_ADMIN' ? `
                        <button class="btn btn-primary" onclick="SchemesView.showAddSchemeModal()">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                            Create New Scheme
                        </button>
                    ` : `
                        <button class="btn btn-primary" onclick="ApplicationsView.startApplicationWizard()">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
                            Apply for Scholarship
                        </button>
                    `}
                </div>
            </div>

            <!-- TAB SWITCHER -->
            <div style="display: flex; gap: 8px; margin-bottom: 20px; border-bottom: 1px solid var(--border-color); padding-bottom: 8px;">
                <button class="btn btn-primary" id="tab-schemes-internal" onclick="SchemesView.switchTab('internal')">
                    🏛️ University Institutional Schemes (<span id="internal-schemes-count">0</span>)
                </button>
                <button class="btn btn-secondary" id="tab-schemes-external" onclick="SchemesView.switchTab('external')">
                    🌐 National & External Portal Schemes (${this.externalSchemes.length} References)
                </button>
            </div>

            <!-- TAB 1: INTERNAL UNIVERSITY SCHEMES -->
            <div id="schemes-content-internal">
                <div id="schemes-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); gap: 20px;">
                    <div style="grid-column: 1 / -1; text-align: center; padding: 40px;"><div class="spinner"></div></div>
                </div>
            </div>

            <!-- TAB 2: NATIONAL & EXTERNAL SCHEMES -->
            <div id="schemes-content-external" style="display: none;">
                <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 14px 18px; margin-bottom: 20px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <span style="font-size: 1.6rem;">🌐</span>
                        <div>
                            <strong style="color: #1e40af;">Official Government Portals & Foundations:</strong>
                            <p style="font-size: 0.82rem; color: #1e3a8a; margin-top: 2px;">Schemes actively accepting applications across the <strong>National Scholarship Portal (NSP)</strong>, <strong>AICTE</strong>, <strong>DST INSPIRE</strong>, <strong>UGC</strong>, and major educational trusts. Click "Visit Official Portal" for direct external submissions.</p>
                        </div>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); gap: 20px;">
                    ${this.externalSchemes.map(ext => `
                        <div class="card" style="display: flex; flex-direction: column; justify-content: space-between; margin-bottom: 0; border-top: 3px solid ${ext.badgeColor};">
                            <div class="card-header" style="align-items: flex-start;">
                                <div>
                                    <div style="display: flex; gap: 6px; align-items: center; margin-bottom: 6px; flex-wrap: wrap;">
                                        <span class="badge" style="background: ${ext.badgeColor}22; color: ${ext.badgeColor}; border: 1px solid ${ext.badgeColor}55; font-weight: 700;">
                                            ${ext.portal}
                                        </span>
                                        <span class="badge badge-verified">Accepting Applications</span>
                                    </div>
                                    <h3 style="font-size: 1.05rem; color: var(--primary-900);">${ext.name}</h3>
                                    <div style="font-size: 0.72rem; color: var(--primary-500); margin-top: 2px;">Authority: ${ext.ministry}</div>
                                </div>
                            </div>

                            <div class="card-body" style="padding-top: 10px; flex: 1;">
                                <div style="background: var(--bg-surface-alt); border-radius: 8px; padding: 12px; margin-bottom: 14px; font-size: 0.82rem; line-height: 1.7;">
                                    <div><strong>Grant / Assistance:</strong> <span style="color: #059669; font-weight: 700;">${ext.grantAmount}</span></div>
                                    <div><strong>Eligibility Criteria:</strong> ${ext.eligibility}</div>
                                    <div><strong>Application Deadline:</strong> <span style="color: #b45309; font-weight: 600;">${ext.deadline}</span></div>
                                    <div><strong>Quota / Scope:</strong> ${ext.quota}</div>
                                </div>
                            </div>

                            <div class="card-header" style="background: var(--bg-surface-alt); border-top: 1px solid var(--border-color); border-bottom: none; gap: 8px;">
                                <a href="${ext.portalUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm" style="flex: 1; text-align: center;">
                                    Visit Official Portal ↗
                                </a>
                                <button class="btn btn-secondary btn-sm" onclick="Utils.showToast('Contact University Scholarship Cell (Academic Block 4) for Bonafide endorsement.', 'info')">
                                    University Helpdesk
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        await this.loadSchemes();
    },

    switchTab(tab) {
        this.activeTab = tab;
        const internalBtn = document.getElementById('tab-schemes-internal');
        const externalBtn = document.getElementById('tab-schemes-external');
        const internalContent = document.getElementById('schemes-content-internal');
        const externalContent = document.getElementById('schemes-content-external');

        if (tab === 'internal') {
            internalBtn.className = 'btn btn-primary';
            externalBtn.className = 'btn btn-secondary';
            internalContent.style.display = 'block';
            externalContent.style.display = 'none';
        } else {
            internalBtn.className = 'btn btn-secondary';
            externalBtn.className = 'btn btn-primary';
            internalContent.style.display = 'none';
            externalContent.style.display = 'block';
        }
    },

    async loadSchemes() {
        const res = await API.getSchemes();
        if (res.success) {
            this.schemesList = res.data;
            const countSpan = document.getElementById('internal-schemes-count');
            if (countSpan) countSpan.textContent = this.schemesList.length;
            this.renderCards(this.schemesList);
        } else {
            Utils.showToast('Failed to load schemes: ' + res.error, 'error');
        }
    },

    renderCards(schemes) {
        const container = document.getElementById('schemes-grid');
        if (!container) return;

        if (schemes.length === 0) {
            container.innerHTML = `<div class="empty-state"><div class="empty-state-title">No scholarship schemes configured yet.</div></div>`;
            return;
        }

        container.innerHTML = schemes.map(sc => `
            <div class="card" style="display: flex; flex-direction: column; justify-content: space-between; margin-bottom: 0;">
                <div class="card-header" style="align-items: flex-start;">
                    <div>
                        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                            <span class="badge ${sc.status === 'Active' ? 'badge-verified' : 'badge-rejected'}">${sc.status}</span>
                            <span style="font-family: var(--font-mono); font-size: 0.75rem; color: var(--primary-500);">${sc.scheme_code}</span>
                        </div>
                        <h3 style="font-size: 1.05rem; color: var(--primary-900);">${sc.scheme_name}</h3>
                    </div>
                </div>

                <div class="card-body" style="padding-top: 14px; flex: 1;">
                    <p style="font-size: 0.84rem; color: var(--primary-600); margin-bottom: 16px; line-height: 1.5;">${sc.description}</p>
                    
                    <div style="background: var(--bg-surface-alt); border-radius: 8px; padding: 12px; margin-bottom: 16px;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 0.82rem;">
                            <span style="color: var(--primary-500);">Financial Grant:</span>
                            <strong style="color: #059669; font-size: 0.95rem;">Up to ${Utils.formatINR(sc.max_amount)}</strong>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 0.82rem;">
                            <span style="color: var(--primary-500);">Min CGPA Required:</span>
                            <strong>${sc.min_cgpa} CGPA (${sc.min_percentage}%)</strong>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 0.82rem;">
                            <span style="color: var(--primary-500);">Family Income Ceiling:</span>
                            <strong>${Utils.formatINR(sc.max_income)} / year</strong>
                        </div>
                        <div style="display: flex; justify-content: space-between; font-size: 0.82rem;">
                            <span style="color: var(--primary-500);">Application Deadline:</span>
                            <strong style="color: #b45309;">${Utils.formatDate(sc.end_date)}</strong>
                        </div>
                    </div>

                    <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                        <span class="badge badge-submitted">Target: ${sc.category_target}</span>
                        <span class="badge badge-approved">${sc.applications_count || 0} Applied</span>
                        <span class="badge badge-sanctioned">${sc.required_docs_count || 0} Docs Req.</span>
                    </div>
                </div>

                <div class="card-header" style="background: var(--bg-surface-alt); border-top: 1px solid var(--border-color); border-bottom: none; gap: 8px;">
                    <button class="btn btn-secondary btn-sm" onclick="SchemesView.showDetails(${sc.scheme_id})">
                        View Details
                    </button>
                    <button class="btn btn-secondary btn-sm" onclick="EligibilityView.openCheckModal(null, ${sc.scheme_id})">
                        Check Eligibility
                    </button>
                    <button class="btn btn-primary btn-sm" onclick="ApplicationsView.startApplicationWizard(${sc.scheme_id})">
                        Apply Now
                    </button>
                </div>
            </div>
        `).join('');
    },

    async showDetails(schemeId) {
        const res = await API.getSchemeById(schemeId);
        if (!res.success) {
            Utils.showToast('Could not load scheme details', 'error');
            return;
        }

        const sc = res.scheme;
        const docs = res.documents;

        Utils.openModal({
            title: `Scheme Specification: ${sc.scheme_name}`,
            sizeClass: 'modal-lg',
            contentHtml: `
                <div style="margin-bottom: 20px;">
                    <p style="font-size: 0.95rem; color: var(--primary-700);">${sc.description}</p>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px;">
                    <div style="background: var(--bg-surface-alt); padding: 16px; border-radius: 8px;">
                        <h4 style="margin-bottom: 10px; color: var(--primary-900);">Statutory Eligibility Criteria</h4>
                        <table style="width: 100%; font-size: 0.85rem; line-height: 1.8;">
                            <tr><td style="color: var(--primary-500);">Minimum CGPA:</td><td><strong>${sc.min_cgpa}</strong> / 10.0</td></tr>
                            <tr><td style="color: var(--primary-500);">Minimum Percentage:</td><td><strong>${sc.min_percentage}%</strong></td></tr>
                            <tr><td style="color: var(--primary-500);">Maximum Family Income:</td><td><strong style="color: #047857;">${Utils.formatINR(sc.max_income)}</strong></td></tr>
                            <tr><td style="color: var(--primary-500);">Minimum Attendance:</td><td><strong>${sc.min_attendance}%</strong></td></tr>
                            <tr><td style="color: var(--primary-500);">Eligible Departments:</td><td>${sc.eligible_departments}</td></tr>
                            <tr><td style="color: var(--primary-500);">Eligible Programs:</td><td>${sc.eligible_programs}</td></tr>
                            <tr><td style="color: var(--primary-500);">Social Categories:</td><td>${sc.eligible_categories}</td></tr>
                        </table>
                    </div>

                    <div style="background: var(--bg-surface-alt); padding: 16px; border-radius: 8px;">
                        <h4 style="margin-bottom: 10px; color: var(--primary-900);">Financial & Grant Bounds</h4>
                        <table style="width: 100%; font-size: 0.85rem; line-height: 1.8;">
                            <tr><td style="color: var(--primary-500);">Scheme Code:</td><td><code>${sc.scheme_code}</code></td></tr>
                            <tr><td style="color: var(--primary-500);">Minimum Grant:</td><td>${Utils.formatINR(sc.min_amount)}</td></tr>
                            <tr><td style="color: var(--primary-500);">Maximum Sanction Cap:</td><td><strong style="color: #059669;">${Utils.formatINR(sc.max_amount)}</strong></td></tr>
                            <tr><td style="color: var(--primary-500);">Academic Session:</td><td>${sc.academic_year}</td></tr>
                            <tr><td style="color: var(--primary-500);">Application Window:</td><td>${Utils.formatDate(sc.start_date)} to ${Utils.formatDate(sc.end_date)}</td></tr>
                            <tr><td style="color: var(--primary-500);">Renewal Permitted:</td><td>${sc.renewal_allowed ? '✅ Yes (Annual)' : '❌ One-time only'}</td></tr>
                            <tr><td style="color: var(--primary-500);">Current Portal Status:</td><td><span class="badge ${sc.status === 'Active' ? 'badge-verified' : 'badge-rejected'}">${sc.status}</span></td></tr>
                        </table>
                    </div>
                </div>

                <div>
                    <h4 style="margin-bottom: 10px; color: var(--primary-900);">Mandatory Verification Documents Checklist</h4>
                    <ul style="padding-left: 20px; font-size: 0.88rem; color: var(--primary-700); line-height: 1.8;">
                        ${docs.map(d => `<li><strong>${d.document_name}</strong> - <span style="color: var(--primary-500);">${d.description || 'Mandatory'}</span></li>`).join('')}
                    </ul>
                </div>
            `,
            footerHtml: `
                <button class="btn btn-secondary" onclick="Utils.closeModal()">Close</button>
                <button class="btn btn-primary" onclick="Utils.closeModal(); ApplicationsView.startApplicationWizard(${sc.scheme_id})">Apply for this Scheme</button>
            `
        });
    },

    showAddSchemeModal() {
        Utils.openModal({
            title: 'Add New Scholarship Scheme to Database',
            sizeClass: 'modal-lg',
            contentHtml: `
                <form id="add-scheme-form">
                    <div class="form-grid">
                        <div class="form-group">
                            <label>Scheme Code <span class="required">*</span></label>
                            <input type="text" id="new-scheme-code" class="form-control" placeholder="SCH-XYZ-2026" required>
                        </div>
                        <div class="form-group" style="grid-column: span 2;">
                            <label>Scheme Title / Name <span class="required">*</span></label>
                            <input type="text" id="new-scheme-name" class="form-control" placeholder="e.g. Chancellor Merit Excellence Award" required>
                        </div>
                        <div class="form-group" style="grid-column: 1 / -1;">
                            <label>Description & Scope <span class="required">*</span></label>
                            <textarea id="new-scheme-desc" class="form-control" placeholder="Detailed purpose and funding guidelines..." required></textarea>
                        </div>
                        <div class="form-group">
                            <label>Target Category Group</label>
                            <input type="text" id="new-scheme-target" class="form-control" value="All">
                        </div>
                        <div class="form-group">
                            <label>Minimum Grant Amount (₹)</label>
                            <input type="number" id="new-scheme-min" class="form-control" value="25000" required>
                        </div>
                        <div class="form-group">
                            <label>Maximum Grant Cap (₹) <span class="required">*</span></label>
                            <input type="number" id="new-scheme-max" class="form-control" value="60000" required>
                        </div>
                        <div class="form-group">
                            <label>Start Date</label>
                            <input type="date" id="new-scheme-start" class="form-control" value="2026-07-01">
                        </div>
                        <div class="form-group">
                            <label>Deadline Date</label>
                            <input type="date" id="new-scheme-end" class="form-control" value="2026-12-31">
                        </div>
                        <div class="form-group">
                            <label>Minimum CGPA Threshold</label>
                            <input type="number" id="new-scheme-cgpa" class="form-control" step="0.1" value="7.50">
                        </div>
                        <div class="form-group">
                            <label>Minimum Percentage (%)</label>
                            <input type="number" id="new-scheme-pct" class="form-control" step="1" value="75">
                        </div>
                        <div class="form-group">
                            <label>Maximum Family Income (₹)</label>
                            <input type="number" id="new-scheme-income" class="form-control" value="350000">
                        </div>
                        <div class="form-group">
                            <label>Minimum Attendance (%)</label>
                            <input type="number" id="new-scheme-att" class="form-control" value="80">
                        </div>
                    </div>
                </form>
            `,
            footerHtml: `
                <button class="btn btn-secondary" onclick="Utils.closeModal()">Cancel</button>
                <button class="btn btn-primary" onclick="SchemesView.submitNewScheme()">Save Scheme</button>
            `
        });
    },

    async submitNewScheme() {
        const payload = {
            scheme_code: document.getElementById('new-scheme-code').value.trim(),
            scheme_name: document.getElementById('new-scheme-name').value.trim(),
            description: document.getElementById('new-scheme-desc').value.trim(),
            category_target: document.getElementById('new-scheme-target').value.trim(),
            min_amount: parseFloat(document.getElementById('new-scheme-min').value),
            max_amount: parseFloat(document.getElementById('new-scheme-max').value),
            start_date: document.getElementById('new-scheme-start').value,
            end_date: document.getElementById('new-scheme-end').value,
            academic_year: '2026-27',
            status: 'Active',
            renewal_allowed: 1,
            min_cgpa: parseFloat(document.getElementById('new-scheme-cgpa').value),
            min_percentage: parseFloat(document.getElementById('new-scheme-pct').value),
            max_income: parseFloat(document.getElementById('new-scheme-income').value),
            min_attendance: parseFloat(document.getElementById('new-scheme-att').value),
            eligible_departments: 'All',
            eligible_programs: 'All',
            eligible_categories: 'All',
            documents: ['Income Certificate', 'Academic Marksheet', 'Bonafide Certificate', 'Bank Passbook Copy']
        };

        if (!payload.scheme_code || !payload.scheme_name || isNaN(payload.max_amount)) {
            Utils.showToast('Please specify Scheme Code, Title and Grant bounds', 'warning');
            return;
        }

        const res = await API.createScheme(payload);
        if (res.success) {
            Utils.showToast('New scholarship scheme added to 3NF database!', 'success');
            Utils.closeModal();
            await this.loadSchemes();
        } else {
            Utils.showToast('Error: ' + res.error, 'error');
        }
    }
};
