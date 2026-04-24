"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";

export default function WorkersPage() {
  const [newName, setNewName] = useState("");
  const workers = useQuery(api.workers.listAll);
  const add = useMutation(api.workers.add);
  const setActive = useMutation(api.workers.setActive);
  const remove = useMutation(api.workers.remove);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;
    await add({ name });
    setNewName("");
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Workers</h1>
        <a href="/hours" className="text-sm text-blue-600 hover:underline">
          ← Back to hours
        </a>
      </div>

      <form onSubmit={handleAdd} className="flex gap-2 mb-6">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Full name"
          className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          type="submit"
          disabled={!newName.trim()}
          className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Add Worker
        </button>
      </form>

      {workers === undefined ? (
        <div className="py-8 text-center text-gray-400 text-sm">Loading…</div>
      ) : workers.length === 0 ? (
        <div className="py-8 text-center text-gray-500 text-sm">
          No workers yet. Add one above.
        </div>
      ) : (
        <ul className="space-y-2">
          {workers.map((worker) => (
            <li
              key={worker._id}
              className="flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-md"
            >
              <span
                className={`text-sm font-medium ${
                  worker.active ? "text-gray-900" : "text-gray-400 line-through"
                }`}
              >
                {worker.name}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => void setActive({ id: worker._id, active: !worker.active })}
                  className={`px-3 py-1 text-xs font-medium rounded ${
                    worker.active
                      ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                      : "bg-green-100 text-green-800 hover:bg-green-200"
                  }`}
                >
                  {worker.active ? "Deactivate" : "Activate"}
                </button>
                <button
                  onClick={() => void remove({ id: worker._id })}
                  className="px-3 py-1 text-xs font-medium rounded bg-red-100 text-red-800 hover:bg-red-200"
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
