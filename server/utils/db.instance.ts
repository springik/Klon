import { Sequelize } from "sequelize";
import pg from 'pg'

const config = useRuntimeConfig()
const seqConfig = {
    dialect: 'postgres',
    dialectModule: pg,
    logging: false,
    dialectOptions:
    {
        ssl: {
            require: true,
            rejectUnauthorized: false
        }
    }
}
export const sequelize = new Sequelize(`${config.DATABASE_URL}`, seqConfig)