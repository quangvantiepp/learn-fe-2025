import React, { useState, useRef, useEffect } from "react";

interface ImageViewerProps {
  images: string[]; // Array of image URLs
}

interface ViewportState {
  scale: number;
  offsetX: number;
  offsetY: number;
  rotation: number; // in degrees
}

const ImageViewerFull: React.FC<ImageViewerProps> = ({ images }) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
    null
  );
  const [viewportState, setViewportState] = useState<ViewportState>({
    scale: 1,
    offsetX: 0,
    offsetY: 0,
    rotation: 0,
  });

  const leftCanvasRef = useRef<HTMLCanvasElement>(null);
  const rightCanvasRef = useRef<HTMLCanvasElement>(null);
  const leftImageRef = useRef<HTMLImageElement | null>(null);
  const rightImageRef = useRef<HTMLImageElement | null>(null);
  const [thumbnailsLoaded, setThumbnailsLoaded] = useState<boolean[]>([]);

  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Initialize thumbnails loaded state
  useEffect(() => {
    setThumbnailsLoaded(Array(images.length).fill(false));
  }, [images.length]);

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

  // Preload thumbnails
  useEffect(() => {
    images.forEach((imgUrl, index) => {
      const img = new Image();
      img.onload = () => {
        setThumbnailsLoaded((prev) => {
          const newState = [...prev];
          newState[index] = true;
          return newState;
        });
      };
      img.src = imgUrl;
    });
  }, [images]);

  const drawImage = (
    canvas: HTMLCanvasElement | null,
    image: HTMLImageElement
  ) => {
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Save the current context state
    ctx.save();

    // Get viewport values
    const { scale, offsetX, offsetY, rotation } = viewportState;

    // Translate to center of canvas
    ctx.translate(canvas.width / 2, canvas.height / 2);

    // Apply rotation (convert degrees to radians)
    ctx.rotate((rotation * Math.PI) / 180);

    // Apply scale
    ctx.scale(scale, scale);

    // Apply translation (adjusted for scaling)
    ctx.translate(offsetX / scale, offsetY / scale);

    // Draw image centered
    ctx.drawImage(
      image,
      -image.width / 2,
      -image.height / 2,
      image.width,
      image.height
    );

    // Restore the context state
    ctx.restore();
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
    resetView();
  };

  const resetView = () => {
    setViewportState({
      scale: 1,
      offsetX: 0,
      offsetY: 0,
      rotation: 0,
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

  const handleZoomIn = () => {
    setViewportState((prev) => ({
      ...prev,
      scale: Math.min(10, prev.scale + 0.1), // Max zoom limit of 10x
    }));
  };

  const handleZoomOut = () => {
    setViewportState((prev) => ({
      ...prev,
      scale: Math.max(0.1, prev.scale - 0.1), // Min zoom limit of 0.1x
    }));
  };

  const handleRotateLeft = () => {
    setViewportState((prev) => ({
      ...prev,
      rotation: (prev.rotation - 90) % 360,
    }));
  };

  const handleRotateRight = () => {
    setViewportState((prev) => ({
      ...prev,
      rotation: (prev.rotation + 90) % 360,
    }));
  };

  const renderThumbnail = (imageUrl: string, index: number) => {
    return (
      <div
        className="thumbnail-container"
        style={{
          width: "100%",
          height: "80px",
          marginBottom: "10px",
          cursor: "pointer",
          border:
            selectedImageIndex === index
              ? "2px solid #0066ff"
              : "1px solid #ddd",
          borderRadius: "4px",
          overflow: "hidden",
          backgroundColor: "#f8f8f8",
          position: "relative",
        }}
        onClick={() => handleImageSelect(index)}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <img
            src={imageUrl}
            alt={`Thumbnail ${index + 1}`}
            style={{
              maxWidth: "100%",
              maxHeight: "100%",
              objectFit: "contain",
              opacity: thumbnailsLoaded[index] ? 1 : 0.3,
            }}
            onLoad={() => {
              setThumbnailsLoaded((prev) => {
                const newState = [...prev];
                newState[index] = true;
                return newState;
              });
            }}
          />
          {!thumbnailsLoaded[index] && (
            <div
              style={{
                position: "absolute",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "12px",
                color: "#666",
              }}
            >
              Loading...
            </div>
          )}
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: "rgba(0,0,0,0.6)",
            color: "white",
            padding: "2px 5px",
            fontSize: "12px",
            textAlign: "center",
          }}
        >
          Image {index + 1}
        </div>
      </div>
    );
  };

  return (
    <div
      className="image-viewer-container"
      style={{ display: "flex", height: "600px", width: "100%" }}
    >
      {/* Image List Panel with Thumbnails */}
      <div
        className="image-list"
        style={{
          width: "200px",
          overflowY: "auto",
          borderRight: "1px solid #ccc",
          padding: "10px",
        }}
      >
        <h3 style={{ marginTop: 0 }}>Images</h3>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {images.map((image, index) => renderThumbnail(image, index))}
        </div>
      </div>

      {/* Image Viewer Panels */}
      {selectedImageIndex !== null ? (
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          {/* Controls */}
          <div
            className="controls"
            style={{
              display: "flex",
              justifyContent: "center",
              padding: "10px",
              backgroundColor: "#f5f5f5",
              borderBottom: "1px solid #ddd",
            }}
          >
            <button
              onClick={handleZoomIn}
              style={{ margin: "0 5px", padding: "5px 10px" }}
            >
              Zoom In (+)
            </button>
            <button
              onClick={handleZoomOut}
              style={{ margin: "0 5px", padding: "5px 10px" }}
            >
              Zoom Out (-)
            </button>
            <button
              onClick={resetView}
              style={{ margin: "0 5px", padding: "5px 10px" }}
            >
              Reset View
            </button>
            <button
              onClick={handleRotateLeft}
              style={{ margin: "0 5px", padding: "5px 10px" }}
            >
              Rotate Left (↺)
            </button>
            <button
              onClick={handleRotateRight}
              style={{ margin: "0 5px", padding: "5px 10px" }}
            >
              Rotate Right (↻)
            </button>
          </div>

          {/* Image Viewer Area */}
          <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
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
                  height: "calc(100% - 50px)",
                  border: "1px solid #ddd",
                  backgroundColor: "#f0f0f0",
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
                  height: "calc(100% - 50px)",
                  border: "1px solid #ddd",
                  backgroundColor: "#f0f0f0",
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
          </div>

          {/* Status Bar */}
          <div
            style={{
              padding: "5px 10px",
              borderTop: "1px solid #ddd",
              fontSize: "12px",
              color: "#666",
              backgroundColor: "#f5f5f5",
            }}
          >
            Scale: {(viewportState.scale * 100).toFixed(0)}% | Rotation:{" "}
            {viewportState.rotation}° | Position: X:{" "}
            {Math.round(viewportState.offsetX)}, Y:{" "}
            {Math.round(viewportState.offsetY)}
          </div>
        </div>
      ) : (
        <div
          style={{
            flex: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            color: "#666",
            backgroundColor: "#f8f8f8",
          }}
        >
          Select an image from the list to view
        </div>
      )}
    </div>
  );
};

export default ImageViewerFull;

// Example usage:
// <ImageViewer images={['url1.jpg', 'url2.jpg', 'url3.jpg']} />
