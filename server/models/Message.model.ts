import { DataTypes, Model } from "sequelize";

export class Message extends Model {
    declare id: string;
    declare content: string;
    declare authorId: string;
    declare conversationId: string;
    declare receiverId: string;
    declare createdAt: Date;
    declare updatedAt: Date;

    static associate(models : any) {
        this.belongsTo(models.User, { foreignKey: 'authorId', onDelete: 'CASCADE', onUpdate: 'CASCADE', as: 'author' })
        this.belongsTo(models.Conversation, { foreignKey: 'conversationId', onDelete: 'CASCADE', onUpdate: 'CASCADE' })
        this.belongsTo(models.User, { foreignKey: 'receiverId', onDelete: 'CASCADE', onUpdate: 'CASCADE' })
        this.hasMany(models.MessageAttachment, { foreignKey: 'messageId', as: 'attachments', onDelete: 'CASCADE', onUpdate: 'CASCADE' })
    }
}
Message.init({
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    authorId: {
        type: DataTypes.UUID,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    conversationId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'Conversations',
            key: 'id'
        }
    },
    receiverId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'Users',
            key: 'id'
        }
    }
}, { sequelize, timestamps: true, tableName: 'Messages' })