import { pgTable, text, serial, timestamp, integer, boolean, json, decimal, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const inquiries = pgTable("inquiries", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  message: text("message").notNull(),
  propertyType: text("property_type").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  // Lead management fields
  leadStatus: text("lead_status").default("new").notNull(),
  leadSource: text("lead_source").default("website"),
  assignedTo: text("assigned_to"),
  followUpDate: timestamp("follow_up_date"),
  notes: text("notes"),
  adminNotes: text("admin_notes"),
  convertedToBooking: boolean("converted_to_booking").default(false),
  quotedAmount: integer("quoted_amount"),
});

export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  propertyType: text("property_type").notNull(),
  propertyAddress: text("property_address").notNull(),
  serviceTypes: text("service_types").array().notNull(),
  serviceDate: timestamp("service_date"),
  status: text("status").default("pending").notNull(),
  totalAmount: integer("total_amount").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  // Lead management fields
  inquiryId: integer("inquiry_id"),
  leadSource: text("lead_source"),
  assignedTo: text("assigned_to"),
  paymentStatus: text("payment_status").default("pending").notNull(),
  amountPaid: integer("amount_paid").default(0),
  paymentDate: timestamp("payment_date"),
  inspectionDate: timestamp("inspection_date"),
  inspectionStatus: text("inspection_status").default("not_started").notNull(),
  reportDeliveryDate: timestamp("report_delivery_date"),
  reportStatus: text("report_status").default("not_started").notNull(),
  customerFeedback: text("customer_feedback"),
  adminNotes: text("admin_notes"),
  notes: text("notes"),
});

