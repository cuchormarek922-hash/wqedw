"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useState, useCallback } from "react";

function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function addDays(d: Date, n: number): Date {
  const result = new Date(d);
  result.setDate(result.getDate() + n);
  return result;
}

function getWeekStart(d: Date): Date {
  const result = new Date(d);
  const day = result.getDay();
  const diff = day === 0 ? -6 : 1 - day; // Monday
  result.setDate(result.getDate() + diff);
  return result;
}

type ViewMode = "day" | "week";

export default function HoursPage() {
  const [date, setDate] = useState(() => new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("day");

  const weekStart = getWeekStart(date);
  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const startDate = viewMode === "day" ? formatDate(date) : formatDate(weekStart);
  const endDate = viewMode === "day" ? formatDate(date) : formatDate(weekDates[6]);

  const workers = useQuery(api.workers.list);
  const entries = useQuery(api.timeEntries.getForDateRange, { startDate, endDate });
  const setHours = useMutation(api.timeEntries.setHours);

  const getHours = useCallback(
    (workerId: Id<"workers">, d: string): number =>
      entries?.find((e) => e.workerId === workerId && e.date === d)?.hours ?? 0,
    [entries]
  );

  const handleBlur = useCallback(
    (workerId: Id<"workers">, d: string, value: string) => {
      const hours = Math.max(0, parseFloat(value) || 0);
      void setHours({ workerId, date: d, hours });
    },
    [setHours]
  );

  const isLoading = workers === undefined || entries === undefined;

  const dayLabel = date.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const weekLabel = `${weekStart.toLocaleDateString("en-GB", { day: "numeric", month: "short" })} – ${weekDates[6].toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`;

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Hour Entry</h1>
        <a href="/workers" className="text-sm text-blue-600 hover:underline">
          Manage Workers →
        </a>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        {/* Day / Week toggle */}
        <div className="flex rounded-md border border-gray-300 overflow-hidden text-sm">
          {(["day", "week"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-4 py-2 font-medium capitalize border-r border-gray-300 last:border-r-0 ${
                viewMode === mode
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              {mode}
            </button>
          ))}
        </div>

        {/* Navigation */}
        <button
          onClick={() => setDate((d) => addDays(d, viewMode === "day" ? -1 : -7))}
          className="px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50"
          aria-label="Previous"
        >
          ←
        </button>
        <button
          onClick={() => setDate(new Date())}
          className="px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50"
        >
          Today
        </button>
        <button
          onClick={() => setDate((d) => addDays(d, viewMode === "day" ? 1 : 7))}
          className="px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50"
          aria-label="Next"
        >
          →
        </button>
        <span className="text-sm font-medium text-gray-700">
          {viewMode === "day" ? dayLabel : weekLabel}
        </span>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-gray-400 text-sm">Loading…</div>
      ) : workers.length === 0 ? (
        <div className="py-12 text-center text-gray-500 text-sm">
          No workers yet.{" "}
          <a href="/workers" className="text-blue-600 hover:underline">
            Add workers
          </a>{" "}
          to get started.
        </div>
      ) : viewMode === "day" ? (
        /* ── Day view ── */
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 font-medium text-gray-600">Worker</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600 w-36">Hours</th>
              </tr>
            </thead>
            <tbody>
              {workers.map((worker) => (
                <tr key={worker._id} className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50">
                  <td className="px-4 py-2 text-gray-900">{worker.name}</td>
                  <td className="px-4 py-2">
                    <input
                      key={`${worker._id}-${formatDate(date)}`}
                      type="number"
                      min="0"
                      max="24"
                      step="0.5"
                      defaultValue={getHours(worker._id, formatDate(date)) || ""}
                      placeholder="0"
                      onBlur={(e) => handleBlur(worker._id, formatDate(date), e.target.value)}
                      className="w-full text-right px-2 py-1 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50 border-t border-gray-200 font-medium">
                <td className="px-4 py-2 text-gray-600">Total</td>
                <td className="px-4 py-2 text-right text-gray-800 pr-5">
                  {entries
                    .filter((e) => e.date === formatDate(date))
                    .reduce((s, e) => s + e.hours, 0)
                    .toFixed(1)}
                  h
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      ) : (
        /* ── Week view ── */
        <div className="bg-white border border-gray-200 rounded-lg overflow-x-auto">
          <table className="border-collapse text-sm w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 font-medium text-gray-600 sticky left-0 bg-gray-50 min-w-[140px]">
                  Worker
                </th>
                {weekDates.map((d) => (
                  <th
                    key={formatDate(d)}
                    className="text-center px-3 py-3 font-medium text-gray-600 min-w-[72px]"
                  >
                    <div>{d.toLocaleDateString("en-GB", { weekday: "short" })}</div>
                    <div className="text-xs text-gray-400 font-normal">
                      {d.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                    </div>
                  </th>
                ))}
                <th className="text-right px-4 py-3 font-medium text-gray-600 min-w-[64px]">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {workers.map((worker) => {
                const rowTotal = weekDates.reduce(
                  (s, d) => s + getHours(worker._id, formatDate(d)),
                  0
                );
                return (
                  <tr
                    key={worker._id}
                    className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50"
                  >
                    <td className="px-4 py-2 text-gray-900 sticky left-0 bg-white">
                      {worker.name}
                    </td>
                    {weekDates.map((d) => (
                      <td key={formatDate(d)} className="px-2 py-2">
                        <input
                          key={`${worker._id}-${formatDate(d)}`}
                          type="number"
                          min="0"
                          max="24"
                          step="0.5"
                          defaultValue={getHours(worker._id, formatDate(d)) || ""}
                          placeholder="—"
                          onBlur={(e) =>
                            handleBlur(worker._id, formatDate(d), e.target.value)
                          }
                          className="w-full text-center px-1 py-1 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                      </td>
                    ))}
                    <td className="px-4 py-2 text-right font-medium text-gray-700">
                      {rowTotal > 0 ? `${rowTotal.toFixed(1)}h` : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50 border-t border-gray-200 font-medium">
                <td className="px-4 py-3 text-gray-600 sticky left-0 bg-gray-50">Total</td>
                {weekDates.map((d) => {
                  const col = entries
                    .filter((e) => e.date === formatDate(d))
                    .reduce((s, e) => s + e.hours, 0);
                  return (
                    <td key={formatDate(d)} className="px-3 py-3 text-center text-gray-700">
                      {col > 0 ? `${col.toFixed(1)}h` : "—"}
                    </td>
                  );
                })}
                <td className="px-4 py-3 text-right text-gray-800">
                  {entries.reduce((s, e) => s + e.hours, 0).toFixed(1)}h
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}
