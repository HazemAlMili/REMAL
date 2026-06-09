"use client";

import { useState, useMemo } from "react";
import { useLeadNotes, useAddLeadNote } from "@/lib/hooks/useCrm";
import { useAdminUsers } from "@/lib/hooks/useAdminUsers";
import { NoteItem } from "@/components/admin/crm/NoteItem";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { useAuthStore } from "@/lib/stores/auth.store";
import { usePermissions } from "@/lib/hooks/usePermissions";
import { MessageSquare } from "lucide-react";
import { Textarea } from "@/components/ui/Textarea";

interface LeadNotesProps {
  leadId: string;
}

export function LeadNotes({ leadId }: LeadNotesProps) {
  const [newNoteText, setNewNoteText] = useState("");
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);

  const { data: notes, isLoading } = useLeadNotes(leadId);
  const addNoteMutation = useAddLeadNote(leadId);
  const { data: adminUsersData } = useAdminUsers({ includeInactive: true });

  const user = useAuthStore((s) => s.user);
  const { isAdmin } = usePermissions();

  // Build a map from adminUserId → name for note author resolution
  const adminNameMap = useMemo(() => {
    const map = new Map<string, string>();
    (adminUsersData?.items ?? []).forEach((u) => map.set(u.id, u.name));
    return map;
  }, [adminUsersData]);

  const handleAddNote = () => {
    if (!newNoteText.trim()) return;
    addNoteMutation.mutate(
      { noteText: newNoteText.trim() },
      {
        onSuccess: () => {
          setNewNoteText("");
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h3 className="mb-4 border-b border-neutral-100 pb-2 text-sm font-semibold uppercase tracking-wider text-neutral-800">
          Notes
        </h3>
        <Skeleton className="h-16 w-full" rounded="md" />
        <Skeleton className="h-16 w-full" rounded="md" />
        <Skeleton className="h-16 w-full" rounded="md" />
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-lg border border-neutral-100 bg-white p-6 shadow-sm">
      <h3 className="mb-4 border-b border-neutral-100 pb-2 text-sm font-semibold uppercase tracking-wider text-neutral-800">
        Notes
      </h3>

      {/* Notes list */}
      {!notes || notes.length === 0 ? (
        <EmptyState
          icon={<MessageSquare className="h-8 w-8" />}
          title="No internal notes"
          description="Add the first internal note so sales can track the next client follow-up."
          className="min-h-[160px] py-8"
        />
      ) : (
        <div className="space-y-3">
          {notes.map((note) => (
            <NoteItem
              key={note.id}
              note={note}
              authorName={adminNameMap.get(note.createdByAdminUserId)}
              leadId={leadId}
              canEdit={note.createdByAdminUserId === user?.userId || isAdmin}
              canDelete={note.createdByAdminUserId === user?.userId || isAdmin}
              isEditing={editingNoteId === note.id}
              onEditClick={() => setEditingNoteId(note.id)}
              onCancelEdit={() => setEditingNoteId(null)}
            />
          ))}
        </div>
      )}

      {/* Add note */}
      <div className="mt-4 flex items-start gap-2 border-t border-neutral-100 pt-4">
        <Textarea
          value={newNoteText}
          onChange={(e) => setNewNoteText(e.target.value)}
          placeholder="Add an internal lead note"
          className="min-h-[80px] w-full flex-1 resize-none"
          disabled={addNoteMutation.isPending}
        />
        <Button
          onClick={handleAddNote}
          isLoading={addNoteMutation.isPending}
          disabled={!newNoteText.trim() || newNoteText.length > 2000}
          className="shrink-0"
        >
          Add note
        </Button>
      </div>
    </div>
  );
}
