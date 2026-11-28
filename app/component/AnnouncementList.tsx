"use client";

import React, { useEffect, useState } from "react";
import { AnnouncementProp, getAnnouncements } from "../service/announcement";
import { formatDate } from "../service/utils";

export default function AnnouncementList() {
  const [announcements, setAnnouncements] = useState<AnnouncementProp[] | []>(
    [],
  );

  const [searchQuery, setSeachQuery] = useState<string>("");

  useEffect(() => {
    async function fetchAnnouncements() {
      const data = await getAnnouncements();
      setAnnouncements(data);
    }

    fetchAnnouncements();
  }, []);

  const filteredList = announcements.filter((announcement) =>
    announcement.title.toLowerCase().trim().includes(searchQuery),
  );

  return (
    <div className="bg-yellow-100 p-10 rounded-2xl h-200 w-300 overflow-y-scroll">
      <h3>Announcement list</h3>
      <div className="flex flex-col">
        <div className="headers-wrapper flex flex-row items-center p-3 border-b border-b-gray-500">
          <span className="w-30">Date</span>
          <span className="w-full">Title</span>
          <div className="flex flex-row shrink-0 gap-3 items-center">
            <span>Search:</span>
            <input
              type="text"
              className="border border-gray-500 w-100"
              maxLength={40}
              onChange={(e) => setSeachQuery(e.currentTarget.value)}
            />
          </div>
        </div>
        <ul className="flex flex-col p-2">
          {filteredList.map((announ) => {
            return (
              <li
                key={announ.title}
                className="flex flex-row cursor-pointer hover:bg-yellow-600 p-2"
              >
                <span className="w-30">{formatDate(announ.createdAt)}</span>
                <span className="w-full">{announ.title}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
