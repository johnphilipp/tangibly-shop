import { signal } from "@preact/signals-react";

export type ActiveDesignSaved = {
  id: number;
  name: string;
  designId: number;
  state: "saved";
};
export type ActiveDesignUnsaved = {
  name: string;
  state: "unsaved";
};

export type ActiveDesign = ActiveDesignSaved | ActiveDesignUnsaved;

export const activeDesign = signal({ name: "Untitled", state: "unsaved" });
