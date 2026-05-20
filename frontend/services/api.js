/**
 * URL base da API.
 *
 * - Emulador Android: 10.0.2.2 aponta para o localhost da máquina hospedeira.
 * - Device físico: use o IP da máquina na rede local (descubra com `ipconfig`).
 * - iOS Simulator / Web: http://localhost:3000 funciona normalmente.
 *
 * Sobrescreva via EXPO_PUBLIC_API_URL no arquivo .env do app.
 */
const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://10.0.2.2:3000";

async function request(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`HTTP ${response.status}: ${text}`);
  }

  return response.status === 204 ? null : response.json();
}

export const api = {
  listCategories:    ()       => request("/categories"),
  createCategory:    (data)   => request("/categories",        { method: "POST",   body: JSON.stringify(data) }),
  updateCategory:    (id, d)  => request(`/categories/${id}`,  { method: "PUT",    body: JSON.stringify(d) }),
  deleteCategory:    (id)     => request(`/categories/${id}`,  { method: "DELETE" }),

  listTransactions:  ()       => request("/transactions"),
  createTransaction: (data)   => request("/transactions",       { method: "POST",   body: JSON.stringify(data) }),
  updateTransaction: (id, d)  => request(`/transactions/${id}`, { method: "PUT",    body: JSON.stringify(d) }),
  deleteTransaction: (id)     => request(`/transactions/${id}`, { method: "DELETE" }),
};
