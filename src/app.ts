import express from "express";
import router from "./routes/todo.routes.js";
import { logger } from "./middleware/logger.middleware.js";

const app = express();

app.use(logger);
app.use(express.json());
app.use("/todos", router);
app.use((req,res)=>{
    res.status(404).json({
        message : "Route Not Found :("
    });
})

app.get("/health", ( req , res )=>{
    res.status(200).json({
        status : "UP"
    });
})

export default app;