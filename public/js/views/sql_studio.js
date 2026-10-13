// ============================================================================
// UNIVERSITY SCHOLARSHIP AND FINANCIAL AID MANAGEMENT SYSTEM (SFAMS)
// DBMS Explorer & Interactive SQL Query Studio (Academic Demo Feature)
// ============================================================================

const SqlStudioView = {
    presets: [],
    tables: [],
    activeTab: 'console', // 'console' | 'er' | 'tables'

    async render(container) {
        container.innerHTML = `
            <div class="page-header">
                <div class="page-title-group">
                    <h1>DBMS Academic Project Explorer & SQL Studio</h1>
                    <p class="page-subtitle">Interactive 3NF Relational Schema, ACID Transactions, JOINs, Views & Live SQL Console</p>
                </div>
                <div class="page-actions">
                    <a href="/api/sql/download-mysql" download="mysql_scholarship_schema.sql" class="btn btn-primary">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
                        Download MySQL 8.0 DDL Script (.sql)
                    </a>
                </div>
            </div>

            <!-- TAB SWITCHER -->
            <div style="display: flex; gap: 8px; margin-bottom: 20px; border-bottom: 1px solid var(--border-color); padding-bottom: 10px;">
                <button class="btn btn-primary" id="tab-btn-console" onclick="SqlStudioView.switchTab('console')">
                    ⚡ Live SQL Console & Presets
                </button>
                <button class="btn btn-secondary" id="tab-btn-er" onclick="SqlStudioView.switchTab('er')">
                    📐 Interactive ER Diagram (3NF)
                </button>
                <button class="btn btn-secondary" id="tab-btn-tables" onclick="SqlStudioView.switchTab('tables')">
                    🗃️ Database Table Browser (15 Tables)
                </button>
            </div>

            <!-- TAB 1: LIVE SQL CONSOLE -->
            <div id="tab-content-console">
                <div class="sql-studio-grid">
                    <!-- SIDEBAR: PRESET QUERIES -->
                    <div class="sql-sidebar">
                        <div style="display: flex; align-items: center; justify-content: space-between;">
                            <span style="font-weight: 700; font-size: 0.85rem; color: var(--primary-900);">DBMS Exam Presets</span>
                            <span class="badge badge-submitted" id="presets-count-badge">0 Queries</span>
                        </div>
                        <div id="presets-list" style="display: flex; flex-direction: column; gap: 6px;">
                            <div class="spinner"></div>
                        </div>
                    </div>

                    <!-- MAIN: SQL EDITOR & EXECUTION RESULTS -->
                    <div>
                        <div class="sql-editor-container">
                            <div class="sql-editor-header">
                                <span class="sql-editor-title">SQL Query Editor (Standard ANSI / SQLite Engine)</span>
                                <div style="display: flex; gap: 8px;">
                                    <button class="btn btn-secondary btn-sm" onclick="SqlStudioView.clearEditor()" style="background: rgba(255,255,255,0.1); color: #ffffff; border-color: transparent;">
                                        Clear
                                    </button>
                                    <button class="btn btn-success btn-sm" onclick="SqlStudioView.runQuery()">
                                        ▶ Run Query (Ctrl+Enter)
                                    </button>
                                </div>
                            </div>
                            <textarea id="sql-editor-input" class="sql-editor-textarea" spellcheck="false" placeholder="Type relational SQL query here (e.g. SELECT * FROM students INNER JOIN applications ON students.student_id = applications.student_id;)">SELECT a.application_no, (s.first_name || ' ' || s.last_name) AS student_name, s.department, sc.scheme_name, a.status, COALESCE(sn.sanction_amount, 0) AS sanction_inr
FROM applications a
INNER JOIN students s ON a.student_id = s.student_id
INNER JOIN scholarship_schemes sc ON a.scheme_id = sc.scheme_id
LEFT JOIN sanctions sn ON a.application_id = sn.application_id
ORDER BY a.application_id DESC;</textarea>
                        </div>

                        <!-- RESULTS TABLE CONTAINER -->
                        <div id="query-result-wrapper">
                            <div class="sql-result-header">
                                <div>
                                    <strong>Query Execution Results:</strong>
                                    <span id="result-row-count" style="color: var(--primary-500); margin-left: 8px;">Click "Run Query" to execute</span>
                                </div>
                                <span class="execution-time-badge" id="exec-time-badge">0 ms</span>
                            </div>
                            <div class="table-responsive" style="max-height: 440px; background: #ffffff; border: 1px solid var(--border-color); border-top: none; border-radius: 0 0 8px 8px;">
                                <table class="data-table" id="sql-result-table">
                                    <tbody id="sql-result-tbody">
                                        <tr><td style="text-align: center; padding: 40px; color: var(--primary-500);">Run a query or click any preset to view output.</td></tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- TAB 2: INTERACTIVE ER DIAGRAM -->
            <div id="tab-content-er" style="display: none;">
                <div class="er-diagram-container">
                    <div style="margin-bottom: 20px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #334155; padding-bottom: 14px;">
                        <div>
                            <h3 style="color: #38bdf8; font-size: 1.25rem;">Relational Entity-Relationship (ER) Architecture</h3>
                            <p style="color: #94a3b8; font-size: 0.85rem; margin-top: 2px;">Fully normalized into Third Normal Form (3NF) eliminating transitive and partial functional dependencies</p>
                        </div>
                        <div style="display: flex; gap: 14px; font-size: 0.78rem;">
                            <span style="display: flex; align-items: center; gap: 6px;"><span class="key-pk">🔑 PK</span> Primary Key</span>
                            <span style="display: flex; align-items: center; gap: 6px;"><span class="key-fk">🔗 FK</span> Foreign Key</span>
                            <span style="display: flex; align-items: center; gap: 6px; color: #a7f3d0;">🛡️ 3NF Compliant</span>
                        </div>
                    </div>

                    <div class="er-diagram-grid" id="er-tables-grid">
                        <div class="spinner"></div>
                    </div>
                </div>
            </div>

            <!-- TAB 3: TABLE BROWSER -->
            <div id="tab-content-tables" style="display: none;">
                <div id="table-browser-content">
                    <div class="spinner"></div>
                </div>
            </div>
        `;

        await this.loadPresets();
        await this.loadTables();

        // Keyboard shortcut: Ctrl+Enter to run query
        const editor = document.getElementById('sql-editor-input');
        if (editor) {
            editor.addEventListener('keydown', (e) => {
                if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                    e.preventDefault();
                    this.runQuery();
                }
            });
        }
    },

    switchTab(tab) {
        this.activeTab = tab;
        ['console', 'er', 'tables'].forEach(t => {
            const btn = document.getElementById(`tab-btn-${t}`);
            const content = document.getElementById(`tab-content-${t}`);
            if (btn && content) {
                if (t === tab) {
                    btn.className = 'btn btn-primary';
                    content.style.display = 'block';
                } else {
                    btn.className = 'btn btn-secondary';
                    content.style.display = 'none';
                }
            }
        });
    },

    async loadPresets() {
        const res = await API.getSqlPresets();
        if (!res.success) return;

        this.presets = res.presets;
        const badge = document.getElementById('presets-count-badge');
        const container = document.getElementById('presets-list');
        if (badge) badge.textContent = `${this.presets.length} Presets`;
        if (!container) return;

        // Group presets by category
        const groups = {};
        this.presets.forEach(p => {
            if (!groups[p.category]) groups[p.category] = [];
            groups[p.category].push(p);
        });

        let html = '';
        Object.keys(groups).forEach(cat => {
            html += `
                <div class="sql-preset-group">
                    <div class="sql-preset-header">${cat}</div>
                    ${groups[cat].map(p => `
                        <button class="sql-preset-btn" onclick="SqlStudioView.selectPreset('${p.id}')" title="${p.description}">
                            ${p.title}
                        </button>
                    `).join('')}
                </div>
            `;
        });

        container.innerHTML = html;
    },

    selectPreset(id) {
        const p = this.presets.find(item => item.id === id);
        if (!p) return;

        const editor = document.getElementById('sql-editor-input');
        if (editor) {
            editor.value = p.sql;
            this.runQuery();
        }
    },

    clearEditor() {
        const editor = document.getElementById('sql-editor-input');
        if (editor) {
            editor.value = '';
            editor.focus();
        }
    },

    async runQuery() {
        const editor = document.getElementById('sql-editor-input');
        const sql = editor?.value.trim();

        if (!sql) {
            Utils.showToast('Please type an SQL query to execute', 'warning');
            return;
        }

        const tbody = document.getElementById('sql-result-tbody');
        const countSpan = document.getElementById('result-row-count');
        const timeBadge = document.getElementById('exec-time-badge');

        if (tbody) tbody.innerHTML = `<tr><td style="text-align: center; padding: 30px;"><div class="spinner"></div></td></tr>`;

        const res = await API.executeSql(sql);

        if (!res.success) {
            if (timeBadge) timeBadge.textContent = `${res.duration || 0} ms`;
            if (countSpan) countSpan.textContent = `Query Execution Failed`;
            if (tbody) {
                tbody.innerHTML = `
                    <tr>
                        <td style="padding: 24px; color: var(--danger); background: var(--danger-light);">
                            <strong>SQL Syntax / Execution Error:</strong><br>
                            <code>${res.error}</code>
                        </td>
                    </tr>
                `;
            }
            return;
        }

        if (timeBadge) timeBadge.textContent = `${res.duration} ms`;
        if (countSpan) countSpan.textContent = `${res.rowCount || 0} rows returned`;

        if (!res.columns || res.columns.length === 0) {
            if (tbody) {
                tbody.innerHTML = `
                    <tr>
                        <td style="padding: 20px; color: var(--success); background: var(--success-light);">
                            ✅ Statement executed successfully. ${res.message || ''}
                        </td>
                    </tr>
                `;
            }
            return;
        }

        // Render tabular output
        const table = document.getElementById('sql-result-table');
        if (table) {
            const theadHtml = `
                <thead>
                    <tr>
                        ${res.columns.map(c => `<th>${c}</th>`).join('')}
                    </tr>
                </thead>
            `;

            let tbodyHtml = '<tbody>';
            if (res.rows.length === 0) {
                tbodyHtml += `<tr><td colspan="${res.columns.length}" style="text-align: center; padding: 24px; color: var(--primary-500);">0 rows returned.</td></tr>`;
            } else {
                res.rows.forEach(row => {
                    tbodyHtml += '<tr>';
                    row.forEach(val => {
                        const displayVal = val === null ? '<span style="color: #94a3b8; font-style: italic;">NULL</span>' : String(val);
                        tbodyHtml += `<td>${displayVal}</td>`;
                    });
                    tbodyHtml += '</tr>';
                });
            }
            tbodyHtml += '</tbody>';

            table.innerHTML = theadHtml + tbodyHtml;
        }
    },

    async loadTables() {
        const res = await API.getSqlTables();
        if (!res.success) return;

        this.tables = res.tables;
        this.renderErDiagram(this.tables);
        this.renderTableBrowser(this.tables);
    },

    renderErDiagram(tables) {
        const container = document.getElementById('er-tables-grid');
        if (!container) return;

        container.innerHTML = tables.map(t => {
            const isView = t.type === 'view';
            return `
                <div class="er-table-card">
                    <div class="er-table-header">
                        <span class="er-table-name">${t.name}</span>
                        <span class="er-table-badge">${isView ? 'VIEW' : `${t.rowCount} rows`}</span>
                    </div>
                    <div class="er-columns-list">
                        ${t.columns.map(col => {
                            const isPk = col.pk === 1;
                            const isFk = col.name.endsWith('_id') && !isPk;
                            return `
                                <div class="er-column-row">
                                    <span class="er-col-key">
                                        ${isPk ? '<span class="key-pk">🔑</span>' : (isFk ? '<span class="key-fk">🔗</span>' : '&nbsp;&nbsp;')}
                                        <span style="color: ${isPk ? '#fef08a' : (isFk ? '#c4b5fd' : '#cbd5e1')};">${col.name}</span>
                                    </span>
                                    <span class="er-col-type">${col.type || 'TEXT'}</span>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;
        }).join('');
    },

    renderTableBrowser(tables) {
        const container = document.getElementById('table-browser-content');
        if (!container) return;

        container.innerHTML = `
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 16px;">
                ${tables.map(t => `
                    <div class="card" style="margin-bottom: 0;">
                        <div class="card-header">
                            <div>
                                <h4 style="font-family: var(--font-mono); color: var(--accent-blue);">${t.name}</h4>
                                <span class="badge ${t.type === 'view' ? 'badge-sanctioned' : 'badge-submitted'}">${t.type} (${t.rowCount} records)</span>
                            </div>
                            <button class="btn btn-secondary btn-sm" onclick="SqlStudioView.previewTableData('${t.name}')">
                                Browse Rows
                            </button>
                        </div>
                        <div class="card-body" style="padding: 12px 18px;">
                            <div style="font-size: 0.78rem; color: var(--primary-600); max-height: 100px; overflow-y: auto;">
                                <strong>Columns (${t.columns.length}):</strong><br>
                                ${t.columns.map(c => `<code>${c.name}</code> (${c.type})`).join(', ')}
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    },

    previewTableData(tableName) {
        const editor = document.getElementById('sql-editor-input');
        if (editor) {
            editor.value = `SELECT * FROM ${tableName} LIMIT 25;`;
            this.switchTab('console');
            this.runQuery();
        }
    }
};
