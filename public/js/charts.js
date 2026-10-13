// ============================================================================
// UNIVERSITY SCHOLARSHIP AND FINANCIAL AID MANAGEMENT SYSTEM (SFAMS)
// Custom High-Performance SVG / Canvas Visual Charts Module
// Zero bloat, responsive, and dynamic
// ============================================================================

const Charts = {
    // 1. Applications by Scheme (Horizontal Bars)
    renderSchemeChart(containerId, data) {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (!data || data.length === 0) {
            container.innerHTML = `<div class="empty-state-desc">No scheme application data available</div>`;
            return;
        }

        const maxCount = Math.max(...data.map(d => d.count), 1);

        let html = `<div class="bar-chart-container">`;
        data.forEach((item, idx) => {
            const pct = Math.round((item.count / maxCount) * 100);
            const colors = ['purple', 'emerald', '', 'amber'];
            const colorClass = colors[idx % colors.length];

            html += `
                <div class="bar-row">
                    <div class="bar-label-group">
                        <span class="bar-label" title="${item.scheme_name}">${item.scheme_name}</span>
                        <span class="bar-val">${item.count} app${item.count === 1 ? '' : 's'}</span>
                    </div>
                    <div class="bar-track">
                        <div class="bar-fill ${colorClass}" style="width: ${pct}%;"></div>
                    </div>
                </div>
            `;
        });
        html += `</div>`;
        container.innerHTML = html;
    },

    // 2. Application Status Distribution (Donut Chart)
    renderStatusDonut(containerId, data) {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (!data || data.length === 0) {
            container.innerHTML = `<div class="empty-state-desc">No application status data available</div>`;
            return;
        }

        const total = data.reduce((acc, curr) => acc + curr.count, 0) || 1;
        const colorMap = {
            'Submitted': '#0284c7',
            'Under Verification': '#d97706',
            'Verified': '#22c55e',
            'Approved': '#10b981',
            'Sanctioned': '#9333ea',
            'Disbursed': '#16a34a',
            'Rejected': '#ef4444'
        };

        // Calculate SVG circle segments
        const radius = 60;
        const circumference = 2 * Math.PI * radius;
        let cumulativePct = 0;
        let circlePaths = '';

        data.forEach(item => {
            const pct = item.count / total;
            const strokeDasharray = `${pct * circumference} ${circumference}`;
            const strokeDashoffset = -cumulativePct * circumference;
            const color = colorMap[item.status] || '#64748b';

            circlePaths += `
                <circle cx="90" cy="90" r="${radius}" 
                    fill="transparent" 
                    stroke="${color}" 
                    stroke-width="26" 
                    stroke-dasharray="${strokeDasharray}" 
                    stroke-dashoffset="${strokeDashoffset}"
                    style="transition: all 0.5s ease;">
                    <title>${item.status}: ${item.count} (${Math.round(pct * 100)}%)</title>
                </circle>
            `;
            cumulativePct += pct;
        });

        let legendHtml = `<div class="donut-legend">`;
        data.forEach(item => {
            const color = colorMap[item.status] || '#64748b';
            const pct = Math.round((item.count / total) * 100);
            legendHtml += `
                <div class="donut-legend-item">
                    <span class="legend-color-dot" style="background: ${color};"></span>
                    <span style="font-weight: 500; color: var(--primary-700);">${item.status}:</span>
                    <span style="font-weight: 700; color: var(--primary-900); margin-left: auto;">${item.count} (${pct}%)</span>
                </div>
            `;
        });
        legendHtml += `</div>`;

        container.innerHTML = `
            <div class="donut-layout">
                <svg width="180" height="180" viewBox="0 0 180 180" style="transform: rotate(-90deg); flex-shrink: 0;">
                    ${circlePaths}
                    <text x="90" y="90" text-anchor="middle" dominant-baseline="middle" 
                        font-family="Outfit, sans-serif" font-weight="bold" font-size="20" fill="#0f172a" 
                        style="transform: rotate(90deg); transform-origin: 90px 90px;">
                        ${total}
                    </text>
                    <text x="90" y="110" text-anchor="middle" dominant-baseline="middle" 
                        font-size="9" fill="#64748b" font-weight="600"
                        style="transform: rotate(90deg); transform-origin: 90px 90px;">
                        TOTAL APPS
                    </text>
                </svg>
                ${legendHtml}
            </div>
        `;
    },

    // 3. Sanctioned vs Disbursed per Scheme (Dual Comparative Bars)
    renderBudgetComparison(containerId, data) {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (!data || data.length === 0) {
            container.innerHTML = `<div class="empty-state-desc">No financial comparison data available</div>`;
            return;
        }

        const maxAmount = Math.max(...data.map(d => Math.max(d.sanctioned, d.disbursed)), 10000);

        let html = `<div style="display: flex; flex-direction: column; gap: 14px; width: 100%;">`;
        data.forEach(item => {
            const sancPct = Math.round((item.sanctioned / maxAmount) * 100);
            const disbPct = Math.round((item.disbursed / maxAmount) * 100);

            html += `
                <div style="display: flex; flex-direction: column; gap: 4px;">
                    <div style="display: flex; justify-content: space-between; font-size: 0.8rem;">
                        <span style="font-weight: 600; color: var(--primary-800);">${item.scheme_code} - ${item.scheme_name}</span>
                        <span>
                            <strong style="color: #7c3aed;">Sanc:</strong> ${Utils.formatINR(item.sanctioned)} &nbsp;|&nbsp;
                            <strong style="color: #059669;">Disb:</strong> ${Utils.formatINR(item.disbursed)}
                        </span>
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 3px;">
                        <!-- Sanctioned Bar -->
                        <div class="bar-track" style="height: 7px;">
                            <div class="bar-fill purple" style="width: ${sancPct}%;"></div>
                        </div>
                        <!-- Disbursed Bar -->
                        <div class="bar-track" style="height: 7px;">
                            <div class="bar-fill emerald" style="width: ${disbPct}%;"></div>
                        </div>
                    </div>
                </div>
            `;
        });
        html += `
            <div style="display: flex; gap: 16px; font-size: 0.75rem; justify-content: flex-end; margin-top: 4px;">
                <span style="display: flex; align-items: center; gap: 6px;"><span class="legend-color-dot" style="background: #7c3aed;"></span> Sanctioned</span>
                <span style="display: flex; align-items: center; gap: 6px;"><span class="legend-color-dot" style="background: #059669;"></span> Disbursed</span>
            </div>
        </div>`;
        container.innerHTML = html;
    },

    // 4. Department-wise Distribution
    renderDeptDistribution(containerId, data) {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (!data || data.length === 0) {
            container.innerHTML = `<div class="empty-state-desc">No department data available</div>`;
            return;
        }

        const maxCount = Math.max(...data.map(d => d.count), 1);

        let html = `<div class="bar-chart-container">`;
        data.forEach(item => {
            const pct = Math.round((item.count / maxCount) * 100);
            html += `
                <div class="bar-row">
                    <div class="bar-label-group">
                        <span class="bar-label">${item.department}</span>
                        <span class="bar-val">${item.count} student${item.count === 1 ? '' : 's'}</span>
                    </div>
                    <div class="bar-track">
                        <div class="bar-fill" style="width: ${pct}%;"></div>
                    </div>
                </div>
            `;
        });
        html += `</div>`;
        container.innerHTML = html;
    },

    // 5. Monthly Disbursements Trend
    renderMonthlyTrend(containerId, data) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const maxVal = Math.max(...data.map(d => d.amount), 50000);

        let bars = '';
        data.forEach(item => {
            const heightPct = Math.round((item.amount / maxVal) * 100);
            bars += `
                <div style="display: flex; flex-direction: column; align-items: center; gap: 6px; flex: 1;">
                    <span style="font-size: 0.72rem; font-weight: 600; color: var(--accent-blue);">${Utils.formatINR(item.amount)}</span>
                    <div style="height: 120px; width: 34px; background: var(--bg-surface-alt); border-radius: 6px; display: flex; align-items: flex-end; overflow: hidden;">
                        <div style="width: 100%; height: ${heightPct}%; background: linear-gradient(180deg, #2563eb, #1d4ed8); border-radius: 6px 6px 0 0; transition: height 0.6s ease;"></div>
                    </div>
                    <span style="font-size: 0.76rem; font-weight: 600; color: var(--primary-600);">${item.month}</span>
                </div>
            `;
        });

        container.innerHTML = `
            <div style="display: flex; align-items: flex-end; justify-content: space-around; width: 100%; height: 180px; padding-top: 10px;">
                ${bars}
            </div>
        `;
    }
};
