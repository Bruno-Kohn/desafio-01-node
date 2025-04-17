import fs from "fs";
import { parse } from "csv-parse";
import path from "path";
import { fileURLToPath } from "url";
import { routes } from "./routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const csvData = [];

fs.createReadStream(path.join(__dirname, "tasks.csv"))
  .pipe(parse({ delimiter: "," }))
  .on("data", function (dataRow) {
    csvData.push(dataRow);
  })
  .on("end", function () {
    for (let i = 1; i < csvData.length; i++) {
      const title = csvData[i][0];
      const description = csvData[i][1];

      const route = routes.find(
        (r) => r.method === "POST" && r.path.test("/tasks")
      );

      if (route) {
        const mockReq = {
          method: "POST",
          url: "/tasks",
          body: { title, description },
        };

        const mockRes = {
          writeHead: (statusCode, headers) => {
            return mockRes;
          },
          end: (data) => {
            console.log("Response:", data);
          },
        };
        route.handler(mockReq, mockRes);
      }
    }
  });
