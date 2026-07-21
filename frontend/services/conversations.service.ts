import { mockApi } from "@/mocks/mock-api";
import { apiClient } from "@/services/api-client";
import { fromDataSource, withQuery } from "@/services/service-utils";
import type { ListQuery } from "@/types/common";
import type {
  Conversation,
  ConversationDetail,
  CreateConversationInput,
  SendConversationMessageInput,
} from "@/types/conversations";

export const conversationsService = {
  create(input: CreateConversationInput): Promise<Conversation> {
    return fromDataSource(
      () => mockApi.conversations.create(input),
      () => apiClient.post<Conversation>("/conversations", input),
    );
  },

  list(query?: ListQuery): Promise<Conversation[]> {
    return fromDataSource(
      () => mockApi.conversations.list(query),
      () => apiClient.get<Conversation[]>(withQuery("/conversations", query)),
    );
  },

  getById(conversationId: string): Promise<ConversationDetail> {
    return fromDataSource(
      () => mockApi.conversations.getById(conversationId),
      () => apiClient.get<ConversationDetail>(`/conversations/${conversationId}`),
    );
  },

  sendMessage(
    conversationId: string,
    input: SendConversationMessageInput,
  ): Promise<ConversationDetail> {
    return fromDataSource(
      () => mockApi.conversations.sendMessage(conversationId, input),
      () => apiClient.post<ConversationDetail>(`/conversations/${conversationId}/messages`, input),
    );
  },
};
