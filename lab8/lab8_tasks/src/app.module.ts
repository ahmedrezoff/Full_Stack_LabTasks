import { Module } from "@nestjs/common";
import { ProductsController } from "./products.controller";
import { ProductsService } from "./products.service";
import { AccountsController } from "./accounts.controller";
import { AccountsService } from "./accounts.service";
import { CartController } from "./cart.controller";
import { CartService } from "./cart.service";
import { OrdersController } from "./orders.controller";
import { OrdersService } from "./orders.service";

@Module({
    controllers: [ProductsController, AccountsController, CartController, OrdersController],
    providers: [ProductsService, AccountsService, CartService, OrdersService]
})
export class AppModule
{
}
