## write test
### khi test một component React, bạn nên kiểm tra:
✅ Component có render đúng không?
✅ Event handler có hoạt động không? (click, input, submit,...)
✅ Props có truyền đúng không?
✅ State có thay đổi đúng không?
✅ Hiển thị đúng khi điều kiện thay đổi? (Conditional Rendering)
✅ API có được gọi đúng không?

### example button
  import React from 'react';

  interface ButtonProps {
    label: string;
    onClick: () => void;
  }

  const Button: React.FC<ButtonProps> = ({ label, onClick }) => {
    return <button onClick={onClick}>{label}</button>;
  };

  export default Button;
####  Test: Kiểm tra xem button có hiển thị đúng không.
  import { render, screen } from '@testing-library/react';
  import Button from './Button';

  test('renders button with correct label', () => {
    render(<Button label="Click me" onClick={() => {}} />);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
#### Kiểm tra Event (Người dùng tương tác có đúng không?)
  import { render, screen, fireEvent } from '@testing-library/react';
  import { vi } from 'vitest';
  import Button from './Button';

  test('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<Button label="Click me" onClick={handleClick} />);

    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1); // ✅ Hàm được gọi 1 lần
  });
#### Kiểm tra Props (Component nhận props đúng không?)
const Card = ({ title }: { title: string }) => {
  return <div>{title}</div>;
};
export default Card;
////
import { render, screen } from '@testing-library/react';
import Card from './Card';

test('renders title correctly', () => {
  render(<Card title="Hello World" />);
  expect(screen.getByText('Hello World')).toBeInTheDocument();
});
#### Kiểm tra State (Component thay đổi state đúng không?)
import { useState } from 'react';

const Counter = () => {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increase</button>
    </div>
  );
};

export default Counter;
//////
import { render, screen, fireEvent } from '@testing-library/react';
import Counter from './Counter';

test('increases count when button is clicked', () => {
  render(<Counter />);
  const button = screen.getByText('Increase');

  fireEvent.click(button);
  expect(screen.getByText('Count: 1')).toBeInTheDocument();
});
#### Kiểm tra Conditional Rendering (Hiển thị đúng khi dữ liệu thay đổi?)
const UserGreeting = ({ isLoggedIn }: { isLoggedIn: boolean }) => {
  return <h1>{isLoggedIn ? 'Welcome back!' : 'Please log in'}</h1>;
};
export default UserGreeting;
////
import { render, screen } from '@testing-library/react';
import UserGreeting from './UserGreeting';

test('shows correct message based on login status', () => {
  render(<UserGreeting isLoggedIn={true} />);
  expect(screen.getByText('Welcome back!')).toBeInTheDocument();

  render(<UserGreeting isLoggedIn={false} />);
  expect(screen.getByText('Please log in')).toBeInTheDocument();
});

####  Kiểm tra API Calls (Mock API để test dữ liệu trả về)
import { useEffect, useState } from 'react';

const FetchData = () => {
  const [data, setData] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/data')
      .then((res) => res.json())
      .then((json) => setData(json.message));
  }, []);

  return <div>{data ? data : 'Loading...'}</div>;
};

export default FetchData;
/////
import { render, screen, waitFor } from '@testing-library/react';
import FetchData from './FetchData';
import { vi } from 'vitest';

global.fetch = vi.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ message: 'Hello from API' }),
  })
) as jest.Mock;

test('fetches and displays data', async () => {
  render(<FetchData />);
  await waitFor(() => expect(screen.getByText('Hello from API')).toBeInTheDocument());
});