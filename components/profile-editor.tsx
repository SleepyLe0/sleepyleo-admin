"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Save, Loader2 } from "lucide-react";

interface TimelineItem {
  year: string;
  event: string;
}

interface ProfileData {
  id?: string;
  name: string;
  bio: string;
  background: string;
  education: string;
  location: string;
  focus: string;
  fuel: string;
  timeline: TimelineItem[];
  availableForHire: boolean;
  availableLabel: string;
  email: string;
  github: string;
  linkedin: string;
  ctaCopy: string;
}

const defaultProfile: ProfileData = {
  name: "",
  bio: "",
  background: "",
  education: "",
  location: "",
  focus: "",
  fuel: "",
  timeline: [],
  availableForHire: true,
  availableLabel: "Open to opportunities",
  email: "",
  github: "SleepyLe0",
  linkedin: "kundids-khawmeesri-90814526a",
  ctaCopy: "Let's build something.",
};

function Field({
  label,
  value,
  onChange,
  multiline = false,
  placeholder = "",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  placeholder?: string;
}) {
  const baseClass =
    "w-full rounded-xl border border-neutral-800 bg-neutral-900/50 px-4 py-2.5 text-sm text-white placeholder:text-neutral-600 focus:border-indigo-500/50 focus:outline-none focus:ring-1 focus:ring-indigo-500/30 transition-colors";

  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-neutral-400 uppercase tracking-wider">
        {label}
      </label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className={`${baseClass} resize-none`}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={baseClass}
        />
      )}
    </div>
  );
}

export function ProfileEditor() {
  const [profile, setProfile] = useState<ProfileData>(defaultProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.data) {
          const p = data.data;
          setProfile({
            ...p,
            timeline: Array.isArray(p.timeline) ? p.timeline : [],
          });
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const set = <K extends keyof ProfileData>(key: K, value: ProfileData[K]) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
  };

  const addTimelineItem = () => {
    set("timeline", [...profile.timeline, { year: "", event: "" }]);
  };

  const removeTimelineItem = (i: number) => {
    set("timeline", profile.timeline.filter((_, idx) => idx !== i));
  };

  const updateTimelineItem = (i: number, field: keyof TimelineItem, value: string) => {
    const updated = profile.timeline.map((item, idx) =>
      idx === i ? { ...item, [field]: value } : item
    );
    set("timeline", updated);
  };

  const handleSave = async () => {
    setSaving(true);
    setStatus(null);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStatus({ type: "success", message: "Profile saved!" });
        if (data.data?.id && !profile.id) {
          set("id", data.data.id);
        }
      } else {
        setStatus({ type: "error", message: data.error || "Failed to save" });
      }
    } catch {
      setStatus({ type: "error", message: "Network error" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-neutral-500">
        <Loader2 className="h-5 w-5 animate-spin mr-2" />
        Loading profile...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Basic info */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/30 p-6 flex flex-col gap-4">
        <h2 className="text-sm font-semibold text-white uppercase tracking-wider">Basic Info</h2>
        <Field label="Name" value={profile.name} onChange={(v) => set("name", v)} placeholder="SleepyLeo" />
        <Field label="Bio" value={profile.bio} onChange={(v) => set("bio", v)} multiline placeholder="A short intro..." />
        <Field label="Background" value={profile.background} onChange={(v) => set("background", v)} multiline placeholder="Longer story..." />
      </div>

      {/* Details */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/30 p-6 flex flex-col gap-4">
        <h2 className="text-sm font-semibold text-white uppercase tracking-wider">Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Education" value={profile.education} onChange={(v) => set("education", v)} placeholder="King Mongkut's University..." />
          <Field label="Location" value={profile.location} onChange={(v) => set("location", v)} placeholder="Bangkok, Thailand" />
          <Field label="Currently Focused On" value={profile.focus} onChange={(v) => set("focus", v)} placeholder="Full-stack dev..." />
          <Field label="Runs On" value={profile.fuel} onChange={(v) => set("fuel", v)} placeholder="Coffee + anxiety" />
        </div>
      </div>

      {/* Contact links */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/30 p-6 flex flex-col gap-4">
        <h2 className="text-sm font-semibold text-white uppercase tracking-wider">Contact Links</h2>
        <Field label="Email" value={profile.email} onChange={(v) => set("email", v)} placeholder="you@example.com" />
        <Field label="GitHub username" value={profile.github} onChange={(v) => set("github", v)} placeholder="SleepyLe0" />
        <Field label="LinkedIn handle" value={profile.linkedin} onChange={(v) => set("linkedin", v)} placeholder="kundids-khawmeesri-90814526a" />
        <Field label="CTA Copy" value={profile.ctaCopy} onChange={(v) => set("ctaCopy", v)} placeholder="Let's build something." />
      </div>

      {/* Availability */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/30 p-6 flex flex-col gap-4">
        <h2 className="text-sm font-semibold text-white uppercase tracking-wider">Availability</h2>
        <label className="flex items-center gap-3 cursor-pointer">
          <button
            type="button"
            role="switch"
            aria-checked={profile.availableForHire}
            onClick={() => set("availableForHire", !profile.availableForHire)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${profile.availableForHire ? "bg-green-500" : "bg-neutral-700"}`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${profile.availableForHire ? "translate-x-6" : "translate-x-1"}`}
            />
          </button>
          <span className="text-sm text-neutral-300">Available for hire</span>
        </label>
        <Field
          label="Availability label"
          value={profile.availableLabel}
          onChange={(v) => set("availableLabel", v)}
          placeholder="Open to opportunities"
        />
      </div>

      {/* Timeline */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/30 p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider">Timeline</h2>
          <button
            onClick={addTimelineItem}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-neutral-300 hover:border-indigo-500/50 hover:text-white transition-all"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Event
          </button>
        </div>

        {profile.timeline.length === 0 && (
          <p className="text-sm text-neutral-600">No timeline events yet. Click &quot;Add Event&quot; to start.</p>
        )}

        <div className="flex flex-col gap-3">
          {profile.timeline.map((item, i) => (
            <div key={i} className="flex items-start gap-3">
              <input
                type="text"
                value={item.year}
                onChange={(e) => updateTimelineItem(i, "year", e.target.value)}
                placeholder="2024"
                className="w-20 rounded-lg border border-neutral-800 bg-neutral-900/50 px-3 py-2 text-sm text-white placeholder:text-neutral-600 focus:border-indigo-500/50 focus:outline-none focus:ring-1 focus:ring-indigo-500/30 transition-colors"
              />
              <input
                type="text"
                value={item.event}
                onChange={(e) => updateTimelineItem(i, "event", e.target.value)}
                placeholder="Event description..."
                className="flex-1 rounded-lg border border-neutral-800 bg-neutral-900/50 px-3 py-2 text-sm text-white placeholder:text-neutral-600 focus:border-indigo-500/50 focus:outline-none focus:ring-1 focus:ring-indigo-500/30 transition-colors"
              />
              <button
                onClick={() => removeTimelineItem(i)}
                className="mt-0.5 rounded-lg border border-neutral-800 p-2 text-neutral-500 hover:border-red-500/50 hover:text-red-400 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Save button */}
      <div className="flex items-center justify-between">
        {status && (
          <p className={`text-sm ${status.type === "success" ? "text-green-400" : "text-red-400"}`}>
            {status.message}
          </p>
        )}
        <button
          onClick={handleSave}
          disabled={saving}
          className="ml-auto inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white transition-all hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? "Saving..." : "Save Profile"}
        </button>
      </div>
    </div>
  );
}
