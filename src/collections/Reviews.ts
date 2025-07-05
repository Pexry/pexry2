import { CollectionConfig } from "payload";
import { isSuperAdmin } from "@/lib/access";

export const Reviews: CollectionConfig = {
    slug: "reviews",
    admin: {
        useAsTitle: "description",
        hidden: ({ user }) => !isSuperAdmin(user),
    },
    fields: [
        {
            name: "description",
            type: "textarea",
            required: true,
        },
        {
            name: "rating",
            type: "number",
            required: true,
            min: 1,
            max: 5,

        },
        {
            name: "product",
            type: "relationship",
            relationTo: "products",
            hasMany: false,
            required: true,
        },
        {
            name: "user",
            type: "relationship",
            relationTo: "users",
            hasMany: false,
            required: true,
        }
    ],
};