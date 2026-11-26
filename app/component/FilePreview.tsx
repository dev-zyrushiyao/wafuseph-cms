import React, { useEffect, useMemo, useState } from "react";
import { formatFileSize } from "../service/utils";
import Image from "next/image";
import { IoMdCloseCircle } from "react-icons/io";
import { useAnnouncement } from "../store/announcementStore";

export default function FilePreview({ file }: { file: File }) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  //announcementStore (zustand)
  const attachedFile = useAnnouncement((state) => state.attachedFile);
  const setAttachedFile = useAnnouncement((state) => state.setAttachedFile);

  useEffect(() => {
    const objectUrl = URL.createObjectURL(file);
    async function setUrl() {
      setPreviewUrl(objectUrl);
      setLoading(false);
    }

    setUrl();

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [file]);

  if (loading) {
    return null;
  }

  function handleDelete(): void {
    setAttachedFile(null);
  }

  return (
    <div className="h-30 border-3 bg-gray-200  border-gray-400 border-dashed flex flex-row justify-around items-center">
      <span>
        {file.name.length > 50 ? `${file.name.slice(0, 50)}...` : file.name}
      </span>
      <span>{formatFileSize(file.size)}</span>
      <div className="relative h-25 w-25 bg-gray-400">
        <Image
          src={previewUrl ?? ""}
          alt="upload photo"
          loading="eager"
          fill
          className="inset-0 top-0 object-contain"
        />
      </div>
      <div className="flex flex-col items-center" onClick={handleDelete}>
        <IoMdCloseCircle size={24} fill="red" />
        <p>delete</p>
      </div>
    </div>
  );
}
