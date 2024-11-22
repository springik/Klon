import { DataTypes, Model } from "sequelize";

export class Friendship extends Model {
    declare id: string;
    declare firstFriendId: string;
    declare secondFriendId: string;
    declare createdAt: Date;
    declare updatedAt: Date;

    static associate(models : any) {
        this.belongsTo(models.User, { foreignKey: 'firstFriendId', as: 'User' })
        this.belongsTo(models.User, { foreignKey: 'secondFriendId', as: 'Friend' })
    }
}
Friendship.init({
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
    },
    firstFriendId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    secondFriendId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    }
}, { sequelize, timestamps: true, tableName: 'Friendships' })