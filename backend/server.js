const express = require("express");
const cors = require("cors");
const pool = require("./db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "inventra_secret_key";

app.use(express.json());
app.use(cors());

function createToken(user) {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      name: user.name,
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

app.post("/api/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await pool.query(
      "SELECT * FROM users WHERE username = $1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (username, password, role, name)
       VALUES ($1, $2, $3, $4)
       RETURNING id, username, role, name`,
      [email, hashedPassword, "user", name]
    );

    const user = result.rows[0];
    const token = createToken(user);

    return res.status(201).json({
      message: "Signup successful",
      token,
      user,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const result = await pool.query(
      "SELECT * FROM users WHERE username = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = result.rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = createToken(user);

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

app.post("/api/assets", async (req, res) => {
  const {
    asset_type,
    model,
    vendor_name,
    bill_no,
    in_stock_date,
    serial_numbers,
  } = req.body;

  if (
    !asset_type ||
    !model ||
    !vendor_name ||
    !bill_no ||
    !in_stock_date ||
    !Array.isArray(serial_numbers) ||
    serial_numbers.length === 0
  ) {
    return res.status(400).json({ message: "Invalid request body" });
  }

  try {
    let inserted = 0;
    let skipped = 0;

    for (const serial_number of serial_numbers) {
      if (!serial_number) continue;

      const result = await pool.query(
        `
        INSERT INTO assets (
          asset_type,
          model,
          vendor_name,
          bill_no,
          in_stock_date,
          serial_number,
          status
        )
        VALUES ($1, $2, $3, $4, $5, $6, 'Available')
        ON CONFLICT (serial_number) DO NOTHING
        `,
        [asset_type, model, vendor_name, bill_no, in_stock_date, serial_number]
      );

      if (result.rowCount > 0) inserted++;
      else skipped++;
    }

    return res.status(201).json({
      message: "Assets processed successfully",
      inserted,
      skipped,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});

app.post("/api/assign", async (req, res) => {
  const {
    serial_number,
    asset_type,
    employee_name,
    employee_id,
    department,
    plant,
    assigned_date,
    assigned_by,
  } = req.body;

  if (
    !serial_number ||
    !asset_type ||
    !employee_name ||
    !employee_id ||
    !department ||
    !plant ||
    !assigned_date ||
    !assigned_by
  ) {
    return res.status(400).json({ message: "Invalid request body" });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const assetResult = await client.query(
      "SELECT * FROM assets WHERE serial_number = $1 AND asset_type = $2",
      [serial_number, asset_type]
    );

    if (assetResult.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Asset not found" });
    }

    if (assetResult.rows[0].status !== "Available") {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: "Asset is not available" });
    }

    await client.query(
      "UPDATE assets SET status = 'Assigned' WHERE serial_number = $1",
      [serial_number]
    );

    await client.query(
      `
      INSERT INTO assignments (
        serial_number,
        asset_type,
        employee_name,
        employee_id,
        department,
        plant,
        assigned_date,
        assigned_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `,
      [
        serial_number,
        asset_type,
        employee_name,
        employee_id,
        department,
        plant,
        assigned_date,
        assigned_by,
      ]
    );

    await client.query("COMMIT");

    return res.status(200).json({ message: "Asset assigned successfully" });
  } catch (error) {
    await client.query("ROLLBACK");
    return res.status(500).json({ message: "Server error", error: error.message });
  } finally {
    client.release();
  }
});

app.get("/api/available-assets", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT serial_number, asset_type
      FROM assets
      WHERE status = 'Available'
      ORDER BY serial_number
    `);

    return res.status(200).json(result.rows);
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});

app.get("/api/assets", async (req, res) => {
  const { type } = req.query;

  try {
    let result;

    if (type) {
      result = await pool.query(
        `
        SELECT serial_number, asset_type, model, vendor_name, status
        FROM assets
        WHERE asset_type = $1
        `,
        [type]
      );
    } else {
      result = await pool.query(`
        SELECT serial_number, asset_type, model, vendor_name, status
        FROM assets
      `);
    }

    return res.status(200).json(result.rows);
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});

app.get("/api/export-assets", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT serial_number, asset_type, model, vendor_name, status
      FROM assets
      ORDER BY serial_number
    `);

    const columns = ["serial_number", "asset_type", "model", "vendor_name", "status"];

    const escapeCsv = (value) => {
      if (value === null || value === undefined) return "";
      const str = String(value);
      if (/[",\r\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
      return str;
    };

    const header = columns.join(",");
    const rows = result.rows.map((row) =>
      columns.map((col) => escapeCsv(row[col])).join(",")
    );
    const csv = [header, ...rows].join("\r\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", 'attachment; filename="assets.csv"');
    return res.status(200).send(csv);
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});

app.get("/api/dashboard", async (req, res) => {
  try {
    const totalResult = await pool.query("SELECT COUNT(*) FROM assets");
    const availableResult = await pool.query(
      "SELECT COUNT(*) FROM assets WHERE status = 'Available'"
    );
    const assignedResult = await pool.query(
      "SELECT COUNT(*) FROM assets WHERE status = 'Assigned'"
    );
        // Assigned assets over time
        const assignedOverTime = await pool.query(`
          SELECT DATE(assigned_date) AS date, COUNT(*) AS count
          FROM assignments
          GROUP BY DATE(assigned_date)
          ORDER BY DATE(assigned_date)
        `);
    
        // In-stock assets grouped by type
        const inStockAssets = await pool.query(`
          SELECT asset_type, COUNT(*) AS count
          FROM assets
          WHERE status = 'Available'
          GROUP BY asset_type
          ORDER BY asset_type
        `);
    
        // Low stock assets
        const lowStockResult = await pool.query(`
          SELECT asset_type, COUNT(*) AS count
          FROM assets
          GROUP BY asset_type
          ORDER BY asset_type
        `);

        const assignedByType = await pool.query(`
          SELECT asset_type, COUNT(*) AS count
          FROM assets
          WHERE status = 'Assigned'
          GROUP BY asset_type
          ORDER BY asset_type
        `);
    
        return res.status(200).json({
          total_assets: Number(totalResult.rows[0].count),
          available_assets: Number(availableResult.rows[0].count),
          assigned_assets: Number(assignedResult.rows[0].count),
          assigned_by_type: assignedByType.rows,
          assigned_over_time: assignedOverTime.rows,
          in_stock_assets: inStockAssets.rows,
          low_stock: lowStockResult.rows,
        });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});


app.get("/api/assigned-assets", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        ass.employee_name,
        ass.employee_id,
        ass.department,
        ass.plant,
        ass.asset_type,
        ass.serial_number,
        ass.assigned_date,
        ass.assigned_by,
        a.model,
        a.vendor_name
      FROM assignments ass
      JOIN assets a ON a.serial_number = ass.serial_number
      ORDER BY ass.assigned_date DESC
    `);

    return res.status(200).json(result.rows);
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});

app.get("/api/all-assets", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        serial_number,
        asset_type,
        model,
        vendor_name,
        status
      FROM assets
      ORDER BY serial_number
    `);

    return res.status(200).json(result.rows);
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});

app.get("/api/all-assets", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        serial_number,
        asset_type,
        model,
        vendor_name,
        status
      FROM assets
      ORDER BY serial_number
    `);

    return res.status(200).json(result.rows);
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});

app.get("/", (req, res) => {
  res.send("Inventra Backend Running 🚀");
});

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);

  try {
    await pool.query("SELECT NOW()");
    console.log("DB Connected");
  } catch (error) {
    console.error("DB connection failed:", error.message);
  }
});
