import React, { useEffect, useRef, useState } from "react";
import { fabric } from "fabric"; // Ensure Fabric.js is installed and imported
import { useRouter } from "next/router";

export default function Fabric() {
  const router = useRouter();
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const canvasRef = useRef(null);

  // Function to add a textbox to the canvas
  const addTextbox = () => {
    if (!canvas) return;

    const textbox = new fabric.Textbox("Hello Fabric!", {
      left: 50, // Approx. position. Modify as needed
      top: 50, // Approx. position. Modify as needed
      width: 150, // Approx. width. The textbox will adjust.
      fontSize: 20,
    });

    canvas.add(textbox);
    // Ensures the textbox is selected for immediate editing by the user
    canvas.setActiveObject(textbox);
    textbox.enterEditing(); // Places the cursor in the textbox
    textbox.selectAll(); // Optional: Selects all the text inside for easy replacement
    canvas.renderAll();
  };

  useEffect(() => {
    if (canvasRef.current && !canvas) {
      // Initialize Fabric.js canvas
      const fabricCanvas = new fabric.Canvas(canvasRef.current, {
        width: 1000,
        height: 500,
      });
      setCanvas(fabricCanvas); // set the canvas to state
    }

    // Cleanup function to dispose of the canvas when the component unmounts
    return () => {
      if (canvas) {
        canvas.dispose();
        setCanvas(null);
      }
    };
  }, [canvas]); // Dependency on the canvas state

  useEffect(() => {
    const { svg } = router.query;

    if (canvas && svg) {
      const svgUrl = Array.isArray(svg) ? svg[0] : svg;

      if (typeof svgUrl === "string") {
        fabric.loadSVGFromURL(
          svgUrl,
          function (objects, options) {
            const obj = fabric.util.groupSVGElements(objects, options);

            if (!obj.width || !canvas.width) {
              // Checking for potential 'undefined'
              console.error("Missing dimensions information");
              return;
            }

            // modify this scaling as needed
            const scale = canvas.width / obj.width;
            obj.scale(scale).center();

            canvas.add(obj).renderAll();
          },
          function (err: Error) {
            console.error("Error loading SVG:", err);
          },
        );
      } else {
        console.error("Invalid SVG URL");
      }
    }
  }, [canvas, router]);

  return (
    <div className="m-4 space-y-4">
      {/* Canvas element which will be used by Fabric.js */}
      <div className="min-w-[300px] border text-center shadow-lg sm:min-w-[800px]">
        <canvas ref={canvasRef}></canvas>
      </div>

      <button onClick={addTextbox}>Add Textbox</button>
    </div>
  );
}
