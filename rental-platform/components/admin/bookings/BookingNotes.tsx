"use client";

import { useState } from "react";
import {
  useBookingNotes,
  useAddBookingNote,
  useUpdateBookingNote,
  useDeleteBookingNote,
} from "@/lib/hooks/useBookings";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Textarea } from "@/components/ui/Textarea";
import { formatRelativeTime } from "@/lib/utils/format";
import { useAuthStore } from "@/lib/stores/auth.store";
import { usePermissions } from "@/lib/hooks/usePermissions";
import { MessageSquare } from "lucide-react";
import type { BookingNoteResponse } from "@/lib/types/booking.types";

interface BookingNotesProps {
  bookingId: string;
}

interface NoteRowProps {
  note: BookingNoteResponse;
  bookingId: string;
  canEdit: boolean;
  canDelete: boolean;
}

function NoteRow({ note, bookingId, canEdit, canDelete }: NoteRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(note.noteText);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const updateMutation = useUpdateBookingNote(bookingId);
  const deleteMutation = useDeleteBookingNote(bookingId);

  const handleSaveEdit = () => {
    if (!editText.trim()) return;
    updateMutation.mutate(
      { noteId: note.id, data: { noteText: editText.trim() } },
      { onSuccess: () => setIsEditing(false) }
    );
  };

  const handleCancelEdit = () => {
    setEditText(note.noteText);
    setIsEditing(false);
  };

  const handleDelete = () => {
    deleteMutation.mutate(note.id, {
      onSuccess: () => setShowDeleteConfirm(false),
    });
  };

  return (
    <div className="rounded-lg border border-neutral-100 bg-neutral-50 p-4">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-200 text-xs font-semibold uppercase text-neutral-600">
            A
          </div>
          <span className="text-xs font-medium text-neutral-700">Admin</span>
          <span className="text-[11px] text-neutral-400">
            · {formatRelativeTime(note.createdAt)}
          </span>
        </div>
        <div className="flex gap-1">
          {canEdit && !isEditing && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="h-6 px-2 text-[11px]"
            >
              Edit
            </Button>
          )}
          {canDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDeleteConfirm(true)}
              className="hover:bg-error/10 h-6 px-2 text-[11px] text-error hover:text-error"
            >
              Delete
            </Button>
          )}
        </div>
      </div>

      {isEditing ? (
        <div className="mt-2 space-y-2">
          <Textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className="min-h-[60px] w-full resize-none"
            disabled={updateMutation.isPending}
          />
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancelEdit}
              disabled={updateMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSaveEdit}
              isLoading={updateMutation.isPending}
              disabled={!editText.trim() || editText.length > 2000}
            >
              Save
            </Button>
          </div>
        </div>
      ) : (
        <div className="whitespace-pre-wrap text-sm leading-relaxed text-neutral-800">
          {note.noteText}
        </div>
      )}

      {showDeleteConfirm && (
        <ConfirmDialog
          isOpen={showDeleteConfirm}
          onCancel={() => setShowDeleteConfirm(false)}
          onConfirm={handleDelete}
          title="Delete Note"
          description="Are you sure you want to delete this note? This action cannot be undone."
        />
      )}
    </div>
  );
}

export function BookingNotes({ bookingId }: BookingNotesProps) {
  const [newNoteText, setNewNoteText] = useState("");

  const { data: notes, isLoading } = useBookingNotes(bookingId);
  const addNoteMutation = useAddBookingNote(bookingId);

  const user = useAuthStore((s) => s.user);
  const { isAdmin } = usePermissions();

  const handleAddNote = () => {
    if (!newNoteText.trim()) return;
    addNoteMutation.mutate(
      { noteText: newNoteText.trim() },
      { onSuccess: () => setNewNoteText("") }
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-neutral-700">Notes</h3>
        <Skeleton className="h-16 w-full" rounded="md" />
        <Skeleton className="h-16 w-full" rounded="md" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-neutral-700">Notes</h3>

      {!notes || notes.length === 0 ? (
        <EmptyState
          icon={<MessageSquare className="h-8 w-8" />}
          title="No notes yet"
          description="Add a note to track operational details for this booking"
          className="min-h-[120px] py-6"
        />
      ) : (
        <div className="space-y-3">
          {notes.map((note) => (
            <NoteRow
              key={note.id}
              note={note}
              bookingId={bookingId}
              canEdit={note.createdByAdminUserId === user?.userId || isAdmin}
              canDelete={note.createdByAdminUserId === user?.userId || isAdmin}
            />
          ))}
        </div>
      )}

      <div className="flex gap-2 border-t border-neutral-100 pt-3">
        <Textarea
          value={newNoteText}
          onChange={(e) => setNewNoteText(e.target.value)}
          placeholder="Add a note..."
          className="h-10 min-h-[40px] flex-1 resize-none"
          disabled={addNoteMutation.isPending}
        />
        <Button
          onClick={handleAddNote}
          isLoading={addNoteMutation.isPending}
          disabled={!newNoteText.trim() || newNoteText.length > 2000}
          className="h-10 shrink-0"
        >
          Add
        </Button>
      </div>
    </div>
  );
}
