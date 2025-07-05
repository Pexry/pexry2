import z from "zod";

export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string(),
})

export const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(3),
    confirmPassword: z.string().min(3),
    username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(63, "Username must be less than 63 characters")
    .regex(
        /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/,
        "Username can only contain lowercase letters, numbers and hyphens. It must start and end with a letter or a number"
    )
    .refine(
        (val) => !val.includes("--"),
        "Username cannot contain consecutive hyphens"
    )
    .transform((val) => val.toLowerCase()),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

export const forgotPasswordSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
    username: z.string().min(1, "Username is required"),
    listedProducts: z.string().min(1, "Please list your products"),
    numberOfProducts: z.coerce.number().min(1, "Number of products you listed"),
});