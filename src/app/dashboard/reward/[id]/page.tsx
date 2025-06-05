"use client";
import React, { useEffect, useState } from "react";
import Sidebar from "../../../ui/sidebar";

interface reward {
  id: number;
  name: string;
  points: string;
}

export default function RewardsPage() {
  const [rewards, setRewards] = useState<reward[]>([]);
  const [name, setName] = useState("");
  const [points, setPoints] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  // Edit state
  const [editId, setEditId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editPoints, setEditPoints] = useState(0);

  // Delete state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // Fetch rewards on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetch("/api/reward");
        const response = await data.json();
        setRewards(response.rewards);
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, []);

  // Add reward handler
  const handleAddReward = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/reward", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, points }),
      });

      if (res.ok) {
        const data = await res.json();
        setRewards((prev) => [...prev, data.reward]);
        setName("");
        setPoints(0);
        setShowForm(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Edit handlers
  const handleEditReward = (reward: reward) => {
    setEditId(reward.id);
    setEditName(reward.name);
    setEditPoints(Number(reward.points));
  };

  // Update reward handler
  const handleUpdateReward = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/reward", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editId,
          name: editName,
          points: editPoints,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setRewards((prev) =>
          prev.map((t) => (t.id === editId ? data.reward : t))
        );
        setEditId(null);
        setEditName("");
        setEditPoints(1);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Delete handler
  const handleDeleteReward = async (id: number) => {
    setLoading(true);
    try {
      const res = await fetch("/api/reward", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setRewards((prev) => prev.filter((t) => t.id !== id));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen">
      <div className="flex flex-col w-full md:w-3/4">
        {/* Reward Area */}
        <div className="flex items-center justify-center px-4 py-6 shadow-md backdrop-blur-md">
          <h1 className="text-2xl sm:text-3xl font-bold text-center w-full">
            Reward
          </h1>
        </div>

        {/* Reward Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-4 sm:p-6">
          {/* Existing rewards */}
          {rewards.map((reward) => (
            <div
              key={reward.id}
              className="backdrop-blur-md rounded-xl shadow-xl border border-zinc-400 p-4 sm:p-6 flex flex-col min-w-0"
            >
              {editId === reward.id ? (
                <form
                  onSubmit={handleUpdateReward}
                  className="flex flex-col gap-2 w-full"
                >
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full border rounded p-1"
                    required
                    autoFocus
                  />
                  <input
                    type="number"
                    value={editPoints}
                    onChange={(e) => setEditPoints(Number(e.target.value))}
                    className="w-full border rounded p-1"
                    min={0}
                    required
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="btn bg-blue-300 text-white flex-1"
                      disabled={loading}
                    >
                      {loading ? "Saving edit..." : "Save edit"}
                    </button>
                    <button
                      type="button"
                      className="btn flex-1"
                      onClick={() => setEditId(null)}
                      disabled={loading}
                    >
                      Cancel edit
                    </button>
                  </div>
                  <button
                    type="button"
                    className="btn bg-red-400 text-white mt-2"
                    onClick={() => {
                      setDeleteId(reward.id);
                      setShowDeleteModal(true);
                    }}
                    disabled={loading}
                  >
                    Delete reward
                  </button>
                </form>
              ) : (
                <>
                  <div className="text-xl sm:text-3xl font-semibold mb-1">
                    {reward.name}
                  </div>
                  <div className="mb-2">
                    Points: <span className="font-bold">{reward.points}</span>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button
                      className="btn bg-blue-300 text-white"
                      onClick={() => handleEditReward(reward)}
                      disabled={loading}
                    >
                      Edit reward
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
          {/* Add Reward Card */}
          <div
            className="backdrop-blur-md rounded-xl shadow-xl border border-zinc-400 p-4 sm:p-6 flex flex-col items-start justify-center min-w-0 cursor-pointer"
            onClick={() => setShowForm(true)}
          >
            {!showForm ? (
              <div className="flex flex-col items-center w-full">
                <span className="text-4xl mb-2">＋</span>
                <span className="font-semibold text-lg">
                  Add new reward
                </span>
              </div>
            ) : (
              <form
                onSubmit={handleAddReward}
                className="flex flex-col gap-3 w-full"
              >
                <input
                  type="text"
                  placeholder="Reward name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border rounded p-1"
                  required
                  autoFocus
                />
                <input
                  type="number"
                  placeholder="Points"
                  value={points}
                  onChange={(e) => setPoints(Number(e.target.value))}
                  className="w-full border rounded p-1"
                  min={0}
                  required
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="btn bg-blue-300 text-white flex-1"
                    disabled={loading}
                  >
                    {loading ? "Adding new reward" : "Add new reward"}
                  </button>
                  <button
                    type="button"
                    className="btn flex-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowForm(false);
                      setName("");
                      setPoints(0);
                    }}
                    disabled={loading}
                  >
                    Cancel new reward
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
      <Sidebar />
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-30 px-2">
          <div className="bg-white/90 backdrop-blur-md border border-zinc-300 rounded-xl p-6 shadow-2xl flex flex-col items-center w-full max-w-md">
            <div className="mb-4 font-bold text-xl text-center text-zinc-800">
              Are you sure you want to delete this reward?
            </div>
            <div className="flex gap-4 justify-center">
              <button
                className="btn bg-green-600 text-white"
                onClick={async () => {
                  if (deleteId !== null) {
                    await handleDeleteReward(deleteId);
                    setShowDeleteModal(false);
                    setDeleteId(null);
                    setEditId(null);
                  }
                }}
                disabled={loading}
              >
                Yes, delete reward
              </button>
              <button
                className="btn bg-red-500 text-white"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteId(null);
                }}
                disabled={loading}
              >
                Cancel delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}