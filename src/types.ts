/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Artwork {
  id: number;
  title: string;
  description: string;
  category: string;
  imageUrl: string;
  createdAt: string;
  studentName?: string; // Name and surname of student artist
  studentAge?: string;  // Age of the child artist
}

export interface Illustration {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  createdAt: string;
}

export interface Course {
  id: number;
  title: string;
  description: string;
  ageGroup: string;
  price: number;
  startDate: string;
  maxStudents: number;
  imageUrl: string;
  active: number; // 1 = active, 0 = inactive
  registrationCount?: number;
}

export interface Registration {
  id: number;
  courseId: number;
  courseTitle?: string;
  studentName: string;
  parentName: string;
  email: string;
  phone: string;
  status: 'pending' | 'confirmed' | 'canceled';
  amountPaid: number;
  paymentMethod?: string;
  receiptImage?: string | null;
  createdAt: string;
}

export interface Message {
  id: number;
  senderName: string;
  email: string;
  message: string;
  reply: string | null;
  replyAttachment: string | null; // base64 or file path
  replyAttachmentName: string | null;
  status: 'unread' | 'replied' | 'read';
  createdAt: string;
  repliedAt: string | null;
}

export interface AdminStats {
  totalRevenue: number;
  totalRegistrations: number;
  totalArtworks: number;
  totalCourses: number;
  revenueByCourse: { courseTitle: string; revenue: number; registrations: number }[];
}

export interface AdminSettings {
  biography: string;
  profileImage: string;
  artistName: string;
  contactEmail: string;
  contactPhone: string;
  totpEnabled?: boolean;
  totpSecret?: string;
  cardNo?: string;
  cardHolder?: string;
  bankName?: string;
  siteTitle?: string;
}
