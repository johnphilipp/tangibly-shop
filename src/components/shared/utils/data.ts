import { signal } from "@preact/signals-react";

export type ActiveDesign = {
  name: string;
  state: "saved" | "unsaved";
  designId?: number;
  id?: number;
};

export const activeDesign = signal<ActiveDesign>({
  name: "Untitled",
  state: "unsaved",
} as ActiveDesign);
