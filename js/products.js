// js/products.js
import { db } from './firebase-config.js';
import { ref, push, set, get, update, remove } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

/**
 * If imageFile is provided, convert to dataURL and store as imageUrl in DB.
 * If imageUrl string provided in productData.imageUrl, use that instead.
 */
export async function uploadProduct(productData, imageFile = null) {
  // productData: { name, price, category, description, imageUrl (optional) }
  let imageUrl = productData.imageUrl || '';
  if (imageFile) {
    imageUrl = await fileToDataUrl(imageFile);
  }
  const productRef = push(ref(db, 'products'));
  await set(productRef, { ...productData, imageUrl, createdAt: new Date().toISOString() });
  return productRef.key;
}

export async function getProductsOnce() {
  const snap = await get(ref(db, 'products'));
  const list = [];
  if (!snap.exists()) return list;
  snap.forEach(child => {
    list.push({ id: child.key, ...child.val() });
  });
  // sort by createdAt desc
  list.sort((a,b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
  return list;
}

export async function updateProduct(id, updates) {
  await update(ref(db, `products/${id}`), updates);
}

export async function deleteProduct(id) {
  await remove(ref(db, `products/${id}`));
}

function fileToDataUrl(file) {
  return new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onload = () => res(reader.result);
    reader.onerror = (e) => rej(e);
    reader.readAsDataURL(file);
  });
}
