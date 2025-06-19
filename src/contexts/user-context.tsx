"use client";

import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { User } from "@/types";
import { useAuth } from "./auth-context";

interface UserContextType {
  users: User[];
  loading: boolean;
  error: string | null;
  fetchUsers: () => Promise<boolean>;
  fetchUserProfile: (id: number) => Promise<User | null>;
  updateUserProfile: (id: number, userData: Partial<User>) => Promise<boolean>;
  deleteUser: (id: number) => Promise<boolean>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getToken, user, isLoading: authLoading } = useAuth();

  const fetchUsers = async (): Promise<boolean> => {
    console.log("Fetching users...");
    setLoading(true);
    try {
      const token = getToken();
      if (!token) {
        throw new Error("No JWT token found");
      }
      console.log("Fetching users with token:", token);
      const response = await fetch("/api/User", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Fetch users response status:", response.status);
      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.status}`);
      }
      const data = await response.json();
      console.log("Fetched users data:", data);
      setUsers(data);
      setError(null);
      return true;
    } catch (err: any) {
      setError("Error fetching users: " + err.message);
      console.error("Error fetching users:", err);
      return false;
    } finally {
      setLoading(false);
      console.log("Fetch users completed, isLoading set to false");
    }
  };

  const fetchUserProfile = async (id: number): Promise<User | null> => {
    console.log(`Fetching user profile for id ${id}...`);
    setLoading(true);
    try {
      const token = getToken();
      if (!token) {
        throw new Error("No JWT token found");
      }
      console.log("Fetching user profile with token:", token);
      const response = await fetch(`/api/User/user-profile?id=${id}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      console.log("Fetch user profile response status:", response.status);
      if (!response.ok) {
        throw new Error(`Failed to fetch user profile: ${response.status}`);
      }
      const data = await response.json();
      console.log("Fetched user profile data:", data);
      if (data.success && data.data) {
        return data.data as User;
      }
      throw new Error("No success or data in response");
    } catch (err) {
      setError("Error fetching user profile");
      console.error("Error fetching user profile:", err);
      return null;
    } finally {
      setLoading(false);
      console.log("Fetch user profile completed, isLoading set to false");
    }
  };

  const updateUserProfile = async (id: number, userData: Partial<User>): Promise<boolean> => {
    console.log(`Updating user profile for id ${id}...`);
    setLoading(true);
    try {
      const token = getToken();
      if (!token) {
        throw new Error("No JWT token found");
      }
      console.log("Updating user profile with token:", token);
      const formData = new FormData();
      formData.append("UserId", id.toString());
      formData.append("FullName", userData.fullName || "");
      formData.append("Email", userData.email || "");
      formData.append("UserName", userData.userName || "");
      formData.append("PhoneNumber", userData.phoneNumber || "");
      formData.append("Address", userData.address || "");
      formData.append("DateOfBirth", userData.dateOfBirth || "");
      if (userData.imageUser) formData.append("Image_User", userData.imageUser as File);
      if (userData.imageBackground) formData.append("imageBackground", userData.imageBackground as File);
      formData.append("Description", userData.description || "");

      const response = await fetch(`/api/User/update-profile?id=${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      console.log("Update user profile response status:", response.status);
      if (!response.ok) {
        throw new Error(`Failed to update user profile: ${response.status}`);
      }
      const data = await response.json();
      console.log("Update user profile response data:", data);
      if (data.success) {
        await fetchUsers();
        setError(null);
        return true;
      }
      return false;
    } catch (err) {
      setError("Error updating user profile");
      console.error("Error updating user profile:", err);
      return false;
    } finally {
      setLoading(false);
      console.log("Update user profile completed, isLoading set to false");
    }
  };

  const deleteUser = async (id: number): Promise<boolean> => {
    console.log(`Deleting user with id ${id}...`);
    setLoading(true);
    try {
      const token = getToken();
      if (!token) {
        throw new Error("No JWT token found");
      }
      console.log("Deleting user with token:", token);
      const response = await fetch(`/api/User/delete-user?id=${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Delete user response status:", response.status);
      if (!response.ok) {
        throw new Error(`Failed to delete user: ${response.status}`);
      }
      const data = await response.json();
      console.log("Delete user response data:", data);
      if (data.success) {
        setUsers(users.filter((user) => user.userId !== id));
        setError(null);
        return true;
      }
      return false;
    } catch (err) {
      setError("Error deleting user");
      console.error("Error deleting user:", err);
      return false;
    } finally {
      setLoading(false);
      console.log("Delete user completed, isLoading set to false");
    }
  };

  useEffect(() => {
    if (user && !authLoading) {
      fetchUsers();
    } else {
      setLoading(false);
    }
  }, [user, authLoading]);

  return (
    <UserContext.Provider value={{ users, loading, error, fetchUsers, fetchUserProfile, updateUserProfile, deleteUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}