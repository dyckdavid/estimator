import { createContext } from "./context";

const {
    getUserInput,
    getPrice,
    createSection,
    getVariable,
} = createContext({} as any)

createSection('Roofing')
    .addPart({
        name: 'Shingles',
        qty: 20,
        priceLookupKey: 'shingles',
    })
    .addPart({
        name: 'Nails',
        qty: 1,
        priceLookupKey: 'nails',
    })

createSection('Siding')
    .addPart({
        name: 'Siding',
        qty: 10,
        priceLookupKey: 'siding',
    })
    .addPart({
        name: 'Nails',
        qty: 1,
        priceLookupKey: 'nails',
    })
