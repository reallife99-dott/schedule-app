export type AnswerStatus = "best" | "ok" | "maybe" | "no";

export interface Slot {
  id: string;
  eventId: string;
  startAt: string; // ISO string
  endAt: string;   // ISO string
}

export interface Answer {
  id: string;
  slotId: string;
  responseId: string;
  status: AnswerStatus;
}

export interface Response {
  id: string;
  eventId: string;
  name: string;
  memo?: string | null;
  createdAt: string;
  answers: Answer[];
}

export interface Event {
  id: string;
  adminToken: string;
  title: string;
  description?: string | null;
  deadline?: string | null;
  createdAt: string;
  slots: Slot[];
  responses: Response[];
}

// API request/response types

export interface CreateEventRequest {
  title: string;
  description?: string;
  deadline?: string;
  slots: Array<{
    startAt: string;
    endAt: string;
  }>;
}

export interface CreateEventResponse {
  eventId: string;
  adminToken: string;
  eventUrl: string;
  adminUrl: string;
}

export interface CreateResponseRequest {
  name: string;
  memo?: string;
  answers: Array<{
    slotId: string;
    status: AnswerStatus;
  }>;
}

// View model for admin summary
export interface SlotSummary {
  slot: Slot;
  counts: Record<AnswerStatus, number>;
  totalPositive: number; // best + ok
}

export interface AdminEventData {
  event: Omit<Event, "adminToken">;
  responses: Response[];
  slotSummaries: SlotSummary[];
}
