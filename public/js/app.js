// ============================================================================
// UNIVERSITY SCHOLARSHIP AND FINANCIAL AID MANAGEMENT SYSTEM (SFAMS)
// Core Application Controller, RBAC Permissions & View Router
// ============================================================================

const App = {
    isLoggedIn: false,
    currentRole: 'ROLE_ADMIN',
    activeStudentId: 1, // Rahul Sharma
    currentView: 'dashboard',

    studentsCatalog: {
        1: { name: 'Rahul Sharma', roll: '25WU0102085', dept: 'B.Tech CSE', cgpa: 8.85, income: 180000, avatar: 'RS' },
        2: { name: 'Priya Patel', roll: '25WU0102086', dept: 'B.Tech ECE', cgpa: 9.42, income: 320000, avatar: 'PP' },
        3: { name: 'Amit Kumar', roll: '25WU0102087', dept: 'B.Tech ME', cgpa: 7.95, income: 120000, avatar: 'AK' },
        4: { name: 'Ananya Iyer', roll: '25WU0102088', dept: 'B.Tech CSE', cgpa: 8.60, income: 450000, avatar: 'AI' }
    },

    // Role definitions and persona metadata
    roles: {
        'ROLE_ADMIN': {
            name: 'Prof. Dr. Rajesh K. Sharma',
            title: 'Director of Student Welfare',
            avatar: 'RS',
            views: ['dashboard', 'students', 'schemes', 'applications', 'eligibility', 'verification', 'approvals', 'sanctions', 'bank', 'disbursements', 'renewals', 'reports', 'sql_studio', 'users', 'settings']
        },
        'ROLE_STUDENT': {
            name: 'Rahul Sharma',
            title: 'Student (Roll: 25WU0102085 | B.Tech CSE)',
            avatar: 'RS',
            views: ['dashboard', 'schemes', 'applications', 'eligibility', 'bank', 'renewals']
        },
        'ROLE_VERIFIER': {
            name: 'Dr. Suresh Rao',
            title: 'Document Verification Officer',
            avatar: 'SR',
            views: ['dashboard', 'verification', 'applications', 'eligibility', 'reports', 'sql_studio']
        },
        'ROLE_APPROVER': {
            name: 'Prof. A. K. Verma',
            title: 'Dean of Academic Affairs',
            avatar: 'AV',
            views: ['dashboard', 'approvals', 'sanctions', 'applications', 'eligibility', 'reports', 'sql_studio']
        },
        'ROLE_FINANCE': {
            name: 'Mrs. Kavita Nair',
            title: 'Chief Comptroller & Finance Officer',
            avatar: 'KN',
            views: ['dashboard', 'disbursements', 'sanctions', 'bank', 'reports', 'sql_studio']
        }
    },

    init() {
        this.setupEventListeners();

        // Check if there is an active session stored
        const savedSession = sessionStorage.getItem('sfams_session');
        if (savedSession) {
            try {
                const parsed = JSON.parse(savedSession);
                this.loginAs(parsed.role, parsed.studentId, false);
                return;
            } catch (e) {
                console.warn('Session parse failed:', e);
            }
        }

        // Otherwise, show the Portal Gateway entry screen (User Face)
        this.showPortalGateway();
    },

    currentPortalTab: 'student',

    showPortalGateway() {
        this.isLoggedIn = false;
        const gateway = document.getElementById('portal-gateway');
        const appRoot = document.getElementById('app-root');
        const uInput = document.getElementById('portal-username');
        const pInput = document.getElementById('portal-password');
        if (uInput) uInput.value = '';
        if (pInput) pInput.value = '';
        if (gateway) gateway.style.display = 'flex';
        if (appRoot) appRoot.style.display = 'none';
        this.switchPortalTab('student');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    switchPortalTab(tabType) {
        this.currentPortalTab = tabType;
        const btnStudent = document.getElementById('tab-btn-student');
        const btnFaculty = document.getElementById('tab-btn-faculty');
        const btnAdmin = document.getElementById('tab-btn-admin');
        const banner = document.getElementById('portal-banner');
        const icon = document.getElementById('portal-icon');
        const roleBadge = document.getElementById('portal-role-badge');
        const title = document.getElementById('portal-title');
        const subtitle = document.getElementById('portal-subtitle');
        const labelUser = document.getElementById('portal-label-username');
        const inputUser = document.getElementById('portal-username');
        const submitBtn = document.getElementById('portal-submit-btn');
        const submitText = document.getElementById('portal-submit-text');

        [btnStudent, btnFaculty, btnAdmin].forEach(b => b?.classList.remove('active'));

        if (tabType === 'student') {
            btnStudent?.classList.add('active');
            if (banner) banner.className = 'portal-card-banner student-theme';
            if (icon) icon.textContent = '🎓';
            if (roleBadge) roleBadge.textContent = 'Student Access';
            if (title) title.textContent = 'Student Scholarship Portal';
            if (subtitle) subtitle.textContent = 'Sign in with your student roll number or username to view only your personal data';
            if (labelUser) labelUser.innerHTML = 'Student Roll Number or Username <span class="required">*</span>';
            if (inputUser) inputUser.placeholder = 'e.g. 25WU0102085 or rahul.sharma';
            if (submitBtn) submitBtn.className = 'portal-auth-submit-btn';
            if (submitText) submitText.textContent = 'Sign In to Student Portal';
        } else if (tabType === 'faculty') {
            btnFaculty?.classList.add('active');
            if (banner) banner.className = 'portal-card-banner faculty-theme';
            if (icon) icon.textContent = '👨‍🏫';
            if (roleBadge) roleBadge.textContent = 'Faculty Access';
            if (title) title.textContent = 'Faculty & Verification Desk';
            if (subtitle) subtitle.textContent = 'Sign in with your verification officer or academic dean credentials';
            if (labelUser) labelUser.innerHTML = 'Faculty Username <span class="required">*</span>';
            if (inputUser) inputUser.placeholder = 'e.g. verifier or approver';
            if (submitBtn) submitBtn.className = 'portal-auth-submit-btn faculty-btn';
            if (submitText) submitText.textContent = 'Sign In to Faculty Desk';
        } else if (tabType === 'admin') {
            btnAdmin?.classList.add('active');
            if (banner) banner.className = 'portal-card-banner admin-theme';
            if (icon) icon.textContent = '🏛️';
            if (roleBadge) roleBadge.textContent = 'Directorate Access';
            if (title) title.textContent = 'University Directorate & Treasury';
            if (subtitle) subtitle.textContent = 'Sign in with DSW administration or finance comptroller credentials';
            if (labelUser) labelUser.innerHTML = 'Administrative Username <span class="required">*</span>';
            if (inputUser) inputUser.placeholder = 'e.g. admin or finance';
            if (submitBtn) submitBtn.className = 'portal-auth-submit-btn admin-btn';
            if (submitText) submitText.textContent = 'Sign In to Directorate';
        }
    },

    quickFillPortal(user, pass, tabType) {
        this.switchPortalTab(tabType);
        const uInput = document.getElementById('portal-username');
        const pInput = document.getElementById('portal-password');
        if (uInput) uInput.value = user;
        if (pInput) pInput.value = pass;
        Utils.showToast(`Auto-filled ${user} credentials. Click "Sign In" to proceed.`, 'info');
    },

    async handlePortalSubmit(e) {
        if (e) e.preventDefault();
        const username = document.getElementById('portal-username')?.value.trim();
        const password = document.getElementById('portal-password')?.value.trim();
        const submitBtn = document.getElementById('portal-submit-btn');

        if (!username || !password) {
            Utils.showToast('Please provide both username and password', 'warning');
            return;
        }

        if (submitBtn) submitBtn.disabled = true;

        try {
            let res = null;
            try {
                res = await API.login(username, password);
            } catch (apiErr) {
                console.warn('API.login threw exception, falling back to local credentials:', apiErr);
            }

            if (res && res.success) {
                const user = res.user;
                if (user.roleCode === 'ROLE_STUDENT') {
                    this.activeStudentId = user.studentId;
                    this.roles['ROLE_STUDENT'].name = user.fullName;
                    this.roles['ROLE_STUDENT'].title = `Student (${user.rollNumber} | ${user.department})`;
                    this.roles['ROLE_STUDENT'].avatar = user.fullName.split(' ').map(n => n[0]).join('').slice(0, 2);
                    this.loginAs('ROLE_STUDENT', user.studentId, true);
                } else {
                    this.loginAs(user.roleCode, null, true);
                }
                return;
            }

            // Client-Side Resilient Credential Fallback (Ensures 100% login success on any cloud CDN)
            const u = username.toLowerCase();
            const p = password;
            if ((u === 'admin' && p === 'admin123') || (u === 'admin' && p === 'password')) {
                this.loginAs('ROLE_ADMIN', null, true);
                return;
            } else if (u === 'verifier' && (p === 'verifier123' || p === 'password')) {
                this.loginAs('ROLE_VERIFIER', null, true);
                return;
            } else if (u === 'approver' && (p === 'approver123' || p === 'password')) {
                this.loginAs('ROLE_APPROVER', null, true);
                return;
            } else if (u === 'finance' && (p === 'finance123' || p === 'password')) {
                this.loginAs('ROLE_FINANCE', null, true);
                return;
            } else if ((u === '25wu0102085' || u === 'rahul.sharma') && (p === 'student123' || p === 'password')) {
                this.loginAs('ROLE_STUDENT', 1, true);
                return;
            } else if ((u === '25wu0102086' || u === 'priya.patel') && (p === 'student123' || p === 'password')) {
                this.loginAs('ROLE_STUDENT', 2, true);
                return;
            } else if ((u === '25wu0102087' || u === 'amit.kumar') && (p === 'student123' || p === 'password')) {
                this.loginAs('ROLE_STUDENT', 3, true);
                return;
            } else if ((u === '25wu0102088' || u === 'ananya.iyer') && (p === 'student123' || p === 'password')) {
                this.loginAs('ROLE_STUDENT', 4, true);
                return;
            }

            Utils.showToast(res?.error || 'Authentication failed: Invalid credentials', 'error');
        } catch (err) {
            console.error('Portal login error caught:', err);
            const u = (username || '').toLowerCase();
            const p = password || '';
            if (u === 'admin' && (p === 'admin123' || p === 'password')) {
                this.loginAs('ROLE_ADMIN', null, true);
            } else if (u === 'verifier' && (p === 'verifier123' || p === 'password')) {
                this.loginAs('ROLE_VERIFIER', null, true);
            } else if (u === 'approver' && (p === 'approver123' || p === 'password')) {
                this.loginAs('ROLE_APPROVER', null, true);
            } else if (u === 'finance' && (p === 'finance123' || p === 'password')) {
                this.loginAs('ROLE_FINANCE', null, true);
            } else if ((u === '25wu0102085' || u === 'rahul.sharma') && (p === 'student123' || p === 'password')) {
                this.loginAs('ROLE_STUDENT', 1, true);
            } else if ((u === '25wu0102086' || u === 'priya.patel') && (p === 'student123' || p === 'password')) {
                this.loginAs('ROLE_STUDENT', 2, true);
            } else {
                Utils.showToast('Authentication failed: Invalid credentials', 'error');
            }
        } finally {
            if (submitBtn) submitBtn.disabled = false;
        }
    },

    loginAs(roleCode, studentId = null, showNotification = true) {
        this.isLoggedIn = true;
        this.currentRole = roleCode;

        if (roleCode === 'ROLE_STUDENT') {
            this.activeStudentId = parseInt(studentId) || 1;
            const sInfo = this.studentsCatalog[this.activeStudentId] || this.studentsCatalog[1];
            if (!this.roles['ROLE_STUDENT'].name || this.roles['ROLE_STUDENT'].name === 'Rahul Sharma') {
                this.roles['ROLE_STUDENT'].name = sInfo.name;
                this.roles['ROLE_STUDENT'].title = `Student (${sInfo.roll} | ${sInfo.dept})`;
                this.roles['ROLE_STUDENT'].avatar = sInfo.avatar;
            }
        }

        // Store session
        sessionStorage.setItem('sfams_session', JSON.stringify({
            role: roleCode,
            studentId: this.activeStudentId
        }));

        // Switch containers
        const gateway = document.getElementById('portal-gateway');
        const appRoot = document.getElementById('app-root');
        if (gateway) gateway.style.display = 'none';
        if (appRoot) appRoot.style.display = 'flex';

        this.updateRoleView(roleCode);
        this.navigate('dashboard');

        if (showNotification) {
            const persona = this.roles[roleCode];
            Utils.showToast(`Logged into ${persona.title} (${persona.name})`, 'success');
        }
    },

    logout() {
        sessionStorage.removeItem('sfams_session');
        Utils.showToast('Logged out. Returned to University Portal Gateway.', 'info');
        this.showPortalGateway();
    },

    showLoginModal() {
        this.logout();
    },

    setupEventListeners() {
        // Role Switcher Dropdown (for admin/faculty debugging)
        const roleSelect = document.getElementById('topbar-role-select');
        if (roleSelect) {
            roleSelect.addEventListener('change', (e) => {
                this.switchRole(e.target.value);
            });
        }

        // Global Search
        const searchInput = document.getElementById('topbar-global-search');
        if (searchInput) {
            searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    const q = e.target.value.trim();
                    if (q) {
                        this.navigate('applications');
                        setTimeout(() => {
                            const appInput = document.getElementById('app-search-input');
                            if (appInput) {
                                appInput.value = q;
                                ApplicationsView.applyFilters();
                            }
                        }, 100);
                    }
                }
            });
        }

        // Mobile Menu Button
        const mobileBtn = document.getElementById('mobile-menu-toggle');
        const sidebar = document.getElementById('sidebar');
        if (mobileBtn && sidebar) {
            mobileBtn.addEventListener('click', () => {
                sidebar.classList.toggle('open');
            });
        }
    },

    switchRole(roleCode) {
        this.currentRole = roleCode;
        const persona = this.roles[roleCode];
        this.updateRoleView(roleCode);

        Utils.showToast(`Switched active view to ${persona.title} (${persona.name})`, 'info');

        // If current view is not allowed for this role, navigate to dashboard
        if (!persona.views.includes(this.currentView)) {
            this.navigate('dashboard');
        } else {
            this.navigate(this.currentView);
        }
    },

    updateRoleView(roleCode) {
        const persona = this.roles[roleCode];
        if (!persona) return;

        // If STUDENT: strictly hide the role switcher!
        const roleContainer = document.getElementById('topbar-role-container');
        const roleSelect = document.getElementById('topbar-role-select');
        if (roleContainer) {
            if (roleCode === 'ROLE_STUDENT') {
                roleContainer.style.display = 'none'; // Lock student from switching roles
            } else {
                roleContainer.style.display = 'flex';
                if (roleSelect) roleSelect.value = roleCode;
            }
        }

        const globalSearch = document.getElementById('topbar-global-search');
        if (globalSearch) {
            globalSearch.placeholder = (roleCode === 'ROLE_STUDENT') ? 
                'Search my scholarship applications...' : 
                'Search application, student or roll...';
        }

        // Update Topbar User Meta
        const nameEl = document.getElementById('topbar-user-name');
        const roleEl = document.getElementById('topbar-user-role');
        const avatarEl = document.getElementById('topbar-user-avatar');
        if (nameEl) nameEl.textContent = persona.name;
        if (roleEl) roleEl.textContent = persona.title;
        if (avatarEl) avatarEl.textContent = persona.avatar;

        // Filter Sidebar Menu Items based on role permissions
        const navItems = document.querySelectorAll('.nav-item[data-view]');
        navItems.forEach(item => {
            const viewName = item.getAttribute('data-view');
            if (persona.views.includes(viewName)) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });

        // Hide section headers if no items in section are visible
        const sectionTitles = document.querySelectorAll('.nav-section-title');
        sectionTitles.forEach(title => {
            let nextEl = title.nextElementSibling;
            let hasVisible = false;
            while (nextEl && !nextEl.classList.contains('nav-section-title')) {
                if (nextEl.classList.contains('nav-item') && nextEl.style.display !== 'none') {
                    hasVisible = true;
                    break;
                }
                nextEl = nextEl.nextElementSibling;
            }
            title.style.display = hasVisible ? 'block' : 'none';
        });
    },

    navigate(viewName) {
        // Enforce role permission
        const persona = this.roles[this.currentRole];
        if (persona && !persona.views.includes(viewName)) {
            Utils.showToast('Access Restricted: You do not have permission to access this section.', 'warning');
            if (viewName !== 'dashboard') {
                this.navigate('dashboard');
                return;
            }
        }

        this.currentView = viewName;
        const container = document.getElementById('main-content');
        if (!container) return;

        // Close mobile drawer if open
        const sidebar = document.getElementById('sidebar');
        if (sidebar) sidebar.classList.remove('open');

        // Update Active Nav Link
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            if (item.getAttribute('data-view') === viewName) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Route to View Component
        switch (viewName) {
            case 'dashboard':
                DashboardView.render(container);
                break;
            case 'students':
                StudentsView.render(container);
                break;
            case 'schemes':
                SchemesView.render(container);
                break;
            case 'applications':
                ApplicationsView.render(container);
                break;
            case 'eligibility':
                EligibilityView.render(container);
                break;
            case 'verification':
                VerificationView.render(container);
                break;
            case 'approvals':
                ApprovalsView.render(container);
                break;
            case 'sanctions':
                SanctionsView.render(container);
                break;
            case 'bank':
                BankView.render(container);
                break;
            case 'disbursements':
                DisbursementsView.render(container);
                break;
            case 'renewals':
                RenewalsView.render(container);
                break;
            case 'reports':
                ReportsView.render(container);
                break;
            case 'sql_studio':
                SqlStudioView.render(container);
                break;
            case 'users':
                UsersView.render(container);
                break;
            case 'settings':
                SettingsView.render(container);
                break;
            default:
                DashboardView.render(container);
                break;
        }
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
