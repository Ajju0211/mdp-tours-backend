import { Module } from "@nestjs/common";
import { PackageService } from "./package.service";
import { PackageController } from "./package.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { Itinerary, ItinerarySchema } from "../itinerary/schema/itinerary-schema";
import { Package, PackageSchema } from "./schema/package-schema";

@Module({
    imports: [MongooseModule.forFeature([
        {name: Package.name, schema: PackageSchema},
        {name: Itinerary.name,  schema: ItinerarySchema}
    ])],
    providers: [PackageService],
    controllers: [PackageController]
})
export class PackageModule{}