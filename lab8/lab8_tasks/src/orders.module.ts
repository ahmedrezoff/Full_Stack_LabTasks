import { Module } from "@nestjs/common";
import { CartModule } from "./cart.module";
import { OrdersController } from "./orders.controller";
import { OrdersService } from "./orders.service";

@Module({
    imports: [CartModule],
    controllers: [OrdersController],
    providers: [OrdersService]
})
export class OrdersModule
{
}
