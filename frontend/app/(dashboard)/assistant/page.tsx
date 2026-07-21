"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";

import { EmptyState, ErrorState, LoadingState } from "@/components/ui/AsyncState";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  useConversation,
  useConversations,
  useCreateConversation,
  useCrops,
  useSendConversationMessage,
} from "@/hooks";
import type { ConversationMessage } from "@/types/conversations";

import styles from "./page.module.css";

function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-EC", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function messageLabel(message: ConversationMessage) {
  if (message.role === "ASSISTANT") {
    return "AgroPilot AI";
  }

  if (message.role === "SYSTEM") {
    return "Sistema";
  }

  return "Tú";
}

export default function AssistantPage() {
  const conversationsQuery = useConversations();
  const cropsQuery = useCrops();
  const [selectedConversationId, setSelectedConversationId] = useState<string>();
  const [newConversationTitle, setNewConversationTitle] = useState("");
  const [newConversationCropId, setNewConversationCropId] = useState("");
  const [draft, setDraft] = useState("");

  const conversationQuery = useConversation(selectedConversationId);
  const createConversation = useCreateConversation();
  const sendMessage = useSendConversationMessage();

  useEffect(() => {
    const conversations = conversationsQuery.data;

    if (!conversations?.length) {
      return;
    }

    const selectedConversationExists = conversations.some(
      (conversation) => conversation.id === selectedConversationId,
    );

    if (!selectedConversationId || !selectedConversationExists) {
      setSelectedConversationId(conversations[0].id);
    }
  }, [conversationsQuery.data, selectedConversationId]);

  function handleCreateConversation() {
    const selectedCrop = cropsQuery.data?.find((crop) => crop.id === newConversationCropId);
    const title =
      newConversationTitle.trim() ||
      (selectedCrop ? `Consulta sobre ${selectedCrop.cropType}` : "Nueva consulta agrícola");

    createConversation.mutate(
      {
        title,
        cropId: newConversationCropId || undefined,
      },
      {
        onSuccess: (conversation) => {
          setSelectedConversationId(conversation.id);
          setNewConversationTitle("");
        },
      },
    );
  }

  function handleSendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const content = draft.trim();
    if (!selectedConversationId || !content) {
      return;
    }

    sendMessage.mutate(
      {
        conversationId: selectedConversationId,
        input: { content },
      },
      {
        onSuccess: () => setDraft(""),
      },
    );
  }

  const conversations = conversationsQuery.data ?? [];
  const messages = conversationQuery.data?.messages ?? [];

  return (
    <div className={styles.page}>
      <section className={styles.intro}>
        <div>
          <p className="eyebrow">Consulta guiada</p>
          <h2>Decide con contexto, no a ciegas.</h2>
          <p>
            El asistente enlaza tus preguntas con cultivos, diagnósticos y recomendaciones. Las
            acciones sensibles siempre requieren tu aprobación.
          </p>
        </div>
        <StatusBadge tone="info">Asistente contextual</StatusBadge>
      </section>

      <section className={styles.workspace} aria-label="Conversaciones con el asistente">
        <aside className={styles.conversationPane}>
          <div className={styles.paneHeader}>
            <div>
              <h2>Conversaciones</h2>
              <p>Organiza las consultas por cultivo.</p>
            </div>
            <span aria-hidden="true">{conversations.length}</span>
          </div>

          <div className={styles.createConversation}>
            <label htmlFor="conversation-title">Nueva conversación</label>
            <input
              id="conversation-title"
              value={newConversationTitle}
              onChange={(event) => setNewConversationTitle(event.target.value)}
              placeholder="Ej. Seguimiento de humedad"
              maxLength={90}
            />
            <label className={styles.srOnly} htmlFor="conversation-crop">
              Cultivo relacionado
            </label>
            <select
              id="conversation-crop"
              value={newConversationCropId}
              onChange={(event) => setNewConversationCropId(event.target.value)}
              disabled={cropsQuery.isLoading}
            >
              <option value="">Sin cultivo específico</option>
              {(cropsQuery.data ?? []).map((crop) => (
                <option key={crop.id} value={crop.id}>
                  {crop.cropType} · {crop.variety ?? crop.growthStage ?? "Sin detalle"}
                </option>
              ))}
            </select>
            <button
              className="action-primary"
              type="button"
              onClick={handleCreateConversation}
              disabled={createConversation.isPending}
            >
              {createConversation.isPending ? "Creando…" : "Crear conversación"}
            </button>
            {createConversation.isError ? (
              <p className={styles.formError} role="alert">
                {errorMessage(createConversation.error, "No se pudo crear la conversación.")}
              </p>
            ) : null}
          </div>

          <div className={styles.conversationList}>
            {conversationsQuery.isLoading ? <LoadingState label="Cargando conversaciones…" /> : null}
            {conversationsQuery.isError ? (
              <ErrorState
                description={errorMessage(
                  conversationsQuery.error,
                  "No pudimos consultar tus conversaciones.",
                )}
                retry={
                  <button className="action-secondary" type="button" onClick={() => conversationsQuery.refetch()}>
                    Reintentar
                  </button>
                }
              />
            ) : null}
            {!conversationsQuery.isLoading && !conversationsQuery.isError && !conversations.length ? (
              <EmptyState
                title="Aún no hay conversaciones"
                description="Crea una consulta para conservar el contexto de una decisión agrícola."
              />
            ) : null}
            {!conversationsQuery.isLoading && !conversationsQuery.isError && conversations.length ? (
              <ul>
                {conversations.map((conversation) => {
                  const isSelected = conversation.id === selectedConversationId;

                  return (
                    <li key={conversation.id}>
                      <button
                        className={`${styles.conversationItem} ${isSelected ? styles.selected : ""}`.trim()}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => setSelectedConversationId(conversation.id)}
                      >
                        <strong>{conversation.title || "Consulta agrícola"}</strong>
                        <span>{formatDate(conversation.updatedAt)}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : null}
          </div>
        </aside>

        <div className={styles.chatPane}>
          {!selectedConversationId ? (
            <EmptyState
              title="Elige o crea una conversación"
              description="Podrás preguntar por el estado de un cultivo y recibir orientación explicable."
            />
          ) : null}
          {selectedConversationId && conversationQuery.isLoading ? (
            <LoadingState label="Cargando el contexto de la conversación…" />
          ) : null}
          {selectedConversationId && conversationQuery.isError ? (
            <ErrorState
              description={errorMessage(
                conversationQuery.error,
                "No pudimos abrir esta conversación.",
              )}
              retry={
                <button className="action-secondary" type="button" onClick={() => conversationQuery.refetch()}>
                  Reintentar
                </button>
              }
            />
          ) : null}
          {selectedConversationId && !conversationQuery.isLoading && !conversationQuery.isError ? (
            <>
              <header className={styles.chatHeader}>
                <div>
                  <p>Contexto de decisión</p>
                  <h2>{conversationQuery.data?.title || "Consulta agrícola"}</h2>
                </div>
                {conversationQuery.data?.cropId ? <StatusBadge tone="neutral">Cultivo vinculado</StatusBadge> : null}
              </header>

              <div className={styles.messages} aria-live="polite">
                {!messages.length ? (
                  <EmptyState
                    title="Comienza la consulta"
                    description="Describe lo que observas en campo; el asistente te pedirá evidencia antes de recomendar una acción."
                  />
                ) : (
                  messages.map((message) => (
                    <article
                      key={message.id}
                      className={`${styles.message} ${
                        message.role === "USER" ? styles.userMessage : styles.assistantMessage
                      }`.trim()}
                    >
                      <div className={styles.messageMeta}>
                        <strong>{messageLabel(message)}</strong>
                        <time dateTime={message.createdAt}>{formatDate(message.createdAt)}</time>
                      </div>
                      <p>{message.content}</p>
                      {message.references?.length ? (
                        <ul className={styles.references} aria-label="Referencias del mensaje">
                          {message.references.map((reference) => (
                            <li key={`${reference.type}-${reference.id ?? reference.label}`}>
                              <span>{reference.type}</span>
                              {reference.label}
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </article>
                  ))
                )}
              </div>

              <form className={styles.composer} onSubmit={handleSendMessage}>
                <label className={styles.srOnly} htmlFor="assistant-message">
                  Escribe tu pregunta
                </label>
                <textarea
                  id="assistant-message"
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder="Describe lo que observas o pregunta por una recomendación…"
                  rows={3}
                  maxLength={1200}
                  disabled={sendMessage.isPending}
                />
                <div className={styles.composerFooter}>
                  <p>El asistente no ejecuta acciones en campo sin tu confirmación.</p>
                  <button
                    className="action-primary"
                    type="submit"
                    disabled={!draft.trim() || sendMessage.isPending}
                  >
                    {sendMessage.isPending ? "Enviando…" : "Enviar mensaje"}
                  </button>
                </div>
                {sendMessage.isError ? (
                  <p className={styles.formError} role="alert">
                    {errorMessage(sendMessage.error, "No se pudo enviar el mensaje.")}
                  </p>
                ) : null}
              </form>
            </>
          ) : null}
        </div>
      </section>
    </div>
  );
}
