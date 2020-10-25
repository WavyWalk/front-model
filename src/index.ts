/** types exported that weirdly for babel  envs*/
import * as AllIRequestOptions from "./apihandling/IRequestOptions"
export type IRequestOptions = AllIRequestOptions.IRequestOptions

import * as AllApiEndpoint from "./apihandling/ApiEndpoint"
export type MakeRequest = AllApiEndpoint.MakeRequest

export { Property } from "./property/Property"
export { HasMany } from "./realtions/HasMany"
export { HasOne } from "./realtions/HasOne"
export { BaseModel } from "./BaseModel"
export { ApiEndpoint } from "./apihandling/ApiEndpoint"
export {ModelValidator} from './validation/ModelValidator'
export {frontModelConfig} from './config/FrontModelConfig'