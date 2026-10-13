// ============================================================================
// UNIVERSITY SCHOLARSHIP AND FINANCIAL AID MANAGEMENT SYSTEM (SFAMS)
// Approvals Desk View Component (Approving Officer / Dean Role)
// ============================================================================

const ApprovalsView = {
    approvalQueue: [],

    async render(container) {
        container.innerHTML = `
            <div class="page-header">
                <div class="page-title-group">
                    <h1>Academic & Departmental Approvals Desk</h1>
                    <p class="page-subtitle">Dean of Academic Affairs & HoD assessment of verified scholarship candidates</p>
                </div>
            </div>

            <!-- SUMMARY ADVICE -->
            <div style="background: #faf5ff; border: 1px solid #e9d5ff; border-radius: 8px; padding: 14px 18px; margin-bottom: 20px; display: flex; align-items: center; justify-content: space-between;">
                <div style="display: flex; align-items: center; gap: 12px;">
                    <span style="font-size: 1.5rem;">⚖️</span>
                    <div>
                        <strong style="color: #6b21a8;">Approving Authority: Prof. A. K. Verma (Dean of Academic Affairs)</strong>
                        <p style="font-size: 0.82rem; color: #581c87; margin-top: 2px;">Review verified student credentials and endorse final institutional recommendations prior to financial sanction issuance.</p>
                    </div>
                </div>
                <span class="badge badge-sanctioned" id="appr-queue-badge">0 Applications Ready</span>
            </div>

            <!-- APPROVAL WORK QUEUE TABLE -->
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Verified Applications Awaiting Approval</h3>
                </div>
                <div class="table-responsive">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>App ID</th>
                                <th>Student Name</th>
                                <th>Department</th>
                                <th>Scheme Applied</th>
                                <th>Merit (CGPA)</th>
                                <th>Current Stage</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody id="approvals-table-body">
                            <tr><td colspan="8" style="text-align: center; padding: 30px;"><div class="spinner"></div></td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        await this.loadQueue();
    },

    async loadQueue() {
        const res = await API.getApplications();
        if (!res.success) {
            Utils.showToast('Failed to load queue: ' + res.error, 'error');
            return;
        }

        // Filter for applications that have been verified and ready for approval
        this.approvalQueue = res.data.filter(a => a.status === 'Verified' || a.current_stage === 'Department Approval' || a.current_stage === 'Final Approval');
        const badge = document.getElementById('appr-queue-badge');
        if (badge) badge.textContent = `${this.approvalQueue.length} Applications Ready`;

        const tbody = document.getElementById('approvals-table-body');
        if (!tbody) return;

        if (this.approvalQueue.length === 0) {
            tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 40px; color: var(--primary-500);">All verified applications have received approvals or are already sanctioned.</td></tr>`;
            return;
        }

        tbody.innerHTML = this.approvalQueue.map(a => `
            <tr>
                <td><strong>${a.application_no}</strong></td>
                <td>
                    <div style="font-weight: 600; color: var(--primary-900);">${a.student_name}</div>
                    <div style="font-size: 0.76rem; color: var(--primary-500);">${a.roll_number}</div>
                </td>
                <td>${a.department}</td>
                <td>
                    <div style="font-weight: 500;">${a.scheme_name}</div>
                    <div style="font-size: 0.74rem; color: #059669; font-weight: 600;">Max Grant: ${Utils.formatINR(a.max_amount)}</div>
                </td>
                <td><strong style="color: var(--accent-blue);">${a.cgpa} CGPA</strong> (${a.academic_percentage}%)</td>
                <td><span style="font-size: 0.8rem; font-weight: 600; color: var(--accent-indigo);">${a.current_stage}</span></td>
                <td>${Utils.getStatusBadge(a.status)}</td>
                <td>
                    <button class="btn btn-primary btn-sm" onclick="ApprovalsView.openApprovalDecisionModal(${a.application_id})">
                        Review & Grant Approval
                    </button>
                </td>
            </tr>
        `).join('');
    },

    async openApprovalDecisionModal(appId) {
        const res = await API.getApplicationById(appId);
        if (!res.success) {
            Utils.showToast('Could not load application detail', 'error');
            return;
        }

        const a = res.application;
        const verifs = res.verifications;

        Utils.openModal({
            title: `Dean's Academic Review: ${a.application_no}`,
            sizeClass: 'modal-lg',
            contentHtml: `
                <div style="background: var(--bg-surface-alt); padding: 14px 18px; border-radius: 8px; margin-bottom: 20px; display: grid; grid-template-columns: 1fr 1fr; gap: 14px; font-size: 0.85rem;">
                    <div>
                        <strong>Applicant:</strong> ${a.student_name} (<code>${a.roll_number}</code>)<br>
                        <strong>Academic Merit:</strong> ${a.cgpa} CGPA | ${a.academic_percentage}%<br>
                        <strong>Social Category:</strong> ${a.category} | <strong>Income:</strong> ${Utils.formatINR(a.annual_income)}
                    </div>
                    <div>
                        <strong>Scheme:</strong> ${a.scheme_name}<br>
                        <strong>Department:</strong> ${a.department} (${a.program})<br>
                        <strong>Permissible Grant Cap:</strong> ${Utils.formatINR(a.max_amount)}
                    </div>
                </div>

                <div style="margin-bottom: 20px;">
                    <h4 style="margin-bottom: 8px; color: var(--primary-900);">Document Verification Log</h4>
                    ${verifs.length === 0 ? '<p style="color: var(--primary-500); font-size: 0.84rem;">Verified by Document Cell.</p>' : `
                        <div style="background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 6px; padding: 10px 14px; font-size: 0.82rem; color: #065f46;">
                            <strong>Verification Officer Remarks:</strong> ${verifs[0].remarks}
                            <div style="font-size: 0.74rem; color: #047857; margin-top: 2px;">Verified on ${Utils.formatDate(verifs[0].verification_date)} by ${verifs[0].verifier_name || 'Dr. Suresh Rao'}</div>
                        </div>
                    `}
                </div>

                <div class="form-group">
                    <label>Approving Officer Assessment & Recommendation Remarks <span class="required">*</span></label>
                    <textarea id="appr-remarks" class="form-control" placeholder="Provide academic review notes, committee endorsement, or reasons for rejection..."></textarea>
                </div>
            `,
            footerHtml: `
                <button class="btn btn-secondary" onclick="Utils.closeModal()">Close</button>
                <button class="btn btn-danger" onclick="ApprovalsView.submitApproval(${a.application_id}, 'Rejected')">
                    Reject Application
                </button>
                <button class="btn btn-primary" onclick="ApprovalsView.submitApproval(${a.application_id}, 'Recommended')">
                    Recommend (Department)
                </button>
                <button class="btn btn-success" onclick="ApprovalsView.submitApproval(${a.application_id}, 'Approved')">
                    Final Dean Approval & Clear for Sanction
                </button>
            `
        });
    },

    async submitApproval(appId, action) {
        const remarks = document.getElementById('appr-remarks')?.value.trim();
        if (!remarks && action === 'Rejected') {
            Utils.showToast('Please state remarks for rejection', 'warning');
            return;
        }

        const payload = {
            action,
            remarks: remarks || `Application ${action.toLowerCase()} by Prof. A. K. Verma (Dean Academic Affairs)`,
            officer_id: 3,
            stage_id: action === 'Approved' ? 5 : 4
        };

        const res = await API.approveApplication(appId, payload);
        if (res.success) {
            Utils.showToast(`Application ${action.toLowerCase()} successfully!`, 'success');
            Utils.closeModal();
            await this.loadQueue();

            if (action === 'Approved') {
                Utils.confirmDialog({
                    title: 'Proceed to Issue Sanction Order?',
                    message: 'This application is now fully approved. Would you like to issue the financial sanction grant order right now?',
                    confirmText: 'Generate Sanction Order',
                    onConfirm: () => {
                        SanctionsView.openCreateSanctionModal(appId);
                    }
                });
            }
        } else {
            Utils.showToast('Approval action failed: ' + res.error, 'error');
        }
    }
};
