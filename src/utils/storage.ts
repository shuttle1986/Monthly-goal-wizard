import type { UserProfile, GoalsByMonth } from '../types';

const PROFILE_KEY = 'mgw_profile';
const DRAFT_PREFIX = 'mgw_draft_';

export function loadProfile(): UserProfile | null {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveProfile(profile: UserProfile): void {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

function draftKey(region: string, chapter: string, staff: string, months: string[]): string {
  return DRAFT_PREFIX + [region, chapter, staff, ...months].join('_');
}

export function loadDraft(
  region: string,
  chapter: string,
  staff: string,
  months: string[],
): GoalsByMonth | null {
  try {
    const key = draftKey(region, chapter, staff, months);
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveDraft(
  region: string,
  chapter: string,
  staff: string,
  months: string[],
  goals: GoalsByMonth,
): void {
  const key = draftKey(region, chapter, staff, months);
  localStorage.setItem(key, JSON.stringify(goals));
}

export function clearDraft(
  region: string,
  chapter: string,
  staff: string,
  months: string[],
): void {
  const key = draftKey(region, chapter, staff, months);
  localStorage.removeItem(key);
}
