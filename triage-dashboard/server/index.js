import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import aiRoutes from "./routes/ai.routes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: "10mb" })); // increase payload size
app.use("/api/ai", aiRoutes);

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
