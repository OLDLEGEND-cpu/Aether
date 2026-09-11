import { createClient } from "@supabase/supabase-js";
import type { Conversation, ChatMessage } from "../types/chat";

export const SUPABASE_URL =
  (import.meta.env.VITE_SUPABASE_URL as string) ||
  "https://pagkktpafxzkyvekgrbr.supabase.co";

export const SUPABASE_ANON_KEY =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string) ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBhZ2trdHBhZnh6a3l2ZWtncmJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkxMDQ0NzIsImV4cCI6MjEwNDY4MDQ3Mn0.T8z85JMpxaEjLeC3tZfMO6IC9r5O0TZYowt7OECPseM";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export const SUPABASE_SQL_SCHEMA = `-- Aether AI Chatbot Database Schema for Supabase
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/pagkktpafxzkyvekgrbr/sql)

create table if not exists public.conversations (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  model text not null,
  pinned boolean default false,
  created_at bigint not null,
  updated_at bigint not null,
  synced_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.messages (
  id text primary key,
  conversation_id text references public.conversations(id) on delete cascade,
  role text not null,
  content text not null,
  attachments jsonb,
  thought_process text,
  timestamp bigint not null,
  status text default 'complete'
);

-- Row Level Security
alter table public.conversations enable row level security;
alter table public.messages enable row level security;

-- Policies allowing access
create policy "Allow all read access" on public.conversations for select using (true);
create policy "Allow all insert access" on public.conversations for insert with check (true);
create policy "Allow all update access" on public.conversations for update using (true);
create policy "Allow all delete access" on public.conversations for delete using (true);

create policy "Allow all messages read" on public.messages for select using (true);
create policy "Allow all messages insert" on public.messages for insert with check (true);
create policy "Allow all messages update" on public.messages for update using (true);
create policy "Allow all messages delete" on public.messages for delete using (true);
`;

export interface CloudSyncState {
  isConfigured: boolean;
  isTableReady: boolean;
  lastSyncedAt: number | null;
  error: string | null;
}

/**
 * Checks if the required tables exist in Supabase.
 */
export async function checkSupabaseTables(): Promise<boolean> {
  try {
    const { error } = await supabase.from("conversations").select("id").limit(1);
    if (error) {
      if (error.code === "PGRST205" || error.message?.includes("not find the table")) {
        return false;
      }
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Syncs a single conversation and its messages to Supabase.
 * Gracefully handles missing tables or offline conditions.
 */
export async function syncConversationToCloud(
  conversation: Conversation,
  userId?: string
): Promise<{ success: boolean; tableMissing?: boolean; error?: string }> {
  try {
    const { error: convErr } = await supabase.from("conversations").upsert({
      id: conversation.id,
      user_id: userId || null,
      title: conversation.title,
      model: conversation.model,
      pinned: conversation.pinned ?? false,
      created_at: conversation.createdAt,
      updated_at: conversation.updatedAt,
      synced_at: new Date().toISOString(),
    });

    if (convErr) {
      if (convErr.code === "PGRST205" || convErr.message?.includes("not find the table")) {
        return { success: false, tableMissing: true, error: "Supabase table 'conversations' not found" };
      }
      return { success: false, error: convErr.message };
    }

    // Sync messages
    if (conversation.messages.length > 0) {
      const records = conversation.messages.map((m) => ({
        id: m.id,
        conversation_id: conversation.id,
        role: m.role,
        content: m.content,
        attachments: m.attachments || null,
        thought_process: m.thoughtProcess || null,
        timestamp: m.timestamp,
        status: m.status || "complete",
      }));

      const { error: msgErr } = await supabase.from("messages").upsert(records);
      if (msgErr) {
        return { success: false, error: msgErr.message };
      }
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}

/**
 * Loads conversations and their messages from Supabase.
 */
export async function fetchRemoteConversations(): Promise<Conversation[] | null> {
  try {
    const { data: convs, error: convErr } = await supabase
      .from("conversations")
      .select("*")
      .order("updated_at", { ascending: false });

    if (convErr || !convs) {
      return null;
    }

    const { data: msgs } = await supabase
      .from("messages")
      .select("*")
      .order("timestamp", { ascending: true });

    const messagesByConv = new Map<string, ChatMessage[]>();
    if (msgs) {
      for (const row of msgs) {
        const list = messagesByConv.get(row.conversation_id) || [];
        list.push({
          id: row.id,
          role: row.role,
          content: row.content,
          timestamp: Number(row.timestamp),
          status: row.status,
          attachments: row.attachments || undefined,
          thoughtProcess: row.thought_process || undefined,
        });
        messagesByConv.set(row.conversation_id, list);
      }
    }

    return convs.map((c) => ({
      id: c.id,
      title: c.title,
      model: c.model,
      pinned: c.pinned,
      createdAt: Number(c.created_at),
      updatedAt: Number(c.updated_at),
      messages: messagesByConv.get(c.id) || [],
      syncedToCloud: true,
    }));
  } catch {
    return null;
  }
}

/**
 * Deletes a conversation from Supabase.
 */
export async function deleteRemoteConversation(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from("conversations").delete().eq("id", id);
    return !error;
  } catch {
    return false;
  }
}
