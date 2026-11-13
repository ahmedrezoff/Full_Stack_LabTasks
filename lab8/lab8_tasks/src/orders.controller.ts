import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { OrdersService } from "./orders.service";

@Controller("orders")
export class OrdersController
{
    constructor(private readonly ordersService: OrdersService)
    {
    }

    @Post()
    placeOrder(@Body("recipientName") recipientName: unknown, @Body("depot") depot: unknown)
    {
        return this.ordersService.placeOrder(recipientName, depot);
    }

    @Get(":id")
    getOrder(@Param("id") id: string)
    {
        return this.ordersService.getOrder(Number(id));
    }
}
