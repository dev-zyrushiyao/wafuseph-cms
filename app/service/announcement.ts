"use server";

import { cacheLife } from "next/cache";

export type AnnouncementProp = {
  title: string;
  subTitle: string | null;
  content: string;
  slug: string;
  imageUrl: string | null;
  createdAt: string;
};

export async function getAnnouncements(): Promise<AnnouncementProp[] | []> {
  "use cache";
  cacheLife("weeks");

  const res = await fetch(
    "http://localhost:8080/api/visitor/view/announcements",
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    },
  );

  if (!res.ok) {
    throw Error("Unable to fetch data");
  }

  const data = (await res.json()) as AnnouncementProp[];

  return data || [];
}
