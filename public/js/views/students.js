// ============================================================================
// UNIVERSITY SCHOLARSHIP AND FINANCIAL AID MANAGEMENT SYSTEM (SFAMS)
// Students Directory & Profile View Component
// ============================================================================

const StudentsView = {
    studentsList: [],

    async render(container) {
        container.innerHTML = `
            <div class="page-header">
                <div class="page-title-group">
                    <h1>Student Directory & Academic Profiles</h1>
                    <p class="page-subtitle">Master records of enrolled students, social categories, GPA, and family income</p>
                </div>
                <div class="page-actions">
                    <button class="btn btn-primary" onclick="StudentsView.showAddStudentModal()">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>
                        Enroll New Student
                    </button>
                </div>
            </div>

            <!-- FILTER & SEARCH BAR -->
            <div class="filter-bar">
                <div class="filter-item" style="flex: 1; min-width: 220px;">
                    <input type="text" id="student-search-input" class="form-control" placeholder="Search by name, roll no, email..." oninput="StudentsView.applyFilters()">
                </div>
                <div class="filter-item">
                    <label style="font-weight: 600; font-size: 0.8rem; color: var(--primary-600);">Department:</label>
                    <select id="student-dept-filter" class="form-control" style="width: auto;" onchange="StudentsView.applyFilters()">
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
                <div class="filter-item">
                    <label style="font-weight: 600; font-size: 0.8rem; color: var(--primary-600);">Category:</label>
                    <select id="student-category-filter" class="form-control" style="width: auto;" onchange="StudentsView.applyFilters()">
                        <option value="All">All Categories</option>
                        <option value="General">General</option>
                        <option value="OBC">OBC</option>
                        <option value="SC">SC</option>
                        <option value="ST">ST</option>
                        <option value="EWS">EWS</option>
                    </select>
                </div>
            </div>

            <!-- STUDENTS DATA TABLE -->
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Enrolled Students (<span id="student-total-count">0</span>)</h3>
                </div>
                <div class="table-responsive">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Roll No / ID</th>
                                <th>Student Name</th>
                                <th>Department & Program</th>
                                <th>Category</th>
                                <th>CGPA / %</th>
                                <th>Family Income</th>
                                <th>Attendance</th>
                                <th>Bank Account</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody id="students-table-body">
                            <tr><td colspan="9" style="text-align: center; padding: 30px;"><div class="spinner"></div></td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        await this.loadStudents();
    },

    async loadStudents() {
        const res = await API.getStudents();
        if (res.success) {
            this.studentsList = res.data;
            this.renderTable(this.studentsList);
        } else {
            Utils.showToast('Failed to load students: ' + res.error, 'error');
        }
    },

    applyFilters() {
        const query = document.getElementById('student-search-input').value.toLowerCase().trim();
        const dept = document.getElementById('student-dept-filter').value;
        const cat = document.getElementById('student-category-filter').value;

        const filtered = this.studentsList.filter(s => {
            const matchesQuery = !query || 
                s.roll_number.toLowerCase().includes(query) ||
                `${s.first_name} ${s.last_name}`.toLowerCase().includes(query) ||
                s.email.toLowerCase().includes(query);
            
            const matchesDept = dept === 'All' || s.department === dept;
            const matchesCat = cat === 'All' || s.category === cat;

            return matchesQuery && matchesDept && matchesCat;
        });

        this.renderTable(filtered);
    },

    renderTable(list) {
        const tbody = document.getElementById('students-table-body');
        const countSpan = document.getElementById('student-total-count');
        if (!tbody) return;

        countSpan.textContent = list.length;

        if (list.length === 0) {
            tbody.innerHTML = `<tr><td colspan="9" style="text-align: center; padding: 40px; color: var(--primary-500);">No student records matched the criteria.</td></tr>`;
            return;
        }

        tbody.innerHTML = list.map(s => `
            <tr>
                <td>
                    <strong>${s.roll_number}</strong>
                    <div style="font-size: 0.72rem; color: var(--primary-500);">ID: #${s.student_id}</div>
                </td>
                <td>
                    <div style="font-weight: 600; color: var(--primary-900);">${s.first_name} ${s.last_name}</div>
                    <div style="font-size: 0.76rem; color: var(--primary-500);">${s.email}</div>
                </td>
                <td>
                    <div style="font-weight: 500;">${s.department}</div>
                    <div style="font-size: 0.76rem; color: var(--primary-500);">${s.program} (Sem ${s.semester})</div>
                </td>
                <td>
                    <span class="badge badge-submitted">${s.category}</span>
                </td>
                <td>
                    <strong style="color: var(--accent-blue);">${s.cgpa} CGPA</strong>
                    <div style="font-size: 0.76rem; color: var(--primary-500);">${s.academic_percentage}%</div>
                </td>
                <td>
                    <strong style="color: #047857;">${Utils.formatINR(s.annual_income)}</strong>
                    <div style="font-size: 0.72rem; color: var(--primary-500);">Per Annum</div>
                </td>
                <td>
                    <span style="font-weight: 600; color: ${s.attendance_pct >= 80 ? '#059669' : '#d97706'};">${s.attendance_pct}%</span>
                </td>
                <td>
                    <div style="font-size: 0.8rem; font-weight: 500;">${s.bank_name}</div>
                    <div style="font-size: 0.74rem; font-family: var(--font-mono); color: var(--primary-500);">${Utils.maskAccount(s.account_number)}</div>
                </td>
                <td>
                    <button class="btn btn-secondary btn-sm" onclick="StudentsView.showProfile(${s.student_id})">
                        View Profile
                    </button>
                </td>
            </tr>
        `).join('');
    },

    async showProfile(studentId) {
        const res = await API.getStudentById(studentId);
        if (!res.success) {
            Utils.showToast('Could not load student profile', 'error');
            return;
        }

        const s = res.student;
        const b = res.bankDetails;
        const apps = res.applications;

        let appsHtml = '';
        if (apps.length === 0) {
            appsHtml = '<p style="font-size: 0.85rem; color: var(--primary-500);">No scholarship applications submitted yet.</p>';
        } else {
            appsHtml = `
                <table class="data-table" style="font-size: 0.8rem;">
                    <thead>
                        <tr>
                            <th>App No</th>
                            <th>Scheme Name</th>
                            <th>Status</th>
                            <th>Submission Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${apps.map(a => `
                            <tr>
                                <td><strong>${a.application_no}</strong></td>
                                <td>${a.scheme_name}</td>
                                <td>${Utils.getStatusBadge(a.status)}</td>
                                <td>${Utils.formatDate(a.submission_date)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        }

        Utils.openModal({
            title: `Student Academic Profile: ${s.first_name} ${s.last_name}`,
            sizeClass: 'modal-lg',
            contentHtml: `
                <div style="display: flex; gap: 24px; flex-wrap: wrap; margin-bottom: 24px;">
                    <div style="flex: 1; min-width: 280px;">
                        <h4 style="margin-bottom: 12px; color: var(--primary-800); border-bottom: 2px solid var(--border-color); padding-bottom: 6px;">Personal & Academic Records</h4>
                        <table style="width: 100%; font-size: 0.88rem; line-height: 1.8;">
                            <tr><td style="color: var(--primary-500); width: 40%;">Roll Number:</td><td><strong>${s.roll_number}</strong></td></tr>
                            <tr><td style="color: var(--primary-500);">Gender / DOB:</td><td>${s.gender} | ${Utils.formatDate(s.dob)}</td></tr>
                            <tr><td style="color: var(--primary-500);">Email Address:</td><td>${s.email}</td></tr>
                            <tr><td style="color: var(--primary-500);">Phone Number:</td><td>${s.phone}</td></tr>
                            <tr><td style="color: var(--primary-500);">Department:</td><td><strong>${s.department}</strong></td></tr>
                            <tr><td style="color: var(--primary-500);">Program / Sem:</td><td>${s.program} (Semester ${s.semester})</td></tr>
                            <tr><td style="color: var(--primary-500);">Category:</td><td><span class="badge badge-submitted">${s.category}</span></td></tr>
                            <tr><td style="color: var(--primary-500);">CGPA:</td><td><strong style="color: var(--accent-blue);">${s.cgpa} / 10.00</strong> (${s.academic_percentage}%)</td></tr>
                            <tr><td style="color: var(--primary-500);">Annual Income:</td><td><strong style="color: #047857;">${Utils.formatINR(s.annual_income)}</strong></td></tr>
                            <tr><td style="color: var(--primary-500);">Attendance:</td><td>${s.attendance_pct}%</td></tr>
                            <tr><td style="color: var(--primary-500);">Permanent Address:</td><td style="font-size: 0.8rem;">${s.address || '—'}</td></tr>
                        </table>
                    </div>

                    <div style="flex: 1; min-width: 280px;">
                        <h4 style="margin-bottom: 12px; color: var(--primary-800); border-bottom: 2px solid var(--border-color); padding-bottom: 6px;">Bank Account Coordinates (DBT)</h4>
                        ${b ? `
                            <table style="width: 100%; font-size: 0.88rem; line-height: 1.8;">
                                <tr><td style="color: var(--primary-500); width: 40%;">Account Holder:</td><td><strong>${b.account_holder_name}</strong></td></tr>
                                <tr><td style="color: var(--primary-500);">Bank Name:</td><td>${b.bank_name}</td></tr>
                                <tr><td style="color: var(--primary-500);">Account Number:</td><td><code>${b.account_number}</code></td></tr>
                                <tr><td style="color: var(--primary-500);">IFSC Code:</td><td><code>${b.ifsc_code}</code></td></tr>
                                <tr><td style="color: var(--primary-500);">Branch Name:</td><td>${b.branch_name}</td></tr>
                                <tr><td style="color: var(--primary-500);">Verification Status:</td><td>${b.is_verified ? '<span class="badge badge-verified">Verified for DBT</span>' : '<span class="badge badge-pending">Pending Verification</span>'}</td></tr>
                            </table>
                        ` : `
                            <p style="color: var(--warning); font-size: 0.85rem;">⚠️ No bank account registered yet.</p>
                        `}
                    </div>
                </div>

                <div>
                    <h4 style="margin-bottom: 10px; color: var(--primary-800); border-bottom: 2px solid var(--border-color); padding-bottom: 6px;">Application History</h4>
                    ${appsHtml}
                </div>
            `,
            footerHtml: `
                <button class="btn btn-secondary" onclick="Utils.closeModal()">Close</button>
                <button class="btn btn-primary" onclick="Utils.closeModal(); EligibilityView.openCheckModal(${s.student_id})">Check Scheme Eligibility</button>
            `
        });
    },

    showAddStudentModal() {
        Utils.openModal({
            title: 'Enroll New Student in System',
            sizeClass: 'modal-lg',
            contentHtml: `
                <form id="add-student-form">
                    <div class="form-grid">
                        <div class="form-group">
                            <label>Roll Number <span class="required">*</span></label>
                            <input type="text" id="new-roll" class="form-control" placeholder="e.g. 25WU0102085" required>
                        </div>
                        <div class="form-group">
                            <label>First Name <span class="required">*</span></label>
                            <input type="text" id="new-fname" class="form-control" placeholder="e.g. Rohan" required>
                        </div>
                        <div class="form-group">
                            <label>Last Name <span class="required">*</span></label>
                            <input type="text" id="new-lname" class="form-control" placeholder="e.g. Kumar" required>
                        </div>
                        <div class="form-group">
                            <label>Date of Birth <span class="required">*</span></label>
                            <input type="date" id="new-dob" class="form-control" value="2004-01-15" required>
                        </div>
                        <div class="form-group">
                            <label>Gender <span class="required">*</span></label>
                            <select id="new-gender" class="form-control" required>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Email Address <span class="required">*</span></label>
                            <input type="email" id="new-email" class="form-control" placeholder="student@univ.ac.in" required>
                        </div>
                        <div class="form-group">
                            <label>Mobile Number <span class="required">*</span></label>
                            <input type="tel" id="new-phone" class="form-control" placeholder="+91 98765 43210" required>
                        </div>
                        <div class="form-group">
                            <label>Department <span class="required">*</span></label>
                            <select id="new-dept" class="form-control" required>
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
                            <label>Program <span class="required">*</span></label>
                            <select id="new-prog" class="form-control" required>
                                <option value="B.Tech">B.Tech</option>
                                <option value="M.Tech">M.Tech</option>
                                <option value="MCA">MCA</option>
                                <option value="M.Sc">M.Sc</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Current Semester <span class="required">*</span></label>
                            <input type="number" id="new-sem" class="form-control" min="1" max="10" value="4" required>
                        </div>
                        <div class="form-group">
                            <label>Social Category <span class="required">*</span></label>
                            <select id="new-cat" class="form-control" required>
                                <option value="General">General</option>
                                <option value="OBC">OBC</option>
                                <option value="SC">SC</option>
                                <option value="ST">ST</option>
                                <option value="EWS">EWS</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Cumulative CGPA (0.00 - 10.00) <span class="required">*</span></label>
                            <input type="number" id="new-cgpa" class="form-control" step="0.01" min="0" max="10" value="8.50" required>
                        </div>
                        <div class="form-group">
                            <label>Academic Percentage (%) <span class="required">*</span></label>
                            <input type="number" id="new-pct" class="form-control" step="0.1" min="0" max="100" value="82.5" required>
                        </div>
                        <div class="form-group">
                            <label>Annual Family Income (₹) <span class="required">*</span></label>
                            <input type="number" id="new-income" class="form-control" step="1000" min="0" value="250000" required>
                        </div>
                        <div class="form-group">
                            <label>Attendance Percentage (%) <span class="required">*</span></label>
                            <input type="number" id="new-att" class="form-control" step="0.1" min="0" max="100" value="88.0" required>
                        </div>
                    </div>
                </form>
            `,
            footerHtml: `
                <button class="btn btn-secondary" onclick="Utils.closeModal()">Cancel</button>
                <button class="btn btn-primary" onclick="StudentsView.submitNewStudent()">Save Student Record</button>
            `
        });
    },

    async submitNewStudent() {
        const payload = {
            roll_number: document.getElementById('new-roll').value.trim(),
            first_name: document.getElementById('new-fname').value.trim(),
            last_name: document.getElementById('new-lname').value.trim(),
            dob: document.getElementById('new-dob').value,
            gender: document.getElementById('new-gender').value,
            email: document.getElementById('new-email').value.trim(),
            phone: document.getElementById('new-phone').value.trim(),
            department: document.getElementById('new-dept').value,
            program: document.getElementById('new-prog').value,
            semester: parseInt(document.getElementById('new-sem').value),
            category: document.getElementById('new-cat').value,
            cgpa: parseFloat(document.getElementById('new-cgpa').value),
            academic_percentage: parseFloat(document.getElementById('new-pct').value),
            annual_income: parseFloat(document.getElementById('new-income').value),
            attendance_pct: parseFloat(document.getElementById('new-att').value),
            admission_year: 2024
        };

        if (!payload.roll_number || !payload.first_name || !payload.email) {
            Utils.showToast('Please fill all mandatory fields', 'warning');
            return;
        }

        const res = await API.createStudent(payload);
        if (res.success) {
            Utils.showToast('Student enrolled successfully into database!', 'success');
            Utils.closeModal();
            await this.loadStudents();
        } else {
            Utils.showToast('Error: ' + res.error, 'error');
        }
    }
};
