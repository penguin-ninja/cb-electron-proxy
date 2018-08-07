import net from "net";

class SoftPAC {
  constructor() {
    const client = new net.Socket();

    client.connect(22004, "192.168.1.12", () => {
      console.log("Connected");
      client.write("get-version\r\n");
    });

    client.on("data", data => {
      console.log("Received: " + data);
      client.destroy(); // kill client after server's response
    });

    client.on("close", () => {
      console.log("Connection closed");
    });
  }
}

export default SoftPAC;
