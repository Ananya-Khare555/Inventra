import { useEffect, useMemo, useState } from "react";
import { getAllAssets } from "../api/api";
import "./TotalAssets.css";

export default function TotalAssets() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [serialQuery, setSerialQuery] = useState("");
  const [assetTypeQuery, setAssetTypeQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const data = await getAllAssets();
        setAssets(Array.isArray(data) ? data : []);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const filteredAssets = useMemo(() => {
    const serial = serialQuery.trim().toLowerCase();
    const assetType = assetTypeQuery.trim().toLowerCase();

    return assets.filter((asset) => {
      const matchesSerial = serial
        ? String(asset?.serial_number ?? "").toLowerCase().includes(serial)
        : true;
      const matchesAssetType = assetType
        ? String(asset?.asset_type ?? "").toLowerCase().includes(assetType)
        : true;
      const matchesStatus = statusFilter ? asset?.status === statusFilter : true;

      return matchesSerial && matchesAssetType && matchesStatus;
    });
  }, [assetTypeQuery, assets, serialQuery, statusFilter]);

  if (loading) return <div className="page total-assets-page">Loading...</div>;

  return (
    <div className="page total-assets-page">
      <h2 className="page-title">Total Assets</h2>

      <div className="card">
        <div className="table-toolbar">
          <div className="table-toolbar-copy">
            <h3 className="card-title">Search & Filter</h3>
            <p className="table-meta">
              Showing {filteredAssets.length} of {assets.length} total assets
            </p>
          </div>

          <div className="table-filters">
            <input
              type="text"
              placeholder="Search by serial number"
              value={serialQuery}
              onChange={(e) => setSerialQuery(e.target.value)}
            />
            <input
              type="text"
              placeholder="Search by asset type"
              value={assetTypeQuery}
              onChange={(e) => setAssetTypeQuery(e.target.value)}
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All statuses</option>
              <option value="Available">Available</option>
              <option value="Assigned">Assigned</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card table-card">
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Serial Number</th>
                <th>Asset Type</th>
                <th>Model</th>
                <th>Vendor</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {filteredAssets.map((a) => (
                <tr key={a.serial_number}>
                  <td>{a.serial_number}</td>
                  <td>{a.asset_type}</td>
                  <td>{a.model}</td>
                  <td>{a.vendor_name}</td>
                  <td>
                    <span
                      className={`status-pill ${
                        a.status === "Available" ? "status-available" : "status-assigned"
                      }`}
                    >
                      {a.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredAssets.length === 0 ? (
          <p className="empty-state">No assets match the current filters.</p>
        ) : null}
      </div>
    </div>
  );
}