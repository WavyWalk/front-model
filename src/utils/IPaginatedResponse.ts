import {ModelCollection} from "../ModelCollection"
import {BaseModel} from "../BaseModel"

export interface IPagination {
    page: number,
    perPage: number,
    pagesCount?: number
}

export interface IPaginatedResponse<MODEL_CLASS extends BaseModel> {
    result: ModelCollection<MODEL_CLASS>,
    pagination: IPagination
}