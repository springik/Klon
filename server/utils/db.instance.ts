import { Sequelize } from "sequelize";

const config = useRuntimeConfig()
const seqConfig = {
    dialect: 'postgres',
    logging: false, dialectOptions:
    {
        ssl: {
            require: true,
            rejectUnauthorized: false
        }
    } 
}
export const sequelize = new Sequelize(`${config.DATABASE_URL}`, seqConfig)