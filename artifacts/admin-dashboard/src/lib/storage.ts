export interface Participant {
  id: number;
  name: string;
  age: number;
  gradeLevel: string;
  guardianName: string;
  guardianPhone: string;
  guardianPhoneAlt: string;
  nationalId: string;
  registrationDate: string;
  endDate: string;
  amountPaid: number;
  amountRemaining: number;
  registrationDuration: string;
  notes: string;
}

export type ParticipantWithStatus = Participant & { status: "active" | "expired" };

const PARTICIPANTS_KEY = "nadeelnokhba_participants";
const AUTH_KEY = "nadeelnokhba_auth";
const NEXT_ID_KEY = "nadeelnokhba_next_id";

const SEED: Participant[] = [
  {
    id: 1,
    name: "محمد عبدالله الغامدي",
    age: 12,
    gradeLevel: "سادس ابتدائي",
    guardianName: "عبدالله الغامدي",
    guardianPhone: "0501234567",
    guardianPhoneAlt: "0551234567",
    nationalId: "1098765432",
    registrationDate: "2025-06-01",
    endDate: "2025-08-31",
    amountPaid: 1500,
    amountRemaining: 0,
    registrationDuration: "ثلاثة أشهر",
    notes: "متحمس جداً للأنشطة الرياضية",
  },
  {
    id: 2,
    name: "سارة خالد العتيبي",
    age: 10,
    gradeLevel: "رابع ابتدائي",
    guardianName: "خالد العتيبي",
    guardianPhone: "0509876543",
    guardianPhoneAlt: "",
    nationalId: "1087654321",
    registrationDate: "2025-05-15",
    endDate: "2025-06-15",
    amountPaid: 800,
    amountRemaining: 200,
    registrationDuration: "شهر",
    notes: "",
  },
  {
    id: 3,
    name: "فيصل سعد القحطاني",
    age: 15,
    gradeLevel: "ثالث متوسط",
    guardianName: "سعد القحطاني",
    guardianPhone: "0556789012",
    guardianPhoneAlt: "",
    nationalId: "1076543210",
    registrationDate: "2025-07-01",
    endDate: "2025-12-31",
    amountPaid: 2000,
    amountRemaining: 500,
    registrationDuration: "ثلاثة أشهر",
    notes: "يحتاج متابعة خاصة في التمارين",
  },
];

function init() {
  if (!localStorage.getItem(PARTICIPANTS_KEY)) {
    localStorage.setItem(PARTICIPANTS_KEY, JSON.stringify(SEED));
    localStorage.setItem(NEXT_ID_KEY, "4");
  }
}

export function getParticipants(): ParticipantWithStatus[] {
  init();
  const raw = localStorage.getItem(PARTICIPANTS_KEY);
  const list: Participant[] = raw ? JSON.parse(raw) : [];
  const today = new Date().toISOString().slice(0, 10);
  return list.map((p) => ({
    ...p,
    status: p.endDate >= today ? "active" : "expired",
  }));
}

export function getParticipant(id: number): ParticipantWithStatus | undefined {
  return getParticipants().find((p) => p.id === id);
}

export function saveParticipant(data: Omit<Participant, "id">): Participant {
  init();
  const nextId = Number(localStorage.getItem(NEXT_ID_KEY) || "1");
  const participant: Participant = { id: nextId, ...data };
  const list = getParticipants().map(({ status: _s, ...p }) => p);
  list.push(participant);
  localStorage.setItem(PARTICIPANTS_KEY, JSON.stringify(list));
  localStorage.setItem(NEXT_ID_KEY, String(nextId + 1));
  return participant;
}

export function updateParticipant(id: number, data: Omit<Participant, "id">): boolean {
  const list = getParticipants().map(({ status: _s, ...p }) => p);
  const idx = list.findIndex((p) => p.id === id);
  if (idx === -1) return false;
  list[idx] = { id, ...data };
  localStorage.setItem(PARTICIPANTS_KEY, JSON.stringify(list));
  return true;
}

export function deleteParticipant(id: number): boolean {
  const list = getParticipants()
    .map(({ status: _s, ...p }) => p)
    .filter((p) => p.id !== id);
  localStorage.setItem(PARTICIPANTS_KEY, JSON.stringify(list));
  return true;
}

export function isLoggedIn(): boolean {
  return localStorage.getItem(AUTH_KEY) === "true";
}

export function login(username: string, password: string): boolean {
  if (username === "12345" && password === "12345") {
    localStorage.setItem(AUTH_KEY, "true");
    return true;
  }
  return false;
}

export function logout() {
  localStorage.removeItem(AUTH_KEY);
}
