import { useState, useEffect } from "react";
import { assignAsset, getAvailableAssets } from "../api/api";
import "./AssignForm.css";

const emptyAssignment = () => ({
  asset_type: "",
  serial_number: "",
});

export default function AssignForm() {
  const [employee, setEmployee] = useState({
    employee_name: "",
    employee_id: "",
    department: "",
    plant: "",
    assigned_date: "",
    assigned_by: "",
  });

  const [availableAssets, setAvailableAssets] = useState([]);
  const [assignments, setAssignments] = useState([emptyAssignment()]);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [errors, setErrors] = useState({
    employee_name: "",
    employee_id: "",
    department: "",
    plant: "",
    assigned_date: "",
    assigned_by: "",
    assignments: [emptyAssignment()],
  });

  useEffect(() => {
    getAvailableAssets().then(setAvailableAssets);
  }, []);
  const updateEmployee = (patch) => {
    const [fieldName] = Object.keys(patch);
    setEmployee((prev) => ({ ...prev, ...patch }));
    setErrors((prev) => ({ ...prev, [fieldName]: "" }));
  };

  const updateAssignment = (index, patch) => {
    const [fieldName] = Object.keys(patch);
    setAssignments((prev) =>
      prev.map((a, i) => (i === index ? { ...a, ...patch } : a))
    );
    setErrors((prev) => ({
      ...prev,
      assignments: prev.assignments.map((a, i) =>
        i === index ? { ...a, [fieldName]: "" } : a
      ),
    }));
  };

  const addAnother = () => {
    setAssignments((prev) => [...prev, emptyAssignment()]);
    setErrors((prev) => ({
      ...prev,
      assignments: [...prev.assignments, emptyAssignment()],
    }));
  };

  const removeAssignment = (index) => {
    setAssignments((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((_, i) => i !== index);
    });
    setErrors((prev) => {
      if (prev.assignments.length <= 1) return prev;
      return {
        ...prev,
        assignments: prev.assignments.filter((_, i) => i !== index),
      };
    });
  };

  const validateForm = () => {
    const nextErrors = {
      employee_name: employee.employee_name.trim() ? "" : "Employee name is required.",
      employee_id: employee.employee_id.trim() ? "" : "Employee ID is required.",
      department: employee.department.trim() ? "" : "Department is required.",
      plant: employee.plant.trim() ? "" : "Plant is required.",
      assigned_date: employee.assigned_date ? "" : "Assigned date is required.",
      assigned_by: employee.assigned_by.trim() ? "" : "Assigned by is required.",
      assignments: assignments.map((a) => ({
        asset_type: a.asset_type.trim() ? "" : "Asset type is required.",
        serial_number: a.serial_number ? "" : "Serial number is required.",
      })),
    };

    const hasEmployeeErrors = Object.entries(nextErrors)
      .filter(([key]) => key !== "assignments")
      .some(([, value]) => value);
    const hasAssignmentErrors = nextErrors.assignments.some(
      (a) => a.asset_type || a.serial_number
    );

    return { nextErrors, isValid: !hasEmployeeErrors && !hasAssignmentErrors };
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
      for (const a of assignments) {
        const payload = {
          ...employee,
          employee_name: employee.employee_name.trim(),
          employee_id: employee.employee_id.trim(),
          department: employee.department.trim(),
          plant: employee.plant.trim(),
          assigned_by: employee.assigned_by.trim(),
          asset_type: a.asset_type.trim(),
          serial_number: a.serial_number,
        };
        // eslint-disable-next-line no-await-in-loop
        const response = await assignAsset(payload);
        if (!response?.message) {
          throw new Error("Assignment failed.");
        }
      }
      setMessage("Assigned successfully.");
      setMessageType("success");
      setEmployee({
        employee_name: "",
        employee_id: "",
        department: "",
        plant: "",
        assigned_date: "",
        assigned_by: "",
      });
      setAssignments([emptyAssignment()]);
      setErrors({
        employee_name: "",
        employee_id: "",
        department: "",
        plant: "",
        assigned_date: "",
        assigned_by: "",
        assignments: [emptyAssignment()],
      });
    } catch (err) {
      setMessage(err?.message || "Assignment failed.");
      setMessageType("error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page">
      <h2 className="page-title">Assign Asset</h2>

      <form onSubmit={onSubmit} className="form">
        <div className="card">
          <h3 className="card-title">Employee Details</h3>
          <div className="form-grid">
            <div className="field">
              <label>Employee Name</label>
              <input
                className={errors.employee_name ? "input-error" : ""}
                value={employee.employee_name}
                onChange={(e) => updateEmployee({ employee_name: e.target.value })}
              />
              {errors.employee_name ? (
                <p className="field-error">{errors.employee_name}</p>
              ) : null}
            </div>

            <div className="field">
              <label>Employee ID</label>
              <input
                className={errors.employee_id ? "input-error" : ""}
                value={employee.employee_id}
                onChange={(e) => updateEmployee({ employee_id: e.target.value })}
              />
              {errors.employee_id ? (
                <p className="field-error">{errors.employee_id}</p>
              ) : null}
            </div>

            <div className="field">
              <label>Department</label>
              <input
                className={errors.department ? "input-error" : ""}
                value={employee.department}
                onChange={(e) => updateEmployee({ department: e.target.value })}
              />
              {errors.department ? (
                <p className="field-error">{errors.department}</p>
              ) : null}
            </div>

            <div className="field">
              <label>Plant</label>
              <input
                className={errors.plant ? "input-error" : ""}
                value={employee.plant}
                onChange={(e) => updateEmployee({ plant: e.target.value })}
              />
              {errors.plant ? <p className="field-error">{errors.plant}</p> : null}
            </div>

            <div className="field">
              <label>Assigned Date</label>
              <input
                className={errors.assigned_date ? "input-error" : ""}
                type="date"
                value={employee.assigned_date}
                onChange={(e) => updateEmployee({ assigned_date: e.target.value })}
              />
              {errors.assigned_date ? (
                <p className="field-error">{errors.assigned_date}</p>
              ) : null}
            </div>

            <div className="field">
              <label>Assigned By</label>
              <input
                className={errors.assigned_by ? "input-error" : ""}
                value={employee.assigned_by}
                onChange={(e) => updateEmployee({ assigned_by: e.target.value })}
              />
              {errors.assigned_by ? (
                <p className="field-error">{errors.assigned_by}</p>
              ) : null}
            </div>
          </div>
        </div>

        {assignments.map((a, idx) => (
          <div key={idx} className="card">
            <div className="row-header">
              <h3 className="card-title">Asset {idx + 1}</h3>
              <button
                type="button"
                className="remove-row-btn"
                onClick={() => removeAssignment(idx)}
                disabled={assignments.length === 1 || submitting}
              >
                Remove
              </button>
            </div>

            <div className="form-grid">
              <div className="field">
                <label>Asset Type</label>
                <input
                  className={errors.assignments[idx]?.asset_type ? "input-error" : ""}
                  value={a.asset_type}
                  onChange={(e) =>
                    updateAssignment(idx, { asset_type: e.target.value })
                  }
                />
                {errors.assignments[idx]?.asset_type ? (
                  <p className="field-error">{errors.assignments[idx].asset_type}</p>
                ) : null}
              </div>

              <div className="field">
                <label>Serial Number</label>
                <select
                  className={errors.assignments[idx]?.serial_number ? "input-error" : ""}
                  value={a.serial_number}
                  onChange={(e) =>
                    updateAssignment(idx, { serial_number: e.target.value })
                  }
                >
                  <option value="">Select Serial</option>
                  {availableAssets.map((asset) => (
                    <option key={asset.serial_number} value={asset.serial_number}>
                      {asset.serial_number} ({asset.asset_type})
                    </option>
                  ))}
                </select>
                {errors.assignments[idx]?.serial_number ? (
                  <p className="field-error">{errors.assignments[idx].serial_number}</p>
                ) : null}
              </div>
            </div>
          </div>
        ))}

        <div className="card">
          <h3 className="card-title">Actions</h3>
          <div className="actions">
            <button type="button" onClick={addAnother} disabled={submitting}>
              + Add Another
            </button>
            <button type="submit" disabled={submitting}>
              {submitting ? "Assigning..." : "Assign"}
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