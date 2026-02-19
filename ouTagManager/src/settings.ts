"use strict";

import { formattingSettings } from "powerbi-visuals-utils-formattingmodel";

import FormattingSettingsCard  = formattingSettings.SimpleCard;
import FormattingSettingsSlice = formattingSettings.Slice;
import FormattingSettingsModel = formattingSettings.Model;

// ---------------------------------------------------------------------------
// API card – endpoint URL and HTTP timeout
// ---------------------------------------------------------------------------
class ApiSettings extends FormattingSettingsCard {
    endpointUrl = new formattingSettings.TextInput({
        name: "endpointUrl",
        displayName: "Endpoint URL",
        placeholder: "https://your-api/tags",
        value: ""
    });

    timeoutMs = new formattingSettings.NumUpDown({
        name: "timeoutMs",
        displayName: "Timeout (ms)",
        value: 20000
    });

    name: string = "api";
    displayName: string = "API Settings";
    slices: Array<FormattingSettingsSlice> = [this.endpointUrl, this.timeoutMs];
}

// ---------------------------------------------------------------------------
// Behavior card – scope guard
// ---------------------------------------------------------------------------
class BehaviorSettings extends FormattingSettingsCard {
    maxScope = new formattingSettings.NumUpDown({
        name: "maxScope",
        displayName: "Max Scope (users)",
        value: 250
    });

    name: string = "behavior";
    displayName: string = "Behavior";
    slices: Array<FormattingSettingsSlice> = [this.maxScope];
}

// ---------------------------------------------------------------------------
// Root model
// ---------------------------------------------------------------------------
export class VisualFormattingSettingsModel extends FormattingSettingsModel {
    api      = new ApiSettings();
    behavior = new BehaviorSettings();
    cards    = [this.api, this.behavior];
}
