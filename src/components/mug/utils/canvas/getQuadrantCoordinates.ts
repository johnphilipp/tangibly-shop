import type { AspectRatio } from "../aspectRatios";
import { decodePolyline } from "./decodePolyline";

export function getQuadrantCoordinates(
  polylineData: string,
  index: number,
  margin: number,
  aspectRatio: AspectRatio,
  SVG_WIDTH: number,
  SVG_HEIGHT: number,
  SVG_MARGIN: number,
): [number, number][] {
  const coordinates = decodePolyline(polylineData);
  const scaledCoordinates = scaleCoordinates(
    coordinates,
    margin,
    aspectRatio,
    SVG_WIDTH,
    SVG_HEIGHT,
  );

  const [minX, maxX, minY, maxY] = findBoundingBox(scaledCoordinates);

  const row = Math.floor(index / aspectRatio.cols);
  const col = index % aspectRatio.cols;

  const quadrantWidth = (SVG_WIDTH - (aspectRatio.cols + 1)) / aspectRatio.cols;
  const quadrantHeight =
    (SVG_HEIGHT - (aspectRatio.rows + 1)) / aspectRatio.rows;

  const offsetX = col * quadrantWidth + margin;
  const offsetY = row * quadrantHeight + margin;

  const pathCenterX = (minX + maxX) / 2;
  const pathCenterY = (minY + maxY) / 2;

  const quadrantCenterX = offsetX + quadrantWidth / 2;
  const quadrantCenterY = offsetY + quadrantHeight / 2;

  const translateX = quadrantCenterX - pathCenterX;
  const translateY = quadrantCenterY - pathCenterY;

  return scaledCoordinates.map((coord) => [
    coord[0] + translateX,
    coord[1] + translateY,
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

function findBoundingBox(
  coordinates: [number, number][],
): [number, number, number, number] {
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;

  for (const [x, y] of coordinates) {
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }

  return [minX, maxX, minY, maxY];
}
