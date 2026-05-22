const BASE_URL = 'http://localhost:5000';

export async function addAssets(data) {
  const res = await fetch(`${BASE_URL}/api/assets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export const getAvailableAssets = async () => {
  const res = await fetch("http://localhost:5000/api/available-assets");
  return res.json();
};

export async function assignAsset(data) {
  const res = await fetch(`${BASE_URL}/api/assign`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const result = await res.json();
  if (!res.ok) {
    throw new Error(result?.message || 'Assignment failed.');
  }
  return result;
}

export async function getDashboard() {
  const res = await fetch(`${BASE_URL}/api/dashboard`);
  return res.json();
}

export async function getAssets() {
  const res = await fetch(`${BASE_URL}/api/assets`);
  return res.json();
}

export async function getAssignedAssets() {
  const res = await fetch(`${BASE_URL}/api/assigned-assets`);
  return res.json();
}

export async function getAllAssets() {
  const res = await fetch(`${BASE_URL}/api/all-assets`);
  return res.json();
}