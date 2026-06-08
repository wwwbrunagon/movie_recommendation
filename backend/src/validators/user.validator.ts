import { z } from 'zod';

export const updateProfileSchema = z.object({
	name: z
		.string()
		.min(2, 'Name must contain at least 2 characters')
		.max(100, 'Name must contain at most 100 characters'),

	email: z.string().email('Invalid email'),
});

export const changePasswordSchema = z.object({
	currentPassword: z
		.string()
		.min(6, 'Current password must contain at least 6 characters'),

	newPassword: z
		.string()
		.min(6, 'New password must contain at least 6 characters')
		.max(100, 'New password must contain at most 100 characters'),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
