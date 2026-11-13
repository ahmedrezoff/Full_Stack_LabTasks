import { Body, Controller, HttpCode, Post } from "@nestjs/common";
import { AccountsService } from "./accounts.service";

@Controller("accounts")
export class AccountsController
{
    constructor(private readonly accountsService: AccountsService)
    {
    }

    @Post("register")
    register(@Body("name") name: unknown, @Body("email") email: unknown, @Body("password") password: unknown)
    {
        return this.accountsService.register(name, email, password);
    }

    @Post("login")
    @HttpCode(200)
    login(@Body("email") email: unknown, @Body("password") password: unknown)
    {
        return this.accountsService.login(email, password);
    }
}
