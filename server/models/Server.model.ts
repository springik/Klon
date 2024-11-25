import { DataTypes, Model } from "sequelize";

export class Server extends Model {
    declare id: string;
    declare name: string;
    declare description: string;
    declare avatarUrl: string;
    declare createdAt: Date;
    declare updatedAt: Date;

    static associate(models : any) {
        this.hasMany(models.Conversation, { foreignKey: 'serverId', onDelete: 'CASCADE', onUpdate: 'CASCADE' })
        this.belongsTo(models.User, { foreignKey: 'ownerId', onDelete: 'CASCADE', onUpdate: 'CASCADE' })
        this.belongsToMany(models.User, { through: models.ServerMember, as: 'Members', foreignKey: 'serverId', otherKey: 'userId', onDelete: 'CASCADE', onUpdate: 'CASCADE' })
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
    description: {
        type: DataTypes.STRING,
        allowNull: true
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