import { prisma } from "$lib/scripts/Database";
import * as crypto from "crypto";

export class Authentication {
    randomizer: UIDRandomizer = new UIDRandomizer();
    encrypter: Encrypter = new Encrypter();

    async Login(formData: FormData, cookies): Promise<string> {
        const username = formData.get("username")?.toString();
        const password = formData.get("password")?.toString();
        if (!username) {
            return "Username missing";
        }

        if (!password) {
            return "Password missing";
        }

        try {
            const result = await prisma.user.findFirst({
                where: { name: username },
            });

            if (!result) {
                return "User does not exist";
            }

            const { salt, hash } = result;

            const newhash = this.encrypter.hash(password, salt);

            if (newhash != hash) {
                return "Wrong credentials";
            }

            const session = this.randomizer.generate_unique_id();

            await prisma.user.update({
                where: { id: result.id },
                data: {
                    session,
                },
            });

            cookies.set("session", session, {
                path: "/",
                httpOnly: true,
                sameSite: "strict",
                secure: true,
                maxAge: 60,
            });

            return "Login success";
        } catch {
            return "Database connection error";
        }
    }

    async Register(formData: FormData, cookies): Promise<string> {
        const username = formData.get("username")?.toString();
        const password = formData.get("password")?.toString();

        if (!username) {
            return "Username missing";
        }

        if (!password) {
            return "Password missing";
        }

        try {
            const result = await prisma.user.findUnique({
                where: { name: username },
            });
            if (result) {
                return "User already exists";
            }

            const session = new UIDRandomizer().generate_unique_id();
            const salt = crypto.randomBytes(16).toString("hex");
            const hash = this.encrypter.hash(password, salt);

            const user = await prisma.user.create({
                data: {
                    name: username,
                    hash,
                    salt,
                    session,
                },
            });

            cookies.set("session", user.session, {
                path: "/",
                httpOnly: true,
                sameSite: "strict",
                secure: true,
                maxAge: 60,
            });

            return "Register success";
        } catch {
            return "Database connection error";
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
            .pbkdf2Sync(password, salt, 1000, 15, "sha512")
            .toString("hex");
    }
}