// User table for authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: text("role").default("surveyor").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Inspection projects
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  clientName: text("client_name").notNull(),
  location: text("location").notNull(),
  date: timestamp("date").notNull(),
  propertyType: text("property_type").notNull(),
  propertySize: text("property_size"),
  status: text("status").default("pending").notNull(),
  userId: integer("user_id").notNull(),
  defectCount: integer("defect_count").default(0),
  projectType: text("project_type").default("snagging").notNull(), // "snagging" or "rera_audit"
  reraAuditType: text("rera_audit_type"), // "condition_survey", "reserve_fund_study", or "amc_cost_allocation"
  
  // RERA project properties
  yearOfConstruction: integer("year_of_construction"),
  buildingType: text("building_type"),
  totalArea: integer("total_area"),
  numberOfFloors: integer("number_of_floors"),
  constructionType: text("construction_type"),
  lastMajorRenovation: integer("last_major_renovation"),
  
  // Additional properties for reserve fund calculations
  areaPerUnit: text("area_per_unit"),
  numberOfUnits: text("number_of_units"),
  commonAreaPercentage: text("common_area_percentage"),
  reserveItems: text("reserve_items"),
  constructionYear: integer("construction_year"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Defects found during inspection
export const defects = pgTable("defects", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category"),
  subCategory: text("sub_category"), // Additional sub-category for more granular classification
  location: text("location").notNull(), // Legacy text location name
  locationId: integer("location_id"), // Reference to locations table
  severity: text("severity").notNull(),
  status: text("status").default("open").notNull(),
  priority: text("priority"), // Priority level for issue resolution
  estimatedCost: text("estimated_cost"), // Estimated cost of remediation
  assignedTo: text("assigned_to"),
  assignedTeam: text("assigned_team"), // Team responsible for fixing
  dueDate: timestamp("due_date"), // Deadline for fixing the defect
  remedialAction: text("remedial_action"), // Recommended action to fix the issue
  inspectorNotes: text("inspector_notes"), // Private notes for inspectors
  clientVisible: boolean("client_visible").default(true), // Whether defect should be visible to clients
  photoUrls: text("photo_urls").array(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Images uploaded for inspection
export const images = pgTable("images", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(),
  defectId: integer("defect_id"),
  url: text("url").notNull(),
  filename: text("filename").notNull(),
  description: text("description"),
  annotations: text("annotations"), // Stored as JSON string
  isAnnotated: boolean("is_annotated").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Project locations 
export const locations = pgTable("locations", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'floor', 'room', 'area', 'system', 'subSystem', 'component', 'element'
  parentId: integer("parent_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Inspection reports
export const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(),
  reportUrl: text("report_url"),
  generatedAt: timestamp("generated_at"),
  status: text("status").default("pending").notNull(),
  settings: text("settings"), // JSON string for template settings
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Visitor tracking table
export const visitors = pgTable("visitors", {
  id: serial("id").primaryKey(),
  ipAddress: text("ip_address").notNull(),
  visitedPage: text("visited_page").notNull(),
  visitTime: timestamp("visit_time").defaultNow().notNull(),
  lastVisitTime: timestamp("last_visit_time").defaultNow().notNull(),
  clickCount: integer("click_count").default(1).notNull(),
  userAgent: text("user_agent"),
  referrer: text("referrer"),
  country: text("country"),
  city: text("city"),
  browser: text("browser"),
  device: text("device"),
  operatingSystem: text("operating_system"),
  sessionId: text("session_id"),
  queryParams: json("query_params"),
  interactionData: json("interaction_data"),
  isFlagged: boolean("is_flagged").default(false).notNull(),
  flagReason: text("flag_reason"),
  conversionType: text("conversion_type").default("none").notNull(),
  conversionId: integer("conversion_id"),
});

// Schemas for data validation
export const insertInquirySchema = createInsertSchema(inquiries)
  .omit({ id: true, createdAt: true, leadStatus: true, convertedToBooking: true })
  .extend({
    email: z.string().email("Invalid email address"),
    phone: z.string().min(8, "Phone number is too short"),
    leadStatus: z.enum(["new", "contacted", "qualified", "proposal_sent", "negotiating", "won", "lost", "on_hold"]).optional(),
    leadSource: z.string().optional(),
    assignedTo: z.string().optional(),
    followUpDate: z.coerce.date().optional(),
    notes: z.string().optional(),
    adminNotes: z.string().optional(),
    quotedAmount: z.number().optional(),
    convertedToBooking: z.boolean().optional(),
  });

export const insertBookingSchema = createInsertSchema(bookings)
  .omit({ id: true, createdAt: true })
  .extend({
    email: z.string().email("Invalid email address"),
    phone: z.string().min(8, "Phone number is too short"),
    name: z.string().min(2, "Name is required"),
    propertyAddress: z.string().min(3, "Property address is required"),
    propertyType: z.enum(["apartment", "villa", "townhouse", "commercial"]),
    serviceDate: z.coerce.date().optional(),
    status: z.enum(["not_started", "scheduled", "in_progress", "completed", "cancelled"]),
    serviceTypes: z.array(
      z.string()
    ).min(1, "Please select at least one service"),
    inquiryId: z.number().optional(),
    leadSource: z.string().optional(),
    assignedTo: z.string().optional(),
    paymentStatus: z.enum(["pending", "partial", "paid", "overdue", "refunded"]).optional(),
    amountPaid: z.number().optional(),
    paymentDate: z.coerce.date().optional(),
    inspectionDate: z.coerce.date().optional(),
    inspectionStatus: z.enum(["not_started", "scheduled", "in_progress", "completed", "cancelled"]).optional(),
    reportDeliveryDate: z.coerce.date().optional(),
    reportStatus: z.enum(["not_started", "in_progress", "sent", "approved"]).optional(),
    customerFeedback: z.string().optional(),
    adminNotes: z.string().optional(),
    notes: z.string().optional(),
  });

export const insertUserSchema = createInsertSchema(users)
  .omit({ id: true, createdAt: true })
  .extend({
    username: z.string().min(3, "Username must be at least 3 characters"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    role: z.enum(["admin", "surveyor", "manager"]),
  });

export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export const insertProjectSchema = createInsertSchema(projects)
  .omit({ id: true, createdAt: true, updatedAt: true, defectCount: true })
  .extend({
    status: z.enum(["pending", "in_progress", "completed", "cancelled"]),
    propertyType: z.enum(["Apartment", "Villa", "Townhouse", "Penthouse", "Commercial", "Office", "Retail", "Other"]),
    projectType: z.enum(["snagging", "rera_audit"]),
    reraAuditType: z.enum(["condition_survey", "reserve_fund_study", "amc_cost_allocation"]).optional(),
    date: z.coerce.date(),
    // RERA project properties
    yearOfConstruction: z.number().optional().nullable(),
    buildingType: z.string().optional().nullable(),
    totalArea: z.number().optional().nullable(),
    numberOfFloors: z.number().optional().nullable(),
    constructionType: z.string().optional().nullable(),
    lastMajorRenovation: z.number().optional().nullable(),
    // Additional RERA reserve fund properties
    areaPerUnit: z.string().optional().nullable(),
    numberOfUnits: z.string().optional().nullable(),
    commonAreaPercentage: z.string().optional().nullable(),
    reserveItems: z.string().optional().nullable(),
    constructionYear: z.number().optional().nullable(),
  });

export const insertDefectSchema = createInsertSchema(defects)
  .omit({ id: true, createdAt: true, updatedAt: true })
  .extend({
    severity: z.enum(["critical", "major", "minor", "cosmetic"]),
    status: z.enum(["open", "in_progress", "resolved", "requires_contractor", "completed", "rejected"]),
    priority: z.enum(["high", "medium", "low"]).optional(),
    category: z.enum([
      "Electrical", "Plumbing", "Flooring", "Walls", "Ceiling", 
      "Doors", "Windows", "HVAC", "Appliances", "Exterior", "Structural",
      "Painting", "Finishing", "Waterproofing", "Installation", "Security",
      "Safety", "Building Services", "Common Areas", "Balcony", "Kitchen",
      "Bathroom", "Master Bedroom", "Other"
    ]).optional(),
    subCategory: z.string().optional(),
    estimatedCost: z.string().optional(),
    dueDate: z.coerce.date().optional(),
    remedialAction: z.string().optional(),
    inspectorNotes: z.string().optional(),
    clientVisible: z.boolean().default(true).optional(),
    assignedTeam: z.string().optional(),
  });

export const insertImageSchema = createInsertSchema(images)
  .omit({ id: true, createdAt: true });

export const insertLocationSchema = createInsertSchema(locations)
  .omit({ id: true, createdAt: true })
  .extend({
    type: z.enum(["floor", "room", "area", "system", "subSystem", "component", "element"]),
    parentId: z.number().optional().nullable(),
  });

export const insertReportSchema = createInsertSchema(reports)
  .omit({ id: true, createdAt: true, updatedAt: true, generatedAt: true })
  .extend({
    status: z.enum(["pending", "generated", "failed"]),
  });

// TypeScript types for our models
export type InsertInquiry = z.infer<typeof insertInquirySchema>;
export type Inquiry = typeof inquiries.$inferSelect;

export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Booking = typeof bookings.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type LoginCredentials = z.infer<typeof loginSchema>;

export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;

export type InsertDefect = z.infer<typeof insertDefectSchema>;
export type Defect = typeof defects.$inferSelect;

export type InsertImage = z.infer<typeof insertImageSchema>;
export type Image = typeof images.$inferSelect;

export type InsertLocation = z.infer<typeof insertLocationSchema>;
export type Location = typeof locations.$inferSelect;

export type InsertReport = z.infer<typeof insertReportSchema>;
export type Report = typeof reports.$inferSelect;

// Visitor tracking schema
export const insertVisitorSchema = createInsertSchema(visitors)
  .omit({ id: true, visitTime: true, lastVisitTime: true, clickCount: true, isFlagged: true })
  .extend({
    ipAddress: z.string().min(1, "IP address is required"),
    visitedPage: z.string().min(1, "Visited page is required"),
    userAgent: z.string().optional(),
    referrer: z.string().optional(),
    country: z.string().optional(),
    city: z.string().optional(),
    browser: z.string().optional(),
    device: z.string().optional(),
    operatingSystem: z.string().optional(),
    sessionId: z.string().optional(),
    queryParams: z.record(z.string()).optional(),
    interactionData: z.record(z.any()).optional(),
    conversionType: z.enum(["inquiry", "booking", "none"]).optional(),
    conversionId: z.number().optional(),
  });

export type InsertVisitor = z.infer<typeof insertVisitorSchema>;
export type Visitor = typeof visitors.$inferSelect;

// AMC Cost Allocation System Schema

// Entity Types (enum for different entity types in mixed-use developments)
export const entityTypeEnum = pgEnum('entity_type', ['residential', 'retail', 'office', 'hotel', 'other']);
export const sharedAreaTypeEnum = pgEnum('shared_area_type', ['principal_common', 'common_element']);
export const uomTypeEnum = pgEnum('uom_type', [
  'area_based', 
  'headcount_based', 
  'asset_based', 
  'load_based',
  'consumption_based', 
  'time_based', 
  'parking_based', 
  'hybrid'
]);

// RERA Budget Line Items (from template)
export const reraBudgetItems = pgTable("rera_budget_items", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  subCategory: text("sub_category").notNull(),
  notes: text("notes"),
  isExcludable: boolean("is_excludable").default(false),
  countryCode: text("country_code").default("AE").notNull(),
  order: integer("display_order"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Mixed-use project entities (e.g., Residential, Retail, Office, Hotel components)
export const projectEntities = pgTable("project_entities", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id),
  name: text("name").notNull(),
  type: entityTypeEnum("type").notNull(),
  // Entity Area Fields
  suitArea: text("suit_area").notNull(), // Total area of the entity
  balconyArea: text("balcony_area"), // Balcony area
  sellableArea: text("sellable_area"), // Sellable area
  applicableArea: text("applicable_area"), // Applicable area
  dedicatedCommonArea: text("dedicated_common_area"), // Dedicated common area
  parkingBayArea: text("parking_bay_area"), // Parking bay area
  // Calculated fields
  totalComponentArea: text("total_component_area"), // Total component area if applicable
  proportionalShare: text("proportional_share"), // Share of the total property 
  // Usage metrics
  unitCount: text("unit_count"), // Number of units if applicable
  occupancyRate: text("occupancy_rate"), // Occupancy rate (%) if applicable
  occupantCapacity: integer("occupant_capacity"), // Maximum occupant capacity
  parkingSpaces: integer("parking_spaces"), // Number of parking spaces
  equipmentCount: integer("equipment_count"), // Number of equipment/assets
  energyConsumption: text("energy_consumption"), // Energy consumption
  operationalHours: integer("operational_hours"), // Hours of operation per week
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Shared areas that are common to multiple property entities
export const sharedAreas = pgTable("shared_areas", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id),
  name: text("name").notNull(),
  type: sharedAreaTypeEnum("type").notNull(), // principal_common, common_element
  area: text("area").notNull(), // Area size
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Shared area beneficiaries - links entities to shared areas with allocation percentages
export const sharedAreaBeneficiaries = pgTable("shared_area_beneficiaries", {
  id: serial("id").primaryKey(),
  sharedAreaId: integer("shared_area_id").notNull().references(() => sharedAreas.id),
  entityId: integer("entity_id").notNull().references(() => projectEntities.id),
  allocationPercentage: text("allocation_percentage").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// AMC contracts for cost allocation
export const amcContracts = pgTable("amc_contracts", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id),
  name: text("name").notNull(),
  description: text("description"),
  notes: text("notes"),
  reraBudgetItemId: integer("rera_budget_item_id").references(() => reraBudgetItems.id),
  budgetValue: text("budget_value"), // Total AMC contract value
  primaryUomType: uomTypeEnum("primary_uom_type").notNull(), // Primary unit of measurement
  secondaryUomType: uomTypeEnum("secondary_uom_type"), // Secondary UOM for hybrid allocation
  secondaryUomWeight: text("secondary_uom_weight"), // Weight for secondary UOM in hybrid
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  coverageArea: text("coverage_area"), // Total area covered by the contract
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  userId: integer("user_id").notNull().references(() => users.id),
});

// Entity UOM values - measurements for each entity per contract
export const amcEntityUomValues = pgTable("amc_entity_uom_values", {
  id: serial("id").primaryKey(),
  entityId: integer("entity_id").notNull().references(() => projectEntities.id),
  amcContractId: integer("amc_contract_id").notNull().references(() => amcContracts.id),
  value: text("value").notNull(), // Measured value
  unit: text("unit").notNull(), // Unit of measurement
  uomType: uomTypeEnum("uom_type").notNull(), // Type of measurement
  notes: text("notes"),
  isExcluded: boolean("is_excluded").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Allocation ratios for entities
export const entityAllocationRatios = pgTable("entity_allocation_ratios", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id),
  name: text("name").notNull(), // Name of the ratio (e.g., "Sellable Area Ratio", "Common Area Ratio")
  description: text("description"),
  isCore: boolean("is_core").default(true), // Whether this is a core ratio automatically derived by the system
  uomType: uomTypeEnum("uom_type").notNull(), // The unit of measurement type for this ratio
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  unitOfMeasurement: text("unit_of_measurement").default("sq.m").notNull(), // Default is sq.m, can be changed to sq.ft
});

// Entity ratio values - stores the actual ratio values for each entity
export const entityRatioValues = pgTable("entity_ratio_values", {
  id: serial("id").primaryKey(),
  ratioId: integer("ratio_id").notNull().references(() => entityAllocationRatios.id),
  entityId: integer("entity_id").notNull().references(() => projectEntities.id),
  value: text("value").notNull(), // The ratio value (e.g., 0.25 for 25%)
  numerator: text("numerator"), // The value used as numerator in ratio calculation (e.g., entity area)
  denominator: text("denominator"), // The value used as denominator (e.g., total area)
  inclusionFactor: text("inclusion_factor").default("1"), // Factor to include partial area (0-1)
  isIncluded: boolean("is_included").default(true), // Whether this entity is included in this ratio
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Shared area inclusion factors - defines how much of a shared area is attributed to each entity
export const sharedAreaInclusions = pgTable("shared_area_inclusions", {
  id: serial("id").primaryKey(),
  sharedAreaId: integer("shared_area_id").notNull().references(() => sharedAreas.id),
  entityId: integer("entity_id").notNull().references(() => projectEntities.id),
  ratioId: integer("ratio_id").references(() => entityAllocationRatios.id), // The ratio this inclusion is used for
  inclusionFactor: text("inclusion_factor").notNull(), // Factor (0-1) for including this shared area
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// AMC allocation results - final allocation percentages and amounts
export const amcAllocations = pgTable("amc_allocations", {
  id: serial("id").primaryKey(),
  entityId: integer("entity_id").notNull().references(() => projectEntities.id),
  amcContractId: integer("amc_contract_id").notNull().references(() => amcContracts.id),
  allocationPercentage: text("allocation_percentage").notNull(),
  allocatedAmount: text("allocated_amount"),
  ratioId: integer("ratio_id").references(() => entityAllocationRatios.id), // The ratio used for this allocation
  calculationNotes: text("calculation_notes"),
  calculatedAt: timestamp("calculated_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// RERA Budget Item schema
export const insertReraBudgetItemSchema = createInsertSchema(reraBudgetItems)
  .omit({ id: true, createdAt: true, updatedAt: true })
  .extend({
    code: z.string().min(1, "Code is required"),
    description: z.string().min(1, "Description is required"),
    category: z.string().min(1, "Category is required"),
    subCategory: z.string().nullable().optional(),
    notes: z.string().nullable().optional(),
    isExcludable: z.boolean().optional(),
    countryCode: z.string().optional(),
    order: z.number().nullable().optional(),
  });

// Project Entity schema
export const insertProjectEntitySchema = createInsertSchema(projectEntities)
  .omit({ id: true, createdAt: true, updatedAt: true })
  .extend({
    projectId: z.number().int().positive(),
    name: z.string().min(1, "Name is required"),
    type: z.enum(["residential", "retail", "office", "hotel", "other"]),
    // Entity Area Fields
    suitArea: z.string().min(1, "Suit area is required"),
    balconyArea: z.string().optional(),
    sellableArea: z.string().optional(),
    applicableArea: z.string().optional(),
    dedicatedCommonArea: z.string().optional(),
    parkingBayArea: z.string().optional(),
    // Calculated fields
    totalComponentArea: z.string().optional(),
    proportionalShare: z.string().optional(),
    // Usage metrics
    unitCount: z.string().optional(),
    occupancyRate: z.string().optional(),
    occupantCapacity: z.number().nullable().optional(),
    parkingSpaces: z.number().nullable().optional(),
    equipmentCount: z.number().nullable().optional(),
    energyConsumption: z.string().nullable().optional(),
    operationalHours: z.number().nullable().optional(),
    notes: z.string().nullable().optional(),
  });

// Shared Area schema
export const insertSharedAreaSchema = createInsertSchema(sharedAreas)
  .omit({ id: true, createdAt: true, updatedAt: true })
  .extend({
    projectId: z.number().int().positive(),
    name: z.string().min(1, "Name is required"),
    type: z.enum(["principal_common", "common_element"]),
    area: z.string().min(1, "Area is required"),
    description: z.string().nullable().optional(),
  });

// Shared Area Beneficiary schema
export const insertSharedAreaBeneficiarySchema = createInsertSchema(sharedAreaBeneficiaries)
  .omit({ id: true, createdAt: true, updatedAt: true })
  .extend({
    sharedAreaId: z.number().int().positive(),
    entityId: z.number().int().positive(),
    allocationPercentage: z.string().min(1, "Allocation percentage is required"),
  });

// AMC Contract schema
export const insertAmcContractSchema = createInsertSchema(amcContracts)
  .omit({ id: true, createdAt: true, updatedAt: true, userId: true })
  .extend({
    projectId: z.number().int().positive(),
    name: z.string().min(1, "Name is required"),
    description: z.string().nullable().optional(),
    notes: z.string().nullable().optional(),
    reraBudgetItemId: z.number().int().positive().nullable().optional(),
    budgetValue: z.string().nullable().optional(),
    primaryUomType: z.enum([
      "area_based", 
      "headcount_based", 
      "asset_based", 
      "load_based", 
      "consumption_based", 
      "time_based", 
      "parking_based", 
      "hybrid"
    ]),
    secondaryUomType: z.enum([
      "area_based", 
      "headcount_based", 
      "asset_based", 
      "load_based", 
      "consumption_based", 
      "time_based", 
      "parking_based"
    ]).nullable().optional(),
    secondaryUomWeight: z.string().nullable().optional(),
    startDate: z.coerce.date().nullable().optional(),
    endDate: z.coerce.date().nullable().optional(),
    coverageArea: z.string().nullable().optional(),
  });

// AMC Entity UOM Value schema
export const insertAmcEntityUomValueSchema = createInsertSchema(amcEntityUomValues)
  .omit({ id: true, createdAt: true, updatedAt: true })
  .extend({
    entityId: z.number().int().positive(),
    amcContractId: z.number().int().positive(),
    value: z.string().min(1, "Value is required"),
    unit: z.string().min(1, "Unit is required"),
    uomType: z.enum([
      "area_based", 
      "headcount_based", 
      "asset_based", 
      "load_based", 
      "consumption_based", 
      "time_based", 
      "parking_based", 
      "hybrid"
    ]),
    notes: z.string().nullable().optional(),
    isExcluded: z.boolean().nullable().optional(),
  });

// AMC Allocation schema
export const insertAmcAllocationSchema = createInsertSchema(amcAllocations)
  .omit({ id: true, calculatedAt: true, updatedAt: true })
  .extend({
    entityId: z.number().int().positive(),
    amcContractId: z.number().int().positive(),
    allocationPercentage: z.string().min(1, "Allocation percentage is required"),
    allocatedAmount: z.string().nullable().optional(),
    calculationNotes: z.string().nullable().optional(),
  });

// AMC related types
export type InsertReraBudgetItem = z.infer<typeof insertReraBudgetItemSchema>;
export type ReraBudgetItem = typeof reraBudgetItems.$inferSelect;

export type InsertProjectEntity = z.infer<typeof insertProjectEntitySchema>;
export type ProjectEntity = typeof projectEntities.$inferSelect;

export type InsertSharedArea = z.infer<typeof insertSharedAreaSchema>;
export type SharedArea = typeof sharedAreas.$inferSelect;

export type InsertSharedAreaBeneficiary = z.infer<typeof insertSharedAreaBeneficiarySchema>;
export type SharedAreaBeneficiary = typeof sharedAreaBeneficiaries.$inferSelect;

export type InsertAmcContract = z.infer<typeof insertAmcContractSchema>;
export type AmcContract = typeof amcContracts.$inferSelect;

export type InsertAmcEntityUomValue = z.infer<typeof insertAmcEntityUomValueSchema>;
export type AmcEntityUomValue = typeof amcEntityUomValues.$inferSelect;

// Entity Allocation Ratio schema
export const insertEntityAllocationRatioSchema = createInsertSchema(entityAllocationRatios)
  .omit({ id: true, createdAt: true, updatedAt: true })
  .extend({
    projectId: z.number().int().positive(),
    name: z.string().min(1, "Name is required"),
    description: z.string().nullable().optional(),
    isCore: z.boolean().optional(),
    uomType: z.enum([
      "area_based", 
      "headcount_based", 
      "asset_based", 
      "load_based", 
      "consumption_based", 
      "time_based", 
      "parking_based", 
      "hybrid"
    ]),
    unitOfMeasurement: z.string().default("sq.m"),
  });

// Entity Ratio Value schema
export const insertEntityRatioValueSchema = createInsertSchema(entityRatioValues)
  .omit({ id: true, createdAt: true, updatedAt: true })
  .extend({
    ratioId: z.number().int().positive(),
    entityId: z.number().int().positive(),
    value: z.string().min(1, "Value is required"),
    numerator: z.string().nullable().optional(),
    denominator: z.string().nullable().optional(),
    inclusionFactor: z.string().default("1"),
    isIncluded: z.boolean().default(true),
    notes: z.string().nullable().optional(),
  });

// Shared Area Inclusion schema
export const insertSharedAreaInclusionSchema = createInsertSchema(sharedAreaInclusions)
  .omit({ id: true, createdAt: true, updatedAt: true })
  .extend({
    sharedAreaId: z.number().int().positive(),
    entityId: z.number().int().positive(),
    ratioId: z.number().int().positive().nullable().optional(),
    inclusionFactor: z.string().min(1, "Inclusion factor is required"),
    notes: z.string().nullable().optional(),
  });

export type InsertEntityAllocationRatio = z.infer<typeof insertEntityAllocationRatioSchema>;
export type EntityAllocationRatio = typeof entityAllocationRatios.$inferSelect;

export type InsertEntityRatioValue = z.infer<typeof insertEntityRatioValueSchema>;
export type EntityRatioValue = typeof entityRatioValues.$inferSelect;

export type InsertSharedAreaInclusion = z.infer<typeof insertSharedAreaInclusionSchema>;
export type SharedAreaInclusion = typeof sharedAreaInclusions.$inferSelect;

export type InsertAmcAllocation = z.infer<typeof insertAmcAllocationSchema>;
export type AmcAllocation = typeof amcAllocations.$inferSelect;

// SEO Intelligence Schema
// SEO Intelligence Module - Data Source Tables
export const seoDataSources = pgTable("seo_data_sources", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  sourceType: text("source_type").notNull(), // google_search_console, google_analytics, ahrefs, moz, semrush, majestic, etc.
  apiKey: text("api_key"),
  credentials: json("credentials"), // Stores OAuth tokens for Google services or API credentials for other services
  status: text("status").default("active").notNull(),
  lastSyncAt: timestamp("last_sync_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  createdBy: text("created_by").notNull(),
});

// Google Search Console OAuth credentials schema
export interface GoogleSearchConsoleCredentials {
  access_token: string;
  refresh_token: string;
  scope: string;
  token_type: string;
  expiry_date: number;
}

export const seoKeywordData = pgTable("seo_keyword_data", {
  id: serial("id").primaryKey(),
  keyword: text("keyword").notNull(),
  volume: integer("volume"),
  difficulty: integer("difficulty"), // 1-100 scale
  cpc: decimal("cpc", { precision: 10, scale: 2 }), // Cost per click
  searchIntentType: text("search_intent_type"), // informational, transactional, navigational, commercial
  isProcessed: boolean("is_processed").default(false),
  relatedKeywords: text("related_keywords").array(),
  aiGeneratedContent: text("ai_generated_content"), // Content suggestions
  analysisJson: json("analysis_json"), // Additional detailed analysis
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const seoBacklinkData = pgTable("seo_backlink_data", {
  id: serial("id").primaryKey(),
  domainId: integer("domain_id").notNull(),
  sourceDomain: text("source_domain").notNull(),
  targetUrl: text("target_url").notNull(),
  targetDomain: text("target_domain").notNull(), 
  anchorText: text("anchor_text"),
  linkType: text("link_type"), // dofollow, nofollow, ugc, sponsored
  domainAuthority: integer("domain_authority"),
  pageAuthority: integer("page_authority"),
  firstDiscovered: timestamp("first_discovered"),
  lastSeen: timestamp("last_seen"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const seoRankingData = pgTable("seo_ranking_data", {
  id: serial("id").primaryKey(),
  domainId: integer("domain_id").notNull(),
  keyword: text("keyword").notNull(),
  position: integer("position"),
  previousPosition: integer("previous_position"),
  url: text("url"),
  searchDate: timestamp("search_date").notNull(),
  searchVolume: integer("search_volume"),
  searchEngine: text("search_engine").default("google").notNull(), // google, bing, yahoo, etc.
  searchLocale: text("search_locale").default("en-us").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const seoTechnicalAudit = pgTable("seo_technical_audit", {
  id: serial("id").primaryKey(),
  domainId: integer("domain_id").notNull(),
  auditDate: timestamp("audit_date").notNull(),
  issueCount: integer("issue_count").default(0),
  healthScore: integer("health_score"), // 0-100 score
  auditData: json("audit_data"), // Full audit data
  crawlStats: json("crawl_stats"), // Crawl statistics
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const seoContentGapAnalysis = pgTable("seo_content_gap_analysis", {
  id: serial("id").primaryKey(),
  domainId: integer("domain_id").notNull(),
  competitorDomainIds: integer("competitor_domain_ids").array(),
  analysisDate: timestamp("analysis_date").notNull(),
  missingKeywords: json("missing_keywords"), // Keywords competitors rank for but the target doesn't
  contentOpportunities: json("content_opportunities"), // AI-generated content recommendations
  difficultyScores: json("difficulty_scores"), // Difficulty scores for recommended content
  priorityScore: integer("priority_score"), // 1-100 scale to prioritize opportunities
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// AI-powered alerts and notifications
export const seoAlerts = pgTable("seo_alerts", {
  id: serial("id").primaryKey(),
  domainId: integer("domain_id").notNull(),
  alertType: text("alert_type").notNull(), // ranking_change, competitor_movement, backlink_change, etc.
  alertSeverity: text("alert_severity").default("medium").notNull(), // critical, high, medium, low
  alertMessage: text("alert_message").notNull(),
  details: json("details"),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Original SEO schema components (extended with new fields)
export const seoCompetitorAnalysis = pgTable("seo_competitor_analysis", {
  id: serial("id").primaryKey(),
  targetDomain: text("target_domain").notNull(),
  competitorDomains: text("competitor_domains").array().notNull(),
  keywords: text("keywords").array().notNull(),
  status: text("status").default("pending").notNull(),
  results: json("results"),
  
  // Advanced fields
  contentGapAnalysisId: integer("content_gap_analysis_id"),
  technicalAuditId: integer("technical_audit_id"),
  rankingComparisonData: json("ranking_comparison_data"),
  backlinkComparisonData: json("backlink_comparison_data"),
  mlInsights: json("ml_insights"), // Machine learning generated insights
  searchIntentAnalysis: json("search_intent_analysis"),
  predictivePerformance: json("predictive_performance"), // AI-generated performance predictions
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  createdBy: text("created_by").notNull(),
});

export const seoRecommendations = pgTable("seo_recommendations", {
  id: serial("id").primaryKey(),
  analysisId: integer("analysis_id").notNull().references(() => seoCompetitorAnalysis.id),
  category: text("category").notNull(),  // on-page, off-page, technical, content, etc.
  priority: text("priority").notNull(),  // high, medium, low
  recommendation: text("recommendation").notNull(),
  impact: text("impact").notNull(),
  
  // Advanced fields
  implementationDifficulty: text("implementation_difficulty"), // easy, medium, hard
  estimatedTimeInvestment: text("estimated_time_investment"), // in hours
  projectedImpact: json("projected_impact"), // Projected traffic/ranking improvements
  aiGeneratedSteps: text("ai_generated_steps").array(), // Step-by-step implementation guide
  relatedKeywords: text("related_keywords").array(),
  
  completed: boolean("completed").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const adSimulations = pgTable("ad_simulations", {
  id: serial("id").primaryKey(),
  keyword: text("keyword").notNull(),
  searchTimestamp: timestamp("search_timestamp").defaultNow().notNull(),
  adsDetected: json("ads_detected"),
  adsClicked: json("ads_clicked"),
  searchResults: json("search_results"),
  
  // Advanced fields
  adCompetitorAnalysis: json("ad_competitor_analysis"), // Analysis of competitor ads
  adPositionImpact: json("ad_position_impact"), // Impact of ad position on CTR
  adCopyAnalysis: json("ad_copy_analysis"), // AI analysis of ad copy effectiveness 
  estimatedCpcData: json("estimated_cpc_data"), // Estimated CPC for positions
  bidStrategySuggestions: json("bid_strategy_suggestions"), // AI-generated bidding strategies
  
  status: text("status").default("completed").notNull(),
  createdBy: text("created_by").notNull(),
});

// Insert schemas
export const insertSeoCompetitorAnalysisSchema = createInsertSchema(seoCompetitorAnalysis)
  .omit({ id: true, results: true, createdAt: true, updatedAt: true })
  .extend({
    targetDomain: z.string().url("Target domain must be a valid URL"),
    competitorDomains: z.array(z.string().url("Competitor domains must be valid URLs")),
    keywords: z.array(z.string().min(1, "Keywords cannot be empty")),
  });

export const insertSeoRecommendationSchema = createInsertSchema(seoRecommendations)
  .omit({ id: true, createdAt: true, updatedAt: true })
  .extend({
    analysisId: z.number().int().positive(),
    category: z.enum(["on-page", "off-page", "technical", "content", "keywords", "backlinks"]),
    priority: z.enum(["high", "medium", "low"]),
  });

export const insertAdSimulationSchema = createInsertSchema(adSimulations)
  .omit({ id: true, searchTimestamp: true, adsDetected: true, adsClicked: true, searchResults: true })
  .extend({
    keyword: z.string().min(1, "Keyword cannot be empty"),
  });

// Types
// Additional SEO insert schemas
export const insertSeoDataSourceSchema = createInsertSchema(seoDataSources)
  .omit({ id: true, lastSyncAt: true, createdAt: true, updatedAt: true })
  .extend({
    sourceType: z.enum(["google_search_console", "google_analytics", "ahrefs", "moz", "semrush", "majestic", "other"]),
    name: z.string().min(1, "Name is required"),
    credentials: z.record(z.any()).optional(),
  });

export const insertSeoKeywordDataSchema = createInsertSchema(seoKeywordData)
  .omit({ id: true, createdAt: true, updatedAt: true })
  .extend({
    keyword: z.string().min(1, "Keyword is required"),
    volume: z.number().int().optional(),
    difficulty: z.number().int().min(1).max(100).optional(),
  });

export const insertSeoBacklinkDataSchema = createInsertSchema(seoBacklinkData)
  .omit({ id: true, createdAt: true, updatedAt: true })
  .extend({
    domainId: z.number().int().positive(),
    sourceDomain: z.string().url("Source domain must be a valid URL"),
    targetUrl: z.string().url("Target URL must be a valid URL"),
  });

export const insertSeoRankingDataSchema = createInsertSchema(seoRankingData)
  .omit({ id: true, createdAt: true, updatedAt: true })
  .extend({
    domainId: z.number().int().positive(),
    keyword: z.string().min(1, "Keyword is required"),
    searchDate: z.coerce.date(),
    searchEngine: z.enum(["google", "bing", "yahoo", "duckduckgo", "other"]),
  });

export const insertSeoTechnicalAuditSchema = createInsertSchema(seoTechnicalAudit)
  .omit({ id: true, createdAt: true, updatedAt: true })
  .extend({
    domainId: z.number().int().positive(),
    auditDate: z.coerce.date(),
    auditData: z.record(z.any()).optional(),
  });

export const insertSeoContentGapAnalysisSchema = createInsertSchema(seoContentGapAnalysis)
  .omit({ id: true, createdAt: true, updatedAt: true })
  .extend({
    domainId: z.number().int().positive(),
    analysisDate: z.coerce.date(),
    competitorDomainIds: z.array(z.number().int().positive()),
  });

export const insertSeoAlertSchema = createInsertSchema(seoAlerts)
  .omit({ id: true, createdAt: true, updatedAt: true, isRead: true })
  .extend({
    domainId: z.number().int().positive(),
    alertType: z.enum(["ranking_change", "competitor_movement", "backlink_change", "technical_issue", "content_opportunity"]),
    alertSeverity: z.enum(["critical", "high", "medium", "low"]),
    alertMessage: z.string().min(1, "Alert message is required"),
  });

// Export types for all SEO schemas
export type InsertSeoDataSource = z.infer<typeof insertSeoDataSourceSchema>;
export type SeoDataSource = typeof seoDataSources.$inferSelect;

export type InsertSeoKeywordData = z.infer<typeof insertSeoKeywordDataSchema>;
export type SeoKeywordData = typeof seoKeywordData.$inferSelect;

export type InsertSeoBacklinkData = z.infer<typeof insertSeoBacklinkDataSchema>;
export type SeoBacklinkData = typeof seoBacklinkData.$inferSelect;

export type InsertSeoRankingData = z.infer<typeof insertSeoRankingDataSchema>;
export type SeoRankingData = typeof seoRankingData.$inferSelect;

export type InsertSeoTechnicalAudit = z.infer<typeof insertSeoTechnicalAuditSchema>;
export type SeoTechnicalAudit = typeof seoTechnicalAudit.$inferSelect;

export type InsertSeoContentGapAnalysis = z.infer<typeof insertSeoContentGapAnalysisSchema>;
export type SeoContentGapAnalysis = typeof seoContentGapAnalysis.$inferSelect;

export type InsertSeoAlert = z.infer<typeof insertSeoAlertSchema>;
export type SeoAlert = typeof seoAlerts.$inferSelect;

export type InsertSeoCompetitorAnalysis = z.infer<typeof insertSeoCompetitorAnalysisSchema>;
export type SeoCompetitorAnalysis = typeof seoCompetitorAnalysis.$inferSelect;

export type InsertSeoRecommendation = z.infer<typeof insertSeoRecommendationSchema>;
export type SeoRecommendation = typeof seoRecommendations.$inferSelect;

export type InsertAdSimulation = z.infer<typeof insertAdSimulationSchema>;
export type AdSimulation = typeof adSimulations.$inferSelect;
