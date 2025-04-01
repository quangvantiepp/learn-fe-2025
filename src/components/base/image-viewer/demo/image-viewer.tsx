import React, { useState, useRef, useEffect } from "react";

interface ImageViewerProps {
  images: string[]; // Array of image URLs
}

interface ViewportState {
  scale: number;
  offsetX: number;
  offsetY: number;
}

const ImageViewer: React.FC<ImageViewerProps> = ({ images }) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
    null
  );
  const [viewportState, setViewportState] = useState<ViewportState>({
    scale: 1,
    offsetX: 0,
    offsetY: 0,
  });

  const leftCanvasRef = useRef<HTMLCanvasElement>(null);
  const rightCanvasRef = useRef<HTMLCanvasElement>(null);
  const leftImageRef = useRef<HTMLImageElement | null>(null);
  const rightImageRef = useRef<HTMLImageElement | null>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Load images when selected
  useEffect(() => {
    if (selectedImageIndex === null || !images[selectedImageIndex]) return;

    const loadImage = (url: string): Promise<HTMLImageElement> => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = url;
      });
    };

    // Load the selected image
    loadImage(images[selectedImageIndex])
      .then((img) => {
        leftImageRef.current = img;
        drawImage(leftCanvasRef.current, img);
      })
      .catch((err) => console.error("Failed to load left image:", err));

    // Load the next image (if exists) for the right viewer
    if (images[selectedImageIndex + 1]) {
      loadImage(images[selectedImageIndex + 1])
        .then((img) => {
          rightImageRef.current = img;
          drawImage(rightCanvasRef.current, img);
        })
        .catch((err) => console.error("Failed to load right image:", err));
    } else {
      rightImageRef.current = null;
      clearCanvas(rightCanvasRef.current);
    }
  }, [selectedImageIndex, images]);

  // Redraw canvases when viewport state changes
  useEffect(() => {
    if (leftImageRef.current) {
      drawImage(leftCanvasRef.current, leftImageRef.current);
    }
    if (rightImageRef.current) {
      drawImage(rightCanvasRef.current, rightImageRef.current);
    }
  }, [viewportState]);

  const drawImage = (
    canvas: HTMLCanvasElement | null,
    image: HTMLImageElement
  ) => {
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calculate centered position
    const { scale, offsetX, offsetY } = viewportState;

    const scaledWidth = image.width * scale;
    const scaledHeight = image.height * scale;

    // Center the image initially
    const x = (canvas.width - scaledWidth) / 2 + offsetX;
    const y = (canvas.height - scaledHeight) / 2 + offsetY;

    // Draw the image
    ctx.drawImage(image, x, y, scaledWidth, scaledHeight);
  };

  const clearCanvas = (canvas: HTMLCanvasElement | null) => {
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const handleImageSelect = (index: number) => {
    setSelectedImageIndex(index);
    // Reset viewport when selecting a new image
    setViewportState({
      scale: 1,
      offsetX: 0,
      offsetY: 0,
    });
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();

    // Determine zoom direction and calculate new scale
    const zoomIntensity = 0.1;
    const delta = e.deltaY < 0 ? zoomIntensity : -zoomIntensity;
    const newScale = Math.max(0.1, viewportState.scale + delta);

    setViewportState((prev) => ({
      ...prev,
      scale: newScale,
    }));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - viewportState.offsetX,
      y: e.clientY - viewportState.offsetY,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;

    const newOffsetX = e.clientX - dragStart.x;
    const newOffsetY = e.clientY - dragStart.y;

    setViewportState((prev) => ({
      ...prev,
      offsetX: newOffsetX,
      offsetY: newOffsetY,
    }));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div
      className="image-viewer-container"
      style={{ display: "flex", height: "500px", width: "100%" }}
    >
      {/* Image List Panel */}
      <div
        className="image-list"
        style={{
          width: "200px",
          overflowY: "auto",
          borderRight: "1px solid #ccc",
        }}
      >
        <h3>Images</h3>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {images.map((image, index) => (
            <li
              key={index}
              style={{
                padding: "8px",
                cursor: "pointer",
                backgroundColor:
                  selectedImageIndex === index ? "#f0f0f0" : "transparent",
              }}
              onClick={() => handleImageSelect(index)}
            >
              Image {index + 1}
            </li>
          ))}
        </ul>
      </div>

      {/* Image Viewer Panels */}
      {selectedImageIndex !== null && (
        <>
          {/* Left Canvas */}
          <div
            className="image-view-panel"
            style={{ flex: 1, padding: "10px" }}
          >
            <h3>Image {selectedImageIndex + 1}</h3>
            <div
              className="canvas-container"
              style={{
                position: "relative",
                height: "400px",
                border: "1px solid #ddd",
              }}
              onWheel={handleWheel}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              <canvas
                ref={leftCanvasRef}
                width={500}
                height={400}
                style={{ display: "block", width: "100%", height: "100%" }}
              />
            </div>
          </div>

          {/* Right Canvas (shows next image if available) */}
          <div
            className="image-view-panel"
            style={{ flex: 1, padding: "10px" }}
          >
            <h3>
              {images[selectedImageIndex + 1]
                ? `Image ${selectedImageIndex + 2}`
                : "No image selected"}
            </h3>
            <div
              className="canvas-container"
              style={{
                position: "relative",
                height: "400px",
                border: "1px solid #ddd",
              }}
              onWheel={handleWheel}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              <canvas
                ref={rightCanvasRef}
                width={500}
                height={400}
                style={{ display: "block", width: "100%", height: "100%" }}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ImageViewer;

// Example usage:
// <ImageViewer images={['url1.jpg', 'url2.jpg', 'url3.jpg']} />
