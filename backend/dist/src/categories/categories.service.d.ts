import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto';
export declare class CategoriesService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        id: string;
        name: string;
        slug: string;
        image_url: string | null;
        parent_id: string | null;
        parent: {
            id: string;
            name: string;
            slug: string;
        } | null;
        children: {
            id: string;
            name: string;
            slug: string;
            image_url: string | null;
            parent_id: string | null;
        }[] | undefined;
    }[]>;
    findBySlug(slug: string): Promise<{
        id: string;
        name: string;
        slug: string;
        image_url: string | null;
        parent_id: string | null;
        parent: {
            id: string;
            name: string;
            slug: string;
        } | null;
        children: {
            id: string;
            name: string;
            slug: string;
            image_url: string | null;
            parent_id: string | null;
        }[] | undefined;
    }>;
    create(dto: CreateCategoryDto): Promise<{
        id: string;
        name: string;
        slug: string;
        image_url: string | null;
        parent_id: string | null;
        parent: {
            id: string;
            name: string;
            slug: string;
        } | null;
        children: {
            id: string;
            name: string;
            slug: string;
            image_url: string | null;
            parent_id: string | null;
        }[] | undefined;
    }>;
    update(id: string, dto: UpdateCategoryDto): Promise<{
        id: string;
        name: string;
        slug: string;
        image_url: string | null;
        parent_id: string | null;
        parent: {
            id: string;
            name: string;
            slug: string;
        } | null;
        children: {
            id: string;
            name: string;
            slug: string;
            image_url: string | null;
            parent_id: string | null;
        }[] | undefined;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
    private ensureCategoryExists;
    private ensureUniqueSlug;
    private mapCategory;
}
