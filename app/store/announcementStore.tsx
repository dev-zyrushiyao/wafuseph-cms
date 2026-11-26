import { create } from "zustand";

type State = {
  attachedFile: File | null; // state of input form file (add announcements)
};

type Action = {
  setAttachedFile: (attachedFile: State["attachedFile"]) => void;
};

export const useAnnouncement = create<State & Action>()((set) => ({
  attachedFile: null,
  setAttachedFile: (attachedFile) =>
    set(() => ({ attachedFile: attachedFile })),
}));
