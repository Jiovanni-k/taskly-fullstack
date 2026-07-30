import "dotenv/config";

import readline from "node:readline"; // helps read each line at a time
import { handleRequest } from "./server.js";


console.error(
    "DATABASE_URL:",
    process.env.DATABASE_URL
);

console.error("Todo MCP server starting...");


const rl = readline.createInterface({
    input: process.stdin,
    terminal: false
});


rl.on("line", async (line) => { // each time claude sends one JSON message, execute this function

    try {

        const request = JSON.parse(line);

        const response = await handleRequest(request);


        if (response) {

            process.stdout.write(
                JSON.stringify(response) + "\n"
            );

        }

    } catch (error) {

        console.error(error);

    }

}); 