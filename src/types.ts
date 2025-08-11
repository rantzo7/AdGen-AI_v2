export interface CampaignObjective {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType | null; // Allow null for icon in chat context
}

export interface AdCreative {
  id: string;
  imageUrl: string;
  isSelected: boolean;
}

export interface AdCopy {
  headline: string;
  primaryText: string;
}

export interface CampaignData {
  objective: string | null;
  ageRange: [number, number];
  interests: string[];
  adUrl: string;
  selectedImage: string | null;
  adCopies: AdCopy[];
}
