/**
 * Product attributes related types for ApparelBOM
 */

import { IIdName, IProductSet } from './common'

export interface ISeason extends IIdName {}

export interface IDepartment extends IIdName {}

export interface IProductAttributes {
    productCode?: string | null
    productId?: string | null
    productDescription?: string | null
    productSet?: IProductSet[] | null
    yearRegistered?: number | null
    season?: ISeason | null
    department?: IDepartment | null
    family?: string | null
    class?: string | null
    overseasStockBuffering?: boolean | null
    sourcing1?: string | null
    sourcing2?: string | null
}
