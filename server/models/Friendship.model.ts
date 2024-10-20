import { DataTypes, Model } from "sequelize";

export class Friendship extends Model {
    declare id: string;
    declare senderId: string;
    declare receiverid: string;
    declare status: string;
    declare createdAt: Date;
    declare updatedAt: Date;

    static associate(models : any) {
        this.belongsTo(models.User, { foreignKey: 'senderId', as: 'Sender' })
        this.belongsTo(models.User, { foreignKey: 'receiverId', as: 'Receiver' })
    }
}
Friendship.init({
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
    },
    senderId: {
        type: DataTypes.UUID,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    receiverid: {
        type: DataTypes.UUID,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    status: {
        type: DataTypes.ENUM('pending', 'accepted', 'declined'),
        defaultValue: 'pending'
    }
}, { sequelize, timestamps: true, tableName: 'Friendships' })