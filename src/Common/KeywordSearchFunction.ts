import { iAPIResponse, ITreeNode, iTreeProps } from "../interface";
import { exploreSearchKeyword } from "../redux/action/dcservice";
import { fetchFloorDevicesConfigurationHierarchy, fetchMountedDeviceConfigurationHierarchy, mountedDeviceConfiguration } from "../redux/action/explorerService";
import { addSubNode, checkIsSuccess, convertFlatDataToHierarchyData, getMessageFromArray, MakeTreeDataForExplorer, } from "./Common";
import { FEnums } from "./enums";


export function findNodeInTree(
  searchText: string,
  treeData: ITreeNode[],
  excludeEntIDs: string[],
  parentNodes: ITreeNode[] = []
): { foundNode: ITreeNode | null, parentNodes: ITreeNode[] } {
  console.log('treeData :', treeData);
  for (let node of treeData) {
    // Check if the searchText matches the Name
    if (node.Name && node.Name.toLowerCase().includes(searchText.toLowerCase())) {
      if (node.NodeEntID && excludeEntIDs.includes(node.NodeEntID)) {
        continue;
      } else {
        return { foundNode: node, parentNodes };
      }
    }

    // If the node has children, traverse them recursively
    if (node.children && node.children.length > 0) {
      const result = findNodeInTree(searchText, node.children, excludeEntIDs, [...parentNodes, node]);
      if (result.foundNode) {
        return result;
      }
    }
  }

  // Return null if no matching node is found
  return { foundNode: null, parentNodes: [] };
}

export const findNodeUsingAPICall = async (
  originalTreeData: ITreeNode[],
  treeNode: ITreeNode[],
  keyword: string,
  searchAllWord: boolean,
  exploreType: number,
  excludedEntIDs: string,
  featureId: string,
  treeDataProps: iTreeProps
) => {

  function findParentOfMissingEntity(
    originalTreeData: ITreeNode[],
    parentEntities: any,
    targetNodeType: string
  ): { nearestFloorNode: ITreeNode | null, notFoundNode: any | null } {
    let currentNodes = originalTreeData;
    let nearestFloorNode: ITreeNode | null = null;
    let notFoundNode: any | null = null;

    for (let i = 0; i < parentEntities.length; i++) {
      const entity = parentEntities[i];
      const foundNode = currentNodes.find(node => node.key === entity.EntID);

      if (foundNode) {
        // Check if the node matches the target criteria
        if (foundNode.NodeType === targetNodeType || foundNode.treetype === targetNodeType) {
          nearestFloorNode = foundNode;
        }

        // Move to the children of the found node to continue traversing
        currentNodes = foundNode.children || [];
      } else {
        // Capture the not found entity and stop the traversal
        notFoundNode = entity;
        break;
      }
    }

    // Return the nearest node that matches the criteria and the not found node
    return { nearestFloorNode, notFoundNode };
  }
  let parentNodes: any;

  await exploreSearchKeyword(keyword, searchAllWord, exploreType, excludedEntIDs).then(async (resp: iAPIResponse) => {
    if (resp && resp.data && resp.data.searchEntIDsJson) {
      parentNodes = JSON.parse(resp.data.searchEntIDsJson);
      if (parentNodes && parentNodes.length > 0) {
        const { nearestFloorNode } = findParentOfMissingEntity(originalTreeData, parentNodes, "Floor");
        if (nearestFloorNode && nearestFloorNode.NodeEntID) {

          let payload = {
            floorID: nearestFloorNode.NodeEntID,
            isSearch: false,
            keyword: "",
            searchAllWord: false,
            exploreType: exploreType,
            isRefresh: false,
            configurationType: 0
          }
          await fetchFloorDevicesConfigurationHierarchy(payload).then(async (resp: iAPIResponse) => {
            if (resp && resp.data && resp.data.hierarchyJson) {
              let apiData = JSON.parse(resp.data.hierarchyJson);
              let formattedData = await convertFlatDataToHierarchyData(apiData, nearestFloorNode.NodeEntID);
              originalTreeData = await addSubNode(originalTreeData, nearestFloorNode.key, formattedData, treeDataProps, featureId, true, nearestFloorNode.stepNo);
              const result = await findParentOfMissingEntity(originalTreeData, parentNodes, "DeviceSlot");
              if (result && result.nearestFloorNode && result.nearestFloorNode.MountedDeviceEntID) {
                let paylodForMounted = {
                  deviceID: result.nearestFloorNode.MountedDeviceEntID,
                  isSearch: false,
                  keyword: "",
                  searchAllWord: false,
                  exploreType: exploreType
                }
                await fetchMountedDeviceConfigurationHierarchy(paylodForMounted).then(async (respMounted: iAPIResponse) => {
                  if (respMounted && respMounted.data && respMounted.data.deviceJson && result.nearestFloorNode) {
                    let apiDataMounted = JSON.parse(respMounted.data.deviceJson);
                    let formattedDataMounted = await convertFlatDataToHierarchyData(apiDataMounted, result.nearestFloorNode.NodeEntID);
                    originalTreeData = await addSubNode(originalTreeData, result.nearestFloorNode.key, formattedDataMounted, treeDataProps, featureId, true, result.nearestFloorNode.stepNo);
                  }
                })
              }

            }
          })

        }
      }

    }
  });
  return { parentNodes, originalTreeData }
};

