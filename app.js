const express = require("express");
const cors = require("cors");
const contactsRouter = require("./app/routes/contact.route");
const ApiError = require("./app/api-error");
const usersRouter = require("./app/routes/user.route");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({message: "Welcome to contact book application"});
});

app.use("/api/contacts", contactsRouter);
app.use("/api/users", usersRouter);


//handle 404 respone
app.use((req, res, next) => {
    // Code ở dây sẽ chạy khi không có route được định nghĩa nào khớp với yêu cầu.
    // Gọi next() để chuyển sang middleware xử lý lỗi
    return next(new ApiError(404, "Resource not found"));
});

// define error-handling middleware last, after other app.use() and routes calls
app.use((err, req, res, next) => {
    // Middleware xử lý lỗi tập trung.
    // Trong các đoạn code xử lý ở các route, gọi next(error) sẽ chuyển về middleware xử lý lỗi này
    return res.status(err.statusCode || 500).json({
        message: err.message || "Interna Server Error",
    });
});
module.exports = app;
