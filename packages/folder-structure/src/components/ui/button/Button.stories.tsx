import Button from "./Button";

export default {
  title: "Components/Button",
  component: Button,
};

export const Default = () => <Button label="Default button" />;
export const Disable = () => <Button label="Disable button" disabled />;
