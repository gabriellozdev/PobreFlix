// "Minha lista" e "Continuar assistindo", guardados só neste navegador
// (sem conta, sem login).
import { useSyncExternalStore } from 'react';
import type { MediaType, Title } from '../api/types';

export interface SavedTitle {
  tmdbId: number;
  type: MediaType;
  title: string;
  poster?: string;
  year?: number;
  savedAt: number;
}

export interface Progress extends SavedTitle {
  season?: number;
  episode?: number;
  /** 0..1, só quando o player informa (StreamBetter) */
  percent?: number;
  ended?: boolean;
}

const LIST_KEY = 'pf:list';
const PROG_KEY = 'pf:progress';
const listeners = new Set<() => void>();

function read<T>(k: string): T[] {
  try {
    return JSON.parse(localStorage.getItem(k) || '[]') as T[];
  } catch {
    return [];
  }
}
let list = read<SavedTitle>(LIST_KEY);
let progress = read<Progress>(PROG_KEY);

function write(k: string, v: unknown) {
  try {
    localStorage.setItem(k, JSON.stringify(v));
  } catch {
    /* sem storage */
  }
  listeners.forEach((l) => l());
}

window.addEventListener('storage', (e) => {
  if (e.key === LIST_KEY) list = read(LIST_KEY);
  if (e.key === PROG_KEY) progress = read(PROG_KEY);
  listeners.forEach((l) => l());
});

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

const slim = (t: Title): SavedTitle => ({
  tmdbId: t.tmdbId,
  type: t.type,
  title: t.title,
  poster: t.poster,
  year: t.year,
  savedAt: Date.now(),
});

export function toggleList(t: Title) {
  const exists = list.some((x) => x.tmdbId === t.tmdbId && x.type === t.type);
  list = exists ? list.filter((x) => !(x.tmdbId === t.tmdbId && x.type === t.type)) : [slim(t), ...list];
  write(LIST_KEY, list);
}

export function recordProgress(t: Title, p: Partial<Progress>) {
  const prev = progress.find((x) => x.tmdbId === t.tmdbId && x.type === t.type);
  const next: Progress = { ...prev, ...slim(t), ...p, savedAt: Date.now() };
  progress = [next, ...progress.filter((x) => x !== prev)].slice(0, 40);
  write(PROG_KEY, progress);
}

export function removeProgress(type: MediaType, tmdbId: number) {
  progress = progress.filter((x) => !(x.tmdbId === tmdbId && x.type === type));
  write(PROG_KEY, progress);
}

export const useMyList = () => useSyncExternalStore(subscribe, () => list);
export const useProgress = () => useSyncExternalStore(subscribe, () => progress);
export const useInList = (type: MediaType, id: number) =>
  useSyncExternalStore(subscribe, () => list.some((x) => x.tmdbId === id && x.type === type));
export const getProgress = (type: MediaType, id: number) =>
  progress.find((x) => x.tmdbId === id && x.type === type);
