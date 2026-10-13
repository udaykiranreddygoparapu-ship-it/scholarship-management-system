// ============================================================================
// UNIVERSITY SCHOLARSHIP AND FINANCIAL AID MANAGEMENT SYSTEM (SFAMS)
// Automated Eligibility Checking Engine & Sandbox Component
// ============================================================================

const EligibilityView = {
    students: [],
    schemes: [],

    async render(container) {
        container.innerHTML = `
            <div class="page-header">
                <div class="page-title-group">
                    <h1>Automated Eligibility Checking Engine</h1>
                    <p class="page-subtitle">Rule-based academic & financial qualification evaluator against scheme parameters</p>
                </div>
            </div>

            <!-- SELECTION CARD -->
            <div class="card" style="margin-bottom: 24px;">
                <div class="card-header">
                    <h3 class="card-title">Select Student & Scholarship Scheme</h3>
                </div>
                <div class="card-body">
                    <div class="form-grid">
                        <div class="form-group">
                            <label>Candidate / Student Record <span class="required">*</span></label>
                            <select id="el-student-select" class="form-control" onchange="EligibilityView.runEvaluation()">
                                <option value="">Loading students...</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Scholarship Scheme <span class="required">*</span></label>
                            <select id="el-scheme-select" class="form-control" onchange="EligibilityView.runEvaluation()">
                                <option value="">Loading schemes...</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <!-- RESULT BREAKDOWN CONTAINER -->
            <div id="eligibility-results-card">
                <div class="empty-state">
                    <div class="empty-state-icon">⚖️</div>
                    <div class="empty-state-title">Select a student and scheme to evaluate eligibility</div>
                    <div class="empty-state-desc">The relational rule engine will compare academic scores, income thresholds, attendance, and department criteria.</div>
                </div>
            </div>
        `;

        await this.loadDropdowns();
    },

    async loadDropdowns() {
        const [studRes, schmRes] = await Promise.all([
            API.getStudents(),
            API.getSchemes({ status: 'Active' })
        ]);

        if (studRes.success && schmRes.success) {
            this.students = studRes.data;
            this.schemes = schmRes.data;

            const studSelect = document.getElementById('el-student-select');
            const schmSelect = document.getElementById('el-scheme-select');
            if (!studSelect || !schmSelect) return;

            if (App.currentRole === 'ROLE_STUDENT' && App.activeStudentId) {
                this.students = this.students.filter(s => s.student_id === App.activeStudentId);
                studSelect.disabled = true;
            } else {
                studSelect.disabled = false;
            }

            studSelect.innerHTML = this.students.map(s => `
                <option value="${s.student_id}">
                    ${s.roll_number} - ${s.first_name} ${s.last_name} (${s.department}, CGPA: ${s.cgpa}, Income: ${Utils.formatINR(s.annual_income)})
                </option>
            `).join('');

            schmSelect.innerHTML = this.schemes.map(sc => `
                <option value="${sc.scheme_id}">
                    ${sc.scheme_code} - ${sc.scheme_name} (Max: ${Utils.formatINR(sc.max_amount)})
                </option>
            `).join('');

            // Run initial check with first elements
            this.runEvaluation();
        }
    },

    async runEvaluation() {
        const studentId = document.getElementById('el-student-select')?.value;
        const schemeId = document.getElementById('el-scheme-select')?.value;
        const resultsContainer = document.getElementById('eligibility-results-card');

        if (!studentId || !schemeId || !resultsContainer) return;

        resultsContainer.innerHTML = `<div style="text-align: center; padding: 40px;"><div class="spinner"></div><p style="margin-top: 10px;">Evaluating against 3NF criteria...</p></div>`;

        const res = await API.checkEligibility(studentId, schemeId);
        if (!res.success) {
            resultsContainer.innerHTML = `<div class="empty-state"><div class="empty-state-title">Evaluation Error</div><div class="empty-state-desc">${res.error}</div></div>`;
            return;
        }

        const { isEligible, passedCount, failedCount, checks, student, scheme } = res;

        resultsContainer.innerHTML = `
            <div class="card">
                <div class="card-header" style="background: ${isEligible ? 'var(--success-light)' : 'var(--danger-light)'}; border-bottom: 1px solid ${isEligible ? 'var(--success-border)' : 'var(--danger-border)'};">
                    <div style="display: flex; align-items: center; gap: 14px;">
                        <span style="font-size: 2rem;">${isEligible ? '✅' : '❌'}</span>
                        <div>
                            <h3 style="color: ${isEligible ? 'var(--success)' : 'var(--danger)'}; font-size: 1.3rem;">
                                ${isEligible ? 'Candidate Is Fully ELIGIBLE' : 'Candidate Is NOT ELIGIBLE'}
                            </h3>
                            <p style="font-size: 0.85rem; color: ${isEligible ? '#065f46' : '#991b1b'}; margin-top: 2px;">
                                ${isEligible ? 
                                    'Candidate satisfies all mandatory academic, financial, attendance, and category thresholds.' : 
                                    `Candidate failed ${failedCount} mandatory criterion check(s). Submission blocked.`}
                            </p>
                        </div>
                    </div>
                    <div>
                        ${isEligible ? `
                            <button class="btn btn-success" onclick="ApplicationsView.startApplicationWizard(${scheme.scheme_id})">
                                Proceed to Apply Now &rarr;
                            </button>
                        ` : `
                            <button class="btn btn-secondary" disabled>Application Blocked</button>
                        `}
                    </div>
                </div>

                <div class="card-body">
                    <!-- Criteria Comparison Table -->
                    <h4 style="margin-bottom: 12px; color: var(--primary-900);">Criteria Rule-by-Rule Breakdown</h4>
                    <div class="table-responsive">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Criteria Dimension</th>
                                    <th>Scheme Requirement</th>
                                    <th>Candidate Actual</th>
                                    <th>Result</th>
                                    <th>Impact</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${checks.map(c => `
                                    <tr style="background: ${c.satisfied ? 'transparent' : '#fef2f2'};">
                                        <td><strong>${c.criterion}</strong></td>
                                        <td>${c.required}</td>
                                        <td><strong>${c.actual}</strong></td>
                                        <td>
                                            ${c.satisfied ? 
                                                '<span class="badge badge-verified"><span class="badge-dot"></span>Passed</span>' : 
                                                '<span class="badge badge-rejected"><span class="badge-dot"></span>Failed</span>'}
                                        </td>
                                        <td style="font-size: 0.8rem; color: ${c.satisfied ? '#059669' : '#dc2626'}; font-weight: 600;">
                                            ${c.satisfied ? 'Requirement Satisfied' : 'Violates Scheme Criterion'}
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>

                    <!-- Side-by-side Candidate vs Scheme Summary -->
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 24px; padding-top: 20px; border-top: 1px solid var(--border-color);">
                        <div style="background: var(--bg-surface-alt); padding: 14px; border-radius: 8px;">
                            <h4 style="margin-bottom: 8px; color: var(--primary-900);">Candidate Credentials</h4>
                            <div style="font-size: 0.84rem; line-height: 1.8;">
                                <div><strong>Name:</strong> ${student.first_name} ${student.last_name} (${student.roll_number})</div>
                                <div><strong>Department:</strong> ${student.department} (${student.program})</div>
                                <div><strong>Social Category:</strong> ${student.category}</div>
                                <div><strong>Academic Merit:</strong> ${student.cgpa} CGPA | ${student.academic_percentage}%</div>
                                <div><strong>Annual Family Income:</strong> ${Utils.formatINR(student.annual_income)}</div>
                                <div><strong>Attendance:</strong> ${student.attendance_pct}%</div>
                            </div>
                        </div>

                        <div style="background: var(--bg-surface-alt); padding: 14px; border-radius: 8px;">
                            <h4 style="margin-bottom: 8px; color: var(--primary-900);">Scheme Parameters</h4>
                            <div style="font-size: 0.84rem; line-height: 1.8;">
                                <div><strong>Scheme:</strong> ${scheme.scheme_name} (${scheme.scheme_code})</div>
                                <div><strong>Max Grant:</strong> ${Utils.formatINR(scheme.max_amount)}</div>
                                <div><strong>Min CGPA Cap:</strong> ${scheme.min_cgpa}</div>
                                <div><strong>Max Income Cap:</strong> ${Utils.formatINR(scheme.max_income)}</div>
                                <div><strong>Min Attendance Cap:</strong> ${scheme.min_attendance}%</div>
                                <div><strong>Target Scope:</strong> ${scheme.category_target}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    openCheckModal(preStudentId = null, preSchemeId = null) {
        App.navigate('eligibility');
        setTimeout(() => {
            if (preStudentId) {
                const sSelect = document.getElementById('el-student-select');
                if (sSelect) sSelect.value = preStudentId;
            }
            if (preSchemeId) {
                const scSelect = document.getElementById('el-scheme-select');
                if (scSelect) scSelect.value = preSchemeId;
            }
            this.runEvaluation();
        }, 100);
    }
};
