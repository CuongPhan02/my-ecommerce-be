export const VOUCHER_TAG = 'Voucher';

export const VOUCHER_DOCUMENTATION = {
  VOUCHER_SUMMARIES: {
    CREATE_VOUCHER: 'Create a new voucher',
    GET_VOUCHERS: 'Get paginated list of vouchers',
    GET_VOUCHER_BY_ID: 'Get a single voucher by ID',
    UPDATE_VOUCHER: 'Update an existing voucher',
    DELETE_VOUCHER: 'Delete a voucher',
    TOGGLE_STATUS: 'Toggle the active status of a voucher',
  },
  VOUCHER_DESCRIPTIONS: {
    CREATE_VOUCHER: 'Create a new voucher/discount code with conditions',
    GET_VOUCHERS: 'Fetch vouchers with optional filtering by status and search by code',
    GET_VOUCHER_BY_ID: 'Retrieve detailed information of a specific voucher',
    UPDATE_VOUCHER: 'Modify properties of an existing voucher',
    DELETE_VOUCHER: 'Remove a voucher completely',
    TOGGLE_STATUS: 'Enable or disable a voucher immediately',
  },
  VOUCHER_REQUEST_BODIES: {
    CREATE_VOUCHER: {
      type: 'object',
      required: ['code', 'type', 'discountValue'],
      properties: {
        code: { type: 'string', example: 'SUMMER50K' },
        description: { type: 'string', example: 'Discount 50k for summer' },
        type: { type: 'string', enum: ['PERCENTAGE', 'FIXED', 'FREE_SHIPPING'], example: 'FIXED' },
        discountValue: { type: 'number', example: 50000 },
        minOrderValue: { type: 'number', example: 200000 },
        usageLimit: { type: 'number', example: 500 },
        isActive: { type: 'boolean', example: true },
        expirationDate: { type: 'string', format: 'date-time' },
      },
    },
    UPDATE_VOUCHER: {
      type: 'object',
      properties: {
        code: { type: 'string', example: 'SUMMER50K' },
        description: { type: 'string', example: 'Discount 50k for summer' },
        type: { type: 'string', enum: ['PERCENTAGE', 'FIXED', 'FREE_SHIPPING'] },
        discountValue: { type: 'number' },
        minOrderValue: { type: 'number' },
        usageLimit: { type: 'number' },
        expirationDate: { type: 'string', format: 'date-time' },
      },
    },
    TOGGLE_STATUS: {
      type: 'object',
      required: ['isActive'],
      properties: {
        isActive: { type: 'boolean', example: false },
      },
    },
  },
};
