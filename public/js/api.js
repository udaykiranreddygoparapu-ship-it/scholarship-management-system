// ============================================================================
// UNIVERSITY SCHOLARSHIP AND FINANCIAL AID MANAGEMENT SYSTEM (SFAMS)
// API Client Service
// ============================================================================

const API = {
    baseUrl: '/api',

    async get(endpoint, params = {}) {
        const url = new URL(this.baseUrl + endpoint, window.location.origin);
        Object.keys(params).forEach(key => {
            if (params[key] !== undefined && params[key] !== null) {
                url.searchParams.append(key, params[key]);
            }
        });
        const res = await fetch(url);
        return res.json();
    },

    async post(endpoint, body = {}) {
        const res = await fetch(this.baseUrl + endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        return res.json();
    },

    async put(endpoint, body = {}) {
        const res = await fetch(this.baseUrl + endpoint, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        return res.json();
    },

    // High Level Endpoints
    login(username, password) { return this.post('/auth/login', { username, password }); },
    getDashboardStats() { return this.get('/dashboard/stats'); },
    getStudentDashboard(studentId) { return this.get(`/students/${studentId}/dashboard`); },
    getStudents(params) { return this.get('/students', params); },
    getStudentById(id) { return this.get(`/students/${id}`); },
    createStudent(data) { return this.post('/students', data); },

    getSchemes(params) { return this.get('/schemes', params); },
    getSchemeById(id) { return this.get(`/schemes/${id}`); },
    createScheme(data) { return this.post('/schemes', data); },
    updateSchemeStatus(id, status) { return this.put(`/schemes/${id}/status`, { status }); },

    checkEligibility(studentId, schemeId) { return this.post('/eligibility/check', { studentId, schemeId }); },

    getApplications(params) { return this.get('/applications', params); },
    getApplicationById(id) { return this.get(`/applications/${id}`); },
    submitApplication(data) { return this.post('/applications', data); },
    verifyApplication(id, data) { return this.post(`/applications/${id}/verify`, data); },
    approveApplication(id, data) { return this.post(`/applications/${id}/approve`, data); },

    getSanctions() { return this.get('/sanctions'); },
    createSanction(data) { return this.post('/sanctions', data); },

    getBankDetails() { return this.get('/bank-details'); },
    saveBankDetails(data) { return this.post('/bank-details', data); },
    verifyBankDetails(id, isVerified) { return this.put(`/bank-details/${id}/verify`, { is_verified: isVerified }); },

    getDisbursements() { return this.get('/disbursements'); },
    processDisbursement(data) { return this.post('/disbursements', data); },

    getRenewals() { return this.get('/renewals'); },
    submitRenewal(data) { return this.post('/renewals', data); },
    updateRenewalStatus(id, data) { return this.put(`/renewals/${id}/status`, data); },

    getReports(params) { return this.get('/reports', params); },

    getSqlPresets() { return this.get('/sql/presets'); },
    executeSql(sql) { return this.post('/sql/execute', { sql }); },
    getSqlTables() { return this.get('/sql/tables'); },

    getUsers() { return this.get('/users'); },
    getAuditLogs() { return this.get('/audit-logs'); }
};
