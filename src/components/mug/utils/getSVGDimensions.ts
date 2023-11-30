import type { AspectRatio } from "./aspectRatios";

export function getSVGDimensions(aspectRatio: AspectRatio) {
  const MAX_ACTIVITIES = aspectRatio.rows * aspectRatio.cols;
  const SVG_WIDTH = 100 * aspectRatio.cols;
  const SVG_HEIGHT = 100 * aspectRatio.rows;
  return { SVG_WIDTH, SVG_HEIGHT, MAX_ACTIVITIES };
}
