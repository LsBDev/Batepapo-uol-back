import express, {json} from "express";
import cors from "cors";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import dayjs from "dayjs";
import joi from "joi";

const PORT = 5000;
const app = express();
app.use(cors());
app.use(json());
//app.use(express.json())
dotenv.config();
dayjs().format();


//conexão com o Banco de dados (que é uma aplicação separada do back que por sua vez é separada do front)
// let db;
// const mongoClient = new MongoClient(process.env.DATABASE_URL);
// mongoClient.connect()
//     .then(() => db = mongoClient.db()) //requisição deu certo, coloco as infos do DB na variável db.
//     .catch((err) => console.log(err.message));
const mongoClient = new MongoClient(process.env.DATABASE_URL);
    try {
        await mongoClient.connect();
        console.log('MongoDB Connected!');
    } catch (err) {
        console.log(err.message);
    }
    const db = mongoClient.db();

//Função POST cadastrar participante
app.post("/participants", async (req, res) => {
    const {name} = req.body;
    const body = {name, lastStatus: Date.now()};
    const message = { from: name, to: 'Todos', text: 'entra na sala...', type: 'status', time: dayjs().format('HH:mm:ss')}
    if(!name) {
        return res.status(422).send("Campo nome incorreto, digite um nome válido!");
    }
    try {
        const data = await db.collection("participants").findOne({name: name})
        if(data) return res.status(409).send("Este nome já está sendo usado, escolha outro!");

        await db.collection("participants").insertOne(body);
        await db.collection("messages".insertOne(message));
        return res.send(201);
        
    }catch (err) {
        res.status.send(err.message)
    }
})

//Função GET participantes
app.get("/participants", async (req, res) => {
    try {
        const listaParticipantes = await db.collection("participants").find().toArray();
        if(listaParticipantes) {
            return res.send(listaParticipantes);
        } else {
            return res.send([]);
        }
    }catch (err) {
        res.status.send(err.message)
    }
})
//Função de POST Mensagens
app.post("/messages", (req, res) => {
    const {to, text, type} = req.body;
    const {user} = req.header;
    if(!to || !text) {
        return res.sendStatus(422);
    } else if(type !== "message" ||  type !== "private_message") {
        return res.sendStatus(422);
    }
    // db.collection("participants").findOne(user)
    //     .then(() => {

    //     })
    //     .catch()
    // if(!) {
    //     return res.status(422).send("Participante não existe");
    // }

})

//Finalizar as funções básicas de get post, estudar o Joi para validação -> assistir a aula de sexta feira novamente. Finalizar hj, ou deixar  quase pronto para arremate final amanhã.






app.listen(PORT, () => console.log(`Rodando na porta: ${PORT}`));
