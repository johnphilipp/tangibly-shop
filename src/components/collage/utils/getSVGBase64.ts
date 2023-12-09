export const getSVGBase64 = (svgRef: SVGSVGElement) => {
  const svgNode = svgRef.current;
  if (!svgNode) return;

  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(svgNode);

  // Convert to Base64
  const base64 = btoa(unescape(encodeURIComponent(svgString)));

  return base64;
};
