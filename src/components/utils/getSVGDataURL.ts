export const getSVGDataURL = (
  svgRef: React.RefObject<SVGSVGElement>,
): string => {
  const svgNode = svgRef.current;
  if (!svgNode) return ""; // Return an empty string if svgNode is not available

  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(svgNode);
  const svgBlob = new Blob([svgString], {
    type: "image/svg+xml;charset=utf-8",
  });

  return URL.createObjectURL(svgBlob);
};
