'use client';

import dynamic from 'next/dynamic';
import { useMemo, useRef, useState } from 'react';
import {
  Network,
  List,
  Plus,
  Users,
  BarChart3,
  History,
  Sparkles,
  GitBranch,
  Download,
  Upload,
  Link2,
  Wand2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/app/Card';
import { trpc } from '@/lib/trpc/client';
import type { LayoutMode, OrgChartHandle } from '@/components/org-design/OrgChart';
import { OrgTable } from '@/components/org/OrgTable';
import type { DesignGraphEntity } from '@/lib/org-design/types';
import { TEMPLATE_CATEGORIES } from '@/lib/org-design/templates';
import { computeInsights } from '@/lib/org-design/insights';

const OrgChart = dynamic(() => import('@/components/org-design/OrgChart'), {
  ssr: false,
  loading: () => (
    <div
      className="flex h-[520px] items-center justify-center border border-rule bg-stock-0 text-sm text-ink-1"
      style={{ borderRadius: 'var(--radius)' }}
      aria-busy="true"
    >
      Loading graph…
    </div>
  ),
});

type MainView = 'design' | 'people' | 'insights' | 'history';
type ViewMode = 'chart' | 'table';

type Props = {
  /** When set, loads engagement-bound graph and shows bridge actions */
  engagementId?: string;
  readOnly?: boolean;
  title?: string;
  /** Open on a specific main tab (e.g. people for /organise/people). */
  initialMainView?: MainView;
  /** Hide the Design/People/Insights/History tab strip when the plate rail owns IA. */
  hideMainTabs?: boolean;
  /** Default presentation — table-first per doc 08. */
  initialViewMode?: ViewMode;
};

export function DesignWorkspace({
  engagementId,
  readOnly,
  title,
  initialMainView = 'design',
  hideMainTabs,
  initialViewMode = 'table',
}: Props) {
  const utils = trpc.useUtils();
  const chartRef = useRef<OrgChartHandle>(null);
  const [mainView, setMainView] = useState<MainView>(initialMainView);
  const [view, setView] = useState<ViewMode>(initialViewMode);
  const [layout, setLayout] = useState<LayoutMode>('tree');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'circle' | 'role' | 'product'>('all');
  const [selected, setSelected] = useState<DesignGraphEntity | null>(null);
  const [showEntityForm, setShowEntityForm] = useState(false);
  const [showRelForm, setShowRelForm] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showScenarios, setShowScenarios] = useState(false);
  const [entityDraft, setEntityDraft] = useState({
    name: '',
    type: 'role' as 'circle' | 'role' | 'product',
    purpose: '',
    domain: '',
    accountabilities: '',
  });
  const [relDraft, setRelDraft] = useState({
    sourceId: '',
    targetId: '',
    type: 'includes' as 'includes' | 'reports-to' | 'collaborates-with',
  });
  const [personDraft, setPersonDraft] = useState({ name: '', email: '', entityId: '' });
  const [pendingPersonRoles, setPendingPersonRoles] = useState<Record<string, string>>({});
  const [scenarioName, setScenarioName] = useState('');
  const [snapshotName, setSnapshotName] = useState('');
  const [aiMessage, setAiMessage] = useState('');
  const [aiReply, setAiReply] = useState('');
  const [templateCategory, setTemplateCategory] = useState<string>('all');
  const [message, setMessage] = useState<string | null>(null);

  const engagementQ = trpc.orgDesign.engagementStructure.useQuery(
    { engagementId: engagementId! },
    { enabled: Boolean(engagementId) },
  );
  const liveQ = trpc.orgDesign.graph.useQuery(undefined, { enabled: !engagementId });
  const graph = engagementId ? engagementQ.data?.graph : liveQ.data;
  const insightsQ = trpc.orgDesign.insights.useQuery(undefined, {
    enabled: !engagementId && mainView === 'insights',
  });
  const activityQ = trpc.orgDesign.listActivity.useQuery(
    { limit: 40 },
    { enabled: mainView === 'history' },
  );
  const templatesQ = trpc.orgDesign.listTemplates.useQuery(undefined, {
    enabled: showTemplates,
  });
  const scenariosQ = trpc.orgDesign.listScenarios.useQuery(undefined, {
    enabled: showScenarios || mainView === 'history',
  });
  const snapshotsQ = trpc.orgDesign.listSnapshots.useQuery(undefined, {
    enabled: showScenarios || mainView === 'history',
  });
  const aiStatusQ = trpc.orgDesign.aiStatus.useQuery(undefined, {
    enabled: mainView === 'design' && !engagementId,
  });
  const shareLinksQ = trpc.orgDesign.listShareLinks.useQuery(undefined, {
    enabled: !engagementId && mainView === 'history',
  });
  const entityDetailQ = trpc.orgDesign.entityDetail.useQuery(
    { entityId: selected?.id ?? '' },
    { enabled: Boolean(selected?.id) },
  );

  const invalidate = async () => {
    await utils.orgDesign.graph.invalidate();
    await utils.orgDesign.insights.invalidate();
    await utils.orgDesign.listActivity.invalidate();
    if (engagementId) await utils.orgDesign.engagementStructure.invalidate();
  };

  const createEntity = trpc.orgDesign.createEntity.useMutation({
    onSuccess: async () => {
      setShowEntityForm(false);
      setEntityDraft({ name: '', type: 'role', purpose: '', domain: '', accountabilities: '' });
      await invalidate();
      setMessage('Entity created');
    },
  });
  const updateEntity = trpc.orgDesign.updateEntity.useMutation({
    onSuccess: async () => {
      await invalidate();
      setMessage('Entity updated');
    },
  });
  const deleteEntity = trpc.orgDesign.deleteEntity.useMutation({
    onSuccess: async () => {
      setSelected(null);
      await invalidate();
    },
  });
  const createRel = trpc.orgDesign.createRelationship.useMutation({
    onSuccess: async () => {
      setShowRelForm(false);
      await invalidate();
    },
  });
  const deleteRel = trpc.orgDesign.deleteRelationship.useMutation({
    onSuccess: invalidate,
  });
  const createPerson = trpc.orgDesign.createPerson.useMutation({
    onSuccess: async () => {
      setPersonDraft({ name: '', email: '', entityId: '' });
      await invalidate();
    },
    onError: () => setMessage('Could not add that person. Try again.'),
  });
  const deletePerson = trpc.orgDesign.deletePerson.useMutation({ onSuccess: invalidate });
  const setPersonRole = trpc.orgDesign.setPersonRole.useMutation({
    onSuccess: invalidate,
    onError: () => setMessage('Could not assign that role. Try again.'),
  });
  const applyTemplate = trpc.orgDesign.applyTemplate.useMutation({
    onSuccess: async (r) => {
      setShowTemplates(false);
      await invalidate();
      setMessage(`Template applied (${r.entitiesCreated} entities)`);
    },
  });
  const createScenario = trpc.orgDesign.createScenario.useMutation({
    onSuccess: async () => {
      setScenarioName('');
      await utils.orgDesign.listScenarios.invalidate();
      setMessage('Scenario created from live design');
    },
  });
  const promoteScenario = trpc.orgDesign.promoteScenario.useMutation({
    onSuccess: async () => {
      await invalidate();
      await utils.orgDesign.listScenarios.invalidate();
      setMessage('Scenario promoted to live');
    },
  });
  const createSnapshot = trpc.orgDesign.createSnapshot.useMutation({
    onSuccess: async () => {
      setSnapshotName('');
      await utils.orgDesign.listSnapshots.invalidate();
      setMessage('Snapshot saved');
    },
  });
  const restoreSnapshot = trpc.orgDesign.restoreSnapshot.useMutation({
    onSuccess: async () => {
      await invalidate();
      setMessage('Snapshot restored');
    },
  });
  const createShare = trpc.orgDesign.createShareLink.useMutation({
    onSuccess: async () => {
      await utils.orgDesign.listShareLinks.invalidate();
    },
  });
  const applyDdat = trpc.orgDesign.applyDdatMappings.useMutation({
    onSuccess: async (r) => {
      await invalidate();
      setMessage(`Mapped ${r.updated} roles to DDaT`);
    },
  });
  const forkEngagement = trpc.orgDesign.forkScenarioForEngagement.useMutation({
    onSuccess: async () => {
      await invalidate();
      setMessage('Forked live design into an engagement scenario');
    },
  });
  const syncTeam = trpc.orgDesign.syncStructureToTeam.useMutation({
    onSuccess: async (r) => {
      setMessage(
        `Synced to team: ${r.rolesUpserted} roles, ${r.peopleUpserted} people, ${r.assignmentsUpserted} assignments`,
      );
    },
  });
  const aiChat = trpc.orgDesign.aiChat.useMutation({
    onSuccess: (r) => setAiReply(r.reply),
  });
  const aiGenerate = trpc.orgDesign.aiGenerate.useMutation({
    onSuccess: async () => {
      await invalidate();
      setMessage('AI org generated and applied');
    },
  });
  const importJson = trpc.orgDesign.importJson.useMutation({
    onSuccess: async () => {
      await invalidate();
      setMessage('Import complete');
    },
  });

  const entities = graph?.entities ?? [];
  const relationships = graph?.relationships ?? [];
  const people = graph?.people ?? [];
  const assignments = graph?.assignments ?? [];

  const filtered = useMemo(() => {
    return entities.filter((e) => {
      if (typeFilter !== 'all' && e.type !== typeFilter) return false;
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        e.name.toLowerCase().includes(q) ||
        (e.purpose ?? '').toLowerCase().includes(q) ||
        (e.domain ?? '').toLowerCase().includes(q)
      );
    });
  }, [entities, search, typeFilter]);

  const insights = useMemo(() => {
    if (engagementId && graph) {
      return {
        insights: computeInsights({
          entities: graph.entities,
          relationships: graph.relationships,
          people: graph.people ?? [],
          assignments: graph.assignments ?? [],
        }),
        computedAt: null as Date | null,
        cached: false,
      };
    }
    return insightsQ.data ?? null;
  }, [engagementId, graph, insightsQ.data]);

  const insightsBody = insights?.insights;
  const canWrite = !readOnly && (!engagementId || engagementQ.data?.binding === 'scenario');
  const peopleWritable =
    !readOnly && (!engagementId || engagementQ.data?.binding === 'live');
  const liveLockedOnEngagement =
    Boolean(engagementId) && engagementQ.data?.binding === 'live';
  const roleEntities = entities.filter((e) => e.type === 'role');

  const inspector = entityDetailQ.data ?? selected;

  const tabs: Array<{ id: MainView; label: string; icon: typeof Network }> = [
    { id: 'design', label: 'Design', icon: List },
    { id: 'people', label: 'People', icon: Users },
    { id: 'insights', label: 'Insights', icon: BarChart3 },
    { id: 'history', label: 'History', icon: History },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-text">{title ?? 'Org design'}</h2>
          <p className="mt-1 max-w-2xl text-sm text-text-muted">
            Redesign digital service structures with GDS multidisciplinary roles, then bind them to
            call-offs for readiness scoring.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {!engagementId && canWrite && (
            <>
              <Button variant="secondary" size="sm" onClick={() => setShowTemplates(true)}>
                <Sparkles className="h-4 w-4" /> Templates
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setShowScenarios(true)}>
                <GitBranch className="h-4 w-4" /> Scenarios
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => applyDdat.mutate()}
                disabled={applyDdat.isPending}
              >
                <Wand2 className="h-4 w-4" /> Map to DDaT
              </Button>
            </>
          )}
          {engagementId && (
            <>
              <Button variant="secondary" size="sm" onClick={() => setShowScenarios(true)}>
                <GitBranch className="h-4 w-4" /> Scenarios
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setShowTemplates(true)}>
                <Sparkles className="h-4 w-4" /> Templates
              </Button>
              {liveLockedOnEngagement && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => forkEngagement.mutate({ engagementId })}
                  disabled={forkEngagement.isPending}
                >
                  Fork & edit structure
                </Button>
              )}
              <SyncToTeamButton
                engagementId={engagementId}
                onSync={(requirementId) => syncTeam.mutate({ engagementId, requirementId })}
                pending={syncTeam.isPending}
              />
            </>
          )}
        </div>
      </div>

      {message && (
        <p className="rounded-md border border-border bg-brand-tint px-3 py-2 text-sm text-text" role="status">
          {message}{' '}
          <button type="button" className="underline" onClick={() => setMessage(null)}>
            Dismiss
          </button>
        </p>
      )}

      {engagementId && engagementQ.data && (
        <p className="text-sm text-text-muted">
          Binding: <strong className="text-text">{engagementQ.data.binding}</strong>
          {engagementQ.data.designSyncedAt
            ? ` · Last synced ${new Date(engagementQ.data.designSyncedAt).toLocaleString()}`
            : ' · Not yet synced to Team'}
          {liveLockedOnEngagement ? ' · Live design is read-only here — fork to edit.' : ''}
        </p>
      )}

      {!hideMainTabs && (
        <div className="flex flex-wrap gap-1 border-b border-border" role="tablist" aria-label="Org design views">
          {tabs.map((t) => {
            const Icon = t.icon;
            const active = mainView === t.id;
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={active}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium"
                style={{
                  color: active ? 'var(--color-text)' : 'var(--color-text-muted)',
                  borderBottom: active ? '2px solid var(--color-brand)' : '2px solid transparent',
                }}
                onClick={() => setMainView(t.id)}
              >
                <Icon className="h-4 w-4" />
                {t.label}
              </button>
            );
          })}
        </div>
      )}

      {mainView === 'design' && (
        <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
          <Card>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <div className="flex gap-1 rounded-md border border-border p-0.5">
                <button
                  type="button"
                  className={`rounded px-2 py-1 text-xs ${view === 'table' ? 'bg-brand text-text-inverse' : ''}`}
                  onClick={() => setView('table')}
                >
                  <List className="mr-1 inline h-3 w-3" />
                  Table
                </button>
                <button
                  type="button"
                  className={`rounded px-2 py-1 text-xs ${view === 'chart' ? 'bg-brand text-text-inverse' : ''}`}
                  onClick={() => setView('chart')}
                >
                  <Network className="mr-1 inline h-3 w-3" />
                  View as graph
                </button>
              </div>
              {view === 'chart' ? (
              <select
                className="rounded-md border border-border bg-surface px-2 py-1 text-sm"
                value={layout}
                onChange={(e) => setLayout(e.target.value as LayoutMode)}
                aria-label="Layout"
              >
                <option value="tree">Tree</option>
                <option value="force">Force</option>
                <option value="radial">Radial</option>
              </select>
              ) : null}
              <input
                className="min-w-[160px] flex-1 rounded-md border border-border bg-surface px-2 py-1 text-sm"
                placeholder="Search…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <select
                className="rounded-md border border-border bg-surface px-2 py-1 text-sm"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as typeof typeFilter)}
              >
                <option value="all">All types</option>
                <option value="circle">Circles</option>
                <option value="role">Roles</option>
                <option value="product">Products</option>
              </select>
              {canWrite && (
                <>
                  <Button variant="secondary" size="sm" onClick={() => setShowEntityForm(true)}>
                    <Plus className="h-4 w-4" /> Entity
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => setShowRelForm(true)}>
                    <Plus className="h-4 w-4" /> Link
                  </Button>
                </>
              )}
            </div>

            {view === 'table' ? (
              <OrgTable
                entities={filtered}
                people={people}
                assignments={assignments}
                selectedId={selected?.id}
                onSelect={setSelected}
              />
            ) : entities.length === 0 ? (
                <EmptyState onTemplates={() => setShowTemplates(true)} canWrite={canWrite && !engagementId} />
              ) : (
                <OrgChart
                  ref={chartRef}
                  entities={filtered}
                  relationships={relationships}
                  selectedEntity={selected}
                  onEntitySelect={setSelected}
                  layout={layout}
                  readOnly={!canWrite}
                  height={520}
                />
              )}
          </Card>

          <aside className="space-y-3">
            {inspector ? (
              <Card>
                <h3 className="font-semibold text-text">{inspector.name}</h3>
                <p className="mt-1 text-xs uppercase tracking-wide text-text-muted">{inspector.type}</p>
                <dl className="mt-3 space-y-2 text-sm">
                  <div>
                    <dt className="text-text-muted">Purpose</dt>
                    <dd>{inspector.purpose || '—'}</dd>
                  </div>
                  <div>
                    <dt className="text-text-muted">Domain</dt>
                    <dd>{inspector.domain || '—'}</dd>
                  </div>
                  <div>
                    <dt className="text-text-muted">Accountabilities</dt>
                    <dd>
                      {(inspector.accountabilities ?? []).length ? (
                        <ul className="list-disc pl-4">
                          {inspector.accountabilities.map((a) => (
                            <li key={a}>{a}</li>
                          ))}
                        </ul>
                      ) : (
                        '—'
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-text-muted">DDaT role</dt>
                    <dd>{inspector.ddatRoleId || 'Not mapped'}</dd>
                  </div>
                </dl>
                {canWrite && selected && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        if (confirm(`Delete ${selected.name}?`)) {
                          deleteEntity.mutate({ id: selected.id });
                        }
                      }}
                    >
                      Delete
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        updateEntity.mutate({
                          id: selected.id,
                          data: {
                            purpose: selected.purpose || `Purpose for ${selected.name}`,
                          },
                        });
                      }}
                    >
                      Ensure purpose
                    </Button>
                  </div>
                )}
                <div className="mt-4">
                  <h4 className="text-xs font-semibold uppercase text-text-muted">Relationships</h4>
                  <ul className="mt-2 space-y-1 text-sm">
                    {selected
                      ? relationships
                          .filter((r) => r.sourceId === selected.id || r.targetId === selected.id)
                          .map((r) => {
                            const otherId = r.sourceId === selected.id ? r.targetId : r.sourceId;
                            const other = entities.find((e) => e.id === otherId);
                            return (
                              <li key={r.id} className="flex items-center justify-between gap-2">
                                <span>
                                  {r.type} → {other?.name ?? otherId}
                                </span>
                                {canWrite && (
                                  <button
                                    type="button"
                                    className="text-xs text-status-gap"
                                    onClick={() => deleteRel.mutate({ id: r.id })}
                                  >
                                    Remove
                                  </button>
                                )}
                              </li>
                            );
                          })
                      : null}
                  </ul>
                </div>
              </Card>
            ) : (
              <Card>
                <p className="text-sm text-text-muted">Select an entity to inspect purpose, accountabilities, and links.</p>
              </Card>
            )}

            {!engagementId && aiStatusQ.data?.available && (
              <Card>
                <h3 className="font-semibold text-text">AI co-pilot</h3>
                <textarea
                  className="mt-2 w-full rounded-md border border-border bg-surface p-2 text-sm"
                  rows={3}
                  value={aiMessage}
                  onChange={(e) => setAiMessage(e.target.value)}
                  placeholder="Ask about span of control, missing GDS roles…"
                />
                <div className="mt-2 flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={!aiMessage.trim() || aiChat.isPending}
                    onClick={() => aiChat.mutate({ message: aiMessage })}
                  >
                    Ask
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={aiGenerate.isPending}
                    onClick={() =>
                      aiGenerate.mutate({
                        prompt: 'Create a GDS multidisciplinary service team for a discovery phase',
                        apply: true,
                      })
                    }
                  >
                    Generate GDS team
                  </Button>
                </div>
                {aiReply && <p className="mt-2 whitespace-pre-wrap text-sm text-text">{aiReply}</p>}
              </Card>
            )}
          </aside>
        </div>
      )}

      {mainView === 'people' && (
        <Card>
          {peopleWritable ? (
            <form
              className="mb-4 flex flex-wrap items-end gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                if (!personDraft.name.trim()) return;
                createPerson.mutate({
                  name: personDraft.name.trim(),
                  email: personDraft.email || null,
                  ...(personDraft.entityId ? { assignEntityId: personDraft.entityId } : {}),
                });
              }}
            >
              <label className="text-sm">
                <span className="mb-1 block text-text-muted">Name</span>
                <input
                  className="rounded-md border border-border bg-surface px-2 py-1.5 text-sm"
                  value={personDraft.name}
                  onChange={(e) => setPersonDraft((d) => ({ ...d, name: e.target.value }))}
                  required
                />
              </label>
              <label className="text-sm">
                <span className="mb-1 block text-text-muted">Email</span>
                <input
                  className="rounded-md border border-border bg-surface px-2 py-1.5 text-sm"
                  type="email"
                  value={personDraft.email}
                  onChange={(e) => setPersonDraft((d) => ({ ...d, email: e.target.value }))}
                />
              </label>
              <label className="text-sm">
                <span className="mb-1 block text-text-muted">Role</span>
                <select
                  className="min-w-[12rem] rounded-md border border-border bg-surface px-2 py-1.5 text-sm"
                  name="new-person-role"
                  value={personDraft.entityId}
                  disabled={roleEntities.length === 0}
                  aria-label="Role"
                  onChange={(e) => setPersonDraft((d) => ({ ...d, entityId: e.target.value }))}
                >
                  <option value="">Assign role…</option>
                  {roleEntities.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </label>
              <Button type="submit" size="sm" disabled={createPerson.isPending || !personDraft.name.trim()}>
                Add person
              </Button>
            </form>
          ) : null}
          {peopleWritable && roleEntities.length === 0 ? (
            <p className="mb-3 text-sm text-text-muted">
              No roles in this design yet, so a role cannot be assigned.
            </p>
          ) : null}
          <ul className="divide-y divide-border">
            {people.map((p) => {
              const assigned = assignments.filter((a) => a.personId === p.id);
              const currentRoleId =
                pendingPersonRoles[p.id] ?? assigned[0]?.entityId ?? '';
              return (
                <li key={p.id} className="flex flex-wrap items-start justify-between gap-2 py-3">
                  <div className="min-w-[16rem] flex-1">
                    <p className="font-medium text-text">{p.name}</p>
                    <p className="text-sm text-text-muted">{p.email || 'No email'} · {p.fte}% FTE</p>
                    {peopleWritable ? (
                      <label className="mt-2 block text-sm">
                        <span className="text-text-muted">Role</span>
                        <select
                          className="mt-1 w-full max-w-sm rounded-md border border-border bg-surface px-2 py-1.5 text-sm"
                          name={`person-role-${p.id}`}
                          value={currentRoleId}
                          disabled={roleEntities.length === 0}
                          aria-label={`${p.name} Role`}
                          onChange={(e) => {
                            const entityId = e.target.value || null;
                            setPendingPersonRoles((current) => ({
                              ...current,
                              [p.id]: entityId ?? '',
                            }));
                            setPersonRole.mutate(
                              { personId: p.id, entityId },
                              {
                                onError: () => {
                                  setPendingPersonRoles((current) => {
                                    const next = { ...current };
                                    delete next[p.id];
                                    return next;
                                  });
                                },
                              },
                            );
                          }}
                        >
                          <option value="">Assign role…</option>
                          {roleEntities.map((role) => (
                            <option key={role.id} value={role.id}>
                              {role.name}
                            </option>
                          ))}
                        </select>
                      </label>
                    ) : (
                      <p className="mt-1 text-sm text-text-muted">
                        Assigned:{' '}
                        {assigned.length
                          ? assigned
                              .map((a) => entities.find((e) => e.id === a.entityId)?.name ?? a.entityId)
                              .join(', ')
                          : 'none'}
                      </p>
                    )}
                  </div>
                  {peopleWritable && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deletePerson.mutate({ id: p.id })}
                    >
                      Remove
                    </Button>
                  )}
                </li>
              );
            })}
            {people.length === 0 && (
              <li className="py-6 text-sm text-text-muted">No people in the org roster yet.</li>
            )}
          </ul>
        </Card>
      )}

      {mainView === 'insights' && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <h3 className="font-semibold text-text">Health</h3>
            {insights?.computedAt ? (
              <p className="mt-1 text-xs text-text-muted">
                As at {new Date(insights.computedAt).toLocaleString()}
                {insights.cached ? ' · cached' : ''}
              </p>
            ) : null}
            <p className="mt-2 text-4xl font-semibold text-brand">
              {insightsBody?.healthScore ?? '—'}
              <span className="text-base text-text-muted"> / 100</span>
            </p>
            <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
              <div>
                <dt className="text-text-muted">Entities</dt>
                <dd>{insightsBody?.totals.entities ?? 0}</dd>
              </div>
              <div>
                <dt className="text-text-muted">Vacancies</dt>
                <dd>{insightsBody?.totals.vacancies ?? 0}</dd>
              </div>
              <div>
                <dt className="text-text-muted">Depth</dt>
                <dd>{insightsBody?.hierarchyDepth ?? 0}</dd>
              </div>
              <div>
                <dt className="text-text-muted">Avg span</dt>
                <dd>{insightsBody?.spanOfControl.average ?? 0}</dd>
              </div>
              <div>
                <dt className="text-text-muted">Roles staffed</dt>
                <dd>
                  {insightsBody?.coverage.rolesStaffed ?? 0}/{insightsBody?.coverage.rolesTotal ?? 0}
                </dd>
              </div>
            </dl>
          </Card>
          <Card>
            <h3 className="font-semibold text-text">Issues</h3>
            <ul className="mt-3 space-y-2">
              {(insightsBody?.issues ?? []).slice(0, 12).map((issue) => (
                <li key={issue.id} className="rounded-md border border-border p-2 text-sm">
                  <span
                    className={`mr-2 text-[10px] font-semibold uppercase ${
                      issue.severity === 'high'
                        ? 'text-status-gap'
                        : issue.severity === 'medium'
                          ? 'text-status-partial'
                          : 'text-text-muted'
                    }`}
                  >
                    {issue.severity}
                  </span>
                  {issue.title}
                  <p className="mt-1 text-text-muted">{issue.description}</p>
                </li>
              ))}
              {!insightsBody?.issues.length && (
                <li className="text-sm text-text-muted">No issues detected yet.</li>
              )}
            </ul>
          </Card>
        </div>
      )}

      {mainView === 'history' && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <h3 className="font-semibold text-text">Activity</h3>
            <ul className="mt-3 space-y-2 text-sm">
              {(activityQ.data ?? []).map((a) => (
                <li key={a.id} className="flex justify-between gap-2 border-b border-border py-2">
                  <span>
                    <strong>{a.action}</strong>
                    {a.target ? ` · ${a.target}` : ''}
                  </span>
                  <span className="text-text-muted">{new Date(a.createdAt).toLocaleString()}</span>
                </li>
              ))}
            </ul>
          </Card>
          {!engagementId && (
            <Card>
              <h3 className="font-semibold text-text">Snapshots & share</h3>
              <form
                className="mt-3 flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!snapshotName.trim()) return;
                  createSnapshot.mutate({ name: snapshotName.trim() });
                }}
              >
                <input
                  className="flex-1 rounded-md border border-border px-2 py-1 text-sm"
                  placeholder="Snapshot name"
                  value={snapshotName}
                  onChange={(e) => setSnapshotName(e.target.value)}
                />
                <Button size="sm" type="submit">
                  Save
                </Button>
              </form>
              <ul className="mt-3 space-y-2 text-sm">
                {(snapshotsQ.data ?? []).map((s) => (
                  <li key={s.id} className="flex items-center justify-between gap-2">
                    <span>{s.name}</span>
                    <Button size="sm" variant="secondary" onClick={() => restoreSnapshot.mutate({ id: s.id })}>
                      Restore
                    </Button>
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => createShare.mutate({ name: 'Org design share' })}
                >
                  <Link2 className="h-4 w-4" /> Create share link
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={async () => {
                    const data = await utils.orgDesign.exportJson.fetch();
                    const blob = new Blob([JSON.stringify(data, null, 2)], {
                      type: 'application/json',
                    });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'org-design.json';
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                >
                  <Download className="h-4 w-4" /> Export JSON
                </Button>
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-border px-3 py-2 text-sm">
                  <Upload className="h-4 w-4" /> Import JSON
                  <input
                    type="file"
                    accept="application/json"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const text = await file.text();
                      const parsed = JSON.parse(text) as {
                        entities: unknown[];
                        relationships: unknown[];
                        people?: unknown[];
                        assignments?: unknown[];
                      };
                      importJson.mutate({ ...parsed, replace: true });
                    }}
                  />
                </label>
              </div>
              <ul className="mt-3 space-y-1 text-xs text-text-muted">
                {(shareLinksQ.data ?? []).map((l) => (
                  <li key={l.id}>
                    /share/design/{l.token}
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      )}

      {showEntityForm && canWrite && (
        <Modal title="Add entity" onClose={() => setShowEntityForm(false)}>
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              createEntity.mutate({
                name: entityDraft.name,
                type: entityDraft.type,
                purpose: entityDraft.purpose || null,
                domain: entityDraft.domain || null,
                accountabilities: entityDraft.accountabilities
                  .split('\n')
                  .map((s) => s.trim())
                  .filter(Boolean),
              });
            }}
          >
            <Field label="Name">
              <input
                required
                className="w-full rounded-md border border-border px-2 py-1.5 text-sm"
                value={entityDraft.name}
                onChange={(e) => setEntityDraft((d) => ({ ...d, name: e.target.value }))}
              />
            </Field>
            <Field label="Type">
              <select
                className="w-full rounded-md border border-border px-2 py-1.5 text-sm"
                value={entityDraft.type}
                onChange={(e) =>
                  setEntityDraft((d) => ({
                    ...d,
                    type: e.target.value as typeof entityDraft.type,
                  }))
                }
              >
                <option value="circle">Circle</option>
                <option value="role">Role</option>
                <option value="product">Product</option>
              </select>
            </Field>
            <Field label="Purpose">
              <textarea
                className="w-full rounded-md border border-border px-2 py-1.5 text-sm"
                rows={2}
                value={entityDraft.purpose}
                onChange={(e) => setEntityDraft((d) => ({ ...d, purpose: e.target.value }))}
              />
            </Field>
            <Field label="Domain">
              <input
                className="w-full rounded-md border border-border px-2 py-1.5 text-sm"
                value={entityDraft.domain}
                onChange={(e) => setEntityDraft((d) => ({ ...d, domain: e.target.value }))}
              />
            </Field>
            <Field label="Accountabilities (one per line)">
              <textarea
                className="w-full rounded-md border border-border px-2 py-1.5 text-sm"
                rows={3}
                value={entityDraft.accountabilities}
                onChange={(e) =>
                  setEntityDraft((d) => ({ ...d, accountabilities: e.target.value }))
                }
              />
            </Field>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={() => setShowEntityForm(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createEntity.isPending}>
                Create
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {showRelForm && canWrite && (
        <Modal title="Add relationship" onClose={() => setShowRelForm(false)}>
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              createRel.mutate(relDraft);
            }}
          >
            <Field label="Source">
              <select
                required
                className="w-full rounded-md border border-border px-2 py-1.5 text-sm"
                value={relDraft.sourceId}
                onChange={(e) => setRelDraft((d) => ({ ...d, sourceId: e.target.value }))}
              >
                <option value="">Select…</option>
                {entities.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Target">
              <select
                required
                className="w-full rounded-md border border-border px-2 py-1.5 text-sm"
                value={relDraft.targetId}
                onChange={(e) => setRelDraft((d) => ({ ...d, targetId: e.target.value }))}
              >
                <option value="">Select…</option>
                {entities.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Type">
              <select
                className="w-full rounded-md border border-border px-2 py-1.5 text-sm"
                value={relDraft.type}
                onChange={(e) =>
                  setRelDraft((d) => ({
                    ...d,
                    type: e.target.value as typeof relDraft.type,
                  }))
                }
              >
                <option value="includes">includes</option>
                <option value="reports-to">reports-to</option>
                <option value="collaborates-with">collaborates-with</option>
              </select>
            </Field>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={() => setShowRelForm(false)}>
                Cancel
              </Button>
              <Button type="submit">Create</Button>
            </div>
          </form>
        </Modal>
      )}

      {showTemplates && (
        <Modal title="GDS templates" onClose={() => setShowTemplates(false)} wide>
          <div className="mb-3 flex flex-wrap gap-2">
            <button
              type="button"
              className={`rounded-md px-2 py-1 text-xs ${templateCategory === 'all' ? 'bg-brand text-text-inverse' : 'border border-border'}`}
              onClick={() => setTemplateCategory('all')}
            >
              All
            </button>
            {TEMPLATE_CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                className={`rounded-md px-2 py-1 text-xs ${templateCategory === c ? 'bg-brand text-text-inverse' : 'border border-border'}`}
                onClick={() => setTemplateCategory(c)}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {(templatesQ.data ?? [])
              .filter((t) => templateCategory === 'all' || t.category === templateCategory)
              .map((t) => (
                <div key={t.id} className="rounded-md border border-border p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-text">{t.name}</p>
                      <p className="text-xs text-text-muted">
                        {t.category} · {t.size}
                      </p>
                    </div>
                    <span className="text-[10px] uppercase text-text-muted">{t.entityCount} entities</span>
                  </div>
                  <p className="mt-2 text-sm text-text-muted">{t.description}</p>
                  <Button
                    size="sm"
                    className="mt-3"
                    disabled={applyTemplate.isPending}
                    onClick={() =>
                      applyTemplate.mutate({
                        templateId: t.id,
                        replace: entities.length > 0,
                      })
                    }
                  >
                    Use template{entities.length > 0 ? ' (replace live)' : ''}
                  </Button>
                </div>
              ))}
          </div>
        </Modal>
      )}

      {showScenarios && (
        <Modal title="Scenarios" onClose={() => setShowScenarios(false)}>
          <form
            className="mb-4 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (!scenarioName.trim()) return;
              createScenario.mutate({ name: scenarioName.trim() });
            }}
          >
            <input
              className="flex-1 rounded-md border border-border px-2 py-1.5 text-sm"
              placeholder="New scenario name"
              value={scenarioName}
              onChange={(e) => setScenarioName(e.target.value)}
            />
            <Button size="sm" type="submit">
              Fork live
            </Button>
          </form>
          <ul className="space-y-2">
            {(scenariosQ.data ?? []).map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-2 rounded-md border border-border p-2 text-sm">
                <span>
                  <strong>{s.name}</strong>
                  {s.engagementId ? (
                    <span className="ml-2 text-xs text-text-muted">engagement-linked</span>
                  ) : null}
                </span>
                <Button size="sm" variant="secondary" onClick={() => promoteScenario.mutate({ id: s.id })}>
                  Promote to live
                </Button>
              </li>
            ))}
          </ul>
        </Modal>
      )}
    </div>
  );
}

