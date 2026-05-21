"use client";

import {
  BookOpen,
  CalendarClock,
  FileUp,
  Leaf,
  LogOut,
  Mic,
  NotebookPen,
  PenLine,
  Plus,
  Sparkles,
  Trophy,
} from "lucide-react";
import { useMemo, useState } from "react";

import { signOut } from "@/app/actions";
import {
  createActivity,
  createAward,
  createGoal,
  createNote,
  createTask,
  uploadDocument,
} from "@/app/dashboard/actions";
import { ChatPanel } from "@/components/chat-panel";
import { VoicePanel } from "@/components/voice-panel";
import type { Activity, Award, Goal, Note, StudentTask } from "@/lib/types";
import { formatDate } from "@/lib/utils";

type Tab = "overview" | "activities" | "awards" | "notes" | "timeline";

type AlmanacWorkspaceProps = {
  userEmail: string | null;
  notes: Note[];
  goals: Goal[];
  tasks: StudentTask[];
  activities: Activity[];
  awards: Award[];
};

const palette = {
  paper: "#ECE6E0",
  paperDeep: "#DFD7CF",
  ink: "#1F2433",
  inkSoft: "rgba(31,36,51,0.64)",
  inkFaint: "rgba(31,36,51,0.16)",
  rule: "rgba(31,36,51,0.11)",
  olive: "#3F4A66",
  sage: "#7A86A8",
  clay: "#C97A5D",
  butter: "#E0B26B",
};

const nav = [
  { id: "overview", label: "Almanac", icon: BookOpen },
  { id: "activities", label: "Activities", icon: Leaf },
  { id: "awards", label: "Awards", icon: Trophy },
  { id: "notes", label: "Notes", icon: NotebookPen },
  { id: "timeline", label: "Timeline", icon: CalendarClock },
] satisfies Array<{ id: Tab; label: string; icon: typeof BookOpen }>;

