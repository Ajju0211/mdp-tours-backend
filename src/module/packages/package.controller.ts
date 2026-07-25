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
import { CreatePackageWithItineraryDto } from './dto/create-package-with-itinerary.dto';
import { GetPackagesFilterDto } from './dto/get-packages-filter.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Packages')
@Controller('package')
export class PackageController {
  constructor(private readonly packageService: PackageService) { }

  /**
   * Endpoint to create a new package alongside its itinerary.
   * Requires administrative privileges.
   * 
   * @param dto - Data transfer object containing package and itinerary details
   * @returns The newly created package and itinerary records
   */
  @Post('create-with-itinerary')
  @ApiOperation({ summary: 'Create a new package with its itinerary' })
  @ApiResponse({ status: 201, description: 'Package created successfully.' })
  async create(@Body() dto: CreatePackageWithItineraryDto) {
    return this.packageService.createPackageWithItinerary(dto);
  }

  /**
   * Endpoint to update an existing package and its itinerary.
   * Requires administrative privileges.
   * 
   * @param id - The unique identifier of the package
   * @param dto - Data transfer object containing updated package and itinerary details
   * @returns The updated package and itinerary records
   */
  @Patch(':id/update-with-itinerary')
  @ApiOperation({ summary: 'Update an existing package and its itinerary' })
  async update(
    @Param('id') id: string,
    @Body() dto: CreatePackageWithItineraryDto,
  ) {
    return this.packageService.updatePackageWithItinerary(id, dto);
  }

  /**
   * Endpoint to find a specific package by its internal MongoDB ID.
   * 
   * @param id - The unique identifier of the package
   * @returns The package document
   */
  @Get('id/:id')
  @ApiOperation({ summary: 'Find a package by ID' })
  async findById(@Param('id') id: string) {
    return this.packageService.findById(id);
  }

  /**
   * Endpoint to retrieve a paginated list of all packages for the admin dashboard.
   * Includes both active and inactive, public and private packages.
   * 
   * @param page - Current page number
   * @param limit - Number of records per page
   * @param category - Optional filter by package category
   * @param isActive - Optional filter by active status (string 'true'/'false')
   * @param isPublic - Optional filter by public visibility status (string 'true'/'false')
   * @returns Paginated result set of packages
   */
  @Get('admin')
  @ApiOperation({ summary: 'Get all packages for admin panel' })
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

  /**
   * Endpoint to retrieve recently added packages that are both active and published (public).
   * Typically used for homepage highlights or 'newly added' sections.
   * 
   * @returns A list of recent active and public packages
   */
  @Get('active-published')
  @ApiOperation({ summary: 'Get recent active and published packages' })
  async getActiveAndPublishedPackages() {
    return this.packageService.getActiveAndPublishedPackages();
  }

  /**
   * Endpoint to retrieve packages using complex filters and cursor-based infinite scrolling.
   * Used for the main public package listing and search page.
   * 
   * @param filterDto - Query parameters containing search terms, price ranges, and cursor
   * @returns Filtered list of packages with a cursor for the next page
   */
  @Get()
  @ApiOperation({ summary: 'Get packages with filters and infinite scroll' })
  async getFilteredPackages(@Query() filterDto: GetPackagesFilterDto) {
    return this.packageService.getFilteredPackages(filterDto);
  }

  /**
   * Endpoint to permanently delete a package and its associated itinerary.
   * Requires administrative privileges.
   * 
   * @param id - The unique identifier of the package to delete
   * @returns A success confirmation of deletion
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a package and its associated itinerary' })
  async deletePackage(@Param('id') id: string) {
    return this.packageService.deletePackage(id);
  }

  /**
   * Endpoint to find a single package by its URL-friendly slug.
   * Typically used by the frontend for public package details pages.
   * 
   * @param slug - The unique string slug of the package
   * @returns The package document including its populated itinerary
   */
  @Get(':slug')
  @ApiOperation({ summary: 'Find a package by slug' })
  findBySlug(@Param('slug') slug: string) {
    return this.packageService.findBySlug(slug);
  }
}
