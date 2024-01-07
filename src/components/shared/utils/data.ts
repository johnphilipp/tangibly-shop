import { signal } from "@preact/signals-react";

export type ActiveDesign = {
  id: number;
  name: string;
  designId: number;
};

export const activeDesign = signal(undefined as ActiveDesign | undefined);
