/**
 * Barrel export file for all ApparelBOM types - Updated for flat structure
 * This provides a clean way to import types throughout the application
 */

// Export all types from their respective files
export * from './common'
export * from './productAttributes'
export * from './materials'
export * from './productSpec'

// Re-export for convenience (legacy support)
export type { IIdName, IProductSet } from './common'

export type { IProductAttributes, ISeason, IDepartment } from './productAttributes'

export type {
    IMaterial,
    IBillOfMaterial,
    IWashTreatment,
    IBomMaterialOption,
    IBomFabricSustainability,
    IMaterialOption,
    IFabricSustainability,
    IMaterialSet,
} from './materials'

// Updated export for new flat structure
import type { ProductSpec } from './productSpec'

export type { ProductSpec, IdName, ProductSet } from './productSpec'

// Legacy alias for backward compatibility
export type IProductSpec = ProductSpec
