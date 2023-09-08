const net = require('net');

// Create a client socket to connect to the server
const client = new net.Socket();

// Connect to the server on port 3000
client.connect(3000, '127.0.0.1', () => {
  const json = {};
  json.request = "GET";
  json.id = "jane@doe.com";
  //json["records"] = {};
  //json.records["email"] = "john@doe.com";
  //json.records["password"] = "passwd";
  client.write(JSON.stringify(json));
});


client.on('data', (data) => {
  const json = JSON.parse(data.toString());
  console.log(json);
  client.end();
});
