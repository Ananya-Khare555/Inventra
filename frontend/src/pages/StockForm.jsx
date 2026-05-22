import { useState } from "react";
import { addAssets } from "../api/api";
import "./StockForm.css";

const emptyAsset = () => ({
  asset_type: "",
  model: "",
  vendor_name: "",
  bill_no: "",
  in_stock_date: "",
  quantity: 1,
  serial_numbers: [""],
});

const emptyAssetErrors = () => ({
  asset_type: "",
  model: "",
  vendor_name: "",
  bill_no: "",
  in_stock_date: "",
  quantity: "",
  serial_numbers: [""],
});

export default function StockForm() {
  const [assets, setAssets] = useState([emptyAsset()]);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [errors, setErrors] = useState([emptyAssetErrors()]);

  const updateAsset = (index, patch) => {
    const [fieldName] = Object.keys(patch);
    setAssets((prev) =>
      prev.map((a, i) => (i === index ? { ...a, ...patch } : a))
    );
    setErrors((prev) =>
      prev.map((a, i) => (i === index ? { ...a, [fieldName]: "" } : a))
    );
  };

  const onQuantityChange = (index, value) => {
    const qty = Math.max(0, Number.parseInt(value || "0", 10) || 0);
    setAssets((prev) =>
      prev.map((a, i) => {
        if (i !== index) return a;
        const nextSerials = Array.from({ length: qty }, (_, idx) => {
          return a.serial_numbers?.[idx] ?? "";
        });
        return { ...a, quantity: qty, serial_numbers: nextSerials };
      })
    );
    setErrors((prev) =>
      prev.map((a, i) => {
        if (i !== index) return a;
        const nextSerialErrors = Array.from({ length: qty }, (_, idx) => {
          return a.serial_numbers?.[idx] ?? "";
        });
        return { ...a, quantity: "", serial_numbers: nextSerialErrors };
      })
    );
  };

  const onSerialChange = (assetIndex, serialIndex, value) => {
    setAssets((prev) =>
      prev.map((a, i) => {
        if (i !== assetIndex) return a;
        const serials = [...(a.serial_numbers || [])];
        serials[serialIndex] = value;
        return { ...a, serial_numbers: serials };
      })
    );
    setErrors((prev) =>
      prev.map((a, i) => {
        if (i !== assetIndex) return a;
        const serials = [...(a.serial_numbers || [])];
        serials[serialIndex] = "";
        return { ...a, serial_numbers: serials };
      })
    );
  };

  const addAnotherAsset = () => {
    setAssets((prev) => [...prev, emptyAsset()]);
    setErrors((prev) => [...prev, emptyAssetErrors()]);
  };

  const removeAsset = (index) => {
    setAssets((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((_, i) => i !== index);
    });
    setErrors((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((_, i) => i !== index);
    });
  };

  const validateForm = () => {
    const nextErrors = assets.map((asset) => ({
      asset_type: asset.asset_type.trim() ? "" : "Asset type is required.",
      model: asset.model.trim() ? "" : "Model is required.",
      vendor_name: asset.vendor_name.trim() ? "" : "Vendor name is required.",
      bill_no: asset.bill_no.trim() ? "" : "Bill number is required.",
      in_stock_date: asset.in_stock_date ? "" : "In stock date is required.",
      quantity:
        Number(asset.quantity) > 0 ? "" : "Quantity must be at least 1.",
      serial_numbers: (asset.serial_numbers || []).map((serial) =>
        String(serial).trim() ? "" : "Serial number is required."
      ),
    }));

    const hasErrors = nextErrors.some(
      (assetError) =>
        assetError.asset_type ||
        assetError.model ||
        assetError.vendor_name ||
        assetError.bill_no ||
        assetError.in_stock_date ||
        assetError.quantity ||
        assetError.serial_numbers.some(Boolean)
    );

    return { nextErrors, isValid: !hasErrors };
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setMessageType("");

    const { nextErrors, isValid } = validateForm();
    setErrors(nextErrors);

    if (!isValid) {
      setMessage("Please complete all required fields before submitting.");
      setMessageType("error");
      return;
    }

    setSubmitting(true);

    try {
      for (const item of assets) {
        const payload = {
          asset_type: item.asset_type.trim(),
          model: item.model.trim(),
          vendor_name: item.vendor_name.trim(),
          bill_no: item.bill_no.trim(),
          in_stock_date: item.in_stock_date,
          quantity: item.quantity,
          serial_numbers: item.serial_numbers.map((serial) => serial.trim()),
        };
        // Call once per asset entry as requested
        // eslint-disable-next-line no-await-in-loop
        const response = await addAssets(payload);
        if (response?.message !== "Assets processed successfully") {
          throw new Error(response?.message || "Submit failed.");
        }
      }
      setMessage("Submitted successfully.");
      setMessageType("success");
      setAssets([emptyAsset()]);
      setErrors([emptyAssetErrors()]);
    } catch (err) {
      setMessage(err?.message || "Submit failed.");
      setMessageType("error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page">
      <h2 className="page-title">Stock Update</h2>

      <form onSubmit={onSubmit} className="form">
        {assets.map((asset, idx) => (
          <div key={idx} className="card">
            <div className="row-header">
              <h3 className="card-title">Asset {idx + 1}</h3>
              <button
                type="button"
                className="remove-row-btn"
                onClick={() => removeAsset(idx)}
                disabled={assets.length === 1 || submitting}
              >
                Remove
              </button>
            </div>

            <div className="form-grid">
              <div className="field">
                <label>Asset Type</label>
                <input
                  className={errors[idx]?.asset_type ? "input-error" : ""}
                  value={asset.asset_type}
                  onChange={(e) => updateAsset(idx, { asset_type: e.target.value })}
                />
                {errors[idx]?.asset_type ? (
                  <p className="field-error">{errors[idx].asset_type}</p>
                ) : null}
              </div>

              <div className="field">
                <label>Model</label>
                <input
                  className={errors[idx]?.model ? "input-error" : ""}
                  value={asset.model}
                  onChange={(e) => updateAsset(idx, { model: e.target.value })}
                />
                {errors[idx]?.model ? (
                  <p className="field-error">{errors[idx].model}</p>
                ) : null}
              </div>

              <div className="field">
                <label>Vendor Name</label>
                <input
                  className={errors[idx]?.vendor_name ? "input-error" : ""}
                  value={asset.vendor_name}
                  onChange={(e) => updateAsset(idx, { vendor_name: e.target.value })}
                />
                {errors[idx]?.vendor_name ? (
                  <p className="field-error">{errors[idx].vendor_name}</p>
                ) : null}
              </div>

              <div className="field">
                <label>Bill No</label>
                <input
                  className={errors[idx]?.bill_no ? "input-error" : ""}
                  value={asset.bill_no}
                  onChange={(e) => updateAsset(idx, { bill_no: e.target.value })}
                />
                {errors[idx]?.bill_no ? (
                  <p className="field-error">{errors[idx].bill_no}</p>
                ) : null}
              </div>

              <div className="field">
                <label>In Stock Date</label>
                <input
                  className={errors[idx]?.in_stock_date ? "input-error" : ""}
                  type="date"
                  value={asset.in_stock_date}
                  onChange={(e) => updateAsset(idx, { in_stock_date: e.target.value })}
                />
                {errors[idx]?.in_stock_date ? (
                  <p className="field-error">{errors[idx].in_stock_date}</p>
                ) : null}
              </div>

              <div className="field">
                <label>Quantity</label>
                <input
                  className={errors[idx]?.quantity ? "input-error" : ""}
                  type="number"
                  min="0"
                  value={asset.quantity}
                  onChange={(e) => onQuantityChange(idx, e.target.value)}
                />
                {errors[idx]?.quantity ? (
                  <p className="field-error">{errors[idx].quantity}</p>
                ) : null}
              </div>
            </div>

            <div className="subsection">
              <div className="subsection-title">Serial Numbers</div>
              <div className="stack">
                {asset.serial_numbers.map((serial, sIdx) => (
                  <div key={sIdx} className="field">
                    <input
                      className={errors[idx]?.serial_numbers?.[sIdx] ? "input-error" : ""}
                      placeholder={`Serial #${sIdx + 1}`}
                      value={serial}
                      onChange={(e) =>
                        onSerialChange(idx, sIdx, e.target.value)
                      }
                    />
                    {errors[idx]?.serial_numbers?.[sIdx] ? (
                      <p className="field-error">{errors[idx].serial_numbers[sIdx]}</p>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}

        <div className="card">
          <h3 className="card-title">Actions</h3>
          <div className="actions">
            <button type="button" onClick={addAnotherAsset} disabled={submitting}>
              + Add Another Asset
            </button>
            <button type="submit" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit"}
            </button>
          </div>
          {message ? (
            <p className={`message ${messageType === "error" ? "message-error" : "message-success"}`}>
              {message}
            </p>
          ) : null}
        </div>
      </form>
    </div>
  );
}

