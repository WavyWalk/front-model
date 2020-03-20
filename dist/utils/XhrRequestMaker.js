"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var XhrRequestMaker = /** @class */ (function () {
    function XhrRequestMaker(options) {
        var _this = this;
        var _a, _b;
        this.handleFail = function () {
            if (XhrRequestMaker.onFailHandler && !_this.options.rejectOnError) {
                XhrRequestMaker.onFailHandler(_this.xhr);
            }
            else {
                _this.options.rootReject(_this.xhr);
            }
        };
        this.rootPromise = options.rootPromise;
        this.options = options;
        if (XhrRequestMaker.userDefinedRequestOptionsHandler) {
            XhrRequestMaker.userDefinedRequestOptionsHandler(this.options);
        }
        this.xhr = new XMLHttpRequest();
        if (this.options.toMergeWithPayload) {
            this.options.payload = __assign(__assign({}, this.options.payload), this.options.toMergeWithPayload);
        }
        this.setParameters();
        this.xhr.open(this.options.httpMethod, this.options.url);
        (_b = (_a = XhrRequestMaker).executeOnRequestStart) === null || _b === void 0 ? void 0 : _b.call(_a, this.xhr);
        if (this.options.isLoadingToggle) {
            this.options.isLoadingToggle(true);
        }
        if (XhrRequestMaker.withCredentials) {
            this.xhr.withCredentials = true;
        }
        if (options.responseType) {
            this.xhr.responseType = options.responseType;
        }
        this.xhr.onprogress = function (e) {
            if (e.lengthComputable) {
            }
        };
        this.xhr.onloadstart = function (e) {
        };
        this.xhr.onloadend = function (e) {
            var _a, _b;
            (_b = (_a = XhrRequestMaker).executeOnRequestEnd) === null || _b === void 0 ? void 0 : _b.call(_a, _this.xhr);
            if (_this.options.isLoadingToggle) {
                _this.options.isLoadingToggle(false);
            }
        };
        this.xhr.onerror = function () {
            _this.handleFail();
            if (_this.options.isLoadingToggle) {
                _this.options.isLoadingToggle(false);
            }
        };
        this.setHeaders();
        this.setOnLoad();
        this.send();
    }
    XhrRequestMaker.get = function (options) {
        options.httpMethod = "GET";
        var requestMaker = new this(options);
        return requestMaker.rootPromise;
    };
    XhrRequestMaker.post = function (options) {
        options.httpMethod = "POST";
        var requestMaker = new this(options);
        return requestMaker.rootPromise;
    };
    XhrRequestMaker.put = function (options) {
        options.httpMethod = "PUT";
        var requestMaker = new this(options);
        return requestMaker.rootPromise;
    };
    XhrRequestMaker.delete = function (options) {
        options.httpMethod = "DELETE";
        var requestMaker = new this(options);
        return requestMaker.rootPromise;
    };
    XhrRequestMaker.create = function (options) {
        var requestMaker = new this(options);
        return requestMaker.rootPromise;
    };
    XhrRequestMaker.prototype.send = function () {
        if (this.options.httpMethod != "GET" && this.options.payload) {
            if (this.options.serializeAsForm) {
                this.xhr.send(this.createFormData(this.options.payload));
            }
            else {
                this.xhr.send(JSON.stringify(this.options.payload));
            }
        }
        else {
            this.xhr.send();
        }
    };
    XhrRequestMaker.prototype.setParameters = function () {
        var options = this.options;
        if (options.httpMethod === "GET" && options.payload) {
            options.url = options.url + "?" + this.objectToQueryString(options.payload);
        }
    };
    XhrRequestMaker.prototype.setOnLoad = function () {
        var _this = this;
        this.xhr.onload = function () {
            if (_this.options.yieldRawResponse) {
                _this.options.rootResolve(_this.xhr);
                return;
            }
            if (_this.xhr.status === 200 || _this.xhr.status === 201) {
                var contentType = _this.xhr.getResponseHeader('Content-Type');
                if (_this.options.responseType === "blob") {
                    if (contentType === "blob") {
                        _this.options.rootResolve({ BLOB_IS_RETURNED: true, BLOB_RESPONSE: _this.xhr.response });
                    }
                    else {
                        var blob = new Blob([_this.xhr.response], { type: "text/plain" });
                        var reader = new FileReader();
                        reader.addEventListener('loadend', function (e) {
                            var text = e.srcElement.result;
                            _this.options.rootResolve(JSON.parse(text));
                        });
                        reader.readAsText(blob);
                    }
                    return;
                }
                if (_this.options.resolveWithJson) {
                    var response = _this.xhr.responseText;
                    if (response) {
                        try {
                            _this.options.rootResolve(JSON.parse(_this.xhr.responseText));
                        }
                        catch (e) {
                            console.error(e);
                            _this.handleFail();
                        }
                    }
                    else {
                        _this.options.rootResolve({});
                    }
                }
                else {
                    _this.options.rootResolve(_this.xhr);
                }
            }
            else {
                _this.handleFail();
            }
        };
    };
    XhrRequestMaker.prototype.setHeaders = function () {
        if (this.options.requestHeaders) {
            for (var _i = 0, _a = Object.keys(this.options.requestHeaders); _i < _a.length; _i++) {
                var key = _a[_i];
                var value = this.options.requestHeaders[key];
                this.xhr.setRequestHeader(key, value);
            }
        }
        if (this.options.serializeAsForm) {
            return;
        }
        if (!this.options.requestHeaders || !this.options.requestHeaders['Content-Type']) {
            this.xhr.setRequestHeader('Content-Type', 'application/json');
        }
    };
    XhrRequestMaker.prototype.objectToQueryString = function (objectToSerialize, prefix) {
        var strBuilder = [];
        for (var property in objectToSerialize) {
            if (!objectToSerialize.hasOwnProperty(property)) {
                continue;
            }
            var hashedKeyPath = prefix ? prefix + "[" + property + "]" : property;
            var value = objectToSerialize[property];
            if (value !== null && typeof value === "object") {
                strBuilder.push(this.objectToQueryString(value, hashedKeyPath));
            }
            else {
                strBuilder.push(encodeURIComponent(hashedKeyPath) + "=" + encodeURIComponent(value));
            }
        }
        return strBuilder.join("&");
    };
    XhrRequestMaker.prototype.createFormData = function (object, form, namespace) {
        var formData = form || new FormData();
        for (var property in object) {
            if (!object.hasOwnProperty(property) || !object[property]) {
                continue;
            }
            var formKey = namespace ? namespace + "[" + property + "]" : property;
            if (object[property] instanceof Date) {
                formData.append(formKey, object[property].toISOString());
            }
            else if (typeof object[property] === 'object' && !(object[property] instanceof File)) {
                this.createFormData(object[property], formData, formKey);
            }
            else {
                formData.append(formKey, object[property]);
            }
        }
        return formData;
    };
    XhrRequestMaker.withCredentials = false;
    return XhrRequestMaker;
}());
exports.XhrRequestMaker = XhrRequestMaker;
