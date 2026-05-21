export const COLLECTION_TAG = 'Collection';

export const PAGINATION_QUERYSTRING = {
  type: 'object',
  properties: {
    page: { type: 'number', default: 1 },
    limit: { type: 'number', default: 10 },
  },
};

export const COLLECTION_DOCUMENTATION = {
  COLLECTION_SUMMARIES: {
    CREATE_COLLECTION: 'Create a new collection (Admin)',
    GET_ALL_COLLECTIONS: 'Get all collections with pagination (Admin)',
    GET_HOME_COLLECTIONS: 'Get homepage collections (Public)',
    GET_COLLECTION_BY_ID: 'Get collection matching ID',
    UPDATE_COLLECTION: 'Update an existing collection (Admin)',
    TOGGLE_HOME_ACTIVE: 'Toggle homepage visibility of a collection (Admin)',
    DELETE_COLLECTION: 'Delete an existing collection (Admin)',
    ADD_PRODUCTS: 'Add products to a collection (Admin)',
  },
  COLLECTION_DESCRIPTIONS: {
    CREATE_COLLECTION: 'Create a new collection with the given data.',
    GET_ALL_COLLECTIONS:
      'Get a paginated list of all collections along with their associated products.',
    GET_HOME_COLLECTIONS:
      'Lấy danh sách collections đang được bật hiển thị trên trang chủ (isHomeActive=true và isActive=true). Dùng để render phần bộ sưu tập trên homepage.',
    GET_COLLECTION_BY_ID:
      'Retrieve a specific collection and its associated products by its unique ID.',
    UPDATE_COLLECTION: 'Update an existing collection with new data.',
    TOGGLE_HOME_ACTIVE:
      'Bật hoặc tắt hiển thị collection trên trang chủ bằng cách cập nhật cờ isHomeActive.',
    DELETE_COLLECTION:
      'Delete a collection by its unique ID. This will also remove the association with its products, but will not delete the products themselves.',
    ADD_PRODUCTS:
      'Add an array of product IDs to a specific collection matching the ID.',
  },
  COLLECTION_REQUEST_BODIES: {
    CREATE_COLLECTION: {
      type: 'object',
      required: ['name', 'slug'],
      properties: {
        name: { type: 'string' },
        slug: { type: 'string' },
        description: { type: 'string', nullable: true },
        imageUrl: { type: 'string', nullable: true },
        isActive: { type: 'boolean', default: true },
        isHomeActive: {
          type: 'boolean',
          default: false,
          description: 'Bật hiển thị trên trang chủ ngay khi tạo',
        },
      },
    },
    TOGGLE_HOME_ACTIVE: {
      type: 'object',
      required: ['isHomeActive'],
      properties: {
        isHomeActive: {
          type: 'boolean',
          description: 'true = hiển thị trên homepage, false = ẩn khỏi homepage',
        },
      },
    },
    ADD_PRODUCTS: {
      type: 'object',
      required: ['productIds'],
      properties: {
        productIds: {
          type: 'array',
          items: {
            type: 'string',
          },
        },
      },
    },
  },
};
