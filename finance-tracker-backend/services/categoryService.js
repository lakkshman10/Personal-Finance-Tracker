const categoryRepository = require('../repositories/categoryRepository');

const ALLOWED_TYPES = new Set(['EXPENSE', 'INCOME']);

const normalizeName = (name) => {
  if (typeof name !== 'string' || !name.trim()) throw new Error('Category name is required.');
  const value = name.trim();
  if (value.length > 100) throw new Error('Category name must be 100 characters or fewer.');
  return value;
};

const validateType = (type) => {
  if (!ALLOWED_TYPES.has(type)) throw new Error('Invalid category type.');
};

const categoryService = {
  async list(userId, type) {
    if (type !== undefined) validateType(type);
    return categoryRepository.findAvailableForUser(userId, type);
  },

  async create(userId, input) {
    const { name, type, parentId = null } = input || {};
    validateType(type);

    if (parentId) {
      const parent = await categoryRepository.findByIdForUser(parentId, userId);
      if (!parent || parent.type !== type || !parent.isActive) {
        throw new Error('Invalid parent category.');
      }
    }

    return categoryRepository.create({
      userId,
      name: normalizeName(name),
      type,
      parentId,
      isSystem: false,
      isActive: true,
    });
  },

  async update(userId, id, input = {}) {
    const existing = await categoryRepository.findOwnedById(id, userId);
    if (!existing) return null;

    const data = {};
    if (input.name !== undefined) data.name = normalizeName(input.name);
    if (input.type !== undefined) {
      validateType(input.type);
      if (input.type !== existing.type) throw new Error('Category type cannot be changed.');
    }
    if (input.parentId !== undefined) {
      if (input.parentId === id) throw new Error('A category cannot be its own parent.');
      if (input.parentId === null) {
        data.parentId = null;
      } else {
        const parent = await categoryRepository.findByIdForUser(input.parentId, userId);
        if (!parent || parent.type !== existing.type || !parent.isActive) {
          throw new Error('Invalid parent category.');
        }
        data.parentId = input.parentId;
      }
    }
    if (input.isActive !== undefined) {
      if (typeof input.isActive !== 'boolean') throw new Error('isActive must be boolean.');
      data.isActive = input.isActive;
    }

    if (Object.keys(data).length === 0) throw new Error('No valid category fields to update.');
    return categoryRepository.updateByIdForUser(id, userId, data);
  },
};

module.exports = categoryService;
