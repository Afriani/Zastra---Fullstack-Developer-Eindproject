import React, { useCallback, useEffect, useState } from "react";
import "../../css/ADMIN DASHBOARD/announcement.css";

const visOptions = [
    { value: "", label: "All audiences" },
    { value: "OFFICERS", label: "Officers only" },
    { value: "ALL", label: "Officers + Users" },
];

const statusOptions = [
    { value: "", label: "All status" },
    { value: "true", label: "Active" },
    { value: "false", label: "Inactive" },
];

const emptyForm = {
    title: "",
    body: "",
    visibility: "ALL",
    active: true,
    pinned: false,
    startAt: "",
    endAt: "",
};

export default function AdminAnnouncements() {
    const [filters, setFilters] = useState({
        active: "",
        visibility: "",
        search: "",
        from: "",
        to: "",
    });
    const [items, setItems] = useState([]);
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [loading, setLoading] = useState(false);

    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);
    const [actionInProgress, setActionInProgress] = useState(false);

    const token = localStorage.getItem("token");

    const fetchList = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.append("page", page);
            params.append("size", size);
            if (filters.active !== "") params.append("active", filters.active);
            if (filters.visibility) params.append("visibility", filters.visibility);
            if (filters.search) params.append("search", filters.search);
            if (filters.from) params.append("from", filters.from);
            if (filters.to) params.append("to", filters.to);

            const res = await fetch(
                `http://localhost:8080/api/admin/announcements?${params.toString()}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            if (!res.ok) throw new Error("Failed to fetch");

            const data = await res.json();

            const normalized = (data.content || []).map((i) => ({
                ...i,
                active: typeof i.isActive !== "undefined" ? i.isActive : i.active,
                pinned: typeof i.isPinned !== "undefined" ? i.isPinned : i.pinned,
                body: typeof i.content !== "undefined" ? i.content : i.body,
                startAt: i.startAt || "",
                endAt: i.endAt || "",
            }));

            setItems(normalized);
            setTotalPages(data.totalPages);
            setTotalElements(data.totalElements);
        } catch (e) {
            console.error(e);
            alert("Failed to load announcements. See console for details.");
        } finally {
            setLoading(false);
        }
    }, [filters, page, size, token]);

    useEffect(() => {
        fetchList();
    }, [fetchList]);

    const openCreate = () => {
        setEditing(null);
        setForm(emptyForm);
        setShowModal(true);
    };

    const openEdit = (ann) => {
        setEditing(ann.id);
        setForm({
            title: ann.title || "",
            body: ann.body || ann.content || "",
            visibility: ann.visibility || "ALL",
            active:
                typeof ann.active !== "undefined"
                    ? ann.active
                    : ann.isActive ?? true,
            pinned:
                typeof ann.pinned !== "undefined"
                    ? ann.pinned
                    : ann.isPinned ?? false,
            startAt: ann.startAt ? ann.startAt.slice(0, 16) : "",
            endAt: ann.endAt ? ann.endAt.slice(0, 16) : "",
        });
        setShowModal(true);
    };

    const closeModal = () => {
        if (saving) return;
        setShowModal(false);
        setEditing(null);
        setForm(emptyForm);
    };

    const save = async () => {
        setSaving(true);
        try {
            const payload = {
                title: form.title,
                content: form.body,
                visibility: form.visibility,
                isActive: form.active,
                isUrgent: false,
                isPinned: !!form.pinned,
                startAt: form.startAt ? new Date(form.startAt).toISOString() : null,
                endAt: form.endAt ? new Date(form.endAt).toISOString() : null,
            };
            const url = editing
                ? `http://localhost:8080/api/admin/announcements/${editing}`
                : `http://localhost:8080/api/admin/announcements`;
            const method = editing ? "PUT" : "POST";
            const res = await fetch(url, {
                method,
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });
            if (!res.ok) {
                const txt = await res.text().catch(() => "");
                throw new Error("Save failed: " + txt);
            }
            await fetchList();
            closeModal();
        } catch (e) {
            console.error(e);
            alert("Save failed. See console for details.");
        } finally {
            setSaving(false);
        }
    };

    const toggleActive = async (ann) => {
        if (actionInProgress) return;
        setActionInProgress(true);

        const currentActive =
            typeof ann.active !== "undefined" ? ann.active : ann.isActive ?? false;
        const newActive = !currentActive;

        const previousItems = items;
        setItems((prev) =>
            prev.map((i) => (i.id === ann.id ? { ...i, active: newActive } : i))
        );

        try {
            const payload = {
                title: ann.title || "",
                content: ann.body || ann.content || "",
                visibility: ann.visibility || "ALL",
                isActive: newActive,
                isUrgent: ann.isUrgent ?? false,
                isPinned: ann.pinned ?? ann.isPinned ?? false,
                startAt: ann.startAt
                    ? new Date(ann.startAt).toISOString()
                    : null,
                endAt: ann.endAt ? new Date(ann.endAt).toISOString() : null,
            };

            const res = await fetch(
                `http://localhost:8080/api/admin/announcements/${ann.id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(payload),
                }
            );

            if (!res.ok) {
                const txt = await res.text().catch(() => "");
                throw new Error("Toggle failed: " + txt);
            }

            await fetchList();
        } catch (e) {
            console.error(e);
            alert("Toggle failed. See console for details.");
            setItems(previousItems);
        } finally {
            setActionInProgress(false);
        }
    };

    const remove = async (ann) => {
        if (!window.confirm("Delete this announcement?")) return;
        if (actionInProgress) return;
        setActionInProgress(true);

        const previousItems = items;
        setItems((prev) => prev.filter((i) => i.id !== ann.id));

        try {
            const res = await fetch(
                `http://localhost:8080/api/admin/announcements/${ann.id}`,
                {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            if (!res.ok) {
                const txt = await res.text().catch(() => "");
                throw new Error("Delete failed: " + txt);
            }

            await fetchList();
        } catch (e) {
            console.error(e);
            alert("Delete failed. See console for details.");
            setItems(previousItems);
        } finally {
            setActionInProgress(false);
        }
    };

    const setFilter = (k, v) => {
        setFilters((prev) => ({ ...prev, [k]: v }));
        setPage(0);
    };

    return (
        <div className="admin-announcements">
            <div className="header">
                <h1>Announcements</h1>
                <button
                    className="primary"
                    onClick={openCreate}
                    disabled={loading}
                >
                    New Announcement
                </button>
            </div>

            <div className="filters">
                <input
                    type="text"
                    placeholder="Search title/body..."
                    value={filters.search}
                    onChange={(e) => setFilter("search", e.target.value)}
                />
                <select
                    value={filters.visibility}
                    onChange={(e) => setFilter("visibility", e.target.value)}
                >
                    {visOptions.map((o) => (
                        <option key={o.value} value={o.value}>
                            {o.label}
                        </option>
                    ))}
                </select>
                <select
                    value={filters.active}
                    onChange={(e) => setFilter("active", e.target.value)}
                >
                    {statusOptions.map((o) => (
                        <option key={o.value} value={o.value}>
                            {o.label}
                        </option>
                    ))}
                </select>
                <div className="date-range">
                    <label>From</label>
                    <input
                        type="datetime-local"
                        value={filters.from}
                        onChange={(e) => setFilter("from", e.target.value)}
                    />
                    <label>To</label>
                    <input
                        type="datetime-local"
                        value={filters.to}
                        onChange={(e) => setFilter("to", e.target.value)}
                    />
                </div>
            </div>

            <div className="list">
                <div className="list-header">
                    <div>Total: {totalElements}</div>
                    <div>
                        Show
                        <select
                            value={size}
                            onChange={(e) => {
                                setSize(Number(e.target.value));
                                setPage(0);
                            }}
                        >
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                        </select>
                        per page
                    </div>
                </div>

                {loading ? (
                    <div className="loading">Loading...</div>
                ) : (
                    <table className="table">
                        <thead>
                        <tr>
                            <th>Title</th>
                            <th>Visibility</th>
                            <th>Active</th>
                            <th>Start</th>
                            <th>End</th>
                            <th>Updated</th>
                            <th>By</th>
                            <th className="actions-col">Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {items.length === 0 ? (
                            <tr>
                                <td colSpan="8" className="empty-row">
                                    No announcements
                                </td>
                            </tr>
                        ) : (
                            items.map((a) => (
                                <tr key={a.id}>
                                    <td>{a.title}</td>
                                    <td>
                                        {a.visibility === "OFFICERS"
                                            ? "Officers"
                                            : "Officers + Users"}
                                    </td>
                                    <td>
                                            <span
                                                className={`badge ${
                                                    a.active ? "green" : "gray"
                                                }`}
                                            >
                                                {a.active ? "Active" : "Inactive"}
                                            </span>
                                    </td>
                                    <td>
                                        {a.startAt
                                            ? new Date(
                                                a.startAt
                                            ).toLocaleString()
                                            : "-"}
                                    </td>
                                    <td>
                                        {a.endAt
                                            ? new Date(
                                                a.endAt
                                            ).toLocaleString()
                                            : "-"}
                                    </td>
                                    <td>
                                        {a.updatedAt
                                            ? new Date(
                                                a.updatedAt
                                            ).toLocaleString()
                                            : "-"}
                                    </td>
                                    <td>{a.createdByName || "-"}</td>
                                    <td className="actions">
                                        <button
                                            onClick={() => openEdit(a)}
                                            disabled={actionInProgress}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => toggleActive(a)}
                                            disabled={actionInProgress}
                                        >
                                            {a.active
                                                ? "Deactivate"
                                                : "Activate"}
                                        </button>
                                        <button
                                            className="danger"
                                            onClick={() => remove(a)}
                                            disabled={actionInProgress}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                )}

                <div className="pagination">
                    <button
                        disabled={page === 0 || loading}
                        onClick={() => setPage((p) => p - 1)}
                    >
                        Prev
                    </button>
                    <span>
                        Page {page + 1} of {totalPages}
                    </span>
                    <button
                        disabled={page >= totalPages - 1 || loading}
                        onClick={() => setPage((p) => p + 1)}
                    >
                        Next
                    </button>
                </div>
            </div>

            {showModal && (
                <div
                    className="modal-overlay"
                    onClick={() => !saving && closeModal()}
                >
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>
                                {editing ? "Edit Announcement" : "New Announcement"}
                            </h2>
                            <button onClick={closeModal} disabled={saving}>
                                ×
                            </button>
                        </div>
                        <div className="modal-body">
                            <label>Title</label>
                            <input
                                value={form.title}
                                onChange={(e) =>
                                    setForm((f) => ({
                                        ...f,
                                        title: e.target.value,
                                    }))
                                }
                            />

                            <label>Body</label>
                            <textarea
                                rows={6}
                                value={form.body}
                                onChange={(e) =>
                                    setForm((f) => ({
                                        ...f,
                                        body: e.target.value,
                                    }))
                                }
                            />

                            <label>Visibility</label>
                            <select
                                value={form.visibility}
                                onChange={(e) =>
                                    setForm((f) => ({
                                        ...f,
                                        visibility: e.target.value,
                                    }))
                                }
                            >
                                <option value="ALL">Officers + Users</option>
                                <option value="OFFICERS">Officers only</option>
                            </select>

                            <div className="row">
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={form.active}
                                        onChange={(e) =>
                                            setForm((f) => ({
                                                ...f,
                                                active: e.target.checked,
                                            }))
                                        }
                                    />{" "}
                                    Active
                                </label>
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={form.pinned}
                                        onChange={(e) =>
                                            setForm((f) => ({
                                                ...f,
                                                pinned: e.target.checked,
                                            }))
                                        }
                                    />{" "}
                                    Pinned (optional)
                                </label>
                            </div>

                            <div className="row">
                                <div>
                                    <label>Start</label>
                                    <input
                                        type="datetime-local"
                                        value={form.startAt}
                                        onChange={(e) =>
                                            setForm((f) => ({
                                                ...f,
                                                startAt: e.target.value,
                                            }))
                                        }
                                    />
                                </div>
                                <div>
                                    <label>End</label>
                                    <input
                                        type="datetime-local"
                                        value={form.endAt}
                                        onChange={(e) =>
                                            setForm((f) => ({
                                                ...f,
                                                endAt: e.target.value,
                                            }))
                                        }
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button
                                onClick={save}
                                disabled={saving || !form.title || !form.body}
                            >
                                {saving ? "Saving..." : "Save"}
                            </button>
                            <button
                                className="secondary"
                                onClick={closeModal}
                                disabled={saving}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}