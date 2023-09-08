const net = require('net');
const client = new net.Socket();
var json = {};


client.connect(3000, '127.0.0.1', () => {
    // TO ADD(also Update)
    json = {};
    json.request = "ADD";
    json["records"] = {};
    json.records["email"] = "john@doe.com";
    json.records["password"] = "passwd";
    client.write(JSON.stringify(json));
});

client.connect(3000, '127.0.0.1', () => {
    // TO GET
    json = {};
    json.request = "GET";
    json.id = "john@doe.com";
    client.write(JSON.stringify(json));
});
    
client.connect(3000, '127.0.0.1', () => {
    // TO REMOVE
    json = {};
    json.request = "REM";
    json.id = "john@doe.com";
    client.write(JSON.stringify(json));
});
  

client.on('data', (data) => {
  const json = JSON.parse(data.toString());
  console.log(json);
  client.end();
});
