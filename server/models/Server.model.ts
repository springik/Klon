import { DataTypes, Model } from "sequelize";

export class Server extends Model {
    declare id: string;
    declare name: string;
    declare avatarUrl: string;
    declare createdAt: Date;
    declare updatedAt: Date;

    static associate(models : any) {
        this.hasMany(models.Conversation, { foreignKey: 'serverId', onDelete: 'CASCADE', onUpdate: 'CASCADE' })
        this.belongsTo(models.User, { foreignKey: 'ownerId', onDelete: 'CASCADE', onUpdate: 'CASCADE' })
    }
}
Server.init({
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    avatarUrl: {
        type: DataTypes.STRING,
        allowNull: false
    },
    ownerId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    }
}, { sequelize, timestamps: true, tableName: 'Servers' })