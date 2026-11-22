"use client";
import dynamic from "next/dynamic";
import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { AnnouncementProp } from "../service/announcement";
import { getAuthUser, User } from "../service/authService";
import { useRouter } from "next/navigation";
import { slugify } from "../service/utils";

//Jodit Richtext editor import
const JoditEditor = dynamic(() => import("jodit-react"), { ssr: false });

type Validation = Partial<Record<keyof AnnouncementProp, string>>;

export default function AnnouncementEditor() {
  const [user, setUser] = useState<User | null>(null);
  const [isChecking, setIsChecking] = useState<boolean>(true);

  const router = useRouter();

  const [content, setContent] = useState<string>("<p></p>");
  const config = useMemo(() => ({ height: 400 }), []);

  useEffect(() => {
    async function fetchAuthUser() {
      const authUser = await getAuthUser();

      if (!authUser) {
        router.replace("/");
        return;
      }

      setUser(authUser);
      setIsChecking(false);
    }
    fetchAuthUser();
  }, [router]);

  //form config
  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors },
  } = useForm<AnnouncementProp>({
    // defaultValues: {
    //   content: "<p></p>",
    // },
  });

  const onSubmit = async (payload: AnnouncementProp) => {
    //added a slug before it send to API
    payload.slug = slugify(payload.title);

    const res = await fetch(
      "http://localhost:8080/api/admin/announcement/post",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify(payload),
      },
    );

    if (res.status === 400) {
      const { message } = await res.json();
      //   setLoginResult(message);
      setError("title" as keyof AnnouncementProp, {
        type: "server",
        message: `Error: Missing input detected - value of ${message}: `,
      });

      return;
    }

    if (res.status === 403) {
      const { message } = await res.json();
      //   setLoginResult(message);
      console.log("Error 401: Announcement post Failed - UNAUTHORIZED");
      return;
    }

    if (res.status === 409) {
      const { message } = await res.json();
      //   setLoginResult(message);
      setError("title" as keyof AnnouncementProp, {
        type: "server",
        message: `${message}: Duplicate title/slug detected`,
      });

      return;
    }

    if (!res.ok) {
      const body = (await res.json()) as Validation;

      Object.entries(body).forEach(([field, message]) => {
        setError(field as keyof AnnouncementProp, {
          type: "server",
          message,
        });
      });

      return;
    }

    //post success message
    console.log("Announcement post success");
    //react-form-hook reset
    reset();
    setContent("<p></p>");
  };

  return (
    <div className="flex flex-col gap-10 w-1/2 h-100">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label htmlFor="title">Title</label>
          <input {...register("title")} id="title" name="title" type="text" />
          <p role="alert" className="text-red-500 font-semibold">
            {errors.title?.message}
          </p>
        </div>
        <div>
          <label htmlFor="subTitle">Subtitle</label>
          <input
            {...register("subTitle")}
            id="subTitle"
            name="subTitle"
            type="text"
          />
          <p role="alert" className="text-red-500 font-semibold">
            {errors.subTitle?.message}
          </p>
        </div>
        <div>
          <label htmlFor="content">Content</label>
          <input
            {...register("content")}
            id="content"
            name="content"
            type="text"
            value={content}
            readOnly
          />
          <p role="alert" className="text-red-500 font-semibold">
            {errors.content?.message}
          </p>
        </div>

        <button type="submit">Submit</button>
      </form>

      <JoditEditor value={content} config={config} onBlur={setContent} />
    </div>
  );
}
