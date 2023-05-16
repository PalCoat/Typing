import { prisma } from "./Database";
import * as crypto from "crypto";

export class Authentication {
    randomizer: UIDRandomizer = new UIDRandomizer();
    encrypter: Encrypter = new Encrypter();

    async Login(formData: FormData): Promise<{ message: string }> {
        const username = formData.get("username")?.toString();
        const password = formData.get("password")?.toString();

        if (!username) {
            return {
                message: "username missing",
            };
        }

        if (!password) {
            return {
                message: "password missing",
            };
        }

        try {
            const result = await prisma.user.findFirst({
                where: { name: username },
            });

            if (!result) {
                return {
                    message: "wrong credentials",
                };
            }

            const { salt, hash } = result;

            const newhash = this.encrypter.hash(password, salt);

            if (newhash != hash) {
                return {
                    message: "wrong credentials",
                };
            }

            const session = this.randomizer.generate_unique_id();

            const update = await prisma.user.update({
                where: { id: result.id },
                data: {
                    session,
                },
            });

            return { message: "Login success" };
        } catch (error) {
            return {
                message: "Database connection error",
            };
        }
    }

    async Register(formData: FormData): Promise<{ message: string }> {
        const username = formData.get("username")?.toString();
        const password = formData.get("password")?.toString();

        if (!username) {
            return { message: "Username missing" };
        }

        if (!password) {
            return { message: "Password missing" };
        }

        try {
            const result = await prisma.user.findUnique({
                where: { name: username },
            });
            if (result) {
                return { message: "User already exists" };
            }

            const session = new UIDRandomizer().generate_unique_id();
            const salt = crypto.randomBytes(16).toString("hex");
            const hash = crypto
                .pbkdf2Sync(password, salt, 1000, 64, "sha512")
                .toString("hex");

            const user = await prisma.user.create({
                data: {
                    name: username,
                    hash,
                    salt,
                    session,
                },
            });
            return { message: "Register success" };
        } catch (error) {
            return { message: "Database connection error" };
        }
    }
}

class UIDRandomizer {
    generate_unique_id(): string {
        return crypto.randomUUID();
    }
}

class Encrypter {
    hash(password: string, salt: string): string {
        return crypto
            .pbkdf2Sync(password, salt, 1000, 64, "sha512")
            .toString("hex");
    }
}
