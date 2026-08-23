"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  createUser,
  createRole,
} from "@/app/actions/admin";
import { toast } from "sonner";

type Props = {
  roles: Array<{ id: number; name: string }>;
  departments: Array<{ code: string; name: string }>;
};

export function AdminCreateDialog({ roles, departments }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("user");
  const [selectedRoles, setSelectedRoles] = useState<number[]>([]);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    try {
      let result;

      if (activeTab === "user") {
        result = await createUser({
          name: formData.get("userName") as string,
          email: formData.get("userEmail") as string,
          password: formData.get("userPassword") as string,
          departmentCode: formData.get("userDept") as string,
          roleIds: selectedRoles,
        });
      } else {
        result = await createRole({
          name: formData.get("roleName") as string,
          description: formData.get("roleDesc") as string,
        });
      }

      if (result.success) {
        toast.success(result.message);
        setOpen(false);
        setSelectedRoles([]);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  function handleRoleToggle(roleId: number) {
    setSelectedRoles(prev =>
      prev.includes(roleId)
        ? prev.filter(id => id !== roleId)
        : [...prev, roleId]
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button>+ Tambah Data</Button>} />
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tambah Data Admin</DialogTitle>
          <DialogDescription>
            Tambah pengguna baru atau role ke sistem
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="user">Pengguna</TabsTrigger>
            <TabsTrigger value="role">Role</TabsTrigger>
          </TabsList>

          <form action={handleSubmit} className="space-y-4 mt-4">
            <TabsContent value="user" className="space-y-4">
              <div className="space-y-2">
                <Label>Nama Lengkap</Label>
                <Input name="userName" placeholder="Nama pengguna" required />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input name="userEmail" type="email" placeholder="user@hsoms.local" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Password</Label>
                  <Input name="userPassword" type="password" defaultValue="password123" required />
                </div>
                <div className="space-y-2">
                  <Label>Departemen</Label>
                  <Select name="userDept" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih departemen" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((d) => (
                        <SelectItem key={d.code} value={d.code}>
                          {d.code} - {d.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Role</Label>
                <div className="space-y-2">
                  {roles.map((role) => (
                    <div key={role.id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`role-${role.id}`}
                        checked={selectedRoles.includes(role.id)}
                        onChange={() => handleRoleToggle(role.id)}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor={`role-${role.id}`} className="cursor-pointer">
                        {role.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="role" className="space-y-4">
              <div className="space-y-2">
                <Label>Nama Role</Label>
                <Input name="roleName" placeholder="Security Officer, Department Staff" required />
              </div>
              <div className="space-y-2">
                <Label>Deskripsi</Label>
                <Textarea
                  name="roleDesc"
                  placeholder="Deskripsi tugas dan tanggung jawab role"
                  rows={3}
                />
              </div>
            </TabsContent>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => {
                setOpen(false);
                setSelectedRoles([]);
              }}>
                Batal
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Menyimpan..." : "Simpan"}
              </Button>
            </DialogFooter>
          </form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
