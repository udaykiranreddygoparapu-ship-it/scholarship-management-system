// ============================================================================
// UNIVERSITY SCHOLARSHIP AND FINANCIAL AID MANAGEMENT SYSTEM (SFAMS)
// Applications Module: Multi-Step Wizard & 7-Stage Pipeline Tracker
// ============================================================================

const ApplicationsView = {
    applicationsList: [],
    wizardState: {
        currentStep: 1,
        studentId: null,
        schemeId: null,
        eligibilityResult: null,
        uploadedDocs: [],
        bankData: null
    },

    async render(container) {
        const isStudent = App.currentRole === 'ROLE_STUDENT';
        const pageTitle = isStudent ? 'My Scholarship Applications' : 'Scholarship Applications & Tracking';
        const pageSubtitle = isStudent ? 
            'Track your submitted applications, verification status, approvals, and DBT sanction details' : 
            'Track submission lifecycle through verification, academic clearance, sanction, and DBT';
        const tableTitle = isStudent ? 'My Registered Applications' : 'Registered Applications';

        container.innerHTML = `
            <div class="page-header">
                <div class="page-title-group">
                    <h1>${pageTitle}</h1>
                    <p class="page-subtitle">${pageSubtitle}</p>
                </div>
                <div class="page-actions">
                    <button class="btn btn-primary" onclick="ApplicationsView.startApplicationWizard()">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
                        ${isStudent ? 'Apply for Scholarship' : 'Start New Application'}
                    </button>
                </div>
            </div>

            <!-- FILTER BAR -->
            <div class="filter-bar">
                <div class="filter-item" style="flex: 1; min-width: 220px;">
                    <input type="text" id="app-search-input" class="form-control" placeholder="${isStudent ? 'Search my applications...' : 'Search by app ID, student name, roll no...'}" oninput="ApplicationsView.applyFilters()">
                </div>
                <div class="filter-item">
                    <label style="font-weight: 600; font-size: 0.8rem; color: var(--primary-600);">Status:</label>
                    <select id="app-status-filter" class="form-control" style="width: auto;" onchange="ApplicationsView.applyFilters()">
                        <option value="All">All Statuses</option>
                        <option value="Submitted">Submitted</option>
                        <option value="Under Verification">Under Verification</option>
                        <option value="Verified">Verified</option>
                        <option value="Approved">Approved</option>
                        <option value="Sanctioned">Sanctioned</option>
                        <option value="Disbursed">Disbursed</option>
                        <option value="Rejected">Rejected</option>
                    </select>
                </div>
            </div>

            <!-- APPLICATIONS TABLE -->
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">${tableTitle} (<span id="apps-count">0</span>)</h3>
                </div>
                <div class="table-responsive">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>App ID</th>
                                <th>Student</th>
                                <th>Scholarship Scheme</th>
                                <th>Department</th>
                                <th>Submission Date</th>
                                <th>Current Stage</th>
                                <th>Status</th>
                                <th>Sanction / DBT</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="applications-table-body">
                            <tr><td colspan="9" style="text-align: center; padding: 30px;"><div class="spinner"></div></td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        await this.loadApplications();
    },

    async loadApplications() {
        const params = {};
        if (App.currentRole === 'ROLE_STUDENT' && App.activeStudentId) {
            params.studentId = App.activeStudentId;
        }
        const res = await API.getApplications(params);
        if (res.success) {
            this.applicationsList = res.data;
            this.renderTable(this.applicationsList);
        } else {
            Utils.showToast('Failed to load applications: ' + res.error, 'error');
        }
    },

    applyFilters() {
        const query = document.getElementById('app-search-input').value.toLowerCase().trim();
        const status = document.getElementById('app-status-filter').value;

        const filtered = this.applicationsList.filter(a => {
            const matchesQuery = !query ||
                a.application_no.toLowerCase().includes(query) ||
                a.student_name.toLowerCase().includes(query) ||
                a.roll_number.toLowerCase().includes(query) ||
                a.scheme_name.toLowerCase().includes(query);
            
            const matchesStatus = status === 'All' || a.status === status;
            return matchesQuery && matchesStatus;
        });

        this.renderTable(filtered);
    },

    renderTable(list) {
        const tbody = document.getElementById('applications-table-body');
        const countSpan = document.getElementById('apps-count');
        if (!tbody) return;

        countSpan.textContent = list.length;

        if (list.length === 0) {
            tbody.innerHTML = `<tr><td colspan="9" style="text-align: center; padding: 40px; color: var(--primary-500);">No applications found.</td></tr>`;
            return;
        }

        tbody.innerHTML = list.map(a => `
            <tr>
                <td>
                    <strong>${a.application_no}</strong>
                    <div style="font-size: 0.72rem; color: var(--primary-500);">${a.academic_year}</div>
                </td>
                <td>
                    <div style="font-weight: 600; color: var(--primary-900);">${a.student_name}</div>
                    <div style="font-size: 0.76rem; color: var(--primary-500);">${a.roll_number} (${a.category})</div>
                </td>
                <td>
                    <div style="font-weight: 500; font-size: 0.84rem;">${a.scheme_name}</div>
                    <div style="font-size: 0.74rem; color: #059669; font-weight: 600;">Max: ${Utils.formatINR(a.max_amount)}</div>
                </td>
                <td>
                    <div style="font-size: 0.82rem;">${a.department}</div>
                </td>
                <td>
                    <div style="font-size: 0.8rem;">${Utils.formatDate(a.submission_date)}</div>
                </td>
                <td>
                    <span style="font-size: 0.8rem; font-weight: 600; color: var(--accent-blue);">${a.current_stage}</span>
                </td>
                <td>
                    ${Utils.getStatusBadge(a.status)}
                </td>
                <td>
                    ${a.sanction_amount > 0 ? `
                        <div style="font-size: 0.82rem; font-weight: 600; color: #7c3aed;">${Utils.formatINR(a.sanction_amount)}</div>
                        <div style="font-size: 0.72rem; color: ${a.disbursed_amount > 0 ? '#059669' : '#d97706'}; font-weight: 600;">
                            ${a.disbursed_amount > 0 ? `Disbursed (${Utils.formatINR(a.disbursed_amount)})` : 'Pending DBT'}
                        </div>
                    ` : '<span style="color: var(--primary-500); font-size: 0.78rem;">Not Sanctioned</span>'}
                </td>
                <td>
                    <button class="btn btn-secondary btn-sm" onclick="ApplicationsView.showApplicationDetail(${a.application_id})">
                        View Pipeline
                    </button>
                </td>
            </tr>
        `).join('');
    },

    // ------------------------------------------------------------------------
    // APPLICATION LIFECYCLE & 7-STAGE PIPELINE VIEWER
    // ------------------------------------------------------------------------
    async showApplicationDetail(appId) {
        const res = await API.getApplicationById(appId);
        if (!res.success) {
            Utils.showToast('Could not load application detail', 'error');
            return;
        }

        const a = res.application;
        const docs = res.documents;
        const verifs = res.verifications;
        const apprs = res.approvals;
        const sanc = res.sanction;
        const disb = res.disbursement;

        // Stages for the 7-step pipeline
        const stages = [
            { name: 'Submitted', label: '1. Submission' },
            { name: 'Document Verification', label: '2. Doc Check' },
            { name: 'Eligibility Verification', label: '3. Eligibility' },
            { name: 'Department Approval', label: '4. Dept Review' },
            { name: 'Final Approval', label: '5. Dean Approval' },
            { name: 'Sanctioned', label: '6. Sanction' },
            { name: 'Disbursed', label: '7. Disbursement' }
        ];

        let currentStageIndex = 0;
        if (a.status === 'Disbursed') currentStageIndex = 6;
        else if (a.status === 'Sanctioned') currentStageIndex = 5;
        else if (a.status === 'Approved') currentStageIndex = 4;
        else if (a.current_stage === 'Department Approval') currentStageIndex = 3;
        else if (a.status === 'Verified') currentStageIndex = 2;
        else if (a.status === 'Under Verification') currentStageIndex = 1;

        const stepperHtml = `
            <div class="pipeline-stepper" style="margin-bottom: 24px;">
                ${stages.map((st, idx) => {
                    let cls = '';
                    if (a.status === 'Rejected') {
                        cls = idx === currentStageIndex ? 'current' : (idx < currentStageIndex ? 'completed' : '');
                    } else {
                        if (idx < currentStageIndex) cls = 'completed';
                        else if (idx === currentStageIndex) cls = 'current';
                    }
                    return `
                        <div class="pipeline-step ${cls}">
                            <div class="pipeline-icon">${idx < currentStageIndex ? '✓' : (idx + 1)}</div>
                            <div class="pipeline-title">${st.label}</div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;

        Utils.openModal({
            title: `Application Tracker: ${a.application_no}`,
            sizeClass: 'modal-xl',
            contentHtml: `
                ${stepperHtml}

                ${a.status === 'Rejected' ? `
                    <div style="background: var(--danger-light); border: 1px solid var(--danger-border); border-radius: 8px; padding: 14px; margin-bottom: 20px;">
                        <strong style="color: var(--danger);">Application Rejected:</strong>
                        <p style="color: var(--danger); font-size: 0.88rem; margin-top: 4px;">${a.rejection_reason || 'Criteria requirement not satisfied.'}</p>
                    </div>
                ` : ''}

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px;">
                    <!-- Student & Scheme Info -->
                    <div style="background: var(--bg-surface-alt); padding: 16px; border-radius: 8px;">
                        <h4 style="margin-bottom: 8px; color: var(--primary-900);">Applicant Information</h4>
                        <table style="width: 100%; font-size: 0.85rem; line-height: 1.8;">
                            <tr><td style="color: var(--primary-500); width: 38%;">Student Name:</td><td><strong>${a.student_name}</strong></td></tr>
                            <tr><td style="color: var(--primary-500);">Roll Number:</td><td><code>${a.roll_number}</code></td></tr>
                            <tr><td style="color: var(--primary-500);">Department:</td><td>${a.department}</td></tr>
                            <tr><td style="color: var(--primary-500);">Program / Semester:</td><td>${a.program} (Sem ${a.semester})</td></tr>
                            <tr><td style="color: var(--primary-500);">Category:</td><td><span class="badge badge-submitted">${a.category}</span></td></tr>
                            <tr><td style="color: var(--primary-500);">Academic Merit:</td><td><strong>${a.cgpa} CGPA</strong> (${a.academic_percentage}%)</td></tr>
                            <tr><td style="color: var(--primary-500);">Family Annual Income:</td><td><strong style="color: #047857;">${Utils.formatINR(a.annual_income)}</strong></td></tr>
                            <tr><td style="color: var(--primary-500);">Bank Coordinates:</td><td>${a.bank_name || 'N/A'} (<code>${Utils.maskAccount(a.account_number)}</code>)</td></tr>
                        </table>
                    </div>

                    <!-- Scheme & Financial Status -->
                    <div style="background: var(--bg-surface-alt); padding: 16px; border-radius: 8px;">
                        <h4 style="margin-bottom: 8px; color: var(--primary-900);">Scholarship Grant & Stage</h4>
                        <table style="width: 100%; font-size: 0.85rem; line-height: 1.8;">
                            <tr><td style="color: var(--primary-500); width: 38%;">Scheme Applied:</td><td><strong>${a.scheme_name}</strong></td></tr>
                            <tr><td style="color: var(--primary-500);">Scheme Limit:</td><td>${Utils.formatINR(a.max_amount)}</td></tr>
                            <tr><td style="color: var(--primary-500);">Submission Date:</td><td>${Utils.formatDate(a.submission_date)}</td></tr>
                            <tr><td style="color: var(--primary-500);">Current Status:</td><td>${Utils.getStatusBadge(a.status)}</td></tr>
                            <tr><td style="color: var(--primary-500);">Sanction Order:</td><td>${sanc ? `<strong>${sanc.sanction_no}</strong> (${Utils.formatINR(sanc.sanction_amount)})` : 'Not Issued Yet'}</td></tr>
                            <tr><td style="color: var(--primary-500);">Disbursement:</td><td>${disb ? `<span style="color: #059669; font-weight: 700;">Credited: ${Utils.formatINR(disb.amount)}</span> (UTR: <code>${disb.transaction_ref}</code>)` : 'Pending DBT'}</td></tr>
                        </table>
                    </div>
                </div>

                <!-- Verification Documents Scrutiny -->
                <div style="margin-bottom: 24px;">
                    <h4 style="margin-bottom: 10px; color: var(--primary-900);">Uploaded Credentials & Verification Status</h4>
                    <table class="data-table" style="font-size: 0.82rem;">
                        <thead>
                            <tr>
                                <th>Document Name</th>
                                <th>File Name</th>
                                <th>File Size</th>
                                <th>Status</th>
                                <th>Scrutiny Remarks</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${docs.map(d => `
                                <tr>
                                    <td><strong>${d.document_name}</strong></td>
                                    <td><span style="font-family: var(--font-mono);">${d.file_name}</span></td>
                                    <td>${d.file_size_kb} KB</td>
                                    <td>${Utils.getStatusBadge(d.status)}</td>
                                    <td>${d.remarks || '—'}</td>
                                    <td>
                                        <button class="btn btn-secondary btn-sm" onclick="VerificationView.previewSimulatedDocument('${d.document_name}', '${a.student_name}')">
                                            Preview
                                        </button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>

                <!-- Approvals & Audit Trail -->
                <div>
                    <h4 style="margin-bottom: 10px; color: var(--primary-900);">Workflow Audit & Sanction Log</h4>
                    ${apprs.length === 0 ? '<p style="font-size: 0.85rem; color: var(--primary-500);">No approvals recorded yet in the relational log.</p>' : `
                        <div style="display: flex; flex-direction: column; gap: 8px;">
                            ${apprs.map(ap => `
                                <div style="display: flex; align-items: center; justify-content: space-between; background: var(--bg-surface-alt); padding: 8px 12px; border-radius: 6px; font-size: 0.82rem;">
                                    <div>
                                        <strong>${ap.stage_name}:</strong> <span style="color: ${ap.action === 'Approved' ? '#059669' : '#2563eb'}; font-weight: 600;">${ap.action}</span> by ${ap.officer_name || 'Academic Authority'}
                                        <div style="color: var(--primary-500); font-size: 0.75rem;">Remarks: ${ap.remarks || 'None'}</div>
                                    </div>
                                    <div style="font-family: var(--font-mono); color: var(--primary-500); font-size: 0.75rem;">
                                        ${Utils.formatDate(ap.action_date)}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    `}
                </div>
            `,
            footerHtml: `
                <button class="btn btn-secondary" onclick="Utils.closeModal()">Close</button>
                ${sanc ? `
                    <button class="btn btn-primary" onclick="SanctionsView.printSanctionOrder(${sanc.sanction_id})">Print Sanction Order</button>
                ` : ''}
            `
        });
    },

    // ------------------------------------------------------------------------
    // MULTI-STEP APPLICATION SUBMISSION WIZARD
    // Personal Details -> Eligibility -> Documents -> Bank Details -> Review & Submit
    // ------------------------------------------------------------------------
    async startApplicationWizard(preferredSchemeId = null) {
        const studentsRes = await API.getStudents();
        const schemesRes = await API.getSchemes({ status: 'Active' });

        if (!studentsRes.success || !schemesRes.success) {
            Utils.showToast('Could not load student or scheme masters', 'error');
            return;
        }

        const students = studentsRes.data;
        const schemes = schemesRes.data;

        // Set active student if logged in as student, or default to first student
        let selectedStudentId = students[0].student_id;
        if (App.currentRole === 'ROLE_STUDENT' && App.activeStudentId) {
            selectedStudentId = App.activeStudentId;
        }

        const selectedSchemeId = preferredSchemeId || schemes[0].scheme_id;

        this.wizardState = {
            currentStep: 1,
            studentId: selectedStudentId,
            schemeId: selectedSchemeId,
            students,
            schemes,
            eligibilityResult: null,
            documents: []
        };

        this.renderWizardModal();
    },

    renderWizardModal() {
        const { currentStep, studentId, schemeId, students, schemes } = this.wizardState;
        const selectedStudent = students.find(s => s.student_id == studentId) || students[0];
        const selectedScheme = schemes.find(sc => sc.scheme_id == schemeId) || schemes[0];

        // Stepper markup
        const steps = ['1. Personal & Academic', '2. Eligibility Check', '3. Documents', '4. Bank Coordinates', '5. Review & Submit'];
        const stepperHtml = `
            <div class="wizard-stepper">
                ${steps.map((st, idx) => {
                    const stepNum = idx + 1;
                    const cls = stepNum === currentStep ? 'active' : (stepNum < currentStep ? 'completed' : '');
                    return `
                        <div class="wizard-step ${cls}">
                            <div class="wizard-step-circle">${stepNum < currentStep ? '✓' : stepNum}</div>
                            <div class="wizard-step-label">${st}</div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;

        let stepContent = '';

        // Step 1: Personal & Academic Details
        if (currentStep === 1) {
            const isStudent = App.currentRole === 'ROLE_STUDENT';
            stepContent = `
                <div class="form-grid">
                    ${isStudent ? `
                        <div class="form-group">
                            <label>Applying Student <span class="badge badge-verified" style="margin-left: 6px;">✓ Authenticated Student</span></label>
                            <div style="background: var(--bg-surface-alt); border: 1px solid var(--border-color); border-radius: 8px; padding: 10px 14px; font-weight: 600; color: var(--primary-900);">
                                🎓 ${selectedStudent.roll_number} &bull; ${selectedStudent.first_name} ${selectedStudent.last_name} (${selectedStudent.department})
                            </div>
                        </div>
                    ` : `
                        <div class="form-group">
                            <label>Select Applying Student <span class="required">*</span></label>
                            <select id="wiz-student-select" class="form-control" onchange="ApplicationsView.updateWizardStudent(this.value)">
                                ${students.map(s => `
                                    <option value="${s.student_id}" ${s.student_id == studentId ? 'selected' : ''}>
                                        ${s.roll_number} - ${s.first_name} ${s.last_name} (${s.department})
                                    </option>
                                `).join('')}
                            </select>
                        </div>
                    `}

                    <div class="form-group">
                        <label>Select Scholarship Scheme <span class="required">*</span></label>
                        <select id="wiz-scheme-select" class="form-control" onchange="ApplicationsView.updateWizardScheme(this.value)">
                            ${schemes.map(sc => `
                                <option value="${sc.scheme_id}" ${sc.scheme_id == schemeId ? 'selected' : ''}>
                                    ${sc.scheme_code} - ${sc.scheme_name} (Max ${Utils.formatINR(sc.max_amount)})
                                </option>
                            `).join('')}
                        </select>
                    </div>
                </div>

                <div style="background: var(--bg-surface-alt); border-radius: 8px; padding: 18px; margin-top: 14px;">
                    <h4 style="margin-bottom: 12px; color: var(--primary-900);">Student Profile Summary</h4>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; font-size: 0.85rem;">
                        <div><strong>Roll Number:</strong> ${selectedStudent.roll_number}</div>
                        <div><strong>Department:</strong> ${selectedStudent.department}</div>
                        <div><strong>Program / Semester:</strong> ${selectedStudent.program} (Sem ${selectedStudent.semester})</div>
                        <div><strong>Social Category:</strong> ${selectedStudent.category}</div>
                        <div><strong>Academic CGPA:</strong> <span style="color: var(--accent-blue); font-weight: 700;">${selectedStudent.cgpa} CGPA</span> (${selectedStudent.academic_percentage}%)</div>
                        <div><strong>Annual Family Income:</strong> <span style="color: #047857; font-weight: 700;">${Utils.formatINR(selectedStudent.annual_income)}</span></div>
                        <div><strong>Attendance:</strong> ${selectedStudent.attendance_pct}%</div>
                        <div><strong>Email / Phone:</strong> ${selectedStudent.email} | ${selectedStudent.phone}</div>
                    </div>
                </div>
            `;
        }

        // Step 2: Automated Eligibility Check
        else if (currentStep === 2) {
            const el = this.wizardState.eligibilityResult;
            stepContent = `
                <div style="text-align: center; margin-bottom: 18px;">
                    <h3 style="font-size: 1.15rem; color: var(--primary-900);">Automated Eligibility Scrutiny</h3>
                    <p style="font-size: 0.85rem; color: var(--primary-500);">Evaluated against 3NF criteria parameters defined for <strong>${selectedScheme.scheme_name}</strong></p>
                </div>

                ${el ? `
                    <div style="background: ${el.isEligible ? 'var(--success-light)' : 'var(--danger-light)'}; border: 1px solid ${el.isEligible ? 'var(--success-border)' : 'var(--danger-border)'}; border-radius: 8px; padding: 14px; margin-bottom: 16px; text-align: center;">
                        <span style="font-size: 1.3rem;">${el.isEligible ? '✅' : '❌'}</span>
                        <h4 style="color: ${el.isEligible ? 'var(--success)' : 'var(--danger)'}; margin-top: 4px;">
                            ${el.isEligible ? 'Candidate Satisfies All Mandatory Eligibility Rules!' : 'Candidate Ineligible for this Scheme!'}
                        </h4>
                        <p style="font-size: 0.82rem; color: ${el.isEligible ? '#065f46' : '#991b1b'}; margin-top: 2px;">
                            Passed ${el.passedCount} of ${el.checks.length} criteria checks.
                        </p>
                    </div>

                    <table class="data-table" style="font-size: 0.82rem;">
                        <thead>
                            <tr>
                                <th>Criteria Rule</th>
                                <th>Required Benchmark</th>
                                <th>Student Actual</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${el.checks.map(c => `
                                <tr>
                                    <td><strong>${c.criterion}</strong></td>
                                    <td>${c.required}</td>
                                    <td><strong>${c.actual}</strong></td>
                                    <td>
                                        ${c.satisfied ? 
                                            '<span class="badge badge-verified">✓ Satisfied</span>' : 
                                            '<span class="badge badge-rejected">✗ Failed</span>'}
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                ` : '<div style="text-align: center; padding: 20px;"><div class="spinner"></div><p>Evaluating eligibility parameters...</p></div>'}
            `;
        }

        // Step 3: Required Documents
        else if (currentStep === 3) {
            stepContent = `
                <div style="margin-bottom: 16px;">
                    <h4 style="color: var(--primary-900);">Mandatory Supporting Documents Upload</h4>
                    <p style="font-size: 0.85rem; color: var(--primary-500);">Provide scanned copies of authentic certificates issued by competent authorities.</p>
                </div>

                <div style="display: flex; flex-direction: column; gap: 14px;">
                    <div style="background: var(--bg-surface-alt); padding: 14px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <strong>Income Certificate (Current FY)</strong>
                            <div style="font-size: 0.76rem; color: var(--primary-500);">Issued by Revenue Authority / Tehsildar (Max 2MB)</div>
                        </div>
                        <input type="file" id="doc-income" style="font-size: 0.8rem;" accept=".pdf,.jpg">
                    </div>

                    <div style="background: var(--bg-surface-alt); padding: 14px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <strong>Previous Semester Grade Report / Marksheet</strong>
                            <div style="font-size: 0.76rem; color: var(--primary-500);">Verified grade card showing CGPA ${selectedStudent.cgpa}</div>
                        </div>
                        <input type="file" id="doc-marksheet" style="font-size: 0.8rem;" accept=".pdf,.jpg">
                    </div>

                    <div style="background: var(--bg-surface-alt); padding: 14px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <strong>Bonafide Student Certificate</strong>
                            <div style="font-size: 0.76rem; color: var(--primary-500);">Signed by ${selectedStudent.department} Head of Department</div>
                        </div>
                        <input type="file" id="doc-bonafide" style="font-size: 0.8rem;" accept=".pdf,.jpg">
                    </div>

                    <div style="background: var(--bg-surface-alt); padding: 14px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <strong>Bank Passbook Copy / Cancelled Cheque</strong>
                            <div style="font-size: 0.76rem; color: var(--primary-500);">Showing Account Number and IFSC Code clearly</div>
                        </div>
                        <input type="file" id="doc-bank" style="font-size: 0.8rem;" accept=".pdf,.jpg">
                    </div>
                </div>
            `;
        }

        // Step 4: Bank Details
        else if (currentStep === 4) {
            stepContent = `
                <div style="margin-bottom: 16px;">
                    <h4 style="color: var(--primary-900);">Bank Coordinates for Direct Benefit Transfer (DBT)</h4>
                    <p style="font-size: 0.85rem; color: var(--primary-500);">Government scholarship rules mandate active Aadhaar-linked savings account.</p>
                </div>

                <div class="form-grid">
                    <div class="form-group">
                        <label>Account Holder Name <span class="required">*</span></label>
                        <input type="text" id="wiz-bank-holder" class="form-control" value="${selectedStudent.first_name} ${selectedStudent.last_name}" required>
                    </div>
                    <div class="form-group">
                        <label>Bank Name <span class="required">*</span></label>
                        <select id="wiz-bank-name" class="form-control" required>
                            <option value="State Bank of India">State Bank of India</option>
                            <option value="HDFC Bank">HDFC Bank</option>
                            <option value="Punjab National Bank">Punjab National Bank</option>
                            <option value="ICICI Bank">ICICI Bank</option>
                            <option value="Bank of Baroda">Bank of Baroda</option>
                            <option value="Canara Bank">Canara Bank</option>
                            <option value="Union Bank of India">Union Bank of India</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Savings Account Number <span class="required">*</span></label>
                        <input type="text" id="wiz-bank-acc" class="form-control" placeholder="e.g. 38920194821" value="38920194821" required>
                    </div>
                    <div class="form-group">
                        <label>Bank IFSC Code <span class="required">*</span></label>
                        <input type="text" id="wiz-bank-ifsc" class="form-control" placeholder="SBIN0001234" value="SBIN0001234" required style="text-transform: uppercase;">
                    </div>
                    <div class="form-group" style="grid-column: span 2;">
                        <label>Branch Name & City</label>
                        <input type="text" id="wiz-bank-branch" class="form-control" placeholder="University Campus Branch" value="University Campus Branch">
                    </div>
                </div>
            `;
        }

        // Step 5: Review & Submit
        else if (currentStep === 5) {
            stepContent = `
                <div style="text-align: center; margin-bottom: 20px;">
                    <h3 style="font-size: 1.2rem; color: var(--primary-900);">Final Application Verification</h3>
                    <p style="font-size: 0.85rem; color: var(--primary-500);">Review details before submitting to transactional pipeline.</p>
                </div>

                <div style="background: var(--bg-surface-alt); border-radius: 8px; padding: 18px; margin-bottom: 18px;">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; font-size: 0.85rem;">
                        <div><strong>Applicant:</strong> ${selectedStudent.first_name} ${selectedStudent.last_name} (${selectedStudent.roll_number})</div>
                        <div><strong>Department:</strong> ${selectedStudent.department}</div>
                        <div><strong>Scholarship Scheme:</strong> <strong>${selectedScheme.scheme_name}</strong></div>
                        <div><strong>Grant Ceiling:</strong> <span style="color: #059669; font-weight: 700;">${Utils.formatINR(selectedScheme.max_amount)}</span></div>
                        <div><strong>Academic Merit:</strong> ${selectedStudent.cgpa} CGPA (${selectedStudent.academic_percentage}%)</div>
                        <div><strong>Income Level:</strong> ${Utils.formatINR(selectedStudent.annual_income)}</div>
                        <div><strong>Bank Account:</strong> State Bank of India (<code>•••• •••• 4821</code>)</div>
                        <div><strong>Academic Session:</strong> 2026-27</div>
                    </div>
                </div>

                <div class="form-group">
                    <label>Additional Remarks / Justification (Optional)</label>
                    <textarea id="wiz-remarks" class="form-control" placeholder="Any special achievements, extenuating circumstances, or notes..."></textarea>
                </div>

                <div style="display: flex; gap: 8px; align-items: center; margin-top: 10px;">
                    <input type="checkbox" id="wiz-declaration" checked required>
                    <label for="wiz-declaration" style="font-size: 0.82rem; color: var(--primary-700);">
                        I declare that all submitted information is authentic and subject to disciplinary scrutiny under University Bylaws.
                    </label>
                </div>
            `;
        }

        // Modal Footer buttons
        const footerHtml = `
            ${currentStep > 1 ? `
                <button class="btn btn-secondary" onclick="ApplicationsView.prevStep()">Previous</button>
            ` : `
                <button class="btn btn-secondary" onclick="Utils.closeModal()">Cancel</button>
            `}

            ${currentStep < 5 ? `
                <button class="btn btn-primary" onclick="ApplicationsView.nextStep()">Next Step &rarr;</button>
            ` : `
                <button class="btn btn-success" id="btn-final-submit" onclick="ApplicationsView.submitWizardApplication()">
                    Confirm & Submit Application
                </button>
            `}
        `;

        Utils.openModal({
            title: `Scholarship Application Wizard - Step ${currentStep} of 5`,
            sizeClass: 'modal-lg',
            contentHtml: `
                ${stepperHtml}
                ${stepContent}
            `,
            footerHtml
        });
    },

    updateWizardStudent(val) {
        this.wizardState.studentId = parseInt(val);
        this.renderWizardModal();
    },

    updateWizardScheme(val) {
        this.wizardState.schemeId = parseInt(val);
        this.renderWizardModal();
    },

    async nextStep() {
        if (this.wizardState.currentStep === 1) {
            // Run eligibility check before proceeding to step 2
            const res = await API.checkEligibility(this.wizardState.studentId, this.wizardState.schemeId);
            if (res.success) {
                this.wizardState.eligibilityResult = res;
            } else {
                Utils.showToast('Eligibility check failed: ' + res.error, 'error');
                return;
            }
            this.wizardState.currentStep = 2;
            this.renderWizardModal();
        } else if (this.wizardState.currentStep === 2) {
            if (!this.wizardState.eligibilityResult?.isEligible) {
                Utils.showToast('System Constraint: Cannot proceed with application because mandatory eligibility criteria failed.', 'error');
                return;
            }
            this.wizardState.currentStep = 3;
            this.renderWizardModal();
        } else if (this.wizardState.currentStep === 3) {
            this.wizardState.currentStep = 4;
            this.renderWizardModal();
        } else if (this.wizardState.currentStep === 4) {
            const acc = document.getElementById('wiz-bank-acc')?.value;
            const ifsc = document.getElementById('wiz-bank-ifsc')?.value;
            if (!acc || !ifsc) {
                Utils.showToast('Please provide valid bank account number and IFSC', 'warning');
                return;
            }
            this.wizardState.currentStep = 5;
            this.renderWizardModal();
        }
    },

    prevStep() {
        if (this.wizardState.currentStep > 1) {
            this.wizardState.currentStep--;
            this.renderWizardModal();
        }
    },

    async submitWizardApplication() {
        const btn = document.getElementById('btn-final-submit');
        if (btn) btn.disabled = true;

        const remarks = document.getElementById('wiz-remarks')?.value;

        const payload = {
            student_id: this.wizardState.studentId,
            scheme_id: this.wizardState.schemeId,
            academic_year: '2026-27',
            remarks: remarks || 'Student application submitted via online portal'
        };

        const res = await API.submitApplication(payload);
        if (res.success) {
            Utils.showToast(`Application ${res.application_no} submitted successfully!`, 'success');
            Utils.closeModal();
            await this.loadApplications();
        } else {
            Utils.showToast('Submission Rejected: ' + res.error, 'error', 6000);
            if (btn) btn.disabled = false;
        }
    },

    viewApplicationDetails(appId) {
        return this.showApplicationDetail(appId);
    }
};
