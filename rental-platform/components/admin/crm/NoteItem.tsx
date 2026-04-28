"use client";

import { useState } from "react";
import { formatRelativeTime } from "@/lib/utils/format";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useUpdateCrmNote, useDeleteCrmNote } from "@/lib/hooks/useCrm";
import { Textarea } from "@/components/ui/Textarea";
import type { CrmNoteResponse } from "@/lib/types/crm.types";

interface NoteItemProps {
  note: CrmNoteResponse;
  canEdit: boolean;
  canDelete: boolean;
  isEditing: boolean;
  leadId: string;
  onEditClick: () => void;
  onCancelEdit: () => void;
}

export function NoteItem({
  note,
  canEdit,
  canDelete,
  isEditing,
  leadId,
  onEditClick,
  onCancelEdit,
}: NoteItemProps) {
  const [editText, setEditText] = useState(note.noteText);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const updateMutation = useUpdateCrmNote(leadId);
  const deleteMutation = useDeleteCrmNote(leadId);

  const handleSaveEdit = () => {
    if (!editText.trim()) return;
    updateMutation.mutate(
      { noteId: note.id, data: { noteText: editText.trim() } },
      {
        onSuccess: () => {
          onCancelEdit();
        },
      }
    );
  };

  const handleCancelEdit = () => {
    setEditText(note.noteText);
    onCancelEdit();
  };

  const handleDelete = () => {
    deleteMutation.mutate(note.id, {
      onSuccess: () => {
        setShowDeleteConfirm(false);
      },
    });
  };

  return (
    <div className="rounded-lg border border-neutral-100 bg-neutral-50 p-4">
      {/* Header: author + timestamp + actions */}
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-200 text-xs font-semibold uppercase text-neutral-600">
            A
          </div>
          <span className="text-xs font-medium text-neutral-700">Admin</span>
          <span className="text-[11px] text-neutral-400">
            â€¢ {formatRelativeTime(note.createdAt)}
          </span>
        </div>
        <div className="flex gap-1">
          {canEdit && !isEditing && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onEditClick}
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

      {/* Content */}
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

      {/* Delete Confirmation */}
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
