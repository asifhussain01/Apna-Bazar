import { Request, Response } from 'express';
import { Product } from '../models/Product';
import { isMongoConnected, inMemoryProducts } from '../services/inMemoryStore';

export const getProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      category,
      search,
      featured,
      inStockOnly,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = '1',
      limit = '30'
    } = req.query;

    if (!isMongoConnected()) {
      let filtered = [...inMemoryProducts];
      if (category) {
        filtered = filtered.filter(p => p.category?._id === category || p.category?.slug === category);
      }
      if (featured === 'true') {
        filtered = filtered.filter(p => p.isFeatured);
      }
      if (inStockOnly === 'true') {
        filtered = filtered.filter(p => p.stockQuantity > 0);
      }
      if (search && typeof search === 'string') {
        const q = search.toLowerCase();
        filtered = filtered.filter(
          p =>
            p.name.en.toLowerCase().includes(q) ||
            p.name.hi.toLowerCase().includes(q) ||
            p.sku.toLowerCase().includes(q)
        );
      }
      res.json({
        success: true,
        data: filtered,
        pagination: { page: 1, limit: filtered.length, total: filtered.length, totalPages: 1 }
      });
      return;
    }

    const query: any = { isAvailable: true };

    if (category) {
      query.category = category;
    }

    if (featured === 'true') {
      query.isFeatured = true;
    }

    if (inStockOnly === 'true') {
      query.stockQuantity = { $gt: 0 };
    }

    if (search && typeof search === 'string') {
      const trimmed = search.trim();
      query.$or = [
        { 'name.en': { $regex: trimmed, $options: 'i' } },
        { 'name.hi': { $regex: trimmed, $options: 'i' } },
        { sku: { $regex: trimmed, $options: 'i' } },
        { tags: { $in: [new RegExp(trimmed, 'i')] } }
      ];
    }

    const pageNum = Math.max(1, parseInt(page as string, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10)));
    const skip = (pageNum - 1) * limitNum;

    const sortObj: any = {};
    if (sortBy === 'price_asc') sortObj.salePrice = 1;
    else if (sortBy === 'price_desc') sortObj.salePrice = -1;
    else sortObj[sortBy as string] = sortOrder === 'asc' ? 1 : -1;

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('category', 'name slug iconName')
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Product.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: products,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!isMongoConnected()) {
      const prod = inMemoryProducts.find(p => p._id === req.params.id) || inMemoryProducts[0];
      res.json({ success: true, data: prod });
      return;
    }

    const product = await Product.findById(req.params.id).populate('category', 'name slug iconName');
    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }

    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};
