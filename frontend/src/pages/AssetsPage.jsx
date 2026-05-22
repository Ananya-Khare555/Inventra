import React, { useEffect, useMemo, useState } from "react";
import { getAssets } from "../api/api";
import "./AssetsPage.css";

export default function AssetsPage() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchSerial, setSearchSerial] = useState("");
  const [assetTypeFilter, setAssetTypeFilter] = useState("");
  const downloadCSV = () => {
    window.open("http://localhost:5000/api/export-assets");
  };

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await getAssets();
        if (!cancelled) setAssets(Array.isArray(data) ? data : []);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const assetTypes = useMemo(() => {
    const types = new Set();
    for (const a of assets) {
      if (a?.asset_type) types.add(a.asset_type);
    }
    return Array.from(types).sort((x, y) => String(x).localeCompare(String(y)));
  }, [assets]);

  const filteredAssets = useMemo(() => {
    const q = searchSerial.trim().toLowerCase();

    return assets.filter((a) => {
      const serial = String(a?.serial_number ?? "");
      const matchesSearch = q ? serial.toLowerCase().includes(q) : true;
      const matchesType = assetTypeFilter ? a?.asset_type === assetTypeFilter : true;
      return matchesSearch && matchesType;
    });
  }, [assets, searchSerial, assetTypeFilter]);

  if (loading) return <div className="page assets-page">Loading...</div>;

  return (
    <div className="page assets-page">
      <h2 className="page-title">Assets</h2>

      <div className="card">
        <div className="table-toolbar">
          <div className="table-toolbar-copy">
            <h3 className="card-title">Search & Filter</h3>
            <p className="table-meta">
              Showing {filteredAssets.length} of {assets.length} assets
            </p>
          </div>

          <div className="table-filters">
            <input
              type="text"
              placeholder="Search by serial number"
              value={searchSerial}
              onChange={(e) => setSearchSerial(e.target.value)}
            />
            <select
              value={assetTypeFilter}
              onChange={(e) => setAssetTypeFilter(e.target.value)}
            >
              <option value="">All asset types</option>
              {assetTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <button onClick={downloadCSV}>Download Excel</button>
          </div>
        </div>
      </div>

      <div className="card table-card">
        <h3 className="card-title">Results</h3>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>serial_number</th>
                <th>asset_type</th>
                <th>model</th>
                <th>vendor_name</th>
                <th>status</th>
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
