import { DataType, DataTypes, Model } from "sequelize";

export class User extends Model {}

User.init({
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