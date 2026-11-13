import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { CartService } from "./cart.service";

@Controller("cart")
export class CartController
{
    constructor(private readonly cartService: CartService)
    {
    }

    @Get()
    getCart()
    {
        return this.cartService.getCart();
    }

    @Post("items")
    addItem(@Body("productId") productId: unknown, @Body("quantity") quantity: unknown)
    {
        return this.cartService.addItem(productId, quantity);
    }

    @Patch("items/:id")
    updateItem(@Param("id") id: string, @Body("quantity") quantity: unknown)
    {
        return this.cartService.updateItem(Number(id), quantity);
    }

    @Delete("items/:id")
    removeItem(@Param("id") id: string)
    {
        return this.cartService.removeItem(Number(id));
    }
}
