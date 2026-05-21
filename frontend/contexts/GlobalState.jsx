import { createContext, useCallback, useEffect, useState, useContext } from "react";
import { api } from "../services/api";
import { AuthContext } from "./AuthContext";

export const MoneyContext = createContext();

export default function GlobalState({ children }) {
  const { token, isAuthenticated } = useContext(AuthContext);
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories]     = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);

  const refresh = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const [cats, txs] = await Promise.all([
        api.listCategories(token),
        api.listTransactions(token),
      ]);
      setCategories(cats);
      setTransactions(txs);
    } catch (e) {
      setError(e.message ?? "Falha ao carregar dados do servidor");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (isAuthenticated) {
      refresh();
    } else {
      setTransactions([]);
      setCategories([]);
    }
  }, [isAuthenticated, refresh]);

  const addTransaction = useCallback(async (data) => {
    const tx = await api.createTransaction(data, token);
    setTransactions((prev) => [tx, ...prev]);
    return tx;
  }, [token]);

  const removeTransaction = useCallback(async (id) => {
    await api.deleteTransaction(id, token);
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  }, [token]);

  const addCategory = useCallback(async (data) => {
    const cat = await api.createCategory(data, token);
    setCategories((prev) =>
      [...prev, cat].sort((a, b) => a.displayName.localeCompare(b.displayName))
    );
    return cat;
  }, [token]);

  const removeCategory = useCallback(async (id) => {
    await api.deleteCategory(id, token);
    setCategories((prev) => prev.filter((c) => c.id !== id));
  }, [token]);

  return (
    <MoneyContext.Provider
      value={{
        transactions,
        categories,
        loading,
        error,
        refresh,
        addTransaction,
        removeTransaction,
        addCategory,
        removeCategory,
      }}
    >
      {children}
    </MoneyContext.Provider>
  );
}
