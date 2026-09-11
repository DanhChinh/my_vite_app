const Joi = require('joi');
const AppError = require('../utils/AppError');

const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, { stripUnknown: true });
  if (error) {
    throw new AppError(error.details[0].message, 400, 'INVALID_INPUT');
  }
  req.body = value; // Gán lại dữ liệu đã qua xử lý (trim, strip)
  next();
};

const registerSchema = Joi.object({
  username: Joi.string().alphanum().min(3).required().messages({
    'any.required': 'Vui lòng nhập tên đăng nhập.',
    'string.empty': 'Tên đăng nhập không được để trống.'
  }),
  password: Joi.string().min(8).required().messages({
    'string.min': 'Mật khẩu phải có ít nhất 8 ký tự.',
    'any.required': 'Vui lòng nhập mật khẩu.'
  }),
  full_name: Joi.string().trim().required().messages({
    'any.required': 'Vui lòng nhập họ tên.'
  }),
  phone: Joi.string().trim().pattern(/^[0-9]{10}$/).required().messages({
    'string.pattern.base': 'Số điện thoại không hợp lệ (cần 10 chữ số).',
    'any.required': 'Vui lòng nhập số điện thoại.'
  }),
  email: Joi.string().email().allow('', null),
  gender: Joi.string().valid('male', 'female', 'other').default('other'),
  date_of_birth: Joi.string().isoDate().allow('', null)
});

const loginSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required()
});

const addressSchema = Joi.object({
  recipient_name: Joi.string().trim().required().messages({
    'any.required': 'Tên người nhận là bắt buộc!',
    'string.empty': 'Tên người nhận không được để trống!'
  }),
  phone: Joi.string().trim().pattern(/^[0-9]{10}$/).required().messages({
    'string.pattern.base': 'Số điện thoại không hợp lệ (cần 10 chữ số)!',
    'any.required': 'Số điện thoại là bắt buộc!'
  }),
  address_line: Joi.string().trim().required().messages({
    'any.required': 'Địa chỉ chi tiết là bắt buộc!',
    'string.empty': 'Địa chỉ chi tiết không được để trống!'
  }),
  is_default: Joi.boolean().default(false)
});

module.exports = { validate, registerSchema, loginSchema, addressSchema };