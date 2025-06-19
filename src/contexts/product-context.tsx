
"use client";

import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Product } from "@/types"; // Assuming Product interface is in index.ts

interface ProductContextType {
  products: Product[];
  loading: boolean;
  error: string | null;
  fetchProducts: () => Promise<boolean>;
  fetchProductDetail: (productId: string) => Promise<Product | null>;
  createProduct: (productData: FormData) => Promise<boolean>;
  updateProduct: (productId: string, productData: FormData) => Promise<boolean>;
  deleteProduct: (productId: string) => Promise<boolean>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export function ProductProvider({ children }: { children: ReactNode }) {
  const { getToken } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async (): Promise<boolean> => {
    console.log("Fetching products...");
    setLoading(true);
    try {
      const token = getToken();
      console.log("Fetching products with token:", token);
      const response = await fetch("/api/Products", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Fetch products response status:", response.status);
      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.status}`);
      }
      const data = await response.json();
      console.log("Fetched products data:", data);
      setProducts(data);
      setError(null);
      return true;
    } catch (err) {
      setError("Error fetching products");
      console.error("Error fetching products:", err);
      return false;
    } finally {
      setLoading(false);
      console.log("Fetch products completed, isLoading set to false");
    }
  };

  const fetchProductDetail = async (productId: string): Promise<Product | null> => {
    console.log(`Fetching product detail for id ${productId}...`);
    setLoading(true);
    try {
      const token = getToken();
      console.log("Fetching product detail with token:", token);
      const response = await fetch(`/api/Products/${productId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Fetch product detail response status:", response.status);
      if (!response.ok) {
        throw new Error(`Failed to fetch product detail: ${response.status}`);
      }
      const data = await response.json();
      console.log("Fetched product detail data:", data);
      return data as Product;
    } catch (err) {
      setError("Error fetching product detail");
      console.error("Error fetching product detail:", err);
      return null;
    } finally {
      setLoading(false);
      console.log("Fetch product detail completed, isLoading set to false");
    }
  };

  const createProduct = async (productData: FormData): Promise<boolean> => {
    console.log("Creating product...");
    setLoading(true);
    try {
      const token = getToken();
      console.log("Creating product with token:", token);
      const response = await fetch("/api/Products", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: productData,
      });
      console.log("Create product response status:", response.status);
      if (!response.ok) {
        throw new Error(`Failed to create product: ${response.status}`);
      }
      const data = await response.json();
      console.log("Created product response data:", data);
      if (data) {
        await fetchProducts(); // Refresh product list
        setError(null);
        return true;
      }
      return false;
    } catch (err) {
      setError("Error creating product");
      console.error("Error creating product:", err);
      return false;
    } finally {
      setLoading(false);
      console.log("Create product completed, isLoading set to false");
    }
  };

  const updateProduct = async (productId: string, productData: FormData): Promise<boolean> => {
    console.log(`Updating product with id ${productId}...`);
    setLoading(true);
    try {
      const token = getToken();
      console.log("Updating product with token:", token);
      const response = await fetch(`/api/Products/${productId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: productData,
      });
      console.log("Update product response status:", response.status);
      if (!response.ok) {
        throw new Error(`Failed to update product: ${response.status}`);
      }
      const data = await response.json();
      console.log("Updated product response data:", data);
      if (data.success || data.message) {
        await fetchProducts(); // Refresh product list
        setError(null);
        return true;
      }
      return false;
    } catch (err) {
      setError("Error updating product");
      console.error("Error updating product:", err);
      return false;
    } finally {
      setLoading(false);
      console.log("Update product completed, isLoading set to false");
    }
  };

  const deleteProduct = async (productId: string): Promise<boolean> => {
    console.log(`Deleting product with id ${productId}...`);
    setLoading(true);
    try {
      const token = getToken();
      console.log("Deleting product with token:", token);
      const response = await fetch(`/api/Products/${productId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Delete product response status:", response.status);
      if (!response.ok) {
        throw new Error(`Failed to delete product: ${response.status}`);
      }
      const data = await response.json();
      console.log("Deleted product response data:", data);
      if (data.message) {
        setProducts(products.filter((product) => product.productId !== productId));
        setError(null);
        return true;
      }
      return false;
    } catch (err) {
      setError("Error deleting product");
      console.error("Error deleting product:", err);
      return false;
    } finally {
      setLoading(false);
      console.log("Delete product completed, isLoading set to false");
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <ProductContext.Provider value={{ products, loading, error, fetchProducts, fetchProductDetail, createProduct, updateProduct, deleteProduct }}>
      {children}
    </ProductContext.Provider>
  );
}

export function useProduct() {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error("useProduct must be used within a ProductProvider");
  }
  return context;
}