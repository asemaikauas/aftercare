"use client";

import { useEffect, useMemo, useState } from "react";
import { CareMessage, MESSAGE_EVENT, readMessages, saveSentMessage } from "./message-store";

type MessageFilter = "Sent" | "Inbox" | "All";

function formatMessageTime(value: string) {
  const date = new Date(value);
  const today = new Date();
  const sameDay = date.getFullYear() === today.getFullYear() && date.getMonth() === today.getMonth() && date.getDate() === today.getDate();
  return sameDay
    ? date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
    : date.toLocaleDateString([], { month: "short", day: "numeric" });
}

export default function MessagesCenter({ onNotify }: { onNotify: (message: string) => void }) {
  const [messages, setMessages] = useState<CareMessage[]>([]);
  const [filter, setFilter] = useState<MessageFilter>("Sent");
  const [query, setQuery] = useState("");
  const [selectedPatientId, setSelectedPatientId] = useState(1);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    const sync = () => setMessages(readMessages());
    sync();
    window.addEventListener(MESSAGE_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(MESSAGE_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const sortedMessages = useMemo(() => [...messages].sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime()), [messages]);
  const threadList = useMemo(() => {
    const groups = new Map<number, CareMessage[]>();
    sortedMessages.forEach((message) => {
      const current = groups.get(message.patientId) ?? [];
      current.push(message);
      groups.set(message.patientId, current);
    });
    return [...groups.entries()]
      .map(([patientId, threadMessages]) => {
        const matching = filter === "All" ? threadMessages : threadMessages.filter((message) => filter === "Sent" ? message.direction === "sent" : message.direction === "received");
        const preview = matching[0];
        if (!preview) return null;
        return { patientId, preview, messages: threadMessages, unread: threadMessages.filter((message) => message.direction === "received").length };
      })
      .filter((thread): thread is NonNullable<typeof thread> => Boolean(thread))
      .filter((thread) => `${thread.preview.patientName} ${thread.preview.body}`.toLowerCase().includes(query.toLowerCase()))
      .sort((a, b) => new Date(b.preview.sentAt).getTime() - new Date(a.preview.sentAt).getTime());
  }, [filter, query, sortedMessages]);

  const activePatientId = threadList.some((thread) => thread.patientId === selectedPatientId)
    ? selectedPatientId
    : threadList[0]?.patientId;
  const selectedThread = sortedMessages
    .filter((message) => message.patientId === activePatientId)
    .sort((a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime());
  const selectedPatient = selectedThread[0];
  const sentCount = messages.filter((message) => message.direction === "sent").length;
  const inboxCount = messages.filter((message) => message.direction === "received").length;
  const awaitingReply = new Set(messages.filter((message) => message.direction === "sent" && !messages.some((reply) => reply.patientId === message.patientId && reply.direction === "received" && new Date(reply.sentAt) > new Date(message.sentAt))).map((message) => message.patientId)).size;

  const sendDraft = () => {
    if (!selectedPatient || !draft.trim()) return;
    saveSentMessage({ patientId: selectedPatient.patientId, patientName: selectedPatient.patientName, initials: selectedPatient.initials, body: draft.trim(), category: "Check-in" });
    setMessages(readMessages());
    setDraft("");
    onNotify(`Message sent to ${selectedPatient.patientName}`);
  };

  return (
    <div className="messages-page">
      <header className="messages-header">
        <div><p className="eyebrow">Care coordination</p><h1>Messages</h1><p className="subtitle">Patient conversations and follow-ups.</p></div>
        <div className="messages-header-actions"><span className="sync-pill"><i />Messaging connected <b>Active</b></span><button className="primary-button" type="button" onClick={() => { setFilter("Sent"); setDraft("Hi, this is Maya from Northbridge Clinic. I’m checking in about your recovery today."); }}>＋ New message</button></div>
      </header>

      <section className="message-summary" aria-label="Message summary">
        <div><span className="message-summary-icon sent">↗</span><p><strong>{sentCount}</strong><small>Sent messages</small></p><em>All delivered</em></div>
        <div><span className="message-summary-icon inbox">↙</span><p><strong>{inboxCount}</strong><small>Patient replies</small></p><em>{inboxCount} received</em></div>
        <div><span className="message-summary-icon waiting">◷</span><p><strong>{awaitingReply}</strong><small>Awaiting reply</small></p><em>Follow up</em></div>
        <div className="message-safety"><span>✦</span><p><strong>Staff approved</strong><small>Every outgoing message is reviewed.</small></p></div>
      </section>

      <section className="message-workspace">
        <aside className="thread-panel">
          <div className="thread-panel-top"><div><h2>Conversations</h2><span>{threadList.length} patients</span></div><label className="message-search"><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search messages" aria-label="Search messages" /></label></div>
          <div className="message-filters" role="tablist" aria-label="Message type">
            {(["Sent", "Inbox", "All"] as MessageFilter[]).map((item) => <button key={item} type="button" role="tab" aria-selected={filter === item} className={filter === item ? "active" : ""} onClick={() => setFilter(item)}>{item}<span>{item === "Sent" ? sentCount : item === "Inbox" ? inboxCount : messages.length}</span></button>)}
          </div>
          <div className="thread-list" role="list">
            {threadList.map((thread) => <button type="button" role="listitem" key={thread.patientId} className={activePatientId === thread.patientId ? "active" : ""} onClick={() => setSelectedPatientId(thread.patientId)}><span className="avatar message-avatar">{thread.preview.initials}<i /></span><div><div><strong>{thread.preview.patientName}</strong><time>{formatMessageTime(thread.preview.sentAt)}</time></div><p>{thread.preview.direction === "sent" ? <b> You: </b> : null}{thread.preview.body}</p><small><span className={thread.preview.direction}>{thread.preview.direction === "sent" ? "↗" : "↙"}</span>{thread.preview.category} · {thread.preview.status}</small></div></button>)}
            {!threadList.length && <div className="message-empty"><span>□</span><strong>No messages found</strong><p>Try a different search or filter.</p></div>}
          </div>
        </aside>

        <article className="conversation-panel">
          {selectedPatient ? <>
            <header className="conversation-header"><div className="conversation-person"><span className="avatar large">{selectedPatient.initials}<i /></span><div><h2>{selectedPatient.patientName}</h2><p>Patient #{selectedPatient.patientId} · Post-discharge recovery</p></div></div><div><a href={`/patients/${selectedPatient.patientId}`}>Open profile</a><button aria-label="More conversation options">•••</button></div></header>
            <div className="conversation-notice"><span>i</span>Review clinical instructions before sending.</div>
            <div className="message-history" aria-live="polite">
              <div className="history-day"><span>Recovery conversation</span></div>
              {selectedThread.map((message) => <div key={message.id} className={`message-bubble-row ${message.direction}`}><div className="message-bubble"><div><strong>{message.direction === "sent" ? "You" : message.patientName}</strong><time>{formatMessageTime(message.sentAt)}</time></div><p>{message.body}</p><footer><span>{message.channel}</span><span>{message.status}{message.direction === "sent" ? " ✓" : ""}</span></footer></div></div>)}
            </div>
            <div className="message-composer"><div className="composer-tools"><button type="button" onClick={() => onNotify("Attachment picker opened")}>＋ Attachment</button><button type="button" onClick={() => setDraft(`Hi ${selectedPatient.patientName.split(" ")[0]}, this is Maya from Northbridge Clinic. Please complete today’s recovery check-in when you can.`)}>Use approved template</button><span>SMS + in-app</span></div><div><textarea value={draft} onChange={(event) => setDraft(event.target.value)} placeholder={`Write a message to ${selectedPatient.patientName.split(" ")[0]}…`} aria-label={`Message ${selectedPatient.patientName}`} /><button type="button" disabled={!draft.trim()} onClick={sendDraft}>Send <span>→</span></button></div><small>Clinical instructions require staff review before sending.</small></div>
          </> : <div className="conversation-empty"><span>□</span><h2>Select a conversation</h2><p>Choose a patient thread to review sent messages and replies.</p></div>}
        </article>
      </section>
      <footer className="page-foot"><span>Aftercare · Messages stored on this device</span><span>Not for emergency use</span></footer>
    </div>
  );
}
