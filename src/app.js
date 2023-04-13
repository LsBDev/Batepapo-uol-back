import express, {json} from "express";
import cors from "cors";
import { MongoClient } from "mongodb";
import dotenv from "dotenv"

const PORT = 5000;
const app = express();
app.use(cors());
app.use(json());
//app.use(express.json())
dotenv.config();


//conexão com o Banco de dados (que é uma aplicação separada do back que por sua vez é separada do front)
let db;
const mongoClient = new MongoClient(process.env.DATABASE_URL);
mongoClient.connect()
    .then(() => db = mongoClient.db()) //requisição deu certo, coloco as infos do DB na variável db.
    .catch((err) => console.log(err.message));

app.post("/participants", (req, res) => {
    const {name} = req.body;
    const body = {name, lastStatus: Date.now()};
    const exist = db.collection("participants").findOne({name: name});
    if(!name) {
        return res.status(422).send("Campo nome incorreto, digite um nome válido!");
    } else if(exist) {
        return res.status(409).send("Este nome já está sendo usado, escolha outro!");
    } else {
        db.collection("participants").insertOne(body)
            .then(() => {
                db.collection("messages".insertOne({ from: name, to: 'Todos', text: 'entra na sala...', type: 'status', time: Date.now()}))
                    .then(() => res.send(201))
                    .catch((err) => err.message)
            })
            .catch((err) => console.log(err.message));
    }

})







app.listen(PORT, () => console.log(`Rodando na porta: ${PORT}`));
