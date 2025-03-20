/**
 * 单线程事件循环 + epoll
 * 
 * 因为Node.js底层通过libuv自动使用epoll/kqueue等系统调用
 */

const server = require("net").createServer(socket => {
  // 同步处理
  socket.on("data", data => {
    console.log("get data: " + data);
    socket.write(data);
  })
}).listen(3000);