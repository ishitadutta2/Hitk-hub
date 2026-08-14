export type Role = "student" | "moderator" | "admin";

export interface Department {
  id: string;
  name: string;
  code: string;
}

export interface Subject {
  id: string;
  departmentId: string;
  semesterId: string | null;
  name: string;
  code: string | null;
}

export interface Profile {
  id: string;
  name: string;
  email: string;
  departmentId: string | null;
  departmentCode: string | null;
  year: number | null;
  role: Role;
  xp: number;
  onboarded: boolean;
}

export interface PYQ {
  id: string;
  subjectId: string;
  subjectName: string;
  examYear: number;
  examType: "Mid Sem" | "End Sem";
  filePath: string | null;
  status: "pending" | "approved" | "rejected";
}

export type Importance = "Important" | "Frequent" | "Must Study";
export type Difficulty = "Easy" | "Medium" | "Hard";

export interface Question {
  id: string;
  subjectId: string;
  subjectName: string;
  unit: string;
  question: string;
  solution: string;
  importance: Importance;
  difficulty: Difficulty;
}

export type NoteStatus = "pending" | "approved" | "rejected";

export interface Note {
  id: string;
  title: string;
  subjectId: string | null;
  subjectName: string;
  description: string;
  pages: number;
  previewPages: number;
  price: number;
  filePath: string;
  status: NoteStatus;
  rating: number;
  reviewCount: number;
  sellerId: string;
  sellerName: string;
  salesCount: number;
  createdAt: string;
}

export type PaymentStatus = "pending_verification" | "verified" | "rejected";

export interface Purchase {
  id: string;
  noteId: string;
  buyerId: string;
  sellerId: string;
  amount: number;
  paymentStatus: PaymentStatus;
  paymentReference: string | null;
  createdAt: string;
}

export interface Answer {
  id: string;
  doubtId: string;
  userId: string;
  authorName: string;
  body: string;
  upvotes: number;
  accepted: boolean;
  createdAt: string;
}

export interface Doubt {
  id: string;
  subjectId: string | null;
  subjectName: string;
  title: string;
  body: string;
  userId: string;
  authorName: string;
  createdAt: string;
  answers: Answer[];
}

export interface Report {
  id: string;
  contentType: string;
  contentId: string;
  reason: string;
  status: "pending" | "resolved" | "dismissed";
  reporterName: string;
  createdAt: string;
}

export interface AdminPurchase {
  id: string;
  noteId: string;
  noteTitle: string;
  buyerName: string;
  amount: number;
  paymentReference: string | null;
  createdAt: string;
}

export interface LeaderboardEntry {
  name: string;
  xp: number;
  tag: string;
}

export const MIN_NOTE_PRICE = 9;
export const MAX_NOTE_PRICE = 499;
export const PLATFORM_FEE_PERCENT = 10;
export const YEARS = [1, 2, 3, 4];
