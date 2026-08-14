"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";
import { createClient } from "./supabase/client";
import { isSupabaseConfigured } from "./supabase/config";
import {
  Answer,
  AdminPurchase,
  Department,
  Doubt,
  LeaderboardEntry,
  Note,
  Profile,
  PYQ,
  Purchase,
  Question,
  Report,
  Subject,
} from "./types";

interface AddNotePayload {
  title: string;
  subjectName: string;
  description: string;
  price: number;
  pages: number;
  previewPages: number;
  file: File;
}

interface StoreShape {
  user: Profile | null;
  loading: boolean;
  isAdmin: boolean;
  authError: string | null;
  configured: boolean;

  departments: Department[];
  subjects: Subject[];
  subjectsByDept: Record<string, string[]>;

  pyqs: PYQ[];
  questions: Question[];
  notes: Note[];
  doubts: Doubt[];
  purchases: Purchase[];
  leaderboard: LeaderboardEntry[];
  reports: Report[];
  pendingPayments: AdminPurchase[];

  signup: (name: string, email: string, password: string) => Promise<{ error?: string; needsConfirmation?: boolean }>;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  completeOnboarding: (departmentCode: string, year: number) => Promise<{ error?: string }>;

  addNote: (payload: AddNotePayload) => Promise<{ error?: string }>;
  buyNote: (noteId: string, paymentReference: string) => Promise<{ error?: string }>;
  hasPurchased: (noteId: string) => boolean;
  purchaseStatus: (noteId: string) => "none" | "pending_verification" | "verified" | "rejected";

  addDoubt: (subjectName: string, title: string, body: string) => Promise<{ error?: string }>;
  addAnswer: (doubtId: string, body: string) => Promise<{ error?: string }>;

  fetchReports: () => Promise<void>;
  fetchPendingPayments: () => Promise<void>;
  resolveReport: (id: string, status: "resolved" | "dismissed") => Promise<{ error?: string }>;
  setNoteStatus: (noteId: string, status: "approved" | "rejected") => Promise<{ error?: string }>;
  verifyPurchase: (purchaseId: string, noteId: string) => Promise<{ error?: string }>;

  refreshAll: () => Promise<void>;
}

