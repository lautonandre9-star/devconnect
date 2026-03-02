// types.ts
export type UserType = 'developer' | 'company';

export interface RegisterData {
  name: string;
  username: string;
  email: string;
  password: string;
  type: UserType;
  role?: string;
  skills?: string[];
  website?: string;
  otpCode: string;
}

export interface User {
  id: string;
  type: UserType;
  name: string;
  username: string;
  email?: string;
  bio?: string;
  avatar?: string;
  role?: string;
  githubUsername?: string;
  skills?: string[];
  // Company specific
  website?: string;
  companyDescription?: string;
  industry?: string;
  logo?: string;
  createdAt?: string;
}

export interface Job {
  id: string;
  companyId: string;
  companyName: string;
  companyLogo: string;
  title: string;
  location: string;
  type: 'FullTime' | 'Internship' | 'Contract';
  salary?: string;
  description: string;
  requirements: string[];
  postedAt: string;
  applicantsCount: number;
  hiredCount?: number;
  vacancies?: number;
}

export interface Application {
  id: string;
  jobId: string;
  jobTitle?: string;
  companyName?: string;
  companyLogo?: string;
  developerId: string;
  developerName: string;
  developerAvatar: string;
  developerBio?: string;
  developerRole?: string;
  developerSkills?: string[];
  appliedAt: string;
  status?: 'PENDING' | 'REVIEWING' | 'INTERVIEW' | 'ACCEPTED' | 'REJECTED';
  aiScore?: number;
  aiReasoning?: string;
}

export interface Project {
  id: string;
  authorId?: string;
  authorName: string;
  authorAvatar: string;
  authorRole?: string;
  title: string;
  description: string;
  image?: string;
  tags: string[];
  likes: number;
  comments: number;
  createdAt?: string;
}

export interface StartupProject {
  id: string;
  ownerId: string;
  ownerName?: string;
  ownerAvatar?: string;
  name: string;
  tagline: string;
  description: string;
  logo: string;
  tags: string[];
  status: 'MVP' | 'Beta' | 'Scaling';
  upvotes: number;
  websiteUrl?: string;
  githubUrl?: string;
}

export interface DevEvent {
  id: string;
  title: string;
  organizer: string;
  date: string;
  type: 'Hackathon' | 'Meetup' | 'Webinar';
  image: string;
  description?: string;
  isOnline: boolean;
  location?: string;
  attendees: number;
  maxAttendees?: number;
  isAttending?: boolean;
  registrationUrl?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  sender: {
    id: string;
    name: string;
    username: string;
    avatar?: string;
  };
  content: string;
  type: 'TEXT' | 'IMAGE' | 'FILE' | 'AUDIO';
  fileUrl?: string;
  fileName?: string;
  audioUrl?: string;
  audioDuration?: number;
  isRead: boolean;
  readAt?: string;
  isEdited: boolean;
  isPinned: boolean;
  isForwarded: boolean;
  createdAt: string;
  updatedAt: string;
}

export type AppView =
  | 'feed'
  | 'jobs'
  | 'projects'
  | 'communities'
  | 'profile'
  | 'events'
  | 'company-dashboard'
  | 'bookmarks'
  | 'messages'
  | 'settings'
  | 'devbuddy';