import { DataTypes, Model } from "sequelize";

export class MessageAttachment extends Model {
    declare id: string;
    declare contentUrl: string;
    declare messageId: string;
    declare createdAt: Date;
    declare updatedAt: Date;

    static associate(models : any) {
        this.belongsTo(models.Message, { foreignKey: 'messageId', as: 'message', onDelete: 'CASCADE', onUpdate: 'CASCADE' })
    }
}
MessageAttachment.init({
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
    },
    contentUrl: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    messageId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Messages',
            key: 'id'
        }
    }
}, { sequelize, timestamps: true, tableName: 'MessageAttachments' })