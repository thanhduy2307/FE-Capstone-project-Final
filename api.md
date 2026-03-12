1. AuthController (/api/auth)
Xử lý xác thực và quản lý tài khoản người dùng.
POST /api/auth/register: Đăng ký tài khoản người dùng mới.
POST /api/auth/login: Xác thực và đăng nhập tài khoản.
GET /api/auth/users: Lấy danh sách tất cả người dùng trong hệ thống.
GET /api/auth/users/{id}: Xem chi tiết thông tin một người dùng.
GET /api/auth/users/role/{role}: Lọc danh sách người dùng theo vai trò (role).
PUT /api/auth/users/{id}/role: Cập nhật vai trò (role) cho người dùng (Thường dành cho Admin).
DELETE /api/auth/users/{id}: Xóa tài khoản người dùng.
2. TopicController (/api/topics)
Xử lý quản lý các đề tài (Topics).
POST /api/topics: Giảng viên nộp đề tài mới (Hệ thống sẽ tự kích hoạt xử lý AI Similarity Check ngầm).
POST /api/topics/{parentTopicId}/resubmit: Nộp lại đề tài nếu đợt trước bị chấm không đạt.
POST /api/topics/{id}/lock: Khóa kết quả đề tài (Bởi moderator).
GET /api/topics: Lấy toàn bộ danh sách đề tài.
GET /api/topics/{id}: Xem chi tiết một đề tài theo ID.
GET /api/topics/code/{code}: Lấy chi tiết đề tài thông qua mã đề tài (Topic Code).
GET /api/topics/supervisor/{supervisorId}: Liệt kê các đề tài do một giảng viên hướng dẫn.
GET /api/topics/semester/{semesterId}: Liệt kê các đề tài phân theo kỳ học.
GET /api/topics/semester/{semesterId}/passed: Liệt kê các đề tài đã vượt qua các vòng kiểm duyệt trong một học kỳ.
GET /api/topics/status/{status}: Lọc danh sách đề tài theo trạng thái (vd. DRAFT, PROCESSING, APPROVED...).
GET /api/topics/{id}/inheritance: Xem lịch sử kế thừa/chỉnh sửa của một đề tài.
PUT /api/topics/{id}: Cập nhật thông tin đề tài.
DELETE /api/topics/{id}: Xóa một đề tài.
3. TopicReviewerController (/api/topic-reviewers)
Xử lý phân công và kết quả phản biện (Review) đề tài.
POST /api/topic-reviewers/assign/{topicId}: (Moderator) Phân công người phản biện chỉ định cho một đề tài.
POST /api/topic-reviewers/auto-assign/{topicId}: (Moderator) Phân công ngẫu nhiên tự động số lượng reviewers (thường là 2 người).
POST /api/topic-reviewers/assign-third/{topicId}: Mời người phản biện thứ 3 khi hai người trước đánh giá mâu thuẫn.
POST /api/topic-reviewers/{topicReviewerId}/submit: Reviewer gửi kết quả đánh giá (bảng điểm/checklist) cho đề tài.
GET /api/topic-reviewers/need-third-reviewer: Tìm tất cả những đề tài đang cần phân công reviewer thứ 3.
GET /api/topic-reviewers/topic/{topicId}: Xem danh sách reviewers đã được phân công cho một đề tài.
GET /api/topic-reviewers/reviewer/{reviewerId}/pending: Lấy các đề tài đang chờ phản biện của một Reviewer.
GET /api/topic-reviewers/reviewer/{reviewerId}: Lấy tất cả các lịch sử/công việc phản biện của một Reviewer.
GET /api/topic-reviewers/{id}: Lấy chi tiết một phiên giao việc phân công reviewer.
GET /api/topic-reviewers/{topicReviewerId}/checklist-results: Truy xuất bộ kết quả đánh giá (chấm điểm tiêu chí) từ reviewer cho đề tài.
4. ChecklistController (/api/checklists)
Quản lý danh mục các tiêu chí đánh giá.
POST /api/checklists: Tạo tiêu chí đánh giá (Checklist template) mới.
GET /api/checklists: Lấy toàn bộ danh sách tiêu chí đánh giá.
GET /api/checklists/{id}: Xem chi tiết một tiêu chí theo ID.
PUT /api/checklists/{id}: Cập nhật nội dung tiêu chí.
DELETE /api/checklists/{id}: Xóa mẫu tiêu chí đánh giá.
5. StatisticsController (/api/statistics)
Lấy số liệu làm dữ liệu hiển thị trên Dashboard.
GET /api/statistics/semester/{semesterId}: Lấy dữ liệu thống kê tổng quan (Dashboard) cho một kỳ học (Số lượng topics, tình trạng review, v.v.).
6. RegistrationPhaseController (/api/registration-phases)
Quản lý những đợt (Phase) nộp/đăng ký đề tài trong học kỳ.
POST /api/registration-phases: Thêm một phase (đợt) mới.
GET /api/registration-phases/{id}: Lấy chi tiết một đợt đăng ký.
GET /api/registration-phases/semester/{semesterId}: Lấy tất cả các đợt đăng ký trong học kỳ.
GET /api/registration-phases/semester/{semesterId}/open: Lấy những đợt đăng ký hiện đang mở (open).
POST /api/registration-phases/{id}/close: Đóng một đợt đăng ký.
POST /api/registration-phases/{id}/open: Mở thao tác đăng ký cho đợt này.
DELETE /api/registration-phases/{id}: Xóa bỏ thông tin đợt.
7. SemesterController (/api/semesters)
Quản lý thông tin học kỳ.
POST /api/semesters:Tạo học kỳ mới.
GET /api/semesters: Lấy tất cả học kỳ có trong cơ sở dữ liệu.
GET /api/semesters/{id}: Hiển thị thông tin học kỳ cụ thể.
GET /api/semesters/active: Lấy thông tin học kỳ hiện đang có trạng thái kích hoạt (Active).
PUT /api/semesters/{id}/activate: Đặt học kỳ cụ thể làm học kỳ chủ động hiện hành (Active).
DELETE /api/semesters/{id}: Xoá học kỳ.
8. NotificationController (/api/notifications)
Thông báo thời gian thực hoặc offline.
GET /api/notifications/user/{userId}: Lịch sử toàn bộ thông báo gửi đến user.
GET /api/notifications/user/{userId}/unread: Các thông báo user chưa đọc.
GET /api/notifications/user/{userId}/unread-count: Đếm tổng số lượng thông báo chưa đọc.
PUT /api/notifications/{id}/read: Đánh dấu thông báo đã đọc.
PUT /api/notifications/user/{userId}/read-all: Đánh dấu "đã đọc" toàn bộ hộp thư thông báo của user.
DELETE /api/notifications/{id}: Xoá thông báo.