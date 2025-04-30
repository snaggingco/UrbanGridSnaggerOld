import { 
  inquiries, type Inquiry, type InsertInquiry, 
  type Booking, type InsertBooking,
  type User, type InsertUser, type LoginCredentials,
  type Project, type InsertProject,
  type Defect, type InsertDefect,
  type Image, type InsertImage,
  type Report, type InsertReport,
  type Location, type InsertLocation,
  type Visitor, type InsertVisitor,
  // RERA-specific types
  type Nrm3Classification, type InsertNrm3Classification,
  type ConditionAssessment, type InsertConditionAssessment,
  type LifecycleCost, type InsertLifecycleCost,
  type ReserveFundSettings, type InsertReserveFundSettings,
  // AMC Cost Allocation types
  type ReraBudgetItem, type InsertReraBudgetItem,
  type ProjectEntity, type InsertProjectEntity,
  type SharedArea, type InsertSharedArea,
  type SharedAreaBeneficiary, type InsertSharedAreaBeneficiary,
  type AmcContract, type InsertAmcContract,
  type AmcEntityUomValue, type InsertAmcEntityUomValue,
  type AmcAllocation, type InsertAmcAllocation,
  type EntityAllocationRatio, type InsertEntityAllocationRatio,
  type EntityRatioValue, type InsertEntityRatioValue,
  type SharedAreaInclusion, type InsertSharedAreaInclusion,
  // SEO Intelligence types
  type SeoCompetitorAnalysis, type InsertSeoCompetitorAnalysis,
  type SeoRecommendation, type InsertSeoRecommendation,
  type AdSimulation, type InsertAdSimulation,
  type SeoDataSource, type InsertSeoDataSource,
  type SeoKeywordData, type InsertSeoKeywordData,
  type SeoBacklinkData, type InsertSeoBacklinkData,
  type SeoRankingData, type InsertSeoRankingData,
  type SeoTechnicalAudit, type InsertSeoTechnicalAudit,
  type SeoContentGapAnalysis, type InsertSeoContentGapAnalysis,
  type SeoAlert, type InsertSeoAlert
} from "@shared/schema";
import nodemailer from "nodemailer";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

const { compare, hash } = bcryptjs;
const { sign, verify } = jwt;

const JWT_SECRET = process.env.JWT_SECRET || "urbangrid-secret-key";
const SALT_ROUNDS = 10;

export interface IStorage {
  // Inquiries and bookings
  createInquiry(inquiry: InsertInquiry): Promise<Inquiry>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  sendInquiryEmail(inquiry: Inquiry): Promise<void>;
  sendBookingEmail(booking: Booking): Promise<void>;
  
  // Lead management
  getAllInquiries(): Promise<Inquiry[]>;
  getInquiryById(id: number): Promise<Inquiry | null>;
  updateInquiry(id: number, inquiry: Partial<InsertInquiry>): Promise<Inquiry>;
  getAllBookings(): Promise<Booking[]>;
  getBookingById(id: number): Promise<Booking | null>;
  updateBooking(id: number, booking: Partial<InsertBooking>): Promise<Booking>;
  getBookingsByInquiryId(inquiryId: number): Promise<Booking[]>;
  convertInquiryToBooking(inquiryId: number, booking: InsertBooking): Promise<Booking>;
  
  // User authentication
  createUser(user: InsertUser): Promise<User>;
  login(credentials: LoginCredentials): Promise<{ user: User; token: string } | null>;
  getUserById(id: number): Promise<User | null>;
  validateToken(token: string): Promise<User | null>;
  
  // Inspection projects
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, project: Partial<InsertProject>): Promise<Project>;
  getProjectById(id: number): Promise<Project | null>;
  getProjectsByUserId(userId: number): Promise<Project[]>;
  getAllProjects(): Promise<Project[]>;
  
  // Locations management
  createLocation(location: InsertLocation): Promise<Location>;
  updateLocation(id: number, location: Partial<InsertLocation>): Promise<Location>;
  deleteLocation(id: number): Promise<void>;
  getLocationById(id: number): Promise<Location | null>;
  getLocationsByProjectId(projectId: number): Promise<Location[]>;
  getLocationsByParentId(parentId: number | null, projectId: number): Promise<Location[]>;
  
  // Defects management
  createDefect(defect: InsertDefect): Promise<Defect>;
  updateDefect(id: number, defect: Partial<InsertDefect>): Promise<Defect>;
  getDefectById(id: number): Promise<Defect | null>;
  getDefectsByProjectId(projectId: number): Promise<Defect[]>;
  
  // Images
  uploadImage(image: InsertImage): Promise<Image>;
  updateImage(id: number, image: Partial<InsertImage>): Promise<Image>;
  getImageById(id: number): Promise<Image | null>;
  getImagesByProjectId(projectId: number): Promise<Image[]>;
  getImagesByDefectId(defectId: number): Promise<Image[]>;
  
  // Reports
  generateReport(projectId: number): Promise<Report>;
  getReportByProjectId(projectId: number): Promise<Report | null>;
  updateReport(id: number, report: Partial<InsertReport>): Promise<Report>;
  getReportSettings(): Promise<any>;
  saveReportSettings(settings: any): Promise<any>;
  
  // RERA NRM3 Classifications
  createNrm3Classification(classification: InsertNrm3Classification): Promise<Nrm3Classification>;
  updateNrm3Classification(id: number, classification: Partial<InsertNrm3Classification>): Promise<Nrm3Classification>;
  getNrm3ClassificationById(id: number): Promise<Nrm3Classification | null>;
  getNrm3ClassificationsByProjectId(projectId: number): Promise<Nrm3Classification[]>;
  getNrm3ClassificationsByLocationId(locationId: number): Promise<Nrm3Classification[]>;
  
  // RERA Condition Assessments
  createConditionAssessment(assessment: InsertConditionAssessment): Promise<ConditionAssessment>;
  updateConditionAssessment(id: number, assessment: Partial<InsertConditionAssessment>): Promise<ConditionAssessment>;
  getConditionAssessmentById(id: number): Promise<ConditionAssessment | null>;
  getConditionAssessmentsByProjectId(projectId: number): Promise<ConditionAssessment[]>;
  getConditionAssessmentsByLocationId(locationId: number): Promise<ConditionAssessment[]>;
  getConditionAssessmentsByClassificationId(classificationId: number): Promise<ConditionAssessment[]>;
  
  // RERA Lifecycle Costs
  createLifecycleCost(cost: InsertLifecycleCost): Promise<LifecycleCost>;
  updateLifecycleCost(id: number, cost: Partial<InsertLifecycleCost>): Promise<LifecycleCost>;
  deleteLifecycleCost(id: number): Promise<void>;
  getLifecycleCostById(id: number): Promise<LifecycleCost | null>;
  getLifecycleCostsByProjectId(projectId: number): Promise<LifecycleCost[]>;
  getLifecycleCostsByLocationId(locationId: number): Promise<LifecycleCost[]>;
  getLifecycleCostsByClassificationId(classificationId: number): Promise<LifecycleCost[]>;
  getLifecycleCostsByAssessmentId(assessmentId: number): Promise<LifecycleCost[]>;
  
  // RERA Reserve Fund Settings
  createReserveFundSettings(settings: InsertReserveFundSettings): Promise<ReserveFundSettings>;
  updateReserveFundSettings(id: number, settings: Partial<InsertReserveFundSettings>): Promise<ReserveFundSettings>;
  getReserveFundSettingsById(id: number): Promise<ReserveFundSettings | null>;
  getReserveFundSettingsByProjectId(projectId: number): Promise<ReserveFundSettings | null>;
  
  // AMC Cost Allocation System
  // RERA Budget Items - Service Charge Line Items as per RERA Audit Guidelines
  importReraBudgetItems(items: InsertReraBudgetItem[]): Promise<ReraBudgetItem[]>;
  getReraBudgetItems(): Promise<ReraBudgetItem[]>;
  getReraBudgetItemCount(): Promise<number>;
  getReraBudgetItemById(id: number): Promise<ReraBudgetItem | null>;
  getReraBudgetItemByCode(code: string): Promise<ReraBudgetItem | null>;
  getReraBudgetItemsByCategory(category: string): Promise<ReraBudgetItem[]>;
  
  // AMC Contract Management
  createAmcContract(contract: InsertAmcContract & { userId: number }): Promise<AmcContract>;
  updateAmcContract(id: number, contract: Partial<InsertAmcContract>): Promise<AmcContract>;
  deleteAmcContract(id: number): Promise<void>;
  getAmcContractById(id: number): Promise<AmcContract | null>;
  getAmcContractsByProjectId(projectId: number): Promise<AmcContract[]>;
  getAllAmcContracts(): Promise<AmcContract[]>;
  
  // Project Entity Management
  createProjectEntity(entity: InsertProjectEntity): Promise<ProjectEntity>;
  updateProjectEntity(id: number, entity: Partial<InsertProjectEntity>): Promise<ProjectEntity>;
  deleteProjectEntity(id: number): Promise<void>;
  getProjectEntityById(id: number): Promise<ProjectEntity | null>;
  getProjectEntitiesByProjectId(projectId: number): Promise<ProjectEntity[]>;
  
  // Shared Area Management
  createSharedArea(area: InsertSharedArea): Promise<SharedArea>;
  updateSharedArea(id: number, area: Partial<InsertSharedArea>): Promise<SharedArea>;
  deleteSharedArea(id: number): Promise<void>;
  getSharedAreaById(id: number): Promise<SharedArea | null>;
  getSharedAreasByProjectId(projectId: number): Promise<SharedArea[]>;
  
  // Shared Area Beneficiaries
  createSharedAreaBeneficiary(beneficiary: InsertSharedAreaBeneficiary): Promise<SharedAreaBeneficiary>;
  updateSharedAreaBeneficiary(id: number, beneficiary: Partial<InsertSharedAreaBeneficiary>): Promise<SharedAreaBeneficiary>;
  deleteSharedAreaBeneficiary(id: number): Promise<void>;
  getSharedAreaBeneficiaryById(id: number): Promise<SharedAreaBeneficiary | null>;
  getSharedAreaBeneficiariesByAreaId(areaId: number): Promise<SharedAreaBeneficiary[]>;
  
  // UOM Values
  createAmcEntityUomValue(value: InsertAmcEntityUomValue): Promise<AmcEntityUomValue>;
  updateAmcEntityUomValue(id: number, value: Partial<InsertAmcEntityUomValue>): Promise<AmcEntityUomValue>;
  deleteAmcEntityUomValue(id: number): Promise<void>;
  getAmcEntityUomValueById(id: number): Promise<AmcEntityUomValue | null>;
  getAmcEntityUomValuesByContractId(contractId: number): Promise<AmcEntityUomValue[]>;
  getAmcEntityUomValuesByEntityId(entityId: number): Promise<AmcEntityUomValue[]>;
  
  // AMC Allocations
  createAmcAllocation(allocation: InsertAmcAllocation): Promise<AmcAllocation>;
  updateAmcAllocation(id: number, allocation: Partial<InsertAmcAllocation>): Promise<AmcAllocation>;
  deleteAmcAllocation(id: number): Promise<void>;
  getAmcAllocationById(id: number): Promise<AmcAllocation | null>;
  getAmcAllocationsByContractId(contractId: number): Promise<AmcAllocation[]>;
  getAmcAllocationsByEntityId(entityId: number): Promise<AmcAllocation[]>;
  calculateAmcAllocations(contractId: number): Promise<AmcAllocation[]>;
  
  // Project Entities
  createProjectEntity(entity: InsertProjectEntity): Promise<ProjectEntity>;
  updateProjectEntity(id: number, entity: Partial<InsertProjectEntity>): Promise<ProjectEntity>;
  deleteProjectEntity(id: number): Promise<void>;
  getProjectEntityById(id: number): Promise<ProjectEntity | null>;
  getProjectEntitiesByProjectId(projectId: number): Promise<ProjectEntity[]>;
  getProjectEntitiesByType(projectId: number, type: string): Promise<ProjectEntity[]>;
  
  // Shared Areas
  createSharedArea(area: InsertSharedArea): Promise<SharedArea>;
  updateSharedArea(id: number, area: Partial<InsertSharedArea>): Promise<SharedArea>;
  deleteSharedArea(id: number): Promise<void>;
  getSharedAreaById(id: number): Promise<SharedArea | null>;
  getSharedAreasByProjectId(projectId: number): Promise<SharedArea[]>;
  getSharedAreasByType(projectId: number, type: string): Promise<SharedArea[]>;
  
  // Shared Area Beneficiaries
  createSharedAreaBeneficiary(beneficiary: InsertSharedAreaBeneficiary): Promise<SharedAreaBeneficiary>;
  updateSharedAreaBeneficiary(id: number, beneficiary: Partial<InsertSharedAreaBeneficiary>): Promise<SharedAreaBeneficiary>;
  deleteSharedAreaBeneficiary(id: number): Promise<void>;
  getSharedAreaBeneficiaryById(id: number): Promise<SharedAreaBeneficiary | null>;
  getSharedAreaBeneficiariesBySharedAreaId(sharedAreaId: number): Promise<SharedAreaBeneficiary[]>;
  getSharedAreaBeneficiariesByAreaId(sharedAreaId: number): Promise<SharedAreaBeneficiary[]>;
  getSharedAreaBeneficiariesByEntityId(entityId: number): Promise<SharedAreaBeneficiary[]>;
  
  // AMC Contracts 
  createAmcContract(contract: InsertAmcContract & { userId: number }): Promise<AmcContract>;
  updateAmcContract(id: number, contract: Partial<InsertAmcContract>): Promise<AmcContract>;
  deleteAmcContract(id: number): Promise<void>;
  getAmcContractById(id: number): Promise<AmcContract | null>;
  getAmcContractsByProjectId(projectId: number): Promise<AmcContract[]>;
  getAmcContractsByBudgetItemId(budgetItemId: number): Promise<AmcContract[]>;
  getAllAmcContracts(): Promise<AmcContract[]>;
  
  // AMC Entity UOM Values
  createAmcEntityUomValue(uomValue: InsertAmcEntityUomValue): Promise<AmcEntityUomValue>;
  updateAmcEntityUomValue(id: number, uomValue: Partial<InsertAmcEntityUomValue>): Promise<AmcEntityUomValue>;
  deleteAmcEntityUomValue(id: number): Promise<void>;
  getAmcEntityUomValueById(id: number): Promise<AmcEntityUomValue | null>;
  getAmcEntityUomValuesByContractId(contractId: number): Promise<AmcEntityUomValue[]>;
  getAmcEntityUomValuesByEntityId(entityId: number): Promise<AmcEntityUomValue[]>;
  getAmcEntityUomValuesByUomType(contractId: number, uomType: string): Promise<AmcEntityUomValue[]>;
  
  // Entity Allocation Ratios
  createEntityAllocationRatio(ratio: InsertEntityAllocationRatio): Promise<EntityAllocationRatio>;
  updateEntityAllocationRatio(id: number, ratio: Partial<InsertEntityAllocationRatio>): Promise<EntityAllocationRatio>;
  deleteEntityAllocationRatio(id: number): Promise<void>;
  getEntityAllocationRatioById(id: number): Promise<EntityAllocationRatio | null>;
  getEntityAllocationRatiosByProjectId(projectId: number): Promise<EntityAllocationRatio[]>;
  getEntityAllocationRatiosByUomType(projectId: number, uomType: string): Promise<EntityAllocationRatio[]>;
  getCoreEntityAllocationRatios(projectId: number): Promise<EntityAllocationRatio[]>;
  
  // Entity Ratio Values
  createEntityRatioValue(ratioValue: InsertEntityRatioValue): Promise<EntityRatioValue>;
  updateEntityRatioValue(id: number, ratioValue: Partial<InsertEntityRatioValue>): Promise<EntityRatioValue>;
  deleteEntityRatioValue(id: number): Promise<void>;
  getEntityRatioValueById(id: number): Promise<EntityRatioValue | null>;
  getEntityRatioValuesByRatioId(ratioId: number): Promise<EntityRatioValue[]>;
  getEntityRatioValuesByEntityId(entityId: number): Promise<EntityRatioValue[]>;
  
  // Shared Area Inclusions
  createSharedAreaInclusion(inclusion: InsertSharedAreaInclusion): Promise<SharedAreaInclusion>;
  updateSharedAreaInclusion(id: number, inclusion: Partial<InsertSharedAreaInclusion>): Promise<SharedAreaInclusion>;
  deleteSharedAreaInclusion(id: number): Promise<void>;
  getSharedAreaInclusionById(id: number): Promise<SharedAreaInclusion | null>;
  getSharedAreaInclusionsBySharedAreaId(sharedAreaId: number): Promise<SharedAreaInclusion[]>;
  getSharedAreaInclusionsByEntityId(entityId: number): Promise<SharedAreaInclusion[]>;
  getSharedAreaInclusionsByRatioId(ratioId: number): Promise<SharedAreaInclusion[]>;
  
  // Auto generate core ratios
  generateCoreRatios(projectId: number): Promise<EntityAllocationRatio[]>;
  calculateEntityRatios(ratioId: number): Promise<EntityRatioValue[]>;
  convertUnitOfMeasurement(projectId: number, fromUnit: string, toUnit: string): Promise<boolean>;
  
  // AMC Allocations
  createAmcAllocation(allocation: InsertAmcAllocation): Promise<AmcAllocation>;
  updateAmcAllocation(id: number, allocation: Partial<InsertAmcAllocation>): Promise<AmcAllocation>;
  deleteAmcAllocation(id: number): Promise<void>;
  getAmcAllocationById(id: number): Promise<AmcAllocation | null>;
  getAmcAllocationsByContractId(contractId: number): Promise<AmcAllocation[]>;
  getAmcAllocationsByEntityId(entityId: number): Promise<AmcAllocation[]>;
  calculateAmcAllocations(contractId: number): Promise<AmcAllocation[]>;
  
  // IP Tracking
  trackVisitor(visitor: InsertVisitor): Promise<Visitor>;
  findExistingVisitor(ipAddress: string, visitedPage: string, deviceIdentifier?: string): Promise<Visitor | null>;
  updateVisitor(id: number, visitor: Partial<InsertVisitor>): Promise<Visitor>;
  incrementVisitorClicks(id: number): Promise<Visitor>;
  getAllVisitors(): Promise<Visitor[]>;
  getVisitorById(id: number): Promise<Visitor | null>;
  getVisitorsByIp(ipAddress: string): Promise<Visitor[]>;
  flagSuspiciousVisitor(id: number, reason: string): Promise<Visitor>;
  getSuspiciousVisitors(): Promise<Visitor[]>;
  getVisitorStats(): Promise<{
    totalVisitors: number;
    uniqueIps: number;
    suspiciousCount: number;
    visitorsByDate: Record<string, number>;
    topPages: Array<{page: string, visits: number}>;
    topReferrers: Array<{referrer: string, visits: number}>;
  }>;

  // SEO Intelligence
  // Data Sources
  createSeoDataSource(source: InsertSeoDataSource): Promise<SeoDataSource>;
  updateSeoDataSource(id: number, source: Partial<InsertSeoDataSource>): Promise<SeoDataSource>;
  getSeoDataSourceById(id: number): Promise<SeoDataSource | null>;
  getSeoDataSourceByName(name: string): Promise<SeoDataSource | null>;
  getSeoDataSourceByType(sourceType: string): Promise<SeoDataSource | null>;
  getAllSeoDataSources(): Promise<SeoDataSource[]>;
  syncSeoDataSource(id: number): Promise<SeoDataSource>;
  
  // Keyword Analysis
  createSeoKeywordData(keywordData: InsertSeoKeywordData): Promise<SeoKeywordData>;
  updateSeoKeywordData(id: number, keywordData: Partial<InsertSeoKeywordData>): Promise<SeoKeywordData>;
  getSeoKeywordDataById(id: number): Promise<SeoKeywordData | null>;
  getSeoKeywordDataByKeyword(keyword: string): Promise<SeoKeywordData | null>;
  getAllSeoKeywordData(): Promise<SeoKeywordData[]>;
  generateAiContentSuggestion(keywordId: number): Promise<SeoKeywordData>;
  
  // Backlink Analysis
  createSeoBacklinkData(backlinkData: InsertSeoBacklinkData): Promise<SeoBacklinkData>;
  updateSeoBacklinkData(id: number, backlinkData: Partial<InsertSeoBacklinkData>): Promise<SeoBacklinkData>;
  getSeoBacklinkDataById(id: number): Promise<SeoBacklinkData | null>;
  getSeoBacklinkDataByDomainId(domainId: number): Promise<SeoBacklinkData[]>;
  getAllSeoBacklinkData(): Promise<SeoBacklinkData[]>;
  
  // Ranking Data
  createSeoRankingData(rankingData: InsertSeoRankingData): Promise<SeoRankingData>;
  updateSeoRankingData(id: number, rankingData: Partial<InsertSeoRankingData>): Promise<SeoRankingData>;
  getSeoRankingDataById(id: number): Promise<SeoRankingData | null>;
  getSeoRankingDataByKeyword(keyword: string): Promise<SeoRankingData[]>;
  getSeoRankingDataByDomainId(domainId: number): Promise<SeoRankingData[]>;
  getAllSeoRankingData(): Promise<SeoRankingData[]>;
  
  // Technical Audits
  createSeoTechnicalAudit(audit: InsertSeoTechnicalAudit): Promise<SeoTechnicalAudit>;
  updateSeoTechnicalAudit(id: number, audit: Partial<InsertSeoTechnicalAudit>): Promise<SeoTechnicalAudit>;
  getSeoTechnicalAuditById(id: number): Promise<SeoTechnicalAudit | null>;
  getSeoTechnicalAuditByDomainId(domainId: number): Promise<SeoTechnicalAudit[]>;
  getAllSeoTechnicalAudits(): Promise<SeoTechnicalAudit[]>;
  
  // Content Gap Analysis
  createSeoContentGapAnalysis(analysis: InsertSeoContentGapAnalysis): Promise<SeoContentGapAnalysis>;
  updateSeoContentGapAnalysis(id: number, analysis: Partial<InsertSeoContentGapAnalysis>): Promise<SeoContentGapAnalysis>;
  getSeoContentGapAnalysisById(id: number): Promise<SeoContentGapAnalysis | null>;
  getSeoContentGapAnalysisByDomainId(domainId: number): Promise<SeoContentGapAnalysis[]>;
  getAllSeoContentGapAnalyses(): Promise<SeoContentGapAnalysis[]>;
  
  // Smart Alerts
  createSeoAlert(alert: InsertSeoAlert): Promise<SeoAlert>;
  updateSeoAlert(id: number, alert: Partial<InsertSeoAlert>): Promise<SeoAlert>;
  markAlertAsRead(id: number): Promise<SeoAlert>;
  getSeoAlertById(id: number): Promise<SeoAlert | null>;
  getSeoAlertsByDomainId(domainId: number): Promise<SeoAlert[]>;
  getSeoAlertsByType(alertType: string): Promise<SeoAlert[]>;
  getAllSeoAlerts(): Promise<SeoAlert[]>;
  
  // Original SEO Components (Enhanced)
  // SEO Competitor Analysis
  createSeoCompetitorAnalysis(analysis: InsertSeoCompetitorAnalysis): Promise<SeoCompetitorAnalysis>;
  updateSeoCompetitorAnalysis(id: number, analysis: Partial<InsertSeoCompetitorAnalysis>): Promise<SeoCompetitorAnalysis>;
  updateSeoAnalysisResults(id: number, results: any): Promise<SeoCompetitorAnalysis>;
  getSeoCompetitorAnalysisById(id: number): Promise<SeoCompetitorAnalysis | null>;
  getAllSeoCompetitorAnalyses(): Promise<SeoCompetitorAnalysis[]>;
  generatePredictiveAnalytics(id: number): Promise<SeoCompetitorAnalysis>;
  analyzeSearchIntent(id: number): Promise<SeoCompetitorAnalysis>;
  
  // SEO Recommendations
  createSeoRecommendation(recommendation: InsertSeoRecommendation): Promise<SeoRecommendation>;
  updateSeoRecommendation(id: number, recommendation: Partial<InsertSeoRecommendation>): Promise<SeoRecommendation>;
  getSeoRecommendationById(id: number): Promise<SeoRecommendation | null>;
  getSeoRecommendationsByAnalysisId(analysisId: number): Promise<SeoRecommendation[]>;
  markRecommendationAsCompleted(id: number): Promise<SeoRecommendation>;
  generateRecommendationSteps(id: number): Promise<SeoRecommendation>;
  predictRecommendationImpact(id: number): Promise<SeoRecommendation>;
  
  // Ad Simulations
  createAdSimulation(simulation: InsertAdSimulation): Promise<AdSimulation>;
  updateAdSimulation(id: number, simulation: Partial<InsertAdSimulation>): Promise<AdSimulation>;
  updateAdSimulationResults(id: number, adsDetected: any, adsClicked: any, searchResults: any): Promise<AdSimulation>;
  getAdSimulationById(id: number): Promise<AdSimulation | null>;
  getAdSimulationsByKeyword(keyword: string): Promise<AdSimulation[]>;
  getAllAdSimulations(): Promise<AdSimulation[]>;
  analyzeAdCopyEffectiveness(id: number): Promise<AdSimulation>;
  generateBidStrategySuggestions(id: number): Promise<AdSimulation>;
}

