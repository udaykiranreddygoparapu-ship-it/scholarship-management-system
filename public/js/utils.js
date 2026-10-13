// ============================================================================
// UNIVERSITY SCHOLARSHIP AND FINANCIAL AID MANAGEMENT SYSTEM (SFAMS)
// Utilities, Helpers, UI Modals & Notification Service
// ============================================================================

const Utils = {
    // Format Indian Rupees currency
    formatINR(num) {
        if (num === null || num === undefined || isNaN(num)) return '₹0';
        return '₹' + parseFloat(num).toLocaleString('en-IN', { maximumFractionDigits: 0 });
    },

    // Format Dates nicely
    formatDate(dateStr) {
        if (!dateStr) return '—';
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    },

    // Generate responsive status badges
    getStatusBadge(status) {
        if (!status) return '<span class="badge">N/A</span>';
        const s = status.toLowerCase();
        let badgeClass = 'badge-submitted';

        if (s.includes('verif') && !s.includes('under')) badgeClass = 'badge-verified';
        else if (s.includes('under') || s.includes('doc')) badgeClass = 'badge-under-verification';
        else if (s.includes('approv')) badgeClass = 'badge-approved';
        else if (s.includes('sanction')) badgeClass = 'badge-sanctioned';
        else if (s.includes('disburs') || s.includes('success')) badgeClass = 'badge-disbursed';
        else if (s.includes('reject') || s.includes('fail')) badgeClass = 'badge-rejected';
        else if (s.includes('pend')) badgeClass = 'badge-pending';

        return `<span class="badge ${badgeClass}"><span class="badge-dot"></span>${status}</span>`;
    },

    // Mask bank account number for security: "•••• •••• 4821"
    maskAccount(accNo) {
        if (!accNo) return '—';
        const clean = String(accNo).trim();
        if (clean.length < 5) return clean;
        const last4 = clean.slice(-4);
        return `•••• •••• ${last4}`;
    },

    // Toast Notifications
    showToast(message, type = 'info', duration = 4000) {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };

        toast.innerHTML = `
            <div style="font-size: 1.1rem; line-height: 1;">${icons[type] || 'ℹ️'}</div>
            <div style="flex: 1;">${message}</div>
        `;

        container.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            toast.style.transition = 'all 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    },

    // Modal Manager
    openModal({ title, contentHtml, footerHtml = '', sizeClass = '' }) {
        let overlay = document.getElementById('app-modal-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'app-modal-overlay';
            overlay.className = 'modal-overlay';
            document.body.appendChild(overlay);
        }

        overlay.innerHTML = `
            <div class="modal-container ${sizeClass}">
                <div class="modal-header">
                    <h3>${title}</h3>
                    <button class="modal-close-btn" onclick="Utils.closeModal()">&times;</button>
                </div>
                <div class="modal-body">
                    ${contentHtml}
                </div>
                ${footerHtml ? `<div class="modal-footer">${footerHtml}</div>` : ''}
            </div>
        `;

        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';

        // Close on escape key
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                Utils.closeModal();
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);
    },

    closeModal() {
        const overlay = document.getElementById('app-modal-overlay');
        if (overlay) {
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    },

    // Confirmation Dialog
    confirmDialog({ title = 'Confirm Action', message, confirmText = 'Confirm', onConfirm, isDanger = false }) {
        this.openModal({
            title,
            contentHtml: `
                <div style="display: flex; gap: 16px; align-items: flex-start;">
                    <div style="font-size: 2rem;">${isDanger ? '⚠️' : '❓'}</div>
                    <div>
                        <p style="font-size: 0.95rem; color: var(--primary-800);">${message}</p>
                    </div>
                </div>
            `,
            footerHtml: `
                <button class="btn btn-secondary" onclick="Utils.closeModal()">Cancel</button>
                <button class="btn ${isDanger ? 'btn-danger' : 'btn-primary'}" id="confirm-modal-ok-btn">${confirmText}</button>
            `,
            sizeClass: ''
        });

        document.getElementById('confirm-modal-ok-btn').addEventListener('click', () => {
            Utils.closeModal();
            if (typeof onConfirm === 'function') onConfirm();
        });
    },

    // Export to Real CSV File
    exportToCsv(filename, headers, rows) {
        let csvContent = '\uFEFF'; // UTF-8 BOM for Excel compatibility
        csvContent += headers.map(h => `"${h.replace(/"/g, '""')}"`).join(',') + '\r\n';

        rows.forEach(row => {
            const line = row.map(val => {
                const str = val === null || val === undefined ? '' : String(val);
                return `"${str.replace(/"/g, '""')}"`;
            }).join(',');
            csvContent += line + '\r\n';
        });

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${filename}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        this.showToast(`Exported ${filename}.csv successfully!`, 'success');
    },

    // Print an area with official university styling
    printElement(elementId, docTitle = 'Official Document') {
        const target = document.getElementById(elementId);
        if (!target) return;

        const printWindow = window.open('', '_blank', 'width=900,height=700');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>${docTitle}</title>
                <style>
                    body { font-family: 'Times New Roman', serif; padding: 40px; color: #000; line-height: 1.5; }
                    .letterhead { text-align: center; border-bottom: 2px solid #000; padding-bottom: 15px; margin-bottom: 25px; }
                    .letterhead h1 { font-size: 20pt; margin: 0; text-transform: uppercase; }
                    .letterhead p { margin: 3px 0; font-size: 11pt; }
                    table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 11pt; }
                    th, td { border: 1px solid #333; padding: 8px 12px; text-align: left; }
                    th { background: #f0f0f0; }
                    .footer-seal { margin-top: 50px; display: flex; justify-content: space-between; }
                    .signature-box { text-align: center; width: 200px; border-top: 1px solid #000; padding-top: 5px; }
                </style>
            </head>
            <body>
                <div class="letterhead">
                    <h1>CENTRAL APEX UNIVERSITY</h1>
                    <p>OFFICE OF DEAN (STUDENT WELFARE) & SCHOLARSHIP CELL</p>
                    <p>Accredited 'A++' by NAAC | University Campus, Academic Block IV</p>
                </div>
                ${target.innerHTML}
                <div class="footer-seal">
                    <div class="signature-box">Section Officer (Accounts)</div>
                    <div class="signature-box">Dean / Comptroller (Sanctioning Authority)</div>
                </div>
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 300);
    }
};
