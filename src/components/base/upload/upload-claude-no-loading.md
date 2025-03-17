Các hàm bạn đề cập liên quan đến xử lý tương tác kéo thả (drag and drop) và chọn file trong component Upload. Tôi sẽ giải thích chi tiết từng hàm:

### 1. `isDragActive={isDragActive}`

Đây không phải là một hàm mà là một prop được truyền vào component `DropZone`. `isDragActive` là một state boolean cho biết người dùng có đang kéo file vào vùng drop hay không.

```jsx
const [isDragActive, setIsDragActive] = useState(false);
```

Khi `isDragActive` là `true`, component `DropZone` sẽ thay đổi giao diện (như màu viền, màu nền) để cung cấp phản hồi trực quan cho người dùng rằng họ có thể thả file vào đây.

```jsx
const DropZone = styled.div<{ isDragActive: boolean }>`
  border: 2px dashed ${(props) => (props.isDragActive ? "#7c3aed" : "#e5e7eb")};
  background-color: ${(props) =>
    props.isDragActive ? "rgba(124, 58, 237, 0.05)" : "#fafafa"};
  // ...
`;
```

### 2. `onClick={openFileDialog}`

Đây là một event handler được gọi khi người dùng click vào vùng kéo thả. Hàm `openFileDialog` sẽ mở hộp thoại chọn file của hệ điều hành.

```jsx
const openFileDialog = () => {
  if (inputRef.current) {
    inputRef.current.click();
  }
};
```

Cụ thể:
- `inputRef` là một React ref được tạo bằng `useRef` và gắn vào một `<input type="file">` ẩn
- `inputRef.current.click()` mô phỏng việc click vào input file ẩn, kích hoạt hộp thoại chọn file
- Điều này cho phép người dùng không chỉ kéo thả mà còn có thể click để chọn file

### 3. `onDragEnter={handleDragEnter}`

Event handler này xử lý sự kiện khi người dùng kéo file vào vùng kéo thả.

```jsx
const handleDragEnter = useCallback((e: React.DragEvent) => {
  e.preventDefault();
  e.stopPropagation();
  setIsDragActive(true);
}, []);
```

- `e.preventDefault()`: Ngăn hành vi mặc định của trình duyệt khi kéo thả
- `e.stopPropagation()`: Ngăn sự kiện lan truyền đến các phần tử cha
- `setIsDragActive(true)`: Cập nhật state để chỉ ra rằng người dùng đang kéo file vào vùng kéo thả
- Hàm này được bọc trong `useCallback` để tránh tạo lại hàm không cần thiết khi component re-render

### 4. `onDragLeave={handleDragLeave}`

Event handler này xử lý sự kiện khi người dùng kéo file ra khỏi vùng kéo thả.

```jsx
const handleDragLeave = useCallback((e: React.DragEvent) => {
  e.preventDefault();
  e.stopPropagation();
  setIsDragActive(false);
}, []);
```

- Tương tự như `handleDragEnter`, nhưng nó đặt `isDragActive` thành `false`
- Điều này sẽ khôi phục lại giao diện ban đầu của vùng kéo thả khi người dùng kéo file ra ngoài

### 5. `onDragOver={handleDragOver}`

Event handler này xử lý sự kiện khi người dùng kéo file qua vùng kéo thả.

```jsx
const handleDragOver = useCallback((e: React.DragEvent) => {
  e.preventDefault();
  e.stopPropagation();
}, []);
```

- `e.preventDefault()`: Rất quan trọng vì nó cho phép vùng này chấp nhận các sự kiện drop
- Không có `e.preventDefault()`, trình duyệt sẽ không cho phép thả file vào vùng này
- Không thực hiện thay đổi state, chỉ ngăn chặn hành vi mặc định của trình duyệt

### 6. `onDrop={handleDrop}`

Event handler này xử lý sự kiện khi người dùng thả file vào vùng kéo thả.

```jsx
const handleDrop = useCallback(
  (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  },
  [processFiles]
);
```

- `e.preventDefault()` và `e.stopPropagation()`: Ngăn hành vi mặc định và lan truyền sự kiện
- `setIsDragActive(false)`: Đặt lại trạng thái kéo thả
- Kiểm tra xem có files được thả không (`e.dataTransfer.files`)
- Nếu có, gọi hàm `processFiles` để xử lý các files này
- Hàm `processFiles` là một dependency của `handleDrop` vì nó được sử dụng bên trong

Mối liên hệ giữa các hàm:
1. `handleDragEnter` và `handleDragLeave` điều khiển việc hiển thị visual feedback thông qua state `isDragActive`
2. `handleDragOver` bắt buộc phải có để cho phép thả file vào vùng kéo thả
3. `handleDrop` xử lý các files được thả và chuyển chúng đến hàm `processFiles`
4. `openFileDialog` cung cấp một cách thay thế để chọn file thông qua hộp thoại file

Tất cả các hàm này làm việc cùng nhau để tạo ra trải nghiệm kéo thả và chọn file liền mạch cho người dùng.