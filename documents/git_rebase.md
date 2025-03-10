## Git rebase dùng để làm gì?
Làm sạch lịch sử commit: Thay vì giữ lại các nhánh phụ và commit hợp nhất, git rebase "viết lại" lịch sử để trông như tất cả các thay đổi được thực hiện trực tiếp trên nhánh chính.
Đồng bộ hóa nhánh: Cập nhật nhánh của bạn với những thay đổi mới nhất từ nhánh chính (ví dụ: main hoặc master) trước khi tích hợp code.
Chuẩn bị nhánh trước khi merge: Tạo ra một lịch sử rõ ràng, dễ đọc hơn cho nhóm hoặc khi gửi pull request.
Cách hoạt động
Khi bạn chạy git rebase, Git sẽ:

Lấy các commit từ nhánh hiện tại (nhánh bạn đang đứng).
"Tạm gỡ" chúng ra.
Áp dụng lại từng commit lên trên đầu của nhánh cơ sở (base branch) mà bạn chỉ định.
Cách dùng git rebase
Dưới đây là các bước cơ bản và cú pháp:

### 1. Rebase nhánh hiện tại lên nhánh khác
Giả sử bạn đang ở nhánh feature và muốn rebase nó lên nhánh main:
```sh
git checkout feature
git rebase main
```
Git sẽ lấy các commit độc nhất của nhánh feature và áp dụng chúng lên đầu nhánh main.
Nếu không có xung đột (conflict), quá trình sẽ tự động hoàn tất.
### 2. Xử lý xung đột (nếu có)
Nếu có xung đột trong quá trình rebase:

Git sẽ tạm dừng và thông báo file bị xung đột.
Bạn chỉnh sửa file để giải quyết xung đột.
Sau khi sửa xong:
```sh
git add <file>
git rebase --continue
```
Lặp lại cho đến khi hoàn tất.
### 3. Hủy rebase (nếu cần)
Nếu bạn muốn quay lại trạng thái trước khi rebase:
```sh
git rebase --abort
```
### 4. Rebase tương tác (interactive rebase)
Dùng để chỉnh sửa, gộp, hoặc xóa commit trong lịch sử:
```sh
git rebase -i <commit-id>
```
<commit-id> là commit mà bạn muốn bắt đầu chỉnh sửa từ đó trở đi (thường là commit trước các commit cần sửa).
Một giao diện sẽ hiện ra, cho phép bạn chọn hành động như pick, squash, edit, v.v.
Ví dụ:
```sh
git rebase -i HEAD~3
```
(Chỉnh sửa 3 commit gần nhất)

Ví dụ cụ thể
Trước khi rebase:
text

A --- B --- C  (main)
       \
        D --- E  (feature)
Sau khi chạy git rebase main từ nhánh feature:
text

A --- B --- C --- D' --- E'  (feature)
Các commit D và E được áp dụng lại thành D' và E' trên đầu nhánh main.

#### Lưu ý quan trọng
Không rebase nhánh đã công khai: Nếu nhánh đã được push lên remote và người khác đang sử dụng, việc rebase sẽ gây混乱 (lộn xộn) vì lịch sử bị viết lại.
Backup trước khi rebase: Dùng git branch backup để tạo nhánh dự phòng, phòng trường hợp sai sót.
So sánh với merge: git merge giữ nguyên lịch sử, còn git rebase tạo lịch sử tuyến tính.

#### Tóm lại
Dùng khi: Bạn muốn lịch sử commit sạch sẽ hoặc đồng bộ hóa nhánh.
Cách dùng: git rebase <branch> hoặc git rebase -i cho chỉnh sửa nâng cao.
Cẩn thận: Chỉ dùng trên nhánh cá nhân, tránh nhánh chia sẻ.


## step by step
### 1, Quy trình cũ của bạn với git merge:
Pull từ main về để cập nhật nhánh feature1:
```sh
git checkout feature1
git pull origin main
```
(Nếu có xung đột, bạn giải quyết rồi commit.)
Add file đang chỉnh sửa trên nhánh feature1:
```sh
git add <file>
```
Commit thay đổi:
```sh
git commit -m "Thông điệp commit"
```
Push lên nhánh feature1:
```sh
git push origin feature1
```
Tạo pull request từ feature1 tới main.


### 2, Quy trình mới với git rebase:
Với git rebase, mục tiêu là giữ lịch sử commit tuyến tính hơn. Dưới đây là cách làm:

Bước 1: Cập nhật nhánh feature1 bằng cách rebase lên main
Thay vì dùng git pull origin main (mặc định dùng merge), bạn sẽ dùng git fetch để lấy thay đổi từ remote, rồi git rebase:

```sh
git checkout feature1
git fetch origin
git rebase origin/main
```
Giải thích:
git fetch origin: Lấy thông tin mới nhất từ remote mà không merge ngay.
git rebase origin/main: Áp dụng các commit của nhánh feature1 lên trên đầu nhánh main từ remote.
Nếu có xung đột:
Git sẽ dừng lại, bạn sửa file xung đột.
Sau khi sửa:

```sh
git add <file>
git rebase --continue
```
Tiếp tục cho đến khi hoàn tất.
Bước 2: Add file đang chỉnh sửa và commit
Sau khi rebase xong, bạn tiếp tục chỉnh sửa file trên nhánh feature1:

```sh
git add <file>
git commit -m "Thông điệp commit"
```
Bước 3: Push lên nhánh feature1
Vì lịch sử commit đã bị thay đổi bởi git rebase, bạn cần dùng --force hoặc --force-with-lease để đẩy lên remote:

```sh
git push origin feature1 --force-with-lease
```

Lưu ý:
--force-with-lease: An toàn hơn --force, vì nó kiểm tra xem có ai khác thay đổi nhánh không trước khi đẩy.
Chỉ dùng force push nếu nhánh feature1 là nhánh cá nhân và chưa ai khác làm việc trên đó.

Bước 4: Tạo pull request tới main
Quy trình này không thay đổi. Bạn vào giao diện GitHub/GitLab/Bitbucket (tùy nơi bạn dùng) và tạo pull request từ feature1 sang main. Do lịch sử đã tuyến tính, pull request sẽ dễ đọc hơn.

So sánh lịch sử commit
Với git merge:

A --- B --- C  (main)
       \     \
        D --- E --- M  (feature1)
M là merge commit, làm lịch sử phân nhánh.

Với git rebase:

A --- B --- C --- D' --- E'  (feature1)
D' và E' là các commit của bạn được áp dụng lại trên main, không có merge commit.

Lưu ý khi chuyển sang git rebase
Nhánh đã push trước đó: Nếu nhánh feature1 đã được push lên remote và bạn rebase, lịch sử sẽ thay đổi, buộc bạn phải dùng git push --force-with-lease. Hãy đảm bảo thông báo với team nếu nhánh này không chỉ mình bạn làm việc.
Thay đổi tư duy: Rebase không giữ lịch sử phân nhánh như merge, mà "viết lại" lịch sử. Nếu bạn thích lịch sử rõ ràng hơn, rebase là lựa chọn tốt.

Backup: Trước khi rebase, tạo nhánh dự phòng nếu cần:
```sh
git branch feature1-backup
```
Quy trình tóm tắt với rebase
```sh
git checkout feature1
git fetch origin
git rebase origin/main
# Giải quyết xung đột nếu có: git add <file>, git rebase --continue
git add <file>
git commit -m "Thông điệp commit"
git push origin feature1 --force-with-lease
Sau đó tạo pull request như bình thường.
```
// change by develop