export class MemStorage implements IStorage {
  private inquiries: Map<number, Inquiry>;
  private bookings: Map<number, Booking>;
  private users: Map<number, User>;
  private projects: Map<number, Project>;
  private defects: Map<number, Defect>;
  private images: Map<number, Image>;
  private locations: Map<number, Location>;
  private reports: Map<number, Report>;
  private visitors: Map<number, Visitor>;
  // RERA-specific data stores
  private nrm3Classifications: Map<number, Nrm3Classification>;
  private conditionAssessments: Map<number, ConditionAssessment>;
  private lifecycleCosts: Map<number, LifecycleCost>;
  private reserveFundSettings: Map<number, ReserveFundSettings>;
  // AMC Cost Allocation System maps
  private reraBudgetItems: Map<number, ReraBudgetItem>;
  private projectEntities: Map<number, ProjectEntity>;
  private sharedAreas: Map<number, SharedArea>;
  private sharedAreaBeneficiaries: Map<number, SharedAreaBeneficiary>;
  private amcContracts: Map<number, AmcContract>;
  private amcEntityUomValues: Map<number, AmcEntityUomValue>;
  private amcAllocations: Map<number, AmcAllocation>;
  private entityAllocationRatios: Map<number, EntityAllocationRatio>;
  private entityRatioValues: Map<number, EntityRatioValue>;
  private sharedAreaInclusions: Map<number, SharedAreaInclusion>;
  // SEO Intelligence maps
  private seoDataSources: Map<number, SeoDataSource>;
  private seoKeywordData: Map<number, SeoKeywordData>;
  private seoBacklinkData: Map<number, SeoBacklinkData>;
  private seoRankingData: Map<number, SeoRankingData>;
  private seoTechnicalAudits: Map<number, SeoTechnicalAudit>;
  private seoContentGapAnalyses: Map<number, SeoContentGapAnalysis>;
  private seoAlerts: Map<number, SeoAlert>;
  private seoCompetitorAnalyses: Map<number, SeoCompetitorAnalysis>;
  private seoRecommendations: Map<number, SeoRecommendation>;
  private adSimulations: Map<number, AdSimulation>;
  
  private inquiryId: number;
  private bookingId: number;
  private userId: number;
  private projectId: number;
  private defectId: number;
  private imageId: number;
  private locationId: number;
  private reportId: number;
  private visitorId: number;
  // RERA-specific counters
  private nrm3ClassificationId: number;
  private conditionAssessmentId: number;
  private lifecycleCostId: number;
  private reserveFundSettingsId: number;
  // AMC Cost Allocation System counters
  private reraBudgetItemId: number;
  private projectEntityId: number;
  private sharedAreaId: number;
  private sharedAreaBeneficiaryId: number;
  private amcContractId: number;
  private amcEntityUomValueId: number;
  private amcAllocationId: number;
  private entityAllocationRatioId: number;
  private entityRatioValueId: number;
  private sharedAreaInclusionId: number;
  // SEO Intelligence counters
  private seoDataSourceId: number;
  private seoKeywordDataId: number;
  private seoBacklinkDataId: number;
  private seoRankingDataId: number;
  private seoTechnicalAuditId: number;
  private seoContentGapAnalysisId: number;
  private seoAlertId: number;
  private seoCompetitorAnalysisId: number;
  private seoRecommendationId: number;
  private adSimulationId: number;
  
  private transporter: nodemailer.Transporter;

