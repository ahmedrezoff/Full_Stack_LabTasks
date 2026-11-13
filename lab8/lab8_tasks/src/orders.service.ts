import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { CartService } from "./cart.service";

type Order = ReturnType<CartService["getCart"]> & {
    id: number;
    recipientName: string;
    depot: string;
};

@Injectable()
export class OrdersService
{
    private readonly orders: Order[] = [];

    constructor(private readonly cartService: CartService)
    {
    }

    placeOrder(recipientName: unknown, depot: unknown)
    {
        if (typeof recipientName !== "string" || !recipientName.trim() ||
            typeof depot !== "string" || !depot.trim())
        {
            throw new BadRequestException("Recipient name and depot are required");
        }

        const cart = this.cartService.getCart();
        if (cart.items.length === 0)
        {
            throw new BadRequestException("Cart is empty");
        }

        const order = {
            id: this.orders.length + 1,
            recipientName: recipientName.trim(),
            depot: depot.trim(),
            ...cart
        };

        this.orders.push(order);
        // Order banne ke baad cart khaali kar dete hain.
        this.cartService.clearCart();
        return order;
    }

    getOrder(id: number)
    {
        const order = this.orders.find(item => item.id === id);
        if (!order)
        {
            throw new NotFoundException("Order not found");
        }

        return order;
    }
}
