"use client";
import React, { useEffect, useState } from "react";
import Sidebar from "../../ui/sidebar";
import { useParams } from "next/navigation";

// Define interfaces for user
interface User {
  id: number;
  name: string;
  type?: string;
}

// Define interface for assigned tasks
interface AssignedTask {
  assigned_task_id: number;
  points: number;
  task_name: string;
  child_name: string;
  child_id: number;
  approved_at: Date | null;
  completed_at: Date | null;
}

type AddTaskPayload = {
  points: number;
  child_id: string;
  task_id?: number;
  task_name?: string;
};

export default function ParentTaskPage() {
  const params = useParams();
  const { id } = params;

  const [, setUser] = useState<User | null>(null);
  const [assignedTasks, setAssignedTasks] = useState<AssignedTask[]>([]);

  // State for approving tasks
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [approveTaskId, setApproveTaskId] = useState<number | null>(null);
  const [approvePoints, setApprovePoints] = useState<number>(0);

  // State for modal loading
  const [modalLoading, setModalLoading] = useState(false);

  // State for rejecting tasks
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectTaskId, setRejectTaskId] = useState<number | null>(null);
  const [rejectDescription, setRejectDescription] = useState("");
  const [rejectLoading, setRejectLoading] = useState(false);

  // State for adding tasks
  const [showAddForm, setShowAddForm] = useState(false);
  const [addTaskName, setAddTaskName] = useState("");
  const [addPoints, setAddPoints] = useState(0);
  const [addChildId, setAddChildId] = useState("");
  const [addLoading, setAddLoading] = useState(false);
  const [addTaskNameManual, setAddTaskNameManual] = useState<string | null>(
    null
  );
  const [allTasks, setAllTasks] = useState<
    { id: number; name: string; points: number }[]
  >([]);
  const [users, setUsers] = useState<User[]>([]);

  // State for editing tasks
  const [editTaskId, setEditTaskId] = useState<number | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTaskId, setDeleteTaskId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Fetch user data
  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        const res = await fetch("/api/users");
        const data = await res.json();
        const usersArr = Array.isArray(data.users) ? data.users : [];
        setUsers(usersArr);
        const foundUser = usersArr.find(
          (u: User) => String(u.id) === String(id)
        );
        setUser(foundUser || null);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        console.log("Fetched all users successfully.");
      }
    };
    fetchAllUsers();
  }, [id]);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await fetch("/api/task");
        const data = await res.json();
        setAllTasks(data.tasks || []);
      } catch (error) {
        console.log("Error fetching tasks:", error);
      } finally {
        console.log("Fetched all tasks successfully.");
      }
    };
    fetchTasks();
  }, []);

  // fetch assigned tasks
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetch(`/api/users/${id}/assigned-tasks`);
        const response = await data.json();
        setAssignedTasks(
          Array.isArray(response.assignedTasks) ? response.assignedTasks : []
        );
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, [id]);

  // Handler for adding a new assigned task with an option to choose between a manual task or an existing one
  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddLoading(true);
    try {
      const payload: AddTaskPayload = {
        points: addPoints,
        child_id: addChildId,
      };
      if (addTaskNameManual === null && addTaskName) {
        payload.task_id = Number(addTaskName);
      }
      if (addTaskNameManual !== null && addTaskNameManual.trim() !== "") {
        payload.task_name = addTaskNameManual;
      }

      const response = await fetch(`/api/users/${id}/assigned-tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        setAddTaskName("");
        setAddPoints(0);
        setAddChildId("");
        setShowAddForm(false);
        setAddTaskNameManual(null);
        // Refresh tasks
        const data = await fetch(`/api/users/${id}/assigned-tasks`);
        const result = await data.json();
        setAssignedTasks(
          Array.isArray(result.assignedTasks) ? result.assignedTasks : []
        );
      } else {
        console.error("Failed to add task");
      }
    } catch (error) {
      console.error("Error adding task:", error);
    } finally {
      setAddLoading(false);
    }
  };

  // Hander for deleting a task
  const handleDeleteTask = async (taskId: number) => {
    setDeleteLoading(true);
    try {
      const response = await fetch(`/api/users/${id}/assigned-tasks`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assigned_task_id: taskId }),
      });
      if (response.ok) {
        setAssignedTasks((prev) =>
          prev.filter((t) => t.assigned_task_id !== taskId)
        );
        setShowDeleteModal(false);
        setDeleteTaskId(null);
        setEditTaskId(null);
      } else {
        console.error("Failed to delete task");
      }
    } catch (error) {
      console.error("Error deleting task:", error);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen">
      <div className="flex flex-col w-full md:w-3/4">
        <div className="flex items-center justify-center p-6 shadow-xl backdrop-blur-md border-b border-zinc-400">
          {/* Header */}
          <h1 className="text-2xl sm:text-3xl font-bold text-center w-full">
            Dashboard
          </h1>
        </div>
        <div className="p-4 sm:p-8">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-5 text-left">
            Active Tasks
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {assignedTasks.length === 0 && (
              <li className="text-gray-500 m-5 col-span-full text-center">
                No assigned tasks.
              </li>
            )}
            {/* Map through all the assigned tasks and display them */}
            {assignedTasks.map((task) => (
              <li
                key={task.assigned_task_id}
                className="bg-white backdrop-blur-md rounded-xl shadow-xl border border-zinc-400 p-4 sm:p-6 flex flex-col items-start"
              >
                <div className="flex w-full items-center mb-2">
                  <span className="font-bold text-lg sm:text-2xl">
                    {task.task_name}
                  </span>
                  <span className="italic sm:text-lg ml-auto bg-blue-300 p-2 rounded-full shadow text-nowrap overflow-hidden text-ellipsis max-w-[150px]">
                    {task.child_name}
                  </span>
                </div>
                <div className="mb-2">
                  Points: <span className="font-semibold">{task.points}</span>
                  {" | "}
                  Status:{" "}
                  {/* Show yellow if the task isn't completed yet, and show green if it is */}
                  <span
                    className={
                      task.completed_at != null
                        ? "text-green-500 font-bold"
                        : "text-yellow-600 font-bold"
                    }
                  >
                    {task.completed_at != null ? "Completed" : "Pending"}
                  </span>
                </div>
                {/* Approve/Reject buttons: only show if completed and not yet approved */}
                {task.completed_at && !task.approved_at && (
                  <div className="flex flex-col sm:flex-row gap-2 w-full">
                    <button
                      className="btn mt-2 sm:mt-4 p-2 sm:p-4 bg-blue-300 text-white text-base sm:text-xl rounded transition-transform hover:scale-104"
                      onClick={() => {
                        setApproveTaskId(task.assigned_task_id);
                        setApprovePoints(task.points); //
                        setShowApproveModal(true);
                      }}
                    >
                      Approve
                    </button>
                    <button
                      className="btn mt-2 sm:mt-4 p-2 sm:p-4 bg-red-400 text-white text-base sm:text-xl rounded transition-transform hover:scale-104"
                      onClick={() => {
                        setRejectTaskId(task.assigned_task_id);
                        setRejectDescription("");
                        setShowRejectModal(true);
                      }}
                    >
                      Reject
                    </button>
                  </div>
                )}
                {/* Edit button: only show if not completed or approved */}
                {!task.completed_at &&
                  !task.approved_at &&
                  (editTaskId === task.assigned_task_id ? (
                    <div className="flex gap-2 mt-2 w-full">
                      <button
                        type="button"
                        className="btn bg-red-500 text-white flex-1"
                        onClick={() => {
                          setDeleteTaskId(task.assigned_task_id);
                          setShowDeleteModal(true);
                        }}
                        disabled={deleteLoading}
                      >
                        Delete
                      </button>
                      <button
                        type="button"
                        className="btn flex-1"
                        onClick={() => setEditTaskId(null)}
                        disabled={deleteLoading}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      className="btn mt-2 p-2 bg-blue-300 rounded transition-transform hover:scale-104"
                      onClick={() => setEditTaskId(task.assigned_task_id)}
                    >
                      Edit
                    </button>
                  ))}
              </li>
            ))}
            <li
              className="bg-white backdrop-blur-md rounded-xl shadow-xl border border-zinc-400 p-4 sm:p-6 flex flex-col items-start cursor-pointer"
              onClick={() => setShowAddForm(true)}
            >
              {!showAddForm ? (
                <div className="flex flex-col items-center w-full">
                  <span className="text-4xl mb-2">＋</span>
                  <span className="font-semibold text-lg">Add new task</span>
                </div>
              ) : (
                <form
                  onSubmit={handleAddTask}
                  className="flex flex-col gap-3 w-full"
                >
                  {/* Choice box for task type. So the user can select a manual new one, or select an exisiting one they can easily access*/}
                  <div className="flex gap-2 mb-2">
                    <button
                      type="button"
                      className={`btn flex-1 p-2 rounded border ${
                        addTaskNameManual !== null
                          ? "bg-blue-300 text-white"
                          : ""
                      }`}
                      onClick={() => {
                        setAddTaskNameManual("");
                        setAddTaskName("");
                        setAddPoints(0);
                      }}
                    >
                      Add new custom task
                    </button>
                    <button
                      type="button"
                      className={`btn flex-1 p-2 rounded border ${
                        addTaskNameManual === null
                          ? "bg-blue-300 text-white"
                          : ""
                      }`}
                      onClick={() => {
                        setAddTaskNameManual(null);
                        setAddTaskName("");
                        setAddPoints(0);
                      }}
                    >
                      Select basic task
                    </button>
                  </div>
                  {/* Show input or select based on choice */}
                  {addTaskNameManual !== null ? (
                    <input
                      type="text"
                      placeholder="New task name"
                      value={addTaskNameManual}
                      onChange={(e) => setAddTaskNameManual(e.target.value)}
                      className="w-full border rounded p-1"
                      required
                      autoFocus
                    />
                  ) : (
                    <select
                      value={addTaskName}
                      onChange={(e) => {
                        setAddTaskName(e.target.value);
                        const selected = allTasks.find(
                          (t) => String(t.id) === e.target.value
                        );
                        if (selected) setAddPoints(selected.points);
                      }}
                      className="w-full border rounded p-1"
                      required
                      autoFocus
                    >
                      <option value="" disabled>
                        Select an existing task
                      </option>
                      {allTasks.map((task) => (
                        <option key={task.id} value={task.id} className="text-black" >
                          {task.name} ({task.points} pts)
                        </option>
                      ))}
                    </select>
                  )}
                  <input
                    type="number"
                    placeholder="Points"
                    value={addPoints}
                    onChange={(e) => setAddPoints(Number(e.target.value))}
                    className="w-full border rounded p-1"
                    min={0}
                    required
                  />
                  <select
                    value={addChildId}
                    onChange={(e) => setAddChildId(e.target.value)}
                    className="w-full border rounded p-1"
                    required
                  >
                    <option value="" disabled>
                      Select a child
                    </option>
                    {users
                      .filter(
                        (u) =>
                          u.type &&
                          (u.type.toLowerCase() === "child" ||
                            u.type.toLowerCase() === "children")
                      )
                      .map((user) => (
                        <option key={user.id} className="text-black" value={user.id.toString()}>
                          {user.name}
                        </option>
                      ))}
                  </select>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="btn bg-blue-300 text-white flex-1"
                      disabled={addLoading}
                    >
                      {addLoading ? "Adding..." : "Add new task"}
                    </button>
                    <button
                      type="button"
                      className="btn flex-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowAddForm(false);
                        setAddTaskName("");
                        setAddTaskNameManual(null);
                        setAddPoints(0);
                        setAddChildId("");
                      }}
                      disabled={addLoading}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </li>
          </ul>
        </div>
      </div>
      <Sidebar />

      {/* Approve Modal */}
      {showApproveModal && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center z-50 bg-grey bg-opacity-50 backdrop-blur-sm px-2">
          <div className="bg-white rounded-xl m-4 p-4 sm:p-5 shadow-2xl w-full max-w-md flex flex-col items-center">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 text-center">
              Approve{" "}
              {assignedTasks.find((t) => t.assigned_task_id === approveTaskId)
                ?.task_name || "Task"}
            </h2>
            <form
              className="flex flex-col gap-2 w-full"
              onSubmit={async (e) => {
                e.preventDefault();
                setModalLoading(true);
                try {
                  const response = await fetch(
                    `/api/users/${id}/assigned-tasks/${approveTaskId}/actions/approve`,
                    {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        points: approvePoints,
                      }),
                    }
                  );
                  if (response.ok) {
                    setAssignedTasks((prev) =>
                      prev.filter((t) => t.assigned_task_id !== approveTaskId)
                    );
                    setShowApproveModal(false);
                    setApproveTaskId(null);
                    setApprovePoints(0);
                  } else {
                    console.error("Failed to approve task");
                  }
                } catch (error) {
                  console.error("Error approving task:", error);
                } finally {
                  setModalLoading(false);
                }
              }}
            >
              <label className="w-full">
                <span className="font-bold">Points: </span>
                <input
                  type="number"
                  className="w-full border rounded p-2 mt-1"
                  value={approvePoints}
                  min={0}
                  onChange={(e) => setApprovePoints(Number(e.target.value))}
                  required
                />
              </label>
              <div className="flex gap-2 mt-2">
                <button
                  type="submit"
                  className="btn bg-blue-300 text-white flex-1 transition-transform hover:scale-104"
                  disabled={modalLoading}
                >
                  {modalLoading ? "Approving..." : "Approve"}
                </button>
                <button
                  type="button"
                  className="btn bg-red-400 text-white flex-1 transition-transform hover:scale-104"
                  onClick={() => setShowApproveModal(false)}
                  disabled={modalLoading}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center z-50 bg-grey bg-opacity-50 backdrop-blur-sm px-2">
          <div className="bg-white rounded-xl m-4 p-4 sm:p-5 shadow-2xl w-full max-w-md flex flex-col items-center">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 text-center">
              Reject{" "}
              {assignedTasks.find((t) => t.assigned_task_id === rejectTaskId)
                ?.task_name || "Task"}
            </h2>
            <form
              className="flex flex-col gap-2 w-full"
              onSubmit={async (e) => {
                e.preventDefault();
                setRejectLoading(true);
                try {
                  const response = await fetch(
                    `/api/users/${id}/assigned-tasks/${rejectTaskId}/actions/reject`,
                    {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        description: rejectDescription,
                      }),
                    }
                  );
                  if (response.ok) {
                    setAssignedTasks((prev) =>
                      prev.filter((t) => t.assigned_task_id !== rejectTaskId)
                    );
                    setShowRejectModal(false);
                    setRejectTaskId(null);
                    setRejectDescription("");
                  } else {
                    console.error("Failed to reject task");
                  }
                } catch (error) {
                  console.error("Error rejecting task:", error);
                } finally {
                  setRejectLoading(false);
                }
              }}
            >
              <label className="w-full">
                <span className="font-bold">Description: </span>
                <textarea
                  className="w-full border rounded p-2 mt-1"
                  value={rejectDescription}
                  onChange={(e) => setRejectDescription(e.target.value)}
                  rows={3}
                  required
                />
              </label>
              <div className="flex gap-2 mt-2">
                <button
                  type="submit"
                  className="btn bg-red-400 text-white flex-1 transition-transform hover:scale-104"
                  disabled={rejectLoading}
                >
                  {rejectLoading ? "Rejecting..." : "Reject"}
                </button>
                <button
                  type="button"
                  className="btn text-white flex-1 transition-transform hover:scale-104"
                  onClick={() => setShowRejectModal(false)}
                  disabled={rejectLoading}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center z-50 bg-grey bg-opacity-50 backdrop-blur-sm px-2">
          <div className="bg-white rounded-xl m-4 p-4 sm:p-5 shadow-2xl w-full max-w-md flex flex-col items-center">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 text-center">
              Delete Task
            </h2>
            <p className="mb-4 text-center">
              Are you sure you want to delete this task?
            </p>
            <div className="flex gap-2 mt-2">
              <button
                className="btn bg-red-500 text-white flex-1"
                onClick={async () => {
                  if (deleteTaskId !== null) {
                    await handleDeleteTask(deleteTaskId);
                  }
                }}
                disabled={deleteLoading}
              >
                {deleteLoading ? "Deleting..." : "Delete"}
              </button>
              <button
                className="btn flex-1"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteTaskId(null);
                }}
                disabled={deleteLoading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
