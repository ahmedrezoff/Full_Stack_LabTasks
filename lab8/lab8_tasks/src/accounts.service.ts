import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { BadRequestException, ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";

type Account = {
    id: number;
    name: string;
    email: string;
    salt: string;
    passwordHash: Buffer;
};

@Injectable()
export class AccountsService
{
    private readonly accounts: Account[] = [];

    register(name: unknown, email: unknown, password: unknown)
    {
        if (typeof name !== "string" || !name.trim())
        {
            throw new BadRequestException("Name is required");
        }

        const credentials = this.getCredentials(email, password);
        if (this.accounts.some(account => account.email === credentials.email))
        {
            throw new ConflictException("Email already registered");
        }

        // Asli password ki jagah sirf uska hash rakhte hain.
        const salt = randomBytes(16).toString("hex");
        const passwordHash = scryptSync(credentials.password, salt, 64);
        const account = {
            id: this.accounts.length + 1,
            name: name.trim(),
            email: credentials.email
        };

        this.accounts.push({ ...account, salt, passwordHash });
        return account;
    }

    login(email: unknown, password: unknown)
    {
        const credentials = this.getCredentials(email, password);
        const account = this.accounts.find(item => item.email === credentials.email);

        if (!account || !timingSafeEqual(account.passwordHash, scryptSync(credentials.password, account.salt, 64)))
        {
            throw new UnauthorizedException("Invalid email or password");
        }

        return { id: account.id, name: account.name, email: account.email };
    }

    private getCredentials(email: unknown, password: unknown)
    {
        if (typeof email !== "string" || !email.trim() ||
            typeof password !== "string" || !password.trim())
        {
            throw new BadRequestException("Email and password are required");
        }

        return { email: email.trim().toLowerCase(), password };
    }
}
