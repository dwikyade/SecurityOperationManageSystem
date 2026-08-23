"use server";

import { db } from "@/db";
import { users, roles, userRoles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { hash } from "bcryptjs";

export async function createUser(data: {
  name: string;
  email: string;
  password: string;
  departmentCode: string;
  roleIds: number[];
}) {
  try {
    const passwordHash = await hash(data.password, 12);

    const [result] = await db.insert(users).values({
      name: data.name,
      email: data.email,
      password: passwordHash,
      departmentCode: data.departmentCode,
      status: "Aktif",
    }).$returningId();

    const userId = result.id;

    for (const roleId of data.roleIds) {
      await db.insert(userRoles).values({
        userId,
        roleId,
      });
    }

    return {
      success: true,
      message: "Pengguna berhasil ditambahkan",
    };
  } catch (error) {
    console.error("Error creating user:", error);
    return {
      success: false,
      message: "Gagal menambahkan pengguna",
    };
  }
}

export async function createRole(data: {
  name: string;
  description?: string;
}) {
  try {
    await db.insert(roles).values({
      name: data.name,
      description: data.description,
    });

    return {
      success: true,
      message: "Role berhasil ditambahkan",
    };
  } catch (error) {
    console.error("Error creating role:", error);
    return {
      success: false,
      message: "Gagal menambahkan role",
    };
  }
}