  constructor() {
    this.inquiries = new Map();
    this.bookings = new Map();
    this.users = new Map();
    this.projects = new Map();
    this.defects = new Map();
    this.images = new Map();
    this.locations = new Map();
    this.reports = new Map();
    this.visitors = new Map();
    // Initialize RERA-specific maps
    this.nrm3Classifications = new Map();
    this.conditionAssessments = new Map();
    this.lifecycleCosts = new Map();
    this.reserveFundSettings = new Map();
    
    // Initialize AMC Cost Allocation System maps
    this.reraBudgetItems = new Map();
    this.projectEntities = new Map();
    this.sharedAreas = new Map();
    this.sharedAreaBeneficiaries = new Map();
    this.amcContracts = new Map();
    this.amcEntityUomValues = new Map();
    this.amcAllocations = new Map();
    this.entityAllocationRatios = new Map();
    this.entityRatioValues = new Map();
    this.sharedAreaInclusions = new Map();
    
    // Initialize SEO Intelligence maps
    this.seoDataSources = new Map();
    this.seoKeywordData = new Map();
    this.seoBacklinkData = new Map();
    this.seoRankingData = new Map();
    this.seoTechnicalAudits = new Map();
    this.seoContentGapAnalyses = new Map();
    this.seoAlerts = new Map();
    this.seoCompetitorAnalyses = new Map();
    this.seoRecommendations = new Map();
    this.adSimulations = new Map();
    
    this.inquiryId = 1;
    this.bookingId = 1;
    this.userId = 1;
    this.projectId = 1;
    this.defectId = 1;
    this.imageId = 1;
    this.locationId = 1;
    this.reportId = 1;
    this.visitorId = 1;
    // Initialize RERA-specific counters
    this.nrm3ClassificationId = 1;
    this.conditionAssessmentId = 1;
    this.lifecycleCostId = 1;
    this.reserveFundSettingsId = 1;
    
    // Initialize AMC Cost Allocation System counters
    this.reraBudgetItemId = 1;
    this.projectEntityId = 1;
    this.sharedAreaId = 1;
    this.sharedAreaBeneficiaryId = 1;
    this.amcContractId = 1;
    this.amcEntityUomValueId = 1;
    this.amcAllocationId = 1;
    this.entityAllocationRatioId = 1;
    this.entityRatioValueId = 1;
    this.sharedAreaInclusionId = 1;
    
    // Initialize SEO Intelligence counters
    this.seoDataSourceId = 1;
    this.seoKeywordDataId = 1;
    this.seoBacklinkDataId = 1;
    this.seoRankingDataId = 1;
    this.seoTechnicalAuditId = 1;
    this.seoContentGapAnalysisId = 1;
    this.seoAlertId = 1;
    this.seoCompetitorAnalysisId = 1;
    this.seoRecommendationId = 1;
    this.adSimulationId = 1;
    
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "465"),
      secure: true, // Use SSL/TLS
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    
    // Create initial admin user if ADMIN_USERNAME and ADMIN_PASSWORD are set
    if (process.env.ADMIN_USERNAME && process.env.ADMIN_PASSWORD) {
      this.createInitialAdminUser();
    } else {
      // Create a default admin user for development
      this.createDefaultUser();
    }
  }
  
  private async createInitialAdminUser() {
    const username = process.env.ADMIN_USERNAME!;
    const password = process.env.ADMIN_PASSWORD!;
    
    const hashedPassword = await hash(password, SALT_ROUNDS);
    const id = this.userId++;
    
    const user: User = {
      id,
      username,
      password: hashedPassword,
      name: "Admin",
      role: "admin",
      createdAt: new Date()
    };
    
    this.users.set(id, user);
    console.log(`Initial admin user created: ${username}`);
  }
  
  private async createDefaultUser() {
    // Create default user for development (username: arif, password: UrbanGrid@2023#)
    const hashedPassword = await hash("UrbanGrid@2023#", SALT_ROUNDS);
    const id = this.userId++;
    
    const user: User = {
      id,
      username: "arif",
      password: hashedPassword,
      name: "Arif",
      role: "admin",
      createdAt: new Date()
    };
    
    this.users.set(id, user);
    console.log("Default admin user created: arif");
  }

  // Inquiries and Bookings
  async createInquiry(insertInquiry: InsertInquiry): Promise<Inquiry> {
    const id = this.inquiryId++;
    const inquiry: Inquiry = {
      ...insertInquiry,
      id,
      leadStatus: "new",
      assignedTo: null,
      followUpDate: null,
      notes: null,
      convertedToBooking: false,
      quotedAmount: null,
      createdAt: new Date(),
    };
    this.inquiries.set(id, inquiry);
    await this.sendInquiryEmail(inquiry);
    return inquiry;
  }

  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const id = this.bookingId++;
    const booking: Booking = {
      ...insertBooking,
      id,
      inquiryId: insertBooking.inquiryId || null,
      assignedTo: insertBooking.assignedTo || null,
      paymentStatus: insertBooking.paymentStatus || "pending",
      amountPaid: insertBooking.amountPaid || 0,
      paymentDate: insertBooking.paymentDate || null,
      inspectionDate: insertBooking.inspectionDate || null,
      inspectionStatus: insertBooking.inspectionStatus || "not_started",
      reportDeliveryDate: insertBooking.reportDeliveryDate || null,
      reportStatus: insertBooking.reportStatus || "not_started",
      customerFeedback: insertBooking.customerFeedback || null,
      notes: insertBooking.notes || null,
      createdAt: new Date(),
    };
    this.bookings.set(id, booking);
    await this.sendBookingEmail(booking);
    
    // If this booking is connected to an inquiry, update the inquiry
    if (booking.inquiryId) {
      const inquiry = this.inquiries.get(booking.inquiryId);
      if (inquiry) {
        this.inquiries.set(booking.inquiryId, {
          ...inquiry,
          convertedToBooking: true,
          leadStatus: "won"
        });
      }
    }
    
    return booking;
  }
  
  // Lead Management
  async getAllInquiries(): Promise<Inquiry[]> {
    return Array.from(this.inquiries.values());
  }
  
  async getInquiryById(id: number): Promise<Inquiry | null> {
    return this.inquiries.get(id) || null;
  }
  
  async updateInquiry(id: number, updatedFields: Partial<InsertInquiry>): Promise<Inquiry> {
    const inquiry = this.inquiries.get(id);
    if (!inquiry) {
      throw new Error("Inquiry not found");
    }
    
    const updatedInquiry: Inquiry = {
      ...inquiry,
      ...updatedFields,
    };
    
    this.inquiries.set(id, updatedInquiry);
    return updatedInquiry;
  }
  
  async getAllBookings(): Promise<Booking[]> {
    return Array.from(this.bookings.values());
  }
  
  async getBookingById(id: number): Promise<Booking | null> {
    return this.bookings.get(id) || null;
  }
  
  async updateBooking(id: number, updatedFields: Partial<InsertBooking>): Promise<Booking> {
    const booking = this.bookings.get(id);
    if (!booking) {
      throw new Error("Booking not found");
    }
    
    const updatedBooking: Booking = {
      ...booking,
      ...updatedFields,
    };
    
    this.bookings.set(id, updatedBooking);
    return updatedBooking;
  }
  
  async getBookingsByInquiryId(inquiryId: number): Promise<Booking[]> {
    return Array.from(this.bookings.values()).filter(
      booking => booking.inquiryId === inquiryId
    );
  }
  
  async convertInquiryToBooking(inquiryId: number, insertBooking: InsertBooking): Promise<Booking> {
    const inquiry = await this.getInquiryById(inquiryId);
    if (!inquiry) {
      throw new Error("Inquiry not found");
    }
    
    // Create a new booking connected to this inquiry
    const bookingData: InsertBooking = {
      ...insertBooking,
      inquiryId,
    };
    
    const booking = await this.createBooking(bookingData);
    
    // Update the inquiry to mark it as converted
    await this.updateInquiry(inquiryId, {
      convertedToBooking: true,
      leadStatus: "won",
    });
    
    return booking;
  }

  async sendInquiryEmail(inquiry: Inquiry): Promise<void> {
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: "info@snagging.me",
      subject: "New Property Inspection Inquiry",
      html: `
        <h2>New Inquiry Details</h2>
        <p><strong>Name:</strong> ${inquiry.name}</p>
        <p><strong>Email:</strong> ${inquiry.email}</p>
        <p><strong>Phone:</strong> ${inquiry.phone}</p>
        <p><strong>Property Type:</strong> ${inquiry.propertyType}</p>
        <p><strong>Message:</strong> ${inquiry.message}</p>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Failed to send inquiry email:', error);
      throw new Error('Failed to send inquiry email notification');
    }
  }

  async sendBookingEmail(booking: Booking): Promise<void> {
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: "info@snagging.me",
      subject: "New Property Inspection Booking",
      html: `
        <h2>New Booking Details</h2>
        <p><strong>Name:</strong> ${booking.name}</p>
        <p><strong>Email:</strong> ${booking.email}</p>
        <p><strong>Phone:</strong> ${booking.phone}</p>
        <p><strong>Service Types:</strong> ${booking.serviceTypes.join(", ")}</p>
        <p><strong>Property Type:</strong> ${booking.propertyType}</p>
        <p><strong>Property Address:</strong> ${booking.propertyAddress}</p>
        <p><strong>Service Date:</strong> ${new Date(booking.serviceDate).toLocaleDateString()}</p>
        <p><strong>Total Amount:</strong> ${booking.totalAmount} AED</p>
        <p><strong>Status:</strong> ${booking.status}</p>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Failed to send booking email:', error);
      throw new Error('Failed to send booking email notification');
    }
  }
  
  // User Authentication
  async createUser(insertUser: InsertUser): Promise<User> {
    // Check if username already exists
    const existingUser = Array.from(this.users.values()).find(
      user => user.username === insertUser.username
    );
    
    if (existingUser) {
      throw new Error("Username already exists");
    }
    
    const id = this.userId++;
    const hashedPassword = await hash(insertUser.password, SALT_ROUNDS);
    
    const user: User = {
      ...insertUser,
      id,
      password: hashedPassword,
      createdAt: new Date(),
    };
    
    this.users.set(id, user);
    return user;
  }
  
  async login(credentials: LoginCredentials): Promise<{ user: User; token: string } | null> {
    const user = Array.from(this.users.values()).find(
      user => user.username === credentials.username
    );
    
    if (!user) {
      return null;
    }
    
    const isPasswordValid = await compare(credentials.password, user.password);
    if (!isPasswordValid) {
      return null;
    }
    
    const token = sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    return { user, token };
  }
  
  async getUserById(id: number): Promise<User | null> {
    return this.users.get(id) || null;
  }
  
  async validateToken(token: string): Promise<User | null> {
    try {
      const decoded = verify(token, JWT_SECRET) as { id: number };
      return this.getUserById(decoded.id);
    } catch (error) {
      return null;
    }
  }
  
  // Projects
  async createProject(insertProject: InsertProject): Promise<Project> {
    const id = this.projectId++;
    
    // Ensure propertySize is properly set to null if undefined
    const propertySize = insertProject.propertySize ?? null;
    
    const project: Project = {
      ...insertProject,
      propertySize,
      id,
      defectCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    this.projects.set(id, project);
    return project;
  }
  
  async updateProject(id: number, updatedFields: Partial<InsertProject>): Promise<Project> {
    const project = this.projects.get(id);
    if (!project) {
      throw new Error("Project not found");
    }
    
    // Ensure propertySize is properly set
    const propertySize = updatedFields.propertySize !== undefined 
      ? updatedFields.propertySize 
      : project.propertySize;
    
    const updatedProject: Project = {
      ...project,
      ...updatedFields,
      propertySize,
      updatedAt: new Date(),
    };
    
    this.projects.set(id, updatedProject);
    return updatedProject;
  }
  
  async getProjectById(id: number): Promise<Project | null> {
    return this.projects.get(id) || null;
  }
  
  async getProjectsByUserId(userId: number): Promise<Project[]> {
    return Array.from(this.projects.values()).filter(
      project => project.userId === userId
    );
  }
  
  async getAllProjects(): Promise<Project[]> {
    return Array.from(this.projects.values());
  }
  
  // Locations
  async createLocation(insertLocation: InsertLocation): Promise<Location> {
    const id = this.locationId++;
    
    // Ensure parentId is properly set to null if undefined
    const parentId = insertLocation.parentId ?? null;
    
    const location: Location = {
      ...insertLocation,
      parentId,
      id,
      createdAt: new Date(),
    };
    
    this.locations.set(id, location);
    return location;
  }
  
  async updateLocation(id: number, updatedFields: Partial<InsertLocation>): Promise<Location> {
    const location = this.locations.get(id);
    if (!location) {
      throw new Error("Location not found");
    }
    
    // Ensure parentId is properly set
    const parentId = updatedFields.parentId !== undefined 
      ? updatedFields.parentId 
      : location.parentId;
    
    const updatedLocation: Location = {
      ...location,
      ...updatedFields,
      parentId
    };
    
    this.locations.set(id, updatedLocation);
    return updatedLocation;
  }
  
  async getLocationById(id: number): Promise<Location | null> {
    return this.locations.get(id) || null;
  }
  
  async getLocationsByProjectId(projectId: number): Promise<Location[]> {
    return Array.from(this.locations.values()).filter(
      location => location.projectId === projectId
    );
  }
  
  async getLocationsByParentId(parentId: number | null, projectId: number): Promise<Location[]> {
    return Array.from(this.locations.values()).filter(
      location => 
        location.projectId === projectId &&
        (parentId === null ? location.parentId === null : location.parentId === parentId)
    );
  }
  
  async deleteLocation(id: number): Promise<void> {
    const location = this.locations.get(id);
    if (!location) {
      throw new Error("Location not found");
    }
    
    // Delete the location
    this.locations.delete(id);
    
    // Also delete all child locations
    const childLocations = Array.from(this.locations.values()).filter(
      loc => loc.parentId === id
    );
    
    for (const childLocation of childLocations) {
      this.locations.delete(childLocation.id);
    }
  }
  
  // Defects
  async createDefect(insertDefect: InsertDefect): Promise<Defect> {
    const id = this.defectId++;
    
    // Ensure photoUrls is properly set to null if undefined
    const photoUrls = insertDefect.photoUrls ?? null;
    
    // Ensure category and assignedTo are properly set to null if undefined
    const category = insertDefect.category ?? null;
    const assignedTo = insertDefect.assignedTo ?? null;
    
    // Ensure locationId is properly set to null if undefined
    const locationId = insertDefect.locationId ?? null;
    
    // Set default values for new fields
    const subCategory = insertDefect.subCategory ?? null;
    const priority = insertDefect.priority ?? null;
    const estimatedCost = insertDefect.estimatedCost ?? null;
    const assignedTeam = insertDefect.assignedTeam ?? null;
    const remedialAction = insertDefect.remedialAction ?? null;
    const inspectorNotes = insertDefect.inspectorNotes ?? null;
    const clientVisible = insertDefect.clientVisible ?? true;
    const dueDate = insertDefect.dueDate ?? null;
    
    const defect: Defect = {
      ...insertDefect,
      photoUrls,
      category,
      subCategory,
      priority,
      estimatedCost,
      assignedTeam,
      remedialAction,
      inspectorNotes,
      clientVisible,
      dueDate,
      assignedTo,
      locationId,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    // Update the defect count on the parent project
    const project = this.projects.get(insertDefect.projectId);
    if (project) {
      const defectCount = (project.defectCount || 0) + 1;
      this.projects.set(project.id, { ...project, defectCount });
    }
    
    this.defects.set(id, defect);
    return defect;
  }
  
  async updateDefect(id: number, updatedFields: Partial<InsertDefect>): Promise<Defect> {
    const defect = this.defects.get(id);
    if (!defect) {
      throw new Error("Defect not found");
    }
    
    // Ensure all nullable fields are properly set
    const photoUrls = updatedFields.photoUrls !== undefined 
      ? updatedFields.photoUrls 
      : defect.photoUrls;
      
    const category = updatedFields.category !== undefined 
      ? updatedFields.category 
      : defect.category;
      
    const assignedTo = updatedFields.assignedTo !== undefined 
      ? updatedFields.assignedTo 
      : defect.assignedTo;
      
    const locationId = updatedFields.locationId !== undefined 
      ? updatedFields.locationId 
      : defect.locationId;
      
    // Handle new fields in updateDefect
    const subCategory = updatedFields.subCategory !== undefined 
      ? updatedFields.subCategory 
      : defect.subCategory;
      
    const priority = updatedFields.priority !== undefined 
      ? updatedFields.priority 
      : defect.priority;
      
    const estimatedCost = updatedFields.estimatedCost !== undefined 
      ? updatedFields.estimatedCost 
      : defect.estimatedCost;
      
    const assignedTeam = updatedFields.assignedTeam !== undefined 
      ? updatedFields.assignedTeam 
      : defect.assignedTeam;
      
    const remedialAction = updatedFields.remedialAction !== undefined 
      ? updatedFields.remedialAction 
      : defect.remedialAction;
      
    const inspectorNotes = updatedFields.inspectorNotes !== undefined 
      ? updatedFields.inspectorNotes 
      : defect.inspectorNotes;
      
    const clientVisible = updatedFields.clientVisible !== undefined 
      ? updatedFields.clientVisible 
      : defect.clientVisible;
      
    const dueDate = updatedFields.dueDate !== undefined 
      ? updatedFields.dueDate 
      : defect.dueDate;
    
    const updatedDefect: Defect = {
      ...defect,
      ...updatedFields,
      photoUrls,
      category,
      subCategory,
      priority,
      estimatedCost,
      assignedTeam,
      remedialAction,
      inspectorNotes,
      clientVisible,
      dueDate,
      assignedTo,
      locationId,
      updatedAt: new Date(),
    };
    
    this.defects.set(id, updatedDefect);
    return updatedDefect;
  }
  
  async getDefectById(id: number): Promise<Defect | null> {
    return this.defects.get(id) || null;
  }
  
  async getDefectsByProjectId(projectId: number): Promise<Defect[]> {
    return Array.from(this.defects.values()).filter(
      defect => defect.projectId === projectId
    );
  }
  
  // Images
  async uploadImage(insertImage: InsertImage): Promise<Image> {
    const id = this.imageId++;
    
    // Ensure defectId is properly set to null if undefined
    const defectId = insertImage.defectId ?? null;
    
    // Default values for new fields
    const description = insertImage.description ?? null;
    const annotations = insertImage.annotations ?? null;
    const isAnnotated = insertImage.isAnnotated ?? false;
    
    const image: Image = {
      ...insertImage,
      defectId,
      description,
      annotations,
      isAnnotated,
      id,
      createdAt: new Date(),
    };
    
    this.images.set(id, image);
    return image;
  }
  
  async getImagesByProjectId(projectId: number): Promise<Image[]> {
    return Array.from(this.images.values()).filter(
      image => image.projectId === projectId
    );
  }
  
  async getImagesByDefectId(defectId: number): Promise<Image[]> {
    return Array.from(this.images.values()).filter(
      image => image.defectId === defectId
    );
  }
  
  async getImageById(id: number): Promise<Image | null> {
    return this.images.get(id) || null;
  }
  
  async updateImage(id: number, updatedFields: Partial<InsertImage>): Promise<Image> {
    const image = this.images.get(id);
    if (!image) {
      throw new Error("Image not found");
    }
    
    // Handle nullable fields properly
    const description = updatedFields.description !== undefined 
      ? updatedFields.description 
      : image.description;
      
    const annotations = updatedFields.annotations !== undefined 
      ? updatedFields.annotations 
      : image.annotations;
      
    const isAnnotated = updatedFields.isAnnotated !== undefined 
      ? updatedFields.isAnnotated 
      : image.isAnnotated;
    
    const updatedImage: Image = {
      ...image,
      ...updatedFields,
      description,
      annotations,
      isAnnotated,
    };
    
    this.images.set(id, updatedImage);
    return updatedImage;
  }
  
  // Reports
  async generateReport(projectId: number): Promise<Report> {
    // Check if project exists
    const project = this.projects.get(projectId);
    if (!project) {
      throw new Error("Project not found");
    }
    
    // Check if report already exists
    const existingReport = Array.from(this.reports.values()).find(
      report => report.projectId === projectId
    );
    
    if (existingReport) {
      // Update existing report
      const updatedReport: Report = {
        ...existingReport,
        status: "generated",
        generatedAt: new Date(),
        updatedAt: new Date(),
        settings: existingReport.settings, // Preserve existing settings
      };
      
      this.reports.set(existingReport.id, updatedReport);
      return updatedReport;
    }
    
    // Create new report
    const id = this.reportId++;
    const report: Report = {
      id,
      projectId,
      reportUrl: `/reports/project-${projectId}-report.pdf`,
      status: "generated",
      generatedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      settings: null,
    };
    
    this.reports.set(id, report);
    return report;
  }
  
  async getReportByProjectId(projectId: number): Promise<Report | null> {
    const report = Array.from(this.reports.values()).find(
      report => report.projectId === projectId
    );
    
    return report || null;
  }
  
  async updateReport(id: number, updatedFields: Partial<InsertReport>): Promise<Report> {
    const report = this.reports.get(id);
    if (!report) {
      throw new Error("Report not found");
    }
    
    // Handle settings field properly
    const settings = updatedFields.settings !== undefined 
      ? updatedFields.settings 
      : report.settings;
    
    const updatedReport: Report = {
      ...report,
      ...updatedFields,
      settings,
      updatedAt: new Date(),
    };
    
    this.reports.set(id, updatedReport);
    return updatedReport;
  }
  
  // IP Tracking methods
  async trackVisitor(insertVisitor: InsertVisitor): Promise<Visitor> {
    // Check if this visitor already exists
    const existingVisitor = await this.findExistingVisitor(
      insertVisitor.ipAddress,
      insertVisitor.visitedPage
    );
    
    if (existingVisitor) {
      // Update existing visitor record
      return this.incrementVisitorClicks(existingVisitor.id);
    }
    
    // Create a new visitor record
    const id = this.visitorId++;
    
    const visitor: Visitor = {
      ...insertVisitor,
      id,
      visitTime: new Date(),
      lastVisitTime: new Date(),
      clickCount: 1,
      isFlagged: false,
      flagReason: null,
      // Ensure these fields are properly set
      userAgent: insertVisitor.userAgent || null,
      referrer: insertVisitor.referrer || null,
      country: insertVisitor.country || null,
      city: insertVisitor.city || null,
      browser: insertVisitor.browser || null,
      device: insertVisitor.device || null,
      operatingSystem: insertVisitor.operatingSystem || null,
      sessionId: insertVisitor.sessionId || null,
      queryParams: insertVisitor.queryParams || null,
      interactionData: insertVisitor.interactionData || null,
      conversionType: insertVisitor.conversionType || "none",
      conversionId: insertVisitor.conversionId || null,
    };
    
    this.visitors.set(id, visitor);
    return visitor;
  }
  
  async findExistingVisitor(ipAddress: string, visitedPage: string, deviceIdentifier?: string): Promise<Visitor | null> {
    // Find visitor with same IP, page, and device in the last 30 minutes
    const thirtyMinutesAgo = new Date(new Date().getTime() - 30 * 60 * 1000);
    
    const visitor = Array.from(this.visitors.values()).find(
      visitor => 
        visitor.ipAddress === ipAddress && 
        visitor.visitedPage === visitedPage &&
        // If deviceIdentifier is provided, match on that too to distinguish different devices
        (deviceIdentifier ? visitor.device === deviceIdentifier : true) &&
        visitor.lastVisitTime > thirtyMinutesAgo
    );
    
    return visitor || null;
  }
  
  async updateVisitor(id: number, updatedFields: Partial<InsertVisitor>): Promise<Visitor> {
    const visitor = this.visitors.get(id);
    if (!visitor) {
      throw new Error("Visitor not found");
    }
    
    const updatedVisitor: Visitor = {
      ...visitor,
      ...updatedFields,
      lastVisitTime: new Date(),
    };
    
    this.visitors.set(id, updatedVisitor);
    return updatedVisitor;
  }
  
  async incrementVisitorClicks(id: number): Promise<Visitor> {
    const visitor = this.visitors.get(id);
    if (!visitor) {
      throw new Error("Visitor not found");
    }
    
    const updatedVisitor: Visitor = {
      ...visitor,
      clickCount: visitor.clickCount + 1,
      lastVisitTime: new Date(),
    };
    
    this.visitors.set(id, updatedVisitor);
    return updatedVisitor;
  }
  
  async getAllVisitors(): Promise<Visitor[]> {
    return Array.from(this.visitors.values());
  }
  
  async getVisitorById(id: number): Promise<Visitor | null> {
    return this.visitors.get(id) || null;
  }
  
  async getVisitorsByIp(ipAddress: string): Promise<Visitor[]> {
    return Array.from(this.visitors.values()).filter(
      visitor => visitor.ipAddress === ipAddress
    );
  }
  
  async flagSuspiciousVisitor(id: number, reason: string): Promise<Visitor> {
    const visitor = this.visitors.get(id);
    if (!visitor) {
      throw new Error("Visitor not found");
    }
    
    const updatedVisitor: Visitor = {
      ...visitor,
      isFlagged: true,
      flagReason: reason,
    };
    
    this.visitors.set(id, updatedVisitor);
    return updatedVisitor;
  }
  
  async getSuspiciousVisitors(): Promise<Visitor[]> {
    return Array.from(this.visitors.values()).filter(
      visitor => visitor.isFlagged
    );
  }
  
  async getVisitorStats(): Promise<{
    totalVisitors: number;
    uniqueIps: number;
    suspiciousCount: number;
    visitorsByDate: Record<string, number>;
    topPages: Array<{page: string, visits: number}>;
    topReferrers: Array<{referrer: string, visits: number}>;
  }> {
    const visitors = Array.from(this.visitors.values());
    
    // Get unique IPs
    const uniqueIps = new Set(visitors.map(v => v.ipAddress)).size;
    
    // Count suspicious visitors
    const suspiciousCount = visitors.filter(v => v.isFlagged).length;
    
    // Group visitors by date
    const visitorsByDate: Record<string, number> = {};
    visitors.forEach(visitor => {
      const date = visitor.visitTime.toISOString().split('T')[0];
      visitorsByDate[date] = (visitorsByDate[date] || 0) + 1;
    });
    
    // Get top pages
    const pageCount: Record<string, number> = {};
    visitors.forEach(visitor => {
      pageCount[visitor.visitedPage] = (pageCount[visitor.visitedPage] || 0) + 1;
    });
    
    const topPages = Object.entries(pageCount)
      .map(([page, visits]) => ({ page, visits }))
      .sort((a, b) => b.visits - a.visits)
      .slice(0, 10);
    
    // Get top referrers
    const referrerCount: Record<string, number> = {};
    visitors.forEach(visitor => {
      if (visitor.referrer) {
        referrerCount[visitor.referrer] = (referrerCount[visitor.referrer] || 0) + 1;
      }
    });
    
    const topReferrers = Object.entries(referrerCount)
      .map(([referrer, visits]) => ({ referrer, visits }))
      .sort((a, b) => b.visits - a.visits)
      .slice(0, 10);
    
    return {
      totalVisitors: visitors.length,
      uniqueIps,
      suspiciousCount,
      visitorsByDate,
      topPages,
      topReferrers,
    };
  }
  
  // Report Settings
  // We'll store report settings in memory for now
  private reportSettings: any = {
    branding: {
      companyName: "Snagging By UrbanGrid",
      primaryColor: "#4CAF50",
      secondaryColor: "#2E7D32",
      logo: null,
      showLogo: true,
      headerText: "Property Inspection Report",
      footerText: "© Snagging By UrbanGrid. All rights reserved."
    },
    layout: {
      pageSize: 'A4',
      orientation: 'portrait',
      marginTop: 20,
      marginRight: 20,
      marginBottom: 20,
      marginLeft: 20,
      useCustomMargins: false
    },
    content: {
      fontFamily: 'default',
      fontSize: 12,
      groupByLocation: true,
      showImages: true,
      maxImagesPerDefect: 3,
      showSeverityIndicators: true,
      includeRecommendations: true,
      includeCoverPage: true,
      includeTableOfContents: true,
      includeExecutiveSummary: true,
      executiveSummaryTemplate: "This report outlines the findings of a property inspection conducted at {{projectAddress}} on {{inspectionDate}}. A total of {{defectCount}} defects were identified during the inspection.",
      showDefectNumbers: true,
      showDefectDates: true,
      showDefectAssignees: false
    },
    isDefault: true,
    name: "Default Template"
  };

  async getReportSettings(): Promise<any> {
    return this.reportSettings;
  }

  async saveReportSettings(settings: any): Promise<any> {
    this.reportSettings = settings;
    return this.reportSettings;
  }

  // RERA NRM3 Classifications
  async createNrm3Classification(classification: InsertNrm3Classification): Promise<Nrm3Classification> {
    const id = this.nrm3ClassificationId++;
    
    const newClassification: Nrm3Classification = {
      ...classification,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    this.nrm3Classifications.set(id, newClassification);
    return newClassification;
  }

  async updateNrm3Classification(id: number, updatedFields: Partial<InsertNrm3Classification>): Promise<Nrm3Classification> {
    const classification = this.nrm3Classifications.get(id);
    if (!classification) {
      throw new Error("Classification not found");
    }
    
    const updatedClassification: Nrm3Classification = {
      ...classification,
      ...updatedFields,
      updatedAt: new Date(),
    };
    
    this.nrm3Classifications.set(id, updatedClassification);
    return updatedClassification;
  }

  async getNrm3ClassificationById(id: number): Promise<Nrm3Classification | null> {
    return this.nrm3Classifications.get(id) || null;
  }

  async getNrm3ClassificationsByProjectId(projectId: number): Promise<Nrm3Classification[]> {
    return Array.from(this.nrm3Classifications.values()).filter(
      classification => classification.projectId === projectId
    );
  }

  async getNrm3ClassificationsByLocationId(locationId: number): Promise<Nrm3Classification[]> {
    return Array.from(this.nrm3Classifications.values()).filter(
      classification => classification.locationId === locationId
    );
  }

  // RERA Condition Assessments
  async createConditionAssessment(assessment: InsertConditionAssessment): Promise<ConditionAssessment> {
    const id = this.conditionAssessmentId++;
    
    const newAssessment: ConditionAssessment = {
      ...assessment,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    this.conditionAssessments.set(id, newAssessment);
    return newAssessment;
  }

  async updateConditionAssessment(id: number, updatedFields: Partial<InsertConditionAssessment>): Promise<ConditionAssessment> {
    const assessment = this.conditionAssessments.get(id);
    if (!assessment) {
      throw new Error("Assessment not found");
    }
    
    const updatedAssessment: ConditionAssessment = {
      ...assessment,
      ...updatedFields,
      updatedAt: new Date(),
    };
    
    this.conditionAssessments.set(id, updatedAssessment);
    return updatedAssessment;
  }

  async getConditionAssessmentById(id: number): Promise<ConditionAssessment | null> {
    return this.conditionAssessments.get(id) || null;
  }

  async getConditionAssessmentsByProjectId(projectId: number): Promise<ConditionAssessment[]> {
    return Array.from(this.conditionAssessments.values()).filter(
      assessment => assessment.projectId === projectId
    );
  }

  async getConditionAssessmentsByLocationId(locationId: number): Promise<ConditionAssessment[]> {
    return Array.from(this.conditionAssessments.values()).filter(
      assessment => assessment.locationId === locationId
    );
  }

  async getConditionAssessmentsByClassificationId(classificationId: number): Promise<ConditionAssessment[]> {
    return Array.from(this.conditionAssessments.values()).filter(
      assessment => assessment.classificationId === classificationId
    );
  }

  // RERA Lifecycle Costs
  async createLifecycleCost(cost: InsertLifecycleCost): Promise<LifecycleCost> {
    const id = this.lifecycleCostId++;
    
    const newCost: LifecycleCost = {
      ...cost,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    this.lifecycleCosts.set(id, newCost);
    return newCost;
  }

  async updateLifecycleCost(id: number, updatedFields: Partial<InsertLifecycleCost>): Promise<LifecycleCost> {
    const cost = this.lifecycleCosts.get(id);
    if (!cost) {
      throw new Error("Lifecycle cost not found");
    }
    
    const updatedCost: LifecycleCost = {
      ...cost,
      ...updatedFields,
      updatedAt: new Date(),
    };
    
    this.lifecycleCosts.set(id, updatedCost);
    return updatedCost;
  }

  async deleteLifecycleCost(id: number): Promise<void> {
    const cost = this.lifecycleCosts.get(id);
    if (!cost) {
      throw new Error("Lifecycle cost not found");
    }
    
    // Delete the lifecycle cost
    this.lifecycleCosts.delete(id);
  }

  async getLifecycleCostById(id: number): Promise<LifecycleCost | null> {
    return this.lifecycleCosts.get(id) || null;
  }

  async getLifecycleCostsByProjectId(projectId: number): Promise<LifecycleCost[]> {
    return Array.from(this.lifecycleCosts.values()).filter(
      cost => cost.projectId === projectId
    );
  }

  async getLifecycleCostsByLocationId(locationId: number): Promise<LifecycleCost[]> {
    return Array.from(this.lifecycleCosts.values()).filter(
      cost => cost.locationId === locationId
    );
  }

  async getLifecycleCostsByClassificationId(classificationId: number): Promise<LifecycleCost[]> {
    return Array.from(this.lifecycleCosts.values()).filter(
      cost => cost.classificationId === classificationId
    );
  }

  async getLifecycleCostsByAssessmentId(assessmentId: number): Promise<LifecycleCost[]> {
    return Array.from(this.lifecycleCosts.values()).filter(
      cost => cost.assessmentId === assessmentId
    );
  }

  // Reserve Fund Settings
  async createReserveFundSettings(settings: InsertReserveFundSettings): Promise<ReserveFundSettings> {
    const id = this.reserveFundSettingsId++;
    
    // Ensure nullable fields are properly set
    const startBalance = settings.startBalance ?? 100000;
    const interestRate = settings.interestRate ?? "0.02";
    const inflationRate = settings.inflationRate ?? "0.03";
    const studyPeriod = settings.studyPeriod ?? 30;
    const baseYear = settings.baseYear ?? new Date().getFullYear();
    const annualContribution = settings.annualContribution ?? 0;
    const contributionStrategy = settings.contributionStrategy ?? "flat";
    const escalationRate = settings.escalationRate ?? "0.02";
    const currentContribution = settings.currentContribution ?? null;
    const contributionIncreaseRate = settings.contributionIncreaseRate ?? "2.0";
    const additionalNotes = settings.additionalNotes ?? null;
    
    const newSettings: ReserveFundSettings = {
      id,
      projectId: settings.projectId,
      startBalance,
      interestRate,
      inflationRate, 
      studyPeriod,
      baseYear,
      annualContribution,
      contributionStrategy,
      escalationRate,
      currentContribution,
      contributionIncreaseRate,
      additionalNotes,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    this.reserveFundSettings.set(id, newSettings);
    return newSettings;
  }
  
  async updateReserveFundSettings(id: number, updatedFields: Partial<InsertReserveFundSettings>): Promise<ReserveFundSettings> {
    const settings = this.reserveFundSettings.get(id);
    if (!settings) {
      throw new Error("Reserve fund settings not found");
    }
    
    // Ensure all nullable fields are properly handled
    const startBalance = updatedFields.startBalance !== undefined
      ? updatedFields.startBalance
      : settings.startBalance;
      
    const interestRate = updatedFields.interestRate !== undefined
      ? updatedFields.interestRate
      : settings.interestRate;
      
    const inflationRate = updatedFields.inflationRate !== undefined
      ? updatedFields.inflationRate
      : settings.inflationRate;
      
    const studyPeriod = updatedFields.studyPeriod !== undefined
      ? updatedFields.studyPeriod
      : settings.studyPeriod;
      
    const baseYear = updatedFields.baseYear !== undefined
      ? updatedFields.baseYear
      : settings.baseYear;
      
    const annualContribution = updatedFields.annualContribution !== undefined
      ? updatedFields.annualContribution
      : settings.annualContribution;
      
    const contributionIncreaseRate = updatedFields.contributionIncreaseRate !== undefined
      ? updatedFields.contributionIncreaseRate
      : settings.contributionIncreaseRate;
      
    const additionalNotes = updatedFields.additionalNotes !== undefined
      ? updatedFields.additionalNotes
      : settings.additionalNotes;
    
    // Get the contributionStrategy field from updatedFields if provided
    const contributionStrategy = updatedFields.contributionStrategy !== undefined
      ? updatedFields.contributionStrategy
      : settings.contributionStrategy;
      
    // Get the escalationRate field from updatedFields if provided
    const escalationRate = updatedFields.escalationRate !== undefined
      ? updatedFields.escalationRate
      : settings.escalationRate;
      
    // Get the currentContribution field from updatedFields if provided
    const currentContribution = updatedFields.currentContribution !== undefined
      ? updatedFields.currentContribution
      : settings.currentContribution;
    
    const updatedSettings: ReserveFundSettings = {
      ...settings,
      startBalance,
      interestRate,
      inflationRate,
      studyPeriod,
      baseYear,
      annualContribution,
      contributionIncreaseRate,
      additionalNotes,
      contributionStrategy,
      escalationRate,
      currentContribution,
      updatedAt: new Date(),
    };
    
    this.reserveFundSettings.set(id, updatedSettings);
    return updatedSettings;
  }
  
  async getReserveFundSettingsById(id: number): Promise<ReserveFundSettings | null> {
    return this.reserveFundSettings.get(id) || null;
  }
  
  async getReserveFundSettingsByProjectId(projectId: number): Promise<ReserveFundSettings | null> {
    const settingsList = Array.from(this.reserveFundSettings.values()).filter(
      setting => setting.projectId === projectId
    );
    
    return settingsList.length > 0 ? settingsList[0] : null;
  }
  
  // ==========================================
  // AMC Cost Allocation System Implementation
  // ==========================================
  
  // RERA Budget Items
  async importReraBudgetItems(items: InsertReraBudgetItem[]): Promise<ReraBudgetItem[]> {
    const importedItems: ReraBudgetItem[] = [];
    
    for (const item of items) {
      const id = this.reraBudgetItemId++;
      const reraBudgetItem: ReraBudgetItem = {
        ...item,
        id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      this.reraBudgetItems.set(id, reraBudgetItem);
      importedItems.push(reraBudgetItem);
    }
    
    return importedItems;
  }
  
  async getReraBudgetItems(): Promise<ReraBudgetItem[]> {
    return Array.from(this.reraBudgetItems.values());
  }
  
  async getReraBudgetItemCount(): Promise<number> {
    return this.reraBudgetItems.size;
  }
  
  async getReraBudgetItemById(id: number): Promise<ReraBudgetItem | null> {
    return this.reraBudgetItems.get(id) || null;
  }
  
  async getReraBudgetItemByCode(code: string): Promise<ReraBudgetItem | null> {
    return Array.from(this.reraBudgetItems.values()).find(
      item => item.code === code
    ) || null;
  }
  
  async getReraBudgetItemsByCategory(category: string): Promise<ReraBudgetItem[]> {
    return Array.from(this.reraBudgetItems.values()).filter(
      item => item.category === category
    );
  }
  
  // Project Entities
  async createProjectEntity(entity: InsertProjectEntity): Promise<ProjectEntity> {
    const id = this.projectEntityId++;
    
    // Calculate total component area based on all area fields
    const suitArea = parseFloat(entity.suitArea) || 0;
    const balconyArea = parseFloat(entity.balconyArea || '0') || 0;
    const sellableArea = parseFloat(entity.sellableArea || '0') || 0;
    const applicableArea = parseFloat(entity.applicableArea || '0') || 0;
    const dedicatedCommonArea = parseFloat(entity.dedicatedCommonArea || '0') || 0;
    const parkingBayArea = parseFloat(entity.parkingBayArea || '0') || 0;
    
    // Total component area calculation based on the formula: 
    // TCA = Suit Area + Balcony Area + Dedicated Common Area + Parking Bay Area
    const totalComponentArea = (suitArea + balconyArea + dedicatedCommonArea + parkingBayArea).toString();
    
    const projectEntity: ProjectEntity = {
      ...entity,
      id,
      totalComponentArea,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    this.projectEntities.set(id, projectEntity);
    return projectEntity;
  }
  
  async updateProjectEntity(id: number, entity: Partial<InsertProjectEntity>): Promise<ProjectEntity> {
    const existingEntity = this.projectEntities.get(id);
    if (!existingEntity) {
      throw new Error("Project entity not found");
    }
    
    // Recalculate total component area if any area field has changed
    let totalComponentArea = existingEntity.totalComponentArea;
    if (entity.suitArea !== undefined || 
        entity.balconyArea !== undefined || 
        entity.dedicatedCommonArea !== undefined || 
        entity.parkingBayArea !== undefined) {
          
      // Get all the updated values or use existing values
      const suitArea = parseFloat(entity.suitArea !== undefined ? entity.suitArea : existingEntity.suitArea) || 0;
      const balconyArea = parseFloat(entity.balconyArea !== undefined ? entity.balconyArea : (existingEntity.balconyArea || '0')) || 0;
      const sellableArea = parseFloat(entity.sellableArea !== undefined ? entity.sellableArea : (existingEntity.sellableArea || '0')) || 0;
      const applicableArea = parseFloat(entity.applicableArea !== undefined ? entity.applicableArea : (existingEntity.applicableArea || '0')) || 0;
      const dedicatedCommonArea = parseFloat(entity.dedicatedCommonArea !== undefined ? entity.dedicatedCommonArea : (existingEntity.dedicatedCommonArea || '0')) || 0;
      const parkingBayArea = parseFloat(entity.parkingBayArea !== undefined ? entity.parkingBayArea : (existingEntity.parkingBayArea || '0')) || 0;
      
      // Calculate updated total component area using the formula
      totalComponentArea = (suitArea + balconyArea + dedicatedCommonArea + parkingBayArea).toString();
    }
    
    const updatedEntity: ProjectEntity = {
      ...existingEntity,
      ...entity,
      totalComponentArea,
      updatedAt: new Date(),
    };
    
    this.projectEntities.set(id, updatedEntity);
    return updatedEntity;
  }
  
  async deleteProjectEntity(id: number): Promise<void> {
    if (!this.projectEntities.has(id)) {
      throw new Error("Project entity not found");
    }
    
    this.projectEntities.delete(id);
  }
  
  async getProjectEntityById(id: number): Promise<ProjectEntity | null> {
    return this.projectEntities.get(id) || null;
  }
  
  async getProjectEntitiesByProjectId(projectId: number): Promise<ProjectEntity[]> {
    return Array.from(this.projectEntities.values()).filter(
      entity => entity.projectId === projectId
    );
  }
  
  async getProjectEntitiesByType(projectId: number, type: string): Promise<ProjectEntity[]> {
    return Array.from(this.projectEntities.values()).filter(
      entity => entity.projectId === projectId && entity.type === type
    );
  }
  
  // Shared Areas
  async createSharedArea(area: InsertSharedArea): Promise<SharedArea> {
    const id = this.sharedAreaId++;
    
    const sharedArea: SharedArea = {
      ...area,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    this.sharedAreas.set(id, sharedArea);
    return sharedArea;
  }
  
  async updateSharedArea(id: number, area: Partial<InsertSharedArea>): Promise<SharedArea> {
    const existingArea = this.sharedAreas.get(id);
    if (!existingArea) {
      throw new Error("Shared area not found");
    }
    
    const updatedArea: SharedArea = {
      ...existingArea,
      ...area,
      updatedAt: new Date(),
    };
    
    this.sharedAreas.set(id, updatedArea);
    return updatedArea;
  }
  
  async deleteSharedArea(id: number): Promise<void> {
    if (!this.sharedAreas.has(id)) {
      throw new Error("Shared area not found");
    }
    
    this.sharedAreas.delete(id);
  }
  
  async getSharedAreaById(id: number): Promise<SharedArea | null> {
    return this.sharedAreas.get(id) || null;
  }
  
  async getSharedAreasByProjectId(projectId: number): Promise<SharedArea[]> {
    return Array.from(this.sharedAreas.values()).filter(
      area => area.projectId === projectId
    );
  }
  
  async getSharedAreasByType(projectId: number, type: string): Promise<SharedArea[]> {
    return Array.from(this.sharedAreas.values()).filter(
      area => area.projectId === projectId && area.type === type
    );
  }
  
  // Shared Area Beneficiaries
  async createSharedAreaBeneficiary(beneficiary: InsertSharedAreaBeneficiary): Promise<SharedAreaBeneficiary> {
    const id = this.sharedAreaBeneficiaryId++;
    
    const sharedAreaBeneficiary: SharedAreaBeneficiary = {
      ...beneficiary,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    this.sharedAreaBeneficiaries.set(id, sharedAreaBeneficiary);
    return sharedAreaBeneficiary;
  }
  
  async updateSharedAreaBeneficiary(id: number, beneficiary: Partial<InsertSharedAreaBeneficiary>): Promise<SharedAreaBeneficiary> {
    const existingBeneficiary = this.sharedAreaBeneficiaries.get(id);
    if (!existingBeneficiary) {
      throw new Error("Shared area beneficiary not found");
    }
    
    const updatedBeneficiary: SharedAreaBeneficiary = {
      ...existingBeneficiary,
      ...beneficiary,
      updatedAt: new Date(),
    };
    
    this.sharedAreaBeneficiaries.set(id, updatedBeneficiary);
    return updatedBeneficiary;
  }
  
  async deleteSharedAreaBeneficiary(id: number): Promise<void> {
    if (!this.sharedAreaBeneficiaries.has(id)) {
      throw new Error("Shared area beneficiary not found");
    }
    
    this.sharedAreaBeneficiaries.delete(id);
  }
  
  async getSharedAreaBeneficiaryById(id: number): Promise<SharedAreaBeneficiary | null> {
    return this.sharedAreaBeneficiaries.get(id) || null;
  }
  
  async getSharedAreaBeneficiariesBySharedAreaId(sharedAreaId: number): Promise<SharedAreaBeneficiary[]> {
    return Array.from(this.sharedAreaBeneficiaries.values()).filter(
      beneficiary => beneficiary.sharedAreaId === sharedAreaId
    );
  }
  
  async getSharedAreaBeneficiariesByEntityId(entityId: number): Promise<SharedAreaBeneficiary[]> {
    return Array.from(this.sharedAreaBeneficiaries.values()).filter(
      beneficiary => beneficiary.entityId === entityId
    );
  }
  
  async getSharedAreaBeneficiariesByAreaId(sharedAreaId: number): Promise<SharedAreaBeneficiary[]> {
    // This is an alias for getSharedAreaBeneficiariesBySharedAreaId to support both naming conventions
    return this.getSharedAreaBeneficiariesBySharedAreaId(sharedAreaId);
  }
  
  // AMC Contracts
  async createAmcContract(contract: InsertAmcContract & { userId: number }): Promise<AmcContract> {
    const id = this.amcContractId++;
    
    const amcContract: AmcContract = {
      ...contract,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    this.amcContracts.set(id, amcContract);
    return amcContract;
  }
  
  async updateAmcContract(id: number, contract: Partial<InsertAmcContract>): Promise<AmcContract> {
    const existingContract = this.amcContracts.get(id);
    if (!existingContract) {
      throw new Error("AMC contract not found");
    }
    
    const updatedContract: AmcContract = {
      ...existingContract,
      ...contract,
      updatedAt: new Date(),
    };
    
    this.amcContracts.set(id, updatedContract);
    return updatedContract;
  }
  
  async deleteAmcContract(id: number): Promise<void> {
    if (!this.amcContracts.has(id)) {
      throw new Error("AMC contract not found");
    }
    
    this.amcContracts.delete(id);
  }
  
  async getAmcContractById(id: number): Promise<AmcContract | null> {
    return this.amcContracts.get(id) || null;
  }
  
  async getAmcContractsByProjectId(projectId: number): Promise<AmcContract[]> {
    return Array.from(this.amcContracts.values()).filter(
      contract => contract.projectId === projectId
    );
  }
  
  async getAmcContractsByBudgetItemId(budgetItemId: number): Promise<AmcContract[]> {
    return Array.from(this.amcContracts.values()).filter(
      contract => contract.reraBudgetItemId === budgetItemId
    );
  }
  
  async getAllAmcContracts(): Promise<AmcContract[]> {
    return Array.from(this.amcContracts.values());
  }
  
  // AMC Entity UOM Values
  async createAmcEntityUomValue(uomValue: InsertAmcEntityUomValue): Promise<AmcEntityUomValue> {
    const id = this.amcEntityUomValueId++;
    
    const amcEntityUomValue: AmcEntityUomValue = {
      ...uomValue,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    this.amcEntityUomValues.set(id, amcEntityUomValue);
    return amcEntityUomValue;
  }
  
  async updateAmcEntityUomValue(id: number, uomValue: Partial<InsertAmcEntityUomValue>): Promise<AmcEntityUomValue> {
    const existingUomValue = this.amcEntityUomValues.get(id);
    if (!existingUomValue) {
      throw new Error("AMC entity UOM value not found");
    }
    
    const updatedUomValue: AmcEntityUomValue = {
      ...existingUomValue,
      ...uomValue,
      updatedAt: new Date(),
    };
    
    this.amcEntityUomValues.set(id, updatedUomValue);
    return updatedUomValue;
  }
  
  async deleteAmcEntityUomValue(id: number): Promise<void> {
    if (!this.amcEntityUomValues.has(id)) {
      throw new Error("AMC entity UOM value not found");
    }
    
    this.amcEntityUomValues.delete(id);
  }
  
  async getAmcEntityUomValueById(id: number): Promise<AmcEntityUomValue | null> {
    return this.amcEntityUomValues.get(id) || null;
  }
  
  async getAmcEntityUomValuesByContractId(contractId: number): Promise<AmcEntityUomValue[]> {
    return Array.from(this.amcEntityUomValues.values()).filter(
      uomValue => uomValue.amcContractId === contractId
    );
  }
  
  async getAmcEntityUomValuesByEntityId(entityId: number): Promise<AmcEntityUomValue[]> {
    return Array.from(this.amcEntityUomValues.values()).filter(
      uomValue => uomValue.entityId === entityId
    );
  }
  
  async getAmcEntityUomValuesByUomType(contractId: number, uomType: string): Promise<AmcEntityUomValue[]> {
    return Array.from(this.amcEntityUomValues.values()).filter(
      uomValue => uomValue.amcContractId === contractId && uomValue.uomType === uomType
    );
  }
  
  // AMC Allocations
  async createAmcAllocation(allocation: InsertAmcAllocation): Promise<AmcAllocation> {
    const id = this.amcAllocationId++;
    
    const amcAllocation: AmcAllocation = {
      ...allocation,
      id,
      calculatedAt: new Date(),
      updatedAt: new Date(),
    };
    
    this.amcAllocations.set(id, amcAllocation);
    return amcAllocation;
  }
  
  async updateAmcAllocation(id: number, allocation: Partial<InsertAmcAllocation>): Promise<AmcAllocation> {
    const existingAllocation = this.amcAllocations.get(id);
    if (!existingAllocation) {
      throw new Error("AMC allocation not found");
    }
    
    const updatedAllocation: AmcAllocation = {
      ...existingAllocation,
      ...allocation,
      updatedAt: new Date(),
    };
    
    this.amcAllocations.set(id, updatedAllocation);
    return updatedAllocation;
  }
  
  async deleteAmcAllocation(id: number): Promise<void> {
    if (!this.amcAllocations.has(id)) {
      throw new Error("AMC allocation not found");
    }
    
    this.amcAllocations.delete(id);
  }
  
  async getAmcAllocationById(id: number): Promise<AmcAllocation | null> {
    return this.amcAllocations.get(id) || null;
  }
  
  async getAmcAllocationsByContractId(contractId: number): Promise<AmcAllocation[]> {
    return Array.from(this.amcAllocations.values()).filter(
      allocation => allocation.amcContractId === contractId
    );
  }
  
  async getAmcAllocationsByEntityId(entityId: number): Promise<AmcAllocation[]> {
    return Array.from(this.amcAllocations.values()).filter(
      allocation => allocation.entityId === entityId
    );
  }
  
  async calculateAmcAllocations(contractId: number): Promise<AmcAllocation[]> {
    // Get the contract
    const contract = await this.getAmcContractById(contractId);
    if (!contract) {
      throw new Error("AMC contract not found");
    }
    
    // Get entities that should have allocations calculated
    const projectEntities = await this.getProjectEntitiesByProjectId(contract.projectId);
    if (projectEntities.length === 0) {
      throw new Error("No entities found for this project");
    }
    
    // Get the UOM values for this contract
    const uomValues = await this.getAmcEntityUomValuesByContractId(contractId);
    
    // Get shared areas for this project
    const sharedAreas = await this.getSharedAreasByProjectId(contract.projectId);
    
    // The calculation approach depends on the UOM type for the contract
    const primaryUomType = contract.primaryUomType;
    const secondaryUomType = contract.secondaryUomType; // May be null
    
    // Delete existing allocations for this contract
    const existingAllocations = await this.getAmcAllocationsByContractId(contractId);
    for (const allocation of existingAllocations) {
      await this.deleteAmcAllocation(allocation.id);
    }
    
    // Calculate new allocations
    const allocations: AmcAllocation[] = [];
    const contractBudget = parseFloat(contract.budgetValue || "0");
    
    // Initialize allocation data structure to track entity allocations
    const entityAllocations: { [entityId: number]: number } = {};
    projectEntities.forEach(entity => {
      entityAllocations[entity.id] = 0;
    });
    
    // Step 1: Handle direct allocations (dedicated resources)
    // Get entity UOM values for primary allocation type
    const directUomValues = uomValues.filter(
      uv => uv.uomType === primaryUomType && 
      !uv.isExcluded && 
      (uv.notes ? uv.notes.includes("direct") : false) // Filter UOM values marked as direct allocations
    );
    
    // Calculate total direct allocation value
    let totalDirectValue = 0;
    directUomValues.forEach(uv => {
      totalDirectValue += parseFloat(uv.value);
    });
    
    // Calculate direct allocation percentages
    let totalDirectAllocation = 0;
    if (totalDirectValue > 0) {
      directUomValues.forEach(uv => {
        const percent = (parseFloat(uv.value) / totalDirectValue) * 100;
        entityAllocations[uv.entityId] += percent;
        totalDirectAllocation += percent;
      });
    }
    
    // Step 2: Handle shared areas with specific beneficiaries
    for (const area of sharedAreas) {
      // Skip areas that aren't marked as shared in this contract
      if (!area.description || !area.description.includes("shared")) continue;
      
      // Get beneficiaries for this shared area
      const beneficiaries = await this.getSharedAreaBeneficiariesBySharedAreaId(area.id);
      if (beneficiaries.length === 0) continue;
      
      // Get UOM value for this shared area
      const areaUomValue = uomValues.find(
        uv => (uv.notes ? uv.notes.includes(`shared:${area.id}`) : false) && uv.uomType === primaryUomType
      );
      
      if (!areaUomValue) continue;
      
      // Calculate allocation for this shared area
      const areaAllocation = parseFloat(areaUomValue.value);
      
      // Distribute shared allocation among beneficiaries based on their percentages
      let totalBeneficiaryPercent = 0;
      beneficiaries.forEach(ben => {
        totalBeneficiaryPercent += parseFloat(ben.allocationPercentage);
      });
      
      if (totalBeneficiaryPercent > 0) {
        beneficiaries.forEach(ben => {
          const benPercent = parseFloat(ben.allocationPercentage);
          const entityShare = (benPercent / totalBeneficiaryPercent) * areaAllocation;
          entityAllocations[ben.entityId] += entityShare;
        });
      }
    }
    
    // Step 3: Handle global shared resources (shared by all entities)
    // Get UOM values marked as globally shared
    const globalSharedUomValues = uomValues.filter(
      uv => uv.uomType === primaryUomType && 
      !uv.isExcluded && 
      (uv.notes ? uv.notes.includes("global") : false) // Filter UOM values marked as globally shared
    );
    
    // Calculate total global shared allocation
    let totalGlobalValue = 0;
    globalSharedUomValues.forEach(uv => {
      totalGlobalValue += parseFloat(uv.value);
    });
    
    // Distribute global allocations equally among all entities
    if (totalGlobalValue > 0 && projectEntities.length > 0) {
      const perEntityGlobalShare = totalGlobalValue / projectEntities.length;
      projectEntities.forEach(entity => {
        entityAllocations[entity.id] += perEntityGlobalShare;
      });
    }
    
    // Step 4: Calculate final allocation percentages and amounts
    // Get total allocation value
    let totalAllocationValue = 0;
    Object.values(entityAllocations).forEach(value => {
      totalAllocationValue += value;
    });
    
    // Create allocation records
    for (const entity of projectEntities) {
      const rawPercentage = entityAllocations[entity.id];
      const finalPercentage = totalAllocationValue > 0 
        ? (rawPercentage / totalAllocationValue) * 100 
        : 0;
        
      const allocatedAmount = contractBudget > 0 
        ? (finalPercentage / 100) * contractBudget 
        : 0;
      
      // Create allocation record
      const allocation = await this.createAmcAllocation({
        amcContractId: contractId,
        entityId: entity.id,
        allocationPercentage: finalPercentage.toString(),
        allocatedAmount: allocatedAmount.toString(),
        calculationNotes: `Combined allocation using direct, shared and global resources`
      });
      
      allocations.push(allocation);
    }
    
    return allocations;
  }
  
  // Entity Allocation Ratio methods
  async createEntityAllocationRatio(ratio: InsertEntityAllocationRatio): Promise<EntityAllocationRatio> {
    const id = this.entityAllocationRatioId++;
    
    const entityRatio: EntityAllocationRatio = {
      ...ratio,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    this.entityAllocationRatios.set(id, entityRatio);
    return entityRatio;
  }
  
  async updateEntityAllocationRatio(id: number, ratio: Partial<InsertEntityAllocationRatio>): Promise<EntityAllocationRatio> {
    const existingRatio = this.entityAllocationRatios.get(id);
    if (!existingRatio) {
      throw new Error("Entity allocation ratio not found");
    }
    
    const updatedRatio: EntityAllocationRatio = {
      ...existingRatio,
      ...ratio,
      updatedAt: new Date()
    };
    
    this.entityAllocationRatios.set(id, updatedRatio);
    return updatedRatio;
  }
  
  async deleteEntityAllocationRatio(id: number): Promise<void> {
    const ratio = this.entityAllocationRatios.get(id);
    if (!ratio) {
      throw new Error("Entity allocation ratio not found");
    }
    
    // Delete the ratio
    this.entityAllocationRatios.delete(id);
    
    // Delete related ratio values
    const relatedValues = Array.from(this.entityRatioValues.values()).filter(
      value => value.ratioId === id
    );
    
    for (const value of relatedValues) {
      this.entityRatioValues.delete(value.id);
    }
    
    // Delete related shared area inclusions
    const relatedInclusions = Array.from(this.sharedAreaInclusions.values()).filter(
      inclusion => inclusion.ratioId === id
    );
    
    for (const inclusion of relatedInclusions) {
      this.sharedAreaInclusions.delete(inclusion.id);
    }
  }
  
  async getEntityAllocationRatioById(id: number): Promise<EntityAllocationRatio | null> {
    return this.entityAllocationRatios.get(id) || null;
  }
  
  async getEntityAllocationRatiosByProjectId(projectId: number): Promise<EntityAllocationRatio[]> {
    return Array.from(this.entityAllocationRatios.values()).filter(
      ratio => ratio.projectId === projectId
    );
  }
  
  async getEntityAllocationRatiosByUomType(projectId: number, uomType: string): Promise<EntityAllocationRatio[]> {
    return Array.from(this.entityAllocationRatios.values()).filter(
      ratio => ratio.projectId === projectId && ratio.uomType === uomType
    );
  }
  
  async getCoreEntityAllocationRatios(projectId: number): Promise<EntityAllocationRatio[]> {
    return Array.from(this.entityAllocationRatios.values()).filter(
      ratio => ratio.projectId === projectId && ratio.isCore === true
    );
  }
  
  // Entity Ratio Value methods
  async createEntityRatioValue(ratioValue: InsertEntityRatioValue): Promise<EntityRatioValue> {
    const id = this.entityRatioValueId++;
    
    const value: EntityRatioValue = {
      ...ratioValue,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    this.entityRatioValues.set(id, value);
    return value;
  }
  
  async updateEntityRatioValue(id: number, ratioValue: Partial<InsertEntityRatioValue>): Promise<EntityRatioValue> {
    const existingValue = this.entityRatioValues.get(id);
    if (!existingValue) {
      throw new Error("Entity ratio value not found");
    }
    
    const updatedValue: EntityRatioValue = {
      ...existingValue,
      ...ratioValue,
      updatedAt: new Date()
    };
    
    this.entityRatioValues.set(id, updatedValue);
    return updatedValue;
  }
  
  async deleteEntityRatioValue(id: number): Promise<void> {
    const value = this.entityRatioValues.get(id);
    if (!value) {
      throw new Error("Entity ratio value not found");
    }
    
    this.entityRatioValues.delete(id);
  }
  
  async getEntityRatioValueById(id: number): Promise<EntityRatioValue | null> {
    return this.entityRatioValues.get(id) || null;
  }
  
  async getEntityRatioValuesByRatioId(ratioId: number): Promise<EntityRatioValue[]> {
    return Array.from(this.entityRatioValues.values()).filter(
      value => value.ratioId === ratioId
    );
  }
  
  async getEntityRatioValuesByEntityId(entityId: number): Promise<EntityRatioValue[]> {
    return Array.from(this.entityRatioValues.values()).filter(
      value => value.entityId === entityId
    );
  }
  
  // Shared Area Inclusion methods
  async createSharedAreaInclusion(inclusion: InsertSharedAreaInclusion): Promise<SharedAreaInclusion> {
    const id = this.sharedAreaInclusionId++;
    
    const areaInclusion: SharedAreaInclusion = {
      ...inclusion,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    this.sharedAreaInclusions.set(id, areaInclusion);
    return areaInclusion;
  }
  
  async updateSharedAreaInclusion(id: number, inclusion: Partial<InsertSharedAreaInclusion>): Promise<SharedAreaInclusion> {
    const existingInclusion = this.sharedAreaInclusions.get(id);
    if (!existingInclusion) {
      throw new Error("Shared area inclusion not found");
    }
    
    const updatedInclusion: SharedAreaInclusion = {
      ...existingInclusion,
      ...inclusion,
      updatedAt: new Date()
    };
    
    this.sharedAreaInclusions.set(id, updatedInclusion);
    return updatedInclusion;
  }
  
  async deleteSharedAreaInclusion(id: number): Promise<void> {
    const inclusion = this.sharedAreaInclusions.get(id);
    if (!inclusion) {
      throw new Error("Shared area inclusion not found");
    }
    
    this.sharedAreaInclusions.delete(id);
  }
  
  async getSharedAreaInclusionById(id: number): Promise<SharedAreaInclusion | null> {
    return this.sharedAreaInclusions.get(id) || null;
  }
  
  async getSharedAreaInclusionsBySharedAreaId(sharedAreaId: number): Promise<SharedAreaInclusion[]> {
    return Array.from(this.sharedAreaInclusions.values()).filter(
      inclusion => inclusion.sharedAreaId === sharedAreaId
    );
  }
  
  async getSharedAreaInclusionsByEntityId(entityId: number): Promise<SharedAreaInclusion[]> {
    return Array.from(this.sharedAreaInclusions.values()).filter(
      inclusion => inclusion.entityId === entityId
    );
  }
  
  async getSharedAreaInclusionsByRatioId(ratioId: number): Promise<SharedAreaInclusion[]> {
    return Array.from(this.sharedAreaInclusions.values()).filter(
      inclusion => inclusion.ratioId === ratioId
    );
  }
  
  // Auto generate core ratios
  async generateCoreRatios(projectId: number): Promise<EntityAllocationRatio[]> {
    // Get project entities to calculate core ratios
    const entities = Array.from(this.projectEntities.values()).filter(
      entity => entity.projectId === projectId
    );
    
    if (entities.length === 0) {
      throw new Error("No entities found for this project");
    }
    
    const coreRatios: EntityAllocationRatio[] = [];
    
    // 1. Create sellable area ratio if it doesn't exist
    let sellableAreaRatio = Array.from(this.entityAllocationRatios.values()).find(
      ratio => ratio.projectId === projectId && ratio.name === "Sellable Area Ratio" && ratio.isCore === true
    );
    
    if (!sellableAreaRatio) {
      sellableAreaRatio = await this.createEntityAllocationRatio({
        projectId,
        name: "Sellable Area Ratio",
        description: "Ratio based on sellable area of each entity",
        uomType: "area_based",
        isCore: true,
        isAutoGenerated: true,
        formula: "sellableArea / totalSellableArea",
        unitOfMeasurement: "sq.m"
      });
      
      coreRatios.push(sellableAreaRatio);
      
      // Calculate total sellable area
      const totalSellableArea = entities.reduce((sum, entity) => {
        // Parse if string, default to 0 if null or failed parse
        const sellableArea = parseFloat(entity.sellableArea) || 0;
        return sum + sellableArea;
      }, 0);
      
      // Create ratio values for each entity
      for (const entity of entities) {
        const sellableArea = parseFloat(entity.sellableArea) || 0;
        const ratioValue = (sellableArea / totalSellableArea) * 100;
        
        await this.createEntityRatioValue({
          ratioId: sellableAreaRatio.id,
          entityId: entity.id,
          value: ratioValue.toFixed(4),
          isManualOverride: false
        });
      }
    } else {
      coreRatios.push(sellableAreaRatio);
    }
    
    // 2. Create applicable area ratio if it doesn't exist
    let applicableAreaRatio = Array.from(this.entityAllocationRatios.values()).find(
      ratio => ratio.projectId === projectId && ratio.name === "Applicable Area Ratio" && ratio.isCore === true
    );
    
    if (!applicableAreaRatio) {
      applicableAreaRatio = await this.createEntityAllocationRatio({
        projectId,
        name: "Applicable Area Ratio",
        description: "Ratio based on applicable area (sellable + balcony) of each entity",
        uomType: "area_based",
        isCore: true,
        isAutoGenerated: true,
        formula: "applicableArea / totalApplicableArea",
        unitOfMeasurement: "sq.m"
      });
      
      coreRatios.push(applicableAreaRatio);
      
      // Calculate total applicable area
      const totalApplicableArea = entities.reduce((sum, entity) => {
        // Parse if string, default to 0 if null or failed parse
        const applicableArea = parseFloat(entity.applicableArea) || 0;
        return sum + applicableArea;
      }, 0);
      
      // Create ratio values for each entity
      for (const entity of entities) {
        const applicableArea = parseFloat(entity.applicableArea) || 0;
        const ratioValue = (applicableArea / totalApplicableArea) * 100;
        
        await this.createEntityRatioValue({
          ratioId: applicableAreaRatio.id,
          entityId: entity.id,
          value: ratioValue.toFixed(4),
          isManualOverride: false
        });
      }
    } else {
      coreRatios.push(applicableAreaRatio);
    }
    
    // 3. Create headcount ratio if it doesn't exist
    let headcountRatio = Array.from(this.entityAllocationRatios.values()).find(
      ratio => ratio.projectId === projectId && ratio.name === "Headcount Ratio" && ratio.isCore === true
    );
    
    if (!headcountRatio) {
      headcountRatio = await this.createEntityAllocationRatio({
        projectId,
        name: "Headcount Ratio",
        description: "Ratio based on headcount of each entity",
        uomType: "headcount_based",
        isCore: true,
        isAutoGenerated: true,
        formula: "headcount / totalHeadcount",
        unitOfMeasurement: "person"
      });
      
      coreRatios.push(headcountRatio);
      
      // Calculate total headcount
      const totalHeadcount = entities.reduce((sum, entity) => {
        // Parse if string, default to 0 if null or failed parse
        const headcount = parseInt(entity.headcount as string) || 0;
        return sum + headcount;
      }, 0);
      
      // Create ratio values for each entity
      for (const entity of entities) {
        const headcount = parseInt(entity.headcount as string) || 0;
        const ratioValue = (headcount / totalHeadcount) * 100;
        
        await this.createEntityRatioValue({
          ratioId: headcountRatio.id,
          entityId: entity.id,
          value: ratioValue.toFixed(4),
          isManualOverride: false
        });
      }
    } else {
      coreRatios.push(headcountRatio);
    }
    
    return coreRatios;
  }
  
  async calculateEntityRatios(ratioId: number): Promise<EntityRatioValue[]> {
    // Get the ratio
    const ratio = await this.getEntityAllocationRatioById(ratioId);
    if (!ratio) {
      throw new Error("Ratio not found");
    }
    
    // Get all ratio values for this ratio
    const existingRatioValues = await this.getEntityRatioValuesByRatioId(ratioId);
    
    // Get project entities
    const entities = Array.from(this.projectEntities.values()).filter(
      entity => entity.projectId === ratio.projectId
    );
    
    if (entities.length === 0) {
      throw new Error("No entities found for this project");
    }
    
    // Get shared area inclusions for this ratio
    const sharedAreaInclusions = await this.getSharedAreaInclusionsByRatioId(ratioId);
    
    // Calculate total component area based on UOM type
    let totalComponentArea = 0;
    
    if (ratio.uomType === "area_based") {
      // For area-based ratios
      for (const entity of entities) {
        // Get base area value from entity
        let baseArea = 0;
        
        if (ratio.name === "Sellable Area Ratio") {
          baseArea = parseFloat(entity.sellableArea) || 0;
        } else if (ratio.name === "Applicable Area Ratio") {
          baseArea = parseFloat(entity.applicableArea) || 0;
        } else {
          // For custom area ratios, use either suitArea or totalComponentArea
          baseArea = parseFloat(entity.totalComponentArea) || parseFloat(entity.suitArea) || 0;
        }
        
        // Add entity base area to total
        totalComponentArea += baseArea;
        
        // Add shared areas for this entity if included
        for (const inclusion of sharedAreaInclusions) {
          if (inclusion.entityId === entity.id) {
            // Get the shared area
            const sharedArea = this.sharedAreas.get(inclusion.sharedAreaId);
            if (sharedArea) {
              // If weightFactor is 1, add entire area; otherwise add weighted portion
              const weightedArea = parseFloat(sharedArea.area) * (inclusion.weightFactor || 1);
              totalComponentArea += weightedArea;
            }
          }
        }
      }
    } else if (ratio.uomType === "headcount_based") {
      // For headcount-based ratios
      totalComponentArea = entities.reduce((sum, entity) => {
        return sum + (parseInt(entity.headcount as string) || 0);
      }, 0);
    } else if (ratio.uomType === "parking_based") {
      // For parking-based ratios
      totalComponentArea = entities.reduce((sum, entity) => {
        return sum + (parseInt(entity.parkingBays as string) || 0);
      }, 0);
    } else if (ratio.uomType === "consumption_based") {
      // Custom calculation for consumption-based ratios
      // Would need UOM values from amcEntityUomValues
      totalComponentArea = 1; // Placeholder
    }
    
    // Create/update ratio values for each entity
    const updatedRatioValues: EntityRatioValue[] = [];
    
    for (const entity of entities) {
      // Calculate entity's component
      let entityComponent = 0;
      
      if (ratio.uomType === "area_based") {
        // Get base area value from entity
        let baseArea = 0;
        
        if (ratio.name === "Sellable Area Ratio") {
          baseArea = parseFloat(entity.sellableArea) || 0;
        } else if (ratio.name === "Applicable Area Ratio") {
          baseArea = parseFloat(entity.applicableArea) || 0;
        } else {
          // For custom area ratios, use either suitArea or totalComponentArea
          baseArea = parseFloat(entity.totalComponentArea) || parseFloat(entity.suitArea) || 0;
        }
        
        entityComponent = baseArea;
        
        // Add shared areas for this entity if included
        for (const inclusion of sharedAreaInclusions) {
          if (inclusion.entityId === entity.id) {
            // Get the shared area
            const sharedArea = this.sharedAreas.get(inclusion.sharedAreaId);
            if (sharedArea) {
              // If weightFactor is 1, add entire area; otherwise add weighted portion
              const weightedArea = parseFloat(sharedArea.area) * (inclusion.weightFactor || 1);
              entityComponent += weightedArea;
            }
          }
        }
      } else if (ratio.uomType === "headcount_based") {
        entityComponent = parseInt(entity.headcount as string) || 0;
      } else if (ratio.uomType === "parking_based") {
        entityComponent = parseInt(entity.parkingBays as string) || 0;
      } else if (ratio.uomType === "consumption_based") {
        // Custom calculation for consumption-based ratios
        entityComponent = 0; // Placeholder
      }
      
      // Calculate ratio value (as percentage)
      const ratioValue = totalComponentArea > 0 ? (entityComponent / totalComponentArea) * 100 : 0;
      
      // Find existing ratio value or create new one
      const existingValue = existingRatioValues.find(v => v.entityId === entity.id);
      
      if (existingValue && !existingValue.isManualOverride) {
        // Update if not manually overridden
        const updatedValue = await this.updateEntityRatioValue(existingValue.id, {
          value: ratioValue.toFixed(4)
        });
        updatedRatioValues.push(updatedValue);
      } else if (!existingValue) {
        // Create new ratio value
        const newValue = await this.createEntityRatioValue({
          ratioId: ratio.id,
          entityId: entity.id,
          value: ratioValue.toFixed(4),
          isManualOverride: false
        });
        updatedRatioValues.push(newValue);
      } else {
        // Keep manually overridden values as-is
        updatedRatioValues.push(existingValue);
      }
    }
    
    return updatedRatioValues;
  }
  
  async convertUnitOfMeasurement(projectId: number, fromUnit: string, toUnit: string): Promise<boolean> {
    if (fromUnit === toUnit) {
      return true; // No conversion needed
    }
    
    // Define conversion factor
    let conversionFactor = 1;
    
    if (fromUnit === "sq.m" && toUnit === "sq.ft") {
      conversionFactor = 10.7639; // 1 sq.m = 10.7639 sq.ft
    } else if (fromUnit === "sq.ft" && toUnit === "sq.m") {
      conversionFactor = 0.092903; // 1 sq.ft = 0.092903 sq.m
    } else {
      throw new Error(`Unsupported conversion from ${fromUnit} to ${toUnit}`);
    }
    
    try {
      // Update project entities
      const entities = Array.from(this.projectEntities.values()).filter(
        entity => entity.projectId === projectId
      );
      
      for (const entity of entities) {
        const suitArea = parseFloat(entity.suitArea) * conversionFactor;
        const balconyArea = parseFloat(entity.balconyArea || "0") * conversionFactor;
        const dedicatedCommonArea = parseFloat(entity.dedicatedCommonArea || "0") * conversionFactor;
        const sellableArea = parseFloat(entity.sellableArea) * conversionFactor;
        const applicableArea = parseFloat(entity.applicableArea) * conversionFactor;
        const totalComponentArea = parseFloat(entity.totalComponentArea) * conversionFactor;
        
        await this.updateProjectEntity(entity.id, {
          suitArea: suitArea.toFixed(2),
          balconyArea: balconyArea.toFixed(2),
          dedicatedCommonArea: dedicatedCommonArea.toFixed(2),
          sellableArea: sellableArea.toFixed(2),
          applicableArea: applicableArea.toFixed(2),
          totalComponentArea: totalComponentArea.toFixed(2)
        });
      }
      
      // Update shared areas
      const sharedAreas = Array.from(this.sharedAreas.values()).filter(
        area => area.projectId === projectId
      );
      
      for (const area of sharedAreas) {
        const areaSize = parseFloat(area.area) * conversionFactor;
        
        await this.updateSharedArea(area.id, {
          area: areaSize.toFixed(2)
        });
      }
      
      // Update ratio definitions to use new unit
      const areaRatios = Array.from(this.entityAllocationRatios.values()).filter(
        ratio => ratio.projectId === projectId && 
                ratio.uomType === "area_based" && 
                ratio.unitOfMeasurement === fromUnit
      );
      
      for (const ratio of areaRatios) {
        await this.updateEntityAllocationRatio(ratio.id, {
          unitOfMeasurement: toUnit
        });
      }
      
      return true;
    } catch (error) {
      console.error("Error during unit conversion:", error);
      return false;
    }
  }

  // ============== SEO Intelligence Implementation ==============
  
  // Data Sources & APIs
  async createSeoDataSource(source: InsertSeoDataSource): Promise<SeoDataSource> {
    const id = this.seoDataSourceId++;
    const newSource: SeoDataSource = {
      ...source,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: source.status || 'active',
      lastSyncAt: source.lastSyncAt || null
    };
    
    this.seoDataSources.set(id, newSource);
    return newSource;
  }
  
  async updateSeoDataSource(id: number, source: Partial<InsertSeoDataSource>): Promise<SeoDataSource> {
    const existingSource = this.seoDataSources.get(id);
    if (!existingSource) {
      throw new Error("SEO data source not found");
    }
    
    const updatedSource: SeoDataSource = {
      ...existingSource,
      ...source,
      updatedAt: new Date()
    };
    
    this.seoDataSources.set(id, updatedSource);
    return updatedSource;
  }
  
  async getSeoDataSourceById(id: number): Promise<SeoDataSource | null> {
    return this.seoDataSources.get(id) || null;
  }
  
  async getSeoDataSourceByName(name: string): Promise<SeoDataSource | null> {
    const sources = Array.from(this.seoDataSources.values());
    return sources.find(source => source.name === name) || null;
  }
  
  async getSeoDataSourceByType(sourceType: string): Promise<SeoDataSource | null> {
    const sources = Array.from(this.seoDataSources.values());
    return sources.find(source => source.sourceType === sourceType) || null;
  }
  
  async getAllSeoDataSources(): Promise<SeoDataSource[]> {
    return Array.from(this.seoDataSources.values());
  }
  
  async syncSeoDataSource(id: number): Promise<SeoDataSource> {
    const existingSource = this.seoDataSources.get(id);
    if (!existingSource) {
      throw new Error("SEO data source not found");
    }
    
    // Update the lastSyncAt timestamp
    const updatedSource: SeoDataSource = {
      ...existingSource,
      lastSyncAt: new Date(),
      updatedAt: new Date()
    };
    
    this.seoDataSources.set(id, updatedSource);
    return updatedSource;
  }
  
  // Keyword Analysis
  async createSeoKeywordData(keywordData: InsertSeoKeywordData): Promise<SeoKeywordData> {
    const id = this.seoKeywordDataId++;
    const newKeywordData: SeoKeywordData = {
      ...keywordData,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
      isProcessed: keywordData.isProcessed || false
    };
    
    this.seoKeywordData.set(id, newKeywordData);
    return newKeywordData;
  }
  
  async updateSeoKeywordData(id: number, keywordData: Partial<InsertSeoKeywordData>): Promise<SeoKeywordData> {
    const existingKeywordData = this.seoKeywordData.get(id);
    if (!existingKeywordData) {
      throw new Error("SEO keyword data not found");
    }
    
    const updatedKeywordData: SeoKeywordData = {
      ...existingKeywordData,
      ...keywordData,
      updatedAt: new Date()
    };
    
    this.seoKeywordData.set(id, updatedKeywordData);
    return updatedKeywordData;
  }
  
  async getSeoKeywordDataById(id: number): Promise<SeoKeywordData | null> {
    return this.seoKeywordData.get(id) || null;
  }
  
  async getSeoKeywordDataByKeyword(keyword: string): Promise<SeoKeywordData | null> {
    const keywordDataArray = Array.from(this.seoKeywordData.values());
    return keywordDataArray.find(data => data.keyword === keyword) || null;
  }
  
  async getAllSeoKeywordData(options?: { 
    keyword?: string;
    minVolume?: number;
    maxVolume?: number;
    maxDifficulty?: number;
    searchIntentType?: string;
    limit?: number;
    offset?: number;
  }): Promise<SeoKeywordData[]> {
    let keywordDataArray = Array.from(this.seoKeywordData.values());
    
    // Apply filters if options are provided
    if (options) {
      if (options.keyword) {
        keywordDataArray = keywordDataArray.filter(data => 
          data.keyword.toLowerCase().includes(options.keyword!.toLowerCase())
        );
      }
      
      if (options.minVolume !== undefined) {
        keywordDataArray = keywordDataArray.filter(data => 
          data.volume !== undefined && data.volume !== null && data.volume >= options.minVolume!
        );
      }
      
      if (options.maxVolume !== undefined) {
        keywordDataArray = keywordDataArray.filter(data => 
          data.volume !== undefined && data.volume !== null && data.volume <= options.maxVolume!
        );
      }
      
      if (options.maxDifficulty !== undefined) {
        keywordDataArray = keywordDataArray.filter(data => 
          data.difficulty !== undefined && data.difficulty !== null && data.difficulty <= options.maxDifficulty!
        );
      }
      
      if (options.searchIntentType) {
        keywordDataArray = keywordDataArray.filter(data => 
          data.searchIntentType === options.searchIntentType
        );
      }
      
      // Apply pagination
      if (options.offset !== undefined && options.limit !== undefined) {
        keywordDataArray = keywordDataArray.slice(options.offset, options.offset + options.limit);
      }
    }
    
    return keywordDataArray;
  }
  
  async generateAiContentSuggestion(keywordId: number): Promise<SeoKeywordData> {
    const keywordData = this.seoKeywordData.get(keywordId);
    if (!keywordData) {
      throw new Error("SEO keyword data not found");
    }
    
    // In a real implementation, this would call an AI service
    // For now, we'll generate a simple suggestion based on the keyword and search intent
    const searchIntent = keywordData.searchIntentType || 'informational';
    let contentSuggestion = '';
    
    switch (searchIntent) {
      case 'informational':
        contentSuggestion = `This article should thoroughly explain "${keywordData.keyword}" for readers seeking information. Include a comprehensive definition, key concepts, and practical examples.`;
        break;
      case 'transactional':
        contentSuggestion = `This page should focus on converting visitors interested in "${keywordData.keyword}". Include clear CTAs, pricing information, and benefits.`;
        break;
      case 'navigational':
        contentSuggestion = `Create a simple, clear page about "${keywordData.keyword}" with easy navigation to related resources.`;
        break;
      case 'commercial':
        contentSuggestion = `This content should help users compare and evaluate options related to "${keywordData.keyword}". Include product comparisons, reviews, and decision-making guides.`;
        break;
      default:
        contentSuggestion = `Create comprehensive content about "${keywordData.keyword}" that addresses user needs and queries.`;
    }
    
    const updatedKeywordData: SeoKeywordData = {
      ...keywordData,
      aiGeneratedContent: contentSuggestion,
      isProcessed: true,
      updatedAt: new Date()
    };
    
    this.seoKeywordData.set(keywordId, updatedKeywordData);
    return updatedKeywordData;
  }
  
  // Backlink Analysis
  async createSeoBacklinkData(backlinkData: InsertSeoBacklinkData): Promise<SeoBacklinkData> {
    const id = this.seoBacklinkDataId++;
    const newBacklinkData: SeoBacklinkData = {
      ...backlinkData,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
      firstDiscovered: backlinkData.firstDiscovered || new Date()
    };
    
    this.seoBacklinkData.set(id, newBacklinkData);
    return newBacklinkData;
  }
  
  async updateSeoBacklinkData(id: number, backlinkData: Partial<InsertSeoBacklinkData>): Promise<SeoBacklinkData> {
    const existingBacklinkData = this.seoBacklinkData.get(id);
    if (!existingBacklinkData) {
      throw new Error("SEO backlink data not found");
    }
    
    const updatedBacklinkData: SeoBacklinkData = {
      ...existingBacklinkData,
      ...backlinkData,
      updatedAt: new Date()
    };
    
    this.seoBacklinkData.set(id, updatedBacklinkData);
    return updatedBacklinkData;
  }
  
  async getSeoBacklinkDataById(id: number): Promise<SeoBacklinkData | null> {
    return this.seoBacklinkData.get(id) || null;
  }
  
  async getSeoBacklinkDataByDomainId(domainId: number): Promise<SeoBacklinkData[]> {
    const backlinkDataArray = Array.from(this.seoBacklinkData.values());
    return backlinkDataArray.filter(data => data.domainId === domainId);
  }
  
  async getSeoBacklinksByDomainId(domainId: number): Promise<SeoBacklinkData[]> {
    return this.getSeoBacklinkDataByDomainId(domainId);
  }
  
  async getAllSeoBacklinkData(): Promise<SeoBacklinkData[]> {
    return Array.from(this.seoBacklinkData.values());
  }
  
  // Ranking Data
  async createSeoRankingData(rankingData: InsertSeoRankingData): Promise<SeoRankingData> {
    const id = this.seoRankingDataId++;
    const newRankingData: SeoRankingData = {
      ...rankingData,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.seoRankingData.set(id, newRankingData);
    return newRankingData;
  }
  
  async updateSeoRankingData(id: number, rankingData: Partial<InsertSeoRankingData>): Promise<SeoRankingData> {
    const existingRankingData = this.seoRankingData.get(id);
    if (!existingRankingData) {
      throw new Error("SEO ranking data not found");
    }
    
    const updatedRankingData: SeoRankingData = {
      ...existingRankingData,
      ...rankingData,
      updatedAt: new Date()
    };
    
    this.seoRankingData.set(id, updatedRankingData);
    return updatedRankingData;
  }
  
  async getSeoRankingDataById(id: number): Promise<SeoRankingData | null> {
    return this.seoRankingData.get(id) || null;
  }
  
  async getSeoRankingDataByKeyword(keyword: string): Promise<SeoRankingData[]> {
    const rankingDataArray = Array.from(this.seoRankingData.values());
    return rankingDataArray.filter(data => data.keyword === keyword);
  }
  
  async getSeoRankingDataByDomainId(domainId: number): Promise<SeoRankingData[]> {
    const rankingDataArray = Array.from(this.seoRankingData.values());
    return rankingDataArray.filter(data => data.domainId === domainId);
  }
  
  async getSeoRankingsByDomainId(domainId: number, options?: {
    dateFrom?: Date;
    dateTo?: Date;
    position?: number;
    limit?: number;
    offset?: number;
  }): Promise<SeoRankingData[]> {
    let rankingData = Array.from(this.seoRankingData.values())
      .filter(data => data.domainId === domainId);
    
    // Apply filters if options are provided
    if (options) {
      if (options.dateFrom) {
        rankingData = rankingData.filter(data => 
          new Date(data.searchDate) >= options.dateFrom!
        );
      }
      
      if (options.dateTo) {
        rankingData = rankingData.filter(data => 
          new Date(data.searchDate) <= options.dateTo!
        );
      }
      
      if (options.position !== undefined) {
        rankingData = rankingData.filter(data => 
          data.position === options.position
        );
      }
      
      // Apply pagination
      if (options.offset !== undefined && options.limit !== undefined) {
        rankingData = rankingData.slice(options.offset, options.offset + options.limit);
      }
    }
    
    return rankingData;
  }
  
  async getSeoRankingHistoryByDomainAndKeyword(domainId: number, keyword: string): Promise<SeoRankingData[]> {
    const rankingDataArray = Array.from(this.seoRankingData.values());
    return rankingDataArray.filter(data => 
      data.domainId === domainId && data.keyword === keyword
    );
  }
  
  async getAllSeoRankingData(): Promise<SeoRankingData[]> {
    return Array.from(this.seoRankingData.values());
  }
  
  // Technical Audits
  async createSeoTechnicalAudit(audit: InsertSeoTechnicalAudit): Promise<SeoTechnicalAudit> {
    const id = this.seoTechnicalAuditId++;
    const newAudit: SeoTechnicalAudit = {
      ...audit,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
      issueCount: audit.issueCount || 0
    };
    
    this.seoTechnicalAudits.set(id, newAudit);
    return newAudit;
  }
  
  async updateSeoTechnicalAudit(id: number, audit: Partial<InsertSeoTechnicalAudit>): Promise<SeoTechnicalAudit> {
    const existingAudit = this.seoTechnicalAudits.get(id);
    if (!existingAudit) {
      throw new Error("SEO technical audit not found");
    }
    
    const updatedAudit: SeoTechnicalAudit = {
      ...existingAudit,
      ...audit,
      updatedAt: new Date()
    };
    
    this.seoTechnicalAudits.set(id, updatedAudit);
    return updatedAudit;
  }
  
  async getSeoTechnicalAuditById(id: number): Promise<SeoTechnicalAudit | null> {
    return this.seoTechnicalAudits.get(id) || null;
  }
  
  async getSeoTechnicalAuditByDomainId(domainId: number): Promise<SeoTechnicalAudit[]> {
    const audits = Array.from(this.seoTechnicalAudits.values());
    return audits.filter(audit => audit.domainId === domainId);
  }
  
  async getSeoTechnicalAuditsByDomainId(domainId: number): Promise<SeoTechnicalAudit[]> {
    return this.getSeoTechnicalAuditByDomainId(domainId);
  }
  
  async getAllSeoTechnicalAudits(): Promise<SeoTechnicalAudit[]> {
    return Array.from(this.seoTechnicalAudits.values());
  }
  
  // Content Gap Analysis
  async createSeoContentGapAnalysis(analysis: InsertSeoContentGapAnalysis): Promise<SeoContentGapAnalysis> {
    const id = this.seoContentGapAnalysisId++;
    const newAnalysis: SeoContentGapAnalysis = {
      ...analysis,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
      priorityScore: analysis.priorityScore || 50 // Default to middle priority
    };
    
    this.seoContentGapAnalyses.set(id, newAnalysis);
    return newAnalysis;
  }
  
  async updateSeoContentGapAnalysis(id: number, analysis: Partial<InsertSeoContentGapAnalysis>): Promise<SeoContentGapAnalysis> {
    const existingAnalysis = this.seoContentGapAnalyses.get(id);
    if (!existingAnalysis) {
      throw new Error("SEO content gap analysis not found");
    }
    
    const updatedAnalysis: SeoContentGapAnalysis = {
      ...existingAnalysis,
      ...analysis,
      updatedAt: new Date()
    };
    
    this.seoContentGapAnalyses.set(id, updatedAnalysis);
    return updatedAnalysis;
  }
  
  async getSeoContentGapAnalysisById(id: number): Promise<SeoContentGapAnalysis | null> {
    return this.seoContentGapAnalyses.get(id) || null;
  }
  
  async getSeoContentGapAnalysisByDomainId(domainId: number): Promise<SeoContentGapAnalysis[]> {
    const analyses = Array.from(this.seoContentGapAnalyses.values());
    return analyses.filter(analysis => analysis.domainId === domainId);
  }
  
  async getSeoContentGapAnalysesByDomainId(domainId: number): Promise<SeoContentGapAnalysis[]> {
    return this.getSeoContentGapAnalysisByDomainId(domainId);
  }
  
  async getAllSeoContentGapAnalyses(): Promise<SeoContentGapAnalysis[]> {
    return Array.from(this.seoContentGapAnalyses.values());
  }
  
  // Smart Alerts
  async createSeoAlert(alert: InsertSeoAlert): Promise<SeoAlert> {
    const id = this.seoAlertId++;
    const newAlert: SeoAlert = {
      ...alert,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
      isRead: alert.isRead || false,
      alertSeverity: alert.alertSeverity || 'medium'
    };
    
    this.seoAlerts.set(id, newAlert);
    return newAlert;
  }
  
  async updateSeoAlert(id: number, alert: Partial<InsertSeoAlert>): Promise<SeoAlert> {
    const existingAlert = this.seoAlerts.get(id);
    if (!existingAlert) {
      throw new Error("SEO alert not found");
    }
    
    const updatedAlert: SeoAlert = {
      ...existingAlert,
      ...alert,
      updatedAt: new Date()
    };
    
    this.seoAlerts.set(id, updatedAlert);
    return updatedAlert;
  }
  
  async markAlertAsRead(id: number): Promise<SeoAlert> {
    const existingAlert = this.seoAlerts.get(id);
    if (!existingAlert) {
      throw new Error("SEO alert not found");
    }
    
    const updatedAlert: SeoAlert = {
      ...existingAlert,
      isRead: true,
      updatedAt: new Date()
    };
    
    this.seoAlerts.set(id, updatedAlert);
    return updatedAlert;
  }
  
  async getSeoAlertById(id: number): Promise<SeoAlert | null> {
    return this.seoAlerts.get(id) || null;
  }
  
  async getSeoAlertsByDomainId(domainId: number, options?: {
    isRead?: boolean;
    alertType?: string;
    alertSeverity?: string;
  }): Promise<SeoAlert[]> {
    let alerts = Array.from(this.seoAlerts.values())
      .filter(alert => alert.domainId === domainId);
    
    // Apply filters if options are provided
    if (options) {
      if (options.isRead !== undefined) {
        alerts = alerts.filter(alert => alert.isRead === options.isRead);
      }
      
      if (options.alertType) {
        alerts = alerts.filter(alert => alert.alertType === options.alertType);
      }
      
      if (options.alertSeverity) {
        alerts = alerts.filter(alert => alert.alertSeverity === options.alertSeverity);
      }
    }
    
    return alerts;
  }
  
  async getSeoAlertsByType(alertType: string): Promise<SeoAlert[]> {
    const alerts = Array.from(this.seoAlerts.values());
    return alerts.filter(alert => alert.alertType === alertType);
  }
  
  async getAllSeoAlerts(): Promise<SeoAlert[]> {
    return Array.from(this.seoAlerts.values());
  }
  
  // SEO Competitor Analysis
  async createSeoCompetitorAnalysis(analysis: InsertSeoCompetitorAnalysis): Promise<SeoCompetitorAnalysis> {
    const id = this.seoCompetitorAnalysisId++;
    const newAnalysis: SeoCompetitorAnalysis = {
      ...analysis,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: analysis.status || 'pending',
      results: analysis.results || null,
    };
    
    this.seoCompetitorAnalyses.set(id, newAnalysis);
    return newAnalysis;
  }

  async updateSeoCompetitorAnalysis(id: number, analysis: Partial<InsertSeoCompetitorAnalysis>): Promise<SeoCompetitorAnalysis> {
    const existingAnalysis = this.seoCompetitorAnalyses.get(id);
    if (!existingAnalysis) {
      throw new Error("SEO competitor analysis not found");
    }
    
    const updatedAnalysis: SeoCompetitorAnalysis = {
      ...existingAnalysis,
      ...analysis,
      updatedAt: new Date()
    };
    
    this.seoCompetitorAnalyses.set(id, updatedAnalysis);
    return updatedAnalysis;
  }

  async updateSeoAnalysisResults(id: number, results: any): Promise<SeoCompetitorAnalysis> {
    const existingAnalysis = this.seoCompetitorAnalyses.get(id);
    if (!existingAnalysis) {
      throw new Error("SEO competitor analysis not found");
    }
    
    const updatedAnalysis: SeoCompetitorAnalysis = {
      ...existingAnalysis,
      results,
      status: 'completed',
      updatedAt: new Date()
    };
    
    this.seoCompetitorAnalyses.set(id, updatedAnalysis);
    return updatedAnalysis;
  }

  async getSeoCompetitorAnalysisById(id: number): Promise<SeoCompetitorAnalysis | null> {
    return this.seoCompetitorAnalyses.get(id) || null;
  }

  async getAllSeoCompetitorAnalyses(): Promise<SeoCompetitorAnalysis[]> {
    return Array.from(this.seoCompetitorAnalyses.values());
  }
  
  async generatePredictiveAnalytics(id: number): Promise<SeoCompetitorAnalysis> {
    const existingAnalysis = this.seoCompetitorAnalyses.get(id);
    if (!existingAnalysis) {
      throw new Error("SEO competitor analysis not found");
    }
    
    // In a real implementation, this would call an AI service for predictive analytics
    // For now, we'll generate simulated predictions based on competitor data
    
    // Generate predictive performance data
    const predictivePerformance = {
      sixMonthProjection: {
        organicTraffic: {
          current: Math.floor(Math.random() * 10000) + 5000,
          projected: Math.floor(Math.random() * 15000) + 10000,
          percentageIncrease: Math.floor(Math.random() * 30) + 10
        },
        rankings: {
          improvingKeywords: Math.floor(Math.random() * 50) + 20,
          stableKeywords: Math.floor(Math.random() * 100) + 50,
          decliningKeywords: Math.floor(Math.random() * 20) + 5
        },
        conversions: {
          currentRate: (Math.random() * 2 + 1).toFixed(2),
          projectedRate: (Math.random() * 3 + 2).toFixed(2),
          percentageIncrease: Math.floor(Math.random() * 20) + 5
        }
      },
      competitiveGap: {
        keywordGaps: Math.floor(Math.random() * 100) + 50,
        contentGaps: Math.floor(Math.random() * 30) + 10,
        linkGaps: Math.floor(Math.random() * 200) + 100
      },
      actionableInsights: [
        "Focus on optimizing long-tail keywords to improve organic rankings",
        "Develop content that targets the identified content gaps",
        "Implement backlink acquisition strategy for domains with high authority",
        "Optimize existing content to improve conversions and engagement"
      ]
    };
    
    const updatedAnalysis: SeoCompetitorAnalysis = {
      ...existingAnalysis,
      predictivePerformance,
      updatedAt: new Date()
    };
    
    this.seoCompetitorAnalyses.set(id, updatedAnalysis);
    return updatedAnalysis;
  }
  
  async analyzeSearchIntent(id: number): Promise<SeoCompetitorAnalysis> {
    const existingAnalysis = this.seoCompetitorAnalyses.get(id);
    if (!existingAnalysis) {
      throw new Error("SEO competitor analysis not found");
    }
    
    // In a real implementation, this would call an NLP service to analyze search intent
    // For now, we'll generate simulated search intent analysis
    
    // Get the keywords from the analysis
    const keywords = existingAnalysis.keywords || [];
    
    // Generate search intent analysis for each keyword
    const searchIntentAnalysis = keywords.map(keyword => {
      // Randomly assign an intent type
      const intentTypes = ['informational', 'navigational', 'transactional', 'commercial'];
      const randomIntent = intentTypes[Math.floor(Math.random() * intentTypes.length)];
      
      // Generate content recommendations based on intent
      let contentRecommendation = '';
      switch (randomIntent) {
        case 'informational':
          contentRecommendation = `Create comprehensive guides and how-to content around "${keyword}"`;
          break;
        case 'navigational':
          contentRecommendation = `Optimize brand pages and ensure direct navigation to related "${keyword}" resources`;
          break;
        case 'transactional':
          contentRecommendation = `Focus on product pages, pricing information, and direct CTAs for "${keyword}"`;
          break;
        case 'commercial':
          contentRecommendation = `Develop comparison content, reviews, and detailed product information for "${keyword}"`;
          break;
      }
      
      return {
        keyword,
        intent: randomIntent,
        contentRecommendation,
        searchVolume: Math.floor(Math.random() * 5000) + 100,
        competitorRanking: Math.floor(Math.random() * 10) + 1,
        difficulty: Math.floor(Math.random() * 100) + 1
      };
    });
    
    const updatedAnalysis: SeoCompetitorAnalysis = {
      ...existingAnalysis,
      searchIntentAnalysis,
      updatedAt: new Date()
    };
    
    this.seoCompetitorAnalyses.set(id, updatedAnalysis);
    return updatedAnalysis;
  }

  // SEO Recommendations
  async createSeoRecommendation(recommendation: InsertSeoRecommendation): Promise<SeoRecommendation> {
    const id = this.seoRecommendationId++;
    const newRecommendation: SeoRecommendation = {
      ...recommendation,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
      isCompleted: recommendation.isCompleted || false,
      priority: recommendation.priority || 'medium',
      implementationDetails: recommendation.implementationDetails || null,
    };
    
    this.seoRecommendations.set(id, newRecommendation);
    return newRecommendation;
  }

  async updateSeoRecommendation(id: number, recommendation: Partial<InsertSeoRecommendation>): Promise<SeoRecommendation> {
    const existingRecommendation = this.seoRecommendations.get(id);
    if (!existingRecommendation) {
      throw new Error("SEO recommendation not found");
    }
    
    const updatedRecommendation: SeoRecommendation = {
      ...existingRecommendation,
      ...recommendation,
      updatedAt: new Date()
    };
    
    this.seoRecommendations.set(id, updatedRecommendation);
    return updatedRecommendation;
  }

  async getSeoRecommendationById(id: number): Promise<SeoRecommendation | null> {
    return this.seoRecommendations.get(id) || null;
  }

  async getSeoRecommendationsByAnalysisId(analysisId: number): Promise<SeoRecommendation[]> {
    return Array.from(this.seoRecommendations.values())
      .filter(recommendation => recommendation.analysisId === analysisId);
  }

  async markRecommendationAsCompleted(id: number): Promise<SeoRecommendation> {
    const existingRecommendation = this.seoRecommendations.get(id);
    if (!existingRecommendation) {
      throw new Error("SEO recommendation not found");
    }
    
    const updatedRecommendation: SeoRecommendation = {
      ...existingRecommendation,
      isCompleted: true,
      completedDate: new Date(),
      updatedAt: new Date()
    };
    
    this.seoRecommendations.set(id, updatedRecommendation);
    return updatedRecommendation;
  }
  
  async generateRecommendationSteps(id: number): Promise<SeoRecommendation> {
    const existingRecommendation = this.seoRecommendations.get(id);
    if (!existingRecommendation) {
      throw new Error("SEO recommendation not found");
    }
    
    // Generate steps based on the recommendation category and content
    let aiGeneratedSteps: string[] = [];
    
    // In a real implementation, this would call an AI service to generate steps
    // For now, we'll generate simulated steps based on the category
    
    switch (existingRecommendation.category) {
      case 'keywords':
        aiGeneratedSteps = [
          "Conduct thorough keyword research to identify high-value opportunities",
          "Analyze search volume and competition for target keywords",
          "Create a prioritized list of primary and secondary keywords",
          "Develop a content calendar targeting these keywords",
          "Implement the keywords strategically in page titles, headers, and content"
        ];
        break;
      case 'on-page':
        aiGeneratedSteps = [
          "Audit current page structure and metadata",
          "Optimize page titles and meta descriptions for target keywords",
          "Improve header structure and content hierarchy",
          "Enhance internal linking between related pages",
          "Optimize images with descriptive alt text and reduced file sizes"
        ];
        break;
      case 'off-page':
        aiGeneratedSteps = [
          "Identify high-authority websites for potential backlinks",
          "Develop outreach templates for link building campaigns",
          "Create valuable content assets worthy of gaining backlinks",
          "Monitor brand mentions for link reclamation opportunities",
          "Establish relationships with industry influencers"
        ];
        break;
      case 'technical':
        aiGeneratedSteps = [
          "Run a comprehensive technical SEO audit",
          "Fix broken links and redirect issues",
          "Improve site speed through performance optimizations",
          "Ensure proper mobile responsiveness",
          "Address structured data implementation for rich snippets"
        ];
        break;
      case 'content':
        aiGeneratedSteps = [
          "Perform content gap analysis against competitors",
          "Create a content improvement plan for existing pages",
          "Develop new content pieces targeting identified opportunities",
          "Improve content readability and engagement metrics",
          "Implement optimal content structure for featured snippets"
        ];
        break;
      case 'backlinks':
        aiGeneratedSteps = [
          "Audit current backlink profile for quality assessment",
          "Identify toxic backlinks for disavowal",
          "Develop a strategic plan for acquiring high-quality backlinks",
          "Create shareable content that naturally attracts links",
          "Monitor competitors' backlink acquisition strategies"
        ];
        break;
      default:
        aiGeneratedSteps = [
          "Analyze current performance metrics",
          "Identify specific areas for improvement",
          "Develop an implementation strategy",
          "Execute changes methodically",
          "Monitor results and refine approach"
        ];
    }
    
    const updatedRecommendation: SeoRecommendation = {
      ...existingRecommendation,
      aiGeneratedSteps,
      updatedAt: new Date()
    };
    
    this.seoRecommendations.set(id, updatedRecommendation);
    return updatedRecommendation;
  }
  
  async predictRecommendationImpact(id: number): Promise<SeoRecommendation> {
    const existingRecommendation = this.seoRecommendations.get(id);
    if (!existingRecommendation) {
      throw new Error("SEO recommendation not found");
    }
    
    // In a real implementation, this would call an AI service to predict impact
    // For now, we'll generate a simulated impact prediction
    
    // Generate impact prediction based on category and priority
    const priority = existingRecommendation.priority || 'medium';
    let potentialTrafficIncrease = 0;
    let potentialRankingImprovement = 0;
    let implementationTimeEstimate = '';
    let conversionImpact = '';
    let confidenceScore = 0;
    
    switch (priority) {
      case 'high':
        potentialTrafficIncrease = Math.floor(Math.random() * 50) + 30; // 30-80%
        potentialRankingImprovement = Math.floor(Math.random() * 5) + 3; // 3-8 positions
        confidenceScore = Math.floor(Math.random() * 20) + 75; // 75-95%
        break;
      case 'medium':
        potentialTrafficIncrease = Math.floor(Math.random() * 30) + 10; // 10-40%
        potentialRankingImprovement = Math.floor(Math.random() * 3) + 1; // 1-4 positions
        confidenceScore = Math.floor(Math.random() * 25) + 60; // 60-85%
        break;
      case 'low':
        potentialTrafficIncrease = Math.floor(Math.random() * 15) + 5; // 5-20%
        potentialRankingImprovement = Math.floor(Math.random() * 2) + 1; // 1-3 positions
        confidenceScore = Math.floor(Math.random() * 20) + 50; // 50-70%
        break;
    }
    
    // Implementation time estimate based on category
    switch (existingRecommendation.category) {
      case 'keywords':
        implementationTimeEstimate = '1-2 weeks';
        conversionImpact = 'Moderate';
        break;
      case 'on-page':
        implementationTimeEstimate = '1-4 days';
        conversionImpact = 'High';
        break;
      case 'off-page':
        implementationTimeEstimate = '2-4 weeks';
        conversionImpact = 'Moderate';
        break;
      case 'technical':
        implementationTimeEstimate = '1-3 weeks';
        conversionImpact = 'Low to Moderate';
        break;
      case 'content':
        implementationTimeEstimate = '2-6 weeks';
        conversionImpact = 'High';
        break;
      case 'backlinks':
        implementationTimeEstimate = '1-3 months';
        conversionImpact = 'Moderate to High';
        break;
      default:
        implementationTimeEstimate = '2-4 weeks';
        conversionImpact = 'Moderate';
    }
    
    const impactPrediction = {
      potentialTrafficIncrease: `${potentialTrafficIncrease}%`,
      potentialRankingImprovement: `${potentialRankingImprovement} positions`,
      implementationTimeEstimate,
      conversionImpact,
      confidenceScore: `${confidenceScore}%`,
      expectedTimeToResults: priority === 'high' ? '1-4 weeks' : (priority === 'medium' ? '4-8 weeks' : '8-12 weeks'),
      keyFactorsAffectingSuccess: [
        "Proper implementation of all recommended steps",
        "Competitive landscape stability",
        "Search algorithm consistency",
        "Content quality and relevance"
      ]
    };
    
    const updatedRecommendation: SeoRecommendation = {
      ...existingRecommendation,
      impactPrediction,
      updatedAt: new Date()
    };
    
    this.seoRecommendations.set(id, updatedRecommendation);
    return updatedRecommendation;
  }

  // Ad Simulations
  async createAdSimulation(simulation: InsertAdSimulation): Promise<AdSimulation> {
    const id = this.adSimulationId++;
    const newSimulation: AdSimulation = {
      ...simulation,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: simulation.status || 'pending',
      adsDetected: simulation.adsDetected || null,
      adsClicked: simulation.adsClicked || null,
      searchResults: simulation.searchResults || null,
    };
    
    this.adSimulations.set(id, newSimulation);
    return newSimulation;
  }

  async updateAdSimulation(id: number, simulation: Partial<InsertAdSimulation>): Promise<AdSimulation> {
    const existingSimulation = this.adSimulations.get(id);
    if (!existingSimulation) {
      throw new Error("Ad simulation not found");
    }
    
    const updatedSimulation: AdSimulation = {
      ...existingSimulation,
      ...simulation,
      updatedAt: new Date()
    };
    
    this.adSimulations.set(id, updatedSimulation);
    return updatedSimulation;
  }

  async updateAdSimulationResults(id: number, adsDetected: any, adsClicked: any, searchResults: any): Promise<AdSimulation> {
    const existingSimulation = this.adSimulations.get(id);
    if (!existingSimulation) {
      throw new Error("Ad simulation not found");
    }
    
    const updatedSimulation: AdSimulation = {
      ...existingSimulation,
      adsDetected,
      adsClicked,
      searchResults,
      status: 'completed',
      updatedAt: new Date()
    };
    
    this.adSimulations.set(id, updatedSimulation);
    return updatedSimulation;
  }

  async getAdSimulationById(id: number): Promise<AdSimulation | null> {
    return this.adSimulations.get(id) || null;
  }

  async getAdSimulationsByKeyword(keyword: string): Promise<AdSimulation[]> {
    return Array.from(this.adSimulations.values())
      .filter(simulation => simulation.keyword.toLowerCase().includes(keyword.toLowerCase()));
  }

  async getAllAdSimulations(): Promise<AdSimulation[]> {
    return Array.from(this.adSimulations.values());
  }
  
  async analyzeAdCopyEffectiveness(id: number): Promise<AdSimulation> {
    const existingSimulation = this.adSimulations.get(id);
    if (!existingSimulation) {
      throw new Error("Ad simulation not found");
    }
    
    // In a real implementation, this would call an NLP service to analyze ad copy effectiveness
    // For now, we'll generate simulated ad copy analysis
    
    // Generate ad copy analysis data
    const adCopyAnalysis = {
      headlines: {
        effectiveness: Math.floor(Math.random() * 40) + 60, // 60-100 score
        emotionalAppeal: Math.floor(Math.random() * 40) + 60,
        clarity: Math.floor(Math.random() * 40) + 60,
        relevance: Math.floor(Math.random() * 40) + 60,
        callToAction: Math.floor(Math.random() * 40) + 60
      },
      descriptions: {
        effectiveness: Math.floor(Math.random() * 40) + 60,
        persuasiveness: Math.floor(Math.random() * 40) + 60,
        benefitsFocus: Math.floor(Math.random() * 40) + 60,
        clarity: Math.floor(Math.random() * 40) + 60
      },
      keyPhrases: [
        {
          phrase: "best solution",
          impact: "high",
          recommendation: "Keep this phrase as it's highly effective"
        },
        {
          phrase: "affordable prices",
          impact: "medium",
          recommendation: "Consider testing 'budget-friendly' as an alternative"
        },
        {
          phrase: "limited time",
          impact: "high",
          recommendation: "Creates good urgency, maintain in copy"
        }
      ],
      improvementSuggestions: [
        "Add more specific numbers or statistics to increase credibility",
        "Include a stronger call-to-action phrase in the headline",
        "Emphasize unique selling points more prominently",
        "Consider adding testimonial snippets if space allows"
      ]
    };
    
    const updatedSimulation: AdSimulation = {
      ...existingSimulation,
      adCopyAnalysis,
      updatedAt: new Date()
    };
    
    this.adSimulations.set(id, updatedSimulation);
    return updatedSimulation;
  }
  
  async generateBidStrategySuggestions(id: number): Promise<AdSimulation> {
    const existingSimulation = this.adSimulations.get(id);
    if (!existingSimulation) {
      throw new Error("Ad simulation not found");
    }
    
    // In a real implementation, this would analyze ad performance data and market rates
    // For now, we'll generate simulated bid strategy suggestions
    
    // Get random CPC range based on keyword competitiveness
    const baseCpc = Math.random() * 5 + 0.5; // $0.50 to $5.50
    const lowBid = (baseCpc * 0.7).toFixed(2);
    const recommendedBid = baseCpc.toFixed(2);
    const highBid = (baseCpc * 1.3).toFixed(2);
    
    // Generate bid strategy suggestions
    const bidStrategySuggestions = {
      keyword: existingSimulation.keyword,
      estimatedCpc: {
        low: `$${lowBid}`,
        recommended: `$${recommendedBid}`,
        high: `$${highBid}`
      },
      positionEstimates: {
        lowBid: {
          position: Math.floor(Math.random() * 4) + 6, // 6-10
          impressionShare: `${Math.floor(Math.random() * 30) + 40}%`, // 40-70%
          clickThroughRate: `${(Math.random() * 2 + 1).toFixed(2)}%` // 1-3%
        },
        recommendedBid: {
          position: Math.floor(Math.random() * 3) + 3, // 3-6
          impressionShare: `${Math.floor(Math.random() * 20) + 60}%`, // 60-80%
          clickThroughRate: `${(Math.random() * 3 + 2).toFixed(2)}%` // 2-5%
        },
        highBid: {
          position: Math.floor(Math.random() * 2) + 1, // 1-3
          impressionShare: `${Math.floor(Math.random() * 15) + 75}%`, // 75-90%
          clickThroughRate: `${(Math.random() * 4 + 3).toFixed(2)}%` // 3-7%
        }
      },
      budgetRecommendations: {
        daily: `$${(baseCpc * (Math.floor(Math.random() * 50) + 50)).toFixed(2)}`, // 50-100 clicks per day
        weekly: `$${(baseCpc * (Math.floor(Math.random() * 300) + 300)).toFixed(2)}`, // 300-600 clicks per week
        monthly: `$${(baseCpc * (Math.floor(Math.random() * 1200) + 1200)).toFixed(2)}` // 1200-2400 clicks per month
      },
      competitiveLandscape: {
        topCompetitors: [
          {
            domain: "competitor1.com",
            estimatedBid: `$${(baseCpc * (Math.random() * 0.4 + 0.8)).toFixed(2)}`, // 80-120% of recommended
            adPosition: Math.floor(Math.random() * 3) + 1
          },
          {
            domain: "competitor2.com",
            estimatedBid: `$${(baseCpc * (Math.random() * 0.4 + 0.8)).toFixed(2)}`,
            adPosition: Math.floor(Math.random() * 3) + 1
          },
          {
            domain: "competitor3.com",
            estimatedBid: `$${(baseCpc * (Math.random() * 0.4 + 0.8)).toFixed(2)}`,
            adPosition: Math.floor(Math.random() * 3) + 1
          }
        ],
        competitionLevel: baseCpc > 3 ? "High" : (baseCpc > 1.5 ? "Medium" : "Low")
      },
      strategicRecommendations: [
        "Start with the recommended bid and adjust based on performance metrics",
        "Consider bidding higher during peak business hours for your industry",
        "Implement ad scheduling to reduce costs during low-conversion periods",
        "Use bid adjustments for mobile devices based on historical performance"
      ]
    };
    
    const updatedSimulation: AdSimulation = {
      ...existingSimulation,
      bidStrategySuggestions,
      updatedAt: new Date()
    };
    
    this.adSimulations.set(id, updatedSimulation);
    return updatedSimulation;
  }
}

export const storage = new MemStorage();