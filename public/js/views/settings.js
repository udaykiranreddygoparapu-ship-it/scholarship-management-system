// ============================================================================
// UNIVERSITY SCHOLARSHIP AND FINANCIAL AID MANAGEMENT SYSTEM (SFAMS)
// System Settings & Database Audit Trail View Component
// ============================================================================

const SettingsView = {
    async render(container) {
        container.innerHTML = `
            <div class="page-header">
                <div class="page-title-group">
                    <h1>System Configuration & Audit Logs</h1>
                    <p class="page-subtitle">Academic session parameters, database transaction journals, and security audit logs</p>
                </div>
            </div>

            <!-- ACADEMIC SESSION CARD -->
            <div class="card" style="margin-bottom: 24px;">
                <div class="card-header">
                    <h3 class="card-title">Institutional Parameters</h3>
                </div>
                <div class="card-body">
                    <div class="form-grid">
                        <div class="form-group">
                            <label>Active Academic Session</label>
                            <input type="text" class="form-control" value="2026-27" readonly>
                        </div>
                        <div class="form-group">
                            <label>Financial Year</label>
                            <input type="text" class="form-control" value="FY 2026-27" readonly>
                        </div>
                        <div class="form-group">
                            <label>Portal Operation Mode</label>
                            <input type="text" class="form-control" value="Online & Real-Time (3NF DB Active)" readonly>
                        </div>
                        <div class="form-group">
                            <label>DB Engine</label>
                            <input type="text" class="form-control" value="ANSI SQL / SQLite (WebAssembly) & MySQL 8.0" readonly>
                        </div>
                    </div>
                </div>
            </div>

            <!-- AUDIT LOGS TABLE -->
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Database Audit Trail Journal (Latest Operations)</h3>
                </div>
                <div class="table-responsive">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Log ID</th>
                                <th>Action Type</th>
                                <th>Entity Affected</th>
                                <th>User / Actor</th>
                                <th>Transaction Details</th>
                                <th>Timestamp</th>
                            </tr>
                        </thead>
                        <tbody id="audit-table-body">
                            <tr><td colspan="6" style="text-align: center; padding: 30px;"><div class="spinner"></div></td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        await this.loadAuditLogs();
    },

    async loadAuditLogs() {
        const res = await API.getAuditLogs();
        if (!res.success) return;

        const tbody = document.getElementById('audit-table-body');
        if (!tbody) return;

        tbody.innerHTML = res.data.map(l => `
            <tr>
                <td><strong>#LOG-${l.log_id}</strong></td>
                <td><span class="badge badge-submitted">${l.action_type}</span></td>
                <td><code>${l.entity_name}</code> (ID: ${l.entity_id || '—'})</td>
                <td><strong>${l.user_name || 'System / Admin'}</strong></td>
                <td>${l.details}</td>
                <td><span style="font-family: var(--font-mono); font-size: 0.78rem;">${l.timestamp}</span></td>
            </tr>
        `).join('');
    }
};
