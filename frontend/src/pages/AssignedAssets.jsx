import { useEffect, useMemo, useState } from "react";
import { getAssignedAssets } from "../api/api";
import "./AssignedAssets.css";

export default function AssignedAssets() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [employeeNameQuery, setEmployeeNameQuery] = useState("");
  const [employeeIdQuery, setEmployeeIdQuery] = useState("");
  const [serialNumberQuery, setSerialNumberQuery] = useState("");
  const [assetTypeFilter, setAssetTypeFilter] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await getAssignedAssets();
        setData(Array.isArray(res) ? res : []);
      } catch (err) {
        setError(err?.message || "Failed to load assigned assets");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const assetTypes = useMemo(() => {
    const types = new Set();
    for (const row of data) {
      if (row?.asset_type) types.add(row.asset_type);
    }
    return Array.from(types).sort((a, b) => String(a).localeCompare(String(b)));
  }, [data]);

  const filteredData = useMemo(() => {
    const employeeName = employeeNameQuery.trim().toLowerCase();
    const employeeId = employeeIdQuery.trim().toLowerCase();
    const serialNumber = serialNumberQuery.trim().toLowerCase();

    return data.filter((row) => {
      const matchesEmployeeName = employeeName
        ? String(row?.employee_name ?? "").toLowerCase().includes(employeeName)
        : true;
      const matchesEmployeeId = employeeId
        ? String(row?.employee_id ?? "").toLowerCase().includes(employeeId)
        : true;
      const matchesSerialNumber = serialNumber
        ? String(row?.serial_number ?? "").toLowerCase().includes(serialNumber)
        : true;
      const matchesAssetType = assetTypeFilter
        ? row?.asset_type === assetTypeFilter
        : true;

      return (
        matchesEmployeeName &&
        matchesEmployeeId &&
        matchesSerialNumber &&
        matchesAssetType
      );
    });
  }, [assetTypeFilter, data, employeeIdQuery, employeeNameQuery, serialNumberQuery]);

  return (
    <div className="page assigned-assets-page">
      <h2 className="page-title">Assigned Assets</h2>

      {loading && <div className="card">Loading...</div>}

      {!loading && error && <div className="card">{error}</div>}

      {!loading && !error && data.length === 0 && (
        <div className="card">No assigned assets found.</div>
      )}

      {!loading && !error && data.length > 0 && (
        <>
          <div className="card">
            <div className="table-toolbar">
              <div className="table-toolbar-copy">
                <h3 className="card-title">Search & Filter</h3>
                <p className="table-meta">
                  Showing {filteredData.length} of {data.length} assigned assets
                </p>
              </div>

              <div className="table-filters">
                <input
                  type="text"
                  placeholder="Search by employee name"
                  value={employeeNameQuery}
                  onChange={(e) => setEmployeeNameQuery(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Search by employee ID"
                  value={employeeIdQuery}
                  onChange={(e) => setEmployeeIdQuery(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Search by serial number"
                  value={serialNumberQuery}
                  onChange={(e) => setSerialNumberQuery(e.target.value)}
                />
                <select
                  value={assetTypeFilter}
                  onChange={(e) => setAssetTypeFilter(e.target.value)}
                >
                  <option value="">All asset types</option>
                  {assetTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="card table-card">
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Employee Name</th>
                    <th>Employee ID</th>
                    <th>Department</th>
                    <th>Plant</th>
                    <th>Asset Type</th>
                    <th>Serial Number</th>
                    <th>Model</th>
                    <th>Vendor Name</th>
                    <th>Assigned Date</th>
                    <th>Assigned By</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((row) => (
                    <tr key={`${row.serial_number}-${row.employee_id}`}>
                      <td>{row.employee_name}</td>
                      <td>{row.employee_id}</td>
                      <td>{row.department}</td>
                      <td>{row.plant}</td>
                      <td>{row.asset_type}</td>
                      <td>{row.serial_number}</td>
                      <td>{row.model}</td>
                      <td>{row.vendor_name}</td>
                      <td>{row.assigned_date}</td>
                      <td>{row.assigned_by}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredData.length === 0 ? (
              <p className="empty-state">No assigned assets match the current filters.</p>
            ) : null}
          </div>
        </>
      )}
    </div>
  );
}