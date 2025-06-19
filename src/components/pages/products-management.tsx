"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useProduct } from "@/contexts/product-context"
import { getStatusBadge } from "@/lib/utils"
import { MoreHorizontal, Eye, Edit, Trash2, Plus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Product } from "@/types"

export function ProductsManagement() {
  const { products, loading, error, fetchProductDetail, createProduct, updateProduct, deleteProduct } = useProduct()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [editProduct, setEditProduct] = useState<Product | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [createMode, setCreateMode] = useState(false)

  useEffect(() => {
    const action = searchParams.get("action")
    const id = searchParams.get("id")
    if (!selectedProduct && !editProduct && !deleteId && !createMode) {
      if (action === "view" && id) {
        handleView(id)
      } else if (action === "edit" && id) {
        handleEdit(id)
      } else if (action === "delete" && id) {
        handleDeleteConfirm(id)
      } else if (action === "create") {
        handleCreate()
      }
    }
  }, [searchParams])

  const handleView = async (id: string) => {
    const product = await fetchProductDetail(id)
    setSelectedProduct(product || null)
    const newSearchParams = new URLSearchParams(searchParams)
    newSearchParams.set("tab", "products")
    newSearchParams.set("action", "view")
    newSearchParams.set("id", id)
    router.push(`/?${newSearchParams.toString()}`)
  }

  const handleEdit = async (id: string) => {
    const product = await fetchProductDetail(id)
    if (product) {
      setEditProduct(product)
      const newSearchParams = new URLSearchParams(searchParams)
      newSearchParams.set("tab", "products")
      newSearchParams.set("action", "edit")
      newSearchParams.set("id", id)
      router.push(`/?${newSearchParams.toString()}`)
    }
  }

  const handleDeleteConfirm = (id: string) => {
    setDeleteId(id)
    const newSearchParams = new URLSearchParams(searchParams)
    newSearchParams.set("tab", "products")
    newSearchParams.set("action", "delete")
    newSearchParams.set("id", id)
    router.push(`/?${newSearchParams.toString()}`)
  }

  const handleDelete = async () => {
    if (deleteId !== null) {
      const success = await deleteProduct(deleteId)
      if (success) {
        setDeleteId(null)
        const newSearchParams = new URLSearchParams()
        newSearchParams.set("tab", "products")
        router.replace(`/?${newSearchParams.toString()}`)
        console.log("Product deleted successfully")
      }
    }
  }

  const handleCreate = () => {
    setEditProduct({
      productId: "",
      name: "",
      price: 0,
      brand: "",
      color: "",
      imageURL: "",
      description: "",
      style: "",
      category: "",
      material: "",
      type: "",
    })
    setCreateMode(true)
    const newSearchParams = new URLSearchParams(searchParams)
    newSearchParams.set("tab", "products")
    newSearchParams.set("action", "create")
    router.push(`/?${newSearchParams.toString()}`)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (editProduct) {
      const formData = new FormData()
      formData.append("Name", editProduct.name)
      formData.append("Price", editProduct.price.toString())
      formData.append("BrandId", "1") // Placeholder, adjust as needed
      formData.append("ColorId", "1") // Placeholder, adjust as needed
      formData.append("ImageFile", editProduct.imageURL ? new File([], editProduct.imageURL) : new File([], "")) // Placeholder for file
      formData.append("Description", editProduct.description || "")
      formData.append("StyleId", "1") // Placeholder, adjust as needed
      formData.append("CategoryId", "1") // Placeholder, adjust as needed
      formData.append("MaterialId", "1") // Placeholder, adjust as needed
      formData.append("TypeId", "1") // Placeholder, adjust as needed

      let success: boolean
      if (createMode) {
        success = await createProduct(formData)
      } else {
        success = await updateProduct(editProduct.productId, formData)
      }
      if (success) {
        setEditProduct(null)
        setCreateMode(false)
        const newSearchParams = new URLSearchParams()
        newSearchParams.set("tab", "products")
        router.replace(`/?${newSearchParams.toString()}`)
        console.log(createMode ? "Product created successfully" : "Product updated successfully")
      }
    }
  }

  const handleClose = () => {
    setSelectedProduct(null)
    setEditProduct(null)
    setDeleteId(null)
    setCreateMode(false)
    const newSearchParams = new URLSearchParams()
    newSearchParams.set("tab", "products")
    router.replace(`/?${newSearchParams.toString()}`)
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <Card>
      <CardHeader>
        <CardTitle>Product Management</CardTitle>
        <CardDescription>Manage your product inventory</CardDescription>
        <Button className="mt-4" onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" /> Create Product
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Brand</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.productId}>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>{product.category}</TableCell>
                <TableCell>${product.price.toFixed(2)}</TableCell>
                <TableCell>{product.brand}</TableCell>
                <TableCell>
                  <Badge variant={getStatusBadge("Active", "product")}>Active</Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleView(product.productId)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEdit(product.productId)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteConfirm(product.productId)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* View Modal */}
        {selectedProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Product Details</h2>
              <div className="space-y-2">
                <p><strong>Name:</strong> {selectedProduct.name}</p>
                <p><strong>Category:</strong> {selectedProduct.category}</p>
                <p><strong>Price:</strong> ${selectedProduct.price.toFixed(2)}</p>
                <p><strong>Brand:</strong> {selectedProduct.brand}</p>
                <p><strong>Color:</strong> {selectedProduct.color}</p>
                <p><strong>Description:</strong> {selectedProduct.description || "N/A"}</p>
              </div>
              <Button className="mt-4" onClick={handleClose}>Close</Button>
            </div>
          </div>
        )}

        {/* Create/Edit Modal */}
        {(editProduct || createMode) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">{createMode ? "Create Product" : "Edit Product"}</h2>
              <form onSubmit={handleSave} className="space-y-4">
                <input
                  type="text"
                  value={editProduct?.name || ""}
                  onChange={(e) => setEditProduct({ ...editProduct!, name: e.target.value })}
                  className="w-full p-2 border rounded"
                  placeholder="Name"
                  required
                />
                <input
                  type="number"
                  value={editProduct?.price || 0}
                  onChange={(e) => setEditProduct({ ...editProduct!, price: parseFloat(e.target.value) || 0 })}
                  className="w-full p-2 border rounded"
                  placeholder="Price"
                  required
                />
                <input
                  type="text"
                  value={editProduct?.brand || ""}
                  onChange={(e) => setEditProduct({ ...editProduct!, brand: e.target.value })}
                  className="w-full p-2 border rounded"
                  placeholder="Brand"
                  required
                />
                <input
                  type="text"
                  value={editProduct?.color || ""}
                  onChange={(e) => setEditProduct({ ...editProduct!, color: e.target.value })}
                  className="w-full p-2 border rounded"
                  placeholder="Color"
                  required
                />
                <textarea
                  value={editProduct?.description || ""}
                  onChange={(e) => setEditProduct({ ...editProduct!, description: e.target.value })}
                  className="w-full p-2 border rounded"
                  placeholder="Description"
                />
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={handleClose}>Cancel</Button>
                  <Button type="submit">{createMode ? "Create" : "Save"}</Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Popup */}
        {deleteId !== null && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md text-center">
              <h2 className="text-xl font-bold mb-4">Confirm Delete</h2>
              <p>Are you sure you want to delete this product? This action cannot be undone.</p>
              <div className="mt-4 flex justify-center space-x-2">
                <Button variant="outline" onClick={handleClose}>Cancel</Button>
                <Button variant="destructive" onClick={handleDelete}>Delete</Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}