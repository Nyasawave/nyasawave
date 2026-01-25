import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import fs from "fs/promises";
import path from "path";

const PRODUCTS_PATH = path.join(process.cwd(), "data", "marketplace-products.json");

/**
 * MARKETPLACE PRODUCTS ENDPOINTS
 * 
 * GET /api/marketplace/products - List all products (with filters: category, seller, status)
 * POST /api/marketplace/products - Create product (ENTREPRENEUR, ARTIST)
 * PUT /api/marketplace/products/{id} - Update product (SELLER only)
 * DELETE /api/marketplace/products/{id} - Delete product (SELLER only)
 */

interface Product {
    id: string;
    sellerId: string;
    sellerName: string;
    title: string;
    description: string;
    category: string; // "BEATS", "SAMPLES", "PLUGINS", "COURSES", "SERVICES"
    price: number;
    currency: string; // "USD", "NGN"
    media?: {
        cover: string; // URL to cover image
        preview?: string; // URL to preview audio (for beats/samples)
    };
    specifications?: Record<string, any>; // For beats: BPM, Key, Genre, etc.
    status: "active" | "inactive" | "archived";
    published: boolean;
    publishedAt?: string;
    views: number;
    sales: number;
    rating: number; // 0-5
    reviews: number;
    createdAt: string;
    updatedAt: string;
}

// Helper functions
async function fileExists(filePath: string): Promise<boolean> {
    try {
        await fs.access(filePath);
        return true;
    } catch {
        return false;
    }
}

async function getProductsDB(): Promise<Product[]> {
    try {
        if (await fileExists(PRODUCTS_PATH)) {
            const content = await fs.readFile(PRODUCTS_PATH, "utf-8");
            return JSON.parse(content) || [];
        }
        return [];
    } catch (e) {
        return [];
    }
}

async function saveProductsDB(products: Product[]) {
    try {
        const dir = path.dirname(PRODUCTS_PATH);
        await fs.mkdir(dir, { recursive: true });
        await fs.writeFile(PRODUCTS_PATH, JSON.stringify(products, null, 2));
        return true;
    } catch (e) {
        return false;
    }
}

async function getUsersDB() {
    try {
        const usersPath = path.join(process.cwd(), "data", "users.json");
        if (await fileExists(usersPath)) {
            const content = await fs.readFile(usersPath, "utf-8");
            return JSON.parse(content) || [];
        }
        return [];
    } catch (e) {
        return [];
    }
}

/**
 * GET /api/marketplace/products
 * List products with filtering
 */
export async function GET(req: NextRequest) {
    try {
        const url = new URL(req.url);
        const category = url.searchParams.get("category");
        const seller = url.searchParams.get("seller");
        const status = url.searchParams.get("status") || "active";
        const page = parseInt(url.searchParams.get("page") || "1");
        const limit = parseInt(url.searchParams.get("limit") || "20");

        // 1. Get products
        let products = await getProductsDB();

        // 2. Filter
        if (category) {
            products = products.filter(p => p.category === category.toUpperCase());
        }
        if (seller) {
            products = products.filter(p => p.sellerId === seller);
        }
        if (status) {
            products = products.filter(p => p.status === status);
        }

        // 3. Filter to only published
        products = products.filter(p => p.published);

        // 4. Sort by latest first
        products.sort(
            (a, b) =>
                new Date(b.publishedAt || b.createdAt).getTime() -
                new Date(a.publishedAt || a.createdAt).getTime()
        );

        // 5. Paginate
        const total = products.length;
        const totalPages = Math.ceil(total / limit);
        const offset = (page - 1) * limit;
        const paginated = products.slice(offset, offset + limit);

        // 6. Increment views (client-side tracking preferred, but track here for stats)
        return NextResponse.json({
            success: true,
            products: paginated,
            pagination: {
                page,
                limit,
                total,
                totalPages,
            },
        });
    } catch (error) {
        console.error("[MARKETPLACE] GET products error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

/**
 * POST /api/marketplace/products
 * Create new product (ENTREPRENEUR, ARTIST)
 */
export async function POST(req: NextRequest) {
    try {
        // 1. Check authentication
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 2. Check seller role
        const users = await getUsersDB();
        const user = users.find((u: any) => u.id === session.user.id);
        const isEntrepreneur = user?.roles?.includes("ENTREPRENEUR");
        const isArtist = user?.roles?.includes("ARTIST");

        if (!isEntrepreneur && !isArtist) {
            return NextResponse.json(
                {
                    error:
                        "Only entrepreneurs and artists can create products",
                },
                { status: 403 }
            );
        }

        // 3. Get request body
        const {
            title,
            description,
            category,
            price,
            currency = "USD",
            media = {},
            specifications = {},
        } = await req.json();

        // 4. Validate required fields
        if (!title || !description || !category || !price) {
            return NextResponse.json(
                {
                    error:
                        "Missing required fields: title, description, category, price",
                },
                { status: 400 }
            );
        }

        // 5. Validate category
        const validCategories = ["BEATS", "SAMPLES", "PLUGINS", "COURSES", "SERVICES"];
        if (!validCategories.includes(category.toUpperCase())) {
            return NextResponse.json(
                {
                    error: `Invalid category. Must be one of: ${validCategories.join(", ")}`,
                },
                { status: 400 }
            );
        }

        // 6. Create product
        const product: Product = {
            id: `product_${Date.now()}`,
            sellerId: session.user.id,
            sellerName: user?.name || "Unknown",
            title: title.trim(),
            description: description.trim(),
            category: category.toUpperCase(),
            price: parseFloat(price),
            currency: currency.toUpperCase(),
            media,
            specifications,
            status: "active",
            published: false, // Require manual publication
            views: 0,
            sales: 0,
            rating: 0,
            reviews: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        // 7. Save product
        const products = await getProductsDB();
        products.push(product);
        const saved = await saveProductsDB(products);

        if (!saved) {
            return NextResponse.json(
                { error: "Failed to create product" },
                { status: 500 }
            );
        }

        console.log("[MARKETPLACE] Product created:", {
            productId: product.id,
            sellerId: session.user.id,
            title,
            price,
        });

        return NextResponse.json(
            {
                success: true,
                product,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("[MARKETPLACE] POST product error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
