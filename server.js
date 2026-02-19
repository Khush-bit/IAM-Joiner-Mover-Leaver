// ==========================
// server.js
// ==========================

const db = require("./database");
const express = require("express");
const app = express();
app.use(express.json());
app.use(express.static(__dirname));

// ==========================
// Helper function for audit
// ==========================
function logAction(userId, action, performedBy) {
  const timestamp = new Date().toISOString();
  db.run(
    `INSERT INTO audit_logs (userId, action, performedBy, timestamp) VALUES (?, ?, ?, ?)`,
    [userId, action, performedBy, timestamp]
  );
}

// ==========================
// JOINER (Add a user)
// ==========================
app.post("/join", (req, res) => {
    const { name, department, location } = req.body;
    const id = Date.now();
  
    // Assign manager based on department
    const manager = department === "IT" ? "Manager_IT" : "Manager_HR";
  
    db.run(
      `INSERT INTO users (id, name, department, location, approved, role, status, provisioningState, manager) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, name, department, location, 0, null, "Pending Approval", "PENDING", manager],
      () => {
        logAction(id, "Join Request Created", name);
        db.all(`SELECT * FROM users`, (err, rows) => res.send(rows));
      }
    );
  });
  

// ==========================
// APPROVAL (With forced failure)
// ==========================
app.post("/approve", (req, res) => {
  const { id, forceFail, approver } = req.body; // approver passed from frontend

  // Check manager hierarchy
  db.get(`SELECT manager FROM users WHERE id=?`, [id], (err, row) => {
    if (!row) return res.status(404).send({ error: "User not found" });
    if (row.manager !== approver) {
      return res.status(403).send({ error: "You are not authorized to approve this user." });
    }

    // Forced failure
    if (forceFail === true) {
      db.run(
        `UPDATE users SET approved=1, role=NULL, status=?, provisioningState=? WHERE id=?`,
        ["Provisioning Failed (Simulated)", "FAILED", id],
        () => {
          logAction(id, "Approve (Failed)", approver);
          db.all(`SELECT * FROM users`, (err, rows) => res.send(rows));
        }
      );
    } else {
      // Fetch role from catalog
      db.get(`SELECT department FROM users WHERE id=?`, [id], (err, uRow) => {
        db.get(`SELECT role, entitlements FROM role_catalog WHERE department=?`, [uRow.department], (err, catalog) => {
          db.run(
            `UPDATE users SET approved=1, role=?, status=?, provisioningState=? WHERE id=?`,
            [catalog.role, "Active", "SUCCESS", id],
            () => {
              logAction(id, "Approve (Success)", approver);
              db.all(`SELECT * FROM users`, (err, rows) => res.send(rows));
            }
          );
        });
      });
    }
  });
});

// ==========================
// RETRY PROVISIONING
// ==========================
app.post("/retry", (req, res) => {
  const { id, approver } = req.body; // approver passed from frontend

  db.get(`SELECT manager, department FROM users WHERE id=?`, [id], (err, row) => {
    if (!row) return res.status(404).send({ error: "User not found" });
    if (row.manager !== approver) {
      return res.status(403).send({ error: "You are not authorized to retry this user." });
    }

    // Fetch role from catalog
    db.get(`SELECT role FROM role_catalog WHERE department=?`, [row.department], (err, catalog) => {
      db.run(
        `UPDATE users SET role=?, status=?, provisioningState=? WHERE id=?`,
        [catalog.role, "Active", "SUCCESS", id],
        () => {
          logAction(id, "Retry Provisioning", approver);
          db.all(`SELECT * FROM users`, (err, rows) => res.send(rows));
        }
      );
    });
  });
});

// ==========================
// MOVER
// ==========================
app.post("/move", (req, res) => {
  const { id, newDept, newLocation, approver } = req.body;

  // Only manager can move
  db.get(`SELECT manager FROM users WHERE id=?`, [id], (err, row) => {
    if (!row) return res.status(404).send({ error: "User not found" });
    if (row.manager !== approver) return res.status(403).send({ error: "Unauthorized" });

    db.run(
      `UPDATE users 
       SET department=?, location=?, role=NULL, status=?, provisioningState=?
       WHERE id=?`,
      [newDept, newLocation, "Pending Re-Provisioning", "PENDING", id],
      () => {
        logAction(id, `Moved to ${newDept}`, approver);
        db.all(`SELECT * FROM users`, (err, rows) => res.send(rows));
      }
    );
  });
});

// ==========================
// LEAVER
// ==========================
app.post("/leave", (req, res) => {
  const { id, approver } = req.body;

  db.run(
    `UPDATE users SET role=NULL, status=?, provisioningState=? WHERE id=?`,
    ["Inactive", "SUCCESS", id],
    () => {
      logAction(id, "De-provisioned", approver);
      db.all(`SELECT * FROM users`, (err, rows) => res.send(rows));
    }
  );
});

// ==========================
// SHOW USERS
// ==========================
app.get("/users", (req, res) => {
  db.all(`SELECT * FROM users`, (err, rows) => res.send(rows));
});

// ==========================
// SHOW AUDIT LOGS
// ==========================
app.get("/audit", (req, res) => {
  db.all(`SELECT * FROM audit_logs ORDER BY timestamp DESC`, (err, rows) => res.send(rows));
});

// ==========================
// START SERVER
// ==========================
app.listen(3000, () => console.log("Server running on 3000"));
