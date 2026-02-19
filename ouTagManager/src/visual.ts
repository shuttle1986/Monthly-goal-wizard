"use strict";

import powerbi from "powerbi-visuals-api";
import { FormattingSettingsService } from "powerbi-visuals-utils-formattingmodel";
import "./../style/visual.less";

import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions       = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual                   = powerbi.extensibility.visual.IVisual;
import IVisualHost               = powerbi.extensibility.visual.IVisualHost;
import DataView                  = powerbi.DataView;

import { VisualFormattingSettingsModel } from "./settings";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface User {
    userId:      string;
    displayName?: string;
    email?:      string;
}

interface Tag {
    tagId:   string;
    tagName: string;
}

type Action = "ADD" | "REMOVE";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function generateGuid(): string {
    // crypto.randomUUID is available in all modern browsers (ES2022 target)
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
        return crypto.randomUUID();
    }
    // Fallback UUID v4
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
        const r = (Math.random() * 16) | 0;
        return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
    });
}

function el<K extends keyof HTMLElementTagNameMap>(
    tag: K,
    cls?: string,
    text?: string
): HTMLElementTagNameMap[K] {
    const e = document.createElement(tag);
    if (cls)  e.className   = cls;
    if (text) e.textContent = text;
    return e;
}

// ---------------------------------------------------------------------------
// Visual
// ---------------------------------------------------------------------------

export class Visual implements IVisual {
    private readonly host: IVisualHost;
    private readonly root: HTMLElement;
    private readonly fmtService: FormattingSettingsService;
    private settings: VisualFormattingSettingsModel;

    // Parsed data
    private users: User[] = [];
    private tags:  Tag[]  = [];

    // Interaction state
    private selectedTag: Tag | null  = null;
    private action: Action           = "ADD";
    private lastBatchId: string | null = null;
    private busy = false;
    private tagFilter = "";

    // DOM refs
    private elScopeCount!: HTMLElement;
    private elTagSearch!:  HTMLInputElement;
    private elTagSelect!:  HTMLSelectElement;
    private elBtnAdd!:     HTMLButtonElement;
    private elBtnRemove!:  HTMLButtonElement;
    private elPreview!:    HTMLUListElement;
    private elApply!:      HTMLButtonElement;
    private elUndo!:       HTMLButtonElement;
    private elStatus!:     HTMLElement;

    // -----------------------------------------------------------------------
    constructor(options: VisualConstructorOptions) {
        this.host       = options.host;
        this.fmtService = new FormattingSettingsService();
        this.settings   = new VisualFormattingSettingsModel();
        this.root       = options.element;
        this.root.className = "otm-root";
        this.buildUI();
    }

    // -----------------------------------------------------------------------
    // UI construction (called once)
    // -----------------------------------------------------------------------

    private buildUI(): void {
        // Header
        this.root.appendChild(el("div", "otm-header", "OU Tag Manager"));

        // Status bar
        this.elStatus = el("div", "otm-status");
        this.root.appendChild(this.elStatus);

        // Scope row
        const scopeRow = el("div", "otm-scope-row");
        scopeRow.appendChild(el("span", undefined, "In scope: "));
        this.elScopeCount = el("strong", "otm-scope-count", "0 users");
        scopeRow.appendChild(this.elScopeCount);
        this.root.appendChild(scopeRow);

        // Tag section
        const tagSection = el("div", "otm-section");
        tagSection.appendChild(el("label", "otm-label", "Tag"));

        this.elTagSearch = el("input", "otm-input");
        this.elTagSearch.type        = "text";
        this.elTagSearch.placeholder = "Search tags…";
        this.elTagSearch.addEventListener("input", () => {
            this.tagFilter = this.elTagSearch.value;
            this.renderTagOptions();
        });
        tagSection.appendChild(this.elTagSearch);

        this.elTagSelect = el("select", "otm-select");
        this.elTagSelect.addEventListener("change", () => {
            const v = this.elTagSelect.value;
            this.selectedTag = this.tags.find(t => t.tagId === v) ?? null;
        });
        tagSection.appendChild(this.elTagSelect);
        this.root.appendChild(tagSection);

        // ADD / REMOVE toggle
        const toggleRow = el("div", "otm-toggle-row");
        this.elBtnAdd    = el("button", "otm-toggle otm-toggle--active", "ADD");
        this.elBtnRemove = el("button", "otm-toggle", "REMOVE");
        this.elBtnAdd.addEventListener("click",    () => this.setAction("ADD"));
        this.elBtnRemove.addEventListener("click", () => this.setAction("REMOVE"));
        toggleRow.appendChild(this.elBtnAdd);
        toggleRow.appendChild(this.elBtnRemove);
        this.root.appendChild(toggleRow);

        // Preview
        const previewSection = el("div", "otm-section");
        previewSection.appendChild(el("div", "otm-preview-label", "Preview (first 10 users in scope):"));
        this.elPreview = el("ul", "otm-preview");
        previewSection.appendChild(this.elPreview);
        this.root.appendChild(previewSection);

        // Action buttons
        const btnRow = el("div", "otm-btn-row");
        this.elApply = el("button", "otm-btn otm-btn--primary", "Apply");
        this.elUndo  = el("button", "otm-btn otm-btn--secondary", "Undo Last Batch");
        this.elUndo.disabled = true;
        this.elApply.addEventListener("click", () => this.onApply());
        this.elUndo.addEventListener("click",  () => this.onUndo());
        btnRow.appendChild(this.elApply);
        btnRow.appendChild(this.elUndo);
        this.root.appendChild(btnRow);
    }

