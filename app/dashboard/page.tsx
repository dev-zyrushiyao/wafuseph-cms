"use client";

import React, { useEffect, useState } from "react";
import PrimaryButton from "../component/PrimaryButton";
import { getAuthUser, logoutUser, User } from "../service/authService";
import { useRouter } from "next/navigation";

import AnnouncementEditor from "../component/AnnouncementEditor";
import { isTokenExpired } from "../service/jwtPayload";

import { MdArrowDropUp, MdKeyboardArrowRight } from "react-icons/md";
import { MdArrowDropDown } from "react-icons/md";
import AnnouncementList from "../component/AnnouncementList";

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  const [announcementToggle, setAnnouncementToggle] = useState<boolean>(false);
  const [mode, setMode] = useState<string | null>("view");
  const router = useRouter();

  useEffect(() => {
    async function fetchAuthUser() {
      const authUser = await getAuthUser();

      const tokenExpire = isTokenExpired(authUser?.token);

      if (tokenExpire) {
        logoutUser();
        router.replace("/");
      }

      if (!authUser) {
        router.replace("/");
        return;
      }

      setUser(authUser);
      setIsChecking(false);
    }
    fetchAuthUser();
  }, [router]);

  function handleLogout(): void {
    logoutUser();
    router.replace("/");
  }

  function handleToggleAnnouncement() {
    setAnnouncementToggle((prev) => !prev);
  }

  if (isChecking || !user) {
    return null; // or a simple loading spinner
  }

  return (
    <div className="min-h-dvh w-full">
      <main className="flex flex-row h-full w-full">
        <div className="left-panel w-100 min-h-dvh text-white bg-[#3d200a] flex flex-col px-5 py-10 justify-around">
          <h3>Wafuseph CMS</h3>
          <h5>Welcome {`${user?.name}`} </h5>
          <div className="h-1/2">
            <h6>Menu:</h6>
            <ul className="flex flex-col gap-5">
              {user.role === "ADMIN" && (
                <ul className="text-2xl announcement-ul [&_li]:pl-7">
                  <h3
                    className="cursor-pointer hover:text-amber-100"
                    onClick={handleToggleAnnouncement}
                  >
                    <div className="flex flex-row items-center">
                      <span>Announcements</span>{" "}
                      {announcementToggle ? (
                        <MdArrowDropUp />
                      ) : (
                        <MdArrowDropDown />
                      )}
                    </div>
                  </h3>
                  {announcementToggle && (
                    <ul className="[&_li]:hover:text-yellow-200">
                      <li
                        data-mode="create"
                        className="flex flex-row items-center cursor-pointer"
                        onClick={(e) => {
                          const createMode = e.currentTarget.dataset.mode;
                          if (!createMode) return;

                          setMode(createMode);
                        }}
                      >
                        <MdKeyboardArrowRight /> <span>Create post</span>
                      </li>
                      <li
                        data-mode="view"
                        className="flex flex-row items-center cursor-pointer"
                        onClick={(e) => {
                          const createMode = e.currentTarget.dataset.mode;
                          if (!createMode) return;

                          setMode(createMode);
                        }}
                      >
                        <MdKeyboardArrowRight />
                        <span>View announcements</span>
                      </li>
                    </ul>
                  )}
                </ul>
              )}

              <li className="text-4xl">Message</li>
            </ul>
          </div>

          <PrimaryButton
            buttonType="button"
            label="Logout"
            onClick={handleLogout}
          />
        </div>
        <div className="w-full min-h-dvh flex flex-col justify-center items-center  bg-gray-200">
          {mode === "create" && <AnnouncementEditor />}
          {mode === "view" && <AnnouncementList />}
        </div>
      </main>
    </div>
  );
}
