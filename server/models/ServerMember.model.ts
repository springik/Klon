import { DataTypes, Model } from "sequelize";

export class ServerMember extends Model {
    declare id: string;
    declare userId: string;
    declare serverId: string;

    static associate(models : any) {
        this.belongsTo(models.User, { foreignKey: 'userId', as: 'User' })
        this.belongsTo(models.Server, { foreignKey: 'serverId', as: 'Server' })
    }
}
ServerMember.init({
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    serverId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Servers',
            key: 'id'
        }
    }
}, { sequelize, timestamps: true, tableName: 'ServerMembers' })