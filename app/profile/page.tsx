"use client";

import { useEffect, useState } from "react";

import {
  getCurrentUser,
} from "@/services/auth";

import {
  updateUser,
} from "@/database/users";

import { User } from "@/types/user";

export default function ProfilePage() {
  const [user, setUser] =
    useState<User | null>(null);

  const [username, setUsername] =
    useState("");

  const [bio, setBio] =
    useState("");

  const [saved, setSaved] =
    useState(false);

  useEffect(() => {
    const currentUser =
      getCurrentUser();

    if (!currentUser) {
      return;
    }

    setUser(currentUser);
    setUsername(
      currentUser.username
    );
    setBio(
      currentUser.bio || ""
    );
  }, []);

  function saveProfile() {
    if (!user) {
      return;
    }

    const updatedUser =
      updateUser(
        user.id,
        {
          username:
            username.trim(),
          bio:
            bio.trim(),
        }
      );

    if (!updatedUser) {
      return;
    }

    setUser(updatedUser);

    localStorage.setItem(
      "virtual-meet-user",
      JSON.stringify(updatedUser)
    );

    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2000);
  }

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-white">
        <p>
          کاربری پیدا نشد.
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black p-6 text-white">
      <div className="mx-auto max-w-xl rounded-2xl bg-gray-900 p-6">

        <h1 className="mb-6 text-3xl font-bold">
          Profile
        </h1>


        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-600 text-3xl font-bold">
            {username
              .charAt(0)
              .toUpperCase()}
          </div>

          <div>
            <p className="text-lg font-semibold">
              {user.email}
            </p>

            <p className="text-sm text-gray-400">
              User ID: {user.id}
            </p>
          </div>
        </div>


        <label className="mb-2 block text-sm text-gray-400">
          Username
        </label>

        <input
          value={username}
          onChange={(e) =>
            setUsername(
              e.target.value
            )
          }
          className="mb-4 w-full rounded-xl bg-gray-800 px-4 py-3 outline-none"
        />


        <label className="mb-2 block text-sm text-gray-400">
          Bio
        </label>

        <textarea
          value={bio}
          onChange={(e) =>
            setBio(
              e.target.value
            )
          }
          rows={4}
          className="mb-5 w-full rounded-xl bg-gray-800 px-4 py-3 outline-none"
        />


        <button
          onClick={saveProfile}
          className="w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold hover:bg-blue-700"
        >
          ذخیره تغییرات
        </button>


        {saved && (
          <p className="mt-4 text-center text-green-400">
            پروفایل ذخیره شد ✅
          </p>
        )}

      </div>
    </main>
  );
}
