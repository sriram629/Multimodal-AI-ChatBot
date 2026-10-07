import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus, MessageSquare, PanelLeftClose, PanelLeftOpen, Pencil, Loader2, Trash2, MoreHorizontal } from "lucide-react";
import { DropdownMenu } from "radix-ui";
import { cn } from "@/lib/utils";
import logo from "@/assets/transparent-logo.png";
import { api } from "@/lib/api";
import SessionRename from "./SessionRename";
import SessionDelete from "./SessionDelete";

export interface Session { session_id: string; title: string; updated_at: string; title_is_custom?: boolean; }
interface Props { isOpen: boolean; onToggle: () => void; currentChatId?: string; isMobile: boolean; onNavigate: () => void; }
// Server timestamps are UTC; older records omit the timezone suffix.
function sessionDate(value: string) {
  return new Date(/(?:Z|[+-]\d{2}:\d{2})$/i.test(value) ? value : value + "Z");
}
function dateGroup(value: string) {
  const date = sessionDate(value);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const week = new Date(today);
  week.setDate(today.getDate() - 7);
  if (date >= today) return "Today";
  if (date >= yesterday) return "Yesterday";
  if (date >= week) return "Previous 7 days";
  return "Earlier";
}
const ChatSidebar = ({ isOpen, onToggle, currentChatId, isMobile, onNavigate }: Props) => {
  const panel = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!isMobile || !isOpen) return;
    const previous = document.activeElement as HTMLElement;
    panel.current?.querySelector<HTMLButtonElement>('button')?.focus();
    return () => { requestAnimationFrame(() => {
      const trigger = document.getElementById('open-conversations');
      if (trigger) trigger.focus(); else if (previous?.isConnected) previous.focus();
    }); };
  }, [isMobile, isOpen]);
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [renaming, setRenaming] = useState<Session | null>(null);
  const [deleting, setDeleting] = useState<Session | null>(null);
  const fetchVersion = useRef(0);
  const fetchSessions = useCallback(async () => {
    const version = ++fetchVersion.current;
    try {
      const res = await api.get<Session[]>("/api/chat/sessions");
      if (version !== fetchVersion.current) return;
      setSessions(res.data.sort((a, b) => sessionDate(b.updated_at).getTime() - sessionDate(a.updated_at).getTime()));
      setLoadError(false);
    }
    catch { if (version === fetchVersion.current) setLoadError(true); }
    finally { if (version === fetchVersion.current) setIsLoading(false); }
  }, []);
  useEffect(() => {
    fetchSessions();
    window.addEventListener("session-updated", fetchSessions);
    window.addEventListener("refresh-sessions", fetchSessions);
    window.addEventListener("focus", fetchSessions);
    return () => {
      // Invalidate outstanding requests; this ref is a counter, not a DOM node.
      // eslint-disable-next-line react-hooks/exhaustive-deps
      fetchVersion.current++;
      window.removeEventListener("session-updated", fetchSessions);
      window.removeEventListener("refresh-sessions", fetchSessions);
      window.removeEventListener("focus", fetchSessions);
    };
  }, [fetchSessions, currentChatId]);
  const hasUntitledSessions = sessions.some(session => !session.title_is_custom &&
    ["", "new chat", "untitled", "title"].includes(session.title.trim().toLowerCase()));
  useEffect(() => {
    if (!hasUntitledSessions) return;
    // A title can finish after its socket closes. Refresh briefly after navigation.
    const timers = [2000, 10000, 20000].map(delay => setTimeout(fetchSessions, delay));
    return () => timers.forEach(clearTimeout);
  }, [hasUntitledSessions, currentChatId, fetchSessions]);
  const groups = sessions.reduce<Record<string, Session[]>>((result, session) => {
    const label = dateGroup(session.updated_at);
    (result[label] ??= []).push(session);
    return result;
  }, {});
  const restoreActionFocus = (session: Session) => {
    requestAnimationFrame(() => document.getElementById("actions-" + session.session_id)?.focus());
  };
  return (
    <aside ref={panel} role={isMobile ? "dialog" : undefined} aria-modal={isMobile && isOpen ? true : undefined} aria-label="Conversations"
      onKeyDown={e => {
        if (!isMobile || !isOpen || document.querySelector('dialog[open], [role=menu]')) return;
        if (e.key === 'Escape') { e.preventDefault(); onToggle(); }
        if (e.key === 'Tab') {
          const buttons = panel.current?.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], [tabindex="0"]');
          if (!buttons?.length) return;
          const first = buttons[0], last = buttons[buttons.length - 1];
          if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
          else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
        }
      }}
      className={cn("h-full shrink-0 flex-col overflow-hidden border-r border-border bg-sidebar-background", isMobile ? (isOpen ? "fixed inset-y-0 left-0 z-50 flex w-80 max-w-[85vw] shadow-2xl" : "hidden") : (isOpen ? "flex w-72" : "flex w-16"))}>
      <div className={cn("flex h-16 shrink-0 items-center border-b border-border px-3", isOpen ? "justify-between" : "justify-center")}>
        {isOpen && <div className="flex items-center gap-2"><img src={logo} alt="" className="h-8 w-8" /><span className="font-semibold">AI Chat</span></div>}
        <Button variant="ghost" size="icon" aria-label={isOpen ? "Collapse sidebar" : "Open sidebar"} onClick={onToggle}>
          {isOpen ? <PanelLeftClose className="h-5 w-5" /> : <PanelLeftOpen className="h-5 w-5" />}
        </Button>
      </div>
      <div className="p-3"><Button onClick={() => { navigate("/chat"); onNavigate(); }} aria-label="New chat" className={cn("gap-2", isOpen ? "w-full justify-start" : "h-10 w-10 p-0")}><Plus className="h-4 w-4" />{isOpen && "New chat"}</Button></div>
      <div className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden">
        {isOpen && <p className="px-5 py-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">Conversations</p>}
        {isLoading && <div role="status" className="flex justify-center p-5"><Loader2 aria-label="Loading conversations" className="h-5 w-5 animate-spin" /></div>}
        {loadError && isOpen && <div className="px-4 py-3 text-sm text-muted-foreground">Couldn’t load conversations.<button onClick={fetchSessions} className="ml-1 text-primary underline">Retry</button></div>}
        {!isLoading && !loadError && sessions.length === 0 && isOpen && <p className="px-5 py-4 text-sm leading-6 text-muted-foreground">Your conversations will appear here after your first message.</p>}
        <div className={cn("space-y-4 pb-4", isOpen ? "px-3" : "px-2")}>
          {Object.entries(groups).map(([label, items]) => (
            <section key={label} aria-label={label}>
              {isOpen && <h2 className="px-2 pb-2 pt-3 text-xs font-medium text-muted-foreground">{label}</h2>}
              <div className="space-y-0.5">
                {items.map(session => (
                  <div key={session.session_id} className={cn("group relative flex min-w-0 items-center rounded-lg", currentChatId === session.session_id ? "bg-sidebar-accent text-foreground" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground")}>
                    <button aria-current={currentChatId === session.session_id ? "page" : undefined} aria-label={session.title || "New chat"} title={session.title} onClick={() => { navigate("/chat/" + session.session_id); onNavigate(); }} className={cn("flex min-w-0 flex-1 items-center gap-2.5 rounded-lg py-3 text-left focus-visible:outline-2 focus-visible:outline-primary", isOpen ? "pl-2.5 pr-11" : "justify-center px-2")}>
                      {!isOpen && <MessageSquare className="h-4 w-4 shrink-0" />}
                      {isOpen && <span className="block min-w-0 truncate text-sm">{session.title || "New chat"}</span>}
                    </button>
                    {isOpen && <DropdownMenu.Root modal={false}>
                      <DropdownMenu.Trigger asChild>
                        <Button id={"actions-" + session.session_id} variant="ghost" size="icon" title="Conversation options" aria-label={"Options for " + session.title} className="conversation-actions absolute right-1 h-9 w-9 shrink-0 data-[state=open]:opacity-100 data-[state=open]:pointer-events-auto">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenu.Trigger>
                      <DropdownMenu.Portal container={panel.current}>
                        <DropdownMenu.Content align="end" sideOffset={4} className="z-[60] min-w-40 rounded-xl border border-border bg-popover p-1 text-popover-foreground shadow-xl"
                          onCloseAutoFocus={e => { if (document.querySelector('dialog[open]')) e.preventDefault(); }}>
                          <DropdownMenu.Item onSelect={() => setRenaming(session)} className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2.5 text-sm outline-none focus:bg-muted"><Pencil className="h-4 w-4" />Rename</DropdownMenu.Item>
                          <DropdownMenu.Item onSelect={() => setDeleting(session)} className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-red-500 outline-none focus:bg-red-500/10"><Trash2 className="h-4 w-4" />Delete</DropdownMenu.Item>
                        </DropdownMenu.Content>
                      </DropdownMenu.Portal>
                    </DropdownMenu.Root>}
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
      {renaming && <SessionRename session={renaming} onClose={() => { restoreActionFocus(renaming); setRenaming(null); }} onSaved={() => { restoreActionFocus(renaming); setRenaming(null); fetchSessions(); }} />}
      {deleting && <SessionDelete session={deleting} onClose={() => { restoreActionFocus(deleting); setDeleting(null); }} onDeleted={() => {
        if (deleting.session_id === currentChatId) navigate("/chat");
        setDeleting(null); fetchSessions();
      }} />}
    </aside>
  );
};
export default ChatSidebar;
