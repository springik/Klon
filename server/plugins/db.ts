export default defineNitroPlugin(async (nitro) => {
    try {
        await sequelize.authenticate()
        await sequelize.sync({ alter: true, force: false })
    } catch (error) {
        console.log(error)
    }
})