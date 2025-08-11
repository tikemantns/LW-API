/**
 * Material and Bill of Materials related types for ApparelBOM
 */

import { IIdName } from './common'

export interface IWashTreatment extends IIdName {}

export interface IBomMaterialOption extends IIdName {}

export interface IBomFabricSustainability extends IIdName {}

export interface IMaterialOption extends IIdName {}

export interface IFabricSustainability extends IIdName {}

export interface IMaterialSet extends IIdName {}

export interface IMaterial {
    id?: string | null
    set?: IMaterialSet | null
    materialType?: string | null
    modifiedDate?: string | null
    modifiedBy?: string | null
    garmentComponent?: string | null
    materialOptions?: IMaterialOption | null
    fabricSustainability?: IFabricSustainability[] | null
}

export interface IBillOfMaterial {
    id?: string | null
    state?: string | null
    supplierRequestIssued?: boolean | null
    productQuoteAccepted?: boolean | null
    description?: string | null
    washTreatments?: IWashTreatment[] | null
    bomMaterialOptions?: IBomMaterialOption[] | null
    bomFabricSustainability?: IBomFabricSustainability[] | null
    materials?: IMaterial[] | null
}