const StoreContext = createContext<StoreShape | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const supabase = useMemo(() => createClient(), []);

  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const [departments, setDepartments] = useState<Department[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [pyqs, setPyqs] = useState<PYQ[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [doubts, setDoubts] = useState<Doubt[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [pendingPayments, setPendingPayments] = useState<AdminPurchase[]>([]);

  const departmentCodeById = useMemo(() => {
    const map = new Map<string, string>();
    departments.forEach((d) => map.set(d.id, d.code));
    return map;
  }, [departments]);

  const subjectsByDept = useMemo(() => {
    const map: Record<string, string[]> = {};
    subjects.forEach((s) => {
      const code = departmentCodeById.get(s.departmentId);
      if (!code) return;
      map[code] = map[code] ? [...map[code], s.name] : [s.name];
    });
    return map;
  }, [subjects, departmentCodeById]);

  const getSubjectId = useCallback(
    (deptCode: string | null, subjectName: string): string | null => {
      const match = subjects.find((s) => {
        const code = departmentCodeById.get(s.departmentId);
        return s.name === subjectName && (deptCode ? code === deptCode : true);
      });
      return match?.id ?? null;
    },
    [subjects, departmentCodeById]
  );

  // -------------------- fetchers --------------------

  const fetchProfile = useCallback(
    async (userId: string): Promise<Profile | null> => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, name, email, department_id, year, role, xp, onboarded, departments(code)")
        .eq("id", userId)
        .maybeSingle();
      if (error || !data) return null;
      return {
        id: data.id,
        name: data.name,
        email: data.email,
        departmentId: data.department_id,
        // @ts-expect-error - joined relation typed loosely by PostgREST
        departmentCode: data.departments?.code ?? null,
        year: data.year,
        role: data.role,
        xp: data.xp,
        onboarded: data.onboarded,
      };
    },
    [supabase]
  );

  const fetchReference = useCallback(async () => {
    const [{ data: deps }, { data: subs }] = await Promise.all([
      supabase.from("departments").select("id, name, code"),
      supabase.from("subjects").select("id, department_id, semester_id, name, code"),
    ]);
    setDepartments((deps ?? []).map((d) => ({ id: d.id, name: d.name, code: d.code })));
    setSubjects(
      (subs ?? []).map((s) => ({
        id: s.id,
        departmentId: s.department_id,
        semesterId: s.semester_id,
        name: s.name,
        code: s.code,
      }))
    );
  }, [supabase]);

  const fetchPyqs = useCallback(async () => {
    const { data } = await supabase
      .from("pyqs")
      .select("id, subject_id, exam_year, exam_type, file_path, status, subjects(name)")
      .eq("status", "approved")
      .order("exam_year", { ascending: false });
    setPyqs(
      (data ?? []).map((p: any) => ({
        id: p.id,
        subjectId: p.subject_id,
        subjectName: p.subjects?.name ?? "Unknown subject",
        examYear: p.exam_year,
        examType: p.exam_type,
        filePath: p.file_path,
        status: p.status,
      }))
    );
  }, [supabase]);

  const fetchQuestions = useCallback(async () => {
    const { data } = await supabase
      .from("questions")
      .select("id, subject_id, unit, question, solution, importance, difficulty, subjects(name)");
    setQuestions(
      (data ?? []).map((q: any) => ({
        id: q.id,
        subjectId: q.subject_id,
        subjectName: q.subjects?.name ?? "Unknown subject",
        unit: q.unit,
        question: q.question,
        solution: q.solution,
        importance: q.importance,
        difficulty: q.difficulty,
      }))
    );
  }, [supabase]);

  const fetchNotes = useCallback(async () => {
    const { data } = await supabase
      .from("notes")
      .select(
        "*, seller:profiles!notes_seller_id_fkey(name), subjects(name)"
      )
      .order("created_at", { ascending: false });
    setNotes(
      (data ?? []).map((n: any) => ({
        id: n.id,
        title: n.title,
        subjectId: n.subject_id,
        subjectName: n.subjects?.name ?? "General",
        description: n.description,
        pages: n.pages,
        previewPages: n.preview_pages,
        price: n.price,
        filePath: n.file_path,
        status: n.status,
        rating: Number(n.rating),
        reviewCount: n.review_count,
        sellerId: n.seller_id,
        sellerName: n.seller?.name ?? "Unknown seller",
        salesCount: n.sales_count,
        createdAt: n.created_at,
      }))
    );
  }, [supabase]);

  const fetchDoubts = useCallback(async () => {
    const { data } = await supabase
      .from("doubts")
      .select(
        "id, subject_id, title, body, created_at, subjects(name), author:profiles!doubts_user_id_fkey(name), user_id, answers(id, doubt_id, user_id, body, is_accepted, upvotes, created_at, author:profiles!answers_user_id_fkey(name))"
      )
      .order("created_at", { ascending: false });
    setDoubts(
      (data ?? []).map((d: any) => ({
        id: d.id,
        subjectId: d.subject_id,
        subjectName: d.subjects?.name ?? "General",
        title: d.title,
        body: d.body,
        userId: d.user_id,
        authorName: d.author?.name ?? "Unknown",
        createdAt: d.created_at,
        answers: (d.answers ?? [])
          .map((a: any) => ({
            id: a.id,
            doubtId: a.doubt_id,
            userId: a.user_id,
            authorName: a.author?.name ?? "Unknown",
            body: a.body,
            upvotes: a.upvotes,
            accepted: a.is_accepted,
            createdAt: a.created_at,
          }))
          .sort((a: Answer, b: Answer) => (a.createdAt > b.createdAt ? 1 : -1)),
      }))
    );
  }, [supabase]);

  const fetchPurchases = useCallback(async () => {
    // BUGFIX: this used to be select("*") with no buyer_id filter, relying
    // only on RLS — which *also* lets a seller see purchases of their own
    // notes. That meant a student who sells notes got other buyers'
    // purchase rows mixed into their own "My Purchases" page. Scope this to
    // "my purchases as a buyer" explicitly; admins get a separate query
    // (fetchPendingPayments below) for cross-user payment verification.
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();
    if (!authUser) {
      setPurchases([]);
      return;
    }
    const { data } = await supabase.from("purchases").select("*").eq("buyer_id", authUser.id);
    setPurchases(
      (data ?? []).map((p: any) => ({
        id: p.id,
        noteId: p.note_id,
        buyerId: p.buyer_id,
        sellerId: p.seller_id,
        amount: p.amount,
        paymentStatus: p.payment_status,
        paymentReference: p.payment_reference,
        createdAt: p.created_at,
      }))
    );
  }, [supabase]);

  const fetchLeaderboard = useCallback(async () => {
    const { data } = await supabase
      .from("profiles")
      .select("name, xp, year, departments(code)")
      .order("xp", { ascending: false })
      .limit(20);
    setLeaderboard(
      (data ?? []).map((p: any) => ({
        name: p.name,
        xp: p.xp,
        tag: `${p.departments?.code ?? "—"} • Year ${p.year ?? "—"}`,
      }))
    );
  }, [supabase]);

  const refreshAll = useCallback(async () => {
    if (!isSupabaseConfigured) return;
    await Promise.all([
      fetchReference(),
      fetchPyqs(),
      fetchQuestions(),
      fetchNotes(),
      fetchDoubts(),
      fetchPurchases(),
      fetchLeaderboard(),
    ]);
  }, [fetchReference, fetchPyqs, fetchQuestions, fetchNotes, fetchDoubts, fetchPurchases, fetchLeaderboard]);

  // -------------------- auth bootstrap --------------------

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    let mounted = true;

    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        const profile = await fetchProfile(session.user.id);
        if (mounted) setUser(profile);
      }
      await refreshAll();
      if (mounted) setLoading(false);
    })();

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const profile = await fetchProfile(session.user.id);
        setUser(profile);
      } else {
        setUser(null);
      }
      await fetchPurchases();
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // -------------------- auth actions --------------------

  const NOT_CONFIGURED = "Supabase isn't connected yet — add your project URL and keys to .env.local (see .env.local.example) to enable accounts and saving data.";

  const signup: StoreShape["signup"] = async (name, email, password) => {
    if (!isSupabaseConfigured) return { error: NOT_CONFIGURED };
    setAuthError(null);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    if (error) {
      setAuthError(error.message);
      return { error: error.message };
    }
    if (!data.session) {
      return { needsConfirmation: true };
    }
    const profile = await fetchProfile(data.user!.id);
    setUser(profile);
    return {};
  };

  const login: StoreShape["login"] = async (email, password) => {
    if (!isSupabaseConfigured) return { error: NOT_CONFIGURED };
    setAuthError(null);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setAuthError(error.message);
      return { error: error.message };
    }
    const profile = await fetchProfile(data.user.id);
    setUser(profile);
    await fetchPurchases();
    return {};
  };

  const logout = async () => {
    if (!isSupabaseConfigured) return;
    await supabase.auth.signOut();
    setUser(null);
    setPurchases([]);
  };

  const completeOnboarding: StoreShape["completeOnboarding"] = async (departmentCode, year) => {
    if (!isSupabaseConfigured) return { error: NOT_CONFIGURED };
    if (!user) return { error: "Not logged in." };
    const dept = departments.find((d) => d.code === departmentCode);
    if (!dept) return { error: "Unknown department." };
    const { error } = await supabase
      .from("profiles")
      .update({ department_id: dept.id, year, onboarded: true })
      .eq("id", user.id);
    if (error) return { error: error.message };
    setUser({ ...user, departmentId: dept.id, departmentCode: dept.code, year, onboarded: true });
    return {};
  };

  // -------------------- notes / marketplace --------------------

  const addNote: StoreShape["addNote"] = async ({
    title,
    subjectName,
    description,
    price,
    pages,
    previewPages,
    file,
  }) => {
    if (!isSupabaseConfigured) return { error: NOT_CONFIGURED };
    if (!user) return { error: "Log in first." };
    const subjectId = getSubjectId(user.departmentCode, subjectName);
    const path = `${user.id}/${crypto.randomUUID()}-${file.name}`;

    const { error: uploadError } = await supabase.storage.from("notes").upload(path, file);
    if (uploadError) return { error: uploadError.message };

    const { error: insertError } = await supabase.from("notes").insert({
      seller_id: user.id,
      subject_id: subjectId,
      title,
      description,
      price,
      pages,
      preview_pages: previewPages,
      file_path: path,
      status: "pending",
    });
    if (insertError) return { error: insertError.message };

    await fetchNotes();
    return {};
  };

  const buyNote: StoreShape["buyNote"] = async (noteId, paymentReference) => {
    if (!isSupabaseConfigured) return { error: NOT_CONFIGURED };
    if (!user) return { error: "Log in first." };
    const note = notes.find((n) => n.id === noteId);
    if (!note) return { error: "Note not found." };

    // BUGFIX: purchases has UNIQUE(buyer_id, note_id), but this used to be a
    // plain insert — so if a payment was rejected, resubmitting threw a raw
    // Postgres duplicate-key error instead of letting the buyer retry.
    // Upserting on that same constraint resets the existing row instead.
    const { error } = await supabase.from("purchases").upsert(
      {
        buyer_id: user.id,
        note_id: noteId,
        seller_id: note.sellerId,
        amount: note.price,
        payment_method: "upi_manual",
        payment_status: "pending_verification",
        payment_reference: paymentReference,
      },
      { onConflict: "buyer_id,note_id" }
    );
    if (error) return { error: error.message };

    await fetchPurchases();
    return {};
  };

  const hasPurchased = (noteId: string) =>
    purchases.some((p) => p.noteId === noteId && p.paymentStatus === "verified");

  const purchaseStatus: StoreShape["purchaseStatus"] = (noteId) => {
    const p = purchases.find((p) => p.noteId === noteId);
    return p ? p.paymentStatus : "none";
  };

  // -------------------- doubts --------------------

  const addDoubt: StoreShape["addDoubt"] = async (subjectName, title, body) => {
    if (!isSupabaseConfigured) return { error: NOT_CONFIGURED };
    if (!user) return { error: "Log in first." };
    const subjectId = getSubjectId(user.departmentCode, subjectName);
    const { error } = await supabase.from("doubts").insert({
      user_id: user.id,
      subject_id: subjectId,
      title,
      body,
    });
    if (error) return { error: error.message };
    await Promise.all([fetchDoubts(), bumpXP(5)]);
    return {};
  };

  const addAnswer: StoreShape["addAnswer"] = async (doubtId, body) => {
    if (!isSupabaseConfigured) return { error: NOT_CONFIGURED };
    if (!user) return { error: "Log in first." };
    const { error } = await supabase.from("answers").insert({
      doubt_id: doubtId,
      user_id: user.id,
      body,
    });
    if (error) return { error: error.message };
    await Promise.all([fetchDoubts(), bumpXP(10)]);
    return {};
  };

  // XP is updated client-side against a policy that only allows updating your
  // own row — fine for a college project, but a determined user could tamper
  // with the request. For real deployment, move this into a Postgres
  // function (RPC) called with SECURITY DEFINER instead.
  const bumpXP = async (amount: number) => {
    if (!isSupabaseConfigured || !user) return;
    const next = user.xp + amount;
    const { error } = await supabase.from("profiles").update({ xp: next }).eq("id", user.id);
    if (!error) setUser({ ...user, xp: next });
  };

  // -------------------- admin / moderation --------------------

  // Admin-only: sees every buyer's pending payment (RLS is_staff() allows
  // this), unlike fetchPurchases() above which is deliberately scoped to
  // "my own purchases".
  const fetchPendingPayments = useCallback(async () => {
    if (!isSupabaseConfigured) return;
    const { data } = await supabase
      .from("purchases")
      .select(
        "id, note_id, amount, payment_reference, created_at, notes(title), buyer:profiles!purchases_buyer_id_fkey(name)"
      )
      .eq("payment_status", "pending_verification")
      .order("created_at", { ascending: true });
    setPendingPayments(
      (data ?? []).map((p: any) => ({
        id: p.id,
        noteId: p.note_id,
        noteTitle: p.notes?.title ?? "Unknown note",
        buyerName: p.buyer?.name ?? "Unknown buyer",
        amount: p.amount,
        paymentReference: p.payment_reference,
        createdAt: p.created_at,
      }))
    );
  }, [supabase]);

  const fetchReports = useCallback(async () => {
    if (!isSupabaseConfigured) return;
    const { data } = await supabase
      .from("reports")
      .select("id, content_type, content_id, reason, status, created_at, reporter:profiles!reports_reporter_id_fkey(name)")
      .order("created_at", { ascending: false });
    setReports(
      (data ?? []).map((r: any) => ({
        id: r.id,
        contentType: r.content_type,
        contentId: r.content_id,
        reason: r.reason,
        status: r.status,
        reporterName: r.reporter?.name ?? "Unknown",
        createdAt: r.created_at,
      }))
    );
  }, [supabase]);

  const resolveReport: StoreShape["resolveReport"] = async (id, status) => {
    if (!isSupabaseConfigured) return { error: NOT_CONFIGURED };
    const { error } = await supabase.from("reports").update({ status }).eq("id", id);
    if (error) return { error: error.message };
    await fetchReports();
    return {};
  };

  const setNoteStatus: StoreShape["setNoteStatus"] = async (noteId, status) => {
    if (!isSupabaseConfigured) return { error: NOT_CONFIGURED };
    const { error } = await supabase.from("notes").update({ status }).eq("id", noteId);
    if (error) return { error: error.message };
    await fetchNotes();
    return {};
  };

  const verifyPurchase: StoreShape["verifyPurchase"] = async (purchaseId, noteId) => {
    if (!isSupabaseConfigured) return { error: NOT_CONFIGURED };
    const { error } = await supabase
      .from("purchases")
      .update({ payment_status: "verified" })
      .eq("id", purchaseId);
    if (error) return { error: error.message };

    const note = notes.find((n) => n.id === noteId);
    if (note) {
      await supabase
        .from("notes")
        .update({ sales_count: note.salesCount + 1 })
        .eq("id", noteId);
    }
    await Promise.all([fetchPurchases(), fetchNotes(), fetchPendingPayments()]);
    return {};
  };

  const value = useMemo<StoreShape>(
    () => ({
      user,
      loading,
      isAdmin: user?.role === "admin" || user?.role === "moderator",
      authError,
      configured: isSupabaseConfigured,
      departments,
      subjects,
      subjectsByDept,
      pyqs,
      questions,
      notes,
      doubts,
      purchases,
      leaderboard,
      reports,
      pendingPayments,
      signup,
      login,
      logout,
      completeOnboarding,
      addNote,
      buyNote,
      hasPurchased,
      purchaseStatus,
      addDoubt,
      addAnswer,
      fetchReports,
      fetchPendingPayments,
      resolveReport,
      setNoteStatus,
      verifyPurchase,
      refreshAll,
    }),
    [
      user,
      loading,
      authError,
      departments,
      subjects,
      subjectsByDept,
      pyqs,
      questions,
      notes,
      doubts,
      purchases,
      leaderboard,
      reports,
      pendingPayments,
    ]
    // eslint-disable-next-line react-hooks/exhaustive-deps
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