    // -----------------------------------------------------------------------
    // Data update (PBI lifecycle)
    // -----------------------------------------------------------------------

    public update(options: VisualUpdateOptions): void {
        const dv = options.dataViews?.[0];

        this.settings = this.fmtService.populateFormattingSettingsModel(
            VisualFormattingSettingsModel, dv
        );

        // Restore persisted lastBatchId
        const persistedId = dv?.metadata?.objects?.["internal"]?.["lastBatchId"] as string | undefined;
        if (persistedId) {
            this.lastBatchId = persistedId;
        }

        this.parseDataView(dv);
        this.render();
    }

    public getFormattingModel(): powerbi.visuals.FormattingModel {
        return this.fmtService.buildFormattingModel(this.settings);
    }

    // -----------------------------------------------------------------------
    // Parsing
    // -----------------------------------------------------------------------

    private parseDataView(dv: DataView | undefined): void {
        if (!dv?.table) {
            this.users = [];
            this.tags  = [];
            return;
        }

        // Map role name → column index
        const roleIdx: Record<string, number> = {};
        dv.table.columns.forEach((col, idx) => {
            Object.keys(col.roles ?? {}).forEach(role => { roleIdx[role] = idx; });
        });

        const iUserId  = roleIdx["peopleUserId"];
        const iName    = roleIdx["peopleDisplayName"];
        const iEmail   = roleIdx["peopleEmail"];
        const iTagId   = roleIdx["tagsTagId"];
        const iTagName = roleIdx["tagsTagName"];

        if (iUserId === undefined) {
            this.users = [];
            this.tags  = [];
            return;
        }

        const userMap = new Map<string, User>();
        const tagMap  = new Map<string, Tag>();

        for (const row of dv.table.rows) {
            const userId = String(row[iUserId] ?? "").trim();
            if (!userId) continue;

            if (!userMap.has(userId)) {
                userMap.set(userId, {
                    userId,
                    displayName: iName  !== undefined ? (String(row[iName]  ?? "") || undefined) : undefined,
                    email:       iEmail !== undefined ? (String(row[iEmail] ?? "") || undefined) : undefined
                });
            }

            if (iTagId !== undefined && iTagName !== undefined) {
                const tagId   = String(row[iTagId]   ?? "").trim();
                const tagName = String(row[iTagName] ?? "").trim();
                if (tagId && !tagMap.has(tagId)) {
                    tagMap.set(tagId, { tagId, tagName });
                }
            }
        }

        this.users = Array.from(userMap.values());
        this.tags  = Array.from(tagMap.values()).sort((a, b) =>
            a.tagName.localeCompare(b.tagName)
        );
    }

    // -----------------------------------------------------------------------
    // Rendering helpers
    // -----------------------------------------------------------------------

    private render(): void {
        const count = this.users.length;
        this.elScopeCount.textContent = `${count} user${count !== 1 ? "s" : ""}`;
        this.renderTagOptions();
        this.renderPreview();
        this.elUndo.disabled = this.busy || !this.lastBatchId;
    }

    private renderTagOptions(): void {
        const filter   = this.tagFilter.toLowerCase();
        const filtered = filter
            ? this.tags.filter(t =>
                t.tagName.toLowerCase().includes(filter) ||
                t.tagId.toLowerCase().includes(filter))
            : this.tags;

        this.elTagSelect.innerHTML = "";

        const placeholder = document.createElement("option");
        placeholder.value       = "";
        placeholder.textContent = "— select a tag —";
        this.elTagSelect.appendChild(placeholder);

        for (const tag of filtered) {
            const opt = document.createElement("option");
            opt.value       = tag.tagId;
            opt.textContent = tag.tagName;
            if (this.selectedTag?.tagId === tag.tagId) opt.selected = true;
            this.elTagSelect.appendChild(opt);
        }

        // If current selection was filtered out, clear it
        if (this.selectedTag && !filtered.find(t => t.tagId === this.selectedTag!.tagId)) {
            this.selectedTag = null;
        }
    }

