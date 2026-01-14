import { createContext, useContext, useState, ReactNode } from "react";

interface CAProfileData {
  phone: string;
  qualification: string;
  membershipNumber: string;
  experience: string;
  specialization: string;
  firmName: string;
  bio: string;
  hasCertifications: boolean;
  hasIdProof: boolean;
  isSubmitted: boolean;
}

interface CAProfileContextType {
  profileData: CAProfileData;
  updateProfileData: (data: Partial<CAProfileData>) => void;
  isProfileComplete: () => boolean;
  submitForReview: () => void;
}

const defaultProfileData: CAProfileData = {
  phone: "",
  qualification: "",
  membershipNumber: "",
  experience: "",
  specialization: "",
  firmName: "",
  bio: "",
  hasCertifications: false,
  hasIdProof: false,
  isSubmitted: false,
};

const CAProfileContext = createContext<CAProfileContextType | undefined>(undefined);

export const CAProfileProvider = ({ children }: { children: ReactNode }) => {
  const [profileData, setProfileData] = useState<CAProfileData>(defaultProfileData);

  const updateProfileData = (data: Partial<CAProfileData>) => {
    setProfileData((prev) => ({ ...prev, ...data }));
  };

  const isProfileComplete = () => {
    return !!(
      profileData.phone &&
      profileData.qualification &&
      profileData.membershipNumber &&
      profileData.experience &&
      profileData.specialization &&
      profileData.bio &&
      profileData.hasCertifications &&
      profileData.hasIdProof
    );
  };

  const submitForReview = () => {
    setProfileData((prev) => ({ ...prev, isSubmitted: true }));
  };

  return (
    <CAProfileContext.Provider value={{ profileData, updateProfileData, isProfileComplete, submitForReview }}>
      {children}
    </CAProfileContext.Provider>
  );
};

export const useCAProfile = () => {
  const context = useContext(CAProfileContext);
  if (!context) {
    throw new Error("useCAProfile must be used within a CAProfileProvider");
  }
  return context;
};
