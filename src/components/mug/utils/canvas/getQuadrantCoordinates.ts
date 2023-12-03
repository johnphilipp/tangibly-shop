import type { AspectRatio } from "../aspectRatios";
import { decodePolyline } from "./decodePolyline";

export function getQuadrantCoordinates(
  polylineData: string,
  index: number,
  margin: number,
  aspectRatio: AspectRatio,
  SVG_WIDTH: number,
  SVG_HEIGHT: number,
): [number, number][] {
  const coordinates = decodePolyline(polylineData);
  const scaledCoordinates = scaleCoordinates(
    coordinates,
    margin,
    aspectRatio,
    SVG_WIDTH,
    SVG_HEIGHT,
  );
  const row = Math.floor(index / aspectRatio.cols);
  const col = index % aspectRatio.cols;

  const quadrantWidth = (SVG_WIDTH - (aspectRatio.cols + 1)) / aspectRatio.cols;
  const quadrantHeight =
    (SVG_HEIGHT - (aspectRatio.rows + 1)) / aspectRatio.rows;

  const offsetX = col * quadrantWidth;
  const offsetY = row * quadrantHeight;

  const adjustedOffsetX = offsetX + margin; // Adjust for margin
  const adjustedOffsetY = offsetY + margin; // Adjust for margin

  return scaledCoordinates.map((coord) => [
    coord[0] + adjustedOffsetX,
    coord[1] + adjustedOffsetY,
  ]);
}

function scaleCoordinates(
  coordinates: [number, number][],
  margin: number,
  aspectRatio: AspectRatio,
  SVG_WIDTH: number,
  SVG_HEIGHT: number,
): [number, number][] {
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity,
    sumLat = 0;

  for (const [latitude, longitude] of coordinates) {
    sumLat += latitude;
    if (longitude < minX) minX = longitude;
    if (latitude < minY) minY = latitude;
    if (longitude > maxX) maxX = longitude;
    if (latitude > maxY) maxY = latitude;
  }

  const quadrantWidth = (SVG_WIDTH - (aspectRatio.cols + 1)) / aspectRatio.cols;
  const quadrantHeight =
    (SVG_HEIGHT - (aspectRatio.rows + 1)) / aspectRatio.rows;

  const avgLat = sumLat / coordinates.length;
  const latCorrection = Math.cos((avgLat * Math.PI) / 180);

  const xRange = (maxX - minX) * latCorrection;
  const yRange = maxY - minY;

  const adjustedQuadrantWidth = quadrantWidth - 2 * margin;
  const adjustedQuadrantHeight = quadrantHeight - 2 * margin;

  const xScale = adjustedQuadrantWidth / xRange;
  const yScale = adjustedQuadrantHeight / yRange;
  const scale = Math.min(xScale, yScale);

  return coordinates.map((coord) => [
    (coord[1] - minX) * latCorrection * scale,
    adjustedQuadrantHeight - (coord[0] - minY) * scale, // Adjust the y-coordinate scaling
  ]);
}
