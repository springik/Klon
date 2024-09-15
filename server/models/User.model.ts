import { DataTypes, Model } from "sequelize";

export class User extends Model {
    declare id: string;
    declare username: string;
    declare email: string;
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
            len:[ 4, 50 ],
            notEmpty: true
        }
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isEmail: true
        }
    }
}, { sequelize, timestamps: true, tableName: 'Users' })