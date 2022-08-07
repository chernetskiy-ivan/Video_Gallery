import dotenv from 'dotenv';
import express from 'express';
import { routes } from './routes/index';
import FileUpload from 'express-fileupload';
import { AppDataSource } from './db/data-source';
import swaggerUI from 'swagger-ui-express';
import * as swaggerDokument from './swagger.json';

dotenv.config();

const app = express();

app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDokument));

AppDataSource.initialize()
  .then(() => console.log('db connected!'))
  .catch((error) => console.log(error));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(FileUpload());

const port = process.env.PORT;

app.use('/api', routes);

app.listen(port, () => console.log(`Running on port ${port}`));
