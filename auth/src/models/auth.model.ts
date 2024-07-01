import { sequelize } from "@auth/database";
import { IAuthDocument } from "@ahgittix/jobber-shared";
import { compare, hash } from "bcryptjs";
import { DataTypes, Model } from "sequelize";
import { NODE_ENV } from "@auth/config";

// type AuthUserCreationAttributes = Optional<
//     IAuthDocument,
//     | "id"
//     | "createdAt"
//     | "passwordResetToken"
//     | "passwordResetExpires"
//     | "comparePassword"
//     | "hashPassword"
// >;

export class AuthModel extends Model<IAuthDocument> {
    public SALT_ROUND: number;
    constructor() {
        super();
        this.SALT_ROUND = 10;
    }
    async comparePassword(
        password: string,
        hashedPassword: string
    ): Promise<boolean> {
        return compare(password, hashedPassword);
    }

    async hashPassword(password: string): Promise<string> {
        return hash(password, this.SALT_ROUND);
    }
}

AuthModel.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        },
        profilePublicId: {
            type: DataTypes.STRING,
            allowNull: false
        },
        email: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false,
            validate: {
                isEmail: true
            }
        },
        country: {
            type: DataTypes.STRING,
            allowNull: false
        },
        profilePicture: {
            type: DataTypes.STRING,
            allowNull: false
        },
        emailVerificationToken: {
            type: DataTypes.STRING,
            allowNull: true
        },
        emailVerified: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: 0
        },
        createdAt: {
            type: DataTypes.DATE,
            defaultValue: new Date()
        },
        passwordResetToken: { type: DataTypes.STRING, allowNull: true },
        passwordResetExpires: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: new Date()
        }
    },
    {
        sequelize,
        modelName: "Auths",
        hooks: {
            beforeCreate: async (auth: AuthModel) => {
                const hashedPassword: string = await hash(
                    auth.dataValues.password!,

                    auth.SALT_ROUND
                );
                auth.dataValues.password = hashedPassword;
            }
        },
        indexes: [
            {
                unique: true,
                fields: ["email"]
            },
            {
                unique: true,
                fields: ["username"]
            },
            {
                unique: true,
                fields: ["emailVerificationToken"]
            }
        ]
    }
);

if (NODE_ENV !== "test") {
    AuthModel.sync({});
}
