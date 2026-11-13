import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { ProductsService } from "./products.service";

type CartItem = {
    id: number;
    name: string;
    price: number;
    quantity: number;
};

@Injectable()
export class CartService
{
    private items: CartItem[] = [];

    constructor(private readonly productsService: ProductsService)
    {
    }

    getCart()
    {
        const items = this.items.map(item => ({ ...item }));
        const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const freight = items.length > 0 ? 12.50 : 0;
        return { items, subtotal, freight, total: subtotal + freight };
    }

    addItem(productId: unknown, quantity: unknown = 1)
    {
        if (typeof productId !== "number" || !Number.isInteger(productId) || productId < 1)
        {
            throw new BadRequestException("A valid productId is required");
        }

        const amount = this.checkQuantity(quantity);
        // Price catalogue se lete hain.
        const product = this.productsService.getProduct(productId);
        const item = this.items.find(item => item.id === product.id);

        if (item)
        {
            item.quantity = this.checkQuantity(item.quantity + amount);
        }
        else
        {
            this.items.push({ ...product, quantity: amount });
        }

        return this.getCart();
    }

    updateItem(id: number, quantity: unknown)
    {
        const item = this.items.find(item => item.id === id);
        if (!item)
        {
            throw new NotFoundException("Item not in cart");
        }

        item.quantity = this.checkQuantity(quantity);
        return this.getCart();
    }

    removeItem(id: number)
    {
        const index = this.items.findIndex(item => item.id === id);
        if (index === -1)
        {
            throw new NotFoundException("Item not in cart");
        }

        this.items.splice(index, 1);
        return this.getCart();
    }

    clearCart()
    {
        this.items = [];
    }

    private checkQuantity(quantity: unknown)
    {
        if (typeof quantity !== "number" || !Number.isInteger(quantity) || quantity < 1 || quantity > 999)
        {
            throw new BadRequestException("Quantity must be a whole number from 1 to 999");
        }

        return quantity;
    }
}
