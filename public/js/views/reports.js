// ============================================================================
// UNIVERSITY SCHOLARSHIP AND FINANCIAL AID MANAGEMENT SYSTEM (SFAMS)
// Comprehensive Reports, Multi-Dimension Filtering & Export Component
// ============================================================================

const ReportsView = {
    currentData: [],

    async render(container) {
        container.innerHTML = `
            <div class="page-header">
                <div class="page-title-group">
                    <h1>Executive Reports & Statutory Audits</h1>
                    <p class="page-subtitle">Generate institutional compliance reports, financial disbursement summaries, and department statistics</p>
                </div>
                <div class="page-actions">
                    <button class="btn btn-secondary" onclick="ReportsView.exportCsv()">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
                        Export CSV
                    </button>
                    <button class="btn btn-primary" onclick="ReportsView.printReport()">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
                        Print Official Report
                    </button>
                </div>
            </div>

            <!-- COMPREHENSIVE FILTER MATRIX -->
            <div class="card" style="margin-bottom: 20px;">
                <div class="card-header">
                    <h3 class="card-title">Filter Matrix & Reporting Parameters</h3>
                </div>
                <div class="card-body">
                    <div class="form-grid">
                        <div class="form-group">
                            <label>Report View Type</label>
                            <select id="rep-type" class="form-control" onchange="ReportsView.loadReport()">
                                <option value="all">Master Application Register</option>
                                <option value="disbursements">Treasury Disbursements Report (View)</option>
                                <option value="pending">Pending Applications (View)</option>
                                <option value="approved">Approved & Sanctioned List (View)</option>
                                <option value="schemes_summary">Scheme-wise Statistics (View)</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label>Academic Department</label>
                            <select id="rep-dept" class="form-control" onchange="ReportsView.loadReport()">
                                <option value="All">All Departments</option>
                                <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                                <option value="Electronics & Communication">Electronics & Communication</option>
                                <option value="Mechanical Engineering">Mechanical Engineering</option>
                                <option value="Civil Engineering">Civil Engineering</option>
                                <option value="Biotechnology">Biotechnology</option>
                                <option value="Electrical Engineering">Electrical Engineering</option>
                                <option value="Information Technology">Information Technology</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label>Application Status</label>
                            <select id="rep-status" class="form-control" onchange="ReportsView.loadReport()">
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

                        <div class="form-group">
                            <label>Academic Session</label>
                            <select id="rep-year" class="form-control" onchange="ReportsView.loadReport()">
                                <option value="All">All Years</option>
                                <option value="2026-27" selected>2026-27</option>
                                <option value="2025-26">2025-26</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <!-- REPORT DATA CONTAINER -->
            <div class="card" id="printable-report-card">
                <div class="card-header">
                    <div>
                        <h3 class="card-title" id="report-title-display">Generated Audit Report</h3>
                        <p style="font-size: 0.8rem; color: var(--primary-500); margin-top: 2px;">Records matched: <span id="rep-count" style="font-weight: 700;">0</span></p>
                    </div>
                </div>
                <div class="table-responsive">
                    <table class="data-table" id="report-table">
                        <thead id="report-thead"></thead>
                        <tbody id="report-tbody">
                            <tr><td style="text-align: center; padding: 40px;"><div class="spinner"></div></td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        await this.loadReport();
    },

    async loadReport() {
        const reportType = document.getElementById('rep-type')?.value || 'all';
        const department = document.getElementById('rep-dept')?.value;
        const status = document.getElementById('rep-status')?.value;
        const academicYear = document.getElementById('rep-year')?.value;

        const res = await API.getReports({
            reportType,
            department,
            status,
            academicYear
        });

        if (!res.success) {
            Utils.showToast('Failed to generate report: ' + res.error, 'error');
            return;
        }

        this.currentData = res.data;
        this.renderReportTable(reportType, this.currentData);
    },

    renderReportTable(type, data) {
        const thead = document.getElementById('report-thead');
        const tbody = document.getElementById('report-tbody');
        const countSpan = document.getElementById('rep-count');
        const titleDisplay = document.getElementById('report-title-display');

        if (!tbody || !thead) return;
        countSpan.textContent = data.length;

        if (data.length === 0) {
            tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 40px; color: var(--primary-500);">No records found matching the active filters.</td></tr>`;
            return;
        }

        if (type === 'disbursements') {
            titleDisplay.textContent = 'Treasury Disbursements Audit View (Database View)';
            thead.innerHTML = `
                <tr>
                    <th>Disbursement Ref</th>
                    <th>Sanction No</th>
                    <th>Student Name</th>
                    <th>Department</th>
                    <th>Bank & Account</th>
                    <th>Amount Paid</th>
                    <th>UTR Reference</th>
                    <th>Payment Status</th>
                </tr>
            `;
            tbody.innerHTML = data.map(d => `
                <tr>
                    <td><strong>${d.disbursement_no}</strong></td>
                    <td><code>${d.sanction_no}</code></td>
                    <td>${d.student_name} (${d.roll_number})</td>
                    <td>${d.department}</td>
                    <td>${d.bank_name} (<code>${Utils.maskAccount(d.account_number)}</code>)</td>
                    <td><strong style="color: #059669;">${Utils.formatINR(d.disbursed_amount)}</strong></td>
                    <td><code>${d.transaction_ref}</code></td>
                    <td>${Utils.getStatusBadge(d.payment_status)}</td>
                </tr>
            `).join('');
        } else if (type === 'schemes_summary') {
            titleDisplay.textContent = 'Scheme-wise Utilization & Expenditure Statistics (Database View)';
            thead.innerHTML = `
                <tr>
                    <th>Scheme Title</th>
                    <th>Max Cap</th>
                    <th>Applications</th>
                    <th>Approved</th>
                    <th>Rejected</th>
                    <th>Total Sanctioned</th>
                    <th>Total Disbursed</th>
                </tr>
            `;
            tbody.innerHTML = data.map(d => `
                <tr>
                    <td><strong>${d.scheme_name}</strong></td>
                    <td>${Utils.formatINR(d.max_amount)}</td>
                    <td><strong>${d.total_applications}</strong></td>
                    <td><span class="badge badge-approved">${d.approved_count}</span></td>
                    <td><span class="badge badge-rejected">${d.rejected_count}</span></td>
                    <td><strong style="color: #7c3aed;">${Utils.formatINR(d.total_sanctioned_amount)}</strong></td>
                    <td><strong style="color: #059669;">${Utils.formatINR(d.total_disbursed_amount)}</strong></td>
                </tr>
            `).join('');
        } else {
            titleDisplay.textContent = 'Master Scholarship Application Register';
            thead.innerHTML = `
                <tr>
                    <th>App No</th>
                    <th>Student Name</th>
                    <th>Department & Program</th>
                    <th>Category / Income</th>
                    <th>Scheme Name</th>
                    <th>Current Stage</th>
                    <th>Sanction / DBT</th>
                    <th>Status</th>
                </tr>
            `;
            tbody.innerHTML = data.map(d => `
                <tr>
                    <td><strong>${d.application_no}</strong></td>
                    <td>${d.student_name} (<code>${d.roll_number}</code>)</td>
                    <td>${d.department} (${d.program})</td>
                    <td>${d.category} | ${Utils.formatINR(d.annual_income)}</td>
                    <td>${d.scheme_name}</td>
                    <td><span style="font-size: 0.8rem; font-weight: 600; color: var(--accent-blue);">${d.current_stage}</span></td>
                    <td>
                        <strong style="color: #7c3aed;">${Utils.formatINR(d.sanction_amount)}</strong> / 
                        <strong style="color: #059669;">${Utils.formatINR(d.disbursed_amount)}</strong>
                    </td>
                    <td>${Utils.getStatusBadge(d.status)}</td>
                </tr>
            `).join('');
        }
    },

    exportCsv() {
        if (!this.currentData || this.currentData.length === 0) {
            Utils.showToast('No data to export', 'warning');
            return;
        }

        const keys = Object.keys(this.currentData[0]);
        const rows = this.currentData.map(item => keys.map(k => item[k]));
        const reportType = document.getElementById('rep-type')?.value || 'report';

        Utils.exportToCsv(`Scholarship_${reportType}_AY2026_27`, keys, rows);
    },

    printReport() {
        Utils.printElement('printable-report-card', 'University_Scholarship_Audit_Report');
    }
};