function EmptyState({ onTemplates, canWrite }: { onTemplates: () => void; canWrite: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <Network className="h-10 w-10 text-brand" />
      <p className="max-w-md text-sm text-text-muted">
        Start from a GDS service-team template to design your digital organisation for Service Standard
        readiness.
      </p>
      {canWrite && (
        <Button onClick={onTemplates}>
          <Sparkles className="h-4 w-4" /> Browse templates
        </Button>
      )}
    </div>
  );
}

function SyncToTeamButton({
  engagementId,
  onSync,
  pending,
}: {
  engagementId: string;
  onSync: (requirementId: string) => void;
  pending: boolean;
}) {
  const { data } = trpc.engagement.byId.useQuery({ id: engagementId });
  const reqId = data?.requirements[0]?.id;
  return (
    <Button
      size="sm"
      variant="secondary"
      disabled={!reqId || pending}
      onClick={() => reqId && onSync(reqId)}
    >
      Sync structure to Team
    </Button>
  );
}

function Modal({
  title,
  onClose,
  children,
  wide,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal>
      <div
        className={`max-h-[90vh] overflow-y-auto rounded-lg border border-border bg-surface p-4 shadow-lg ${
          wide ? 'w-full max-w-3xl' : 'w-full max-w-lg'
        }`}
      >
        <div className="mb-3 flex items-center justify-between gap-2">
          <h3 className="text-lg font-semibold text-text">{title}</h3>
          <Button variant="tertiary" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block text-text-muted">{label}</span>
      {children}
    </label>
  );
}
