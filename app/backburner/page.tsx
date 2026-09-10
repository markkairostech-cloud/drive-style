"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowser } from "@/lib/supabase-browser";

type Comment = {
  id: string;
  author: string;
  date: string;
  text: string;
};

type Collaborator = {
  id: string;
  displayName: string;
};

type BacklogItem = {
  databaseId: string;
  id: string;
  backlogNumber: number;
  name: string;
  owners: Collaborator[];
  description: string;
  comments: Comment[];
  status: string;
  dateCaptured: string;
  dateNeeded: string;
  lastUpdated: string;
  completedAt: string | null;
  deletedAt: string | null;
};

type SupabaseCollaborator = {
  id?: string;
  display_name?: string | null;
};

type SupabaseOwnerLink = {
  collaborator?: SupabaseCollaborator | SupabaseCollaborator[] | null;
};

type SupabaseComment = {
  id: string;
  comment: string;
  created_at: string;
  author?: SupabaseCollaborator | SupabaseCollaborator[] | null;
};

type SupabaseBacklogItem = {
  id: string;
  backlog_number: number;
  name: string;
  description: string | null;
  status: string;
  date_captured: string;
  date_needed: string | null;
  completed_at: string | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
  backburner_item_owners?: SupabaseOwnerLink[] | null;
  backburner_comments?: SupabaseComment[] | null;
};

function formatBacklogId(number: number) {
  return `PB-${String(number).padStart(6, "0")}`;
}

function getToday() {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDate(date: string) {
  if (!date) return "";

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));
}

function formatTimestamp(timestamp: string) {
  if (!timestamp) return "";

  const value = new Date(timestamp);

  if (Number.isNaN(value.getTime())) {
    return timestamp;
  }

  const date = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(value);

  const time = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(value);

  return `${date} ${time}`;
}

function getCollaborator(
  collaborator:
    | SupabaseCollaborator
    | SupabaseCollaborator[]
    | null
    | undefined
): Collaborator | null {
  if (!collaborator) return null;

  const value = Array.isArray(collaborator)
    ? collaborator[0]
    : collaborator;

  if (!value?.id || !value.display_name) {
    return null;
  }

  return {
    id: value.id,
    displayName: value.display_name,
  };
}

function ownerSortValue(owner: string) {
  if (owner === "Mark") return 1;
  if (owner === "Ed") return 2;
  if (owner === "Ria") return 3;

  return 99;
}

function sortCollaborators(collaborators: Collaborator[]) {
  return [...collaborators].sort(
    (a, b) =>
      ownerSortValue(a.displayName) -
        ownerSortValue(b.displayName) ||
      a.displayName.localeCompare(b.displayName)
  );
}

function isCompletedOlderThan30Days(item: BacklogItem) {
  if (
    item.status !== "Completed" ||
    !item.completedAt
  ) {
    return false;
  }

  const completedDate = new Date(item.completedAt);
  const now = new Date();

  const thirtyDaysInMilliseconds =
    30 * 24 * 60 * 60 * 1000;

  return (
    now.getTime() - completedDate.getTime() >=
    thirtyDaysInMilliseconds
  );
}

