var express = require("express");
const multer = require("multer");

var app = express();

app.set("view engine", "ejs");
app.set("views", "./views");
app.use(express.static("./public"));

var server = require("http").Server(app);
var io = require("socket.io")(server);

var listUser = [];

// // upload Avatar
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "./upload");
//   },
//   filename: function (req, file, cb) {
//     cb(null, file.originalname);
//   },
// });

// const upload = multer({ storage: storage });

// app.post("/", upload.single("file"), function (req, res, next) {
//   // req.file is the `avatar` file
//   // req.body will hold the text fields, if there were any
// });

// const cpUpload = upload.fields([
//   { name: "avatar", maxCount: 1 },
//   { name: "gallery", maxCount: 8 },
// ]);

io.on("connection", function (socket) {
  socket.on("client-register", function (data) {
    let newArr = listUser.map((item) => {
      return item.name;
    });
    if (newArr.includes(data.name)) {
      socket.emit("server-send-register-failed", "Người dùng đã tồn tại");
    } else {
      data.id = socket.id;
      listUser.push(data);
      socket.Username = data.name;
      socket.Avatar = data.avatar;
      socket.emit("server-send-register-success", data);
      io.sockets.emit("server-send-listUser", listUser);
    }
  });

  socket.on("client-send-Logout", function () {
    let newArr = listUser.map((item) => {
      return item.name;
    });
    listUser.splice(newArr.indexOf(socket.Username), 1);
    socket.broadcast.emit("server-send-listUser", listUser);
    socket.emit("server-send-listUser", listUser);
  });

  socket.on("disconnect", function () {
    let newArr = listUser.map((item) => {
      return item.name;
    });
    listUser.splice(newArr.indexOf(socket.Username), 1);
    socket.broadcast.emit("server-send-listUser", listUser);
    socket.emit("server-send-listUser", listUser);
  });

  socket.on("client-send-message", function (data) {
    io.sockets.in(data).emit("server-send-message", {
      name: socket.Username,
      value: data,
      avatar: socket.Avatar,
    });

    io.sockets.emit("server-send-message", {
      name: socket.Username,
      value: data,
      avatar: socket.Avatar,
    });

    data = "";
  });

  socket.on("client-send-chatting", function () {
    socket.broadcast.emit("server-send-chatting", socket.Username);
  });

  socket.on("client-send-stop-chatting", function () {
    socket.broadcast.emit("server-send-stop-chatting", socket.Username);
  });

  socket.on("client-send-call-phone", function () {
    socket.broadcast.emit("server-send-call-phone");
    socket.emit("server-send-this-call-phone");
  });

  socket.on("client-send-join-room", function (data) {
    socket.join(data);
    socket.Phong = data;

    arrRoom = [];
    console.log(socket.rooms);
    // for (room in socket.adapter.rooms) {
    //   // arrRoom.push(room);
    //   console.log(room);
    // }
  });
  socket.on("client-send-notication-failed-call", function (data) {
    console.log(data);
    io.sockets.emit("server-send-message", {
      name: data.name,
      value: `
      <div style='display: flex;flex-direction: column ;justify-content: center; align-items:center'>
      <div style='color: red; padding: 20px;'>${data.name} Vừa gọi cả nhóm <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-telephone-x" viewBox="0 0 16 16">
      <path d="M3.654 1.328a.678.678 0 0 0-1.015-.063L1.605 2.3c-.483.484-.661 1.169-.45 1.77a17.568 17.568 0 0 0 4.168 6.608 17.569 17.569 0 0 0 6.608 4.168c.601.211 1.286.033 1.77-.45l1.034-1.034a.678.678 0 0 0-.063-1.015l-2.307-1.794a.678.678 0 0 0-.58-.122l-2.19.547a1.745 1.745 0 0 1-1.657-.459L5.482 8.062a1.745 1.745 0 0 1-.46-1.657l.548-2.19a.678.678 0 0 0-.122-.58L3.654 1.328zM1.884.511a1.745 1.745 0 0 1 2.612.163L6.29 2.98c.329.423.445.974.315 1.494l-.547 2.19a.678.678 0 0 0 .178.643l2.457 2.457a.678.678 0 0 0 .644.178l2.189-.547a1.745 1.745 0 0 1 1.494.315l2.306 1.794c.829.645.905 1.87.163 2.611l-1.034 1.034c-.74.74-1.846 1.065-2.877.702a18.634 18.634 0 0 1-7.01-4.42 18.634 18.634 0 0 1-4.42-7.009c-.362-1.03-.037-2.137.703-2.877L1.885.511z"/>
      <path fill-rule="evenodd" d="M11.146 1.646a.5.5 0 0 1 .708 0L13 2.793l1.146-1.147a.5.5 0 0 1 .708.708L13.707 3.5l1.147 1.146a.5.5 0 0 1-.708.708L13 4.207l-1.146 1.147a.5.5 0 0 1-.708-.708L12.293 3.5l-1.147-1.146a.5.5 0 0 1 0-.708z"/>
      </svg></div>
      <div style="color: green;">Gọi lại</div>
      </div>
    `,
      avatar: data.avatar,
    });
  });
});

server.listen(3000);

require("./routes/home")(app);
