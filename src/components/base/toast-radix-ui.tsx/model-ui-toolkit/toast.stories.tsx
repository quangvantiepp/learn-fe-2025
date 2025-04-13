import React from "react";
import { Meta, StoryObj } from "@storybook/react";
import { ToastProvider, ToastSettings } from "./toast-provider";
import { useToast } from "./use-toast";
import styled from "@emotion/styled";
import Button from "../../../ui/button/Button";

// Container for displaying examples
const ExamplesContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 600px;
  margin: 20px auto;
`;

const ButtonGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 12px;
  margin-bottom: 20px;
`;

// Component that will trigger toast notifications
const ToastDemo: React.FC<{
  defaultTitle?: string;
  defaultDescription?: string;
}> = ({
  defaultTitle = "Toast Notification",
  defaultDescription = "This is a toast notification example",
}) => {
  const { showToast } = useToast();

  // Toast variations
  const toastVariants = [
    { label: "Default", variant: "default" },
    { label: "Success", variant: "success" },
    { label: "Warning", variant: "warning" },
    { label: "Error", variant: "error" },
    { label: "Info", variant: "info" },
  ] as const;

  // Toast positions
  const positions = [
    { label: "Top Left", position: "top-left" },
    { label: "Top Center", position: "top-center" },
    { label: "Top Right", position: "top-right" },
    { label: "Bottom Left", position: "bottom-left" },
    { label: "Bottom Center", position: "bottom-center" },
    { label: "Bottom Right", position: "bottom-right" },
  ] as const;

  // Toast sizes
  const sizes = [
    { label: "Small", size: "small" },
    { label: "Medium", size: "medium" },
    { label: "Large", size: "large" },
  ] as const;

  // Basic toast example
  const handleShowBasic = (variant: ToastSettings["variant"] = "default") => {
    showToast({
      title: defaultTitle,
      variant,
    });
  };

  // Toast with description
  const handleShowWithDescription = (
    variant: ToastSettings["variant"] = "default"
  ) => {
    showToast({
      title: defaultTitle,
      description: defaultDescription,
      variant,
    });
  };

  // Toast with position
  const handleShowPosition = (position: ToastSettings["position"]) => {
    showToast({
      title: `Position: ${position}`,
      description: `This toast is positioned at ${position}`,
      position,
    });
  };

  // Toast with custom duration
  const handleShowDuration = (duration: number) => {
    showToast({
      title: `Duration: ${duration}ms`,
      description: `This toast will automatically close after ${
        duration / 1000
      } seconds`,
      duration,
    });
  };

  // Toast with action
  const handleShowWithAction = () => {
    showToast({
      title: "Action Toast",
      description: "This toast has an action button",
      variant: "info",
      action: {
        content: <Button>Click Me</Button>,
        altText: "Action button",
        onClick: () => alert("Action clicked!"),
      },
    });
  };

  // Toast with size
  const handleShowSize = (size: ToastSettings["size"]) => {
    showToast({
      title: `Size: ${size}`,
      description: `This is a ${size} sized toast notification`,
      size,
    });
  };

  // Toast with custom render
  const handleShowCustomRender = () => {
    showToast({
      title: "Custom Render",
      useCustomStyle: true,
      customRender: ({ title, onClose }) => (
        <div
          style={{
            padding: "16px",
            background: "linear-gradient(135deg, #6e8efb, #a777e3)",
            borderRadius: "8px",
            color: "white",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <div
              style={{
                fontWeight: "bold",
                fontSize: "16px",
                marginBottom: "4px",
              }}
            >
              {title}
            </div>
            <div>This is a completely custom styled toast!</div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.2)",
              border: "none",
              borderRadius: "50%",
              width: "24px",
              height: "24px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ✕
          </button>
        </div>
      ),
    });
  };

  // Toast without close button
  const handleShowNonClosable = () => {
    showToast({
      title: "Non-Closable Toast",
      description: "This toast doesn't have a close button",
      closable: false,
      duration: 3000,
    });
  };

  return (
    <ExamplesContainer>
      <h2>Basic Toast Variants</h2>
      <ButtonGrid>
        {toastVariants.map((v) => (
          <Button key={v.variant} onClick={() => handleShowBasic(v.variant)}>
            {v.label}
          </Button>
        ))}
      </ButtonGrid>

      <h2>Toast with Description</h2>
      <ButtonGrid>
        {toastVariants.map((v) => (
          <Button
            key={v.variant}
            onClick={() => handleShowWithDescription(v.variant)}
          >
            {v.label} with Description
          </Button>
        ))}
      </ButtonGrid>

      <h2>Toast Positions</h2>
      <ButtonGrid>
        {positions.map((p) => (
          <Button
            key={p.position}
            onClick={() => handleShowPosition(p.position)}
          >
            {p.label}
          </Button>
        ))}
      </ButtonGrid>

      <h2>Toast Sizes</h2>
      <ButtonGrid>
        {sizes.map((s) => (
          <Button key={s.size} onClick={() => handleShowSize(s.size)}>
            {s.label}
          </Button>
        ))}
      </ButtonGrid>

      <h2>Toast Durations</h2>
      <ButtonGrid>
        <Button onClick={() => handleShowDuration(2000)}>2 Seconds</Button>
        <Button onClick={() => handleShowDuration(5000)}>5 Seconds</Button>
        <Button onClick={() => handleShowDuration(10000)}>10 Seconds</Button>
      </ButtonGrid>

      <h2>Special Configurations</h2>
      <ButtonGrid>
        <Button onClick={handleShowWithAction}>With Action</Button>
        <Button onClick={handleShowCustomRender}>Custom Render</Button>
        <Button onClick={handleShowNonClosable}>Non-Closable</Button>
      </ButtonGrid>
    </ExamplesContainer>
  );
};

// Wrapper component that includes both Provider and Demo
const ToastStory: React.FC = () => {
  return (
    <ToastProvider>
      <ToastDemo />
    </ToastProvider>
  );
};

const meta: Meta<typeof ToastProvider> = {
  title: "Components/Toast",
  component: ToastProvider,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `
# Toast Component

A toast notification system built on Radix UI's Toast primitive that provides a non-intrusive way to display alerts, notifications, and messages to users.

## Features

- Multiple variants: default, success, warning, error, info
- Flexible positioning: top-left, top-right, top-center, bottom-left, bottom-center, bottom-right
- Size options: small, medium, large
- Customizable duration
- Optional action buttons
- Custom styling options
- Fully accessible

## Usage

1. Wrap your application with \`ToastProvider\`:

\`\`\`jsx
import { ToastProvider } from './path-to-toast';

const App = () => (
  <ToastProvider>
    <YourApp />
  </ToastProvider>
);
\`\`\`

2. Use the \`useToast\` hook in your components:

\`\`\`jsx
import { useToast } from './path-to-toast';

const YourComponent = () => {
  const { showToast } = useToast();
  
  const handleClick = () => {
    showToast({
      title: 'Success!',
      description: 'Your action was completed successfully.',
      variant: 'success',
    });
  };
  
  return <button onClick={handleClick}>Show Toast</button>;
};
\`\`\`
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof ToastProvider>;

export const Default: Story = {
  render: () => <ToastStory />,
};

// Example story showcasing a specific toast configuration
export const SuccessToast: Story = {
  render: () => {
    const SuccessExample = () => {
      const { showToast } = useToast();

      React.useEffect(() => {
        // Show the toast when the story loads
        const timer = setTimeout(() => {
          showToast({
            title: "Operation Successful",
            description: "Your data has been saved successfully.",
            variant: "success",
            duration: 3000,
          });
        }, 500);

        return () => clearTimeout(timer);
      }, [showToast]);

      return (
        <div style={{ padding: "20px" }}>
          <h2>Success Toast Example</h2>
          <p>A success toast should appear automatically.</p>
          <Button
            onClick={() => {
              showToast({
                title: "Operation Successful",
                description: "Your data has been saved successfully.",
                variant: "success",
              });
            }}
          >
            Show Again
          </Button>
        </div>
      );
    };

    return (
      <ToastProvider>
        <SuccessExample />
      </ToastProvider>
    );
  },
  parameters: {
    docs: {
      description: {
        story: "This example demonstrates a success toast notification.",
      },
    },
  },
};

// Advanced usage with custom rendering
export const CustomToast: Story = {
  render: () => {
    const CustomExample = () => {
      const { showToast } = useToast();

      const showCustomToast = () => {
        showToast({
          title: "Custom Toast",
          useCustomStyle: true,
          customRender: ({ onClose }) => (
            <div
              style={{
                padding: "16px",
                background: "#2D3748",
                border: "1px solid #4A5568",
                borderLeft: "4px solid #4299E1",
                borderRadius: "4px",
                color: "white",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                width: "100%",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "12px" }}
              >
                <div
                  style={{
                    backgroundColor: "#4299E1",
                    borderRadius: "50%",
                    width: "32px",
                    height: "32px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "16px",
                  }}
                >
                  ℹ️
                </div>
                <div>
                  <div
                    style={{
                      fontWeight: "bold",
                      fontSize: "16px",
                      marginBottom: "4px",
                    }}
                  >
                    Custom Notification
                  </div>
                  <div style={{ fontSize: "14px", opacity: 0.9 }}>
                    This shows how you can completely customize the look and
                    feel.
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "white",
                  cursor: "pointer",
                  fontSize: "18px",
                  opacity: 0.7,
                }}
              >
                ✕
              </button>
            </div>
          ),
        });
      };

      return (
        <div style={{ padding: "20px" }}>
          <h2>Custom Toast Rendering</h2>
          <p>Click the button below to see a completely custom toast design.</p>
          <Button onClick={showCustomToast}>Show Custom Toast</Button>
        </div>
      );
    };

    return (
      <ToastProvider>
        <CustomExample />
      </ToastProvider>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "This example demonstrates how to use the customRender prop to create a completely custom toast design.",
      },
    },
  },
};

// Toast with action button
export const ToastWithAction: Story = {
  render: () => {
    const ActionExample = () => {
      const { showToast } = useToast();

      const showActionToast = () => {
        showToast({
          title: "New Message",
          description: "You have received a new message from John Doe.",
          variant: "info",
          action: {
            content: <Button>View Message</Button>,
            altText: "View the message",
            onClick: () => alert("Opening message..."),
          },
        });
      };

      return (
        <div style={{ padding: "20px" }}>
          <h2>Toast with Action Button</h2>
          <p>
            This example shows a toast with an action button that the user can
            click.
          </p>
          <Button onClick={showActionToast}>Show Action Toast</Button>
        </div>
      );
    };

    return (
      <ToastProvider>
        <ActionExample />
      </ToastProvider>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "This example demonstrates a toast with an interactive action button.",
      },
    },
  },
};