export default function BackburnerPage() {
  const router = useRouter();

  const supabase = useMemo(
    () => getSupabaseBrowser(),
    []
  );

  const [backlogItems, setBacklogItems] =
    useState<BacklogItem[]>([]);

  const [selectedItem, setSelectedItem] =
    useState<BacklogItem | null>(null);

  const [currentCollaborator, setCurrentCollaborator] =
    useState<Collaborator | null>(null);

  const [workspaceCollaborators, setWorkspaceCollaborators] =
    useState<Collaborator[]>([]);

  const [currentProjectId, setCurrentProjectId] =
    useState("");

  const [isNewItem, setIsNewItem] =
    useState(false);

  const [statusFilter, setStatusFilter] =
    useState("All");

  const [ownerFilter, setOwnerFilter] =
    useState("All Owners");

  const [dateFilter, setDateFilter] =
    useState("");

  const [searchTerm, setSearchTerm] =
    useState("");

  const [commentText, setCommentText] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [loadError, setLoadError] =
    useState("");

  const [saving, setSaving] =
    useState(false);

  const [saveMessage, setSaveMessage] =
    useState("");

  const [saveError, setSaveError] =
    useState("");

  const [commentSaving, setCommentSaving] =
    useState(false);

  const [commentError, setCommentError] =
    useState("");

  const [showDeleteConfirm, setShowDeleteConfirm] =
    useState(false);

  const [deleting, setDeleting] =
    useState(false);

  const [showDeletedItems, setShowDeletedItems] =
    useState(false);

  const [restoringId, setRestoringId] =
    useState<string | null>(null);

  const [restoreError, setRestoreError] =
    useState("");

  useEffect(() => {
    async function loadBacklog() {
      setLoading(true);
      setLoadError("");

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/backburner/login");
        return;
      }

      const {
        data: collaboratorRow,
        error: collaboratorError,
      } = await supabase
        .from("backburner_collaborators")
        .select("id, display_name, workspace_id")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .single();

      if (
        collaboratorError ||
        !collaboratorRow
      ) {
        setLoadError(
          "Your login is not linked to an active Backburner collaborator."
        );

        setLoading(false);
        return;
      }

      const loggedInCollaborator: Collaborator = {
        id: collaboratorRow.id,
        displayName: collaboratorRow.display_name,
      };

      setCurrentCollaborator(
        loggedInCollaborator
      );

      const {
        data: projectRow,
        error: projectError,
      } = await supabase
        .from("backburner_projects")
        .select("id")
        .eq(
          "workspace_id",
          collaboratorRow.workspace_id
        )
        .eq("name", "Core Platform")
        .single();

      if (
        projectError ||
        !projectRow
      ) {
        setLoadError(
          "The Core Platform project could not be found."
        );

        setLoading(false);
        return;
      }

      setCurrentProjectId(
        projectRow.id
      );

      const {
        data: collaboratorRows,
        error: collaboratorListError,
      } = await supabase
        .from("backburner_collaborators")
        .select("id, display_name")
        .eq(
          "workspace_id",
          collaboratorRow.workspace_id
        )
        .eq("is_active", true)
        .order("display_name");

      if (collaboratorListError) {
        setLoadError(
          collaboratorListError.message
        );

        setLoading(false);
        return;
      }

      const collaborators =
        sortCollaborators(
          (collaboratorRows ?? []).map(
            (row) => ({
              id: row.id,
              displayName: row.display_name,
            })
          )
        );

      setWorkspaceCollaborators(
        collaborators
      );

      const { data, error } =
        await supabase
          .from("backburner_items")
          .select(`
            id,
            backlog_number,
            name,
            description,
            status,
            date_captured,
            date_needed,
            completed_at,
            deleted_at,
            created_at,
            updated_at,
            backburner_item_owners (
              collaborator:backburner_collaborators (
                id,
                display_name
              )
            ),
            backburner_comments (
              id,
              comment,
              created_at,
              author:backburner_collaborators (
                id,
                display_name
              )
            )
          `)
          .order(
            "backlog_number",
            {
              ascending: true,
            }
          );

      if (error) {
        setLoadError(error.message);
        setLoading(false);
        return;
      }

      const rows =
        (data ??
          []) as unknown as SupabaseBacklogItem[];

      const mappedItems: BacklogItem[] =
        rows.map((row) => {
          const owners =
            sortCollaborators(
              (
                row.backburner_item_owners ??
                []
              )
                .map(
                  (ownerLink) =>
                    getCollaborator(
                      ownerLink.collaborator
                    )
                )
                .filter(
                  (
                    owner
                  ): owner is Collaborator =>
                    Boolean(owner)
                )
            );

          const comments = [
            ...(row.backburner_comments ??
              []),
          ]
            .sort(
              (a, b) =>
                new Date(
                  a.created_at
                ).getTime() -
                new Date(
                  b.created_at
                ).getTime()
            )
            .map((comment) => {
              const author =
                getCollaborator(
                  comment.author
                );

              return {
                id: comment.id,
                author:
                  author?.displayName ??
                  "Unknown collaborator",
                date:
                  formatTimestamp(
                    comment.created_at
                  ),
                text:
                  comment.comment,
              };
            });

          return {
            databaseId: row.id,
            id: formatBacklogId(
              row.backlog_number
            ),
            backlogNumber:
              row.backlog_number,
            name: row.name,
            owners,
            description:
              row.description ?? "",
            comments,
            status: row.status,
            dateCaptured:
              row.date_captured,
            dateNeeded:
              row.date_needed ?? "",
            lastUpdated:
              formatTimestamp(
                row.updated_at
              ),
            completedAt:
              row.completed_at,
            deletedAt:
              row.deleted_at,
          };
        });

      setBacklogItems(
        mappedItems
      );

      const firstVisibleItem =
        mappedItems.find(
          (item) =>
            !item.deletedAt &&
            !isCompletedOlderThan30Days(
              item
            )
        );

      setSelectedItem(
        firstVisibleItem ??
          mappedItems[0] ??
          null
      );

      setLoading(false);
    }

    loadBacklog();
  }, [router, supabase]);

  const activeBacklogItems =
    backlogItems.filter((item) => {
      if (item.deletedAt) {
        return false;
      }

      if (
        isCompletedOlderThan30Days(
          item
        )
      ) {
        return false;
      }

      return true;
    });

  const deletedBacklogItems =
    backlogItems.filter(
      (item) => Boolean(item.deletedAt)
    );

  const filteredBacklogItems =
    activeBacklogItems.filter((item) => {
      const matchesStatus =
        statusFilter === "All" ||
        item.status === statusFilter;

      const matchesOwner =
        ownerFilter === "All Owners" ||
        item.owners.some(
          (owner) =>
            owner.displayName ===
            ownerFilter
        );

      const matchesDate =
        !dateFilter ||
        item.dateNeeded ===
          dateFilter;

      const normalisedSearch =
        searchTerm.trim().toLowerCase();

      const matchesSearch =
        !normalisedSearch ||
        item.id
          .toLowerCase()
          .includes(normalisedSearch) ||
        item.name
          .toLowerCase()
          .includes(normalisedSearch) ||
        item.owners.some((owner) =>
          owner.displayName
            .toLowerCase()
            .includes(normalisedSearch)
        );

      return (
        matchesStatus &&
        matchesOwner &&
        matchesDate &&
        matchesSearch
      );
    });

  const handleClearFilters = () => {
    setStatusFilter("All");
    setOwnerFilter("All Owners");
    setDateFilter("");
    setSearchTerm("");
  };

  const handleSelectItem = (
    item: BacklogItem
  ) => {
    setIsNewItem(false);
    setSaveMessage("");
    setSaveError("");
    setCommentError("");
    setCommentText("");

    setSelectedItem({
      ...item,
      owners: item.owners.map(
        (owner) => ({
          ...owner,
        })
      ),
      comments: item.comments.map(
        (comment) => ({
          ...comment,
        })
      ),
    });
  };

  const handleAddItem = () => {
    if (!currentCollaborator) {
      return;
    }

    setIsNewItem(true);
    setSaveMessage("");
    setSaveError("");
    setCommentError("");
    setCommentText("");

    setSelectedItem({
      databaseId: "",
      id: "New",
      backlogNumber: 0,
      name: "",
      owners: [
        currentCollaborator,
      ],
      description: "",
      comments: [],
      status: "New",
      dateCaptured: getToday(),
      dateNeeded: "",
      lastUpdated: "",
      completedAt: null,
      deletedAt: null,
    });
  };

  const handleToggleOwner = (
    collaborator: Collaborator
  ) => {
    if (!selectedItem) {
      return;
    }

    const alreadySelected =
      selectedItem.owners.some(
        (owner) =>
          owner.id ===
          collaborator.id
      );

    const newOwners =
      alreadySelected
        ? selectedItem.owners.filter(
            (owner) =>
              owner.id !==
              collaborator.id
          )
        : sortCollaborators([
            ...selectedItem.owners,
            collaborator,
          ]);

    setSelectedItem({
      ...selectedItem,
      owners: newOwners,
    });

    setSaveMessage("");
    setSaveError("");
  };

  const handleCancel = () => {
    setCommentText("");
    setSaveMessage("");
    setSaveError("");
    setCommentError("");

    if (isNewItem) {
      const firstVisibleItem =
        activeBacklogItems[0] ?? null;

      setSelectedItem(
        firstVisibleItem
      );

      setIsNewItem(false);
      return;
    }

    if (!selectedItem) {
      return;
    }

    const originalItem =
      backlogItems.find(
        (item) =>
          item.databaseId ===
          selectedItem.databaseId
      );

    if (!originalItem) {
      return;
    }

    setSelectedItem({
      ...originalItem,
      owners:
        originalItem.owners.map(
          (owner) => ({
            ...owner,
          })
        ),
      comments:
        originalItem.comments.map(
          (comment) => ({
            ...comment,
          })
        ),
    });
  };

  const handleSaveChanges =
    async () => {
      if (!selectedItem) {
        return;
      }

      if (!selectedItem.name.trim()) {
        return;
      }

      if (
        selectedItem.owners.length ===
        0
      ) {
        setSaveError(
          "Please select at least one owner."
        );
        return;
      }

      setSaving(true);
      setSaveMessage("");
      setSaveError("");

      if (isNewItem) {
        if (!currentProjectId) {
          setSaveError(
            "The current project could not be identified."
          );

          setSaving(false);
          return;
        }

        const completedAt =
          selectedItem.status ===
          "Completed"
            ? new Date().toISOString()
            : null;

        const {
          data: newItemRow,
          error: newItemError,
        } = await supabase
          .from("backburner_items")
          .insert({
            project_id:
              currentProjectId,
            name:
              selectedItem.name.trim(),
            description:
              selectedItem.description.trim()
                ? selectedItem.description.trim()
                : null,
            status:
              selectedItem.status,
            date_captured:
              selectedItem.dateCaptured,
            date_needed:
              selectedItem.dateNeeded ||
              null,
            completed_at:
              completedAt,
          })
          .select(`
            id,
            backlog_number,
            updated_at,
            completed_at
          `)
          .single();

        if (
          newItemError ||
          !newItemRow
        ) {
          setSaveError(
            newItemError?.message ??
              "The backlog item could not be created."
          );

          setSaving(false);
          return;
        }

        const {
          error: ownerInsertError,
        } = await supabase
          .from(
            "backburner_item_owners"
          )
          .insert(
            selectedItem.owners.map(
              (owner) => ({
                backlog_item_id:
                  newItemRow.id,
                collaborator_id:
                  owner.id,
              })
            )
          );

        if (ownerInsertError) {
          setSaveError(
            `Item created, but owner assignment failed: ${ownerInsertError.message}`
          );

          setSaving(false);
          return;
        }

        const createdItem: BacklogItem =
          {
            ...selectedItem,
            databaseId:
              newItemRow.id,
            backlogNumber:
              newItemRow.backlog_number,
            id: formatBacklogId(
              newItemRow.backlog_number
            ),
            name:
              selectedItem.name.trim(),
            description:
              selectedItem.description.trim(),
            owners:
              sortCollaborators(
                selectedItem.owners
              ),
            completedAt:
              newItemRow.completed_at,
            lastUpdated:
              formatTimestamp(
                newItemRow.updated_at
              ),
          };

        setBacklogItems(
          (currentItems) => [
            ...currentItems,
            createdItem,
          ]
        );

        setSelectedItem(
          createdItem
        );

        setIsNewItem(false);

        setSaveMessage(
          `${createdItem.id} created successfully.`
        );

        setSaving(false);
        return;
      }

      const existingItem =
        backlogItems.find(
          (item) =>
            item.databaseId ===
            selectedItem.databaseId
        );

      if (!existingItem) {
        setSaveError(
          "The selected backlog item could not be found."
        );

        setSaving(false);
        return;
      }

      let completedAt =
        selectedItem.completedAt;

      if (
        selectedItem.status ===
          "Completed" &&
        existingItem.status !==
          "Completed"
      ) {
        completedAt =
          new Date().toISOString();
      }

      if (
        selectedItem.status !==
        "Completed"
      ) {
        completedAt = null;
      }

      const existingOwnerIds =
        new Set(
          existingItem.owners.map(
            (owner) => owner.id
          )
        );

      const selectedOwnerIds =
        new Set(
          selectedItem.owners.map(
            (owner) => owner.id
          )
        );

      const ownersToRemove =
        existingItem.owners
          .filter(
            (owner) =>
              !selectedOwnerIds.has(
                owner.id
              )
          )
          .map(
            (owner) => owner.id
          );

      const ownersToAdd =
        selectedItem.owners.filter(
          (owner) =>
            !existingOwnerIds.has(
              owner.id
            )
        );

      const {
        data: itemData,
        error: itemError,
      } = await supabase
        .from("backburner_items")
        .update({
          name:
            selectedItem.name.trim(),
          description:
            selectedItem.description.trim()
              ? selectedItem.description.trim()
              : null,
          status:
            selectedItem.status,
          date_needed:
            selectedItem.dateNeeded ||
            null,
          completed_at:
            completedAt,
        })
        .eq(
          "id",
          selectedItem.databaseId
        )
        .select(
          "updated_at, completed_at"
        )
        .single();

      if (itemError) {
        setSaveError(
          itemError.message
        );

        setSaving(false);
        return;
      }

      if (
        ownersToRemove.length > 0
      ) {
        const {
          error: removeOwnerError,
        } = await supabase
          .from(
            "backburner_item_owners"
          )
          .delete()
          .eq(
            "backlog_item_id",
            selectedItem.databaseId
          )
          .in(
            "collaborator_id",
            ownersToRemove
          );

        if (removeOwnerError) {
          setSaveError(
            `Item saved, but owner removal failed: ${removeOwnerError.message}`
          );

          setSaving(false);
          return;
        }
      }

      if (
        ownersToAdd.length > 0
      ) {
        const {
          error: addOwnerError,
        } = await supabase
          .from(
            "backburner_item_owners"
          )
          .insert(
            ownersToAdd.map(
              (owner) => ({
                backlog_item_id:
                  selectedItem.databaseId,
                collaborator_id:
                  owner.id,
              })
            )
          );

        if (addOwnerError) {
          setSaveError(
            `Item saved, but owner addition failed: ${addOwnerError.message}`
          );

          setSaving(false);
          return;
        }
      }

      const updatedItem: BacklogItem =
        {
          ...selectedItem,
          name:
            selectedItem.name.trim(),
          description:
            selectedItem.description.trim(),
          owners:
            sortCollaborators(
              selectedItem.owners
            ),
          completedAt:
            itemData.completed_at,
          lastUpdated:
            formatTimestamp(
              itemData.updated_at
            ),
        };

      setBacklogItems(
        (currentItems) =>
          currentItems.map(
            (item) =>
              item.databaseId ===
              updatedItem.databaseId
                ? updatedItem
                : item
          )
      );

      setSelectedItem(
        updatedItem
      );

      setSaveMessage(
        "Changes saved to Supabase."
      );

      setSaving(false);
    };

  const handleAddComment =
    async () => {
      if (
        !selectedItem ||
        !currentCollaborator ||
        isNewItem
      ) {
        return;
      }

      const trimmedComment =
        commentText.trim();

      if (!trimmedComment) {
        return;
      }

      setCommentSaving(true);
      setCommentError("");

      const { data, error } =
        await supabase
          .from(
            "backburner_comments"
          )
          .insert({
            backlog_item_id:
              selectedItem.databaseId,
            author_id:
              currentCollaborator.id,
            comment:
              trimmedComment,
          })
          .select(
            "id, comment, created_at"
          )
          .single();

      if (error) {
        setCommentError(
          error.message
        );

        setCommentSaving(false);
        return;
      }

      const newComment: Comment =
        {
          id: data.id,
          author:
            currentCollaborator.displayName,
          date:
            formatTimestamp(
              data.created_at
            ),
          text:
            data.comment,
        };

      const updatedItem: BacklogItem =
        {
          ...selectedItem,
          comments: [
            ...selectedItem.comments,
            newComment,
          ],
          lastUpdated:
            formatTimestamp(
              data.created_at
            ),
        };

      setSelectedItem(
        updatedItem
      );

      setBacklogItems(
        (currentItems) =>
          currentItems.map(
            (item) =>
              item.databaseId ===
              updatedItem.databaseId
                ? updatedItem
                : item
          )
      );

      setCommentText("");
      setCommentSaving(false);
    };

  const handleDelete = () => {
    if (
      !selectedItem ||
      isNewItem
    ) {
      return;
    }

    setShowDeleteConfirm(true);
  };

  const confirmDelete =
    async () => {
      if (!selectedItem) {
        return;
      }

      setDeleting(true);
      setSaveError("");

      const deletedAt =
        new Date().toISOString();

      const {
        data,
        error,
      } = await supabase
        .from("backburner_items")
        .update({
          deleted_at: deletedAt,
        })
        .eq(
          "id",
          selectedItem.databaseId
        )
        .select(
          "updated_at, deleted_at"
        )
        .single();

      if (error) {
        setSaveError(
          error.message
        );

        setDeleting(false);
        setShowDeleteConfirm(false);
        return;
      }

      const deletedItem: BacklogItem =
        {
          ...selectedItem,
          deletedAt:
            data.deleted_at,
          lastUpdated:
            formatTimestamp(
              data.updated_at
            ),
        };

      const updatedItems =
        backlogItems.map(
          (item) =>
            item.databaseId ===
            deletedItem.databaseId
              ? deletedItem
              : item
        );

      setBacklogItems(
        updatedItems
      );

      const nextVisibleItem =
        updatedItems.find(
          (item) =>
            !item.deletedAt &&
            !isCompletedOlderThan30Days(
              item
            )
        );

      setSelectedItem(
        nextVisibleItem ?? null
      );

      setShowDeleteConfirm(false);
      setDeleting(false);
      setSaveMessage("");
      setCommentText("");
    };

  const handleRestore =
    async (item: BacklogItem) => {
      setRestoringId(
        item.databaseId
      );

      setRestoreError("");

      const {
        data,
        error,
      } = await supabase
        .from("backburner_items")
        .update({
          deleted_at: null,
        })
        .eq(
          "id",
          item.databaseId
        )
        .select(
          "updated_at, deleted_at"
        )
        .single();

      if (error) {
        setRestoreError(
          error.message
        );

        setRestoringId(null);
        return;
      }

      const restoredItem: BacklogItem =
        {
          ...item,
          deletedAt:
            data.deleted_at,
          lastUpdated:
            formatTimestamp(
              data.updated_at
            ),
        };

      setBacklogItems(
        (currentItems) =>
          currentItems.map(
            (currentItem) =>
              currentItem.databaseId ===
              restoredItem.databaseId
                ? restoredItem
                : currentItem
          )
      );

      setSelectedItem({
        ...restoredItem,
        owners:
          restoredItem.owners.map(
            (owner) => ({
              ...owner,
            })
          ),
        comments:
          restoredItem.comments.map(
            (comment) => ({
              ...comment,
            })
          ),
      });

      setIsNewItem(false);
      setRestoringId(null);

      /*
       * If there are no more deleted items,
       * close the modal automatically.
       */
      const remainingDeleted =
        deletedBacklogItems.filter(
          (deletedItem) =>
            deletedItem.databaseId !==
            item.databaseId
        );

      if (
        remainingDeleted.length ===
        0
      ) {
        setShowDeletedItems(false);
      }
    };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {/* HEADER */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center gap-6 px-6 py-2">
          <div className="flex-shrink-0">
            <Image
              src="/backburner-logo.png"
              alt="Project Backburner"
              width={180}
              height={100}
              priority
              className="h-auto w-[160px]"
            />
          </div>

          <div className="flex flex-1 items-center justify-center gap-4">
            <div className="flex items-center gap-3 rounded-lg bg-sky-800 px-4 py-2 text-white">
              <span className="font-semibold">
                Workspace
              </span>

              <select className="rounded-md border border-slate-200 bg-white px-4 py-2 text-slate-800 outline-none">
                <option>
                  Client Product Development
                </option>
              </select>
            </div>

            <div className="flex items-center gap-3 rounded-lg bg-sky-800 px-4 py-2 text-white">
              <span className="font-semibold">
                Project
              </span>

              <select className="rounded-md border border-slate-200 bg-white px-4 py-2 text-slate-800 outline-none">
                <option>
                  Core Platform
                </option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-700 text-sm font-semibold text-white">
              MK
            </div>

            <div className="leading-tight">
              <div className="font-semibold">
                {currentCollaborator?.displayName ??
                  "Mark"}
              </div>

              <div className="text-sm text-slate-500">
                Collaborator
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <section className="mx-auto max-w-7xl px-6 py-5">
        <div className="mb-4 flex items-center justify-between rounded-lg border border-green-100 bg-green-50 px-4 py-3">
          <div>
            <div className="text-sm font-semibold text-green-900">
              Supabase connected
            </div>

            <div className="mt-0.5 text-xs text-green-700">
              Backburner is fully database-backed with restore-safe soft delete.
            </div>
          </div>

          {!loading &&
            !loadError && (
              <div className="flex items-center gap-2">
                <div className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-green-700 shadow-sm">
                  {backlogItems.length} database items
                </div>

                <div className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm">
                  {deletedBacklogItems.length} deleted
                </div>
              </div>
            )}
        </div>

        {loadError && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
            <div className="font-semibold text-red-800">
              Backburner could not load from Supabase
            </div>

            <div className="mt-1 text-sm text-red-700">
              {loadError}
            </div>
          </div>
        )}

        {/* BACKLOG */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 px-5 py-4">
            <div>
              <h1 className="text-2xl font-bold">
                Shared Backlog
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Collaborate, prioritise and deliver together.
              </p>
            </div>

            <div className="flex flex-wrap items-end gap-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">
                  Status
                </label>

                <select
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(
                      event.target.value
                    )
                  }
                  className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none"
                >
                  <option>All</option>
                  <option>New</option>
                  <option>In Progress</option>
                  <option>Completed</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">
                  Owner
                </label>

                <select
                  value={ownerFilter}
                  onChange={(event) =>
                    setOwnerFilter(
                      event.target.value
                    )
                  }
                  className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none"
                >
                  <option>All Owners</option>

                  {workspaceCollaborators.map(
                    (owner) => (
                      <option
                        key={owner.id}
                        value={owner.displayName}
                      >
                        {owner.displayName}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">
                  Date Needed By
                </label>

                <input
                  type="date"
                  value={dateFilter}
                  onChange={(event) =>
                    setDateFilter(
                      event.target.value
                    )
                  }
                  className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">
                  Search
                </label>

                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) =>
                    setSearchTerm(
                      event.target.value
                    )
                  }
                  placeholder="Search backlog items..."
                  className="w-48 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none"
                />
              </div>

              <button
                onClick={
                  handleClearFilters
                }
                className="rounded-md border border-slate-300 bg-white px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50"
              >
                Clear Filters
              </button>

              <button
                type="button"
                onClick={() => {
                  setRestoreError("");
                  setShowDeletedItems(
                    true
                  );
                }}
                className="rounded-md border border-slate-300 bg-white px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50"
              >
                Deleted Items (
                {
                  deletedBacklogItems.length
                }
                )
              </button>

              <button
                onClick={handleAddItem}
                className="rounded-md bg-blue-600 px-5 py-2 font-semibold text-white transition hover:bg-blue-700"
              >
                + Add Item
              </button>
            </div>
          </div>

          <div className="max-h-[455px] overflow-auto">
            <table className="w-full border-collapse text-left">
              <thead className="sticky top-0 z-10 bg-slate-100 text-sm text-slate-700 shadow-sm">
                <tr>
                  <th className="px-4 py-3 font-semibold">
                    ID
                  </th>
                  <th className="px-4 py-3 font-semibold">
                    Name
                  </th>
                  <th className="px-4 py-3 font-semibold">
                    Owner
                  </th>
                  <th className="px-4 py-3 font-semibold">
                    Status
                  </th>
                  <th className="px-4 py-3 font-semibold">
                    Date Captured
                  </th>
                  <th className="px-4 py-3 font-semibold">
                    Date Needed By
                  </th>
                  <th className="px-4 py-3 font-semibold">
                    Last Updated
                  </th>
                </tr>
              </thead>

              <tbody className="text-sm">
                {loading ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-12 text-center text-sm text-slate-500"
                    >
                      Loading Backburner from Supabase...
                    </td>
                  </tr>
                ) : filteredBacklogItems.length ===
                  0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-10 text-center text-sm text-slate-500"
                    >
                      No backlog items match the current filters.
                    </td>
                  </tr>
                ) : (
                  filteredBacklogItems.map(
                    (item) => (
                      <tr
                        key={
                          item.databaseId
                        }
                        onClick={() =>
                          handleSelectItem(
                            item
                          )
                        }
                        className={`cursor-pointer border-t border-slate-200 transition ${
                          selectedItem?.databaseId ===
                            item.databaseId &&
                          !isNewItem
                            ? "bg-blue-50"
                            : "hover:bg-slate-50"
                        }`}
                      >
                        <td className="px-4 py-3 font-medium text-blue-700">
                          {item.id}
                        </td>

                        <td className="px-4 py-3 font-medium">
                          {item.name}
                        </td>

                        <td className="px-4 py-3 text-slate-600">
                          {item.owners.length >
                          0
                            ? item.owners
                                .map(
                                  (owner) =>
                                    owner.displayName
                                )
                                .join(
                                  " + "
                                )
                            : "Unassigned"}
                        </td>

                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                              item.status ===
                              "Completed"
                                ? "bg-green-100 text-green-700"
                                : item.status ===
                                  "In Progress"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {
                              item.status
                            }
                          </span>
                        </td>

                        <td className="px-4 py-3 text-slate-600">
                          {formatDate(
                            item.dateCaptured
                          )}
                        </td>

                        <td className="px-4 py-3 text-slate-600">
                          {formatDate(
                            item.dateNeeded
                          )}
                        </td>

                        <td className="px-4 py-3 text-slate-600">
                          {
                            item.lastUpdated
                          }
                        </td>
                      </tr>
                    )
                  )
                )}
              </tbody>
            </table>
          </div>

          <div className="border-t border-slate-200 px-4 py-2 text-right text-xs text-slate-500">
            Showing{" "}
            {
              filteredBacklogItems.length
            }{" "}
            of{" "}
            {
              activeBacklogItems.length
            }{" "}
            active items
          </div>
        </div>

        {/* EDITOR */}
        <div className="mt-5 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <div>
              <h2 className="text-xl font-bold">
                {isNewItem
                  ? "Add Backlog Item"
                  : "Backlog Item Details"}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {isNewItem
                  ? "Create a new shared backlog item."
                  : "View and update the selected database-backed backlog item."}
              </p>
            </div>

            {selectedItem && (
              <div className="text-right">
                <div className="font-semibold">
                  {isNewItem
                    ? "New item"
                    : selectedItem.id}
                </div>

                {!isNewItem && (
                  <div className="text-xs text-slate-500">
                    Last updated:{" "}
                    {
                      selectedItem.lastUpdated
                    }
                  </div>
                )}
              </div>
            )}
          </div>

          {!selectedItem ? (
            <div className="p-10 text-center text-sm text-slate-500">
              Select a backlog item to view its details.
            </div>
          ) : (
            <>
              <div className="grid gap-5 p-5 lg:grid-cols-2">
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm font-medium">
                        Unique Identifier
                      </label>

                      <input
                        type="text"
                        value={
                          isNewItem
                            ? "Generated on save"
                            : selectedItem.id
                        }
                        readOnly
                        className="w-full rounded-md border border-slate-300 bg-slate-100 px-3 py-2 text-slate-500"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium">
                        Owners
                      </label>

                      <div className="flex min-h-[42px] flex-wrap items-center gap-3 rounded-md border border-slate-300 bg-white px-3 py-2">
                        {workspaceCollaborators.map(
                          (
                            collaborator
                          ) => {
                            const checked =
                              selectedItem.owners.some(
                                (
                                  owner
                                ) =>
                                  owner.id ===
                                  collaborator.id
                              );

                            return (
                              <label
                                key={
                                  collaborator.id
                                }
                                className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 text-sm hover:bg-slate-50"
                              >
                                <input
                                  type="checkbox"
                                  checked={
                                    checked
                                  }
                                  onChange={() =>
                                    handleToggleOwner(
                                      collaborator
                                    )
                                  }
                                  className="h-4 w-4 cursor-pointer"
                                />

                                <span>
                                  {
                                    collaborator.displayName
                                  }
                                </span>
                              </label>
                            );
                          }
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Name
                    </label>

                    <input
                      type="text"
                      value={
                        selectedItem.name
                      }
                      onChange={(event) =>
                        setSelectedItem({
                          ...selectedItem,
                          name:
                            event.target
                              .value,
                        })
                      }
                      placeholder="Enter backlog item name"
                      className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 caret-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Description
                    </label>

                    <textarea
                      value={
                        selectedItem.description
                      }
                      onChange={(event) =>
                        setSelectedItem({
                          ...selectedItem,
                          description:
                            event.target
                              .value,
                        })
                      }
                      rows={5}
                      placeholder="Add a description..."
                      className="w-full resize-none rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 caret-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div>
                      <label className="mb-1 block text-sm font-medium">
                        Status
                      </label>

                      <select
                        value={
                          selectedItem.status
                        }
                        onChange={(event) =>
                          setSelectedItem({
                            ...selectedItem,
                            status:
                              event.target
                                .value,
                          })
                        }
                        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 outline-none"
                      >
                        <option>
                          New
                        </option>

                        <option>
                          In Progress
                        </option>

                        <option>
                          Completed
                        </option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium">
                        Date Captured
                      </label>

                      <input
                        type="date"
                        value={
                          selectedItem.dateCaptured
                        }
                        readOnly
                        className="w-full rounded-md border border-slate-300 bg-slate-100 px-3 py-2 text-slate-500"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium">
                        Date Needed By
                      </label>

                      <input
                        type="date"
                        value={
                          selectedItem.dateNeeded
                        }
                        onChange={(event) =>
                          setSelectedItem({
                            ...selectedItem,
                            dateNeeded:
                              event.target
                                .value,
                          })
                        }
                        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Comments
                    </label>

                    <div className="min-h-[160px] max-h-[220px] overflow-y-auto rounded-md border border-slate-300 bg-slate-50 p-3">
                      {selectedItem.comments.length ===
                      0 ? (
                        <p className="text-sm text-slate-400">
                          No comments yet.
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {selectedItem.comments.map(
                            (
                              comment
                            ) => (
                              <div
                                key={
                                  comment.id
                                }
                                className="border-b border-slate-200 pb-3 last:border-b-0 last:pb-0"
                              >
                                <div className="flex gap-2 text-sm">
                                  <span className="font-semibold">
                                    {
                                      comment.author
                                    }
                                  </span>

                                  <span className="text-slate-400">
                                    {
                                      comment.date
                                    }
                                  </span>
                                </div>

                                <p className="mt-1 text-sm text-slate-700">
                                  {
                                    comment.text
                                  }
                                </p>
                              </div>
                            )
                          )}
                        </div>
                      )}
                    </div>

                    <div className="mt-2 flex gap-2">
                      <input
                        type="text"
                        value={
                          commentText
                        }
                        disabled={
                          isNewItem
                        }
                        onChange={(event) =>
                          setCommentText(
                            event.target
                              .value
                          )
                        }
                        onKeyDown={(
                          event
                        ) => {
                          if (
                            event.key ===
                              "Enter" &&
                            !commentSaving &&
                            commentText.trim() &&
                            !isNewItem
                          ) {
                            event.preventDefault();

                            handleAddComment();
                          }
                        }}
                        placeholder={
                          isNewItem
                            ? "Create the item before adding comments"
                            : "Add a comment..."
                        }
                        className="flex-1 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 caret-slate-900 outline-none disabled:cursor-not-allowed disabled:bg-slate-100"
                      />

                      <button
                        type="button"
                        onClick={
                          handleAddComment
                        }
                        disabled={
                          isNewItem ||
                          commentSaving ||
                          !commentText.trim()
                        }
                        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
                      >
                        {commentSaving
                          ? "Adding..."
                          : "Add Comment"}
                      </button>
                    </div>

                    {commentError && (
                      <div className="mt-2 text-sm font-medium text-red-600">
                        {
                          commentError
                        }
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-200 px-5 py-4">
                <div>
                  {!isNewItem && (
                    <button
                      type="button"
                      onClick={
                        handleDelete
                      }
                      className="rounded-md border border-red-300 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                    >
                      Delete (Hide from view)
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {saveMessage && (
                    <span className="text-sm font-medium text-green-700">
                      {
                        saveMessage
                      }
                    </span>
                  )}

                  {saveError && (
                    <span className="text-sm font-medium text-red-600">
                      {saveError}
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={
                      handleCancel
                    }
                    disabled={
                      saving
                    }
                    className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={
                      handleSaveChanges
                    }
                    disabled={
                      saving ||
                      !selectedItem.name.trim()
                    }
                    className="rounded-md bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
                  >
                    {saving
                      ? "Saving..."
                      : isNewItem
                      ? "Create Item"
                      : "Save Changes"}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      {/* DELETE CONFIRMATION */}
      {showDeleteConfirm &&
        selectedItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4">
            <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
              <div className="border-b border-slate-200 px-6 py-5">
                <h3 className="text-xl font-bold text-slate-900">
                  Hide backlog item?
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  You are about to
                  hide{" "}
                  <span className="font-semibold text-slate-800">
                    {selectedItem.id}
                  </span>{" "}
                  from the active
                  backlog.
                </p>
              </div>

              <div className="px-6 py-5">
                <div className="rounded-lg border border-blue-100 bg-blue-50 p-4 text-sm leading-6 text-blue-900">
                  This item will not be permanently deleted. It will remain in
                  Supabase and can be restored later.
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
                <button
                  type="button"
                  disabled={
                    deleting
                  }
                  onClick={() =>
                    setShowDeleteConfirm(
                      false
                    )
                  }
                  className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={
                    deleting
                  }
                  onClick={
                    confirmDelete
                  }
                  className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
                >
                  {deleting
                    ? "Hiding..."
                    : "Hide Item"}
                </button>
              </div>
            </div>
          </div>
        )}

      {/* DELETED ITEMS MODAL */}
      {showDeletedItems && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4">
          <div className="w-full max-w-3xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  Deleted Items
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Soft-deleted items remain safely stored in Supabase.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowDeletedItems(
                    false
                  )
                }
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>
            </div>

            <div className="max-h-[440px] overflow-y-auto">
              {deletedBacklogItems.length ===
              0 ? (
                <div className="px-6 py-12 text-center text-sm text-slate-500">
                  There are currently no deleted backlog items.
                </div>
              ) : (
                <table className="w-full border-collapse text-left">
                  <thead className="sticky top-0 bg-slate-100 text-sm text-slate-700">
                    <tr>
                      <th className="px-5 py-3 font-semibold">
                        ID
                      </th>

                      <th className="px-5 py-3 font-semibold">
                        Name
                      </th>

                      <th className="px-5 py-3 font-semibold">
                        Owners
                      </th>

                      <th className="px-5 py-3 font-semibold">
                        Deleted
                      </th>

                      <th className="px-5 py-3 text-right font-semibold">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody className="text-sm">
                    {deletedBacklogItems.map(
                      (item) => (
                        <tr
                          key={
                            item.databaseId
                          }
                          className="border-t border-slate-200"
                        >
                          <td className="px-5 py-4 font-semibold text-blue-700">
                            {item.id}
                          </td>

                          <td className="px-5 py-4">
                            {item.name}
                          </td>

                          <td className="px-5 py-4 text-slate-600">
                            {item.owners.length >
                            0
                              ? item.owners
                                  .map(
                                    (
                                      owner
                                    ) =>
                                      owner.displayName
                                  )
                                  .join(
                                    " + "
                                  )
                              : "Unassigned"}
                          </td>

                          <td className="px-5 py-4 text-slate-600">
                            {item.deletedAt
                              ? formatTimestamp(
                                  item.deletedAt
                                )
                              : ""}
                          </td>

                          <td className="px-5 py-4 text-right">
                            <button
                              type="button"
                              disabled={
                                restoringId ===
                                item.databaseId
                              }
                              onClick={() =>
                                handleRestore(
                                  item
                                )
                              }
                              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
                            >
                              {restoringId ===
                              item.databaseId
                                ? "Restoring..."
                                : "Restore"}
                            </button>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              )}
            </div>

            {restoreError && (
              <div className="border-t border-red-200 bg-red-50 px-6 py-3 text-sm font-medium text-red-700">
                {restoreError}
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}