import { DataTypes, Model } from "sequelize";

export class Poll extends Model {
    declare id: string;
    declare question: string;
    declare options: string[];
    declare conversationId: string;

    static associate(models : any) {
        this.belongsTo(models.Conversation, {  foreignKey: 'conversationId', onDelete: 'CASCADE', onUpdate: 'CASCADE', as: 'conversation' });
        this.hasMany(models.PollEntry, { foreignKey: 'pollId', onDelete: 'CASCADE', onUpdate: 'CASCADE', as: 'entries' });
    }
}
Poll.init({
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
    },
    question: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    options: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    conversationId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Conversations',
            key: 'id'
        }
    }
}, { sequelize, timestamps: true, tableName: 'Polls' })