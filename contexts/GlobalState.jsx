import AsyncStorage from "@react-native-async-storage/async-storage"
import { createContext, useEffect, useState } from "react"

export const MoneyContext = createContext()

const LEGACY_CATEGORY_MAP = {
  "Renda": "income",
  "Alimentação": "food",
  "Casa": "house",
  "Educação": "education",
  "Viagens": "travel",
}

const migrateLegacyCategory = (tx) => {
  const mapped = LEGACY_CATEGORY_MAP[tx.category]
  return mapped ? { ...tx, category: mapped } : tx
}

export default function GlobalState({ children }) {
  const [transactions, setTransactions] = useState([])

  useEffect(() => {
    const getAsyncStorage = async () => {
      try {
        const storedTransactions = await AsyncStorage.getItem("transactions")
        if (storedTransactions) {
          const parsed = JSON.parse(storedTransactions).map(migrateLegacyCategory)
          setTransactions(parsed)
        }
      } catch (e) {
        console.log(e)
      }
    }
    getAsyncStorage()
  }, [])

  return (
    <MoneyContext.Provider value={[transactions, setTransactions]}>
      {children}
    </MoneyContext.Provider>
  )
}
