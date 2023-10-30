import React, { useRef, useEffect } from "react";

interface Format {
  numCols: number;
  headingBoxes: number[];
  yearBoxes: number[];
  statsBoxes: number[];
}

const texts = {
  headingBoxes: "IT'S A WRAP",
  yearBoxes: "2023",
  statsBoxes: "123",
};

const formats: Format[] = [
  {
    numCols: 5,
    headingBoxes: [6, 7, 8],
    yearBoxes: [16, 17, 18],
    statsBoxes: [26, 27, 28],
  },
  {
    numCols: 6,
    headingBoxes: [8, 9, 14, 15],
    yearBoxes: [26, 27],
    statsBoxes: [38, 39],
  },
  {
    numCols: 7,
    headingBoxes: [9, 10, 11, 16, 17, 18],
    yearBoxes: [30, 31, 32, 37, 38, 39],
    statsBoxes: [51, 52, 53],
  },
  {
    numCols: 8,
    headingBoxes: [10, 11, 12, 13, 18, 19, 20, 21],
    yearBoxes: [34, 35, 36, 37, 42, 43, 44, 45],
    statsBoxes: [66, 67, 68, 69, 74, 75, 76, 77],
  },
];

export default function Wrapped() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // DIN A4 dimensions
  const width = 595; // these dimensions are in points, typical for PDFs, and correspond to 210 x 297 millimeters
  const height = Math.round(width * 1.414); // keeping the A4 aspect ratio

  // Extracting data for the current format
  const currentFormat = formats.find((format) => format.numCols === 8); // Example: Selecting format with 7 columns

  // Extract required details from the current format
  const { numCols, headingBoxes, yearBoxes, statsBoxes } = currentFormat!;
  const boxSize = width / numCols; // each box is a square

  // Calculate rows and spacing
  const numBoxesDown = Math.floor(height / boxSize);
  const totalBoxHeight = boxSize * numBoxesDown;
  const unusedSpace = height - totalBoxHeight;
  const marginSpace = unusedSpace / 2;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    // Clear previous drawings
    context.clearRect(0, 0, width, height);

    // Prepare to check the index of each box
    const allSpecialBoxes = [...headingBoxes, ...yearBoxes, ...statsBoxes];

    // Helper function to draw text across boxes
    const drawTextAcrossBoxes = (indices: number[], text: string) => {
      // Determine the start and end positions
      const startBox = indices[0]!;
      const endBox = indices[indices.length - 1]!;

      const startY = Math.floor(startBox / numCols);
      const startX = startBox % numCols;

      const endX = endBox % numCols;

      // Calculate positions
      const posX = startX * boxSize;
      const posY = startY * boxSize + marginSpace;
      const textWidth = (endX - startX + 1) * boxSize;

      // Configure text styles
      context.fillStyle = "black"; // Text color
      context.font = "bold 16pt sans-serif"; // Adjust font size and style
      context.textAlign = "center";
      context.textBaseline = "middle";

      // Calculate the center position of the text area
      const centerX = posX + textWidth / 2;
      const centerY = posY + boxSize / 2;

      // Draw the text
      context.fillText(text, centerX, centerY, textWidth); // The textWidth limits the text width, preventing overflow
    };

    for (let y = 0; y < numBoxesDown; y++) {
      for (let x = 0; x < numCols; x++) {
        const boxIndex = y * numCols + x; // Convert 2D position to 1D index
        const posX = x * boxSize;
        const posY = y * boxSize + marginSpace;

        context.beginPath();
        context.rect(posX, posY, boxSize, boxSize);

        // Check if the current box index is one of the special boxes
        if (allSpecialBoxes.includes(boxIndex)) {
          context.fillStyle = "red"; // Fill special boxes with red
          context.fillRect(posX, posY, boxSize, boxSize);
        }

        context.stroke(); // Draw the current box
      }
    }

    // Draw texts
    drawTextAcrossBoxes(headingBoxes, texts.headingBoxes);
    drawTextAcrossBoxes(yearBoxes, texts.yearBoxes);
    drawTextAcrossBoxes(statsBoxes, texts.statsBoxes);
  }, [numCols, headingBoxes, yearBoxes, statsBoxes, boxSize, marginSpace]); // Dependencies for the effect
  // Dependencies for the effect

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{ width: "auto", height: "100%" }} // Adjust this for how you want to display it on the webpage
      className="mx-auto border-2"
    />
  );
}
