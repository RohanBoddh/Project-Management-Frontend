// AuthContext.jsx

import { createContext, useState, useEffect } from "react";
import { getMe } from "../services/authService";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ================= LOGOUT =================
  const logout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    setUser(null);
  };

  // ================= LOAD CURRENT USER =================
  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = sessionStorage.getItem("token");

        if (!token) {
          setLoading(false);
          return;
        }

        const response = await getMe();

        console.log("GET ME RESPONSE:", response.data);

        // Backend response:
        // {
        //   success: true,
        //   user: {...}
        // }

        const loggedUser = response.data?.user;

        if (!loggedUser) {
          throw new Error("Invalid user response from server");
        }

        const normalizedUser = {
          ...loggedUser,
          role: String(loggedUser.role || "")
            .toLowerCase()
            .trim(),
        };

        console.log(
          "CURRENT USER:",
          normalizedUser
        );

        setUser(normalizedUser);

        sessionStorage.setItem(
          "user",
          JSON.stringify(normalizedUser)
        );
      } catch (error) {
        console.error(
          "ERROR LOADING USER:",
          error
        );

        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");

        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}