export const SearchKeywordForExploer = async (payload: any, FeatureID: any, treeData: any, show_kebab_icon: any) => {
    let response
    let error
        await exploreSearchKeyword(typeof payload.keyword == "object" ? "" : payload.keyword, payload.searchAllWord ? payload.searchAllWord : false, 2).then(async (resp: any) => {
            if (checkIsSuccess(resp)) {
                var DataRes = resp.data;
                var DataRes = resp.data;
                if (DataRes.searchEntIDsJson) {
                    DataRes = JSON.parse(DataRes.searchEntIDsJson)
                    let resturndata = await checkData(treeData, FeatureID, payload.keyword, treeData, null, null, show_kebab_icon)
                    response = resturndata
                }

            } else {

                error = getMessageFromArray(resp.errData)
            }
        })
     if (FeatureID === FEnums.InventoryManagement || FeatureID == FEnums.InventoryConfiguration) {
        await exploreSearchKeyword(typeof payload.keyword == "object" ? "" : payload.keyword, payload.searchAllWord ? payload.searchAllWord : false, 1).then(async (resp: any) => {
            if (checkIsSuccess(resp)) {
                var DataRes = resp.data;
                if (DataRes.searchEntIDsJson) {
                    DataRes = JSON.parse(DataRes.searchEntIDsJson)
                    let resturndata = await checkData(DataRes, treeData, FeatureID, payload.keyword, treeData, null, null, show_kebab_icon)
                    response = resturndata
                }

            } else {
                error = getMessageFromArray(resp.errData)
            }

        })
    } else if (FeatureID === FEnums.DeviceManagement || FeatureID == FEnums.DeviceConfiguration) {

        await exploreSearchKeyword(typeof payload.keyword == "object" ? "" : payload.keyword, payload.searchAllWord ? payload.searchAllWord : false, 3).then(async (resp: any) => {
            if (checkIsSuccess(resp)) {
                var DataRes = resp.data;
                if (DataRes.searchEntIDsJson) {
                    DataRes = JSON.parse(DataRes.searchEntIDsJson)
                    let resturndata = await checkData(DataRes, treeData, FeatureID, payload.keyword, treeData, null, null, show_kebab_icon)
                    response = resturndata
                }

            } else {
                error = getMessageFromArray(resp.errData)
            }

        })
    }
    // if (response) {

    return { response, error }
    // }
}
let exandeKeys: any = []

