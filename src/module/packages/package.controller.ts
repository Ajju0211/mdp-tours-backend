import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Query,
  Delete,
} from '@nestjs/common';
import { PackageService } from './package.service';
import { CreatePackageDto } from './dto/create-package.dto';
import { CreatePackageWithItineraryDto } from './dto/create-package-with-itinerary.dto';
import { GetPackagesFilterDto } from './dto/get-packages-filter.dto';

@Controller('packages')
export class PackageController {
  constructor(private readonly packageService: PackageService) { }

  // @Post()
  // create(@Body() dto: CreatePackageDto) {
  //   return this.packageService.create(dto);
  // }

  @Post('create-with-itinerary')
  async create(@Body() dto: CreatePackageWithItineraryDto) {
    return this.packageService.createPackageWithItinerary(dto);
  }

  @Patch(':id/update-with-itinerary')
  async update(
    @Param('id') id: string,
    @Body() dto: CreatePackageWithItineraryDto,
  ) {
    return this.packageService.updatePackageWithItinerary(id, dto);
  }

  @Get('id/:id')
  async findById(@Param('id') id: string) {
    return this.packageService.findById(id);
  }

  @Get('admin')
  async getAllPackages(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('category') category?: string,
    @Query('isActive') isActive?: string,
    @Query('isPublic') isPublic?: string,
  ) {
    return this.packageService.findAll({
      page: Number(page),
      limit: Number(limit),
      category,
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
      isPublic: isPublic !== undefined ? isPublic === 'true' : undefined,
    });
  }

  @Get()
  async getFilteredPackages(@Query() filterDto: GetPackagesFilterDto) {
    return this.packageService.getFilteredPackages(filterDto);
  }

  @Delete(':id')
  async deletePackage(@Param('id') id: string) {
    return this.packageService.deletePackage(id);
  }

  @Get(':slug')
  findBySlug(@Param('slug') slug: string) {
    return this.packageService.findBySlug(slug);
  }
}
