import { Briefcase, CheckCircle2, Cloud, FileText, GraduationCap, Shield, User, Server } from "lucide-react";
import type { CategoryMeta, CompanyFormValues, CompanyProfile, ExperienceFormValues, ExperienceItem, Profile, ResumeCategory } from "@/types/resume";

export const categoryOptions: ResumeCategory[] = ["모의해킹", "취약점 진단", "보안 컨설팅", "클라우드 보안", "개발/자동화"];

export const categoryMeta: Record<ResumeCategory, CategoryMeta> = {
  "모의해킹": { label: "모의해킹", icon: Shield },
  "취약점 진단": { label: "취약점 진단", icon: Server },
  "보안 컨설팅": { label: "보안 컨설팅", icon: FileText },
  "클라우드 보안": { label: "클라우드 보안", icon: Cloud },
  "개발/자동화": { label: "개발/자동화", icon: Briefcase },
};

export const profileInfoItems = [
  { key: "education", label: "학력", icon: GraduationCap },
  { key: "career", label: "경력", icon: Briefcase },
  { key: "specialty", label: "전문분야", icon: Shield },
  { key: "certifications", label: "주요 경험", icon: CheckCircle2 },
] as const;

export const profileHeaderIcon = User;

export const defaultCompanyProfiles: CompanyProfile[] = [
  {
    organization: "알체라(Alchera Inc.)",
    department: "Platform Engineering (Security)",
    position: "Manager",
    period: "2023.06 - 현재",
    summary: "영상인식 AI 솔루션 기업에서 정보보호 관리자 역할을 수행하며 인증 대응, 보안 운영, 업무용 소프트웨어 관리 체계를 고도화했습니다.",
    responsibilities: [
      "정보보호 규정, 지침, 절차 제정 및 운영",
      "임직원 보안 인식 교육과 보안 캠페인 운영",
      "보안성 검토 절차 수립 및 실무 운영",
      "VPN, 방화벽, DLP, 백신 등 보안시스템 운영",
      "CSAP 및 ISO 27001/27017 인증 준비",
    ],
  },
  {
    organization: "삼정회계법인(KPMG)",
    department: "Digital Tech - Cyber Security / Internal Audit & Forensic",
    position: "부장 / S.Senior",
    period: "2014.07 - 2016.09 / 2020.01 - 2023.06",
    summary: "컨설팅 펌에서 IT·OT 보안 컨설팅과 국내외 정보보호 인증 컨설팅을 수행하며 PM·PL 역할로 다수의 대형 프로젝트를 리드했습니다.",
    responsibilities: [
      "ISMS, ISMS-P, ISO 27001 인증 컨설팅 수행",
      "위험 분석 및 평가, 법적 준거성 검토",
      "IT 및 OT 보안 마스터플랜과 아키텍처 설계",
      "모의해킹, 시스템 하드닝, 보안성 검토 리뷰",
      "글로벌 컴플라이언스 검토와 중장기 과제 정의",
    ],
  },
  {
    organization: "위메프",
    department: "정보보호실 보안기술팀",
    position: "팀장",
    period: "2019.05 - 2019.12",
    summary: "이커머스 환경에서 보안기술팀을 이끌며 보안시스템 기획, 운영 현황 관리, 보안성 검토 절차 정립과 보안관제 고도화를 수행했습니다.",
    responsibilities: [
      "DB 접근제어, 소스코드 취약점 점검 솔루션 도입 기획",
      "보안 정기 점검과 보안시스템 정책 검토",
      "보안성 검토 절차 및 체크리스트 수립",
      "관문/내부 방화벽 정책 개선과 탐지 범위 확대",
    ],
  },
  {
    organization: "대정에이앤지(주)",
    department: "ICS 보안솔루션팀",
    position: "팀장",
    period: "2016.09 - 2019.05",
    summary: "OT 보안솔루션 팀장으로 제어시스템 보안 리서치, 솔루션 구축·운영, 프리세일즈와 데모 시스템 구축을 수행했습니다.",
    responsibilities: [
      "OT 보안 솔루션 PoC, 데모 시연, 프리세일즈",
      "제어시스템 보안 리서치와 데모 환경 구축",
      "PLC 레더 프로그램 작성 및 Modbus 해킹 도구 개발",
      "국내 기반시설 대상 OT 보안시스템 구축 및 운영",
    ],
  },
  {
    organization: "씨제이올리브네트웍스(주)",
    department: "IT 보안팀 - 침해예방보안 부문",
    position: "대리",
    period: "2013.09 - 2014.07",
    summary: "송도 IDC IT 보안 담당자로 보안시스템 구축과 운영, 침해사고 분석, 그룹 계열사 대상 웹 모의해킹을 수행했습니다.",
    responsibilities: [
      "침해사고 분석 및 대응 매뉴얼 작성",
      "FireEye, ShellMonitor, ESM 탐지 룰 고도화",
      "CJ 그룹 정기 웹 모의해킹 수행",
      "웹 서비스 취약점 점검 및 하드닝 수행",
    ],
  },
  {
    organization: "한전케이디엔(주)",
    department: "취약점분석평가팀",
    position: "대리",
    period: "2010.07 - 2012.06",
    summary: "지식경제부 사이버안전센터 소속으로 에너지 기관 기반시설을 대상으로 취약점 분석과 평가, 망분리 적정성 검토를 수행했습니다.",
    responsibilities: [
      "기반시설 워크스테이션 취약점 점검",
      "방화벽 정책 분석 및 외부 인입 접점 검토",
      "Multi Homed Network 자산 식별",
      "망분리와 망연계 시스템 적정성 검토",
    ],
  },
  {
    organization: "엔코딩패스 주식회사",
    department: "보안컨설팅사업부",
    position: "대리",
    period: "2008.07 - 2010.07",
    summary: "SKT IT 보안팀 파견 인력으로 인프라 취약점 점검, 웹 서비스 모의해킹, 점검 가이드와 자동화 스크립트 고도화를 수행했습니다.",
    responsibilities: [
      "서버, WEB/WAS, DBMS, 네트워크 취약점 진단",
      "내·외부 웹 서비스 모의해킹",
      "분기별 취약점 점검 가이드 제·개정",
      "자동화 스크립트 고도화 및 exploit test",
    ],
  },
  {
    organization: "(주)모니터랩",
    department: "위협분석팀",
    position: "연구원",
    period: "2007.01 - 2008.07",
    summary: "웹 서비스 해킹 패턴 연구를 기반으로 웹방화벽 시그니처 룰 개발, 웹 취약점 스캐너 개발, 보안 교육을 수행했습니다.",
    responsibilities: [
      "웹 취약점 및 공격 패턴 리서치",
      "웹방화벽 시그니처 룰 개발",
      "허니팟 운영을 통한 공격 패턴 분석",
      "웹 취약점 스캐너 개발 및 GS 인증 참여",
    ],
  },
];

