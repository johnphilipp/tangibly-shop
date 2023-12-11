export const getSVGBase64 = (svgNode: SVGSVGElement | null): string | null => {
  if (!svgNode) return null;

  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(svgNode);

  // Convert to Base64
  return btoa(unescape(encodeURIComponent(svgString)));
};
