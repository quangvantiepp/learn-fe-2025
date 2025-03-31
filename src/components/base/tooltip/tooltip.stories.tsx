import React from "react";
import { Meta, StoryObj } from "@storybook/react";
import Tooltip from "./index";
import Button from "../../ui/button/Button";
import styled from "@emotion/styled";

const meta: Meta<typeof Tooltip> = {
  title: "Components/Tooltip",
  component: Tooltip,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A Tooltip component that displays informative text when users hover over an element. Supports different placements, colors, and customization options.",
      },
    },
  },
  argTypes: {
    content: {
      control: "text",
      description: "The content to be displayed inside the tooltip",
    },
    placement: {
      control: { type: "select" },
      options: ["top", "bottom", "left", "right"],
      description: "Position of the tooltip relative to the target element",
    },
    variant: {
      control: { type: "select" },
      options: ["normal", "warning", "accent"],
      description: "Color variant of the tooltip",
    },
    mouseEnterDelay: {
      control: { type: "number" },
      description:
        "Delay in milliseconds before the tooltip appears on mouse enter",
    },
    mouseLeaveDelay: {
      control: { type: "number" },
      description:
        "Delay in milliseconds before the tooltip disappears on mouse leave",
    },
    zIndex: {
      control: { type: "number" },
      description: "Z-index of the tooltip",
    },
    arrow: {
      control: "boolean",
      description: "Whether to show an arrow pointing to the target element",
    },
    children: {
      description: "The target element that triggers the tooltip",
    },
  },
  args: {
    content: "This is a tooltip",
    placement: "top",
    variant: "normal",
    mouseEnterDelay: 300,
    mouseLeaveDelay: 100,
    zIndex: 1000,
    arrow: true,
  },
};

export default meta;
type Story = StoryObj<typeof Tooltip>;

// Basic example
export const Basic: Story = {
  args: {
    content: "Basic tooltip example",
    children: <Button>Hover me</Button>,
  },
};

// Different placements
export const Placements: Story = {
  render: (args) => {
    const Container = styled.div`
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      grid-template-rows: 1fr 1fr 1fr;
      gap: 20px;
      width: 300px;
      height: 200px;
      align-items: center;
      justify-items: center;
    `;

    return (
      <Container>
        <div></div>
        <Tooltip {...args} placement="top" content="Top tooltip">
          <Button>Top</Button>
        </Tooltip>
        <div></div>

        <Tooltip {...args} placement="left" content="Left tooltip">
          <Button>Left</Button>
        </Tooltip>
        <div></div>
        <Tooltip {...args} placement="right" content="Right tooltip">
          <Button>Right</Button>
        </Tooltip>

        <div></div>
        <Tooltip {...args} placement="bottom" content="Bottom tooltip">
          <Button>Bottom</Button>
        </Tooltip>
        <div></div>
      </Container>
    );
  },
};

// Different color variants
export const ColorVariants: Story = {
  render: (args) => {
    const Container = styled.div`
      display: flex;
      gap: 20px;
    `;

    return (
      <Container>
        <Tooltip {...args} variant="normal" content="Normal tooltip">
          <Button>Normal</Button>
        </Tooltip>
        <Tooltip {...args} variant="warning" content="Warning tooltip">
          <Button>Warning</Button>
        </Tooltip>
        <Tooltip {...args} variant="accent" content="Accent tooltip">
          <Button>Accent</Button>
        </Tooltip>
      </Container>
    );
  },
};

// With complex content
export const ComplexContent: Story = {
  args: {
    content: (
      <div>
        <h4 style={{ margin: "0 0 8px 0" }}>Complex Tooltip</h4>
        <p style={{ margin: 0 }}>
          This tooltip contains <strong>formatted text</strong>, multiple lines,
          and can include various elements.
        </p>
      </div>
    ),
    children: <Button>Hover for details</Button>,
  },
};

// Without arrow
export const WithoutArrow: Story = {
  args: {
    content: "Tooltip without an arrow",
    arrow: false,
    children: <Button>No arrow</Button>,
  },
};

// Custom delays
export const CustomDelays: Story = {
  render: () => {
    const Container = styled.div`
      display: flex;
      gap: 20px;
    `;

    return (
      <Container>
        <Tooltip
          content="Quick to appear (100ms)"
          mouseEnterDelay={100}
          mouseLeaveDelay={500}
        >
          <Button>Fast appear</Button>
        </Tooltip>
        <Tooltip
          content="Slow to appear (1000ms)"
          mouseEnterDelay={1000}
          mouseLeaveDelay={100}
        >
          <Button>Slow appear</Button>
        </Tooltip>
        <Tooltip
          content="Slow to disappear (1000ms)"
          mouseEnterDelay={300}
          mouseLeaveDelay={1000}
        >
          <Button>Slow disappear</Button>
        </Tooltip>
      </Container>
    );
  },
};

// Using with different elements
export const DifferentElements: Story = {
  render: (args) => {
    const Container = styled.div`
      display: flex;
      gap: 20px;
      align-items: center;
    `;

    const Icon = styled.div`
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background-color: #eee;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: help;
    `;

    const Text = styled.span`
      text-decoration: underline;
      text-decoration-style: dotted;
      cursor: help;
    `;

    return (
      <Container>
        <Tooltip {...args} content="Button with tooltip">
          <Button>Button</Button>
        </Tooltip>
        <Tooltip {...args} content="Help icon tooltip">
          <Icon>?</Icon>
        </Tooltip>
        <Tooltip {...args} content="This text has a tooltip">
          <Text>Hover over this text</Text>
        </Tooltip>
      </Container>
    );
  },
};

// Viewport adjustment example
export const ViewportAdjustment: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "The tooltip will automatically adjust its placement to stay within the viewport. Try hovering near the edges of the screen.",
      },
    },
  },
  render: () => {
    const Container = styled.div`
      display: flex;
      flex-direction: column;
      gap: 10px;
    `;

    const Note = styled.p`
      font-style: italic;
      margin: 0 0 10px 0;
    `;

    return (
      <Container>
        <Note>
          Try positioning these elements near the screen edges to see automatic
          placement adjustment
        </Note>
        <Tooltip content="This tooltip will adjust its position to stay visible">
          <Button>Hover near screen edge</Button>
        </Tooltip>
      </Container>
    );
  },
};
