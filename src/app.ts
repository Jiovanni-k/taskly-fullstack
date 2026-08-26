import express from 'express';
import router from './routes/todo.routes.js';
import userRouter from './routes/user.routes.js';
import { logger } from './middleware/logger.middleware.js';
import passport from './config/passport.js';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger.js';
import cors from 'cors';

const app = express();

app.use(logger);
app.use(
  cors({
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : true,
  }),
);
app.use(express.json());
app.use(passport.initialize());
app.use('/todos', router);
app.use('/users', userRouter);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
  });
});
app.use((req, res) => {
  res.status(404).json({
    message: 'Route Not Found :(',
  });
});

export default app;
