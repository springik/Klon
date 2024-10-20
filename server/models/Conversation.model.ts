import { DataTypes, Model } from "sequelize";

export class Conversation extends Model {
    declare id: string;
    declare name: string;
    declare serverId: string;
    declare createdAt: Date;
    declare updatedAt: Date;

    static associate(models : any) {
        this.belongsTo(models.Server, { foreignKey: 'serverId', onDelete: 'CASCADE', onUpdate: 'CASCADE' })
        this.hasMany(models.Message, { foreignKey: 'conversationId', onDelete: 'CASCADE', onUpdate: 'CASCADE' })
    }
}
Conversation.init({
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    serverId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Servers',
            key: 'id'
        }
    }
}, { sequelize, timestamps: true, tableName: 'Conversations' })