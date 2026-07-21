"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { conversationKeys } from "@/hooks/query-keys";
import { conversationsService } from "@/services/conversations.service";
import type { ListQuery } from "@/types/common";
import type { CreateConversationInput, SendConversationMessageInput } from "@/types/conversations";

export function useConversations(query?: ListQuery) {
  return useQuery({
    queryKey: conversationKeys.list(query),
    queryFn: () => conversationsService.list(query),
  });
}

export function useConversation(conversationId?: string) {
  return useQuery({
    queryKey: conversationKeys.detail(conversationId ?? ""),
    queryFn: () => conversationsService.getById(conversationId as string),
    enabled: Boolean(conversationId),
  });
}

export function useCreateConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateConversationInput) => conversationsService.create(input),
    onSuccess: (conversation) => {
      queryClient.setQueryData(conversationKeys.detail(conversation.id), {
        ...conversation,
        messages: [],
      });
      return queryClient.invalidateQueries({ queryKey: conversationKeys.all });
    },
  });
}

export function useSendConversationMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      conversationId,
      input,
    }: {
      conversationId: string;
      input: SendConversationMessageInput;
    }) => conversationsService.sendMessage(conversationId, input),
    onSuccess: (conversation) => {
      queryClient.setQueryData(conversationKeys.detail(conversation.id), conversation);
      return queryClient.invalidateQueries({ queryKey: conversationKeys.all });
    },
  });
}
