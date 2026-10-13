// ============================================================================
// UNIVERSITY SCHOLARSHIP AND FINANCIAL AID MANAGEMENT SYSTEM (SFAMS)
// Scholarship Renewal & Continuation Grant Component
// ============================================================================

const RenewalsView = {
    renewalsList: [],

    async render(container) {
        container.innerHTML = `
            <div class="page-header">
                <div class="page-title-group">
                    <h1>Scholarship Renewal & Continuation</h1>
                    <p class="page-subtitle">Track multi-year academic progression, annual renewal eligibility, and continuation grants</p>
                </div>
                <div class="page-actions">
                    <button class="btn btn-primary" onclick="RenewalsView.openRenewalModal()">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
                        Apply for Renewal
                    </button>
                </div>
            </div>

            <!-- RENEWALS ADVICE -->
            <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 14px 18px; margin-bottom: 20px;">
                <strong style="color: #1e40af;">Renewal Policy Guidelines (AY 2026-27):</strong>
                <p style="font-size: 0.82rem; color: #1e3a8a; margin-top: 4px;">Beneficiaries holding existing sanctions must maintain a minimum CGPA of 8.00 and 85% attendance in subsequent semesters without backlogs to remain eligible for continuation grants.</p>
            </div>

            <!-- RENEWALS TABLE -->
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Renewal Applications (<span id="ren-count">0</span>)</h3>
                </div>
                <div class="table-responsive">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Renewal ID</th>
                                <th>Student Beneficiary</th>
                                <th>Scheme Code</th>
                                <th>Previous Sanction</th>
                                <th>Current CGPA</th>
                                <th>Attendance</th>
                                <th>Renewal Status</th>
                                <th>Application Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="renewals-table-body">
                            <tr><td colspan="9" style="text-align: center; padding: 30px;"><div class="spinner"></div></td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        await this.loadRenewals();
    },

    async loadRenewals() {
        const res = await API.getRenewals();
        if (!res.success) {
            Utils.showToast('Failed to load renewals: ' + res.error, 'error');
            return;
        }

        if (App.currentRole === 'ROLE_STUDENT' && App.activeStudentId) {
            this.renewalsList = res.data.filter(r => r.student_id === App.activeStudentId);
        } else {
            this.renewalsList = res.data;
        }

        const countSpan = document.getElementById('ren-count');
        const tbody = document.getElementById('renewals-table-body');
        if (!tbody) return;

        countSpan.textContent = this.renewalsList.length;

        if (this.renewalsList.length === 0) {
            tbody.innerHTML = `<tr><td colspan="9" style="text-align: center; padding: 40px; color: var(--primary-500);">No renewal applications submitted yet.</td></tr>`;
            return;
        }

        tbody.innerHTML = this.renewalsList.map(r => `
            <tr>
                <td><strong>#REN-${r.renewal_id}</strong></td>
                <td>
                    <div style="font-weight: 600; color: var(--primary-900);">${r.student_name}</div>
                    <div style="font-size: 0.74rem; color: var(--primary-500);">${r.roll_number} (${r.department})</div>
                </td>
                <td><strong>${r.scheme_code}</strong></td>
                <td>
                    <code>${r.previous_sanction_no}</code>
                    <div style="font-size: 0.72rem; color: #7c3aed; font-weight: 600;">${Utils.formatINR(r.previous_sanction_amount)}</div>
                </td>
                <td><strong style="color: var(--accent-blue);">${r.current_cgpa} CGPA</strong></td>
                <td><span style="font-weight: 600; color: #059669;">${r.current_attendance}%</span></td>
                <td>${Utils.getStatusBadge(r.renewal_status)}</td>
                <td>${Utils.formatDate(r.application_date)}</td>
                <td>
                    <div style="display: flex; gap: 6px;">
                        ${r.renewal_status === 'Submitted' ? `
                            <button class="btn btn-success btn-sm" onclick="RenewalsView.updateStatus(${r.renewal_id}, 'Approved')">
                                Approve Renewal
                            </button>
                            <button class="btn btn-danger btn-sm" onclick="RenewalsView.updateStatus(${r.renewal_id}, 'Rejected')">
                                Reject
                            </button>
                        ` : `
                            <span style="font-size: 0.76rem; color: var(--primary-500);">Evaluated</span>
                        `}
                    </div>
                </td>
            </tr>
        `).join('');
    },

    async openRenewalModal() {
        // Fetch sanctioned applications that can be renewed
        const appsRes = await API.getApplications({ status: 'Disbursed' });
        if (!appsRes.success) {
            Utils.showToast('Could not load previous awards', 'error');
            return;
        }

        const eligibleApps = appsRes.data;

        if (eligibleApps.length === 0) {
            Utils.showToast('No prior sanctioned applications found for renewal.', 'warning');
            return;
        }

        Utils.openModal({
            title: 'Submit Scholarship Renewal Application',
            sizeClass: 'modal-lg',
            contentHtml: `
                <div class="form-grid">
                    <div class="form-group" style="grid-column: 1 / -1;">
                        <label>Select Previous Sanctioned Award <span class="required">*</span></label>
                        <select id="ren-prev-app" class="form-control" required>
                            ${eligibleApps.map(a => `
                                <option value="${a.application_id}">
                                    ${a.application_no} - ${a.student_name} (${a.scheme_name}) - Disbursed: ${Utils.formatINR(a.disbursed_amount)}
                                </option>
                            `).join('')}
                        </select>
                    </div>

                    <div class="form-group">
                        <label>Current Cumulative CGPA <span class="required">*</span></label>
                        <input type="number" id="ren-cgpa" class="form-control" step="0.01" min="0" max="10" value="8.90" required>
                    </div>

                    <div class="form-group">
                        <label>Current Attendance Percentage (%) <span class="required">*</span></label>
                        <input type="number" id="ren-att" class="form-control" step="0.1" min="0" max="100" value="91.5" required>
                    </div>

                    <div class="form-group" style="grid-column: 1 / -1;">
                        <label>Upload Latest Semester Grade Transcript</label>
                        <input type="file" id="ren-transcript" class="form-control" accept=".pdf,.jpg">
                    </div>

                    <div class="form-group" style="grid-column: 1 / -1;">
                        <label>Renewal Justification & Academic Progress Report</label>
                        <textarea id="ren-remarks" class="form-control" placeholder="Detail recent semester performance, research achievements, or course progression..."></textarea>
                    </div>
                </div>
            `,
            footerHtml: `
                <button class="btn btn-secondary" onclick="Utils.closeModal()">Cancel</button>
                <button class="btn btn-primary" onclick="RenewalsView.submitRenewalApplication()">Submit Renewal Request</button>
            `
        });
    },

    async submitRenewalApplication() {
        const appId = parseInt(document.getElementById('ren-prev-app')?.value);
        const cgpa = parseFloat(document.getElementById('ren-cgpa')?.value);
        const attendance = parseFloat(document.getElementById('ren-att')?.value);
        const remarks = document.getElementById('ren-remarks')?.value.trim();

        if (isNaN(cgpa) || isNaN(attendance)) {
            Utils.showToast('Please specify valid CGPA and attendance', 'warning');
            return;
        }

        const payload = {
            previous_application_id: appId,
            current_cgpa: cgpa,
            current_attendance: attendance,
            remarks: remarks || 'Annual continuation renewal requested by student'
        };

        const res = await API.submitRenewal(payload);
        if (res.success) {
            Utils.showToast('Renewal application registered successfully in relational database!', 'success');
            Utils.closeModal();
            await this.loadRenewals();
        } else {
            Utils.showToast('Error: ' + res.error, 'error');
        }
    },

    async updateStatus(renewalId, status) {
        const remarks = prompt(`Enter remarks for renewal ${status.toLowerCase()}:`, `Continuation grant ${status.toLowerCase()} by Academic Cell`);
        if (remarks === null) return;

        const res = await API.updateRenewalStatus(renewalId, {
            renewal_status: status,
            remarks
        });

        if (res.success) {
            Utils.showToast(`Renewal application marked as ${status}!`, 'success');
            await this.loadRenewals();
        } else {
            Utils.showToast('Failed to update renewal status', 'error');
        }
    }
};