export const defaultProfile: Profile = {
  name: "배상학",
  role: "정보보호 관리자 / 보안 컨설턴트 / OT 보안 전문가",
  summary:
    "17년 이상 정보보안 실무를 수행하며 보안리서처, IT·OT 보안 컨설턴트, 기업 정보보호 관리자 역할을 경험했습니다. IT, 통신, 제조, 에너지, 금융 등 다양한 산업군에서 ISMS, ISO 27001, CSAP 인증, 정보보호 관리체계 운영, OT 보안 아키텍처 설계, 웹 모의해킹과 시스템 취약점 진단을 수행해왔습니다.",
  photo: "",
  education: "한국산업기술대학교 컴퓨터공학과 / 건국대학교 정보통신대학원 정보시스템감리학과(휴학)",
  career: "2007.01 ~ 현재",
  specialty: "ISMS / ISO 27001 / CSAP / IT·OT 보안 / 모의해킹 / 취약점 진단",
  certifications: "CISSP / LPIC Level 1 / 정보처리기사 / Nozomi Networks Certified Engineer",
};

export const defaultExperiences: ExperienceItem[] = [
  {
    id: 1,
    title: "정보보호 관리체계 운영 및 CSAP·ISO 인증 대응",
    organization: "알체라(Alchera Inc.)",
    period: "2023.06 - 현재",
    category: "보안 컨설팅",
    description:
      "기업 정보보호 관리자 역할로 정보보호 규정 및 절차 제정, 임직원 보안 인식 교육, 개인정보처리방침 및 서약서 개정, 보안성 검토 절차 수립, VPN·방화벽·DLP·백신 운영과 함께 CSAP 및 ISO 27001/27017 인증 준비를 수행했습니다.",
    highlight: ["정보보호 관리체계", "CSAP", "ISO 27001", "ISO 27017", "보안 운영"],
  },
  {
    id: 2,
    title: "롯데면세점 ISMS-P 인증(사후) 컨설팅 PM",
    organization: "삼정회계법인(KPMG)",
    period: "2023.03 - 2023.05",
    category: "보안 컨설팅",
    description:
      "ISMS-P 322개 통제항목 기준 Gap 분석, 위험 분석 및 평가, 법적 준거성 검토, 결함 조치 가이드 검토와 영업점 현장 점검 체크리스트 개정을 주도했습니다.",
    highlight: ["ISMS-P", "PM", "위험분석", "법적 준거성", "Gap 분석"],
  },
  {
    id: 3,
    title: "메디트 ISO 27001 갱신 및 글로벌 컴플라이언스 검토 PM",
    organization: "삼정회계법인(KPMG)",
    period: "2023.01 - 2023.03",
    category: "보안 컨설팅",
    description:
      "ISO 27001 통제항목 기준 Gap 분석과 위험평가, 모의해킹 및 시스템 하드닝 리뷰를 수행하고 GDPR, HIPPA, CPRA, JP APPI 등 글로벌 컴플라이언스 준거성을 검토했습니다.",
    highlight: ["ISO 27001", "GDPR", "HIPPA", "하드닝 리뷰", "컴플라이언스"],
  },
  {
    id: 4,
    title: "발전소 OT 보안 마스터플랜 및 아키텍처 설계",
    organization: "삼정회계법인(KPMG)",
    period: "2021.08 - 2021.12",
    category: "클라우드 보안",
    description:
      "대륜발전 및 별내에너지 발전소를 대상으로 관문 방화벽 정책 분석, Nozomi Guardian 기반 패킷 분석, 자산 식별, 네트워크 구성도 작성, OA/FA 망분리와 Purdue 모델 기반 OT 보안 아키텍처를 설계했습니다.",
    highlight: ["OT 보안", "Nozomi Guardian", "망분리", "Purdue 모델", "마스터플랜"],
  },
  {
    id: 5,
    title: "위메프 보안기술팀 운영 및 보안성 검토 체계 수립",
    organization: "위메프",
    period: "2019.05 - 2019.12",
    category: "개발/자동화",
    description:
      "보안기술팀 팀장으로 DB 접근제어와 소스코드 취약점 점검 솔루션 도입을 기획하고, 보안성 검토 절차와 체크리스트를 수립했으며 보안관제 고도화와 방화벽 정책 개선을 수행했습니다.",
    highlight: ["보안성 검토", "DB 접근제어", "소스코드 진단", "보안관제", "팀장"],
  },
  {
    id: 6,
    title: "평창동계올림픽 EMS 구축 및 OT 보안 솔루션 프리세일즈",
    organization: "대정에이앤지(주)",
    period: "2017.10 - 2018.03",
    category: "개발/자동화",
    description:
      "OT 보안솔루션팀 팀장으로 제어시스템 보안 리서치와 프리세일즈를 수행했으며, 2018 평창동계올림픽 에너지 모니터링 시스템 구축 프로젝트를 리드했습니다. 또한 PLC 레더 프로그램과 Modbus 해킹 도구 개발 경험을 보유하고 있습니다.",
    highlight: ["OT 솔루션", "EMS", "PLC", "Modbus", "프리세일즈"],
  },
  {
    id: 7,
    title: "금융·항공·공공 분야 모의해킹 및 개인정보보호 컨설팅",
    organization: "삼정회계법인(KPMG)",
    period: "2014.07 - 2016.09",
    category: "모의해킹",
    description:
      "아시아나 에바카스 PCI-DSS, NH농협 개인정보보호, KB국민은행 보안 컨설팅, KT 차세대 시스템 보안성 검토, 라이나생명 및 BNP 파리바카디프 모의해킹 등 다양한 프로젝트를 PL/PM으로 수행했습니다.",
    highlight: ["PCI-DSS", "개인정보보호", "웹 모의해킹", "PL", "PM"],
  },
  {
    id: 8,
    title: "CJ 그룹 웹 모의해킹 및 보안시스템 운영",
    organization: "씨제이올리브네트웍스(주)",
    period: "2013.09 - 2014.07",
    category: "모의해킹",
    description:
      "송도 IDC IT 보안팀에서 FireEye, ShellMonitor, ESM 탐지 룰 고도화, 침해사고 분석 보고서 작성과 함께 CJ 계열사 정기 웹 모의해킹과 YTN 통합보도정보시스템 모의해킹을 수행했습니다.",
    highlight: ["FireEye", "침해사고 분석", "ESM", "웹 모의해킹", "하드닝"],
  },
  {
    id: 9,
    title: "국가 기반시설 취약점 분석 및 평가",
    organization: "한전케이디엔(주)",
    period: "2010.07 - 2012.06",
    category: "취약점 진단",
    description:
      "지식경제부 사이버안전센터 소속으로 발전기관과 에너지 공기업 기반시설을 대상으로 워크스테이션 시스템 취약점 점검, 방화벽 정책 분석, Multi Homed Network 식별, 망분리 적정성 검토를 수행했습니다.",
    highlight: ["기반시설", "취약점 분석", "방화벽 정책", "망분리", "에너지"],
  },
  {
    id: 10,
    title: "SKT 인프라 보안 취약점 진단 및 웹 모의해킹",
    organization: "엔코딩패스 주식회사",
    period: "2008.07 - 2010.07",
    category: "취약점 진단",
    description:
      "SKT IT 보안팀 파견 인력으로 서버, WEB/WAS, DBMS, 네트워크 취약점 진단과 내·외부 웹 서비스 모의해킹을 수행하고 점검 가이드와 자동화 스크립트를 고도화했습니다.",
    highlight: ["SKT", "WEB/WAS", "DBMS", "자동화 스크립트", "SQL Injection"],
  },
  {
    id: 11,
    title: "웹방화벽 시그니처 룰 개발 및 웹 취약점 연구",
    organization: "(주)모니터랩",
    period: "2007.01 - 2008.07",
    category: "개발/자동화",
    description:
      "위협분석팀 연구원으로 웹 취약점 스캐너 개발, GS 인증 참여, 허니팟 기반 공격 패턴 분석, ModSecurity 및 WebKnight 시그니처 룰 개발과 개발자 대상 보안 교육을 수행했습니다.",
    highlight: ["WAF", "시그니처 룰", "허니팟", "GS 인증", "보안 교육"],
  },
];

export const emptyExperienceForm: ExperienceFormValues = {
  title: "",
  organization: "",
  period: "",
  category: "모의해킹",
  description: "",
  highlight: "",
  image: "",
};

export const emptyCompanyForm: CompanyFormValues = {
  organization: "",
  department: "",
  position: "",
  period: "",
  summary: "",
  responsibilities: "",
};
