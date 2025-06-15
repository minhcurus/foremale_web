
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useUser } from "@/contexts/user-context"
import { getStatusBadge } from "@/lib/utils"
import { MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface User {
  userId: number
  fullName: string
  email: string
  userName: string
  phoneNumber: string
  address: string
  dateOfBirth: string
  image_User: string | null
  background_Image: string | null
  description: string | null
  premiumPackageId: number | null
  premiumExpiryDate: string
}

export function UsersManagement() {
  const { users, loading, error, fetchUserProfile, updateUserProfile, deleteUser } = useUser()
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [editUser, setEditUser] = useState<User | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const handleView = async (id: number) => {
    const user = await fetchUserProfile(id)
    setSelectedUser(user)
  }

  const handleEdit = async (id: number) => {
    const user = await fetchUserProfile(id)
    if (user) setEditUser(user)
  }

  const handleDeleteConfirm = (id: number) => {
    setDeleteId(id)
  }

  const handleDelete = async () => {
    if (deleteId !== null) {
      const success = await deleteUser(deleteId)
      if (success) {
        setDeleteId(null)
        console.log("User deleted successfully")
      }
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (editUser) {
      const updatedData = {
        fullName: editUser.fullName,
        email: editUser.email,
        userName: editUser.userName,
        phoneNumber: editUser.phoneNumber,
        address: editUser.address,
        dateOfBirth: editUser.dateOfBirth,
        description: editUser.description,
      }
      const success = await updateUserProfile(editUser.userId, updatedData)
      if (success) {
        setEditUser(null)
        console.log("User updated successfully")
      }
    }
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
        <CardDescription>Manage and monitor user accounts</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Birth Date</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.userId}>
                <TableCell className="font-medium">{user.fullName}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge variant={getStatusBadge(user.premiumPackageId ? "Active" : "Inactive", "user")}>
                    {user.premiumPackageId ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell>{new Date(user.dateOfBirth).toLocaleDateString()}</TableCell>
                <TableCell>{user.phoneNumber}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleView(user.userId)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEdit(user.userId)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteConfirm(user.userId)}>
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
        {selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">User Details</h2>
              <div className="space-y-2">
                <p><strong>Name:</strong> {selectedUser.fullName}</p>
                <p><strong>Email:</strong> {selectedUser.email}</p>
                <p><strong>Username:</strong> {selectedUser.userName}</p>
                <p><strong>Phone:</strong> {selectedUser.phoneNumber}</p>
                <p><strong>Address:</strong> {selectedUser.address}</p>
                <p><strong>DOB:</strong> {new Date(selectedUser.dateOfBirth).toLocaleDateString()}</p>
                <p><strong>Status:</strong> {selectedUser.premiumPackageId ? "Active" : "Inactive"}</p>
                <p><strong>Description:</strong> {selectedUser.description || "N/A"}</p>
              </div>
              <Button className="mt-4" onClick={() => setSelectedUser(null)}>Close</Button>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {editUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Edit User</h2>
              <form onSubmit={handleUpdate} className="space-y-4">
                <input
                  type="text"
                  value={editUser.fullName}
                  onChange={(e) => setEditUser({ ...editUser, fullName: e.target.value })}
                  className="w-full p-2 border rounded"
                  placeholder="Full Name"
                />
                <input
                  type="email"
                  value={editUser.email}
                  onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                  className="w-full p-2 border rounded"
                  placeholder="Email"
                />
                <input
                  type="text"
                  value={editUser.userName}
                  onChange={(e) => setEditUser({ ...editUser, userName: e.target.value })}
                  className="w-full p-2 border rounded"
                  placeholder="Username"
                />
                <input
                  type="text"
                  value={editUser.phoneNumber}
                  onChange={(e) => setEditUser({ ...editUser, phoneNumber: e.target.value })}
                  className="w-full p-2 border rounded"
                  placeholder="Phone Number"
                />
                <input
                  type="text"
                  value={editUser.address}
                  onChange={(e) => setEditUser({ ...editUser, address: e.target.value })}
                  className="w-full p-2 border rounded"
                  placeholder="Address"
                />
                <input
                  type="date"
                  value={editUser.dateOfBirth}
                  onChange={(e) => setEditUser({ ...editUser, dateOfBirth: e.target.value })}
                  className="w-full p-2 border rounded"
                />
                <textarea
                  value={editUser.description || ""}
                  onChange={(e) => setEditUser({ ...editUser, description: e.target.value })}
                  className="w-full p-2 border rounded"
                  placeholder="Description"
                />
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setEditUser(null)}>Cancel</Button>
                  <Button type="submit">Save</Button>
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
              <p>Are you sure you want to delete this user? This action cannot be undone.</p>
              <div className="mt-4 flex justify-center space-x-2">
                <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
                <Button variant="destructive" onClick={handleDelete}>Delete</Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}