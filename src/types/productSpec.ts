/**
 * Main ProductSpec types - Supporting new actual data format with backward compatibility
 */

import { Document } from 'mongoose'

// External reference type for new format
export type ExternalReference = {
    id?: string | null
    source?: string | null
}

// ID/Name type with _id field (new format)
export type IdName = {
    _id?: string | null
    name?: string | null
}

// Legacy ID/Name type for backward compatibility
export type LegacyIdName = {
    id?: string | null
    name?: string | null
}

export type ProductSet = {
    id?: string | null
    name?: string | null
}

// Material type for new format
export type Material = {
    _id?: string | object | null // Can be ObjectId or string
    setAttribute?: IdName | null
    materialType?: string | null
    materialOption?: IdName | null
    garmentComponent?: string | null
    fabricSustainability?: IdName[] | null

    // Legacy fields for backward compatibility
    id?: string | null
    set?: LegacyIdName | null
    modifiedDate?: string | null
    modifiedBy?: string | null
    materialOptions?: LegacyIdName | null
}

// BOM type for new format
export type BillOfMaterial = {
    id?: string | null
    description?: string | null
    materialOptions?: IdName[] | null
    fabricSustainabilities?: IdName[] | null
    materials?: Material[] | null

    // Legacy fields for backward compatibility
    state?: string | null
    supplierRequestIssued?: boolean | null
    productQuoteAccepted?: boolean | null
    washTreatments?: LegacyIdName[] | null
    bomMaterialOptions?: LegacyIdName[] | null
    bomFabricSustainability?: LegacyIdName[] | null
}

// Product attribute type (singular, new format)
export type ProductAttribute = {
    productCode?: string | null
    productId?: string | null
    productDescription?: string | null
    yearRegistered?: number | null
    season?: IdName | null
    department?: IdName | null
    overseasStockBuffering?: boolean | null
    sourcingAttribute1?: string | null
    sourcingAttribute2?: string | null

    // Legacy fields for backward compatibility
    productSet?: ProductSet[] | null
    family?: string | null
    class?: string | null
    sourcing1?: string | null
    sourcing2?: string | null
}

// Main ProductSpec type without 'I' prefix - supporting new actual format
export interface ProductSpec extends Document {
    // New format fields
    externalReferences?: ExternalReference[] | null
    productSpecCode?: string | null
    colourName?: string | null
    optionId?: string | null
    productAttribute?: ProductAttribute | null // Singular
    boms?: BillOfMaterial[] | null
    updatedAt?: string | null

    // Legacy flat structure fields for backward compatibility
    productSpecId?: string | null
    productCode?: string | null
    productId?: string | null
    productDescription?: string | null
    productSet?: ProductSet[] | null
    yearRegistered?: number | null
    season?: LegacyIdName | null
    department?: LegacyIdName | null
    family?: string | null
    class?: string | null
    overseasStockBuffering?: boolean | null
    sourcing1?: string | null
    sourcing2?: string | null
    billOfMaterials?: BillOfMaterial[] | null

    // Legacy nested structure for backward compatibility
    productAttributes?: ProductAttribute | null // Plural field name with singular content

    // MongoDB timestamps
    createdAt?: Date
    __updatedAt?: Date
}
