import express, {json} from "express";
import cors from "cors";

const PORT = 5000;
const server = express();
server.use(cors());
server.use(json());

const mongoClient = new MongoClient(process.env.DATABASE_URL);







server.listen(PORT, `Rodando na porta: ${PORT}`);