    private renderPreview(): void {
        this.elPreview.innerHTML = "";
        const preview = this.users.slice(0, 10);

        if (preview.length === 0) {
            const li = el("li", "otm-preview-empty", "No users in scope");
            this.elPreview.appendChild(li);
            return;
        }

        for (const u of preview) {
            const label = u.displayName || u.email || u.userId;
            const li    = el("li", "otm-preview-item", label);
            li.title    = `ID: ${u.userId}${u.email ? `\nEmail: ${u.email}` : ""}`;
            this.elPreview.appendChild(li);
        }
    }

    // -----------------------------------------------------------------------
    // UI helpers
    // -----------------------------------------------------------------------

    private setAction(action: Action): void {
        this.action = action;
        this.elBtnAdd.classList.toggle("otm-toggle--active",    action === "ADD");
        this.elBtnRemove.classList.toggle("otm-toggle--active", action === "REMOVE");
    }

    private setStatus(msg: string, kind: "success" | "error" | ""): void {
        this.elStatus.textContent = msg;
        this.elStatus.className   = `otm-status${kind ? ` otm-status--${kind}` : ""}`;
    }

    private setBusy(busy: boolean): void {
        this.busy              = busy;
        this.elApply.disabled  = busy;
        this.elUndo.disabled   = busy || !this.lastBatchId;
        this.root.classList.toggle("otm-root--busy", busy);
    }

    // -----------------------------------------------------------------------
    // Apply
    // -----------------------------------------------------------------------

    private async onApply(): Promise<void> {
        if (this.busy) return;

        const url = this.settings.api.endpointUrl.value?.trim();
        if (!url) {
            this.setStatus("Error: configure Endpoint URL in Format > API Settings.", "error");
            return;
        }

        if (!this.selectedTag) {
            this.setStatus("Error: select a tag before applying.", "error");
            return;
        }

        const maxScope = this.settings.behavior.maxScope.value ?? 250;
        if (this.users.length === 0) {
            this.setStatus("Error: no users in scope.", "error");
            return;
        }
        if (this.users.length > maxScope) {
            this.setStatus(
                `Error: scope (${this.users.length}) exceeds maxScope (${maxScope}). Refine filters.`,
                "error"
            );
            return;
        }

        const batchId  = generateGuid();
        const timeout  = this.settings.api.timeoutMs.value ?? 20000;
        const payload  = {
            batch_id: batchId,
            actor:    "unknown",
            action:   this.action,
            tag:      { tag_id: this.selectedTag.tagId, tag_name: this.selectedTag.tagName },
            users:    this.users.map(u => ({ user_id: u.userId }))
        };

        this.setBusy(true);
        this.setStatus("Applying…", "");

        try {
            await this.post(url, payload, timeout);
            this.lastBatchId = batchId;
            this.persistLastBatchId(batchId);
            this.setStatus(
                `Applied batch ${batchId.substring(0, 8)}… (${this.users.length} users, ${this.action} "${this.selectedTag.tagName}").`,
                "success"
            );
        } catch (err: unknown) {
            this.setStatus(`Error: ${err instanceof Error ? err.message : String(err)}`, "error");
        } finally {
            this.setBusy(false);
        }
    }

    // -----------------------------------------------------------------------
    // Undo
    // -----------------------------------------------------------------------

    private async onUndo(): Promise<void> {
        if (this.busy || !this.lastBatchId) return;

        const url = this.settings.api.endpointUrl.value?.trim();
        if (!url) {
            this.setStatus("Error: configure Endpoint URL in Format > API Settings.", "error");
            return;
        }

        const undoBatchId = this.lastBatchId;
        const newBatchId  = generateGuid();
        const timeout     = this.settings.api.timeoutMs.value ?? 20000;
        const payload     = {
            undo_batch_id: undoBatchId,
            batch_id:      newBatchId,
            actor:         "unknown"
        };

        this.setBusy(true);
        this.setStatus("Undoing…", "");

        try {
            await this.post(url, payload, timeout);
            this.lastBatchId = null;
            this.persistLastBatchId(null);
            this.setStatus(`Undone batch ${undoBatchId.substring(0, 8)}….`, "success");
        } catch (err: unknown) {
            this.setStatus(`Error: ${err instanceof Error ? err.message : String(err)}`, "error");
        } finally {
            this.setBusy(false);
        }
    }

    // -----------------------------------------------------------------------
    // HTTP helper
    // -----------------------------------------------------------------------

    private async post(url: string, body: unknown, timeoutMs: number): Promise<void> {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeoutMs);
        try {
            const res = await fetch(url, {
                method:  "POST",
                headers: { "Content-Type": "application/json" },
                body:    JSON.stringify(body),
                signal:  controller.signal
            });
            if (!res.ok) {
                throw new Error(`HTTP ${res.status} ${res.statusText}`);
            }
        } finally {
            clearTimeout(timer);
        }
    }

    // -----------------------------------------------------------------------
    // Persistence
    // -----------------------------------------------------------------------

    private persistLastBatchId(id: string | null): void {
        this.host.persistProperties({
            merge: [{
                objectName: "internal",
                selector:   null,
                properties: { lastBatchId: id ?? "" }
            }]
        });
    }
}
