"use server";

import { db } from "@/db";
import { departments, locations, vendors, goodsCategories } from "@/db/schema";

export async function createDepartment(data: {
  code: string;
  name: string;
  head: string;
}) {
  try {
    await db.insert(departments).values({
      code: data.code.toUpperCase(),
      name: data.name,
      head: data.head,
      status: "Aktif",
    });

    return {
      success: true,
      message: "Departemen berhasil ditambahkan",
    };
  } catch (error) {
    console.error("Error creating department:", error);
    return {
      success: false,
      message: "Gagal menambahkan departemen",
    };
  }
}

export async function createLocation(data: {
  code: string;
  name: string;
  floor: string;
  areaType: string;
}) {
  try {
    await db.insert(locations).values({
      code: data.code.toUpperCase(),
      name: data.name,
      floor: data.floor,
      areaType: data.areaType,
      status: "Aktif",
    });

    return {
      success: true,
      message: "Lokasi berhasil ditambahkan",
    };
  } catch (error) {
    console.error("Error creating location:", error);
    return {
      success: false,
      message: "Gagal menambahkan lokasi",
    };
  }
}

export async function createVendor(data: {
  code: string;
  name: string;
  address?: string;
  contact: string;
  email: string;
  serviceType: string;
}) {
  try {
    await db.insert(vendors).values({
      code: data.code.toUpperCase(),
      name: data.name,
      address: data.address,
      contact: data.contact,
      email: data.email,
      serviceType: data.serviceType,
      status: "Aktif",
    });

    return {
      success: true,
      message: "Vendor berhasil ditambahkan",
    };
  } catch (error) {
    console.error("Error creating vendor:", error);
    return {
      success: false,
      message: "Gagal menambahkan vendor",
    };
  }
}

export async function createGoodsCategory(data: {
  code: string;
  name: string;
  requiresAssetApproval: boolean;
  requiresSerialNumber: boolean;
}) {
  try {
    await db.insert(goodsCategories).values({
      code: data.code.toUpperCase(),
      name: data.name,
      requiresAssetApproval: data.requiresAssetApproval,
      requiresSerialNumber: data.requiresSerialNumber,
      status: "Aktif",
    });

    return {
      success: true,
      message: "Kategori barang berhasil ditambahkan",
    };
  } catch (error) {
    console.error("Error creating goods category:", error);
    return {
      success: false,
      message: "Gagal menambahkan kategori barang",
    };
  }
}