export function AlmanacWorkspace({
  userEmail,
  notes,
  goals,
  tasks,
  activities,
  awards,
}: AlmanacWorkspaceProps) {
  const [tab, setTab] = useState<Tab>("overview");
  const [voiceOpen, setVoiceOpen] = useState(false);
  const firstName = getDisplayName(userEmail);

  const rings = [
    {
      label: "Explore",
      count: activities.length,
      goal: 8,
      color: palette.olive,
      note: "activities & experiences",
    },
    {
      label: "Distinguish",
      count: awards.length,
      goal: 6,
      color: palette.clay,
      note: "awards & leadership",
    },
    {
      label: "Reflect",
      count: notes.length,
      goal: 12,
      color: palette.butter,
      note: "essays & journal entries",
    },
  ];

  const depth = Math.round(
    (rings.reduce((sum, ring) => sum + Math.min(ring.count / ring.goal, 1), 0) /
      rings.length) *
      100,
  );

  const recent = useMemo(
    () =>
      [
        ...notes.map((item) => ({
          id: item.id,
          date: item.created_at,
          kind: item.category || "Note",
          title: item.title,
          detail: item.body,
          color: palette.butter,
        })),
        ...activities.map((item) => ({
          id: item.id,
          date: item.created_at,
          kind: "Activity",
          title: item.name,
          detail: [item.role, item.years].filter(Boolean).join(" - "),
          color: palette.olive,
        })),
        ...awards.map((item) => ({
          id: item.id,
          date: item.created_at,
          kind: "Award",
          title: item.name,
          detail: [item.scope, item.year].filter(Boolean).join(" - "),
          color: palette.clay,
        })),
      ]
        .sort((a, b) => Date.parse(b.date) - Date.parse(a.date))
        .slice(0, 5),
    [activities, awards, notes],
  );

  return (
    <main
      className="min-h-screen overflow-hidden text-[color:var(--almanac-ink)]"
      style={
        {
          "--almanac-paper": palette.paper,
          "--almanac-paper-deep": palette.paperDeep,
          "--almanac-ink": palette.ink,
          "--almanac-ink-soft": palette.inkSoft,
          "--almanac-rule": palette.rule,
          "--almanac-olive": palette.olive,
          "--almanac-sage": palette.sage,
          "--almanac-clay": palette.clay,
          "--almanac-butter": palette.butter,
          backgroundColor: palette.paper,
          backgroundImage: `radial-gradient(${palette.inkFaint} 0.6px, transparent 0.6px), radial-gradient(${palette.inkFaint} 0.5px, transparent 0.5px)`,
          backgroundPosition: "0 0, 7px 11px",
          backgroundSize: "14px 14px, 22px 22px",
        } as React.CSSProperties
      }
    >
      <div className="flex min-h-screen">
        <aside className="hidden w-64 shrink-0 flex-col border-r border-[color:var(--almanac-rule)] bg-black/[0.018] px-6 py-7 lg:flex">
          <Brand />
          <nav className="mt-10 grid gap-1">
            {nav.map((item) => {
              const active = tab === item.id;
              return (
                <button
                  className={[
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition",
                    active
                      ? "bg-[color:var(--almanac-ink)] text-[color:var(--almanac-paper)]"
                      : "text-[color:var(--almanac-ink)] hover:bg-black/[0.035]",
                  ].join(" ")}
                  key={item.id}
                  onClick={() => setTab(item.id)}
                  type="button"
                >
                  <item.icon
                    className={active ? "text-[color:var(--almanac-paper)]" : "text-[color:var(--almanac-ink-soft)]"}
                    size={16}
                  />
                  {item.label}
                </button>
              );
            })}
          </nav>

          <button
            className="mt-auto flex items-center gap-3 rounded-lg border border-[color:var(--almanac-rule)] bg-[color:var(--almanac-paper-deep)] p-3 text-left text-sm"
            onClick={() => setVoiceOpen(true)}
            type="button"
          >
            <span className="flex size-9 items-center justify-center rounded-full bg-[color:var(--almanac-clay)] text-[color:var(--almanac-paper)]">
              <Mic size={16} />
            </span>
            <span>
              <span className="block font-medium">Talk to your counsellor</span>
              <span className="block text-xs uppercase tracking-[0.12em] text-[color:var(--almanac-ink-soft)]">
                voice · always on
              </span>
            </span>
          </button>

          <div className="mt-6 flex items-center gap-3 px-1">
            <Avatar email={userEmail} />
            <div className="min-w-0 text-sm">
              <p className="truncate font-medium">{firstName}</p>
              <p className="truncate text-xs text-[color:var(--almanac-ink-soft)]">
                {userEmail}
              </p>
            </div>
          </div>
        </aside>

        <section className="flex min-w-0 flex-1 flex-col">
          <MobileBar tab={tab} setTab={setTab} onVoice={() => setVoiceOpen(true)} />
          {tab === "overview" ? (
            <Overview
              depth={depth}
              firstName={firstName}
              goals={goals}
              onVoice={() => setVoiceOpen(true)}
              recent={recent}
              rings={rings}
              tasks={tasks}
            />
          ) : null}
          {tab === "activities" ? <ActivitiesView activities={activities} /> : null}
          {tab === "awards" ? <AwardsView awards={awards} /> : null}
          {tab === "notes" ? <NotesView notes={notes} /> : null}
          {tab === "timeline" ? (
            <TimelineView activities={activities} awards={awards} notes={notes} />
          ) : null}
        </section>
      </div>

      {voiceOpen ? <VoiceOverlay onClose={() => setVoiceOpen(false)} /> : null}
    </main>
  );
}

