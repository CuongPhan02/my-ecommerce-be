import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import {
  CreateCategoryInput,
  CreateProductInput,
  UpdateCategoryInput,
  UpdateProductInput,
  CreateAttributeInput,
  UpdateAttributeInput,
  CreateBrandInput,
  UpdateBrandInput,
  DeleteManyProductsInput,
  DeleteManyCategoriesInput,
  DeleteManyAttributesInput,
  DeleteManyBrandsInput,
  SaleTimerInput,
} from './product.validate';
import { sendResponseSuccess } from '@/utils/sendResponse';
import { ProductService } from './product.service';
import { ProductRepository } from './product.repository';

export const productController = (fastify: FastifyInstance) => {
  const repo = new ProductRepository(fastify.db);
  const service = new ProductService(repo);

  const cleanQueryParam = (val: any) => {
    if (val === undefined || val === null) return undefined;
    const str = String(val).trim();
    if (str === '' || str === 'null' || str === 'undefined') return undefined;
    return str;
  };

  return {
    // ===== PRODUCT CONTROLLER ===== //
    createProductHandler: async (
      req: FastifyRequest<{ Body: CreateProductInput }>,
      reply: FastifyReply
    ) => {
      const result = await service.createProduct(
        req.body as CreateProductInput
      );
      return sendResponseSuccess(200, reply, 'Create product success', result);
    },

    getAllProductsHandler: async (
      req: FastifyRequest<{
        Querystring?: {
          page?: number;
          limit?: number;
          search?: string;
          categoryId?: string;
          brandId?: string;
          brandIds?: string | string[];
          collectionId?: string;
          attributeValueIds?: string | string[];
          minPrice?: number;
          maxPrice?: number;
          sort?: string;
        };
      }>,
      reply: FastifyReply
    ) => {
      console.log('req.query', req.query);
      if (!req.query?.page || !req.query?.limit) {
        return sendResponseSuccess(
          200,
          reply,
          'Get all products success',
          null
        );
      }

      const search = cleanQueryParam(req.query.search);
      const categoryId = cleanQueryParam(req.query.categoryId);
      const brandId = cleanQueryParam(req.query.brandId);
      const collectionId = cleanQueryParam(req.query.collectionId);
      const sort = cleanQueryParam(req.query.sort);

      const minPriceVal = cleanQueryParam(req.query.minPrice);
      const minPrice = minPriceVal ? Number(minPriceVal) : undefined;

      const maxPriceVal = cleanQueryParam(req.query.maxPrice);
      const maxPrice = maxPriceVal ? Number(maxPriceVal) : undefined;

      const rawBrandIds = req.query.brandIds || (req.query as any)['brandIds[]'];
      const brandIds = rawBrandIds
        ? (Array.isArray(rawBrandIds) ? rawBrandIds : [rawBrandIds])
            .map(cleanQueryParam)
            .filter((v): v is string => !!v)
        : undefined;

      const rawAttributeValueIds = req.query.attributeValueIds || (req.query as any)['attributeValueIds[]'];
      const attributeValueIds = rawAttributeValueIds
        ? (Array.isArray(rawAttributeValueIds) ? rawAttributeValueIds : [rawAttributeValueIds])
            .map(cleanQueryParam)
            .filter((v): v is string => !!v)
        : undefined;

      const result = await service.getAllProducts({
        page: Number(req.query.page),
        limit: Number(req.query.limit),
        search,
        categoryId,
        minPrice,
        maxPrice,
        sort: sort as any,
        brandId,
        brandIds,
        collectionId,
        attributeValueIds,
      });
      return sendResponseSuccess(
        200,
        reply,
        'Get all products success',
        result
      );
    },

    getNewArrivalsHandler: async (
      req: FastifyRequest<{ Querystring?: { limit?: number } }>,
      reply: FastifyReply
    ) => {
      const limit = Number(req.query?.limit) || 10;
      const result = await service.getAllProducts({
        page: 1,
        limit,
        sort: 'newest',
      });
      return sendResponseSuccess(
        200,
        reply,
        'Get new arrivals success',
        result
      );
    },

    getFlashSalesHandler: async (
      req: FastifyRequest<{ Querystring?: { limit?: number } }>,
      reply: FastifyReply
    ) => {
      const limit = Number(req.query?.limit) || 10;
      const result = await service.getAllProducts({
        page: 1,
        limit,
        isFlashSale: true,
      });
      return sendResponseSuccess(
        200,
        reply,
        'Get flash sales success',
        result
      );
    },

    getProductByIdHandler: async (
      req: FastifyRequest<{ Params?: { id: string } }>,
      reply: FastifyReply
    ) => {
      if (!req.params?.id) {
        return sendResponseSuccess(200, reply, 'Get product success', null);
      }
      const result = await service.getProductById(req.params.id);
      return sendResponseSuccess(200, reply, 'Get product success', result);
    },

    updateProductHandler: async (
      req: FastifyRequest<{
        Params?: { id: string };
        Body: UpdateProductInput;
      }>,
      reply: FastifyReply
    ) => {
      if (!req.params?.id) {
        return sendResponseSuccess(200, reply, 'Update product success', null);
      }
      const result = await service.updateProduct(
        req.params.id,
        req.body as UpdateProductInput
      );
      return sendResponseSuccess(200, reply, 'Update product success', result);
    },

    deleteProductHandler: async (
      req: FastifyRequest<{ Params?: { id: string } }>,
      reply: FastifyReply
    ) => {
      if (!req.params?.id) {
        return sendResponseSuccess(200, reply, 'Delete product success', null);
      }
      await service.deleteProduct(req.params.id);
      return sendResponseSuccess(200, reply, 'Delete product success', null);
    },

    deleteManyProductsHandler: async (
      req: FastifyRequest<{ Body: DeleteManyProductsInput }>,
      reply: FastifyReply
    ) => {
      await service.deleteManyProducts(req.body);
      return sendResponseSuccess(
        200,
        reply,
        'Delete many products success',
        null
      );
    },

    /**
     * PUT /api/products/:id/sale-timer
     * Thiết lập timer khuyến mãi cho sản phẩm
     */
    setSaleTimerHandler: async (
      req: FastifyRequest<{
        Params: { id: string };
        Body: SaleTimerInput;
      }>,
      reply: FastifyReply
    ) => {
      const result = await service.setSaleTimer(req.params.id, req.body);
      return sendResponseSuccess(
        200,
        reply,
        'Sale timer updated successfully',
        result
      );
    },

    // ===== CATEGORY CONTROLLER ===== //

    createCategoryHandler: async (
      req: FastifyRequest<{ Body: CreateCategoryInput }>,
      reply: FastifyReply
    ) => {
      const result = await service.createCategory(
        req.body as CreateCategoryInput
      );
      return sendResponseSuccess(200, reply, 'Create category success', result);
    },

    getAllCategoriesHandler: async (
      req: FastifyRequest<{ Querystring?: { page?: number; limit?: number } }>,
      reply: FastifyReply
    ) => {
      const result = await service.getAllCategories(
        Number(req.query?.page) || 1,
        Number(req.query?.limit) || 10
      );
      return sendResponseSuccess(
        200,
        reply,
        'Get all categories success',
        result
      );
    },

    getCategoryByIdHandler: async (
      req: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply
    ) => {
      const result = await service.getCategoryById(req.params.id);
      return sendResponseSuccess(200, reply, 'Get category success', result);
    },

    updateCategoryHandler: async (
      req: FastifyRequest<{
        Params: { id: string };
        Body: UpdateCategoryInput;
      }>,
      reply: FastifyReply
    ) => {
      const result = await service.updateCategory(
        req.params.id,
        req.body as UpdateCategoryInput
      );
      return sendResponseSuccess(200, reply, 'Update category success', result);
    },

    deleteCategoryHandler: async (
      req: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply
    ) => {
      await service.deleteCategory(req.params.id);
      return sendResponseSuccess(200, reply, 'Delete category success', null);
    },

    deleteManyCategoriesHandler: async (
      req: FastifyRequest<{ Body: DeleteManyCategoriesInput }>,
      reply: FastifyReply
    ) => {
      await service.deleteManyCategories(req.body);
      return sendResponseSuccess(
        200,
        reply,
        'Delete many categories success',
        null
      );
    },

    // ===== PRODUCT CONTROLLER ===== //

    createAttributeHandler: async (
      req: FastifyRequest<{ Body: CreateAttributeInput }>,
      reply: FastifyReply
    ) => {
      const result = await service.createAttribute(
        req.body as CreateAttributeInput
      );
      return sendResponseSuccess(
        200,
        reply,
        'Create attribute success',
        result
      );
    },

    getAllAttributesHandler: async (
      req: FastifyRequest<{ Querystring?: { page?: number; limit?: number } }>,
      reply: FastifyReply
    ) => {
      const result = await service.getAllAttributes(
        Number(req.query?.page) || 1,
        Number(req.query?.limit) || 10
      );
      return sendResponseSuccess(
        200,
        reply,
        'Get all attributes success',
        result
      );
    },

    getAttributesWithValuesHandler: async (
      _req: FastifyRequest,
      reply: FastifyReply
    ) => {
      const result = await service.getAttributesWithValues();
      return sendResponseSuccess(
        200,
        reply,
        'Get attributes with values success',
        result
      );
    },

    getAttributeByIdHandler: async (
      req: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply
    ) => {
      const result = await service.getAttributeById(req.params.id);
      return sendResponseSuccess(200, reply, 'Get attribute success', result);
    },

    updateAttributeHandler: async (
      req: FastifyRequest<{
        Params: { id: string };
        Body: UpdateAttributeInput;
      }>,
      reply: FastifyReply
    ) => {
      const result = await service.updateAttribute(
        req.params.id,
        req.body as UpdateAttributeInput
      );
      return sendResponseSuccess(
        200,
        reply,
        'Update attribute success',
        result
      );
    },

    deleteAttributeHandler: async (
      req: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply
    ) => {
      await service.deleteAttribute(req.params.id);
      return sendResponseSuccess(200, reply, 'Delete attribute success', null);
    },

    deleteManyAttributesHandler: async (
      req: FastifyRequest<{ Body: DeleteManyAttributesInput }>,
      reply: FastifyReply
    ) => {
      await service.deleteManyAttributes(req.body);
      return sendResponseSuccess(
        200,
        reply,
        'Delete many attributes success',
        null
      );
    },

    // ===== BRAND CONTROLLER ===== //

    createBrandHandler: async (
      req: FastifyRequest<{ Body: CreateBrandInput }>,
      reply: FastifyReply
    ) => {
      const result = await service.createBrand(req.body as CreateBrandInput);
      return sendResponseSuccess(201, reply, 'Create brand success', result);
    },

    getAllBrandsHandler: async (
      req: FastifyRequest<{ Querystring?: { page?: number; limit?: number } }>,
      reply: FastifyReply
    ) => {
      const result = await service.getAllBrands(
        Number(req.query?.page) || 1,
        Number(req.query?.limit) || 100
      );
      return sendResponseSuccess(200, reply, 'Get all brands success', result);
    },

    getBrandByIdHandler: async (
      req: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply
    ) => {
      const result = await service.getBrandById(req.params.id);
      return sendResponseSuccess(200, reply, 'Get brand success', result);
    },

    updateBrandHandler: async (
      req: FastifyRequest<{
        Params: { id: string };
        Body: UpdateBrandInput;
      }>,
      reply: FastifyReply
    ) => {
      const result = await service.updateBrand(
        req.params.id,
        req.body as UpdateBrandInput
      );
      return sendResponseSuccess(200, reply, 'Update brand success', result);
    },

    deleteBrandHandler: async (
      req: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply
    ) => {
      await service.deleteBrand(req.params.id);
      return sendResponseSuccess(200, reply, 'Delete brand success', null);
    },

    deleteManyBrandsHandler: async (
      req: FastifyRequest<{ Body: DeleteManyBrandsInput }>,
      reply: FastifyReply
    ) => {
      await service.deleteManyBrands(req.body);
      return sendResponseSuccess(
        200,
        reply,
        'Delete many brands success',
        null
      );
    },
  };
};
