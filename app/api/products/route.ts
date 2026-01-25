import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const DATA_DIR = join(process.cwd(), 'data');

interface Product {
    id: string;
    artistId: string;
    name: string;
    description?: string;
    type: string;
    price: number;
    currency: string;
    imageUrl?: string;
    fileUrl?: string;
    inventory: number;
    sold: number;
    status: string;
    createdAt: string;
    updatedAt: string;
}

function loadProducts(): Product[] {
    try {
        const path = join(DATA_DIR, 'products.json');
        return JSON.parse(readFileSync(path, 'utf-8'));
    } catch {
        return [];
    }
}

function saveProducts(data: Product[]) {
    const path = join(DATA_DIR, 'products.json');
    writeFileSync(path, JSON.stringify(data, null, 2));
}

// GET /api/products - List all products
// GET /api/products?artistId=xxx - List artist's products
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const artistId = searchParams.get('artistId');

        const products = loadProducts();

        const filtered = artistId
            ? products.filter((p) => p.artistId === artistId && p.status === 'active')
            : products.filter((p) => p.status === 'active');

        return NextResponse.json({
            ok: true,
            count: filtered.length,
            products: filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
        });
    } catch (error) {
        console.error('[PRODUCTS GET ERROR]', error);
        return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
    }
}

// POST /api/products - Create new product (artist only)
export async function POST(req: NextRequest) {
    try {
        const authHeader = req.headers.get('authorization');
        const token = authHeader?.replace('Bearer ', '');

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret') as any;

        if (decoded.role !== 'ARTIST') {
            return NextResponse.json({ error: 'Only artists can create products' }, { status: 403 });
        }

        const { name, description, type, price, currency, imageUrl, fileUrl, inventory } = await req.json();

        if (!name || !type || !price) {
            return NextResponse.json(
                { error: 'Name, type, and price are required' },
                { status: 400 }
            );
        }

        if (price <= 0) {
            return NextResponse.json({ error: 'Price must be greater than 0' }, { status: 400 });
        }

        if (!['beat', 'exclusive', 'merchandise', 'service', 'digital'].includes(type)) {
            return NextResponse.json({ error: 'Invalid product type' }, { status: 400 });
        }

        const product: Product = {
            id: `prod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            artistId: decoded.userId,
            name,
            description,
            type,
            price,
            currency: currency || 'MWK',
            imageUrl,
            fileUrl,
            inventory: inventory || 1,
            sold: 0,
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        const products = loadProducts();
        products.push(product);
        saveProducts(products);

        return NextResponse.json({ ok: true, product }, { status: 201 });
    } catch (error) {
        console.error('[PRODUCTS POST ERROR]', error);
        return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
    }
}

// PATCH /api/products/[id] - Update product
export async function PATCH(req: NextRequest) {
    try {
        const authHeader = req.headers.get('authorization');
        const token = authHeader?.replace('Bearer ', '');

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret') as any;

        const pathname = req.nextUrl.pathname;
        const productId = pathname.split('/').pop();

        if (!productId) {
            return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
        }

        const { status, price, name, description } = await req.json();

        const products = loadProducts();
        const product = products.find((p) => p.id === productId);

        if (!product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        if (product.artistId !== decoded.userId && decoded.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Not authorized to update this product' }, { status: 403 });
        }

        if (status) product.status = status;
        if (price !== undefined) product.price = price;
        if (name) product.name = name;
        if (description) product.description = description;
        product.updatedAt = new Date().toISOString();

        saveProducts(products);

        return NextResponse.json({ ok: true, product });
    } catch (error) {
        console.error('[PRODUCTS PATCH ERROR]', error);
        return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
    }
}
