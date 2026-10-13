// ============================================================================
// UNIVERSITY SCHOLARSHIP AND FINANCIAL AID MANAGEMENT SYSTEM (SFAMS)
// Sanction Management & Official Grant Letter Component
// ============================================================================

const SanctionsView = {
    sanctionsList: [],

    async render(container) {
        container.innerHTML = `
            <div class="page-header">
                <div class="page-title-group">
                    <h1>Scholarship Sanction Management</h1>
                    <p class="page-subtitle">Official financial grant commitments, sanction registers, and ceiling enforcement</p>
                </div>
                <div class="page-actions">
                    <button class="btn btn-primary" onclick="SanctionsView.openCreateSanctionModal()">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
                        Issue Sanction Order
                    </button>
                </div>
            </div>

            <!-- SANCTIONS TABLE -->
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Sanction Register (<span id="sanc-count">0</span> Orders)</h3>
                </div>
                <div class="table-responsive">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Sanction No</th>
                                <th>App ID</th>
                                <th>Student Beneficiary</th>
                                <th>Scholarship Scheme</th>
                                <th>Sanction Amount</th>
                                <th>Sanction Date</th>
                                <th>Status</th>
                                <th>Treasury DBT</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="sanctions-table-body">
                            <tr><td colspan="9" style="text-align: center; padding: 30px;"><div class="spinner"></div></td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        await this.loadSanctions();
    },

    async loadSanctions() {
        const res = await API.getSanctions();
        if (!res.success) {
            Utils.showToast('Failed to load sanctions: ' + res.error, 'error');
            return;
        }

        this.sanctionsList = res.data;
        const countSpan = document.getElementById('sanc-count');
        const tbody = document.getElementById('sanctions-table-body');
        if (!tbody) return;

        countSpan.textContent = this.sanctionsList.length;

        if (this.sanctionsList.length === 0) {
            tbody.innerHTML = `<tr><td colspan="9" style="text-align: center; padding: 40px; color: var(--primary-500);">No sanction orders issued yet.</td></tr>`;
            return;
        }

        tbody.innerHTML = this.sanctionsList.map(s => `
            <tr>
                <td><strong>${s.sanction_no}</strong></td>
                <td><code>${s.application_no}</code></td>
                <td>
                    <div style="font-weight: 600; color: var(--primary-900);">${s.student_name}</div>
                    <div style="font-size: 0.76rem; color: var(--primary-500);">${s.roll_number} (${s.department})</div>
                </td>
                <td>
                    <div style="font-weight: 500;">${s.scheme_name}</div>
                    <div style="font-size: 0.72rem; color: var(--primary-500);">Cap: ${Utils.formatINR(s.scheme_max_limit)}</div>
                </td>
                <td>
                    <strong style="font-size: 1rem; color: #7c3aed;">${Utils.formatINR(s.sanction_amount)}</strong>
                </td>
                <td>${Utils.formatDate(s.sanction_date)}</td>
                <td>${Utils.getStatusBadge(s.sanction_status)}</td>
                <td>
                    ${s.disbursed_amount > 0 ? `
                        <span class="badge badge-disbursed">Disbursed (${Utils.formatINR(s.disbursed_amount)})</span>
                    ` : `
                        <span class="badge badge-pending">Ready for DBT</span>
                    `}
                </td>
                <td>
                    <div style="display: flex; gap: 6px;">
                        <button class="btn btn-secondary btn-sm" onclick="SanctionsView.printSanctionOrder(${s.sanction_id})">
                            🖨️ Sanction Letter
                        </button>
                        ${s.disbursed_amount === 0 ? `
                            <button class="btn btn-success btn-sm" onclick="DisbursementsView.openPaymentModal(${s.sanction_id})">
                                Disburse
                            </button>
                        ` : ''}
                    </div>
                </td>
            </tr>
        `).join('');
    },

    async openCreateSanctionModal(preselectedAppId = null) {
        const appsRes = await API.getApplications();
        if (!appsRes.success) {
            Utils.showToast('Could not load applications', 'error');
            return;
        }

        // Only applications that are Approved or Verified (and not yet sanctioned)
        const readyApps = appsRes.data.filter(a => 
            (a.status === 'Approved' || a.status === 'Verified') && (!a.sanction_no || a.sanction_no === '')
        );

        if (readyApps.length === 0) {
            Utils.showToast('No applications currently pending sanction order issuance.', 'info');
            return;
        }

        const selectedApp = preselectedAppId ? 
            readyApps.find(a => a.application_id == preselectedAppId) || readyApps[0] : 
            readyApps[0];

        Utils.openModal({
            title: 'Issue Financial Sanction Order',
            sizeClass: 'modal-lg',
            contentHtml: `
                <div class="form-grid">
                    <div class="form-group" style="grid-column: 1 / -1;">
                        <label>Select Approved Application <span class="required">*</span></label>
                        <select id="sanc-app-select" class="form-control" onchange="SanctionsView.onAppSelected(this.value)">
                            ${readyApps.map(a => `
                                <option value="${a.application_id}" ${a.application_id == selectedApp.application_id ? 'selected' : ''}>
                                    ${a.application_no} - ${a.student_name} (${a.scheme_name}) - Cap: ${Utils.formatINR(a.max_amount)}
                                </option>
                            `).join('')}
                        </select>
                    </div>

                    <div class="form-group">
                        <label>Scholarship Scheme Max Limit</label>
                        <input type="text" id="sanc-max-cap" class="form-control" value="${Utils.formatINR(selectedApp.max_amount)}" readonly>
                    </div>

                    <div class="form-group">
                        <label>Sanction Amount (₹) <span class="required">*</span></label>
                        <input type="number" id="sanc-amount-input" class="form-control" value="${selectedApp.max_amount}" min="1000" max="${selectedApp.max_amount}" required>
                        <small style="color: var(--primary-500); font-size: 0.75rem;">Must not exceed scheme maximum ceiling.</small>
                    </div>

                    <div class="form-group" style="grid-column: 1 / -1;">
                        <label>Sanction Order Remarks & Budget Head</label>
                        <textarea id="sanc-remarks" class="form-control" placeholder="e.g. Budget Head: Central Welfare Fund 2026-27 Sub-Head 04..."></textarea>
                    </div>
                </div>

                <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 12px; margin-top: 14px; font-size: 0.82rem; color: #1e40af;">
                    <strong>Business Rule Constraint:</strong> The relational database verifies that <code>sanction_amount &le; max_amount</code>. Any attempt to sanction above the scheme cap will trigger an automatic constraint rollback.
                </div>
            `,
            footerHtml: `
                <button class="btn btn-secondary" onclick="Utils.closeModal()">Cancel</button>
                <button class="btn btn-primary" onclick="SanctionsView.submitSanction()">Confirm & Issue Sanction</button>
            `
        });
    },

    onAppSelected(appId) {
        // Reload modal with selected app
        this.openCreateSanctionModal(appId);
    },

    async submitSanction() {
        const appId = parseInt(document.getElementById('sanc-app-select')?.value);
        const amount = parseFloat(document.getElementById('sanc-amount-input')?.value);
        const remarks = document.getElementById('sanc-remarks')?.value.trim();

        if (isNaN(amount) || amount <= 0) {
            Utils.showToast('Please specify a valid sanction amount', 'warning');
            return;
        }

        const payload = {
            application_id: appId,
            sanction_amount: amount,
            approving_officer_id: 3,
            remarks: remarks || 'Sanction order confirmed under University Scholarship Cell'
        };

        const res = await API.createSanction(payload);
        if (res.success) {
            Utils.showToast(`Sanction Order ${res.sanction_no} created successfully!`, 'success');
            Utils.closeModal();
            await this.loadSanctions();
        } else {
            Utils.showToast('Sanction Failed: ' + res.error, 'error', 6000);
        }
    },

    printSanctionOrder(sanctionId) {
        const s = this.sanctionsList.find(item => item.sanction_id === sanctionId);
        if (!s) return;

        Utils.openModal({
            title: `Sanction Order Document: ${s.sanction_no}`,
            sizeClass: 'modal-lg',
            contentHtml: `
                <div id="sanction-letter-print-area" class="official-letterhead">
                    <div class="letterhead-header">
                        <div class="letterhead-univ-name">CENTRAL APEX UNIVERSITY</div>
                        <div class="letterhead-sub">OFFICE OF DEAN (STUDENT WELFARE) & SCHOLARSHIP CELL</div>
                        <div style="font-size: 0.85rem; margin-top: 4px;">Accredited 'A++' Grade by NAAC | University Enclave</div>
                    </div>

                    <div style="display: flex; justify-content: space-between; margin-bottom: 24px; font-size: 0.95rem;">
                        <div><strong>Order No:</strong> ${s.sanction_no}</div>
                        <div><strong>Date:</strong> ${Utils.formatDate(s.sanction_date)}</div>
                    </div>

                    <div style="text-align: center; font-weight: bold; font-size: 1.15rem; text-decoration: underline; margin-bottom: 20px;">
                        FINANCIAL SANCTION ORDER
                    </div>

                    <p style="text-align: justify; line-height: 1.8; margin-bottom: 16px; font-size: 0.95rem;">
                        Sanction of the Competent Authority is hereby accorded for the grant of <strong>${s.scheme_name}</strong> for the Academic Session <strong>2026-27</strong> in favor of <strong>${s.student_name}</strong> (Roll Number: <strong>${s.roll_number}</strong>), Department of <strong>${s.department}</strong>, for an approved amount of:
                    </p>

                    <div style="background: #f8fafc; border: 1px solid #cbd5e1; padding: 14px; text-align: center; font-size: 1.3rem; font-weight: bold; margin: 18px 0;">
                        ${Utils.formatINR(s.sanction_amount)}
                    </div>

                    <p style="text-align: justify; line-height: 1.8; font-size: 0.95rem; margin-bottom: 14px;">
                        The expenditure is debitable to the University Student Financial Aid Endowment Fund (Budget Head: 2026-AY-SCHOLARSHIP). The Finance Section is authorized to disburse the amount directly into the beneficiary's authenticated bank account via PFMS / Direct Benefit Transfer (DBT).
                    </p>

                    <div style="display: flex; justify-content: space-between; margin-top: 50px; font-size: 0.9rem;">
                        <div style="text-align: center;">
                            <div>_______________________</div>
                            <div style="font-weight: bold; margin-top: 4px;">Prepared by (Scholarship Clerk)</div>
                        </div>
                        <div style="text-align: center;">
                            <div>_______________________</div>
                            <div style="font-weight: bold; margin-top: 4px;">Prof. A. K. Verma</div>
                            <div>Dean, Academic & Student Affairs</div>
                        </div>
                    </div>
                </div>
            `,
            footerHtml: `
                <button class="btn btn-secondary" onclick="Utils.closeModal()">Close</button>
                <button class="btn btn-primary" onclick="Utils.printElement('sanction-letter-print-area', 'Sanction_Order_${s.sanction_no}')">
                    🖨️ Print Sanction Order
                </button>
            `
        });
    }
};
