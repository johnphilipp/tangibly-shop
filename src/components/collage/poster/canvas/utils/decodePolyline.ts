import polyline from "@mapbox/polyline";

export function decodePolyline(data: string): [number, number][] {
  return (polyline as { decode: (str: string) => [number, number][] }).decode(
    data,
  );
}
