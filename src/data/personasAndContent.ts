"use client";

import { IntakeData } from "../types/clinical";

export const BRAND_IMAGES = {
  heroSanctuary: "/src/assets/images/hero_sanctuary_interior_1793285304751.jpg",
  stepIntakeMan: "/src/assets/images/man_tablet_intake_1793285305330.jpg",
  stepConsultMan: "/src/assets/images/man_video_clinician_1793285306105.jpg",
  stepWellnessKit: "/src/assets/images/wellness_kit_sanctuary_1793285308182.jpg",
  serviceDoctorConsult: "/src/assets/images/male_doctor_consultation_1793285308802.jpg",
  maleClinicianAvatar: "/src/assets/images/male_clinician_portrait_1793285308815.jpg",
};

export const EMPTY_CLEAN_INTAKE: IntakeData = {
  sittingHoursPerDay: "under4",
  thermalExposure: "none",
  sleepQuality: "optimal",
  stressLevel: "low",
  nicotineHabit: "none",
  alcoholFrequency: "none",
  bmiRange: "normal_18_24",
  hba1cStatus: "unknown",
  bloodPressureFlag: "normal",
  lipidProfile: "unknown",
  dullTesticularAche: false,
  scrotalHeavinessAfterStanding: false,
  visibleVeinSwelling: false,
  cryptorchidismHistory: false,
  testicularTraumaOrSurgery: false,
  acuteSevereTesticularPain: false,
  acuteSuddenSwellingOrFever: false,
  hematospermia: false,
  postPubertyMumps: false,
  priorStiHistory: false,
  chronicPelvicOrUrinaryInfection: false,
  labFileUploaded: false,
  labFileName: "",
  spermConcentrationMml: null,
  totalMotilityPercent: null,
  morningTestosteroneNgDl: null,
  fshIuL: null,
};

export interface SpecialtyOption {
  id: string;
  labelEn: string;
  labelAr: string;
}

export const DOCTOR_SPECIALTY_OPTIONS: SpecialtyOption[] = [
  {
    id: "andrologist",
    labelEn: "Andrologist (Male Reproductive Specialist)",
    labelAr: "طبيب أمراض الذكورة والخصوبة",
  },
  {
    id: "urologist",
    labelEn: "Urologist",
    labelAr: "طبيب المسالك البولية",
  },
  {
    id: "fertility_specialist",
    labelEn: "Fertility & Preconception Specialist",
    labelAr: "أخصائي الخصوبة ورعاية ما قبل الإنجاب",
  },
  {
    id: "endocrinologist",
    labelEn: "Reproductive Endocrinologist",
    labelAr: "أخصائي الغدد الصماء والهرمونات التناسلية",
  },
  {
    id: "mens_health_physician",
    labelEn: "General Men's Health Physician",
    labelAr: "طبيب صحة الرجل العام",
  },
];

export const CONSULTATION_TIME_SLOTS: string[] = [
  "Today · 2:15 PM",
  "Today · 5:30 PM",
  "Tomorrow · 10:30 AM",
  "Tomorrow · 4:00 PM",
];
