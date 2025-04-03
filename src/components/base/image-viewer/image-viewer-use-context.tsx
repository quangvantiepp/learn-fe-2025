import React, { useState, useRef, useEffect } from "react";
import styled from "@emotion/styled";
import ContextMenu, {
  CanvasContext,
  ContextMenuOption,
  useContextMenu,
} from "./context-menu";

// Interfaces
interface ImageViewerProps {
  images: string[]; // Array of image URLs
  displayMode?: "single" | "double"; // New prop to control display mode
}

interface ViewportState {
  scale: number;
  offsetX: number;
  offsetY: number;
  rotation: number; // in degrees
}

// Styled Components
const Container = styled.div`
  display: flex;
  height: 600px;
  width: 100%;
`;

const ImageListPanel = styled.div`
  width: 200px;
  overflow-y: auto;
  border-right: 1px solid #ccc;
  padding: 10px;
`;

const PanelTitle = styled.h3`
  margin-top: 0;
`;

const ThumbnailList = styled.div`
  display: flex;
  flex-direction: column;
`;

const ThumbnailContainer = styled.div<{ isSelected: boolean }>`
  width: 100%;
  height: 80px;
  margin-bottom: 10px;
  cursor: pointer;
  border: ${(props) =>
    props.isSelected ? "2px solid #0066ff" : "1px solid #ddd"};
  border-radius: 4px;
  overflow: hidden;
  background-color: #f8f8f8;
  position: relative;
`;

const ThumbnailContent = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ThumbnailImage = styled.img<{ isLoaded: boolean }>`
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  opacity: ${(props) => (props.isLoaded ? 1 : 0.3)};
`;

const LoadingIndicator = styled.div`
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: #666;
`;

const ThumbnailLabel = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 2px 5px;
  font-size: 12px;
  text-align: center;
`;

const ViewerContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const ControlsBar = styled.div`
  display: flex;
  justify-content: center;
  padding: 10px;
  background-color: #f5f5f5;
  border-bottom: 1px solid #ddd;
`;

const ControlButton = styled.button`
  margin: 0 5px;
  padding: 5px 10px;
`;

const ViewerArea = styled.div<{ isSingleMode: boolean }>`
  display: flex;
  flex: 1;
  overflow: hidden;
  width: ${(props) => (props.isSingleMode ? "50%" : "100%")};
  margin: ${(props) => (props.isSingleMode ? "0 auto" : "0")};
`;

const ImageViewPanel = styled.div<{ isSingleMode: boolean }>`
  flex: 1;
  padding: 10px;
  width: ${(props) => (props.isSingleMode ? "100%" : "50%")};
`;

const CanvasContainer = styled.div`
  position: relative;
  height: calc(100% - 50px);
  border: 1px solid #ddd;
  background-color: #f0f0f0;
  overflow: hidden;
  touch-action: none; /* Prevent touch actions for mobile */
`;

const StyledCanvas = styled.canvas`
  display: block;
  width: 100%;
  height: 100%;
`;

const StatusBar = styled.div`
  padding: 5px 10px;
  border-top: 1px solid #ddd;
  font-size: 12px;
  color: #666;
  background-color: #f5f5f5;
`;

const NoImageSelectedMessage = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #666;
  background-color: #f8f8f8;
`;

