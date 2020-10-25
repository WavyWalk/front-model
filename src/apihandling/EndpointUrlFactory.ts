import {ObjectToQueryStringSerializer} from "../utils/ObjectToQueryStringSerializer"
import {IRequestOptions, IUrlParams} from "./IRequestOptions"
import {IPlainObject} from "../utils/IPlainObject"


class EndpointUrlFactory {

    make(
        configUrl: string,
        urlParams?: IUrlParams,
        transformFinalUrl?: (url: string)=>string
    ) {
        let resultUrl = this.replaceParams(configUrl, urlParams)
        if (transformFinalUrl) {
            resultUrl = transformFinalUrl(resultUrl)
        }
        return resultUrl
    }

    /**
     * replaces url tokens starting with :
     * with the value in passed map with the same key without :
     * ex: /foo/:bar/baz -> {bar: "a"} -> /foo/a/baz
     */
    private replaceParams(url: string, urlParams?: IUrlParams) {
        urlParams ??= {} as IUrlParams
        const paramsToReplace = this.getParamsToReplace(url)
        paramsToReplace.forEach((it) => {
            const toReplaceWith = urlParams![it.substr(1)]
            if (!toReplaceWith) {
                throw `no url parameter was provided for ${it}`
            }
            url = url.replace(new RegExp(it, 'g'), toReplaceWith)
        })
        return url
    }

    /**
     * from given url extracts token starting with : char
     * and ending with / or string end
     * pushing them to array
     * ex. /foo/:bar/baz/:cux => [:bar, :cux]
     */
    private getParamsToReplace(url: string) {
        const toReplace: string[] = []
        url.split('/').forEach((it)=>{
            if (it[0] === ':') {
                toReplace.push(it)
            }
        })
        return toReplace
    }

}

export const endpointUrlFactory = new EndpointUrlFactory()