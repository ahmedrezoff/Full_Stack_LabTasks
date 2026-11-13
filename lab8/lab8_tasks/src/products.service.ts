import { Injectable, NotFoundException } from "@nestjs/common";

@Injectable()
export class ProductsService
{
    private readonly products = [
        { id: 1, name: "Mauser Pistol", price: 600 },
        { id: 2, name: "Elephant Rifle", price: 580 },
        { id: 3, name: "Semi-Auto Shotgun", price: 540 },
        { id: 4, name: "Advanced Camera", price: 540 },
        { id: 5, name: "LeMat Revolver", price: 317 },
        { id: 6, name: "Salizzo Bandolier", price: 358.50 }
    ];

    getProducts()
    {
        return this.products;
    }

    getProduct(id: number)
    {
        const product = this.products.find(item => item.id === id);
        if (!product)
        {
            throw new NotFoundException("Product not found");
        }

        return product;
    }
}
