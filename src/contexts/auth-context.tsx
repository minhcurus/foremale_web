
"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import type { ReactNode } from "react"
import { User } from "@/types" // Import User interface from index.ts

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  getToken: () => string | null
  fetchUserData: (jwt: string) => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [token, setToken] = useState<string | null>(null)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    console.log("AuthProvider useEffect triggered - Checking localStorage for token");
    const storedToken = localStorage.getItem("jwt_token")
    if (storedToken) {
      console.log("Found stored token:", storedToken);
      setToken(storedToken)
      fetchUserData(storedToken)
    } else {
      console.log("No stored token found");
      setIsLoading(false)
    }

    // Handle browser back button
    const handlePopState = () => {
      if (token && pathname === "/login") {
        console.log("Preventing back to login, redirecting to dashboard");
        router.push("/")
      }
    }

    window.addEventListener("popstate", handlePopState)

    // Cleanup event listener
    return () => window.removeEventListener("popstate", handlePopState)
  }, [token, pathname, router])
  
  const fetchUserData = async (jwt: string): Promise<boolean> => {
    console.log("Fetching user data with JWT:", jwt);
    setIsLoading(true);
    try {
      const response = await fetch('/api/User/user-profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${jwt}`,
        },
      });
      console.log("Fetch response status:", response.status);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log("Fetched user data:", data);
      if (data.success && data.data) {
        setUser({
          userId: data.data.userId,
          fullName: data.data.fullName,
          email: data.data.email,
          userName: data.data.userName,
          phoneNumber: data.data.phoneNumber,
          address: data.data.address,
          premiumPackageId: data.data.premiumPackageId,
          status: data.data.status,
          role: data.data.role,
          dateOfBirth: data.data.dateOfBirth,
          imageUser: data.data.imageUser, // Adjusted to match API response
          imageBackground: data.data.imageBackground, // Adjusted to match API response
          description: data.data.description
        });
        console.log("User set to:", {
          email: data.data.email,
          fullName: data.data.fullName,
          role: data.data.role,
        });
        // Replace history state to prevent back navigation to login
        if (pathname === "/login") {
          window.history.replaceState(null, document.title, "/")
          router.push("/")
        }
        return true;
      } else {
        console.log("Fetch user data failed, no success or data in response");
        return false;
      }
    } catch (error) {
      console.error("Failed to fetch user data:", error);
      if (response.status === 401) {
        logout(); // Logout only on unauthorized
      }
      return false;
    } finally {
      setIsLoading(false);
      console.log("Fetch user data completed, isLoading set to false");
    }
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    console.log("Login attempt with email:", email, "and password length:", password.length);
    setIsLoading(true);
    try {
      const response = await fetch('/api/Auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      console.log("Login response status:", response.status);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log("Login response data:", data);
      if (data.success && data.data) {
        const jwt = data.data;
        console.log("Received JWT:", jwt);
        localStorage.setItem('jwt_token', jwt);
        setToken(jwt);
        await fetchUserData(jwt);
        if (user?.role === '1') {
          console.log("User is admin, redirecting to /");
          router.push('/');
        }
        return true;
      } else {
        setIsLoading(false);
        console.log("Login failed, no success or data in response");
        return false;
      }
    } catch (error) {
      console.error("Login error:", error);
      setIsLoading(false);
      return false;
    }
  }

  const logout = () => {
    console.log("Logout triggered");
    localStorage.removeItem("jwt_token")
    setToken(null)
    setUser(null)
    setIsLoading(false)
    router.push("/login")
  }

  const getToken = () => token

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, getToken, fetchUserData }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}