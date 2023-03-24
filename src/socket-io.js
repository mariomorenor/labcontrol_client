const { io } = require("socket.io-client")

const config = {
    server: "http://localhost",
    port: 6969
}

const socket = io(`${config.server}:${config.port}`);


socket.on("connect", () => {
    console.log("Sss")
})