function Overview({
  depth,
  firstName,
  goals,
  onVoice,
  recent,
  rings,
  tasks,
}: {
  depth: number;
  firstName: string;
  goals: Goal[];
  onVoice: () => void;
  recent: Array<{
    id: string;
    date: string;
    kind: string;
    title: string;
    detail: string | null;
    color: string;
  }>;
  rings: Array<{
    label: string;
    count: number;
    goal: number;
    color: string;
    note: string;
  }>;
  tasks: StudentTask[];
}) {
  return (
    <Scrollable>
      <PageHeader
        action={
          <button
            className="inline-flex h-11 items-center gap-2 rounded-full bg-[color:var(--almanac-ink)] px-4 text-sm font-medium text-[color:var(--almanac-paper)]"
            onClick={onVoice}
            type="button"
          >
            <Mic size={16} />
            Voice mode
          </button>
        }
        eyebrow="Spring 2026 · Week 14"
        subtitle="Three things on your plate this week: an essay seed, a recommendation follow-up, and one clearer activity story."
        title={
          <>
            Good evening,{" "}
            <em className="font-serif italic text-[color:var(--almanac-olive)]">
              {firstName}
            </em>
            .
          </>
        }
      />

      <div className="grid gap-5 px-5 py-6 md:px-9 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-2xl border border-[color:var(--almanac-rule)] bg-[color:var(--almanac-paper-deep)] p-5 md:p-6 xl:col-span-2">
          <div className="grid items-center gap-7 md:grid-cols-[15rem_1fr]">
            <div className="relative mx-auto size-56">
              <ProgressRings rings={rings} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="font-serif text-4xl leading-none">{depth}%</p>
                <p className="mt-1 text-[0.65rem] uppercase tracking-[0.18em] text-[color:var(--almanac-ink-soft)]">
                  profile depth
                </p>
              </div>
            </div>
            <div>
              <SectionKicker>Your rings</SectionKicker>
              <div className="mt-4 grid gap-4">
                {rings.map((ring) => (
                  <div className="flex items-center gap-4" key={ring.label}>
                    <span
                      className="size-2.5 rounded-full"
                      style={{ backgroundColor: ring.color }}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-3">
                        <p className="font-serif text-2xl italic">{ring.label}</p>
                        <p className="text-xs text-[color:var(--almanac-ink-soft)]">
                          {ring.count} of {ring.goal} · {ring.note}
                        </p>
                      </div>
                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-black/10">
                        <div
                          className="h-full rounded-full"
                          style={{
                            backgroundColor: ring.color,
                            width: `${Math.min((ring.count / ring.goal) * 100, 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-[color:var(--almanac-rule)] bg-[color:var(--almanac-paper)] p-5 md:p-6">
          <SectionKicker>Next moves</SectionKicker>
          <div className="mt-4 grid gap-3">
            {tasks.slice(0, 4).map((task) => (
              <TaskRow key={task.id} task={task} />
            ))}
            {!tasks.length ? <Empty label="No tasks yet." /> : null}
          </div>
        </section>

        <section className="rounded-2xl border border-[color:var(--almanac-rule)] bg-[color:var(--almanac-paper)] p-5 md:p-6">
          <SectionKicker>Goals</SectionKicker>
          <div className="mt-4 grid gap-3">
            {goals.slice(0, 4).map((goal) => (
              <div
                className="border-l-4 border-[color:var(--almanac-clay)] bg-[color:var(--almanac-paper-deep)] px-4 py-3 text-sm"
                key={goal.id}
              >
                <p className="font-medium">{goal.title}</p>
                <p className="mt-1 text-xs text-[color:var(--almanac-ink-soft)]">
                  Target: {formatDate(goal.target_date)}
                </p>
              </div>
            ))}
            {!goals.length ? <Empty label="No goals yet." /> : null}
          </div>
        </section>

        <QuickCapture />

        <section className="rounded-2xl border border-[color:var(--almanac-rule)] bg-[color:var(--almanac-paper)] p-5 md:p-6 xl:col-span-2">
          <div className="flex items-baseline justify-between gap-4">
            <SectionKicker>Recently entered</SectionKicker>
            <span className="text-xs text-[color:var(--almanac-ink-soft)]">
              latest workspace records
            </span>
          </div>
          <div className="mt-3 divide-y divide-[color:var(--almanac-rule)]">
            {recent.map((row) => (
              <article
                className="grid gap-2 py-4 sm:grid-cols-[5rem_7rem_1fr]"
                key={`${row.kind}-${row.id}`}
              >
                <p className="font-serif italic text-[color:var(--almanac-ink-soft)]">
                  {shortDate(row.date)}
                </p>
                <p className="flex items-center gap-2 text-[0.68rem] uppercase tracking-[0.14em] text-[color:var(--almanac-ink-soft)]">
                  <span
                    className="size-2 rounded-full"
                    style={{ backgroundColor: row.color }}
                  />
                  {row.kind}
                </p>
                <div>
                  <p className="text-sm font-medium">{row.title}</p>
                  {row.detail ? (
                    <p className="mt-1 line-clamp-1 text-xs text-[color:var(--almanac-ink-soft)]">
                      {row.detail}
                    </p>
                  ) : null}
                </div>
              </article>
            ))}
            {!recent.length ? <Empty label="Add your first record to begin." /> : null}
          </div>
        </section>

        <section className="rounded-2xl border border-[color:var(--almanac-rule)] bg-[color:var(--almanac-paper)] p-5 md:p-6 xl:col-span-2">
          <SectionKicker>AI chat counsellor</SectionKicker>
          <div className="mt-4">
            <ChatPanel variant="almanac" />
          </div>
        </section>
      </div>
    </Scrollable>
  );
}

function ActivitiesView({ activities }: { activities: Activity[] }) {
  return (
    <Scrollable>
      <PageHeader
        action={<AddButton label="Add activity" />}
        eyebrow={`${activities.length} logged`}
        subtitle="What you have done, where, for how long, and what changed because you were there."
        title={
          <>
            Your{" "}
            <em className="font-serif italic text-[color:var(--almanac-olive)]">
              activities
            </em>
          </>
        }
      />
      <div className="grid gap-4 px-5 py-6 md:px-9">
        <InlineActivityForm />
        {activities.map((activity) => (
          <article
            className="grid gap-5 rounded-xl border border-[color:var(--almanac-rule)] bg-[color:var(--almanac-paper)] p-5 md:grid-cols-[1fr_8rem_8rem]"
            key={activity.id}
          >
            <div>
              <p className="text-[0.68rem] uppercase tracking-[0.16em] text-[color:var(--almanac-ink-soft)]">
                Experience
              </p>
              <h2 className="mt-2 font-serif text-2xl leading-tight">
                {activity.name}
              </h2>
              <p className="mt-1 text-sm text-[color:var(--almanac-ink-soft)]">
                {activity.role || "Role not set"}
              </p>
              {activity.impact ? (
                <p className="mt-3 text-sm leading-6">{activity.impact}</p>
              ) : null}
            </div>
            <Metric label="Years" value={activity.years || "—"} />
            <Metric label="Added" value={shortDate(activity.created_at)} />
          </article>
        ))}
        {!activities.length ? <Empty label="No activities yet." /> : null}
      </div>
    </Scrollable>
  );
}

function AwardsView({ awards }: { awards: Award[] }) {
  return (
    <Scrollable>
      <PageHeader
        action={<AddButton label="Add award" tone="clay" />}
        eyebrow={`${awards.length} logged`}
        subtitle="Honors, recognitions, and distinctions. Tag scope so the story balances local, regional, and national signals."
        title={
          <>
            Your{" "}
            <em className="font-serif italic text-[color:var(--almanac-clay)]">
              awards
            </em>
          </>
        }
      />
      <div className="grid gap-4 px-5 py-6 md:grid-cols-2 md:px-9 xl:grid-cols-3">
        <InlineAwardForm />
        {awards.map((award) => (
          <article
            className="relative min-h-44 overflow-hidden rounded-2xl border border-[color:var(--almanac-rule)] bg-[color:var(--almanac-paper)] p-5"
            key={award.id}
          >
            <div className="absolute -right-8 -top-8 size-28 rounded-full bg-[color:var(--almanac-paper-deep)]" />
            <div className="relative">
              <span className="flex size-10 items-center justify-center rounded-full bg-[color:var(--almanac-clay)] text-[color:var(--almanac-paper)]">
                <Trophy size={19} />
              </span>
              <p className="mt-5 text-[0.68rem] uppercase tracking-[0.16em] text-[color:var(--almanac-ink-soft)]">
                {[award.scope, award.year].filter(Boolean).join(" · ") || "Award"}
              </p>
              <h2 className="mt-2 font-serif text-2xl leading-tight">
                {award.name}
              </h2>
            </div>
          </article>
        ))}
        {!awards.length ? <Empty label="No awards yet." /> : null}
      </div>
    </Scrollable>
  );
}

function NotesView({ notes }: { notes: Note[] }) {
  const [activeId, setActiveId] = useState(notes[0]?.id ?? "");
  const active = notes.find((note) => note.id === activeId) ?? notes[0];

  return (
    <Scrollable>
      <PageHeader
        action={<AddButton label="New entry" tone="ink" />}
        eyebrow={`Journal · ${notes.length} entries`}
        subtitle="Counsellor sessions, reflections, and research notes become essay seeds here."
        title={
          <>
            Your{" "}
            <em className="font-serif italic text-[color:var(--almanac-butter)]">
              notes
            </em>
          </>
        }
      />
      <div className="grid gap-5 px-5 py-6 md:px-9 xl:grid-cols-[22rem_1fr]">
        <InlineNoteForm />
        <div className="grid gap-3 xl:col-start-1">
          {notes.map((note) => {
            const activeNote = note.id === active?.id;
            return (
              <button
                className={[
                  "rounded-xl border p-4 text-left transition",
                  activeNote
                    ? "border-[color:var(--almanac-ink)] bg-[color:var(--almanac-paper-deep)]"
                    : "border-[color:var(--almanac-rule)] bg-[color:var(--almanac-paper)] hover:bg-[color:var(--almanac-paper-deep)]",
                ].join(" ")}
                key={note.id}
                onClick={() => setActiveId(note.id)}
                type="button"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-[0.68rem] uppercase tracking-[0.16em] text-[color:var(--almanac-ink-soft)]">
                    {note.category}
                  </span>
                  <span className="font-serif italic text-[color:var(--almanac-ink-soft)]">
                    {shortDate(note.created_at)}
                  </span>
                </div>
                <p className="mt-2 font-serif text-xl leading-tight">{note.title}</p>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-[color:var(--almanac-ink-soft)]">
                  {note.body}
                </p>
              </button>
            );
          })}
          {!notes.length ? <Empty label="No notes yet." /> : null}
        </div>
        <article className="min-h-96 rounded-2xl border border-[color:var(--almanac-rule)] bg-[color:var(--almanac-paper)] p-6 md:p-8 xl:row-span-2 xl:row-start-1">
          {active ? (
            <>
              <p className="text-[0.68rem] uppercase tracking-[0.16em] text-[color:var(--almanac-ink-soft)]">
                {active.category} · {shortDate(active.created_at)}
              </p>
              <h2 className="mt-3 font-serif text-4xl leading-tight">
                {active.title}
              </h2>
              <p className="mt-6 whitespace-pre-wrap text-[0.96rem] leading-8">
                {active.body}
              </p>
            </>
          ) : (
            <Empty label="Select or add a note." />
          )}
        </article>
      </div>
    </Scrollable>
  );
}

function TimelineView({
  activities,
  awards,
  notes,
}: {
  activities: Activity[];
  awards: Award[];
  notes: Note[];
}) {
  const items = [
    ...activities.map((item) => ({
      id: item.id,
      date: item.created_at,
      kind: "activity",
      title: item.name,
      color: palette.olive,
    })),
    ...awards.map((item) => ({
      id: item.id,
      date: item.created_at,
      kind: "award",
      title: item.name,
      color: palette.clay,
    })),
    ...notes.map((item) => ({
      id: item.id,
      date: item.created_at,
      kind: item.category,
      title: item.title,
      color: palette.butter,
    })),
  ].sort((a, b) => Date.parse(b.date) - Date.parse(a.date));

  return (
    <Scrollable>
      <PageHeader
        eyebrow="grades 9 → 12"
        subtitle="Four years on a single page. The shape of the story you will tell."
        title={
          <>
            Your{" "}
            <em className="font-serif italic text-[color:var(--almanac-sage)]">
              timeline
            </em>
          </>
        }
      />
      <div className="px-5 py-8 md:px-9">
        <div className="relative rounded-2xl border border-[color:var(--almanac-rule)] bg-[color:var(--almanac-paper)] p-6 md:p-8">
          <div className="absolute bottom-8 left-[6.15rem] top-8 hidden w-px bg-[color:var(--almanac-rule)] sm:block" />
          <div className="grid gap-5">
            {items.map((item) => (
              <article
                className="grid gap-3 sm:grid-cols-[4.5rem_1.5rem_1fr] sm:gap-5"
                key={`${item.kind}-${item.id}`}
              >
                <p className="font-serif italic text-[color:var(--almanac-ink-soft)] sm:text-right">
                  {shortDate(item.date)}
                </p>
                <div className="hidden justify-center pt-1 sm:flex">
                  <span
                    className="relative z-10 size-3.5 rounded-full border-2 border-[color:var(--almanac-paper)]"
                    style={{ backgroundColor: item.color }}
                  />
                </div>
                <div className="rounded-xl border border-[color:var(--almanac-rule)] bg-[color:var(--almanac-paper-deep)] px-4 py-3">
                  <p className="text-[0.68rem] uppercase tracking-[0.16em]" style={{ color: item.color }}>
                    {item.kind}
                  </p>
                  <h2 className="mt-1 font-serif text-xl leading-tight">
                    {item.title}
                  </h2>
                </div>
              </article>
            ))}
            {!items.length ? <Empty label="No timeline entries yet." /> : null}
          </div>
        </div>
      </div>
    </Scrollable>
  );
}

function QuickCapture() {
  return (
    <section className="rounded-2xl border border-[color:var(--almanac-rule)] bg-[color:var(--almanac-paper)] p-5 md:p-6 xl:col-span-2">
      <SectionKicker>Add to almanac</SectionKicker>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <InlineNoteForm />
        <InlineGoalForm />
        <InlineTaskForm />
        <InlineActivityForm />
        <InlineAwardForm />
        <DocumentForm />
      </div>
    </section>
  );
}

function InlineNoteForm() {
  return (
    <CaptureForm action={createNote} icon={<PenLine size={16} />} title="Reflection note">
      <TextInput name="title" placeholder="Title" required />
      <TextInput defaultValue="Reflection" name="category" placeholder="Category" required />
      <TextArea name="body" placeholder="What happened, why it mattered, what you learned..." required />
      <Submit>Add note</Submit>
    </CaptureForm>
  );
}

function InlineGoalForm() {
  return (
    <CaptureForm action={createGoal} icon={<Sparkles size={16} />} title="Goal">
      <TextInput name="title" placeholder="Finish first Common App essay draft" required />
      <TextInput name="target_date" type="date" />
      <Submit>Add goal</Submit>
    </CaptureForm>
  );
}

function InlineTaskForm() {
  return (
    <CaptureForm action={createTask} icon={<CalendarClock size={16} />} title="Task">
      <TextInput name="title" placeholder="Ask teacher for recommendation" required />
      <TextInput name="due_date" type="date" />
      <Submit>Add task</Submit>
    </CaptureForm>
  );
}

function InlineActivityForm() {
  return (
    <CaptureForm action={createActivity} icon={<Leaf size={16} />} title="Activity">
      <TextInput name="name" placeholder="Robotics team" required />
      <div className="grid gap-2 sm:grid-cols-2">
        <TextInput name="role" placeholder="Role" />
        <TextInput name="years" placeholder="Years active" />
      </div>
      <TextArea name="impact" placeholder="Impact, leadership, outcomes" />
      <Submit>Add activity</Submit>
    </CaptureForm>
  );
}

function InlineAwardForm() {
  return (
    <CaptureForm action={createAward} icon={<Trophy size={16} />} title="Award">
      <TextInput name="name" placeholder="National Merit Semifinalist" required />
      <div className="grid gap-2 sm:grid-cols-2">
        <TextInput name="scope" placeholder="National, regional..." />
        <TextInput name="year" placeholder="2026" />
      </div>
      <Submit>Add award</Submit>
    </CaptureForm>
  );
}

function DocumentForm() {
  return (
    <CaptureForm action={uploadDocument} icon={<FileUp size={16} />} title="Document">
      <input
        className="min-h-11 rounded-lg border border-[color:var(--almanac-rule)] bg-white/60 px-3 py-2 text-sm outline-none focus:border-[color:var(--almanac-olive)]"
        name="file"
        required
        type="file"
      />
      <Submit>Upload</Submit>
    </CaptureForm>
  );
}

function CaptureForm({
  action,
  children,
  icon,
  title,
}: {
  action: (formData: FormData) => void | Promise<void>;
  children: React.ReactNode;
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <form
      action={action}
      className="rounded-xl border border-[color:var(--almanac-rule)] bg-[color:var(--almanac-paper-deep)] p-4"
    >
      <h3 className="flex items-center gap-2 font-serif text-xl">
        <span className="flex size-8 items-center justify-center rounded-full bg-[color:var(--almanac-olive)] text-[color:var(--almanac-paper)]">
          {icon}
        </span>
        {title}
      </h3>
      <div className="mt-4 grid gap-2">{children}</div>
    </form>
  );
}

function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="h-11 rounded-lg border border-[color:var(--almanac-rule)] bg-white/60 px-3 text-sm outline-none focus:border-[color:var(--almanac-olive)]"
    />
  );
}

function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className="min-h-24 rounded-lg border border-[color:var(--almanac-rule)] bg-white/60 px-3 py-2 text-sm outline-none focus:border-[color:var(--almanac-olive)]"
    />
  );
}

function Submit({ children }: { children: React.ReactNode }) {
  return (
    <button className="mt-1 h-10 rounded-lg bg-[color:var(--almanac-ink)] px-4 text-sm font-medium text-[color:var(--almanac-paper)]">
      {children}
    </button>
  );
}

function ProgressRings({
  rings,
}: {
  rings: Array<{ count: number; goal: number; color: string }>;
}) {
  const size = 224;
  const ringWidth = 18;
  const radii = [101, 77, 53];
  return (
    <svg height={size} viewBox={`0 0 ${size} ${size}`} width={size}>
      {rings.map((ring, index) => {
        const r = radii[index];
        const circumference = 2 * Math.PI * r;
        const value = Math.min(ring.count / ring.goal, 1);
        return (
          <g key={ring.color} transform={`translate(${size / 2} ${size / 2}) rotate(-90)`}>
            <circle
              fill="none"
              r={r}
              stroke={ring.color}
              strokeOpacity="0.18"
              strokeWidth={ringWidth}
            />
            <circle
              fill="none"
              r={r}
              stroke={ring.color}
              strokeDasharray={`${circumference * value} ${circumference}`}
              strokeLinecap="round"
              strokeWidth={ringWidth}
            />
          </g>
        );
      })}
    </svg>
  );
}

function TaskRow({ task }: { task: StudentTask }) {
  return (
    <div className="rounded-xl border border-[color:var(--almanac-rule)] bg-[color:var(--almanac-paper-deep)] px-4 py-3">
      <p className="text-sm font-medium">{task.title}</p>
      <p className="mt-1 text-xs text-[color:var(--almanac-ink-soft)]">
        {task.status} · Due: {formatDate(task.due_date)}
      </p>
    </div>
  );
}

function VoiceOverlay({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[color:var(--almanac-paper)] text-[color:var(--almanac-ink)]">
      <div className="flex items-center justify-between border-b border-[color:var(--almanac-rule)] px-5 py-4 md:px-8">
        <div className="flex items-center gap-3">
          <span className="size-2.5 animate-pulse rounded-full bg-[color:var(--almanac-clay)]" />
          <div>
            <p className="font-serif text-2xl italic">voice mode</p>
            <p className="text-xs uppercase tracking-[0.16em] text-[color:var(--almanac-ink-soft)]">
              conversation with your counsellor
            </p>
          </div>
        </div>
        <button
          className="rounded-full border border-[color:var(--almanac-rule)] px-4 py-2 text-sm"
          onClick={onClose}
          type="button"
        >
          End session
        </button>
      </div>
      <div className="mx-auto flex w-full max-w-3xl flex-1 items-center px-5 py-8">
        <VoicePanel variant="almanac" />
      </div>
    </div>
  );
}

function MobileBar({
  onVoice,
  setTab,
  tab,
}: {
  onVoice: () => void;
  setTab: (tab: Tab) => void;
  tab: Tab;
}) {
  return (
    <header className="border-b border-[color:var(--almanac-rule)] px-5 py-4 lg:hidden">
      <div className="flex items-center justify-between gap-4">
        <Brand />
        <button
          className="flex size-10 items-center justify-center rounded-full bg-[color:var(--almanac-clay)] text-[color:var(--almanac-paper)]"
          onClick={onVoice}
          type="button"
        >
          <Mic size={18} />
        </button>
      </div>
      <nav className="mt-4 flex gap-2 overflow-x-auto pb-1">
        {nav.map((item) => {
          const active = tab === item.id;
          return (
            <button
              className={[
                "flex h-10 shrink-0 items-center gap-2 rounded-full px-3 text-sm",
                active
                  ? "bg-[color:var(--almanac-ink)] text-[color:var(--almanac-paper)]"
                  : "bg-[color:var(--almanac-paper-deep)] text-[color:var(--almanac-ink)]",
              ].join(" ")}
              key={item.id}
              onClick={() => setTab(item.id)}
              type="button"
            >
              <item.icon size={15} />
              {item.label}
            </button>
          );
        })}
      </nav>
    </header>
  );
}

function PageHeader({
  action,
  eyebrow,
  subtitle,
  title,
}: {
  action?: React.ReactNode;
  eyebrow: string;
  subtitle?: string;
  title: React.ReactNode;
}) {
  return (
    <header className="flex flex-col gap-5 border-b border-[color:var(--almanac-rule)] px-5 py-7 md:flex-row md:items-end md:justify-between md:px-9">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--almanac-ink-soft)]">
          {eyebrow}
        </p>
        <h1 className="mt-2 font-serif text-4xl leading-none md:text-5xl">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[color:var(--almanac-ink-soft)]">
            {subtitle}
          </p>
        ) : null}
      </div>
      <div className="flex items-center gap-3">
        {action}
        <form action={signOut}>
          <button className="inline-flex h-11 items-center gap-2 rounded-full border border-[color:var(--almanac-rule)] bg-[color:var(--almanac-paper)] px-4 text-sm font-medium">
            <LogOut size={15} />
            Sign out
          </button>
        </form>
      </div>
    </header>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-3">
      <span className="flex size-9 items-center justify-center rounded-full bg-[color:var(--almanac-ink)] font-serif text-xl italic text-[color:var(--almanac-paper)]">
        c
      </span>
      <div className="leading-none">
        <p className="font-serif text-2xl italic">almanac</p>
        <p className="mt-1 text-[0.65rem] uppercase tracking-[0.18em] text-[color:var(--almanac-ink-soft)]">
          cultvr · vol. i
        </p>
      </div>
    </div>
  );
}

function Avatar({ email }: { email: string | null }) {
  return (
    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[color:var(--almanac-sage)] text-sm font-semibold text-[color:var(--almanac-paper)]">
      {initials(email)}
    </span>
  );
}

function AddButton({
  label,
  tone = "olive",
}: {
  label: string;
  tone?: "olive" | "clay" | "ink";
}) {
  const color =
    tone === "clay"
      ? "bg-[color:var(--almanac-clay)]"
      : tone === "ink"
        ? "bg-[color:var(--almanac-ink)]"
        : "bg-[color:var(--almanac-olive)]";
  return (
    <span
      className={`inline-flex h-11 items-center gap-2 rounded-full px-4 text-sm font-medium text-[color:var(--almanac-paper)] ${color}`}
    >
      <Plus size={16} />
      {label}
    </span>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[0.68rem] uppercase tracking-[0.16em] text-[color:var(--almanac-ink-soft)]">
        {label}
      </p>
      <p className="mt-2 font-serif text-2xl">{value}</p>
    </div>
  );
}

function SectionKicker({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[0.68rem] uppercase tracking-[0.18em] text-[color:var(--almanac-ink-soft)]">
      {children}
    </p>
  );
}

function Scrollable({ children }: { children: React.ReactNode }) {
  return <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>;
}

function Empty({ label }: { label: string }) {
  return (
    <div className="rounded-xl border border-dashed border-[color:var(--almanac-rule)] p-5 text-sm text-[color:var(--almanac-ink-soft)]">
      {label}
    </div>
  );
}

function getDisplayName(email: string | null) {
  if (!email) return "Student";
  const local = email.split("@")[0] || "Student";
  return local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function initials(email: string | null) {
  const display = getDisplayName(email);
  const parts = display.split(" ").filter(Boolean);
  return (parts[0]?.[0] ?? "S") + (parts[1]?.[0] ?? "");
}

function shortDate(date: string | null) {
  if (!date) return "—";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}
