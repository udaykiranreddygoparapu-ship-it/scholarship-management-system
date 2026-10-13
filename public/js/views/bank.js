// ============================================================================
// UNIVERSITY SCHOLARSHIP AND FINANCIAL AID MANAGEMENT SYSTEM (SFAMS)
// Bank Account Coordinates & DBT Validation Component
// ============================================================================

const BankView = {
    bankList: [],
    revealedAccounts: {},

    async render(container) {
        container.innerHTML = `
            <div class="page-header">
                <div class="page-title-group">
                    <h1>Student Bank Coordinates & DBT Registry</h1>
                    <p class="page-subtitle">Verify institutional bank details, IFSC validation, and DBT clearing authorization</p>
                </div>
            </div>

            <!-- SECURITY NOTICE -->
            <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 14px 18px; margin-bottom: 20px; display: flex; align-items: center; justify-content: space-between;">
                <div style="display: flex; align-items: center; gap: 12px;">
                    <span style="font-size: 1.5rem;">🔒</span>
                    <div>
                        <strong style="color: #92400e;">Security & Data Privacy Standard:</strong>
                        <p style="font-size: 0.82rem; color: #78350f; margin-top: 2px;">Account numbers are masked by default to safeguard sensitive financial data. Only authorized finance officers may authenticate accounts for PFMS payouts.</p>
                    </div>
                </div>
            </div>

            <!-- BANK ACCOUNTS TABLE -->
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Registered Student Bank Accounts (<span id="bank-count">0</span>)</h3>
                </div>
                <div class="table-responsive">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Student Roll / Name</th>
                                <th>Account Holder</th>
                                <th>Bank Name</th>
                                <th>Account Number</th>
                                <th>IFSC Code</th>
                                <th>Branch</th>
                                <th>Verification Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="bank-table-body">
                            <tr><td colspan="8" style="text-align: center; padding: 30px;"><div class="spinner"></div></td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        await this.loadBankDetails();
    },

    async loadBankDetails() {
        const res = await API.getBankDetails();
        if (!res.success) {
            Utils.showToast('Failed to load bank details: ' + res.error, 'error');
            return;
        }

        if (App.currentRole === 'ROLE_STUDENT' && App.activeStudentId) {
            this.bankList = res.data.filter(b => b.student_id === App.activeStudentId);
        } else {
            this.bankList = res.data;
        }

        const countSpan = document.getElementById('bank-count');
        const tbody = document.getElementById('bank-table-body');
        if (!tbody) return;

        countSpan.textContent = this.bankList.length;

        if (this.bankList.length === 0) {
            tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 40px; color: var(--primary-500);">No bank records registered.</td></tr>`;
            return;
        }

        tbody.innerHTML = this.bankList.map(b => {
            const isRevealed = !!this.revealedAccounts[b.bank_detail_id];
            const displayAcc = isRevealed ? b.account_number : Utils.maskAccount(b.account_number);

            return `
                <tr>
                    <td>
                        <div style="font-weight: 600; color: var(--primary-900);">${b.student_name}</div>
                        <div style="font-size: 0.74rem; color: var(--primary-500);">${b.roll_number} (${b.department})</div>
                    </td>
                    <td><strong>${b.account_holder_name}</strong></td>
                    <td>${b.bank_name}</td>
                    <td>
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <code style="font-size: 0.86rem;">${displayAcc}</code>
                            <button class="btn btn-secondary btn-sm" style="padding: 2px 6px; font-size: 0.7rem;" onclick="BankView.toggleReveal(${b.bank_detail_id})">
                                ${isRevealed ? 'Hide' : 'Show'}
                            </button>
                        </div>
                    </td>
                    <td><strong style="color: var(--accent-blue);">${b.ifsc_code}</strong></td>
                    <td>${b.branch_name}</td>
                    <td>
                        ${b.is_verified ? `
                            <span class="badge badge-verified">✓ DBT Verified</span>
                        ` : `
                            <span class="badge badge-pending">Pending Verification</span>
                        `}
                    </td>
                    <td>
                        <div style="display: flex; gap: 6px;">
                            ${b.is_verified ? `
                                <button class="btn btn-secondary btn-sm" onclick="BankView.toggleVerificationStatus(${b.bank_detail_id}, false)">
                                    Revoke
                                </button>
                            ` : `
                                <button class="btn btn-success btn-sm" onclick="BankView.toggleVerificationStatus(${b.bank_detail_id}, true)">
                                    Authenticate & Verify
                                </button>
                            `}
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    },

    toggleReveal(bankDetailId) {
        this.revealedAccounts[bankDetailId] = !this.revealedAccounts[bankDetailId];
        this.loadBankDetails();
    },

    async toggleVerificationStatus(bankDetailId, newStatus) {
        const res = await API.verifyBankDetails(bankDetailId, newStatus);
        if (res.success) {
            Utils.showToast(newStatus ? 'Bank account authenticated and cleared for DBT disbursements!' : 'Bank verification status revoked', 'success');
            await this.loadBankDetails();
        } else {
            Utils.showToast('Failed to update verification status', 'error');
        }
    }
};
