// js/orders.js
import { db } from './firebase-config.js';
import { ref, push, set, get, query, orderByChild, equalTo, update, remove } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

export async function placeOrder(orderData) {
  const orderRef = push(ref(db, 'orders'));
  await set(orderRef, orderData);
  return orderRef.key;
}

export async function getUserOrdersOnce(userId) {
  const q = query(ref(db,'orders'), orderByChild('userId'), equalTo(userId));
  const snap = await get(q);
  const list = [];
  if (!snap.exists()) return list;
  snap.forEach(child => list.push({ id: child.key, ...child.val() }));
  list.sort((a,b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
  return list;
}

export async function getAllOrdersOnce() {
  const snap = await get(ref(db,'orders'));
  const list = [];
  if (!snap.exists()) return list;
  snap.forEach(child => list.push({ id: child.key, ...child.val() }));
  list.sort((a,b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
  return list;
}

export async function updateOrderStatus(id, status) {
  await update(ref(db, `orders/${id}`), { status });
}

export async function deleteOrder(id) {
  await remove(ref(db, `orders/${id}`));
}
