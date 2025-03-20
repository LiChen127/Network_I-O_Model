const { Worker, isMainThread, parentPort, workerData } = require("worker_threads");
const net = require("net");

if (isMainThread) {
  const numWorkers = 4;
  const workers = [];

  for (let i = 0; i < numWorkers; i++) {
    workers.push(new Worker(__filename, { workerData: { workerId: i } }));
  }

  let currentWorker = 0;

  const server = net.createServer(socket => {
    workers[currentWorker].postMessage({ socket: socket });
    currentWorker = (currentWorker + 1) % numWorkers;
  }).listen(3000, () => {
    console.log("Server listening on port 3000");
  })

  workers.forEach(worker => {
    worker.on("message", (msg) => {
      const { socket, data } = message;
      socket.write(data);
    })

    worker.on("error", (e) => {
      console.log(`Worker err: ${e}`);
    })
  })
} else {
  // 工作线程
  const { workerId } = workerData;

  parentPort.on("message", ({ socket }) => {
    let socketData = "";

    socket.on("data", (data) => {
      socketData += data.toString();
    })

    socket.on("end", () => {
      console.log(`Worker ${workerId} received data: ${socketData}`);
      parentPort.postMessage({ socket, data: socketData });
    })

    socket.on('end', () => {
      console.log(`Worker ${id} received data: ${socketData}`);
      parentPort.postMessage({ socket, data: socketData });
    });

    socket.on('error', (error) => {
      console.error(`Socket error in worker ${id}: ${error}`);
    });
  })
}