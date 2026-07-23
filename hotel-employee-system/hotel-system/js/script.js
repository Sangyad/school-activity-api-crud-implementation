// hotel-system/js/script.js
//
// Runs on pc1 / webserver 1 (the Hotel System frontend). Two jobs:
//   1. Fetch the employee list from the Employee System (pc2) to fill
//      the "employee name" dropdown — the green arrow in the diagram.
//   2. Post new reservations to this system's own create_reservation.php
//      — the red "Create" / "Store" arrows in the diagram.

// Point this at wherever get_employees.php is actually running.
// If you start the Employee System with `php -S localhost:8001`, this is correct as-is.
const EMPLOYEE_API_URL = "http://localhost:8001/get_employees.php";

const employeeSelect = document.getElementById("employeeName");
const employeeIdInput = document.getElementById("employeeId");
const form = document.getElementById("reservationForm");
const statusEl = document.getElementById("formStatus");
const submitBtn = document.getElementById("submitBtn");
const tableBody = document.querySelector("#reservationsTable tbody");

// --- 1. Populate the employee dropdown from the Employee System ---
async function loadEmployees() {
  try {
    const res = await fetch(EMPLOYEE_API_URL);
    if (!res.ok) throw new Error(`Employee System responded with ${res.status}`);
    const employees = await res.json();

    employeeSelect.innerHTML = "";

    if (!employees.length) {
      employeeSelect.innerHTML = `<option value="" disabled selected>No employees found</option>`;
      return;
    }

    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = "Select an employee";
    placeholder.disabled = true;
    placeholder.selected = true;
    employeeSelect.appendChild(placeholder);

    employees.forEach(emp => {
      const option = document.createElement("option");
      option.value = emp.name;
      option.dataset.employeeId = emp.employee_id;
      option.textContent = emp.position ? `${emp.name} — ${emp.position}` : emp.name;
      employeeSelect.appendChild(option);
    });
  } catch (err) {
    employeeSelect.innerHTML = `<option value="" disabled selected>Could not reach Employee System</option>`;
    console.error("Failed to load employees:", err);
  }
}

// When an employee is picked, auto-fill the read-only Employee ID field.
employeeSelect.addEventListener("change", () => {
  const chosen = employeeSelect.selectedOptions[0];
  employeeIdInput.value = chosen?.dataset.employeeId || "";
});

// --- 2. Load whatever is already stored, so the right panel isn't empty ---
async function loadReservations() {
  try {
    const res = await fetch("list_reservations.php");
    const rows = await res.json();
    renderReservations(rows);
  } catch (err) {
    console.error("Failed to load reservations:", err);
  }
}

function renderReservations(rows) {
  if (!rows.length) {
    tableBody.innerHTML = `<tr><td colspan="6" class="empty">No reservations yet.</td></tr>`;
    return;
  }
  tableBody.innerHTML = rows.map(r => `
    <tr>
      <td>${r.reservation_id}</td>
      <td>${escapeHtml(r.customer_name)}</td>
      <td>${r.check_in}</td>
      <td>${r.check_out}</td>
      <td>${escapeHtml(r.employee_name)}</td>
      <td>${r.employee_id}</td>
    </tr>
  `).join("");
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

// --- 3. Handle "Create reservation" ---
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const payload = {
    customer_name: document.getElementById("customerName").value.trim(),
    check_in: document.getElementById("checkIn").value,
    check_out: document.getElementById("checkOut").value,
    employee_name: employeeSelect.value,
    employee_id: employeeIdInput.value,
  };

  submitBtn.disabled = true;
  statusEl.textContent = "";
  statusEl.className = "status";

  try {
    const res = await fetch("create_reservation.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await res.json();

    if (result.success) {
      statusEl.textContent = `Reservation #${result.reservation_id} stored.`;
      statusEl.classList.add("success");
      form.reset();
      employeeIdInput.value = "";
      await loadReservations();
    } else {
      statusEl.textContent = result.error || "Could not create reservation.";
      statusEl.classList.add("error");
    }
  } catch (err) {
    statusEl.textContent = "Network error — is create_reservation.php reachable?";
    statusEl.classList.add("error");
    console.error(err);
  } finally {
    submitBtn.disabled = false;
  }
});

loadEmployees();
loadReservations();
