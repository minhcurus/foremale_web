"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useUser } from "@/contexts/user-context"
import { MoreHorizontal, Eye, Trash2, Loader2, AlertCircle } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useRouter, useSearchParams } from "next/navigation"
import { User } from "@/types"

export function UsersManagement() {
  const { users, loading, error, fetchUserProfile, deleteUser, banUser, unbanUser } = useUser();
  
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [togglingUserId, setTogglingUserId] = useState<number | null>(null);
  
  const router = useRouter();
  const searchParams = useSearchParams();

  // SỬA LỖI: Quay lại logic useEffect chỉ phụ thuộc vào searchParams
  // useEffect này sẽ đồng bộ hóa trạng thái modal với URL, hữu ích khi F5 hoặc dùng nút back/forward
  useEffect(() => {
    const action = searchParams.get("action");
    const id = searchParams.get("id");

    // Điều kiện này ngăn việc fetch lại dữ liệu không cần thiết nếu một modal đã được mở bởi một hành động khác
    if (!selectedUser && !deleteId) {
      if (action === "view" && id) {
        // Không cần await ở đây vì useEffect không nên là async
        // fetchUserProfile sẽ tự cập nhật state bên trong hàm handleView
        handleView(Number(id));
      } else if (action === "delete" && id) {
        // Chỉ cần set state, không cần cập nhật URL vì nó đã có sẵn
        setDeleteId(Number(id));
      }
    }
  }, [searchParams]);

  const updateUrlWithAction = (action: string, id: number) => {
    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.set("action", action);
    newSearchParams.set("id", id.toString());
    // Dùng push để có thể dùng nút back của trình duyệt
    router.push(`/?${newSearchParams.toString()}`);
  };

  const handleView = async (id: number) => {
    updateUrlWithAction("view", id);
    const user = await fetchUserProfile(id);
    setSelectedUser(user || null);
  };

  const handleDeleteConfirm = (id: number) => {
    updateUrlWithAction("delete", id);
    setDeleteId(id);
  };

  const handleDelete = async () => {
    if (deleteId !== null) {
      await deleteUser(deleteId);
      handleClose(); // Đóng modal và reset URL
    }
  };
  
  // SỬA LỖI: Hàm handleClose giờ đây sẽ xóa các params trên URL
  const handleClose = () => {
    setSelectedUser(null);
    setDeleteId(null);
    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.delete("action");
    newSearchParams.delete("id");
    // Dùng replace để không tạo thêm một entry trong lịch sử trình duyệt
    router.replace(`/?${newSearchParams.toString()}`);
  };
  
  const handleStatusToggle = async (user: User) => {
    setTogglingUserId(user.userId);
    if (user.status === 'Active') {
      await banUser(user.userId);
    } else {
      await unbanUser(user.userId);
    }
    setTogglingUserId(null);
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
        <CardDescription>Manage and monitor user accounts</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" /><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription>
            </Alert>
        )}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User ID</TableHead>
              <TableHead>Full Name</TableHead>
              <TableHead>Date of Birth</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.userId}>
                <TableCell className="font-medium">{user.userId}</TableCell>
                <TableCell>{user.fullName}</TableCell>
                <TableCell>
                  {user.dateOfBirth.startsWith("0001-") ? "N/A" : new Date(user.dateOfBirth).toLocaleDateString('vi-VN')}
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id={`status-switch-${user.userId}`}
                      checked={user.status === 'Active'}
                      onCheckedChange={() => handleStatusToggle(user)}
                      disabled={togglingUserId === user.userId}
                    />
                    <Label htmlFor={`status-switch-${user.userId}`}>
                      {togglingUserId === user.userId ? <Loader2 className="h-4 w-4 animate-spin"/> : (user.status === 'Active' ? 'Active' : 'Banned')}
                    </Label>
                  </div>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleView(user.userId)}><Eye className="mr-2 h-4 w-4" />View</DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteConfirm(user.userId)}><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {selectedUser && (
           <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
           <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg w-full max-w-md">
             <h2 className="text-xl font-bold mb-4">User Details</h2>
             <div className="space-y-2 text-sm">
                <p><strong>ID:</strong> {selectedUser.userId}</p>
                <p><strong>Name:</strong> {selectedUser.fullName}</p>
                <p><strong>Email:</strong> {selectedUser.email}</p>
                <p><strong>Username:</strong> {selectedUser.userName}</p>
                <p><strong>Phone:</strong> {selectedUser.phoneNumber}</p>
                <p><strong>Address:</strong> {selectedUser.address}</p>
                <p><strong>DOB:</strong> {selectedUser.dateOfBirth.startsWith("0001-") ? "N/A" : new Date(selectedUser.dateOfBirth).toLocaleDateString('vi-VN')}</p>
                <p><strong>isActive:</strong> {selectedUser.isActive}</p>
                <p><strong>Premium User:</strong> {selectedUser.premiumPackageId ? 'Yes' : 'No'}</p>
             </div>
             <Button className="mt-6 w-full" onClick={handleClose}>Close</Button>
           </div>
         </div>
        )}
        {deleteId !== null && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg w-full max-w-md text-center">
            <h2 className="text-xl font-bold mb-4">Confirm Delete</h2>
            <p>Are you sure you want to delete this user? This action cannot be undone.</p>
            <div className="mt-6 flex justify-center space-x-4">
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