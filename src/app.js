import express, {json} from "express";
import cors from "cors"

const PORT = 5000;
const server = express();
server.use(cors());
server.use(json());









server.listen(PORT, `Rodando na porta: ${PORT}`);
