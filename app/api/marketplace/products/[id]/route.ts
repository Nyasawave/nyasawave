import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import fs from "fs/promises";
import path from "path";

const PRODUCTS_PATH = path.join(process.cwd(), "data", "marketplace-products.json");

/**
 * PRODUCT DETAIL ENDPOINTS
 * 
 * GET /api/marketplace/products/{id} - Get product details
 * PUT /api/marketplace/products/{id} - Update product (SELLER only)
 * DELETE /api/marketplace/products/{id} - Delete product (SELLER only)
 */

// Helper functions
async function fileExists(filePath: string): Promise<boolean> {
    try {
        await fs.access(filePath);
        return true;
    } catch {
        return false;
    }
}

async function getProductsDB(): Promise<any[]> {
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

async function saveProductsDB(products: any[]) {
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
 * GET /api/marketplace/products/{id}
 * Get product details
 */
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // 1. Get product
        const products = await getProductsDB();
        const product = products.find((p: any) => p.id === id);

        if (!product) {
            return NextResponse.json(
                { error: "Product not found" },
                { status: 404 }
            );
        }

        // 2. Only return published products (unless seller viewing own)
        const session = await getServerSession(authOptions);
        const isOwner = session?.user?.id === product.sellerId;

        if (!product.published && !isOwner) {
            return NextResponse.json(
                { error: "Product not found" },
                { status: 404 }
            );
        }

        // 3. Increment views
        product.views = (product.views || 0) + 1;
        await saveProductsDB(products);

        return NextResponse.json({
            success: true,
            product,
        });
    } catch (error) {
        console.error("[MARKETPLACE] GET product error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

/**
 * PUT /api/marketplace/products/{id}
 * Update product (SELLER only)
 */
export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // 1. Check authentication
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 2. Get product
        const products = await getProductsDB();
        const product = products.find((p: any) => p.id === id);

        if (!product) {
            return NextResponse.json(
                { error: "Product not found" },
                { status: 404 }
            );
        }

        // 3. Check ownership
        if (product.sellerId !== session.user.id) {
            return NextResponse.json(
                { error: "You can only edit your own products" },
                { status: 403 }
            );
        }

        // 4. Get update data
        const updates = await req.json();
        const { title, description, price, status, published, media, specifications } =
            updates;

        // 5. Update fields (with validation)
        if (title !== undefined) product.title = title.trim();
        if (description !== undefined) product.description = description.trim();
        if (price !== undefined) product.price = parseFloat(price);
        if (status !== undefined) {
            const validStatuses = ["active", "inactive", "archived"];
            if (validStatuses.includes(status)) {
                product.status = status;
            }
        }
        if (published !== undefined) {
            if (published && !product.published) {
                product.publishedAt = new Date().toISOString();
            }
            product.published = published;
        }
        if (media) product.media = { ...product.media, ...media };
        if (specifications) product.specifications = { ...product.specifications, ...specifications };

        product.updatedAt = new Date().toISOString();

        // 6. Save
        const saved = await saveProductsDB(products);

        if (!saved) {
            return NextResponse.json(
                { error: "Failed to update product" },
                { status: 500 }
            );
        }

        console.log("[MARKETPLACE] Product updated:", {
            productId: id,
            sellerId: session.user.id,
        });

        return NextResponse.json({
            success: true,
            product,
        });
    } catch (error) {
        console.error("[MARKETPLACE] PUT product error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/marketplace/products/{id}
 * Delete product (SELLER only)
 */
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // 1. Check authentication
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 2. Get product
        const products = await getProductsDB();
        const productIndex = products.findIndex((p: any) => p.id === id);

        if (productIndex === -1) {
            return NextResponse.json(
                { error: "Product not found" },
                { status: 404 }
            );
        }

        const product = products[productIndex];

        // 3. Check ownership
        if (product.sellerId !== session.user.id) {
            return NextResponse.json(
                { error: "You can only delete your own products" },
                { status: 403 }
            );
        }

        // 4. Delete (actually soft delete by archiving)
        products.splice(productIndex, 1);
        const saved = await saveProductsDB(products);

        if (!saved) {
            return NextResponse.json(
                { error: "Failed to delete product" },
                { status: 500 }
            );
        }

        console.log("[MARKETPLACE] Product deleted:", {
            productId: id,
            sellerId: session.user.id,
        });

        return NextResponse.json({
            success: true,
            message: "Product deleted",
        });
    } catch (error) {
        console.error("[MARKETPLACE] DELETE product error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
