export { formatRelativeTime, formatCompactNumber, formatCategory } from './format';
export { normalizeError, getErrorMessage } from './error-handler';
export type { AppError } from './error-handler';
export { isIOS, isAndroid, isWeb, SCREEN_WIDTH, SCREEN_HEIGHT, isTablet, platformSelect } from './platform';
export {
  loginSchema,
  registerSchema,
  createPostSchema,
  emailSchema,
  passwordSchema,
  usernameSchema,
  displayNameSchema,
} from './validation';
export type { LoginFormData, RegisterFormData, CreatePostFormData } from './validation';
