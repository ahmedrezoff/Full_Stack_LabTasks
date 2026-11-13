import { join } from "node:path";
import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { AppModule } from "./app.module";

async function main()
{
    const app = await NestFactory.create<NestExpressApplication>(AppModule);
    app.setGlobalPrefix("api");
    app.useStaticAssets(join(__dirname, "..", "public"));

    const port = process.env.PORT || 3000;
    await app.listen(port, "127.0.0.1");
    console.log("Store running at http://localhost:" + port);
}

main().catch(function(error)
{
    console.error(error);
    process.exitCode = 1;
});
