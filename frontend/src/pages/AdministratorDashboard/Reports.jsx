import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation, useSearchParams, useNavigate } from "react-router-dom";
import axiosInstance from '../../api/axiosInstance'; // ✅ replaced fetch
import '../../css/ADMIN DASHBOARD/reports.css';

// Map (Leaflet)
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Stat Icons
import submittedGif from "../../assets/pictures/submitted.gif"
import inreviewGif from "../../assets/pictures/inreview.gif"
import inprogressGif from "../../assets/pictures/inprogress.gif"
import resolvedGif from "../../assets/pictures/resolved.gif"
import cancelGif from "../../assets/pictures/cancel.gif"
import rejectGif from "../../assets/pictures/reject.gif"
import totalreportGif from "../../assets/pictures/totalreport.gif"
import clockGif from "../../assets/pictures/user-report-detail/timestamp.png"

import sortUpIcon from "../../assets/pictures/administrator-reports/upArrow.png";
import sortDownIcon from "../../assets/pictures/administrator-reports/downArrow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow
});

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

    const statusConfig = {
        SUBMITTED: { icon: submittedGif, label: 'Submitted' },
        IN_REVIEW: { icon: inreviewGif, label: 'In Review' },
        IN_PROGRESS: { icon: inprogressGif, label: 'In Progress' },
        RESOLVED: { icon: resolvedGif, label: 'Resolved' },
        REJECTED: { icon: rejectGif, label: 'Rejected' },
        CANCELLED: { icon: cancelGif, label: 'Cancelled' }
    };

    const [summary, setSummary] = useState(null);
    const [reports, setReports] = useState([]);
    const [officers, setOfficers] = useState([]);
    const [selectedReport, setSelectedReport] = useState(null);

    const [page, setPage] = useState(0);
    const [size, setSize] = useState(50);
    const [sort, setSort] = useState('createdAt,desc');
    const [totalElements, setTotalElements] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const [loading, setLoading] = useState(false);
    const [summaryLoading, setSummaryLoading] = useState(false);

    const fetchOfficers = useCallback(async () => {
        try {
            // ✅ No localhost, no manual token
            const res = await axiosInstance.get('/api/admin/officers');
            setOfficers(res.data);
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
            const params = {};
            if (filters.status) params.status = filters.status;
            if (filters.category) params.category = filters.category;
            if (filters.officerId) params.officerId = filters.officerId;
            if (filters.from) params.from = filters.from;
            if (filters.to) params.to = filters.to;

            // ✅ No localhost, no manual token
            const res = await axiosInstance.get('/api/admin/reports/summary', { params });
            setSummary(res.data);
        } catch {
            console.error('Error fetching summary');
        } finally {
            setSummaryLoading(false);
        }
    }, [filters]);

    const fetchReports = useCallback(async () => {
        setLoading(true);
        try {
            const urlParams = new URLSearchParams(window.location.search);
            const statusFromUrl = urlParams.get('status');
            const statusToUse = statusFromUrl || filters.status;

            const params = {
                page,
                size,
                sort,
                ...(statusToUse && { status: statusToUse }),
                ...(filters.category && { category: filters.category }),
                ...(filters.officerId && { officerId: filters.officerId }),
                ...(filters.from && { from: filters.from }),
                ...(filters.to && { to: filters.to }),
                ...(filters.search && { search: filters.search }),
            };

            console.log('REPORTS FETCH — params:', params, 'statusFromUrl:', statusFromUrl);

            // ✅ No localhost, no manual token
            const res = await axiosInstance.get('/api/admin/reports', { params });
            const data = res.data;

            let items = [];
            let total = 0;
            let pages = 0;

            if (Array.isArray(data)) {
                items = data;
                total = data.length;
                pages = 1;
            } else if (data.content && Array.isArray(data.content)) {
                items = data.content;
                total = data.totalElements || 0;
                pages = data.totalPages || 0;
            } else {
                items = data?.data ?? data?.items ?? [];
                if (!Array.isArray(items)) items = [];
                total = items.length;
                pages = 1;
            }

            console.log('REPORTS FETCH — returned', items.length, 'items; total:', total);

            setReports(items);
            setTotalElements(total);
            setTotalPages(pages);
        } catch (err) {
            console.error('Error fetching reports:', err);
            setReports([]);
            setTotalElements(0);
            setTotalPages(0);
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
            const newFilters = {
                status: params.get('status') ?? '',
                category: params.get('category') ?? '',
                officerId: params.get('officerId') ?? '',
                from: params.get('from') ?? '',
                to: params.get('to') ?? '',
                search: params.get('search') ?? '',
            };

            setFilters(prev => {
                const same = ['status', 'category', 'officerId', 'from', 'to', 'search']
                    .every(k => (prev[k] ?? '') === (newFilters[k] ?? ''));
                return same ? prev : { ...prev, ...newFilters };
            });

            setPage(Number(params.get('page') ?? 0));
            setSize(Number(params.get('size') ?? 50));
            setSort(params.get('sort') ?? 'createdAt,desc');
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
        const urlStatus = searchParams.get('status');

        if (urlStatus) {
            const normalized = String(urlStatus).toUpperCase();
            setFilters(prev => prev.status === normalized ? prev : { ...prev, status: normalized });
            sessionStorage.removeItem('adminReportsFilter');
        } else {
            try {
                const stored = JSON.parse(sessionStorage.getItem('adminReportsFilter'));
                if (stored?.status) {
                    const normalized = String(stored.status).toUpperCase();
                    setFilters(prev => ({ ...prev, status: normalized }));
                    const params = new URLSearchParams(location.search);
                    params.set('status', normalized);
                    navigate(`/admin/reports?${params.toString()}`, { replace: true });
                    sessionStorage.removeItem('adminReportsFilter');
                }
            } catch (err) {
                console.warn('Failed to read adminReportsFilter from sessionStorage', err);
            }
        }
    }, [searchParams, navigate, location.search]);

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setPage(0);
        const params = new URLSearchParams(location.search);
        if (value) params.set(key, value);
        else params.delete(key);
        navigate(`/admin/reports?${params.toString()}`, { replace: true });
    };

    const handleSort = (field) => {
        const [currentField, currentDir] = sort.split(',');
        const newDir = currentField === field && currentDir === 'asc' ? 'desc' : 'asc';
        setSort(`${field},${newDir}`);
    };

    const handleRowClick = async (reportId) => {
        try {
            // ✅ No localhost, no manual token
            const res = await axiosInstance.get(`/api/admin/reports/${reportId}`);
            setSelectedReport(res.data);
        } catch {
            console.error('Error fetching report detail');
        }
    };

    const closeModal = () => setSelectedReport(null);

    const resetFilters = () => {
        setFilters({ status: '', category: '', officerId: '', from: '', to: '', search: '' });
        setPage(0);
    };

    const pagedReports = reports;
    const displayedTotalElements = totalElements;
    const displayedTotalPages = Math.max(1, totalPages);
    const hasStatusFilter = !!filters.status;

    const selectedCoords = useMemo(() => {
        const lat = Number(selectedReport?.latitude);
        const lng = Number(selectedReport?.longitude);
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
        return [lat, lng];
    }, [selectedReport?.latitude, selectedReport?.longitude]);

    const selectedAddressText = useMemo(() => {
        const a = selectedReport?.address;
        if (!a) return '';
        return [
            [a.streetName, a.houseNumber].filter(Boolean).join(' ').trim(),
            [a.postalCode, a.city].filter(Boolean).join(' ').trim(),
            a.province
        ].filter(Boolean).join(', ');
    }, [selectedReport?.address]);

    const googleMapsUrl = useMemo(() => {
        if (selectedAddressText)
            return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedAddressText)}`;
        if (selectedCoords)
            return `https://www.google.com/maps?q=${selectedCoords[0]},${selectedCoords[1]}`;
        return null;
    }, [selectedAddressText, selectedCoords]);

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
                        <select value={filters.status} onChange={(e) => handleFilterChange('status', e.target.value)}>
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
                        <select value={filters.category} onChange={(e) => handleFilterChange('category', e.target.value)}>
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
                        <select value={filters.officerId} onChange={(e) => handleFilterChange('officerId', e.target.value)}>
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
                        <input type="datetime-local" value={filters.from} onChange={(e) => handleFilterChange('from', e.target.value)} />
                    </div>
                    <div className="filter-group">
                        <label>To Date</label>
                        <input type="datetime-local" value={filters.to} onChange={(e) => handleFilterChange('to', e.target.value)} />
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
                    <button className="reset-btn" onClick={resetFilters}>Reset Filters</button>
                </div>
            </div>

            {summaryLoading ? (
                <div className="kpi-loading">Loading summary...</div>
            ) : summary && (
                <div className="kpi-cards">
                    {Object.keys(statusConfig).map(status => {
                        const count = hasStatusFilter
                            ? (status === filters.status ? (summary.byStatus?.[status] || 0) : 0)
                            : (summary.byStatus?.[status] || 0);
                        return (
                            <div key={status} className="kpi-card">
                                <div className="kpi-icon">
                                    <img src={statusConfig[status].icon} alt={`${statusConfig[status].label}-icon`} className="kpi-icon-img" />
                                </div>
                                <div className="kpi-content">
                                    <h3>{count}</h3>
                                    <p>{statusConfig[status].label}</p>
                                </div>
                            </div>
                        );
                    })}
                    <div className="kpi-card">
                        <div className="kpi-icon">
                            <img src={totalreportGif} alt="total-reports-icon" className="kpi-icon-img" />
                        </div>
                        <div className="kpi-content">
                            <h3>{summary.total}</h3>
                            <p>{hasStatusFilter ? 'Total Filtered Reports' : 'Total Reports'}</p>
                        </div>
                    </div>
                    {summary.avgResolutionDays !== undefined && (
                        <div className="kpi-card">
                            <div className="kpi-icon">
                                <img src={clockGif} alt="timer-icon" className="kpi-icon-img" />
                            </div>
                            <div className="kpi-content">
                                <h3>{summary.avgResolutionDays} days</h3>
                                <p>Avg Resolution Time</p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            <div className="reports-table-container">
                <div className="table-header">
                    <h2>Reports List ({displayedTotalElements} total)</h2>
                    <div className="table-controls">
                        <label>
                            Show
                            <select value={size} onChange={(e) => { setSize(Number(e.target.value)); setPage(0); }}>
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
                    <div className="table-wrapper">
                        <table className="reports-table">
                            <thead>
                            <tr>
                                {[
                                    { id: 'id', label: 'ID' },
                                    { id: 'title', label: 'Title' },
                                    { id: 'category', label: 'Category' },
                                    { id: 'status', label: 'Status' },
                                    { id: 'author', label: 'Author', noSort: true },
                                    { id: 'officer', label: 'Officer', noSort: true },
                                    { id: 'createdAt', label: 'Created' },
                                    { id: 'updatedAt', label: 'Updated' }
                                ].map((col) => (
                                    <th
                                        key={col.id}
                                        onClick={() => !col.noSort && handleSort(col.id)}
                                        style={{ cursor: col.noSort ? 'default' : 'pointer' }}
                                    >
                                        <div className="header-content">
                                            {col.label}
                                            {!col.noSort && sort.startsWith(col.id) && (
                                                <img
                                                    src={sort.includes('asc') ? sortUpIcon : sortDownIcon}
                                                    alt="sort-icon"
                                                    className="sort-icon-img"
                                                />
                                            )}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                            </thead>
                            <tbody>
                            {pagedReports.length === 0 ? (
                                <tr><td colSpan="8" className="empty-table-cell">No reports found</td></tr>
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
                                                <span className={`status-badge status-${(report.status || '').toLowerCase().replace(/_/g, '-')}`}>
                                                    {report.status?.replace(/_/g, ' ')}
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
                    </div>
                )}

                <div className="pagination">
                    <button disabled={page === 0} onClick={() => setPage(p => Math.max(0, p - 1))}>Previous</button>
                    <span>Page {page + 1} of {displayedTotalPages}</span>
                    <button disabled={page >= displayedTotalPages - 1} onClick={() => setPage(p => Math.min(displayedTotalPages - 1, p + 1))}>Next</button>
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
                                <p><strong>Category:</strong> <span className="category-badge">{categoryLabels[selectedReport.category] || selectedReport.category || 'Uncategorized'}</span></p>
                                <p><strong>Status:</strong> <span className={`status-badge status-${(selectedReport.status || '').toLowerCase().replace(/_/g, '-')}`}>{selectedReport.status?.replace(/_/g, ' ')}</span></p>
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
                                        <p><strong>Address:</strong> {selectedReport.address.streetName} {selectedReport.address.houseNumber}</p>
                                        <p><strong>City:</strong> {selectedReport.address.city}, {selectedReport.address.province}</p>
                                        <p><strong>Postal Code:</strong> {selectedReport.address.postalCode}</p>
                                    </>
                                )}
                                <p><strong>Coordinates:</strong> {selectedReport.latitude}, {selectedReport.longitude}</p>
                                {googleMapsUrl && (
                                    <p>
                                        <strong>Open:</strong>{' '}
                                        <a className="gmaps-link" href={googleMapsUrl} target="_blank" rel="noreferrer">View in Google Maps</a>
                                    </p>
                                )}
                                {selectedCoords ? (
                                    <div className="report-map">
                                        <MapContainer
                                            key={`${selectedCoords[0]}-${selectedCoords[1]}`}
                                            center={selectedCoords}
                                            zoom={15}
                                            scrollWheelZoom={false}
                                            whenReady={(evt) => evt?.target?.invalidateSize()}
                                        >
                                            <TileLayer
                                                attribution='&copy; OpenStreetMap contributors'
                                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                            />
                                            <Marker position={selectedCoords}>
                                                <Popup>
                                                    <div className="popup-content">
                                                        <div className="popup-title">Report location</div>
                                                        {selectedAddressText && (
                                                            <div className="popup-address">
                                                                <a className="gmaps-link" href={googleMapsUrl} target="_blank" rel="noreferrer">{selectedAddressText}</a>
                                                            </div>
                                                        )}
                                                        <div className="popup-coords">{selectedCoords[0]}, {selectedCoords[1]}</div>
                                                        {googleMapsUrl && (
                                                            <a className="gmaps-btn" href={googleMapsUrl} target="_blank" rel="noreferrer">Open in Google Maps</a>
                                                        )}
                                                    </div>
                                                </Popup>
                                            </Marker>
                                        </MapContainer>
                                    </div>
                                ) : (
                                    <p className="no-coords-message">No valid coordinates available for map.</p>
                                )}
                            </div>

                            <div className="detail-section">
                                <h3>Timestamps</h3>
                                <p><strong>Created:</strong> {selectedReport.createdAt ? new Date(selectedReport.createdAt).toLocaleString() : ''}</p>
                                <p><strong>Updated:</strong> {selectedReport.updatedAt ? new Date(selectedReport.updatedAt).toLocaleString() : ''}</p>
                            </div>

                            {selectedReport.imageUrls?.length > 0 && (
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
                                    <video className="report-video" controls src={selectedReport.videoUrl} />
                                </div>
                            )}

                            {selectedReport.statusHistory?.length > 0 && (
                                <div className="detail-section">
                                    <h3>Status History</h3>
                                    <div className="status-history">
                                        {selectedReport.statusHistory.map((entry, idx) => (
                                            <div key={idx} className="history-entry">
                                                <div className="history-header">
                                                    <span className={`status-badge status-${(entry.status || '').toLowerCase().replace(/_/g, '-')}`}>
                                                        {entry.status?.replace(/_/g, ' ')}
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