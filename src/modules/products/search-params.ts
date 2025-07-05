import { createLoader, parseAsString, parseAsArrayOf, parseAsStringLiteral } from "nuqs/server";

export const sortValues = ["suggested", "trending", "hot_and_new"] as const;

export const params = {
     sort: parseAsStringLiteral(sortValues).withDefault("suggested"),
        minPrice: parseAsString
            .withOptions({
                clearOnDefault: true,
            })
            .withDefault(""),
        maxPrice: parseAsString
            .withOptions({
                clearOnDefault: true,
            })
            .withDefault(""),   
        tags: parseAsArrayOf(parseAsString)
            .withOptions({
                clearOnDefault: true,
            })
            .withDefault([]),
};

export const loadProductFilters = createLoader(params);