declare module '@/components/inspection/rera/RERALocationTree' {
  interface RERALocationTreeProps {
    projectId: number;
  }
  const RERALocationTree: React.FC<RERALocationTreeProps>;
  export default RERALocationTree;
}

declare module '@/components/inspection/rera/NRM3Framework' {
  interface NRM3FrameworkProps {
    projectId: number;
  }
  const NRM3Framework: React.FC<NRM3FrameworkProps>;
  export default NRM3Framework;
}

declare module '@/components/inspection/rera/ConditionAssessment' {
  interface ConditionAssessmentProps {
    projectId: number;
    auditType: "condition_survey" | "reserve_fund_study";
  }
  const ConditionAssessment: React.FC<ConditionAssessmentProps>;
  export default ConditionAssessment;
}

declare module '@/components/inspection/rera/LifecycleCosts' {
  interface LifecycleCostsProps {
    projectId: number;
    auditType: "condition_survey" | "reserve_fund_study";
  }
  const LifecycleCosts: React.FC<LifecycleCostsProps>;
  export default LifecycleCosts;
}

declare module '@/components/inspection/rera/ReportPreview' {
  interface ReportPreviewProps {
    projectId: number;
    auditType: "condition_survey" | "reserve_fund_study";
  }
  const ReportPreview: React.FC<ReportPreviewProps>;
  export default ReportPreview;
}