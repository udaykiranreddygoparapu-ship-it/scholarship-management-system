// ============================================================================
// UNIVERSITY SCHOLARSHIP AND FINANCIAL AID MANAGEMENT SYSTEM (SFAMS)
// Treasury Disbursements & PFMS Payment Processing Component (Finance Role)
// ============================================================================

const DisbursementsView = {
    disbursementsList: [],

    async render(container) {
        container.innerHTML = `
            <div class="page-header">
                <div class="page-title-group">
                    <h1>Treasury Disbursements & PFMS DBT Gateway</h1>
                    <p class="page-subtitle">Finance Section processing of approved scholarship sanctions via electronic DBT</p>
                </div>
                <div class="page-actions">
                    <button class="btn btn-primary" onclick="DisbursementsView.openPaymentModal()">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                        Initiate DBT Disbursement
                    </button>
                </div>
            </div>

            <!-- SUMMARY ADVICE -->
            <div style="background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 14px 18px; margin-bottom: 20px; display: flex; align-items: center; justify-content: space-between;">
                <div style="display: flex; align-items: center; gap: 12px;">
                    <span style="font-size: 1.5rem;">💸</span>
                    <div>
                        <strong style="color: #065f46;">Finance Section: Mrs. Kavita Nair (Comptroller of Accounts)</strong>
                        <p style="font-size: 0.82rem; color: #047857; margin-top: 2px;">Ensure candidate's bank coordinates are verified before clearing DBT payment files to the Reserve Bank of India PFMS gateway.</p>
                    </div>
                </div>
                <button class="btn btn-secondary btn-sm" onclick="App.navigate('bank')">
                    Manage Bank Verification
                </button>
            </div>

            <!-- DISBURSEMENT TRANSACTIONS TABLE -->
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Treasury Payment Register (<span id="disb-count">0</span> Payouts)</h3>
                </div>
                <div class="table-responsive">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Disbursement No</th>
                                <th>Sanction Ref</th>
                                <th>Student Beneficiary</th>
                                <th>Credited Account</th>
                                <th>Amount Paid</th>
                                <th>Mode & UTR Ref</th>
                                <th>Payment Date</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody id="disbursements-table-body">
                            <tr><td colspan="9" style="text-align: center; padding: 30px;"><div class="spinner"></div></td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        await this.loadDisbursements();
    },

    async loadDisbursements() {
        const res = await API.getDisbursements();
        if (!res.success) {
            Utils.showToast('Failed to load disbursements: ' + res.error, 'error');
            return;
        }

        this.disbursementsList = res.data;
        const countSpan = document.getElementById('disb-count');
        const tbody = document.getElementById('disbursements-table-body');
        if (!tbody) return;

        countSpan.textContent = this.disbursementsList.length;

        if (this.disbursementsList.length === 0) {
            tbody.innerHTML = `<tr><td colspan="9" style="text-align: center; padding: 40px; color: var(--primary-500);">No disbursement transactions recorded yet.</td></tr>`;
            return;
        }

        tbody.innerHTML = this.disbursementsList.map(d => `
            <tr>
                <td><strong>${d.disbursement_no}</strong></td>
                <td><code>${d.sanction_no}</code></td>
                <td>
                    <div style="font-weight: 600; color: var(--primary-900);">${d.student_name}</div>
                    <div style="font-size: 0.74rem; color: var(--primary-500);">${d.roll_number} (${d.department})</div>
                </td>
                <td>
                    <div style="font-weight: 500;">${d.bank_name}</div>
                    <div style="font-size: 0.74rem; font-family: var(--font-mono); color: var(--primary-500);">${Utils.maskAccount(d.account_number)} | ${d.ifsc_code}</div>
                </td>
                <td>
                    <strong style="color: #059669; font-size: 1rem;">${Utils.formatINR(d.amount)}</strong>
                </td>
                <td>
                    <span class="badge badge-submitted">${d.payment_mode}</span>
                    <div style="font-family: var(--font-mono); font-size: 0.72rem; color: var(--primary-600); margin-top: 2px;">UTR: ${d.transaction_ref}</div>
                </td>
                <td>${Utils.formatDate(d.payment_date)}</td>
                <td>${Utils.getStatusBadge(d.payment_status)}</td>
                <td>
                    <button class="btn btn-secondary btn-sm" onclick="DisbursementsView.printVoucher(${d.disbursement_id})">
                        🖨️ Payment Voucher
                    </button>
                </td>
            </tr>
        `).join('');
    },

    async openPaymentModal(preselectedSanctionId = null) {
        const sancRes = await API.getSanctions();
        if (!sancRes.success) {
            Utils.showToast('Could not load sanctions', 'error');
            return;
        }

        // Only sanctions that have outstanding balance
        const pendingSanctions = sancRes.data.filter(s => s.disbursed_amount < s.sanction_amount);

        if (pendingSanctions.length === 0) {
            Utils.showToast('All sanctioned scholarship amounts have already been fully disbursed!', 'info');
            return;
        }

        const selectedSanction = preselectedSanctionId ?
            pendingSanctions.find(s => s.sanction_id == preselectedSanctionId) || pendingSanctions[0] :
            pendingSanctions[0];

        const remainingBalance = selectedSanction.sanction_amount - selectedSanction.disbursed_amount;

        Utils.openModal({
            title: 'Initiate Direct Benefit Transfer (DBT)',
            sizeClass: 'modal-lg',
            contentHtml: `
                <div class="form-grid">
                    <div class="form-group" style="grid-column: 1 / -1;">
                        <label>Select Sanction Order <span class="required">*</span></label>
                        <select id="disb-sanc-select" class="form-control" onchange="DisbursementsView.onSanctionChanged(this.value)">
                            ${pendingSanctions.map(s => `
                                <option value="${s.sanction_id}" ${s.sanction_id == selectedSanction.sanction_id ? 'selected' : ''}>
                                    ${s.sanction_no} - ${s.student_name} (${s.scheme_name}) - Balance: ${Utils.formatINR(s.sanction_amount - s.disbursed_amount)}
                                </option>
                            `).join('')}
                        </select>
                    </div>

                    <div class="form-group">
                        <label>Total Sanctioned Order Amount</label>
                        <input type="text" class="form-control" value="${Utils.formatINR(selectedSanction.sanction_amount)}" readonly>
                    </div>

                    <div class="form-group">
                        <label>Disbursement Amount (₹) <span class="required">*</span></label>
                        <input type="number" id="disb-amount-input" class="form-control" value="${remainingBalance}" max="${remainingBalance}" min="1000" required>
                        <small style="color: var(--primary-500); font-size: 0.75rem;">Cannot exceed outstanding sanctioned balance: ${Utils.formatINR(remainingBalance)}</small>
                    </div>

                    <div class="form-group">
                        <label>DBT Payment Gateway / Mode <span class="required">*</span></label>
                        <select id="disb-mode-select" class="form-control" required>
                            <option value="PFMS">Public Financial Management System (PFMS)</option>
                            <option value="Direct DBT">RBI Direct Benefit Transfer (DBT)</option>
                            <option value="NEFT">National Electronic Funds Transfer (NEFT)</option>
                            <option value="RTGS">Real Time Gross Settlement (RTGS)</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label>Disbursement Date</label>
                        <input type="date" id="disb-date-input" class="form-control" value="${new Date().toISOString().split('T')[0]}" required>
                    </div>

                    <div class="form-group" style="grid-column: 1 / -1;">
                        <label>Treasury Remarks</label>
                        <textarea id="disb-remarks" class="form-control" placeholder="e.g. Batch DBT Transfer cleared under University Treasury Voucher #902"></textarea>
                    </div>
                </div>

                <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 12px; margin-top: 14px; font-size: 0.82rem; color: #166534;">
                    <strong>Relational Integrity Rule:</strong> The database transaction enforces that cumulative disbursed payments never exceed the sanctioned amount, and will automatically roll back if bank coordinates are unverified.
                </div>
            `,
            footerHtml: `
                <button class="btn btn-secondary" onclick="Utils.closeModal()">Cancel</button>
                <button class="btn btn-success" onclick="DisbursementsView.submitDisbursement()">Execute Electronic Payment</button>
            `
        });
    },

    onSanctionChanged(sanctionId) {
        this.openPaymentModal(sanctionId);
    },

    async submitDisbursement() {
        const sanctionId = parseInt(document.getElementById('disb-sanc-select')?.value);
        const amount = parseFloat(document.getElementById('disb-amount-input')?.value);
        const paymentMode = document.getElementById('disb-mode-select')?.value;
        const remarks = document.getElementById('disb-remarks')?.value.trim();

        if (isNaN(amount) || amount <= 0) {
            Utils.showToast('Please specify a valid disbursement amount', 'warning');
            return;
        }

        const payload = {
            sanction_id: sanctionId,
            amount,
            payment_mode: paymentMode,
            processed_by: 4,
            remarks: remarks || 'PFMS DBT payment processed to authenticated account'
        };

        const res = await API.processDisbursement(payload);
        if (res.success) {
            Utils.showToast(`Disbursement ${res.disbursement_no} processed! UTR: ${res.transaction_ref}`, 'success');
            Utils.closeModal();
            await this.loadDisbursements();
        } else {
            Utils.showToast('Disbursement Error: ' + res.error, 'error', 6000);
        }
    },

    printVoucher(disbursementId) {
        const d = this.disbursementsList.find(item => item.disbursement_id === disbursementId);
        if (!d) return;

        Utils.openModal({
            title: `Payment Advice Voucher: ${d.disbursement_no}`,
            sizeClass: 'modal-lg',
            contentHtml: `
                <div id="voucher-print-area" class="official-letterhead">
                    <div class="letterhead-header">
                        <div class="letterhead-univ-name">CENTRAL APEX UNIVERSITY</div>
                        <div class="letterhead-sub">FINANCE & ACCOUNTS DEPARTMENT - TREASURY SECTION</div>
                        <div style="font-size: 0.85rem; margin-top: 4px;">Direct Benefit Transfer (DBT) Payment Voucher</div>
                    </div>

                    <div style="display: flex; justify-content: space-between; margin-bottom: 20px; font-size: 0.92rem;">
                        <div><strong>Voucher Ref:</strong> ${d.disbursement_no}</div>
                        <div><strong>Payment Date:</strong> ${Utils.formatDate(d.payment_date)}</div>
                    </div>

                    <div style="border: 1px solid #333; padding: 16px; margin-bottom: 20px; font-size: 0.92rem; line-height: 1.8;">
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                            <div><strong>Beneficiary Student:</strong> ${d.student_name}</div>
                            <div><strong>Roll Number:</strong> ${d.roll_number}</div>
                            <div><strong>Academic Department:</strong> ${d.department}</div>
                            <div><strong>Scholarship Scheme:</strong> ${d.scheme_name}</div>
                            <div><strong>Sanction Order Ref:</strong> ${d.sanction_no}</div>
                            <div><strong>Sanction Amount:</strong> ${Utils.formatINR(d.sanction_amount)}</div>
                            <div><strong>Bank Name:</strong> ${d.bank_name}</div>
                            <div><strong>Account Number:</strong> <code>${Utils.maskAccount(d.account_number)}</code></div>
                            <div><strong>IFSC Code:</strong> <code>${d.ifsc_code}</code></div>
                            <div><strong>Payment Gateway:</strong> ${d.payment_mode}</div>
                            <div><strong>Transaction / UTR No:</strong> <code>${d.transaction_ref}</code></div>
                            <div><strong>Payment Status:</strong> ${d.payment_status}</div>
                        </div>
                    </div>

                    <div style="background: #f8fafc; border: 1px solid #cbd5e1; padding: 14px; text-align: center; font-size: 1.25rem; font-weight: bold; margin-bottom: 20px;">
                        NET AMOUNT TRANSFERRED: ${Utils.formatINR(d.amount)}
                    </div>

                    <p style="font-size: 0.85rem; color: #333; line-height: 1.6;">
                        This document serves as conclusive electronic proof of transaction processed via the Reserve Bank of India / PFMS settlement gateway under University Account Code 4029.
                    </p>

                    <div style="display: flex; justify-content: space-between; margin-top: 50px; font-size: 0.85rem;">
                        <div style="text-align: center;">
                            <div>_______________________</div>
                            <div style="font-weight: bold; margin-top: 4px;">Accounts Officer</div>
                        </div>
                        <div style="text-align: center;">
                            <div>_______________________</div>
                            <div style="font-weight: bold; margin-top: 4px;">Mrs. Kavita Nair</div>
                            <div>Chief Finance Officer / Comptroller</div>
                        </div>
                    </div>
                </div>
            `,
            footerHtml: `
                <button class="btn btn-secondary" onclick="Utils.closeModal()">Close</button>
                <button class="btn btn-primary" onclick="Utils.printElement('voucher-print-area', 'Voucher_${d.disbursement_no}')">
                    🖨️ Print Payment Voucher
                </button>
            `
        });
    }
};
