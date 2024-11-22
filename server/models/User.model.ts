import { DataTypes, Model } from "sequelize";

export class User extends Model {
    declare id: string;
    declare username: string;
    declare email: string;
    declare provider: string;
    declare avatarUrl: string;
    declare createdAt: Date;
    declare updatedAt: Date;

    static associate(models : any) {
        this.hasMany(models.Message, { foreignKey: 'authorId', onDelete: 'CASCADE', onUpdate: 'CASCADE' })
        this.hasMany(models.Message, { foreignKey: 'receiverId', onDelete: 'CASCADE', onUpdate: 'CASCADE' })
        this.hasMany(models.Server, { foreignKey: 'ownerId', onDelete: 'CASCADE', onUpdate: 'CASCADE' })
        this.belongsToMany(models.Server, { through: models.ServerMember, as: 'ServerMemberships', foreignKey: 'userId', otherKey: 'serverId', onDelete: 'CASCADE', onUpdate: 'CASCADE' })
        this.belongsToMany(User, { through: models.Friendship, as: 'Friends1', foreignKey: 'firstFriendId', otherKey: 'secondFriendId', onDelete: 'CASCADE', onUpdate: 'CASCADE' })
        this.belongsToMany(User, { through: models.Friendship, as: 'Friends2', foreignKey: 'secondFriendId', otherKey: 'firstFriendId', onDelete: 'CASCADE', onUpdate: 'CASCADE' })
        this.hasMany(models.FriendshipRequest, { as: 'SentRequests', foreignKey: 'senderId', onDelete: 'CASCADE', onUpdate: 'CASCADE' })
        this.hasMany(models.FriendshipRequest, { as: 'ReceivedRequests', foreignKey: 'receiverid', onDelete: 'CASCADE', onUpdate: 'CASCADE' })
    }
}
User.init({
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    provider: {
        type: DataTypes.ENUM('github', 'google'),
        allowNull: false
    },
    avatarUrl: {
        type: DataTypes.STRING
    }
}, { sequelize, timestamps: true, tableName: 'Users' })