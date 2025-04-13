import { useState } from "react";
import Button from "../../ui/button/Button";
import { useToast } from "./model-ui-toolkit/use-toast";
import { ToastPosition } from "./toast-type";

export const MainContent = () => {
  const { showToast, hideToast } = useToast();
  const [test, setTest] = useState<number>(0);

  const handleShowSuccessToast = (position: ToastPosition) => {
    showToast({
      variant: "success",
      title: "Success",
      description: "Your changes have been saved successfully!",
      duration: 5000,
      position: position,
    });
  };

  const handleShowToastWithAction = (position: ToastPosition) => {
    showToast({
      variant: "default",
      title: "Success",
      description: `Your changes have been saved successfully!
      Your changes have been saved <successfully! className="Your changes have been saved successfully!
      
      Your changes have been saved successfully!"></successfully!>
      `,
      action: {
        content: <button style={{ fontSize: 12 }}>Undo</button>,
        altText: "Undo last action",
        onClick: () => hideToast(),
        // variant: "primary",
      },
      duration: 50000,
      position: position,
      hasIcon: true,
    });
  };

  const handleShowToastWithOutDes = (position: ToastPosition) => {
    showToast({
      variant: "default",
      title: "Success hello lfdsfsdf",
      duration: 50000,
      position: position,
      hasIcon: true,
      action: {
        content: <button style={{ fontSize: 12, float: "right" }}>Undo</button>,
        altText: "Undo last action",
        onClick: () => hideToast(),
        // variant: "primary",
      },
    });
  };

  const handleShowCustomToast = () => {
    showToast({
      position: "top-right",
      title: "Custom Toast Title",
      duration: 50000,
      description: "This is a custom toast with custom styling!",
      useCustomStyle: true,
      customRender: ({ onClose }) => {
        // return <>{description}</>;
        return (
          <div
            style={{
              padding: "12px",
              background: "linear-gradient(135deg, #667eea, #764ba2)",
              borderRadius: "8px",
              color: "white",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "bold" }}>
                Custom Toast Title
              </h3>
              <button
                onClick={onClose}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "white",
                  cursor: "pointer",
                  fontSize: "18px",
                }}
              >
                ×
              </button>
            </div>
            <p style={{ margin: 0, fontSize: "14px" }}>
              This is a completely custom toast with custom styling!
            </p>
            <Button
              onClick={() => {
                console.log("Custom action clicked");
                if (onClose) {
                  onClose();
                }
              }}
              style={{
                alignSelf: "flex-end",
                background: "rgba(255,255,255,0.2)",
                border: "none",
                borderRadius: "4px",
                color: "white",
                cursor: "pointer",
                padding: "6px 12px",
                fontSize: "12px",
              }}
            >
              Action
            </Button>
          </div>
        );
      },
    });
  };

  // Sử dụng đơn giản hơn, không cần cài đặt Provider và các component con
  return (
    <div style={{ padding: "20px" }}>
      <h1>Improved Toast Example</h1>

      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <button
          onClick={() => {
            setTest((prev) => prev + 1);
            console.log("test", test);
            showToast({
              variant: "default",
              title: "Information" + test,
              description: "A new feature is available!",
              position: "top-left",
              duration: 2000,
            });
          }}
        >
          Show Default top-left
        </button>
        <button onClick={() => handleShowSuccessToast("top-center")}>
          Show Success Toast
        </button>
        <button
          onClick={() =>
            showToast({
              variant: "error",
              title: "Error",
              description: "An error occurred while saving your changes.",
              position: "top-right",
              duration: 2000,
            })
          }
        >
          Show Error top-right
        </button>
        <button
          onClick={() =>
            showToast({
              variant: "info",
              title: "Information",
              description: "A new feature is available!",
              position: "bottom-left",
            })
          }
        >
          Show Info bottom-left
        </button>
        <button onClick={() => handleShowToastWithOutDes("bottom-center")}>
          Show with out description bottom-center
        </button>
        <button onClick={() => handleShowToastWithAction("bottom-right")}>
          Show Toast Action bottom-right
        </button>
        <Button onClick={handleShowCustomToast}>Show Custom Toast</Button>
      </div>
    </div>
  );
};
