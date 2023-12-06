export function convertToSVGPath(coordinates: [number, number][]): string {
  return coordinates
    .map((coord, index) => {
      const command = index === 0 ? "M" : "L";
      return `${command} ${coord[0]} ${coord[1]}`;
    })
    .join(" ");
}
