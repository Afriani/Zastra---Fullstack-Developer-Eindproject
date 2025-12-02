import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation, useSearchParams, useNavigate } from "react-router-dom";
import '../../css/ADMIN DASHBOARD/reports.css';

const Reports = () => {
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const [filters, setFilters] = useState({
        status: '',
        category: '',
        officerId: '',
        from: '',
        to: '',
        search: ''
    });

    const categoryLabels = {
        ROAD_DAMAGE: 'Road Damage',
        LITTER: 'Litter',
        BROKEN_STREETLIGHT: 'Broken Streetlight',
        GRAFFITI: 'Graffiti',
        DAMAGED_SIGN: 'Damaged Sign',
        FALLEN_TREE: 'Fallen Tree',
        POTHOLE: 'Pothole',
        BROKEN_BENCH: 'Broken Bench',
        DAMAGED_PLAYGROUND: 'Damaged Playground',
        ILLEGAL_DUMPING: 'Illegal Dumping',
        OTHER: 'Other'
    };

    const [summary, setSummary] = useState(null);
    const [reports, setReports] = useState([]);
    const [officers, setOfficers] = useState([]);
    const [selectedReport, setSelectedReport] = useState(null);

    const [page, setPage] = useState(0);
    const [size, setSize] = useState(50);
    const [sort, setSort] = useState('createdAt,desc');

    const [loading, setLoading] = useState(false);
    const [summaryLoading, setSummaryLoading] = useState(false);

    const fetchOfficers = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:8080/api/admin/officers', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setOfficers(data);
            }
        } catch {
            console.error('Error fetching officers');
        }
    }, []);

    useEffect(() => {
        fetchOfficers();
    }, [fetchOfficers]);

    const fetchSummary = useCallback(async () => {
        setSummaryLoading(true);
        try {
            const token = localStorage.getItem('token');
            const params = new URLSearchParams();
            if (filters.status) params.append('status', filters.status);
            if (filters.category) params.append('category', filters.category);
            if (filters.officerId) params.append('officerId', filters.officerId);
            if (filters.from) params.append('from', filters.from);
            if (filters.to) params.append('to', filters.to);

            const url = `http://localhost:8080/api/admin/reports/summary?${params.toString()}`;
            const response = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
            if (response.ok) {
                const data = await response.json();
                setSummary(data);
            }
        } catch {
            console.error('Error fetching summary');
        } finally {
            setSummaryLoading(false);
        }
    }, [filters]);

    const fetchReports = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const params = new URLSearchParams();
            params.append('page', page);
            params.append('size', size);
            params.append('sort', sort);
            if (filters.status) params.append('status', filters.status);
            if (filters.category) params.append('category', filters.category);
            if (filters.officerId) params.append('officerId', filters.officerId);
            if (filters.from) params.append('from', filters.from);
            if (filters.to) params.append('to', filters.to);
            if (filters.search) params.append('search', filters.search);

            const url = `http://localhost:8080/api/admin/reports?${params.toString()}`;

            // Debug log: what we request
            console.log('REPORTS FETCH — requesting', url, 'filters:', filters, 'page:', page, 'size:', size, 'sort:', sort);

            const response = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
            if (response.ok) {
                const data = await response.json();

                // Normalize possible shapes
                let items = [];
                if (Array.isArray(data)) {
                    items = data;
                } else if (Array.isArray(data.content)) {
                    items = data.content;
                } else {
                    items = data?.data ?? data?.items ?? [];
                    if (!Array.isArray(items)) items = [];
                }

                // Debug log: first few statuses returned
                console.log('REPORTS FETCH — backend returned', items.length, 'items; first statuses =',
                    items.slice(0, 10).map(i => (i.status ?? '').toUpperCase()));

                setReports(items);
            } else {
                console.error('Reports fetch failed:', response.status);
                setReports([]);
            }
        } catch {
            console.error('Error fetching reports');
            setReports([]);
        } finally {
            setLoading(false);
        }
    }, [filters, page, size, sort]);

    useEffect(() => {
        fetchSummary();
    }, [fetchSummary]);

    useEffect(() => {
        fetchReports();
    }, [fetchReports]);

    useEffect(() => {
        const syncFromLocation = () => {
            const params = new URLSearchParams(location.search);
            const statusFromUrl = params.get('status') ?? '';
            const categoryFromUrl = params.get('category') ?? '';
            const officerIdFromUrl = params.get('officerId') ?? '';
            const fromFromUrl = params.get('from') ?? '';
            const toFromUrl = params.get('to') ?? '';
            const searchFromUrl = params.get('search') ?? '';
            const pageParam = params.get('page');
            const sizeParam = params.get('size');
            const sortParam = params.get('sort');

            setFilters(prev => {
                const newFilters = {
                    status: statusFromUrl,
                    category: categoryFromUrl,
                    officerId: officerIdFromUrl,
                    from: fromFromUrl,
                    to: toFromUrl,
                    search: searchFromUrl
                };
                const same = ['status','category','officerId','from','to','search']
                    .every(k => (prev[k] ?? '') === (newFilters[k] ?? ''));
                if (same) return prev;
                return { ...prev, ...newFilters };
            });

            setPage(Number(pageParam ?? 0));
            setSize(Number(sizeParam ?? 10));
            setSort(sortParam ?? 'createdAt,desc');
        };

        syncFromLocation();

        const handler = (evt) => {
            const newStatus = evt?.detail?.status;
            if (newStatus) {
                setFilters(prev => ({ ...prev, status: newStatus }));
                setPage(0);
            }
        };

        window.addEventListener('navigate-admin-reports', handler);
        return () => window.removeEventListener('navigate-admin-reports', handler);
    }, [location.search]);

    useEffect(() => {
        const getInitialStatus = () => {
            const urlStatus = searchParams.get('status');
            if (urlStatus) return urlStatus;
            try {
                const stored = JSON.parse(sessionStorage.getItem('adminReportsFilter'));
                if (stored?.status) return stored.status;
            } catch {
                // ignore
            }
            return null;
        };

        const initStatus = getInitialStatus();
        if (initStatus) {
            const normalized = String(initStatus).toUpperCase();
            setFilters(prev => ({ ...prev, status: normalized }));

            const params = new URLSearchParams();
            params.set('status', normalized);
            navigate(`/admin/reports?${params.toString()}`, { replace: true });

            sessionStorage.removeItem('adminReportsFilter');
        }
    }, [searchParams, navigate]);

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setPage(0);
    };

    const handleSort = (field) => {
        const [currentField, currentDir] = sort.split(',');
        const newDir = currentField === field && currentDir === 'asc' ? 'desc' : 'asc';
        setSort(`${field},${newDir}`);
    };

    const handleRowClick = async (reportId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(
                `http://localhost:8080/api/admin/reports/${reportId}`,
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            if (response.ok) {
                const data = await response.json();
                setSelectedReport(data);
            }
        } catch {
            console.error('Error fetching report detail');
        }
    };

    const closeModal = () => setSelectedReport(null);

    const resetFilters = () => {
        setFilters({
            status: '',
            category: '',
            officerId: '',
            from: '',
            to: '',
            search: ''
        });
        setPage(0);
    };

    // effectiveReports: prefer server result; if server didn't filter by status when a status is set,
    // apply a local fallback filter and log it so we can see what's happening.
    const effectiveReports = useMemo(() => {
        if (!filters.status) return reports;
        const wanted = String(filters.status).toUpperCase();
        const serverAllMatch = reports.length > 0 && reports.every(r => (r.status ?? '').toUpperCase() === wanted);
        if (serverAllMatch) return reports;

        // If server returned mixed statuses while client requested a status, apply fallback
        const filtered = reports.filter(r => (r.status ?? '').toUpperCase() === wanted);
        if (filtered.length !== reports.length) {
            console.warn('REPORTS FETCH — applying client-side fallback filter for status=', wanted, '; serverReturned=', reports.length, '; filtered=', filtered.length);
        }
        return filtered;
    }, [reports, filters.status]);

    // pagination derived from effectiveReports
    const displayedTotalElements = effectiveReports.length;
    const displayedTotalPages = Math.max(1, Math.ceil(displayedTotalElements / size));

    const pagedReports = useMemo(() => {
        const start = page * size;
        return effectiveReports.slice(start, start + size);
    }, [effectiveReports, page, size]);

    // Ensure page reset when filters change
    useEffect(() => {
        setPage(0);
    }, [filters.status, filters.category, filters.officerId, filters.from, filters.to, filters.search, size]);

    return (
        <div className="admin-reports">
            <div className="reports-header">
                <h1>Reports Management</h1>
                <p>View, filter, and analyze all submitted reports</p>
            </div>

            <div className="filters-section">
                <div className="filter-row">
                    <div className="filter-group">
                        <label>Status</label>
                        <select
                            value={filters.status}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                        >
                            <option value="">All Status</option>
                            <option value="SUBMITTED">Submitted</option>
                            <option value="IN_REVIEW">In Review</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="RESOLVED">Resolved</option>
                            <option value="REJECTED">Rejected</option>
                            <option value="CANCELLED">Cancelled</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <label>Category</label>
                        <select
                            value={filters.category}
                            onChange={(e) => handleFilterChange('category', e.target.value)}
                        >
                            <option value="">All Categories</option>
                            <option value="ROAD_DAMAGE">Road Damage</option>
                            <option value="LITTER">Litter</option>
                            <option value="BROKEN_STREETLIGHT">Broken Streetlight</option>
                            <option value="GRAFFITI">Graffiti</option>
                            <option value="DAMAGED_SIGN">Damaged Sign</option>
                            <option value="FALLEN_TREE">Fallen Tree</option>
                            <option value="POTHOLE">Pothole</option>
                            <option value="BROKEN_BENCH">Broken Bench</option>
                            <option value="DAMAGED_PLAYGROUND">Damaged Playground</option>
                            <option value="ILLEGAL_DUMPING">Illegal Dumping</option>
                            <option value="OTHER">Other</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <label>Officer</label>
                        <select
                            value={filters.officerId}
                            onChange={(e) => handleFilterChange('officerId', e.target.value)}
                        >
                            <option value="">All Officers</option>
                            {officers.map(officer => (
                                <option key={officer.id} value={officer.id}>
                                    {officer.firstName} {officer.lastName}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="filter-group">
                        <label>From Date</label>
                        <input
                            type="datetime-local"
                            value={filters.from}
                            onChange={(e) => handleFilterChange('from', e.target.value)}
                        />
                    </div>

                    <div className="filter-group">
                        <label>To Date</label>
                        <input
                            type="datetime-local"
                            value={filters.to}
                            onChange={(e) => handleFilterChange('to', e.target.value)}
                        />
                    </div>

                    <div className="filter-group">
                        <label>Search</label>
                        <input
                            type="text"
                            placeholder="Search title or description..."
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                        />
                    </div>

                    <button className="reset-btn" onClick={resetFilters}>
                        Reset Filters
                    </button>
                </div>
            </div>

            {summaryLoading ? (
                <div className="kpi-loading">Loading summary...</div>
            ) : summary && (
                <div className="kpi-cards">
                    {summary.byStatus && (
                        <>
                            <div className="kpi-card">
                                <div className="kpi-icon">📝</div>
                                <div className="kpi-content">
                                    <h3>{summary.byStatus.SUBMITTED || 0}</h3>
                                    <p>Submitted</p>
                                </div>
                            </div>
                            <div className="kpi-card">
                                <div className="kpi-icon">🔄</div>
                                <div className="kpi-content">
                                    <h3>{summary.byStatus.IN_REVIEW || 0}</h3>
                                    <p>In Review</p>
                                </div>
                            </div>
                            <div className="kpi-card">
                                <div className="kpi-icon">🔄</div>
                                <div className="kpi-content">
                                    <h3>{summary.byStatus.IN_PROGRESS || 0}</h3>
                                    <p>In Progress</p>
                                </div>
                            </div>
                            <div className="kpi-card">
                                <div className="kpi-icon">🔄</div>
                                <div className="kpi-content">
                                    <h3>{summary.byStatus.RESOLVED || 0}</h3>
                                    <p>Resolved</p>
                                </div>
                            </div>
                            <div className="kpi-card">
                                <div className="kpi-icon">🔄</div>
                                <div className="kpi-content">
                                    <h3>{summary.byStatus.REJECTED || 0}</h3>
                                    <p>Rejected</p>
                                </div>
                            </div>
                            <div className="kpi-card">
                                <div className="kpi-icon">🔄</div>
                                <div className="kpi-content">
                                    <h3>{summary.byStatus.CANCELLED || 0}</h3>
                                    <p>Canceled</p>
                                </div>
                            </div>
                        </>
                    )}
                    <div className="kpi-card">
                        <div className="kpi-icon">📊</div>
                        <div className="kpi-content">
                            <h3>{summary.total}</h3>
                            <p>Total Reports</p>
                        </div>
                    </div>
                    <div className="kpi-card">
                        <div className="kpi-icon">⏱️</div>
                        <div className="kpi-content">
                            <h3>{summary.avgResolutionDays} days</h3>
                            <p>Avg Resolution Time</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="reports-table-container">
                <div className="table-header">
                    <h2>Reports List ({displayedTotalElements} total)</h2>
                    <div className="table-controls">
                        <label>
                            Show
                            <select value={size} onChange={(e) => {
                                setSize(Number(e.target.value));
                                setPage(0);
                            }}>
                                <option value={10}>10</option>
                                <option value={25}>25</option>
                                <option value={50}>50</option>
                                <option value={100}>100</option>
                            </select>
                            entries
                        </label>
                    </div>
                </div>

                {loading ? (
                    <div className="table-loading">Loading reports...</div>
                ) : (
                    <table className="reports-table">
                        <thead>
                        <tr>
                            <th onClick={() => handleSort('id')}>ID {sort.startsWith('id') && (sort.includes('asc') ? '↑' : '↓')}</th>
                            <th onClick={() => handleSort('title')}>Title {sort.startsWith('title') && (sort.includes('asc') ? '↑' : '↓')}</th>
                            <th onClick={() => handleSort('category')}>Category {sort.startsWith('category') && (sort.includes('asc') ? '↑' : '↓')}</th>
                            <th onClick={() => handleSort('status')}>Status {sort.startsWith('status') && (sort.includes('asc') ? '↑' : '↓')}</th>
                            <th>Author</th>
                            <th>Officer</th>
                            <th onClick={() => handleSort('createdAt')}>Created {sort.startsWith('createdAt') && (sort.includes('asc') ? '↑' : '↓')}</th>
                            <th onClick={() => handleSort('updatedAt')}>Updated {sort.startsWith('updatedAt') && (sort.includes('asc') ? '↑' : '↓')}</th>
                        </tr>
                        </thead>
                        <tbody>
                        {pagedReports.length === 0 ? (
                            <tr>
                                <td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}>
                                    No reports found
                                </td>
                            </tr>
                        ) : (
                            pagedReports.map(report => (
                                <tr key={report.id} onClick={() => handleRowClick(report.id)} className="clickable-row">
                                    <td>{report.id}</td>
                                    <td>{report.title}</td>
                                    <td>
                                        <span className="category-badge">
                                            {categoryLabels[report.category] || report.category || 'Uncategorized'}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`status-badge status-${(report.status || '').toLowerCase()}`}>
                                            {report.status}
                                        </span>
                                    </td>
                                    <td>{report.authorName}</td>
                                    <td>{report.officerName || 'Not assigned'}</td>
                                    <td>{report.createdAt ? new Date(report.createdAt).toLocaleString() : ''}</td>
                                    <td>{report.updatedAt ? new Date(report.updatedAt).toLocaleString() : ''}</td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                )}

                <div className="pagination">
                    <button
                        disabled={page === 0}
                        onClick={() => setPage(p => Math.max(0, p - 1))}
                    >
                        Previous
                    </button>
                    <span>Page {page + 1} of {displayedTotalPages}</span>
                    <button
                        disabled={page >= displayedTotalPages - 1}
                        onClick={() => setPage(p => Math.min(displayedTotalPages - 1, p + 1))}
                    >
                        Next
                    </button>
                </div>
            </div>

            {selectedReport && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={(evt) => evt.stopPropagation()}>
                        <button className="modal-close" onClick={closeModal}>×</button>
                        <h2>Report Details</h2>

                        <div className="modal-body">
                            <div className="detail-section">
                                <h3>Basic Information</h3>
                                <p><strong>ID:</strong> {selectedReport.id}</p>
                                <p><strong>Title:</strong> {selectedReport.title}</p>
                                <p><strong>Description:</strong> {selectedReport.description}</p>
                                <p><strong>Category:</strong> <span className="category-badge">
                                    {categoryLabels[selectedReport.category] || selectedReport.category || 'Uncategorized'}
                                </span></p>
                                <p><strong>Status:</strong> <span
                                    className={`status-badge status-${(selectedReport.status || '').toLowerCase()}`}>{selectedReport.status}</span>
                                </p>
                            </div>

                            <div className="detail-section">
                                <h3>People</h3>
                                <p><strong>Author:</strong> {selectedReport.authorName}</p>
                                <p><strong>Assigned Officer:</strong> {selectedReport.officerName || 'Not assigned'}</p>
                            </div>

                            <div className="detail-section">
                                <h3>Location</h3>
                                {selectedReport.address && (
                                    <>
                                        <p>
                                            <strong>Address:</strong> {selectedReport.address.streetName} {selectedReport.address.houseNumber}
                                        </p>
                                        <p>
                                            <strong>City:</strong> {selectedReport.address.city}, {selectedReport.address.province}
                                        </p>
                                        <p><strong>Postal Code:</strong> {selectedReport.address.postalCode}</p>
                                    </>
                                )}
                                <p><strong>Coordinates:</strong> {selectedReport.latitude}, {selectedReport.longitude}
                                </p>
                            </div>

                            <div className="detail-section">
                                <h3>Timestamps</h3>
                                <p><strong>Created:</strong> {selectedReport.createdAt ? new Date(selectedReport.createdAt).toLocaleString() : ''}</p>
                                <p><strong>Updated:</strong> {selectedReport.updatedAt ? new Date(selectedReport.updatedAt).toLocaleString() : ''}</p>
                            </div>

                            {selectedReport.imageUrls && selectedReport.imageUrls.length > 0 && (
                                <div className="detail-section">
                                    <h3>Images</h3>
                                    <div className="report-images">
                                        {selectedReport.imageUrls.map((url, idx) => (
                                            <img key={idx} src={url} alt={`Report ${idx + 1}`} />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {selectedReport.videoUrl && (
                                <div className="detail-section">
                                    <h3>Video</h3>
                                    <video controls src={selectedReport.videoUrl} style={{ maxWidth: '100%' }} />
                                </div>
                            )}

                            {selectedReport.statusHistory && selectedReport.statusHistory.length > 0 && (
                                <div className="detail-section">
                                    <h3>Status History</h3>
                                    <div className="status-history">
                                        {selectedReport.statusHistory.map((entry, idx) => (
                                            <div key={idx} className="history-entry">
                                                <div className="history-header">
                                                    <span className={`status-badge status-${(entry.status || '').toLowerCase().replace(' ', '-')}`}>
                                                        {entry.status}
                                                    </span>
                                                    <span className="history-time">{entry.timestamp ? new Date(entry.timestamp).toLocaleString() : ''}</span>
                                                </div>
                                                <p><strong>Updated by:</strong> {entry.updatedBy}</p>
                                                {entry.notes && <p><strong>Notes:</strong> {entry.notes}</p>}
                                                {entry.resolvedPhotoUrl && (
                                                    <img src={entry.resolvedPhotoUrl} alt="Resolution" className="resolved-photo" />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Reports;