const net = require('net');
const fs = require('fs');
const { count } = require('console');
const path = require('path');

const bind = "0.0.0.0";
const port = 3000;

class Counter {
    constructor(intervalMs) {
      this.intervalMs = intervalMs;
      this.timestamps = [];
    }
  
    get() {
      this.cleanup();
      return this.timestamps.length;
    }
  
    increment() {
      this.timestamps.push(Date.now());
    }
  
    cleanup() {
      const currentTime = Date.now();
      const thresholdTime = currentTime - this.intervalMs;
  
      while (this.timestamps.length > 0 && this.timestamps[0] < thresholdTime) {
        this.timestamps.shift();
      }
    }
}  
const counter = new Counter(1000);


const server = net.createServer((socket) => {
  socket.on('data', (data) => {
    const startTime = Date.now();
    counter.increment();
    const jsonObject = JSON.parse(data.toString().trim()); 
    const json = {};
    if(jsonObject.request == "ADD"){
        fs.writeFile("data/" + jsonObject.records[Object.keys(jsonObject.records)[0]], JSON.stringify(jsonObject.records), (err) => {
            if (err) {
                json.status = "NO";
                json.detail = "QUERY FAILED [UNABLE TO SAVE] (" + ( Date.now() - startTime ) + "ms)";
                socket.write(JSON.stringify(json));
            } else {
                json.status = "YES";
                json.detail = "QUERY SUCCESS (" + ( Date.now() - startTime ) + "ms)";
                socket.write(JSON.stringify(json));
            }
        });    
    } else if(jsonObject.request == "GET"){
        json["datas"] = [];
        fs.readdir("data/", (err, files) => {
            if (err) {
                json.status = "NO";
                json.detail = "QUERY FAILED [UNABLE TO READ-DIR] (" + ( Date.now() - startTime ) + "ms)";
                socket.write(JSON.stringify(json));
                return;
            }
            let processedCount = 0;
            json.status = "YES";
            json.detail = "QUERY SUCCESS (" + ( Date.now() - startTime ) + "ms)";
            files.forEach((file) => {
              const filePath = path.join("data/", file);
              fs.readFile(filePath, 'utf8', (readErr, data) => {
                if( jsonObject.id == "*" || jsonObject.id == file ){
                    if (readErr) {
                        json.status = "NO";
                        json.detail = "QUERY FAILED [UNABLE TO READ-FILE] (" + ( Date.now() - startTime ) + "ms)";
                        socket.write(JSON.stringify(json));
                    } else {
                        json.datas.push(JSON.parse(data));
                        processedCount++;
                        if(processedCount === files.length || jsonObject.id == file ){
                            socket.write(JSON.stringify(json));
                        }
                    }
                }
              });
            });
        });
    } else if(jsonObject.request == "REM"){
        fs.access("data/" + jsonObject.id, fs.constants.F_OK, (err) => {
            if (err) {
                json.status = "NO";
                json.detail = "QUERY FAILED [UNABLE TO FIND] (" + ( Date.now() - startTime ) + "ms)";
                socket.write(JSON.stringify(json));
            } else {
                fs.unlink("data/" + jsonObject.id, (err) => {
                    if (err) {
                        json.status = "NO";
                        json.detail = "QUERY FAILED [UNABLE TO DELETE] (" + ( Date.now() - startTime ) + "ms)";
                        socket.write(JSON.stringify(json));
                    } else {
                        json.status = "YES";
                        json.detail = "QUERY SUCCESS (" + ( Date.now() - startTime ) + "ms)";
                        socket.write(JSON.stringify(json));
                    }
                });
            }
        });
    }
  });
});

server.listen(port, bind, () => {
  console.log("AliceDB listening on "  + bind + ":" + port);
});
