export type EventPhase = 'PRE-FINAL' | 'FINAL / DURING EVENT' | 'POST-EVENT';

export type ContentStatus = 'published' | 'draft' | 'hidden';

export interface Topic {
  id: string;
  title: string;
  description: string;
  iconName: string;
  displayOrder: number;
  status: ContentStatus;
  featured?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Subtopic {
  id: string;
  topicId: string;
  title: string;
  description: string;
  content: string;
  displayOrder: number;
  status: ContentStatus;
  relatedImages?: string[];
  relatedDocuments?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  summary: string;
  content: string;
  imageUrl?: string;
  isPinned: boolean;
  status: ContentStatus;
  category: string;
  associatedEventId?: string;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface EventItem {
  id: string;
  title: string;
  category: string;
  description: string;
  guidelines: string;
  venue: string;
  scheduleTime: string;
  contingentLeader?: string;
  status: ContentStatus;
  featured?: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface ScheduleItem {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  venue: string;
  description?: string;
  associatedEventId?: string;
  isUpdated?: boolean;
  status: ContentStatus;
  phase: EventPhase;
}

export interface Infographic {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  thumbnailUrl?: string;
  topicId?: string;
  subtopicId?: string;
  eventId?: string;
  tags: string[];
  status: ContentStatus;
  displayOrder: number;
  uploadedAt: string;
  sizeBytes?: number;
}

export interface DocumentItem {
  id: string;
  title: string;
  description: string;
  fileUrl: string;
  fileType: 'pdf' | 'doc' | 'sheet' | 'link';
  fileSize?: string;
  associatedEventId?: string;
  status: ContentStatus;
  updatedAt: string;
}

export interface TravelAccommodationInfo {
  meetingPoint: string;
  departureTime: string;
  transportationDetails: string;
  accommodationVenue: string;
  checkInInstructions: string;
  roomAssignmentsNotice: string;
  emergencyContacts: {
    name: string;
    role: string;
    phone: string;
  }[];
}

export interface PortalSettings {
  activePhase: EventPhase;
  contingentName: string;
  eventName: string;
  tagline: string;
  lastUpdated: string;
  noticeBanner?: {
    enabled: boolean;
    text: string;
  };
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  isAdmin: boolean;
}
