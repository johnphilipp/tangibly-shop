export const getSVGBase64 = (svgRef: SVGSVGElement) => {
  if (!svgRef) return;

  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(svgRef);

  // Convert to Base64
  return btoa(unescape(encodeURIComponent(svgString)));
};
