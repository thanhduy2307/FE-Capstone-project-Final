Bước 1: ADMIN (Quản trị viên) - Chuẩn bị Học kỳ & Hệ thống
Tạo Học kỳ mới: Admin đăng nhập vào hệ thống, tạo một Học kỳ (Semester) mới (Ví dụ: Spring 2026).
Thiết lập Thời gian biểu: Admin cấu hình ngày bắt đầu / kết thúc Học kỳ, cũng như ngày mở/đóng đợt nộp đề xuất đề tài cho sinh viên.
Quản lý Tài khoản: Đảm bảo danh sách Giảng viên (Reviewer), Moderator và Sinh viên (Student) đã được import đầy đủ và hợp lệ.
Bước 2: Sinh viên (Student) - Nộp Ý tưởng (Không cần file, Không cần tạo nhóm)
Khi thời gian "Mở đăng ký" bắt đầu, Leader (Tài khoản đại diện nhóm) đăng nhập vào hệ thống.
Leader truy cập form "Đề tài Sinh viên tự đề xuất" và điền trực tiếp:
Tên đề tài (Tiếng Việt & Anh).
department (Mã ngành: SE, AI, IA...).
description (Mô tả chi tiết ý định xây dựng hệ thống, module...).
Tên/Mã SV của các thành viên trong nhóm (Ví dụ: Nhập đủ 4 mã SV).
Bấm "Submit". Đề tài được lưu vào DB với trạng thái ban đầu là PENDING.
Bước 3: AI - Lọc đề tài & Tự động Đánh Mã (Auto ID Generation)
Ngay lập tức, hệ thống gửi ngầm nội dung (đặc biệt là description) qua OpenAI để chạy 2 bài test:
Compliance Check: Kiểm tra chất lượng mô tả (nội dung có nghiêm túc, đủ ý chính không).
Similarity Check: Chống đạo nhái, so sánh với các khóa trước để ra "Điểm trùng lắp" (vd: 5%).
Nếu AI chấm đạt (hoặc điểm rủi ro thấp), Hệ thống tự động sinh Mã Đề tài theo format ấn định: [Mã Ngành] + [STT] + [Kỳ] + [Năm]. 👉 Ví dụ: Nhóm nộp sản phẩm ngành AI đầu tiên của kỳ Spring 2026 sẽ được AI cấp liền mã: A1Spring26.
Đề tài lúc này sẽ đính kèm "Điểm AI", "Mã đề tài" và tự động chuyển trạng thái chờ: WAITING_MODERATOR.
Bước 4: MODERATOR (Điều phối viên) - Chọn 2 Giảng viên chấm thi
Moderator đăng nhập, xem danh sách các đề tài đã có mã (vd: A1Spring26) và đã pass qua vòng lọc AI.
Moderator phân tích nội dung đề tài và chuyên môn của các giảng viên trong khoa.
Thao tác thủ công: Moderator tự tay gán 2 Thầy/Cô phù hợp nhất vào ô Reviewer 1 và Reviewer 2 để phụ trách chấm Đề cương này.
Hệ thống gửi chuông báo/email cho 2 thầy cô vừa được phân công. Trạng thái đề tài cập nhật thành IN_REVIEW.
Bước 5: 2 Giảng viên REVIEWER - Thẩm định độc lập
2 Giảng viên vào hệ thống, mở Đề cương của bạn Leader ra đọc và đưa ra phán quyết:
TH1: Cả hai cùng vote APPROVED ➡️ Đề tài Pass (Chuyển sang Bước 7).
TH2: Cả hai cùng báo Hủy/Sửa ➡️ Trả lại cho Leader sửa description để nộp lại vòng sau.
TH3: 1 người vote APPROVED, 1 người vote REJECTED (Lệch ý kiến) ➡️ Hệ thống đẩy trạng thái báo động NEED_THIRD_REVIEWER.
Bước 6: MODERATOR - Chọn Người thứ 3 (Tie-breaker)
Nhận được cảnh báo "Lệch ý kiến" của mã A1Spring26, Moderator đăng nhập lại.
Moderator tiếp tục chọn thủ công thêm 1 Giám khảo chung thẩm (Coordinator / Giảng viên thứ 3) dạn dày kinh nghiệm vào hệ thống.
Vị Giám khảo thứ 3 này sẽ vào đọc, cân nhắc nhận xét của 2 người đi trước, và đưa ra 1 phiếu Vote chốt hạ cuối cùng: APPROVED hoặc REJECTED.
Bước 7: FINALIZED - Hoàn tất (Phân bổ Giảng viên hướng dẫn)
Khi Đề tài nhận được phán quyết APPROVED cuối cùng, hệ thống chớp nhoáng đóng đinh trạng thái: FINALIZED.