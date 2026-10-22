// Queue implementation: enqueue at the end; process the first order only.
const orderQueue = [];
const completedOrders = [];
let nextOrderId = 1;
const $ = (id) => document.getElementById(id);

$("orderForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const customer = $("customerName").value.trim();
  const item = $("foodItem").value;
  const quantity = Number($("quantity").value);
  if (!customer || !item || !Number.isInteger(quantity) || quantity < 1 || quantity > 20) {
    alert("Please enter a valid name, food item, and quantity (1–20).");
    return;
  }
  orderQueue.push({
    id: nextOrderId++, customer, item, quantity,
    status: "Received", createdAt: new Date().toLocaleTimeString()
  });
  $("orderForm").reset();
  $("quantity").value = 1;
  render();
});

function processNextOrder() {
  if (orderQueue.length === 0) return;
  const first = orderQueue[0];
  if (first.status === "Received") {
    first.status = "Preparing";
  } else if (first.status === "Preparing") {
    first.status = "Ready";
  } else {
    const finished = orderQueue.shift();
    finished.completedAt = new Date().toLocaleTimeString();
    completedOrders.unshift(finished);
  }
  render();
}
function statusClass(status) {
  return status === "Preparing" ? "preparing" : status === "Ready" ? "ready" : "";
}
function render() {
  $("queueCount").textContent = `${orderQueue.length} order${orderQueue.length === 1 ? "" : "s"}`;
  $("queueEmpty").hidden = orderQueue.length !== 0;
  $("ordersTable").hidden = orderQueue.length === 0;
  $("ordersBody").innerHTML = "";
  orderQueue.forEach((order, index) => {
    const tr = document.createElement("tr");
    const action = index === 0
      ? `<button type="button" data-process="${order.id}">${order.status === "Received" ? "Start preparation" : order.status === "Preparing" ? "Mark ready" : "Complete order"}</button>`
      : `<span class="hint">Waiting</span>`;
    tr.innerHTML = `<td>#${order.id}</td><td></td><td></td><td>${order.quantity}</td><td><span class="status ${statusClass(order.status)}">${order.status}</span></td><td>${action}</td>`;
    tr.children[1].textContent = order.customer;
    tr.children[2].textContent = order.item;
    $("ordersBody").appendChild(tr);
  });
  $("completedEmpty").hidden = completedOrders.length !== 0;
  $("completedTable").hidden = completedOrders.length === 0;
  $("completedBody").innerHTML = "";
  completedOrders.forEach(order => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>#${order.id}</td><td></td><td></td><td>${order.quantity}</td><td>${order.completedAt}</td>`;
    tr.children[1].textContent = order.customer;
    tr.children[2].textContent = order.item;
    $("completedBody").appendChild(tr);
  });
}
$("ordersBody").addEventListener("click", (event) => {
  const button = event.target.closest("button[data-process]");
  if (button) processNextOrder();
});
$("clearCompleted").addEventListener("click", () => {
  if (completedOrders.length && confirm("Clear completed-order history?")) {
    completedOrders.length = 0;
    render();
  }
});
render();