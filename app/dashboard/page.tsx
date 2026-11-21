"use client";

import React, { useEffect, useState } from "react";
import PrimaryButton from "../component/PrimaryButton";
import { getAuthUser, logoutUser, User } from "../service/authService";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchAuthUser() {
      const authUser = await getAuthUser();

      if (!authUser) {
        router.replace("/");
        return;
      }

      setIsChecking(false);
      setUser(authUser);
    }
    fetchAuthUser();
  }, [router]);

  if (isChecking || !user) {
    return null; // or a simple loading spinner
  }

  function handleLogout(): void {
    logoutUser();
    router.replace("/");
  }

  return (
    <div className="h-dvh w-full">
      <main className="flex flex-row h-full w-full">
        <div className="left-panel w-100 h-full text-white bg-[#3d200a] flex flex-col px-5 py-10 justify-around">
          <h3>Wafuseph CMS</h3>
          <h5>Welcome {`${user?.name}`} </h5>
          <div className="h-1/2">
            <h6>Menu:</h6>
            <ul className="flex flex-col gap-5">
              <li className="text-4xl">Announcements</li>
              <li className="text-4xl">Message</li>
            </ul>
          </div>

          <PrimaryButton
            buttonType="button"
            label="Logout"
            onClick={handleLogout}
          />
        </div>
        <div className="w-full h-full bg-gray-200"></div>
      </main>
    </div>
  );
}
