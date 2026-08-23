import "dotenv/config";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { hash } from "bcryptjs";
import {
  roles,
  users,
  userRoles,
  departments,
  securityShifts,
  locations,
} from "./schema";

async function seed() {
  const pool = mysql.createPool({ uri: process.env.DATABASE_URL! });
  const db = drizzle(pool, { mode: "default" });

  console.log("Seeding roles...");
  const roleData = [
    { name: "Security Officer", description: "Petugas patroli dan pemeriksaan barang" },
    { name: "Security Supervisor", description: "Memantau aktivitas dan memverifikasi laporan" },
    { name: "Chief Security", description: "Mengawasi keseluruhan operasional security" },
    { name: "Department Staff", description: "Mengajukan barang keluar" },
    { name: "Head of Department", description: "Memberikan persetujuan" },
    { name: "Receiving", description: "Mencatat penerimaan barang" },
    { name: "Purchasing", description: "Memantau pengiriman vendor" },
    { name: "Asset Officer", description: "Memeriksa barang berstatus aset hotel" },
    { name: "Management", description: "Melihat statistik dan laporan" },
    { name: "Administrator", description: "Mengelola pengguna dan konfigurasi" },
  ];

  for (const r of roleData) {
    await db.insert(roles).values(r).onDuplicateKeyUpdate({ set: { description: r.description } });
  }

  console.log("Seeding departments...");
  const deptData = [
    { code: "SEC", name: "Security", head: "Chief Security" },
    { code: "ENG", name: "Engineering", head: "Kadek W." },
    { code: "HKG", name: "Housekeeping", head: "Rini P." },
    { code: "FNB", name: "Food & Beverage", head: "Surya A." },
    { code: "FO", name: "Front Office", head: "Dewi L." },
    { code: "HRD", name: "Human Resources", head: "Ahmad R." },
    { code: "IT", name: "Information Technology", head: "Dimas K." },
    { code: "BQT", name: "Banquet", head: "Nina S." },
    { code: "SPA", name: "Spa & Wellness", head: "Nadia F." },
    { code: "FIN", name: "Finance", head: "Budiman T." },
  ];

  for (const d of deptData) {
    await db.insert(departments).values(d).onDuplicateKeyUpdate({ set: { name: d.name } });
  }

  console.log("Seeding security shifts...");
  const shiftData = [
    { name: "Pagi", startsAt: "06:00", endsAt: "14:00", lateToleranceMinutes: 10 },
    { name: "Siang", startsAt: "14:00", endsAt: "22:00", lateToleranceMinutes: 10 },
    { name: "Malam", startsAt: "22:00", endsAt: "06:00", lateToleranceMinutes: 15 },
  ];

  for (const s of shiftData) {
    await db.insert(securityShifts).values(s).onDuplicateKeyUpdate({ set: { startsAt: s.startsAt } });
  }

  console.log("Seeding locations...");
  const locationData = [
    { code: "LOC-LBY", name: "Lobby Utama", floor: "GF", areaType: "Publik" },
    { code: "LOC-B1", name: "Basement B1", floor: "B1", areaType: "Servis" },
    { code: "LOC-B2", name: "Basement B2", floor: "B2", areaType: "Servis" },
    { code: "LOC-POOL", name: "Pool & Garden", floor: "GF", areaType: "Publik" },
    { code: "LOC-RF", name: "Rooftop", floor: "RF", areaType: "Terbatas" },
    { code: "LOC-TWA", name: "Tower A Corridor", floor: "1-10", areaType: "Kamar" },
    { code: "LOC-RCV", name: "Receiving Dock", floor: "GF", areaType: "Servis" },
    { code: "LOC-BLR", name: "Ballroom", floor: "GF", areaType: "Event" },
  ];

  for (const l of locationData) {
    await db.insert(locations).values(l).onDuplicateKeyUpdate({ set: { name: l.name } });
  }

  console.log("Seeding users...");
  const passwordHash = await hash("password123", 12);

  const userData = [
    { name: "Admin HSOMS", email: "admin@hsoms.local", password: passwordHash, departmentCode: "SEC", roleName: "Administrator" },
    { name: "Ardi Pratama", email: "ardi@hsoms.local", password: passwordHash, departmentCode: "SEC", roleName: "Security Officer" },
    { name: "Maya Sari", email: "maya@hsoms.local", password: passwordHash, departmentCode: "SEC", roleName: "Security Supervisor" },
    { name: "Bima Putra", email: "bima@hsoms.local", password: passwordHash, departmentCode: "SEC", roleName: "Security Officer" },
    { name: "Dewi Lestari", email: "dewi@hsoms.local", password: passwordHash, departmentCode: "SEC", roleName: "Chief Security" },
    { name: "Siska Aulia", email: "siska@hsoms.local", password: passwordHash, departmentCode: "HKG", roleName: "Department Staff" },
    { name: "Rini P.", email: "rini@hsoms.local", password: passwordHash, departmentCode: "HKG", roleName: "Head of Department" },
    { name: "Rendy Mahesa", email: "rendy@hsoms.local", password: passwordHash, departmentCode: "ENG", roleName: "Department Staff" },
    { name: "Dimas K.", email: "dimas@hsoms.local", password: passwordHash, departmentCode: "IT", roleName: "Management" },
  ];

  const allRoles = await db.select().from(roles);
  const roleMap = new Map(allRoles.map((r) => [r.name, r.id]));

  for (const u of userData) {
    const [result] = await db
      .insert(users)
      .values({
        name: u.name,
        email: u.email,
        password: u.password,
        departmentCode: u.departmentCode,
      })
      .onDuplicateKeyUpdate({ set: { name: u.name } })
      .$returningId();

    const userId = result.id;
    const roleId = roleMap.get(u.roleName);

    if (roleId) {
      await db
        .insert(userRoles)
        .values({ userId, roleId })
        .onDuplicateKeyUpdate({ set: { roleId } });
    }
  }

  console.log("Seed completed!");
  console.log("\nDefault login credentials:");
  console.log("  Admin:    admin@hsoms.local / password123");
  console.log("  Officer:  ardi@hsoms.local  / password123");
  console.log("  Supervisor: maya@hsoms.local / password123");

  await pool.end();
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
