import apiUris from '../../Api/api-uris';
import fetchInterceptor from './apiInterceptor';

export const getFilteredDevicesByMfgeqtype = (selectedEqType: string, newSessionId: string | null = null) => {
    return fetchInterceptor(apiUris.LibApi.GetFilteredDevicesByMfgeqtype, {
        "customerID": 0,
        "customerName": "",
        "iMaxResultCount": 0,
        "selectedMfg": "",
        "selectedEqType": selectedEqType,
        "selectedMfgEqType": "",
        "selectedMfgProdLine": "",
        "selectedMfgProdNo": "",
        "orderByClause": "",
        sessionId: newSessionId
    });
}

export const getPropertiesForEqidlist = (eqidList: any) => {
    return fetchInterceptor(apiUris.LibApi.GetPropertiesForEqidlist, {
        eqidList
    });
}

export const getDevicemodelViews = (eqid: any, get3DShapes: boolean = false) => {
    return fetchInterceptor(apiUris.LibApi.GetDevicemodelViews, {
        eqid,
        get3DShapes
    });
}

export const getDevicemodelSvg = (shapeID: any) => {
    return fetchInterceptor(apiUris.LibApi.GetDevicemodelSvg, {
        shapeID
    });
}
export const getMfg = (customerID: any, customerName: any) => {
    return fetchInterceptor(apiUris.LibApi.GetMfg, {
        customerID,
        customerName
    });
}
export const getEqtype = (customerID: number, customerName: any, actualMfgAcronym: any) => {
    return fetchInterceptor(apiUris.LibApi.GetEqtype, {
        customerID,
        customerName,
        actualMfgAcronym,
        includeRelatedMfg: false
    });
}

export const getProductno = (customerID: number, customerName: any, actualMfgAcronym: any, eqtype: any, prodLine: any) => {
    return fetchInterceptor(apiUris.LibApi.GetProductno, {
        customerID,
        customerName,
        actualMfgAcronym,
        eqtype,
        prodLine,
        includeRelatedMfg: true
    });
}
export const getFilteredDevices = (searchKeyWord: any, searchAllWord: any, customerID: number, customerName: any, iMaxResultCount: any, selectedMfg: any, selectedEqType: any, selectedMfgEqType: any, selectedMfgProdLine: any, selectedMfgProdNo: any, orderByClause: any) => {
    return fetchInterceptor(apiUris.LibApi.GetFilteredDevices, {
        searchKeyWord,
        searchAllWord,
        customerID,
        customerName,
        iMaxResultCount,
        selectedMfg,
        selectedEqType,
        selectedMfgEqType,
        selectedMfgProdNo,
        orderByClause
    });
}
export const getRelatedForFilteredDevice = (customerID: any, customerName: any, eqid: any) => {
    return fetchInterceptor(apiUris.LibApi.GetRelatedForFilteredDevice, {
        customerID,
        customerName,
        eqid
    });
}
