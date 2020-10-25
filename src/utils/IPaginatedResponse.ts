import {BaseModel} from "../BaseModel"

export interface IPagination {
    page: number,
    perPage: number,
    pagesCount?: number
}

export interface IPaginatedResponse<MODEL_CLASS> {
    result: Array<MODEL_CLASS>,
    pagination: IPagination
}