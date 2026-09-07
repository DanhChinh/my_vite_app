. Nguyên tắc thiết kế Controller sạch (Best Practices)
Giữ Controller mỏng (Skinny Controller, Fat Model/Service): Controller chỉ nên làm nhiệm vụ nhận Request, gọi Service/Model xử lý dữ liệu và trả về Response (JSON hoặc View). Không viết logic nghiệp vụ hay câu lệnh SQL trực tiếp trong Controller.

Tận dụng Form Request: Tách biệt việc validate dữ liệu ra các file riêng (ví dụ: StoreProductRequest, UpdateProfileRequest) thay vì viết chung trong Controller.

Áp dụng Middleware chặt chẽ:

Guest: Không cần middleware hoặc dùng guest.

Customer: Dùng middleware auth kết hợp check role customer.

Staff & Admin: Dùng middleware phân quyền (ví dụ: Spatie Permission) như role:staff hoặc role:admin.