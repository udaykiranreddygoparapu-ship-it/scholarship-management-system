// ============================================================================
// UNIVERSITY SCHOLARSHIP AND FINANCIAL AID MANAGEMENT SYSTEM (SFAMS)
// Users & Role-Based Access Control (RBAC) View Component
// ============================================================================

const UsersView = {
    async render(container) {
        container.innerHTML = `
            <div class="page-header">
                <div class="page-title-group">
                    <h1>Role-Based Access Control (RBAC) & System Users</h1>
                    <p class="page-subtitle">Governance of institutional administrative personas, verifiers, academic officers, and students</p>
                </div>
            </div>

            <!-- RBAC OVERVIEW CARDS -->
            <div class="stats-grid" style="grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); margin-bottom: 24px;">
                <div class="stat-card accent-blue">
                    <div class="stat-card-header">
                        <span class="stat-card-title">Admin Persona</span>
                        <div class="stat-card-icon">👑</div>
                    </div>
                    <div style="font-size: 0.95rem; font-weight: 700; color: var(--primary-900);">Prof. Dr. Rajesh Sharma</div>
                    <div class="stat-card-footer">Dean of Student Welfare</div>
                </div>

                <div class="stat-card accent-cyan">
                    <div class="stat-card-header">
                        <span class="stat-card-title">Document Verifier</span>
                        <div class="stat-card-icon">🛡️</div>
                    </div>
                    <div style="font-size: 0.95rem; font-weight: 700; color: var(--primary-900);">Dr. Suresh Rao</div>
                    <div class="stat-card-footer">Verification Officer</div>
                </div>

                <div class="stat-card accent-purple">
                    <div class="stat-card-header">
                        <span class="stat-card-title">Approving Officer</span>
                        <div class="stat-card-icon">⚖️</div>
                    </div>
                    <div style="font-size: 0.95rem; font-weight: 700; color: var(--primary-900);">Prof. A. K. Verma</div>
                    <div class="stat-card-footer">Dean of Academic Affairs</div>
                </div>

                <div class="stat-card accent-emerald">
                    <div class="stat-card-header">
                        <span class="stat-card-title">Finance Officer</span>
                        <div class="stat-card-icon">💸</div>
                    </div>
                    <div style="font-size: 0.95rem; font-weight: 700; color: var(--primary-900);">Mrs. Kavita Nair</div>
                    <div class="stat-card-footer">Chief Accounts Officer</div>
                </div>

                <div class="stat-card accent-amber">
                    <div class="stat-card-header">
                        <span class="stat-card-title">Student Beneficiary</span>
                        <div class="stat-card-icon">🎓</div>
                    </div>
                    <div style="font-size: 0.95rem; font-weight: 700; color: var(--primary-900);">Rahul Sharma / Priya</div>
                    <div class="stat-card-footer">Student Applicants</div>
                </div>
            </div>

            <!-- USERS DATA TABLE -->
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">System Users Directory</h3>
                </div>
                <div class="table-responsive">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>User ID</th>
                                <th>Username</th>
                                <th>Full Official Name</th>
                                <th>System Role</th>
                                <th>Official Email</th>
                                <th>Phone</th>
                                <th>Status</th>
                                <th>Created Date</th>
                            </tr>
                        </thead>
                        <tbody id="users-table-body">
                            <tr><td colspan="8" style="text-align: center; padding: 30px;"><div class="spinner"></div></td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        await this.loadUsers();
    },

    async loadUsers() {
        const res = await API.getUsers();
        if (!res.success) {
            Utils.showToast('Failed to load users: ' + res.error, 'error');
            return;
        }

        const tbody = document.getElementById('users-table-body');
        if (!tbody) return;

        tbody.innerHTML = res.data.map(u => `
            <tr>
                <td><strong>#USR-${u.user_id}</strong></td>
                <td><code>${u.username}</code></td>
                <td><strong>${u.full_name}</strong></td>
                <td><span class="badge badge-submitted">${u.role_name}</span></td>
                <td>${u.email}</td>
                <td>${u.phone || '—'}</td>
                <td><span class="badge badge-verified">${u.status}</span></td>
                <td>${Utils.formatDate(u.created_at)}</td>
            </tr>
        `).join('');
    }
};
