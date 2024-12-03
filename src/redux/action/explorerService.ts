
import fetchInterceptor from "./apiInterceptor";
import apiUris from "../../Api/api-uris";
export const exploreSettings = (payload: any) => {
    return fetchInterceptor(apiUris.ExplorerApi.ExploreSettings, {
        isSearch: payload.isSearch,
        keyword: payload.keyword,
        groupName: payload.groupName,
        isMySetting: payload.isMySetting

    });
}

export const exploreSearchKeyword = (keyword: any, searchAllWord: boolean = false, exploreType: any = 0, excludedEntIDs?: string) => {
    return fetchInterceptor(apiUris.ExplorerApi.ExploreSearchKeyword, {
        keyword: keyword ? keyword : "",
        searchAllWord: searchAllWord,
        exploreType: exploreType,
        excludedEntIDs: excludedEntIDs
    });
}


export const locationHierarchy = (payload: any) => {

    return fetchInterceptor(apiUris.ExplorerApi.LocationHierarchy, {
        isSearch: payload.isSearch,
        keyword: payload.keyword,
        deviceID: payload.deviceID,
        exploreType: payload.exploreType,
        isRefresh: payload.isRefresh ? payload.isRefresh : false,
        sessionId: payload.sessionId ? payload.sessionId : null
    });

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
export const floorDevicesConfiguration = (payload: any) => {
    return fetchInterceptor(apiUris.ExplorerApi.FloorDevicesConfiguration, {
        isSearch: payload.isSearch,
        keyword: payload.keyword,
        floorID: payload.floorID,
        exploreType: payload.exploreType,
        isRefresh: payload.isRefresh,
        configurationType: payload.configurationType,
        sessionId: payload.sessionId ? payload.sessionId : null
    });
}
export const mountedDeviceConfiguration = (payload: any) => {
    return fetchInterceptor(apiUris.ExplorerApi.MountedDeviceConfiguration, {
        isSearch: payload.isSearch,
        keyword: payload.keyword,
        deviceID: payload.deviceID,
        exploreType: payload.exploreType,
        IsRefresh: payload.IsRefresh,
        sessionId: payload.sessionId ? payload.sessionId : null
    });
}
export const datacenterHierarchy = (isDCI: boolean = false) => {
    return fetchInterceptor(apiUris.ExplorerApi.DatacenterHierarchy, { isDCI });
}

export const inventoryHierarchy = () => {
    return fetchInterceptor(apiUris.ExplorerApi.InventoryHierarchy, {});
}

export const siteHierarchy = ({
    isSearch = false,
    keyword = "",
    exploreType = 2,
    isRefresh = false
}: any) => {
    return fetchInterceptor(apiUris.ExplorerApi.SiteHierarchy, {
        isSearch,
        keyword,
        exploreType,
        isRefresh
    });
}
export const deviceEntityHierarchy = () => {
    return fetchInterceptor(apiUris.ExplorerApi.deviceEntityHierarchy, {})
}

export async function fetchFloorDevicesConfigurationHierarchy({
    floorID,
    isSearch = false,
    keyword = "",
    searchAllWord = false,
    exploreType = 2,
    isRefresh = false,
    configurationType = 0
}: any) {
    return await fetchInterceptor(apiUris.ExplorerApi.FloorDevicesConfigurationHierarchy, {
        floorID,
        isSearch,
        keyword,
        searchAllWord,
        exploreType,
        isRefresh,
        configurationType
    });
}


export async function fetchMountedDeviceConfigurationHierarchy({
    deviceID,
    isSearch = false,
    keyword = "",
    searchAllWord = false,
    exploreType = 2
}: any) {
    return fetchInterceptor(apiUris.ExplorerApi.MountedDeviceConfigurationHierarchy, {
        deviceID,
        isSearch,
        keyword,
        searchAllWord,
        exploreType
    });
}
