export function handleDownload(svgRef: React.RefObject<SVGSVGElement>) {
  if (svgRef.current) {
    const dataURL = svgToDataURL(svgRef.current);
    const downloadLink = document.createElement("a");
    downloadLink.href = dataURL;
    downloadLink.download = "downloaded_svg.svg";
    downloadLink.click();
  }
}

function svgToDataURL(svg: SVGSVGElement): string {
  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(svg);
  return `data:image/svg+xml,${encodeURIComponent(svgString)}`;
}
