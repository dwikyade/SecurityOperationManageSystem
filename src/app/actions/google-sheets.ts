"use server";

import { google } from "googleapis";
import { db } from "@/db";
import { googleSyncConfig, googleSyncLogs, patrolRecords } from "@/db/schema";
import { eq } from "drizzle-orm";

function getGoogleAuth() {
  const credentials = {
    type: process.env.GOOGLE_SERVICE_ACCOUNT_TYPE || "service_account",
    project_id: process.env.GOOGLE_PROJECT_ID,
    private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    client_id: process.env.GOOGLE_CLIENT_ID,
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
  };

  return new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
}

export async function syncPatrolFromGoogleSheets(configId: number, executedBy: string) {
  try {
    const [config] = await db
      .select()
      .from(googleSyncConfig)
      .where(eq(googleSyncConfig.id, configId));

    if (!config) {
      return {
        success: false,
        message: "Konfigurasi sync tidak ditemukan",
      };
    }

    const auth = getGoogleAuth();
    const sheets = google.sheets({ version: "v4", auth });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: config.spreadsheetId,
      range: config.sheetName || "Sheet1",
    });

    const rows = response.data.values || [];
    let rowsRead = rows.length;
    let rowsSuccess = 0;
    let rowsFailed = 0;

    const columnMapping = config.columnMapping ? JSON.parse(config.columnMapping) : null;

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      try {
        const mapping = columnMapping || {
          patrolDate: 0,
          startTime: 1,
          officerName: 2,
          shift: 3,
          area: 4,
          checkpointTotal: 5,
          condition: 6,
        };

        const patrolDate = row[mapping.patrolDate] || "";
        const startTime = row[mapping.startTime] || "";
        const officerName = row[mapping.officerName] || "";
        const shift = row[mapping.shift] || "";
        const area = row[mapping.area] || "";
        const checkpointTotal = parseInt(row[mapping.checkpointTotal]) || 0;
        const condition = row[mapping.condition] || "Normal";

        if (!patrolDate || !officerName) {
          rowsFailed++;
          continue;
        }

        const number = `PTR-SYNC-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
        const googleResponseId = `ROW-${i}-${Date.now()}`;

        await db.insert(patrolRecords).values({
          number,
          patrolDate,
          startTime,
          officerName,
          shift,
          area,
          checkpointDone: 0,
          checkpointTotal,
          condition,
          source: "Google Sheets",
          googleResponseId,
          syncStatus: "Tersinkron",
          verificationStatus: "Menunggu Verifikasi",
        }).onDuplicateKeyUpdate({
          set: { syncStatus: "Tersinkron" },
        });

        rowsSuccess++;
      } catch {
        rowsFailed++;
      }
    }

    await db.insert(googleSyncLogs).values({
      configId,
      rowsRead,
      rowsSuccess,
      rowsFailed,
      message: `Sinkronisasi selesai: ${rowsSuccess} berhasil, ${rowsFailed} gagal`,
      executedBy,
    });

    await db
      .update(googleSyncConfig)
      .set({
        lastSyncAt: new Date(),
        lastSyncRowCount: rowsRead,
      })
      .where(eq(googleSyncConfig.id, configId));

    return {
      success: true,
      message: `Sinkronisasi selesai: ${rowsSuccess} data berhasil`,
      data: { rowsRead, rowsSuccess, rowsFailed },
    };
  } catch (error) {
    console.error("Error syncing from Google Sheets:", error);
    return {
      success: false,
      message: "Gagal sinkronisasi dari Google Sheets",
    };
  }
}

export async function getGoogleSheetsConfigs() {
  try {
    const configs = await db.select().from(googleSyncConfig);
    return {
      success: true,
      data: configs,
    };
  } catch (error) {
    console.error("Error getting configs:", error);
    return {
      success: false,
      message: "Gagal mengambil konfigurasi",
    };
  }
}

export async function getSyncLogs(configId?: number) {
  try {
    let logs;

    if (configId) {
      logs = await db
        .select()
        .from(googleSyncLogs)
        .where(eq(googleSyncLogs.configId, configId))
        .orderBy(googleSyncLogs.syncedAt);
    } else {
      logs = await db.select().from(googleSyncLogs);
    }

    return {
      success: true,
      data: logs,
    };
  } catch (error) {
    console.error("Error getting logs:", error);
    return {
      success: false,
      message: "Gagal mengambil log",
    };
  }
}
