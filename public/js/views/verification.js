// ============================================================================
// UNIVERSITY SCHOLARSHIP AND FINANCIAL AID MANAGEMENT SYSTEM (SFAMS)
// Document Verification Desk Component (Verifier Role)
// ============================================================================

const VerificationView = {
    pendingQueue: [],

    async render(container) {
        container.innerHTML = `
            <div class="page-header">
                <div class="page-title-group">
                    <h1>Document Verification Scrutiny Desk</h1>
                    <p class="page-subtitle">Inspect applicant certificates, income returns, academic transcripts, and bonafide credentials</p>
                </div>
            </div>

            <!-- SUMMARY ADVICE -->
            <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 14px 18px; margin-bottom: 20px; display: flex; align-items: center; justify-content: space-between;">
                <div style="display: flex; align-items: center; gap: 12px;">
                    <span style="font-size: 1.5rem;">🛡️</span>
                    <div>
                        <strong style="color: #1e40af;">Verifier Station: Dr. Suresh Rao (Verification Officer)</strong>
                        <p style="font-size: 0.82rem; color: #1e3a8a; margin-top: 2px;">Ensure mandatory income certificates bear Tehsildar seals and semester transcripts match university databases.</p>
                    </div>
                </div>
                <span class="badge badge-under-verification" id="verif-queue-badge">0 Pending in Queue</span>
            </div>

            <!-- VERIFICATION WORK QUEUE TABLE -->
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Submitted Applications Pending Scrutiny</h3>
                </div>
                <div class="table-responsive">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>App ID</th>
                                <th>Student Name</th>
                                <th>Roll Number</th>
                                <th>Scheme Applied</th>
                                <th>Category / Income</th>
                                <th>CGPA</th>
                                <th>Current Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody id="verif-table-body">
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

        // Filter for applications needing verification
        this.pendingQueue = res.data.filter(a => a.status === 'Submitted' || a.status === 'Under Verification');
        const badge = document.getElementById('verif-queue-badge');
        if (badge) badge.textContent = `${this.pendingQueue.length} Pending in Queue`;

        const tbody = document.getElementById('verif-table-body');
        if (!tbody) return;

        if (this.pendingQueue.length === 0) {
            tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 40px; color: var(--primary-500);">🎉 All submitted applications have been verified. No pending items in queue.</td></tr>`;
            return;
        }

        tbody.innerHTML = this.pendingQueue.map(a => `
            <tr>
                <td><strong>${a.application_no}</strong></td>
                <td>
                    <div style="font-weight: 600; color: var(--primary-900);">${a.student_name}</div>
                    <div style="font-size: 0.76rem; color: var(--primary-500);">${a.department}</div>
                </td>
                <td><code>${a.roll_number}</code></td>
                <td>${a.scheme_name}</td>
                <td>
                    <span class="badge badge-submitted">${a.category}</span>
                    <div style="font-size: 0.74rem; color: #047857; font-weight: 600; margin-top: 2px;">${Utils.formatINR(a.annual_income)}</div>
                </td>
                <td><strong style="color: var(--accent-blue);">${a.cgpa}</strong></td>
                <td>${Utils.getStatusBadge(a.status)}</td>
                <td>
                    <button class="btn btn-primary btn-sm" onclick="VerificationView.openScrutinyModal(${a.application_id})">
                        Scrutinize & Verify
                    </button>
                </td>
            </tr>
        `).join('');
    },

    async openScrutinyModal(appId) {
        const res = await API.getApplicationById(appId);
        if (!res.success) {
            Utils.showToast('Could not load application detail', 'error');
            return;
        }

        const a = res.application;
        const docs = res.documents;

        Utils.openModal({
            title: `Document Verification Desk: ${a.application_no}`,
            sizeClass: 'modal-xl',
            contentHtml: `
                <!-- Student & Scheme Brief -->
                <div style="background: var(--bg-surface-alt); padding: 14px 18px; border-radius: 8px; margin-bottom: 20px; display: grid; grid-template-columns: 1fr 1fr; gap: 14px; font-size: 0.85rem;">
                    <div>
                        <strong>Applicant:</strong> ${a.student_name} (${a.roll_number})<br>
                        <strong>Department:</strong> ${a.department} (${a.program}, Sem ${a.semester})<br>
                        <strong>Category:</strong> ${a.category} | <strong>Income:</strong> ${Utils.formatINR(a.annual_income)}
                    </div>
                    <div>
                        <strong>Scheme:</strong> ${a.scheme_name}<br>
                        <strong>Merit:</strong> ${a.cgpa} CGPA | <strong>Attendance:</strong> ${a.attendance_pct}%<br>
                        <strong>Submission Date:</strong> ${Utils.formatDate(a.submission_date)}
                    </div>
                </div>

                <!-- Document Checklist Table -->
                <h4 style="margin-bottom: 10px; color: var(--primary-900);">Document Scrutiny Checklist</h4>
                <div class="table-responsive" style="margin-bottom: 20px;">
                    <table class="data-table" style="font-size: 0.82rem;">
                        <thead>
                            <tr>
                                <th>Document Title</th>
                                <th>Attached File</th>
                                <th>Preview</th>
                                <th>Verification Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${docs.map(d => `
                                <tr>
                                    <td><strong>${d.document_name}</strong></td>
                                    <td><code>${d.file_name}</code> (${d.file_size_kb} KB)</td>
                                    <td>
                                        <button class="btn btn-secondary btn-sm" onclick="VerificationView.previewSimulatedDocument('${d.document_name}', '${a.student_name}')">
                                            🔍 Inspect
                                        </button>
                                    </td>
                                    <td>
                                        <select class="form-control doc-status-select" data-doc-id="${d.app_doc_id}" style="padding: 4px 8px; font-size: 0.8rem; width: 170px;">
                                            <option value="Verified" ${d.status === 'Verified' ? 'selected' : ''}>Verified (Authentic)</option>
                                            <option value="Pending" ${d.status === 'Pending' ? 'selected' : ''}>Pending Scrutiny</option>
                                            <option value="Resubmission Required" ${d.status === 'Resubmission Required' ? 'selected' : ''}>Resubmission Required</option>
                                            <option value="Rejected" ${d.status === 'Rejected' ? 'selected' : ''}>Rejected (Forged/Invalid)</option>
                                        </select>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>

                <!-- Verifier Remarks -->
                <div class="form-group">
                    <label>Verification Officer Assessment Remarks <span class="required">*</span></label>
                    <textarea id="verif-remarks" class="form-control" placeholder="Detail any observations regarding certificate authenticity, seal clarity, or income validity..."></textarea>
                </div>
            `,
            footerHtml: `
                <button class="btn btn-secondary" onclick="Utils.closeModal()">Close</button>
                <button class="btn btn-danger" onclick="VerificationView.submitDecision(${a.application_id}, 'Rejected')">
                    Reject Application
                </button>
                <button class="btn btn-warning" onclick="VerificationView.submitDecision(${a.application_id}, 'Resubmission Required')">
                    Request Resubmission
                </button>
                <button class="btn btn-success" onclick="VerificationView.submitDecision(${a.application_id}, 'Verified')">
                    Approve Verification & Clear
                </button>
            `
        });
    },

    previewSimulatedDocument(docName, studentName) {
        Utils.openModal({
            title: `Simulated Certificate Preview: ${docName}`,
            sizeClass: 'modal-lg',
            contentHtml: `
                <div style="border: 2px dashed #94a3b8; border-radius: 8px; padding: 30px; text-align: center; background: #fdfdfd; font-family: serif; color: #1e293b;">
                    <div style="font-size: 1.1rem; font-weight: bold; text-transform: uppercase; margin-bottom: 6px;">
                        GOVERNMENT OF INDIA / COMPETENT UNIVERSITY AUTHORITY
                    </div>
                    <div style="font-size: 0.9rem; font-style: italic; color: #64748b; margin-bottom: 20px;">
                        OFFICIAL CERTIFICATE RECORD & AUTHENTICATED VERIFICATION SLIP
                    </div>

                    <div style="border-top: 1px solid #cbd5e1; border-bottom: 1px solid #cbd5e1; padding: 20px 0; margin-bottom: 20px; line-height: 1.9; font-size: 0.95rem; text-align: left;">
                        <p>This is to certify that <strong>${studentName}</strong> has duly submitted the credential designated as <strong>"${docName}"</strong> for the Academic Session 2026-27.</p>
                        <p>Verification Code: <code>AUTH-GOV-2026-${Math.floor(100000 + Math.random() * 900000)}</code></p>
                        <p>Digitally Signed & Validated on University Cloud Storage Service.</p>
                    </div>

                    <div style="display: flex; justify-content: space-between; font-size: 0.85rem; color: #475569; padding-top: 10px;">
                        <div>Seal: [REVENUE / ACADEMIC REGISTRAR]</div>
                        <div>Date of Issue: 12-Jul-2026</div>
                    </div>
                </div>
            `,
            footerHtml: `<button class="btn btn-secondary" onclick="Utils.closeModal()">Back to Checklist</button>`
        });
    },

    async submitDecision(appId, decisionStatus) {
        const remarks = document.getElementById('verif-remarks')?.value.trim();
        if (!remarks && decisionStatus !== 'Verified') {
            Utils.showToast('Please state remarks explaining the decision', 'warning');
            return;
        }

        const selects = document.querySelectorAll('.doc-status-select');
        const documentStatuses = {};
        selects.forEach(s => {
            const docId = s.getAttribute('data-doc-id');
            documentStatuses[docId] = s.value;
        });

        const payload = {
            status: decisionStatus,
            remarks: remarks || `Documents verified and cleared for Department Review by Dr. Suresh Rao`,
            verifier_id: 2,
            document_statuses: documentStatuses
        };

        const res = await API.verifyApplication(appId, payload);
        if (res.success) {
            Utils.showToast(`Application successfully updated: ${decisionStatus}!`, 'success');
            Utils.closeModal();
            await this.loadQueue();
        } else {
            Utils.showToast('Verification failed: ' + res.error, 'error');
        }
    }
};
