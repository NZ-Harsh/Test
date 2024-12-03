import apiUris from "../../Api/api-uris";
import fetchInterceptor from "./apiInterceptor";


export const getRefList = (groupNameCollection: any) => {
    return fetchInterceptor(apiUris.MiscApi.GetRefList, {
        groupNameCollection: groupNameCollection
    });
}
export function getKebabMenuData(entID: any, entityName: any, kebabMenuTableName: any) {
    return fetchInterceptor(apiUris.NODEApi.GetKebabMenuData, {
        entID: entID, entityName: entityName, kebabMenuTableName: kebabMenuTableName
    });
}

export const getTableVsProperty = (entityName: any, tableName?: any) => {
    let payload: any = {}
    if (entityName) {
        payload.entityName = entityName
    }
    if (tableName) {
        payload.tableName = tableName
    }
    return fetchInterceptor(apiUris.EmApi.GetTableVsProperty, {
        ...payload
    });
  
  }

  export function getSvgData(deviceView: any, preview: any) {
    return fetchInterceptor(apiUris.DeviceApi.GetSvgData, {
        deviceView: deviceView, preview: preview
    });
}

export const dropSessionKeywordTable = () => {
    return fetchInterceptor(apiUris.kwd.DropSessionKeywordTable, {});
}

export function getSiteRooms() {
    return fetchInterceptor(apiUris.MiscApi.GetSiteRooms, {});
}
export const exploreSearchKeyword = (keyword: any, searchAllWord: boolean = false, exploreType: any = 0, excludedEntIDs?: string) => {
    return fetchInterceptor(apiUris.ExplorerApi.ExploreSearchKeyword, {
        keyword: keyword ? keyword : "",
        searchAllWord: searchAllWord,
        exploreType: exploreType,
        excludedEntIDs: excludedEntIDs
    });
}
export const getKebabMenu = (selectedNodeEntity: any, selectedNodeType: any) => {
    return fetchInterceptor(apiUris.PropertyApi.GetKebabMenu, {
        selectedNodeEntity,
        selectedNodeType
    });
}
export function GetAllTenants(payload: any) {
    return fetchInterceptor(apiUris.TenantApi.getAllTenants, { siteID: payload.siteID });
}
export const floorDevices = (payload: any) => {
    return fetchInterceptor(apiUris.ExplorerApi.FloorDevices, {
        isSearch: payload.isSearch,
        keyword: payload.keyword,
        floorID: payload.floorID,
        exploreType: payload.exploreType,
        isRefresh: payload.isRefresh,
        configurationType: payload.configurationType,
        sessionId: payload.sessionId ? payload.sessionId : null
    });
}