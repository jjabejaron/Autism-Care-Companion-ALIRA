import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { trpc } from "@/lib/trpc";

export type Language = "en" | "fil";

export const translations = {
  en: {
    // Navigation
    nav: {
      dashboard: "Dashboard",
      modules: "Modules",
      progress: "Progress",
      clinics: "Clinics",
      aliChat: "ALI Chat",
      settings: "Settings",
      careCompanion: "Care Companion",
    },
    // Dashboard
    dashboard: {
      title: "Dashboard",
      greeting: "Good day",
      subtitle: "Here's an overview of your child's care journey.",
      noChildren: "No child profiles yet",
      noChildrenSub: "Add your child's profile to get started with ALIRA.",
      addChild: "Add Child Profile",
      recentActivity: "Recent Activity",
      viewAll: "View all",
      noActivity: "No activity scores yet",
      startModule: "Start a module →",
      findClinic: "Find a Nearby Clinic",
      findClinicSub: "Discover autism-specialized clinics and therapy centers near you in the Philippines.",
      searchClinics: "Search clinics",
      avgScore: "Avg. Score",
      modulesAvail: "Modules Available",
      diagnosisStatus: "Diagnosis Status",
      diagnosed: "Diagnosed",
      notDiagnosed: "Not Yet",
      alertTitle: "Diagnosis Recommended",
      alertMsg: "has not been clinically diagnosed. Early diagnosis helps in planning better care.",
      findClinicBtn: "Find a Clinic",
      dismiss: "Dismiss",
      addChildTab: "+ Add Child",
    },
    // Modules
    modules: {
      title: "Learning Modules",
      subtitle: "Evidence-based coaching activities for your child's development.",
      allAges: "All Ages",
      toddler: "Toddler (2–3)",
      earlyChildhood: "Early Childhood (4–6)",
      allSkills: "All Skills",
      cognitive: "Cognitive",
      social: "Social",
      integrative: "Integrative",
      noModules: "No modules found",
      noModulesSub: "Try adjusting the filters above.",
      overview: "Overview",
      activity: "Coaching Activity",
      score: "Score Activity",
      complete: "Complete",
      next: "Next",
      back: "Back",
      close: "Close",
      skillsBuild: "Skills You'll Build Together",
      weeklyTip: "Weekly Tip",
      theoretical: "Theoretical Foundations",
      selectChild: "Select a Child",
      selectChildSub: "Choose which child completed this activity.",
      howDid: "How did",
      respond: "respond to the activity?",
      notes: "Notes (optional)",
      notesPlaceholder: "Add any observations or notes...",
      saveScore: "Save Score",
      saving: "Saving...",
      moduleComplete: "Activity Complete!",
      moduleCompleteSub: "Great job! You've completed the coaching activity.",
      yourScore: "Your Score",
      nextModule: "Next",
      scoreLabels: {
        excellent: "Excellent",
        good: "Good",
        developing: "Developing",
        emerging: "Emerging",
        needsSupport: "Needs Support",
      },
      scoreCriteria: {
        excellent: "Child responded enthusiastically and independently",
        good: "Child responded well with minimal prompting",
        developing: "Child responded with moderate support",
        emerging: "Child showed early signs of understanding",
        needsSupport: "Child needed significant support throughout",
      },
    },
    // Progress
    progress: {
      title: "Progress Report",
      subtitle: "Track your child's development over time.",
      selectChild: "Select a child to view their progress report.",
      noScores: "No activity scores yet",
      noScoresSub: "Complete a module activity to start tracking progress.",
      startModule: "Start a Module",
      avgScore: "Average Score",
      highest: "Highest Score",
      lowest: "Lowest Score",
      totalActivities: "Total Activities",
      progressOverTime: "Progress Over Time",
      recentActivities: "Recent Activities",
      score: "Score",
      date: "Date",
      notes: "Notes",
    },
    // Clinics
    clinics: {
      title: "Nearby Clinics",
      subtitle: "Find autism-specialized clinics and therapy centers in the Philippines.",
      searchPlaceholder: "Search by city or area (e.g., Quezon City, Makati)",
      search: "Search",
      map: "Map",
      list: "List",
      contact: "Contact",
      directions: "Directions",
      open: "Open",
      closed: "Closed",
      noResults: "No clinics found",
      noResultsSub: "Try searching for a different location.",
      selectChild: "Select a Child",
      selectChildSub: "Choose which child will visit",
      disclaimer: "ALIRA does not directly book appointments. This QR code contains your child's demographics to speed up registration at the clinic.",
      generateQR: "Generate QR Code",
      generating: "Generating...",
      downloadQR: "Save QR Code",
      referralCard: "Child Referral Card",
      scanInstruction: "Show this QR code at the clinic reception to share demographics.",
      noChildren: "No child profiles found. Please add a child profile first.",
    },
    // Chat
    chat: {
      title: "ALI Chat",
      subtitle: "Your AI companion for autism care guidance.",
      placeholder: "Ask ALI anything about autism care...",
      send: "Send",
      thinking: "ALI is thinking...",
      welcome: "Hello! I'm ALI, your autism care companion. How can I help you today?",
    },
    // Settings
    settings: {
      title: "Settings",
      profile: "Profile",
      profileSub: "Update your personal information.",
      fullName: "Full Name",
      email: "Email Address",
      saveProfile: "Save Profile",
      saving: "Saving...",
      security: "Security",
      securitySub: "Change your password.",
      currentPassword: "Current Password",
      newPassword: "New Password",
      confirmPassword: "Confirm New Password",
      updatePassword: "Update Password",
      language: "Language",
      languageSub: "Choose your preferred language for the app.",
      notifications: "Notifications",
      notificationsSub: "Manage your notification preferences.",
      progressAlerts: "Progress Alerts",
      progressAlertsSub: "Get notified when activity scores are recorded.",
      moduleCompletion: "Module Completion",
      moduleCompletionSub: "Get notified when a module is completed.",
      signOut: "Sign Out",
      signOutSub: "Sign out of your ALIRA account.",
      signOutBtn: "Sign Out",
    },
    // Common
    common: {
      loading: "Loading...",
      error: "Something went wrong.",
      retry: "Retry",
      cancel: "Cancel",
      save: "Save",
      delete: "Delete",
      edit: "Edit",
      add: "Add",
      remove: "Remove",
      confirm: "Confirm",
      yes: "Yes",
      no: "No",
    },
  },
  fil: {
    // Navigation
    nav: {
      dashboard: "Dashboard",
      modules: "Mga Modyul",
      progress: "Progreso",
      clinics: "Mga Klinika",
      aliChat: "ALI Chat",
      settings: "Mga Setting",
      careCompanion: "Gabay sa Pag-aalaga",
    },
    // Dashboard
    dashboard: {
      title: "Dashboard",
      greeting: "Magandang araw",
      subtitle: "Narito ang pangkalahatang-ideya ng paglalakbay ng pag-aalaga ng iyong anak.",
      noChildren: "Wala pang profile ng bata",
      noChildrenSub: "Idagdag ang profile ng iyong anak upang makapagsimula sa ALIRA.",
      addChild: "Magdagdag ng Profile ng Bata",
      recentActivity: "Kamakailang Aktibidad",
      viewAll: "Tingnan lahat",
      noActivity: "Wala pang mga marka ng aktibidad",
      startModule: "Magsimula ng modyul →",
      findClinic: "Hanapin ang Malapit na Klinika",
      findClinicSub: "Tuklasin ang mga klinika at sentro ng therapy para sa autism malapit sa inyo sa Pilipinas.",
      searchClinics: "Maghanap ng klinika",
      avgScore: "Karaniwang Marka",
      modulesAvail: "Mga Modyul na Available",
      diagnosisStatus: "Katayuan ng Diagnosis",
      diagnosed: "Nasuri na",
      notDiagnosed: "Hindi Pa",
      alertTitle: "Inirerekomenda ang Diagnosis",
      alertMsg: "ay hindi pa clinically diagnosed. Ang maagang diagnosis ay tumutulong sa pagpaplano ng mas mahusay na pag-aalaga.",
      findClinicBtn: "Hanapin ang Klinika",
      dismiss: "Isara",
      addChildTab: "+ Magdagdag ng Bata",
    },
    // Modules
    modules: {
      title: "Mga Modyul ng Pag-aaral",
      subtitle: "Mga aktibidad na batay sa ebidensya para sa pag-unlad ng iyong anak.",
      allAges: "Lahat ng Edad",
      toddler: "Maliliit na Bata (2–3)",
      earlyChildhood: "Maagang Pagkabata (4–6)",
      allSkills: "Lahat ng Kasanayan",
      cognitive: "Kognitibo",
      social: "Sosyal",
      integrative: "Integratibo",
      noModules: "Walang nahanap na modyul",
      noModulesSub: "Subukang i-adjust ang mga filter sa itaas.",
      overview: "Pangkalahatang-ideya",
      activity: "Aktibidad sa Coaching",
      score: "Markahan ang Aktibidad",
      complete: "Tapos na",
      next: "Susunod",
      back: "Bumalik",
      close: "Isara",
      skillsBuild: "Mga Kasanayang Iyong Pauunlarin",
      weeklyTip: "Lingguhang Tip",
      theoretical: "Mga Teoretikal na Pundasyon",
      selectChild: "Pumili ng Bata",
      selectChildSub: "Piliin kung aling bata ang nakumpleto ang aktibidad na ito.",
      howDid: "Paano",
      respond: "tumugon sa aktibidad?",
      notes: "Mga Tala (opsyonal)",
      notesPlaceholder: "Magdagdag ng mga obserbasyon o tala...",
      saveScore: "I-save ang Marka",
      saving: "Sine-save...",
      moduleComplete: "Natapos na ang Aktibidad!",
      moduleCompleteSub: "Magaling! Nakumpleto mo na ang aktibidad sa coaching.",
      yourScore: "Ang Iyong Marka",
      nextModule: "Susunod",
      scoreLabels: {
        excellent: "Mahusay",
        good: "Magaling",
        developing: "Umuunlad",
        emerging: "Nagsisimula",
        needsSupport: "Nangangailangan ng Suporta",
      },
      scoreCriteria: {
        excellent: "Ang bata ay tumugon nang masigasig at nagsarili",
        good: "Ang bata ay tumugon nang maayos na may kaunting gabay",
        developing: "Ang bata ay tumugon na may katamtamang suporta",
        emerging: "Ang bata ay nagpakita ng maagang pag-unawa",
        needsSupport: "Ang bata ay nangangailangan ng malaking suporta",
      },
    },
    // Progress
    progress: {
      title: "Ulat ng Progreso",
      subtitle: "Subaybayan ang pag-unlad ng iyong anak sa paglipas ng panahon.",
      selectChild: "Pumili ng bata upang makita ang kanilang ulat ng progreso.",
      noScores: "Wala pang mga marka ng aktibidad",
      noScoresSub: "Kumpletuhin ang isang aktibidad sa modyul upang magsimulang subaybayan ang progreso.",
      startModule: "Magsimula ng Modyul",
      avgScore: "Karaniwang Marka",
      highest: "Pinakamataas na Marka",
      lowest: "Pinakamababang Marka",
      totalActivities: "Kabuuang Aktibidad",
      progressOverTime: "Progreso sa Paglipas ng Panahon",
      recentActivities: "Kamakailang Mga Aktibidad",
      score: "Marka",
      date: "Petsa",
      notes: "Mga Tala",
    },
    // Clinics
    clinics: {
      title: "Mga Malapit na Klinika",
      subtitle: "Hanapin ang mga klinika at sentro ng therapy para sa autism sa Pilipinas.",
      searchPlaceholder: "Maghanap ayon sa lungsod o lugar (hal. Quezon City, Makati)",
      search: "Maghanap",
      map: "Mapa",
      list: "Listahan",
      contact: "Makipag-ugnayan",
      directions: "Direksyon",
      open: "Bukas",
      closed: "Sarado",
      noResults: "Walang nahanap na klinika",
      noResultsSub: "Subukang maghanap ng ibang lokasyon.",
      selectChild: "Pumili ng Bata",
      selectChildSub: "Piliin kung aling bata ang bibisita",
      disclaimer: "Ang ALIRA ay hindi direktang nagbu-book ng appointment. Ang QR code na ito ay naglalaman ng mga demographics ng iyong anak upang mapabilis ang pagpaparehistro sa klinika.",
      generateQR: "Gumawa ng QR Code",
      generating: "Ginagawa...",
      downloadQR: "I-save ang QR Code",
      referralCard: "Card ng Referral ng Bata",
      scanInstruction: "Ipakita ang QR code na ito sa reception ng klinika upang ibahagi ang mga demographics.",
      noChildren: "Walang nahanap na profile ng bata. Mangyaring magdagdag muna ng profile ng bata.",
    },
    // Chat
    chat: {
      title: "ALI Chat",
      subtitle: "Ang iyong AI companion para sa gabay sa pag-aalaga ng autism.",
      placeholder: "Itanong kay ALI ang anumang bagay tungkol sa pag-aalaga ng autism...",
      send: "Ipadala",
      thinking: "Nag-iisip si ALI...",
      welcome: "Kumusta! Ako si ALI, ang iyong gabay sa pag-aalaga ng autism. Paano kita matutulungan ngayon?",
    },
    // Settings
    settings: {
      title: "Mga Setting",
      profile: "Profile",
      profileSub: "I-update ang iyong personal na impormasyon.",
      fullName: "Buong Pangalan",
      email: "Email Address",
      saveProfile: "I-save ang Profile",
      saving: "Sine-save...",
      security: "Seguridad",
      securitySub: "Baguhin ang iyong password.",
      currentPassword: "Kasalukuyang Password",
      newPassword: "Bagong Password",
      confirmPassword: "Kumpirmahin ang Bagong Password",
      updatePassword: "I-update ang Password",
      language: "Wika",
      languageSub: "Piliin ang iyong gustong wika para sa app.",
      notifications: "Mga Abiso",
      notificationsSub: "Pamahalaan ang iyong mga kagustuhan sa abiso.",
      progressAlerts: "Mga Alerto sa Progreso",
      progressAlertsSub: "Maabisuhan kapag naitala ang mga marka ng aktibidad.",
      moduleCompletion: "Pagkumpleto ng Modyul",
      moduleCompletionSub: "Maabisuhan kapag nakumpleto ang isang modyul.",
      signOut: "Mag-sign Out",
      signOutSub: "Mag-sign out mula sa iyong ALIRA account.",
      signOutBtn: "Mag-sign Out",
    },
    // Common
    common: {
      loading: "Naglo-load...",
      error: "May naganap na error.",
      retry: "Subukan muli",
      cancel: "Kanselahin",
      save: "I-save",
      delete: "Burahin",
      edit: "I-edit",
      add: "Idagdag",
      remove: "Alisin",
      confirm: "Kumpirmahin",
      yes: "Oo",
      no: "Hindi",
    },
  },
} as const;

export type TranslationKey = typeof translations.en;
// Use a recursive string-value type so both en and fil are assignable
export type AnyTranslation = Record<string, unknown>;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationKey;
}

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => {},
  t: translations.en,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");
  const { data: user } = trpc.auth.me.useQuery();
  const utils = trpc.useUtils();
  const updateProfile = trpc.user.updateProfile.useMutation({
    onSuccess: () => utils.auth.me.invalidate(),
  });

  // Sync language from user's saved preference on load
  useEffect(() => {
    if (user && (user as { language?: string }).language) {
      const saved = (user as { language?: string }).language as Language;
      if (saved === "en" || saved === "fil") {
        setLanguageState(saved);
      }
    }
  }, [user]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    // Persist to DB if user is logged in
    if (user) {
      updateProfile.mutate({ language: lang });
    }
  };

  const t = translations[language] as TranslationKey;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
