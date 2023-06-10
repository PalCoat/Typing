import { prisma } from "$lib/scripts/Database";
import type { Cookies } from "@sveltejs/kit";
import * as crypto from "crypto";

type AuthenticationResult = { success: boolean; message: string };

export async function Login(
    formData: FormData,
    cookies: Cookies
): Promise<AuthenticationResult> {
    const username = formData.get("username")?.toString();
    const password = formData.get("password")?.toString();
    if (!username) {
        return { success: false, message: "Username missing" };
    }

    if (!password) {
        return { success: false, message: "Password missing" };
    }

    try {
        const result = await prisma.user.findUnique({
            where: { name: username },
        });

        if (!result) {
            return { success: false, message: "User does not exist" };
        }

        const { salt, hash } = result;

        const newhash = HashPassword(password, salt);

        if (newhash != hash) {
            return { success: false, message: "Wrong credentials" };
        }

        const session = GenerateUniqueId();

        await prisma.user.update({
            where: { id: result.id },
            data: {
                session,
            },
        });

        cookies.set("session", session, {
            path: "/",
            maxAge: 60 * 60 * 5,
            httpOnly: true,
            sameSite: "strict",
            secure: false,
        });
        return { success: true, message: "Login success" };
    } catch {
        return { success: false, message: "Database connection error" };
    }
}

export async function Register(
    formData: FormData,
    cookies: Cookies
): Promise<AuthenticationResult> {
    const username = formData.get("username")?.toString();
    const password = formData.get("password")?.toString();

    if (!username) {
        return { success: false, message: "Username missing" };
    }

    if (!password) {
        return { success: false, message: "Password missing" };
    }

    try {
        const result = await prisma.user.findUnique({
            where: { name: username },
        });
        if (result) {
            return { success: false, message: "User already exists" };
        }

        const session = GenerateUniqueId();
        const salt = crypto.randomBytes(16).toString("hex");
        const hash = HashPassword(password, salt);

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
            secure: false,
            maxAge: 60 * 60 * 5,
        });

        return { success: true, message: "Register success" };
    } catch {
        return { success: false, message: "Database connection error" };
    }
}

export async function Logout(sessionId: string): Promise<AuthenticationResult> {
    try {
        const session = GenerateUniqueId();
        const result = await prisma.user.update({
            where: {
                session: sessionId,
            },
            data: {
                session: session,
            },
        });
        return { success: true, message: "Sign out success" };
    } catch {
        return { success: false, message: "Sign out fail" };
    }
}

function GenerateUniqueId(): string {
    return crypto.randomUUID();
}

function HashPassword(password: string, salt: string): string {
    return crypto
        .pbkdf2Sync(password, salt, 10, 15, "sha512")
        .toString("hex");
}
