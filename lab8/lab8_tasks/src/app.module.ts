import { Module } from "@nestjs/common";
import { ProductsModule } from "./products.module";
import { AccountsModule } from "./accounts.module";
import { CartModule } from "./cart.module";
import { OrdersModule } from "./orders.module";

@Module({
    imports: [ProductsModule, AccountsModule, CartModule, OrdersModule]
})
export class AppModule
{
}