var selectkey: string;
let selectedNode: any = []
let dataObjResult: any
const checkData = async (searchData: any, treeData: any, feature: any, keyword: any, oldTreeData: any, selectedId?: any, lastId?: any, show_kebab_icon?: any) => {

    console.log('treeData :', treeData);
    for (let index = 0; index < treeData?.length; index++) {
        const item = treeData[index];
        if (selectedId === null || selectedId === undefined) {
            let dataObj = filterData(searchData, item.NodeEntID, item.Name)
            if (dataObj && (dataObj.EntID === item.NodeEntID || dataObj.EntID === item.Name)) {
                if (item && item.children && item.children.length > 0) {
                    let expadeValue = exandeKeys.includes(item.key)
                    if (!expadeValue) {
                        exandeKeys.push(item.key)
                    }
                    selectkey = item.key;
                    selectedNode = [item];
                    await checkData(searchData, item.children, feature, keyword, oldTreeData, selectedId, null, show_kebab_icon)
                } else {

                    if (feature == FEnums.InventoryManagement || feature == FEnums.InventoryConfiguration
                        || feature == FEnums.AssetConfiguration || feature == FEnums.DeviceManagement
                        || feature == FEnums.DeviceConfiguration || feature == FEnums.AssetManagement
                        || feature == FEnums.AssetPowerCabling || feature == FEnums.AssetNetworkCabling
                        || feature == FEnums.Discover || feature == FEnums.Monitor
                        || feature == FEnums.PhysicalCompute || feature == FEnums.ManageAuditSessions
                        || feature == FEnums.AuditDataCenter || feature == FEnums.InventoryReconciliation || feature == FEnums.DevicePowerCabling || feature == FEnums.DeviceNetworkCabling) {
                        if (item.treetype === "Floor") {

                         

                        } else if (item.treetype === "Slot") {
                            const data = await makeCallForInvMgtHier(item.MountedDeviceID, oldTreeData, feature, item.key, keyword)
                            if (data) {
                                let { newTreeData } = data
                                if (newTreeData) {
                                    await checkData(searchData, newTreeData, feature, keyword, oldTreeData, selectedId, item.key)
                                } else {
                                    selectkey = item.key
                                    selectedNode = [item];
                                    break;
                                }
                            } else {
                                selectkey = item.key
                                selectedNode = [item];
                                break;
                            }
                        } else {
                            selectkey = item.key
                            selectedNode = [item];
                            break;
                        }
                    } else {
                        selectkey = item.key
                        selectedNode = [item];
                        break;
                    }
                }
            } else {

            }
        } else {
            break;
        }
    }
    return { selectkey, exandeKeys, oldTreeData, selectedNode }
}


