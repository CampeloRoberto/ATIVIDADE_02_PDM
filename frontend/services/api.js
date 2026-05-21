const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://10.0.2.2:3000";

async function request(path, options = {}, token = null) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const response = await fetch(`${BASE_URL}${path}`, { headers, ...options });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error ?? `HTTP ${response.status}`);
  }

  return response.status === 204 ? null : response.json();
}

export const api = {
  // Auth (sem token)
  register: (data)        => request("/auth/register", { method: "POST", body: JSON.stringify(data) }),
  login:    (data)        => request("/auth/login",    { method: "POST", body: JSON.stringify(data) }),

  // Autenticados (precisam de token)
  listCategories:    (token)       => request("/categories",        {}, token),
  createCategory:    (data, token) => request("/categories",        { method: "POST",   body: JSON.stringify(data) }, token),
  updateCategory:    (id, d, token)=> request(`/categories/${id}`,  { method: "PUT",    body: JSON.stringify(d) }, token),
  deleteCategory:    (id, token)   => request(`/categories/${id}`,  { method: "DELETE" }, token),

  listTransactions:  (token)       => request("/transactions",       {}, token),
  createTransaction: (data, token) => request("/transactions",       { method: "POST",   body: JSON.stringify(data) }, token),
  updateTransaction: (id, d, token)=> request(`/transactions/${id}`, { method: "PUT",    body: JSON.stringify(d) }, token),
  deleteTransaction: (id, token)   => request(`/transactions/${id}`, { method: "DELETE" }, token),
};
