import {ModelCollection} from "../ModelCollection"
import {BaseModel} from "../BaseModel"

export interface IPaginatedResponse<MODEL_CLASS extends BaseModel> {
    result: ModelCollection<MODEL_CLASS>,
    pagination: {
        page: number,
        perPage: number,
        pagesCount?: number
    }
}