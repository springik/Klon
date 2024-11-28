import { DataTypes, Model } from "sequelize";

export class FriendshipInvite extends Model {
    declare id: string;
    declare senderId: string;
    declare inviteeId: string;
    declare lastsUntil: Date;
    declare createdAt: Date;
    declare updatedAt: Date;

    static associate(models : any) {
        this.belongsTo(models.User, { foreignKey: 'senderId', as: 'Sender' })
        this.belongsTo(models.User, { foreignKey: 'inviteeId', as: 'Invitee' })
    }
}
FriendshipInvite.init({
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
    },
    senderId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    inviteeId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    lastsUntil: {
        type: DataTypes.DATE,
        allowNull: false,
    }
},
{
    sequelize,
    timestamps: true,
    tableName: 'FriendshipInvites',
    hooks: {
        beforeCreate: async (invite : ServerInvite) => {
            if(!invite.lastsUntil)
                invite.lastsUntil = new Date(Date.now() + 604_800_000)
        }
    }
}
)