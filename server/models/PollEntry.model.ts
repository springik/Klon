import { DataTypes, Model } from "sequelize";

export class PollEntry extends Model {
    declare id: string;
    declare pollId: string;
    declare voterId: string;
    declare option: number;

    static associate(models : any) {
        this.belongsTo(models.Poll, { foreignKey: 'pollId', onDelete: 'CASCADE', onUpdate: 'CASCADE', as: 'poll' });
        this.belongsTo(models.User, { foreignKey: 'voterId', onDelete: 'CASCADE', onUpdate: 'CASCADE', as: 'voter' });
    }
}
PollEntry.init({
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
    },
    option: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    pollId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Polls',
            key: 'id'
        }
    },
    voterId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    }
}, { sequelize, timestamps: true, tableName: 'PollEntries' })