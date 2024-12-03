import config from "../config/config";
const apiUris: any = {};

const baseUrl =
  !process.env.NODE_ENV || process.env.NODE_ENV === "development"
    ? config.BASE_URL
    : config.BASE_URL_PROD;
    
const SESSION_API_URL = `${baseUrl}${config.Session_API_URL}`;
const MISC = `${baseUrl}${config.misc}`
const Explorer_TJAPI = `${baseUrl}${config.Explorer}`
const NODE = `${baseUrl}${config.NODE}`
const DEVICE = `${baseUrl}${config.device}`
const LIB = `${baseUrl}${config.LIB}`
const EM = `${baseUrl}${config.Em}`
const KWD = `${baseUrl}${config.KWD}`
const PROPERTY = `${baseUrl}${config.property}`
const TENANT = `${baseUrl}${config.Tenant}`




const Session: object = {
CreateSession: `${SESSION_API_URL}/create_session`,
UpdateSession: `${SESSION_API_URL}/update_session`,
IsSessionOpen: `${SESSION_API_URL}/is_session_open`,

}
const MiscApi: object = {
GetRefList: `${MISC}/get_ref_list`,
GetSiteRooms: `${MISC}/get_site_rooms`,

};
const ExplorerApi: object = {

  //search API
  SiteHierarchy: `${Explorer_TJAPI}/site_hierarchy`,
  FloorDevicesConfigurationHierarchy: `${Explorer_TJAPI}/floor_devices_configuration_hierarchy`,
  MountedDeviceConfigurationHierarchy: `${Explorer_TJAPI}/mounted_device_configuration_hierarchy`,
  ExploreSearchKeyword: `${Explorer_TJAPI}/search_keyword`,
  FloorDevices: `${Explorer_TJAPI}/floor_devices`,


};
const NODEApi: object = {

  GetKebabMenuData: `${NODE}/get_kebab_menu_data`,
};
const TenantApi: object = {
  getAllTenants: `${TENANT}/get_all_tenants`
}
const DeviceApi:object= {
  GetSvgData: `${DEVICE}/get_svgdata`,

}
  
const LibApi: object = {
  GetFilteredDevicesByMfgeqtype: `${LIB}/get_filtered_devices_by_mfgeqtype`,
  GetPropertiesForEqidlist: `${LIB}/get_properties_for_eqidlist`,
  GetDevicemodelViews: `${LIB}/get_devicemodel_views`,
  GetDevicemodelSvg: `${LIB}/get_devicemodel_svg`,
  GetMfg: `${LIB}/get_mfg`,
  GetEqtype: `${LIB}/get_eqtype`,
  GetProductno: `${LIB}/get_prodno`,
  GetFilteredDevices: `${LIB}/get_filtered_devices`,
  GetRelatedForFilteredDevice: `${LIB}/get_related_for_filtered_device`,
};
const EmApi: object = {
  GetEntityVsTables: `${EM}/get_entity_vs_table`,
  ImportEntity: `${EM}/import_entity_sheet`,
  GetEntityRecordsForExport: `${EM}/get_entity_records_for_export`,
  GetEntityRecords: `${EM}/get_entity_records`,
  updateRecordCount: `${EM}/update_record_count`,
  GetFieldList: `${EM}/get_field_list`,
  ValidateEntitySheet: `${EM}/validate_entity_sheet`,
  GetTableVsProperty: `${EM}/get_table_vs_property`,
  AddEntityRecords: `${EM}/add_entity_records`,
  DeleteEntityRecords: `${EM}/delete_entity_records`,
  UpdateEntityRecords: `${EM}/update_entity_records`,
  GetEntityRecordsWithFilter: `${EM}/get_entity_records_with_filter`,
  ImportTablesAndProperties: `${EM}/import_tables_and_properties`,
  ValidateTableAndPropertyImport: `${EM}/validate_table_and_property_import`,
  GetAllEntities: `${EM}/get_all_entities`,
  GetNzpgRecords: `${EM}/get_nzpg_records`,
  CreateDefaultSiteHierarchy: `${EM}/create_default_site_hierarchy`,
  GetFilteredTableRecord: `${EM}/get_filtered_table_record`
};
const kwd: object = {
  DropSessionKeywordTable: `${KWD}/drop_session_keyword_table`,
}
const PropertyApi: object = {
  GetPropertyValue: `${PROPERTY}/get_property_value`,
  GetPgTableNames: `${PROPERTY}/get_pg_table_names`,
  GetEntityTableNames: `${PROPERTY}/get_entity_table_names`,
  GetPropertyNames: `${PROPERTY}/get_property_names`,
  SetPropertyValue: `${PROPERTY}/set_property_value`,
  GetUpdatableRecordCount: `${PROPERTY}/get_updatable_record_count`,
  GetKebabMenu: `${PROPERTY}/get_kebab_menu`,

};
    
apiUris.Session = Session
apiUris.MiscApi = MiscApi
apiUris.ExplorerApi = ExplorerApi
apiUris.LibApi = LibApi
apiUris.EmApi = EmApi
apiUris.NODEApi = NODEApi
apiUris.DeviceApi =DeviceApi
apiUris.kwd = kwd;
apiUris.PropertyApi=PropertyApi
export default apiUris