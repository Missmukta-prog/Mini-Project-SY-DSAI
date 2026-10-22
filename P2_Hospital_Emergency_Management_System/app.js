// Priority queue: lower numeric value means higher priority. Equal priorities use arrival order.
// A small linked-list structure is maintained for all patient records.
const waitingQueue = [];
let recordHead = null;
let nextId = 1;
const priorityRank = { emergency: 1, urgent: 2, normal: 3 };
const $ = (id) => document.getElementById(id);

function addRecord(patient) {
  const node = { patient, next: null };
  if (!recordHead) recordHead = node;
  else {
    let current = recordHead;
    while (current.next) current = current.next;
    current.next = node;
  }
}
function getRecords() {
  const records = [];
  let current = recordHead;
  while (current) { records.push(current.patient); current = current.next; }
  return records;
}
function enqueueByPriority(patient) {
  // Insert after all patients with equal or higher priority to preserve FIFO within each priority.
  let index = waitingQueue.findIndex(p => priorityRank[p.priority] > priorityRank[patient.priority]);
  if (index === -1) waitingQueue.push(patient);
  else waitingQueue.splice(index, 0, patient);
}
$("patientForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const name = $("patientName").value.trim();
  const age = Number($("age").value);
  const condition = $("condition").value.trim();
  const priority = $("priority").value;
  if (!name || !condition || !Number.isInteger(age) || age < 0 || age > 120) {
    alert("Please enter a valid name, condition, and age (0–120)."); return;
  }
  const patient = { id: nextId++, name, age, condition, priority, status: "Waiting", registered: new Date().toLocaleTimeString() };
  addRecord(patient);
  enqueueByPriority(patient);
  $("patientForm").reset();
  render();
});
function treatPatient(id) {
  const index = waitingQueue.findIndex(p => p.id === id);
  if (index < 0) return;
  // Only the first patient in the sorted queue can be treated.
  if (index !== 0) return;
  const patient = waitingQueue.shift();
  patient.status = "Treatment completed";
  patient.completed = new Date().toLocaleTimeString();
  render();
}
function render() {
  $("waitingCount").textContent = `${waitingQueue.length} patient${waitingQueue.length === 1 ? "" : "s"}`;
  $("waitingEmpty").hidden = waitingQueue.length > 0;
  $("waitingTable").hidden = waitingQueue.length === 0;
  $("waitingBody").innerHTML = "";
  waitingQueue.forEach((p, i) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>#${p.id}</td><td></td><td>${p.age}</td><td></td><td><span class="priority ${p.priority}">${p.priority}</span></td><td>${i === 0 ? `<button type="button" data-treat="${p.id}">Complete treatment</button>` : '<span class="hint">Waiting</span>'}</td>`;
    tr.children[1].textContent = p.name;
    tr.children[3].textContent = p.condition;
    $("waitingBody").appendChild(tr);
  });
  renderRecords();
}
function renderRecords() {
  const term = $("searchRecords").value.trim().toLowerCase();
  const records = getRecords().filter(p => [p.name, p.condition, p.priority, p.status, String(p.id)].some(v => v.toLowerCase().includes(term)));
  $("recordsEmpty").hidden = records.length > 0;
  $("recordsTable").hidden = records.length === 0;
  $("recordsBody").innerHTML = "";
  records.forEach(p => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>#${p.id}</td><td></td><td></td><td><span class="priority ${p.priority}">${p.priority}</span></td><td class="status"></td><td>${p.registered}</td>`;
    tr.children[1].textContent = p.name;
    tr.children[2].textContent = p.condition;
    tr.children[4].textContent = p.status;
    $("recordsBody").appendChild(tr);
  });
}
$("waitingBody").addEventListener("click", event => {
  const button = event.target.closest("button[data-treat]");
  if (button) treatPatient(Number(button.dataset.treat));
});
$("searchRecords").addEventListener("input", renderRecords);
$("clearRecords").addEventListener("click", () => {
  if (!confirm("Remove completed patients from the record list? Waiting patients will remain.")) return;
  const keep = getRecords().filter(p => p.status !== "Treatment completed");
  recordHead = null;
  keep.forEach(p => addRecord(p));
  render();
});
render();