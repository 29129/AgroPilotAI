import type { EntityId, IsoDateString } from "@/types/common";

export type ConversationRole = "USER" | "ASSISTANT" | "SYSTEM";

/** Pending API_CONTRACT v1: references and suggested-action schemas require confirmation. */
export interface ConversationReference {
  type: "CROP" | "WEATHER" | "RECOMMENDATION" | "DIAGNOSIS" | "MARKET";
  label: string;
  id?: EntityId;
}

export interface ConversationMessage {
  id: EntityId;
  conversationId: EntityId;
  role: ConversationRole;
  content: string;
  createdAt: IsoDateString;
  references?: ConversationReference[];
}

export interface Conversation {
  id: EntityId;
  cropId?: EntityId;
  title?: string;
  createdAt: IsoDateString;
  updatedAt: IsoDateString;
}

export interface ConversationDetail extends Conversation {
  messages: ConversationMessage[];
}

export interface CreateConversationInput {
  cropId?: EntityId;
  title?: string;
}

export interface SendConversationMessageInput {
  content: string;
}
