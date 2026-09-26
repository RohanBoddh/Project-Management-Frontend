// AuthContext.jsx
import { createContext, useState, useEffect } from "react";
import { getMe } from "../services/authService";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Logout function
  const logout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    setUser(null);
  };

  useEffect(() => {
    async function loadUser() {
      try {
        const token = sessionStorage.getItem("token");
        
        // FIX: If no token, don't try to load user
        if (!token) {
          setLoading(false);
          return;
        }

        const res = await getMe();
        const loggedUser = res.data;

        // Verify that the role from backend is correct
        console.log("Loaded user from backend:", loggedUser);

        setUser(loggedUser);
        sessionStorage.setItem("user", JSON.stringify(loggedUser));
      } catch (err) {
        console.error("Error loading user:", err);
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}