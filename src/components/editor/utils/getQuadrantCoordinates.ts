import { SVG_HEIGHT, SVG_WIDTH } from "../Editor";
import { decodePolyline } from "./decodePolyline";

export function getQuadrantCoordinates(
  polylineData: string,
  index: number,
  padding: number,
): [number, number][] {
  const coordinates = decodePolyline(polylineData);
  const scaledCoordinates = scaleCoordinates(coordinates, padding);
  const [minX, maxX, minY, maxY] = findBoundingBox(scaledCoordinates);

  const row = Math.floor(index / 10);
  const col = index % 10;

  const quadrantWidth = (SVG_WIDTH - padding * 11) / 10;
  const quadrantHeight = (SVG_HEIGHT - padding * 6) / 5;

  const offsetX = col * (quadrantWidth + padding) + padding;
  const offsetY = row * (quadrantHeight + padding) + padding;

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
  padding: number,
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

  const quadrantWidth = (SVG_WIDTH - padding * 11) / 10;
  const quadrantHeight = (SVG_HEIGHT - padding * 6) / 5;

  const avgLat = sumLat / coordinates.length;
  const latCorrection = Math.cos((avgLat * Math.PI) / 180);

  const xRange = (maxX - minX) * latCorrection;
  const yRange = maxY - minY;

  // Maintain aspect ratio
  const scale = Math.min(quadrantWidth / xRange, quadrantHeight / yRange);

  return coordinates.map((coord) => [
    (coord[1] - minX) * latCorrection * scale,
    quadrantHeight - (coord[0] - minY) * scale,
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