const filterData = (searchData: any, key: any, name: any = "") => {
  // key = key === "device" ? "__Workstation" : key
  // key = key === "DeviceSlot" ? "Slot" : key
  if (key == undefined) {
      const dataFilter = searchData.filter((data: any) => (data.EntityName == "Manufacturer" || data.EntityName == "Eqtype") && data.EntID === name);
      if (dataFilter.length) {
          return dataFilter[0]
      }
  }
  else {
      const dataFilter = searchData.filter((data: any) => data.EntID === key);
      if (dataFilter.length) {
          return dataFilter[0]
      }
  }

}
const makeCallForInvMgtHier = async (deviceID: any, treeData: any, feature: any, key: any, keyword: any) => {
  let payload: any = {
      deviceID: deviceID,
      isSearch: false,
      keyword: ""
  }
  let newTreeData;
  let error: any = {}
  if (feature === FEnums.InventoryConfiguration) {
      payload.exploreType = 1
      await mountedDeviceConfiguration(payload).then(async (resp: any) => {
          if (checkIsSuccess(resp)) {
              if (resp.data) {
                  var DataRes = resp.data;
                  if (DataRes.deviceJson) {
                      DataRes = JSON.parse(DataRes.deviceJson)
                  }
                  if (DataRes) {
                      let res = await makeTreeDataForHierApiConfig(DataRes, deviceID, treeData, deviceID)
                      if (res) {
                          newTreeData = res.TreeData

                      }


                  }

              } else {
                  //Record not found
               
                  
              }
          } else {
              var message = getMessageFromArray(resp.errData);
              error = {
                  type: "ERROR",
                  message: message,
              };
          }
      })
  } else if (feature == FEnums.AssetConfiguration) {
      payload.exploreType = 2
      await mountedDeviceConfiguration(payload).then(async (resp: any) => {
          if (checkIsSuccess(resp)) {
              if (resp.data) {
                  var DataRes = resp.data;
                  if (DataRes.deviceJson) {
                      DataRes = JSON.parse(DataRes.deviceJson)
                  }

                  if (DataRes) {
                      let res = await makeTreeDataForHierApiConfig(DataRes, deviceID, treeData, deviceID)
                      if (res) {
                          newTreeData = res.TreeData

                      }


                  }


              } else {
                  //Record not found
                
              }
          } else {
              var message = getMessageFromArray(resp.errData);
              error = {
                  type: "ERROR",
                  message: message,
              };
          }
      })
  } else if (feature == FEnums.DeviceConfiguration) {
      payload.exploreType = 3
      await mountedDeviceConfiguration(payload).then(async (resp: any) => {
          if (checkIsSuccess(resp)) {
              if (resp.data) {
                  var DataRes = resp.data;
                  if (DataRes.deviceJson) {
                      DataRes = JSON.parse(DataRes.deviceJson)
                  }

                  let deviceNode: any = []
                  if (DataRes.length) {
                      let deviceNode: any = await makeTreeDataForHierApiConfig(DataRes, deviceID)
                      if (deviceNode.length) {
                          const returnData = appendDevice(treeData, deviceNode, key)
                          if (returnData.length) {
                              newTreeData = returnData;
                          }
                      }


                  }

              } else {
                  //Record not found
               
              }
          } else {
              var message = getMessageFromArray(resp.errData);
              error = {
                  type: "ERROR",
                  message: message,
              };
          }
      })
  }

  return { newTreeData, error }
}
 const makeTreeDataForHierApiConfig = async (DataRes: any, floorID: any, treeData: any = null, parentEntID: any = null, stepNo: any = 0, hideKebabMenu: any = null, isRefresh: boolean = false, useUIDForKey: boolean = false, featureId: string | null = null) => {
  let MainchildData;
  let TreeData;
  let expadedKey;
  for (const key of Object.keys(DataRes)) {
      const data: any = DataRes[key];
      let status = 0
      data && data.length > 0 && Object.values(data[0])?.forEach((ele) => {
          if (Array.isArray(ele)) {
              status = status + 1
          }
      })
      if (Array.isArray(data)) {
          let respData = await MakeTreeDataForExplorer(data, key, parentEntID, true, status === 1 ? true : false, stepNo, hideKebabMenu, featureId, "", useUIDForKey)

          MainchildData = respData.treeData
          expadedKey = respData.expandedkey
      }

  }
  const returnData = isRefresh ? appendDeviceIsRefresh(treeData, MainchildData, floorID) : appendDevice(treeData, MainchildData, floorID)
  if (returnData.length) {
      TreeData = returnData
  }
  return { TreeData, expadedKey }

}
const appendDevice = (treeData: any, node: any, floorID: any) => {
  treeData.map((item: any) => {

      // if ((item.treetype === "Floor" && item && item.NodeEntID === floorID) || (item.treetype === "Instance" && item && item.NodeEntID === floorID) || (item.treetype === "Host" || item.treetype === "Project" && item && item.NodeEntID === floorID)) {

      if (item && item.NodeEntID === floorID) {
          item.children = node && node[0]?.children
      } else if (item.treetype === "floor_device" && item && item.NodeEntID === floorID) {
          item.children = node
      } else if (item.treetype === "device" && item && item.NodeEntID === floorID) {
          item.children = node
      } else if (item.treetype === "Slot" && item && item.MountedDeviceID === floorID) {
          item.children = node[0].children
      } else if (item && item.EntID === floorID) {
          item.children = node
      }
      else if (item && item.key === floorID) {
          item.children = node[0].children;
      } else {
          if (item.children) {
              appendDevice(item.children, node, floorID)
          }
      }
  });
  return treeData

}
const appendDeviceIsRefresh = (treeData: any, node: any, floorID: any) => {

  treeData.map((item: any, index: any) => {
      if (item && item.NodeEntID === node.length > 0 && node[0].NodeEntID) {
          treeData[index] = node[0]
      } else if (item.treetype === "floor_device" && item && item.NodeEntID === floorID) {
          item.children = node
      } else if (item.NodeType === "Store" && item && item.NodeEntID === floorID) {
          item.children = node[0].children
      } else if (item.treetype === "device" && item && item.NodeEntID === floorID) {
          item.children = node
      } else if (item.treetype === "Slot" && item && item.MountedDeviceID === floorID) {
          item.children = node[0].children
      } else {
          if (item.children) {
              appendDeviceIsRefresh(item.children, node, floorID)
          }
      }
  });
  return treeData

}