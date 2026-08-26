/**
 * Onda do Bem — Validações
 *
 * Schemas Zod para validação de formulários.
 * Usados em conjunto com React Hook Form via @hookform/resolvers.
 *
 * Nota: Zod v4 usa `{ error: message }` em vez de `{ required_error: message }`.
 */

import { z } from 'zod';

// ---------------------------------------------------------------------------
// Campos comuns
// ---------------------------------------------------------------------------

export const emailSchema = z
  .string({ error: 'E-mail é obrigatório' })
  .email('E-mail inválido')
  .toLowerCase()
  .trim();

export const passwordSchema = z
  .string({ error: 'Senha é obrigatória' })
  .min(8, 'Senha deve ter pelo menos 8 caracteres')
  .max(128, 'Senha muito longa');

export const usernameSchema = z
  .string({ error: 'Nome de usuário é obrigatório' })
  .min(3, 'Nome de usuário deve ter pelo menos 3 caracteres')
  .max(30, 'Nome de usuário deve ter no máximo 30 caracteres')
  .regex(/^[a-zA-Z0-9._-]+$/, 'Apenas letras, números, pontos, hífens e underscores');

export const displayNameSchema = z
  .string({ error: 'Nome é obrigatório' })
  .min(2, 'Nome deve ter pelo menos 2 caracteres')
  .max(60, 'Nome deve ter no máximo 60 caracteres')
  .trim();

// ---------------------------------------------------------------------------
// Schemas de formulário
// ---------------------------------------------------------------------------

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string({ error: 'Senha é obrigatória' }).min(1, 'Senha é obrigatória'),
});

export const registerSchema = z
  .object({
    email: emailSchema,
    username: usernameSchema,
    displayName: displayNameSchema,
    password: passwordSchema,
    confirmPassword: z.string({ error: 'Confirme a senha' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  });

export const createPostSchema = z.object({
  title: z
    .string({ error: 'Título é obrigatório' })
    .min(3, 'Título deve ter pelo menos 3 caracteres')
    .max(100, 'Título deve ter no máximo 100 caracteres')
    .trim(),
  description: z
    .string({ error: 'Descrição é obrigatória' })
    .min(10, 'Descrição deve ter pelo menos 10 caracteres')
    .max(2000, 'Descrição deve ter no máximo 2000 caracteres')
    .trim(),
  category: z.string({ error: 'Selecione uma categoria' }),
});

// ---------------------------------------------------------------------------
// Inferred Types
// ---------------------------------------------------------------------------

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type CreatePostFormData = z.infer<typeof createPostSchema>;
