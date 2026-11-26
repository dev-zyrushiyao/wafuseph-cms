"use client";
import dynamic from "next/dynamic";
import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { AnnouncementProp } from "../service/announcement";
import { getAuthUser, User } from "../service/authService";
import { useRouter } from "next/navigation";
import { MAX_FILE_SIZE, slugify } from "../service/utils";
import PrimaryButton from "./PrimaryButton";
import { allowedFileTypes } from "../service/file";
import FilePreview from "./FilePreview";
import { toast } from "sonner";
import { useAnnouncement } from "../store/announcementStore";

//Jodit Richtext editor import
const JoditEditor = dynamic(() => import("jodit-react"), { ssr: false });

type Validation = Partial<Record<keyof AnnouncementProp, string>>;

export default function AnnouncementEditor() {
  const [user, setUser] = useState<User | null>(null);
  const [isChecking, setIsChecking] = useState<boolean>(true);
  // const [selectedFile, setSelectedFile] = useState<File | null>(null);

  //announcementStore (zustand)
  const attachedFile = useAnnouncement((state) => state.attachedFile);
  const setAttachedFile = useAnnouncement((state) => state.setAttachedFile);

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
    const loadingToastId: string = "loading-toast";

    //added a slug before it send to API - it can be sent to API without the Image url
    payload.slug = slugify(payload.title);
    payload.subTitle = payload.subTitle?.trim() || null;
    payload.content = content; // content is a state separate from the useForm

    //toast execute loading state
    toast.loading("loading...", { id: loadingToastId });

    //create a new form with payload(react-form-hook) with key of 'announcementData' and file(state) vales in it with key of 'file' to SpringBoot controller @RequestPart().
    const formData = new FormData();
    formData.append(
      "announcementData",
      new Blob([JSON.stringify(payload)], { type: "application/json" }),
    );
    if (attachedFile) {
      formData.append("file", attachedFile);
    }

    //Accepts by SpringBoot using @RequestPart annotation
    const res = await fetch(
      "http://localhost:8080/api/admin/announcement/post",
      {
        method: "POST",
        headers: {
          // "Content-Type": "application/json",
          // "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${user?.token}`,
        },
        // body: JSON.stringify(payload),
        body: formData,
      },
    );

    if (res.status === 400) {
      const { message } = await res.json();
      //   setLoginResult(message);
      setError("title" as keyof Validation, {
        type: "server",
        message: `Error: Missing input detected - value of ${message}: `,
      });

      toast.dismiss(loadingToastId);
      toast.error(
        `Error 400: ${message} Bad Request / Missing Input / Unsatisfied Input Data`,
      );

      return;
    }

    if (res.status === 403) {
      const { message } = await res.json();

      toast.dismiss(loadingToastId);
      toast.error(`Error 403: ${message} Access Denied: Unauthorized Access`);
      return;
    }

    //validation
    if (res.status === 409) {
      const { message } = await res.json();
      setError("title" as keyof Validation, {
        type: "server",
        message: `${message}: Duplicate title/slug detected`,
      });

      toast.dismiss(loadingToastId);
      toast.error(`Error 409: ${message} Duplicate Data/Invalid input`);

      return;
    }

    if (res.status === 500) {
      const { message } = await res.json();

      toast.dismiss(loadingToastId);
      toast.error(`Error 500: Internal Server Error`);

      return;
    }

    //form validation
    if (!res.ok) {
      const body = (await res.json()) as Validation;
      Object.entries(body).forEach(([field, message]) => {
        setError(field as keyof AnnouncementProp, {
          type: "server",
          message,
        });
      });

      toast.dismiss(loadingToastId);
      return;
    }

    //post success message
    toast.dismiss(loadingToastId);
    toast.success("Announcement post success");
    //react-form-hook reset and the state where some values are stored
    reset();
    setContent("");
    setAttachedFile(null);
  };

  //load white canvass; prevent from loading the JSX until It get the User
  if (isChecking || !user) {
    return null;
  }

  return (
    <div className="flex flex-col gap-10 h-auto lg:w-200 w-fit p-10 bg-[#eaae4e] ">
      <h3 className="text-center">Add new announcement</h3>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        <div>
          <label htmlFor="title">Title</label>
          <input {...register("title")} id="title" name="title" type="text" />
          <p role="alert" className="text-red-500 font-semibold">
            {errors.title?.message}
          </p>
        </div>
        <div>
          <label htmlFor="subTitle">
            Subtitle <span className="text-gray-600">(Optional)</span>
          </label>
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

        {/* content is added on the post method (onSubmit) using the values of content state */}
        {/* <div className="visible">
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
        </div> */}
        <div>
          <label htmlFor="image">Headline Photo</label>
          <div className="wrapper h-20 ">
            <label className="h-full w-full bg-green-200 flex flex-col justify-center items-center cursor-pointer">
              {attachedFile !== null && attachedFile.name
                ? attachedFile.name.length > 99
                  ? `${attachedFile.name.slice(0, 99)}...`
                  : `Change Photo`
                : "Upload a photo"}
              <span>
                <input
                  type="file"
                  className="h-25 bg-yellow-50  hidden"
                  accept={allowedFileTypes.join(",")} //["image/png", "image/jpeg", "image/webp"] => "image/png,image/jpeg,image/webp"
                  onChange={(e) => {
                    const targetFile = e.currentTarget.files?.[0];

                    if (!targetFile) {
                      setAttachedFile(null);
                      return;
                    }

                    if (targetFile.size > MAX_FILE_SIZE) {
                      alert("File must be 10 MB or smaller.");
                      e.target.value = "";
                      return;
                    }

                    setAttachedFile(targetFile ?? null);
                  }}
                />
              </span>
            </label>
          </div>
          {attachedFile && <FilePreview file={attachedFile} />}
        </div>

        <JoditEditor
          className="[&_a]:text-blue-400 [&_a]:underline [&_ul]:list-disc [&_ol]:list-decimal [&_ul,ol]:pl-6 "
          value={content}
          config={config}
          onBlur={(value) => {
            setContent(value);
          }}
        />

        <PrimaryButton buttonType="submit" label="Post Announcement" />
      </form>
    </div>
  );
}
