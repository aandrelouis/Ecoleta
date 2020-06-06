import express from 'express';
import routes from './routes';
import path from 'path';
import cors from 'cors';
const app = express();

app.use(cors());
app.use(express.json());
app.use(routes);


app.use('/uploads' , express.static(path.resolve(__dirname,'..','uploads')));

app.listen(3333);


//Query params : filtros que vem na rota que geralmente são opcionais
//request body:parametros apra criação/atualização de informações