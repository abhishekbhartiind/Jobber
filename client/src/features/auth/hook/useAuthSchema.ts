import { IUseAuthSchema } from "../interfaces/auth.interface";
import { ValidationError } from "yup";

export const useAuthSchema = ({
    schema,
    userInfo
}: IUseAuthSchema): [() => Promise<[boolean, string]>] => {
    async function schemaValidation(): Promise<[boolean, string]> {
        let errorMessages = "";
        const validation = await schema.isValid(userInfo, {
            abortEarly: false
        });

        await schema
            .validate(userInfo, { abortEarly: false })
            .catch((error: ValidationError) => {
                errorMessages = error.errors
                    .map((error) => Object.values(error)[0])
                    .join("\n");
            });

        return [validation, errorMessages];
    }

    return [schemaValidation];
};
