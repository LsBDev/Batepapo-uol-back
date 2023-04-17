import express, {json} from "express";
import cors from "cors";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import dayjs from "dayjs";
import joi from "joi";

const PORT = 5000;
const app = express();
app.use(cors());
app.use(json()); // ou app.use(express.json())
dotenv.config();
// dayjs().format();


//conexão com o Banco de dados (que é uma aplicação separada do back que por sua vez é separada do front)
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
    const { name } = req.body;
    const newUser = {name, lastStatus: Date.now()};
    const userSchema = joi.object({ name: joi.string().required() });
    const validation = userSchema.validate(name);
    const message = { 
        from: name, 
        to: 'Todos', 
        text: 'entra na sala...', 
        type: 'status', 
        time: dayjs().format('HH:mm:ss')
    }

    if(validation.error) {
        const err = validation.error.details.map((detail) => detail.message);
        return res.status(422).send(err);
    }
    
    try {
        const data = await db.collection("participants").findOne({name: name})
        if(data) return res.status(409).send("Este nome já está sendo usado, escolha outro!");

        await db.collection("participants").insertOne(newUser);
        await db.collection("messages").insertOne(message);
        return res.sendStatus(201);
        
    }catch (err) {
        res.send(err.message)
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
        res.send(err.message)
    }
})
//Função de POST Mensagens
app.post("/messages", async (req, res) => {
    const {to, text, type} = req.body;
    const {user} = req.header;
    const messageSchema = joi.object({
        from: joi.string().required(),
        to: joi.string().required(),
        text: joi.string().required(),
        type: joi.string().valid("message", "private_message").required(),
        time: joi.string()
    })
    const message = {
        from: user,
        to: to,
        text: text,
        type: type,
        time: dayjs().format('HH:mm:ss')
    }

    try {
        const participantOn = await db.collection("participants").findOne(user);
        if(!participantOn) return res.sendStatus(422);

        const validation = messageSchema.validate(message);
        if(validation.error) {
            const err = validation.error.details.map((detail) => detail.message);
            return res.status(422).send(err);
        }

        await db.collection("messages").insertOne(message);
        return res.sendStatus(201);

    }catch (err) {
        res.send(err.message)
    }


})

//Finalizar as funções básicas de get post, estudar o Joi para validação -> assistir a aula de sexta feira novamente. Finalizar hj, ou deixar  quase pronto para arremate final amanhã.



app.listen(PORT, () => console.log(`Rodando na porta: ${PORT}`));