const ImageViewerFull1: React.FC<ImageViewerProps> = ({
  images,
  displayMode = "double", // Default to double mode
}) => {
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
  const leftCanvasContainerRef = useRef<HTMLDivElement>(null);
  const rightCanvasContainerRef = useRef<HTMLDivElement>(null);
  const [thumbnailsLoaded, setThumbnailsLoaded] = useState<boolean[]>([]);

  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Store viewportState in a ref to access current value in event handlers
  const viewportStateRef = useRef(viewportState);

  ///////////////////// menu
  // Sử dụng custom hook cho context menu
  const {
    contextMenuProps,
    showContextMenu,
    // hideContextMenu,
    menuContext,
  } = useContextMenu();

  // Các hàm xử lý ảnh với kiểm tra an toàn
  const applyGrayscale = () => {
    // Kiểm tra an toàn
    if (
      !menuContext ||
      !menuContext.canvasRef?.current ||
      !menuContext.imageRef.current
    )
      return;

    const canvas = menuContext.canvasRef?.current;
    const image = menuContext.imageRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Vẽ lại ảnh gốc trước khi áp dụng hiệu ứng
    drawImage(canvas, image);

    // Áp dụng filter grayscale
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
      data[i] = avg; // red
      data[i + 1] = avg; // green
      data[i + 2] = avg; // blue
    }

    ctx.putImageData(imageData, 0, 0);
  };

  const applyInvert = () => {
    // Kiểm tra an toàn
    if (
      !menuContext ||
      !menuContext.canvasRef?.current ||
      !menuContext.imageRef.current
    )
      return;

    const canvas = menuContext.canvasRef.current;
    const image = menuContext.imageRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Vẽ lại ảnh gốc trước khi áp dụng hiệu ứng
    drawImage(canvas, image);

    // Áp dụng filter invert
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      data[i] = 255 - data[i]; // red
      data[i + 1] = 255 - data[i + 1]; // green
      data[i + 2] = 255 - data[i + 2]; // blue
    }

    ctx.putImageData(imageData, 0, 0);
  };

  const saveCanvasAsImage = () => {
    // Kiểm tra an toàn
    if (!menuContext || !menuContext.canvasRef?.current) return;

    const canvas = menuContext.canvasRef.current;

    try {
      // Tạo URL từ nội dung canvas
      const dataUrl = canvas.toDataURL("image/png");

      // Tạo link tải xuống
      const link = document.createElement("a");
      link.download = `image-${new Date().getTime()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Error saving image:", error);
    }
  };

  // Định nghĩa các tùy chọn menu
  const getContextMenuOptions = (): ContextMenuOption[] => [
    {
      label: "Chuyển thành đen trắng",
      action: applyGrayscale,
    },
    {
      label: "Đảo ngược màu sắc",
      action: applyInvert,
    },
    {
      label: "Xoay ảnh 90° phải",
      action: () => {
        setViewportState((prev) => ({
          ...prev,
          rotation: (prev.rotation + 90) % 360,
        }));
      },
      divider: true, // Thêm đường kẻ sau mục này
    },
    {
      label: "Lưu ảnh",
      action: saveCanvasAsImage,
    },
  ];

  // Hàm xử lý chuột phải cho canvas
  const handleCanvasContextMenu = (
    e: React.MouseEvent,
    canvasRef: React.RefObject<HTMLCanvasElement | null>,
    imageRef: React.RefObject<HTMLImageElement | null>
  ) => {
    // Truyền context với kiểu dữ liệu cụ thể
    const context: CanvasContext = { canvasRef, imageRef };
    showContextMenu(e, context);
  };

  ///////////////////// menu

  // Keep the ref updated with the latest state
  useEffect(() => {
    viewportStateRef.current = viewportState;
  }, [viewportState]);

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
    if (displayMode === "double" && images[selectedImageIndex + 1]) {
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

    // Immediately setup wheel event listeners when an image is selected
    setupWheelEventListeners();

    return () => {
      // Clean up the event listeners when image selection changes
      cleanupWheelEventListeners();
    };
  }, [selectedImageIndex, images, displayMode]);

  // Redraw canvases when viewport state changes
  useEffect(() => {
    if (leftImageRef.current) {
      drawImage(leftCanvasRef.current, leftImageRef.current);
    }
    if (rightImageRef.current && displayMode === "double") {
      drawImage(rightCanvasRef.current, rightImageRef.current);
    }
  }, [viewportState, displayMode]);

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

  // Define direct event handler function that uses the ref
  const handleMouseWheel = (e: WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const zoomIntensity = 0.1;
    const delta = e.deltaY < 0 ? zoomIntensity : -zoomIntensity;

    // Access current state via ref
    const currentScale = viewportStateRef.current.scale;
    const newScale = Math.max(0.1, currentScale + delta);

    setViewportState((prev) => ({
      ...prev,
      scale: newScale,
    }));

    return false;
  };

  // Create separate functions for adding and removing event listeners
  const setupWheelEventListeners = () => {
    const leftContainer = leftCanvasContainerRef.current;
    const rightContainer = rightCanvasContainerRef.current;

    if (leftContainer) {
      leftContainer.addEventListener("wheel", handleMouseWheel, {
        passive: false,
      });
    }

    if (rightContainer && displayMode === "double") {
      rightContainer.addEventListener("wheel", handleMouseWheel, {
        passive: false,
      });
    }

    // Use capture phase to intercept wheel events before they bubble up
    document.addEventListener("wheel", documentWheelHandler, {
      passive: false,
      capture: true,
    });
  };

  const cleanupWheelEventListeners = () => {
    const leftContainer = leftCanvasContainerRef.current;
    const rightContainer = rightCanvasContainerRef.current;

    if (leftContainer) {
      leftContainer.removeEventListener("wheel", handleMouseWheel);
    }
    if (rightContainer) {
      rightContainer.removeEventListener("wheel", handleMouseWheel);
    }
    document.removeEventListener("wheel", documentWheelHandler, {
      capture: true,
    });
  };

  // Document wheel handler to prevent scrolling
  const documentWheelHandler = (e: WheelEvent) => {
    const leftContainer = leftCanvasContainerRef.current;
    const rightContainer = rightCanvasContainerRef.current;

    if (
      (leftContainer && leftContainer.contains(e.target as Node)) ||
      (rightContainer && rightContainer.contains(e.target as Node))
    ) {
      e.preventDefault();
    }
  };

  // Add effect for handling the wheel event listeners directly when component mounts
  useEffect(() => {
    // Set up listeners when component mounts and selectedImageIndex is not null
    if (selectedImageIndex !== null) {
      setupWheelEventListeners();
    }

    // Clean up on unmount
    return () => {
      cleanupWheelEventListeners();
    };
  }, [displayMode]); // Only re-run when displayMode changes

  const drawImage = (
    canvas: HTMLCanvasElement | null,
    image: HTMLImageElement
  ) => {
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Resize canvas to match container size for better resolution
    const container = canvas.parentElement;
    if (container) {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
    }

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
      <ThumbnailContainer
        key={index}
        isSelected={selectedImageIndex === index}
        onClick={() => handleImageSelect(index)}
      >
        <ThumbnailContent>
          <ThumbnailImage
            src={imageUrl}
            alt={`Thumbnail ${index + 1}`}
            isLoaded={thumbnailsLoaded[index]}
            onLoad={() => {
              setThumbnailsLoaded((prev) => {
                const newState = [...prev];
                newState[index] = true;
                return newState;
              });
            }}
          />
          {!thumbnailsLoaded[index] && (
            <LoadingIndicator>Loading...</LoadingIndicator>
          )}
        </ThumbnailContent>
        <ThumbnailLabel>Image {index + 1}</ThumbnailLabel>
      </ThumbnailContainer>
    );
  };

  // For handling window resize and canvas size adjustments
  useEffect(() => {
    const handleResize = () => {
      if (leftImageRef.current) {
        drawImage(leftCanvasRef.current, leftImageRef.current);
      }
      if (rightImageRef.current && displayMode === "double") {
        drawImage(rightCanvasRef.current, rightImageRef.current);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [displayMode]);

  return (
    <Container>
      {/* Image List Panel with Thumbnails */}
      <ImageListPanel>
        <PanelTitle>Images</PanelTitle>
        <ThumbnailList>
          {images.map((image, index) => renderThumbnail(image, index))}
        </ThumbnailList>
      </ImageListPanel>

      {/* Image Viewer Panels */}
      {selectedImageIndex !== null ? (
        <ViewerContainer>
          {/* Controls */}
          <ControlsBar>
            <ControlButton onClick={handleZoomIn}>Zoom In (+)</ControlButton>
            <ControlButton onClick={handleZoomOut}>Zoom Out (-)</ControlButton>
            <ControlButton onClick={resetView}>Reset View</ControlButton>
            <ControlButton onClick={handleRotateLeft}>
              Rotate Left (↺)
            </ControlButton>
            <ControlButton onClick={handleRotateRight}>
              Rotate Right (↻)
            </ControlButton>
          </ControlsBar>

          {/* Image Viewer Area */}
          <ViewerArea isSingleMode={displayMode === "single"}>
            {/* Left Canvas */}
            <ImageViewPanel isSingleMode={displayMode === "single"}>
              <PanelTitle>Image {selectedImageIndex + 1}</PanelTitle>
              <CanvasContainer
                ref={leftCanvasContainerRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onContextMenu={(e) =>
                  handleCanvasContextMenu(e, leftCanvasRef, leftImageRef)
                }
              >
                <StyledCanvas ref={leftCanvasRef} width={500} height={400} />
              </CanvasContainer>
            </ImageViewPanel>

            {/* Right Canvas (shows next image if available) */}
            {displayMode === "double" && (
              <ImageViewPanel isSingleMode={false}>
                <PanelTitle>
                  {images[selectedImageIndex + 1]
                    ? `Image ${selectedImageIndex + 2}`
                    : "No image selected"}
                </PanelTitle>
                <CanvasContainer
                  ref={rightCanvasContainerRef}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  onContextMenu={(e) =>
                    handleCanvasContextMenu(e, rightCanvasRef, rightImageRef)
                  }
                >
                  <StyledCanvas ref={rightCanvasRef} width={500} height={400} />
                </CanvasContainer>
              </ImageViewPanel>
            )}
          </ViewerArea>

          {/* Status Bar */}
          <StatusBar>
            Scale: {(viewportState.scale * 100).toFixed(0)}% | Rotation:{" "}
            {viewportState.rotation}° | Position: X:{" "}
            {Math.round(viewportState.offsetX)}, Y:{" "}
            {Math.round(viewportState.offsetY)}
          </StatusBar>
        </ViewerContainer>
      ) : (
        <NoImageSelectedMessage>
          Select an image from the list to view
        </NoImageSelectedMessage>
      )}

      <ContextMenu {...contextMenuProps} options={getContextMenuOptions()} />
    </Container>
  );
};

export default ImageViewerFull1;

// Example usage:
// Single mode: <ImageViewer images={['url1.jpg', 'url2.jpg']} displayMode="single" />
// Double mode: <ImageViewer images={['url1.jpg', 'url2.jpg']} displayMode="double" />
