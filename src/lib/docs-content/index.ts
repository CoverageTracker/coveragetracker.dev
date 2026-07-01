import type { Component } from 'svelte';

const mods = import.meta.glob('/src/lib/docs-content/*.svx', { eager: true });

export type DocSection = {
  id: string;
  title: string;
  group: string;
  component: Component;
};

export type SidebarGroup = { head: string; items: { id: string; label: string }[] };

export const sections: DocSection[] = Object.entries(mods)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([, mod]: [string, any]) => ({
    id: mod.metadata.id,
    title: mod.metadata.title,
    group: mod.metadata.group,
    component: mod.default,
  }));

export const sidebarGroups: SidebarGroup[] = sections.reduce<SidebarGroup[]>((acc, s) => {
  const existing = acc.find((g) => g.head === s.group);
  if (existing) existing.items.push({ id: s.id, label: s.title });
  else acc.push({ head: s.group, items: [{ id: s.id, label: s.title }] });
  return acc;
}, []);
