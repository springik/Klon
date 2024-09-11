import { Sequelize } from "sequelize";

const config = useRuntimeConfig()
export const sequelize = new Sequelize(config.DATABASE_NAME, config.DATABASE_USERNAME, config.DATABASE_PASSWORD, {
    dialect: 'postgres',
    host: config.DATABASE_HOST,
    //logging: false
})