import {
  mysqlTable,
  varchar,
  text,
  int,
  boolean,
  timestamp,
  uniqueIndex,
  index,
} from "drizzle-orm/mysql-core";

export const roles = mysqlTable("roles", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const users = mysqlTable(
  "users",
  {
    id: int("id").primaryKey().autoincrement(),
    name: varchar("name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    password: varchar("password", { length: 255 }).notNull(),
    departmentCode: varchar("department_code", { length: 20 }),
    status: varchar("status", { length: 20 }).notNull().default("Aktif"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
  },
  (table) => ({
    emailIdx: uniqueIndex("users_email_idx").on(table.email),
  })
);

export const userRoles = mysqlTable(
  "user_roles",
  {
    id: int("id").primaryKey().autoincrement(),
    userId: int("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    roleId: int("role_id")
      .notNull()
      .references(() => roles.id, { onDelete: "cascade" }),
  },
  (table) => ({
    userRoleIdx: uniqueIndex("user_roles_idx").on(table.userId, table.roleId),
  })
);

export const departments = mysqlTable(
  "departments",
  {
    code: varchar("code", { length: 20 }).primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    head: varchar("head", { length: 255 }).notNull(),
    status: varchar("status", { length: 20 }).notNull().default("Aktif"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    statusIdx: index("departments_status_idx").on(table.status),
  })
);

export const locations = mysqlTable(
  "locations",
  {
    code: varchar("code", { length: 20 }).primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    floor: varchar("floor", { length: 20 }).notNull(),
    areaType: varchar("area_type", { length: 100 }).notNull(),
    status: varchar("status", { length: 20 }).notNull().default("Aktif"),
  },
  (table) => ({
    floorIdx: index("locations_floor_idx").on(table.floor),
  })
);

export const securityShifts = mysqlTable("security_shifts", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  startsAt: varchar("starts_at", { length: 10 }).notNull(),
  endsAt: varchar("ends_at", { length: 10 }).notNull(),
  lateToleranceMinutes: int("late_tolerance_minutes").notNull().default(10),
  status: varchar("status", { length: 20 }).notNull().default("Aktif"),
});

export const vendors = mysqlTable("vendors", {
  code: varchar("code", { length: 20 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  address: text("address"),
  contact: varchar("contact", { length: 100 }).notNull().default(""),
  email: varchar("email", { length: 255 }).notNull().default(""),
  serviceType: varchar("service_type", { length: 100 }).notNull().default(""),
  status: varchar("status", { length: 20 }).notNull().default("Aktif"),
});

export const goodsCategories = mysqlTable("goods_categories", {
  code: varchar("code", { length: 20 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  requiresAssetApproval: boolean("requires_asset_approval")
    .notNull()
    .default(false),
  requiresSerialNumber: boolean("requires_serial_number")
    .notNull()
    .default(false),
  status: varchar("status", { length: 20 }).notNull().default("Aktif"),
});

export const checkpoints = mysqlTable(
  "checkpoints",
  {
    code: varchar("code", { length: 20 }).primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    locationCode: varchar("location_code", { length: 20 }).references(
      () => locations.code
    ),
    floor: varchar("floor", { length: 20 }).notNull(),
    description: text("description"),
    frequency: varchar("frequency", { length: 50 })
      .notNull()
      .default("Setiap shift"),
    shift: varchar("shift", { length: 50 }).notNull(),
    patrolOrder: int("patrol_order").notNull().default(1),
    qrToken: varchar("qr_token", { length: 255 }).notNull(),
    status: varchar("status", { length: 20 }).notNull().default("Aktif"),
  },
  (table) => ({
    shiftIdx: index("checkpoints_shift_idx").on(table.shift),
  })
);

export const patrolRecords = mysqlTable(
  "patrol_records",
  {
    number: varchar("number", { length: 30 }).primaryKey(),
    patrolDate: varchar("patrol_date", { length: 10 }).notNull(),
    startTime: varchar("start_time", { length: 10 }).notNull(),
    endTime: varchar("end_time", { length: 10 }),
    officerId: int("officer_id").references(() => users.id),
    officerName: varchar("officer_name", { length: 255 }).notNull(),
    shift: varchar("shift", { length: 50 }).notNull(),
    area: varchar("area", { length: 255 }).notNull(),
    checkpointDone: int("checkpoint_done").notNull().default(0),
    checkpointTotal: int("checkpoint_total").notNull().default(0),
    condition: varchar("condition", { length: 100 })
      .notNull()
      .default("Normal"),
    source: varchar("source", { length: 50 })
      .notNull()
      .default("Google Form"),
    googleResponseId: varchar("google_response_id", { length: 255 }),
    dataHash: varchar("data_hash", { length: 255 }),
    syncStatus: varchar("sync_status", { length: 50 })
      .notNull()
      .default("Belum Disinkronkan"),
    verificationStatus: varchar("verification_status", { length: 50 })
      .notNull()
      .default("Menunggu Verifikasi"),
    supervisorNote: text("supervisor_note"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    dateIdx: index("patrol_records_date_idx").on(table.patrolDate),
    responseIdx: uniqueIndex("patrol_records_response_idx").on(
      table.googleResponseId
    ),
  })
);

export const patrolFindings = mysqlTable(
  "patrol_findings",
  {
    number: varchar("number", { length: 30 }).primaryKey(),
    patrolNumber: varchar("patrol_number", { length: 30 }).references(
      () => patrolRecords.number
    ),
    title: varchar("title", { length: 500 }).notNull(),
    foundAt: varchar("found_at", { length: 30 }).notNull(),
    reporter: varchar("reporter", { length: 255 }).notNull(),
    location: varchar("location", { length: 255 }).notNull(),
    category: varchar("category", { length: 100 }).notNull(),
    priority: varchar("priority", { length: 20 }).notNull(),
    ownerDepartment: varchar("owner_department", { length: 100 }).notNull(),
    ownerName: varchar("owner_name", { length: 255 }).notNull().default(""),
    targetResolutionAt: varchar("target_resolution_at", {
      length: 30,
    }).notNull(),
    status: varchar("status", { length: 50 }).notNull(),
    progress: int("progress").notNull().default(0),
    initialAction: text("initial_action"),
    closingNote: text("closing_note"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    statusIdx: index("patrol_findings_status_idx").on(table.status),
    priorityIdx: index("patrol_findings_priority_idx").on(table.priority),
  })
);

export const findingFollowUps = mysqlTable("finding_follow_ups", {
  id: int("id").primaryKey().autoincrement(),
  activityNumber: varchar("activity_number", { length: 30 }).notNull().unique(),
  findingNumber: varchar("finding_number", { length: 30 })
    .notNull()
    .references(() => patrolFindings.number),
  actor: varchar("actor", { length: 255 }).notNull(),
  department: varchar("department", { length: 100 }).notNull(),
  note: text("note").notNull(),
  statusBefore: varchar("status_before", { length: 50 }).notNull(),
  statusAfter: varchar("status_after", { length: 50 }).notNull(),
  completionPercent: int("completion_percent").notNull().default(0),
  verifier: varchar("verifier", { length: 255 }).notNull().default(""),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const incomingGoods = mysqlTable(
  "incoming_goods",
  {
    number: varchar("number", { length: 30 }).primaryKey(),
    receivedAt: varchar("received_at", { length: 30 }).notNull(),
    carrierName: varchar("carrier_name", { length: 255 }).notNull(),
    carrierType: varchar("carrier_type", { length: 100 }).notNull(),
    vendorName: varchar("vendor_name", { length: 255 }).notNull().default(""),
    phone: varchar("phone", { length: 30 }).notNull().default(""),
    vehicleNumber: varchar("vehicle_number", { length: 30 })
      .notNull()
      .default(""),
    vehicleType: varchar("vehicle_type", { length: 50 }).notNull().default(""),
    department: varchar("department", { length: 100 }).notNull(),
    receiver: varchar("receiver", { length: 255 }).notNull(),
    deliveryNoteNumber: varchar("delivery_note_number", { length: 100 })
      .notNull()
      .default(""),
    purchaseOrderNumber: varchar("purchase_order_number", { length: 100 })
      .notNull()
      .default(""),
    securityChecker: varchar("security_checker", { length: 255 }).notNull(),
    notes: text("notes"),
    status: varchar("status", { length: 50 }).notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    receivedAtIdx: index("incoming_goods_received_at_idx").on(table.receivedAt),
  })
);

export const incomingGoodsItems = mysqlTable("incoming_goods_items", {
  id: int("id").primaryKey().autoincrement(),
  incomingNumber: varchar("incoming_number", { length: 30 })
    .notNull()
    .references(() => incomingGoods.number),
  name: varchar("name", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  description: text("description"),
  quantity: int("quantity").notNull(),
  unit: varchar("unit", { length: 50 }).notNull(),
  condition: varchar("condition", { length: 50 }).notNull(),
  serialNumber: varchar("serial_number", { length: 100 }).notNull().default(""),
  assetCode: varchar("asset_code", { length: 100 }).notNull().default(""),
  ownership: varchar("ownership", { length: 100 }).notNull().default("Hotel"),
  notes: text("notes"),
});

export const outgoingGoods = mysqlTable(
  "outgoing_goods",
  {
    number: varchar("number", { length: 30 }).primaryKey(),
    requestedAt: varchar("requested_at", { length: 30 }).notNull(),
    applicantId: int("applicant_id").references(() => users.id),
    applicantName: varchar("applicant_name", { length: 255 }).notNull(),
    department: varchar("department", { length: 100 }).notNull(),
    movementType: varchar("movement_type", { length: 50 }).notNull(),
    purpose: varchar("purpose", { length: 500 }).notNull(),
    reason: text("reason"),
    carrierName: varchar("carrier_name", { length: 255 }).notNull(),
    carrierIdentity: varchar("carrier_identity", { length: 100 })
      .notNull()
      .default(""),
    vehicleNumber: varchar("vehicle_number", { length: 30 })
      .notNull()
      .default(""),
    destination: varchar("destination", { length: 255 }).notNull().default(""),
    exitDate: varchar("exit_date", { length: 10 }).notNull(),
    plannedReturnDate: varchar("planned_return_date", { length: 10 }),
    status: varchar("status", { length: 50 }).notNull(),
    gatePassStatus: varchar("gate_pass_status", { length: 50 })
      .notNull()
      .default("Belum Aktif"),
    itemCount: int("item_count").notNull().default(0),
    risk: varchar("risk", { length: 50 }).notNull().default("Non-Aset"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    statusIdx: index("outgoing_goods_status_idx").on(table.status),
    departmentIdx: index("outgoing_goods_department_idx").on(table.department),
  })
);

export const outgoingGoodsItems = mysqlTable("outgoing_goods_items", {
  id: int("id").primaryKey().autoincrement(),
  outgoingNumber: varchar("outgoing_number", { length: 30 })
    .notNull()
    .references(() => outgoingGoods.number),
  name: varchar("name", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  assetCode: varchar("asset_code", { length: 100 }).notNull().default(""),
  serialNumber: varchar("serial_number", { length: 100 }).notNull().default(""),
  quantity: int("quantity").notNull(),
  unit: varchar("unit", { length: 50 }).notNull(),
  conditionBefore: varchar("condition_before", { length: 50 }).notNull(),
  ownership: varchar("ownership", { length: 100 }).notNull(),
  notes: text("notes"),
});

export const goodsReturns = mysqlTable("goods_returns", {
  number: varchar("number", { length: 30 }).primaryKey(),
  gatePassNumber: varchar("gate_pass_number", { length: 30 }).notNull(),
  returnedAt: varchar("returned_at", { length: 30 }).notNull(),
  securityChecker: varchar("security_checker", { length: 255 }).notNull(),
  carrierName: varchar("carrier_name", { length: 255 }).notNull(),
  returnedSummary: text("returned_summary").notNull(),
  returnCondition: varchar("return_condition", { length: 50 }).notNull(),
  status: varchar("status", { length: 50 }).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const goodsReturnItems = mysqlTable("goods_return_items", {
  id: int("id").primaryKey().autoincrement(),
  returnNumber: varchar("return_number", { length: 30 })
    .notNull()
    .references(() => goodsReturns.number),
  itemName: varchar("item_name", { length: 255 }).notNull(),
  quantityReturned: int("quantity_returned").notNull(),
  conditionOnReturn: varchar("condition_on_return", { length: 50 }).notNull(),
  notes: text("notes"),
});

export const personalItems = mysqlTable("personal_items", {
  number: varchar("number", { length: 30 }).primaryKey(),
  ownerName: varchar("owner_name", { length: 255 }).notNull(),
  ownerIdentity: varchar("owner_identity", { length: 100 })
    .notNull()
    .default(""),
  department: varchar("department", { length: 100 }).notNull(),
  itemName: varchar("item_name", { length: 255 }).notNull(),
  brand: varchar("brand", { length: 100 }).notNull().default(""),
  model: varchar("model", { length: 100 }).notNull().default(""),
  serialNumber: varchar("serial_number", { length: 100 }).notNull().default(""),
  color: varchar("color", { length: 50 }).notNull().default(""),
  enteredAt: varchar("entered_at", { length: 30 }).notNull(),
  securityChecker: varchar("security_checker", { length: 255 }).notNull(),
  status: varchar("status", { length: 50 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const gatePasses = mysqlTable(
  "gate_passes",
  {
    number: varchar("number", { length: 30 }).primaryKey(),
    outgoingNumber: varchar("outgoing_number", { length: 30 }).references(
      () => outgoingGoods.number
    ),
    token: varchar("token", { length: 255 }).notNull(),
    requester: varchar("requester", { length: 255 }).notNull(),
    department: varchar("department", { length: 100 }).notNull(),
    bearer: varchar("bearer", { length: 255 }).notNull(),
    purpose: varchar("purpose", { length: 500 }).notNull(),
    movementType: varchar("movement_type", { length: 50 }).notNull(),
    validFrom: varchar("valid_from", { length: 30 }).notNull(),
    validUntil: varchar("valid_until", { length: 30 }).notNull(),
    returnDate: varchar("return_date", { length: 30 }),
    approvalSummary: text("approval_summary").notNull(),
    status: varchar("status", { length: 50 }).notNull(),
    securityNote: text("security_note"),
    itemsJson: text("items_json").notNull(),
    scannedBy: varchar("scanned_by", { length: 255 }),
    scannedAt: varchar("scanned_at", { length: 30 }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    tokenIdx: uniqueIndex("gate_passes_token_idx").on(table.token),
    statusIdx: index("gate_passes_status_idx").on(table.status),
  })
);

export const gatePassLogs = mysqlTable("gate_pass_logs", {
  id: int("id").primaryKey().autoincrement(),
  gatePassNumber: varchar("gate_pass_number", { length: 30 })
    .notNull()
    .references(() => gatePasses.number),
  action: varchar("action", { length: 100 }).notNull(),
  result: varchar("result", { length: 255 }).notNull(),
  scannedBy: varchar("scanned_by", { length: 255 }).notNull(),
  device: varchar("device", { length: 100 }).notNull().default("Web"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const approvalFlows = mysqlTable("approval_flows", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 255 }).notNull(),
  transactionType: varchar("transaction_type", { length: 100 }).notNull(),
  status: varchar("status", { length: 20 }).notNull().default("Aktif"),
});

export const approvalSteps = mysqlTable("approval_steps", {
  id: int("id").primaryKey().autoincrement(),
  flowId: int("flow_id")
    .notNull()
    .references(() => approvalFlows.id),
  stepOrder: int("step_order").notNull(),
  roleName: varchar("role_name", { length: 100 }).notNull(),
  condition: varchar("condition", { length: 255 }),
});

export const approvalRecords = mysqlTable(
  "approval_records",
  {
    id: varchar("id", { length: 30 }).primaryKey(),
    requestNumber: varchar("request_number", { length: 30 }).notNull(),
    requester: varchar("requester", { length: 255 }).notNull(),
    department: varchar("department", { length: 100 }).notNull(),
    stepName: varchar("step_name", { length: 100 }).notNull(),
    itemSummary: text("item_summary").notNull(),
    risk: varchar("risk", { length: 50 }).notNull(),
    status: varchar("status", { length: 50 }).notNull(),
    note: text("note"),
    decidedBy: varchar("decided_by", { length: 255 }),
    decidedAt: timestamp("decided_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    statusIdx: index("approval_records_status_idx").on(table.status),
    requestIdx: index("approval_records_request_idx").on(table.requestNumber),
  })
);

export const notifications = mysqlTable("notifications", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("user_id").references(() => users.id),
  title: varchar("title", { length: 255 }).notNull(),
  detail: text("detail").notNull(),
  tone: varchar("tone", { length: 20 }).notNull().default("info"),
  status: varchar("status", { length: 30 }).notNull().default("Belum Dibaca"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const attachments = mysqlTable("attachments", {
  id: int("id").primaryKey().autoincrement(),
  module: varchar("module", { length: 50 }).notNull(),
  referenceNumber: varchar("reference_number", { length: 30 }).notNull(),
  url: varchar("url", { length: 500 }).notNull(),
  fileName: varchar("file_name", { length: 255 }).notNull(),
  fileType: varchar("file_type", { length: 20 }).notNull(),
  fileSize: int("file_size").notNull(),
  uploader: varchar("uploader", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const googleSyncConfig = mysqlTable("google_sync_config", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 255 }).notNull(),
  spreadsheetUrl: varchar("spreadsheet_url", { length: 500 }).notNull(),
  spreadsheetId: varchar("spreadsheet_id", { length: 255 }).notNull(),
  sheetName: varchar("sheet_name", { length: 100 }).notNull().default(""),
  columnMapping: text("column_mapping"),
  syncMode: varchar("sync_mode", { length: 20 })
    .notNull()
    .default("manual"),
  syncIntervalMinutes: int("sync_interval_minutes"),
  lastSyncAt: timestamp("last_sync_at"),
  lastSyncRowCount: int("last_sync_row_count").default(0),
  status: varchar("status", { length: 20 }).notNull().default("Aktif"),
  createdBy: varchar("created_by", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

export const googleSyncLogs = mysqlTable("google_sync_logs", {
  id: int("id").primaryKey().autoincrement(),
  configId: int("config_id").references(() => googleSyncConfig.id),
  syncedAt: timestamp("synced_at").notNull().defaultNow(),
  rowsRead: int("rows_read").notNull().default(0),
  rowsSuccess: int("rows_success").notNull().default(0),
  rowsFailed: int("rows_failed").notNull().default(0),
  message: text("message"),
  executedBy: varchar("executed_by", { length: 255 })
    .notNull()
    .default("System"),
});

export const activityLogs = mysqlTable(
  "activity_logs",
  {
    id: int("id").primaryKey().autoincrement(),
    userId: int("user_id").references(() => users.id),
    userName: varchar("user_name", { length: 255 }).notNull(),
    action: varchar("action", { length: 100 }).notNull(),
    module: varchar("module", { length: 50 }).notNull(),
    referenceNumber: varchar("reference_number", { length: 30 }).notNull(),
    beforeValue: text("before_value"),
    afterValue: text("after_value"),
    ipAddress: varchar("ip_address", { length: 50 }).notNull().default(""),
    device: varchar("device", { length: 100 }).notNull().default("Web"),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    moduleIdx: index("activity_logs_module_idx").on(table.module),
    createdAtIdx: index("activity_logs_created_at_idx").on(table.createdAt),
  })
);

export const systemSettings = mysqlTable("system_settings", {
  key: varchar("key", { length: 100 }).primaryKey(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});
