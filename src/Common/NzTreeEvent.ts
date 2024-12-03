import { iCustomTreeViewProps,ITreeNode,iAPIResponse } from "../interface";
import { excludeFeaturesFromFilterNodes,processStringToCompare,findChildrenBasedOnKey,addSubNode,convertFlatDataToHierarchyData } from "./Common";
import { fetchFloorDevicesConfigurationHierarchy,fetchMountedDeviceConfigurationHierarchy ,siteHierarchy    } from "../redux/action/explorerService";
import { FEnums } from "./enums";




    export const handleExpand = async (treeDataProps: iCustomTreeViewProps,treeData: any, exandeKeys: string[], info: any, ) => {
    console.time("ExpandEventTime")
    let treeDataReturns: any = null;
    let selectedKeysReturn: string[] | null = null;
    let newSelectedNodeData: any = null;
    let expandedNodeKeys = exandeKeys;
    let expandedNode: any = null;
    if (info && info.node) {
        if (info.expanded) {
            await autoExpandNodes(info.node, exandeKeys,treeDataProps.originalTreeData, treeData,treeDataProps).then(async (result: any) => {
                if (result) {
                    console.log('result :', result.expandedNodes);
                
                    treeDataReturns = result.updatedTreeData;
                    expandedNode = result.currentExpandedKeys;
                    selectedKeysReturn = result.selectedNodeKey ? result.selectedNodeKey : [];
                    newSelectedNodeData = result.selectedNodeData;
                    if (treeDataProps.updateOriginalTreeDataset) {
                        await treeDataProps.updateOriginalTreeDataset(result.updatedOriginalData, result.currentExpandedKeys, result.selectedNodeKey ? result.selectedNodeKey : [], result.updatedTreeData);
                    }
                }
                else {
                    expandedNode = expandedNodeKeys;
                }
            })
        }
        else {
            // Node is collapsed
            const nodeKey = info.node.key;
            // Remove the collapsed node's key and all of its children's keys from expandedNodeKeys
            const removeKeys = (key: string, nodeData: any) => {
                expandedNodeKeys = expandedNodeKeys.filter((k: string) => k !== key);
                if (nodeData && nodeData.children) {
                    nodeData.children.forEach((child: any) => removeKeys(child.key, child));
                }
            };
            await removeKeys(nodeKey, info.node);
            treeDataReturns = treeData;
            selectedKeysReturn = [info.node.key];
            expandedNode = expandedNodeKeys;
            newSelectedNodeData = info;
        }
    }
    return { treeDataReturns, selectedKeysReturn, expandedNode, newSelectedNodeData }
  
  };

  export const apiCallsForGetData = async (newNode: ITreeNode, featureId: string) => {
    let apiData: any = null;
    if (!excludeFeaturesFromFilterNodes.includes(featureId)) {
  
        if (newNode.NodeType && (processStringToCompare(newNode.NodeType, "Floor") || processStringToCompare(newNode.NodeType, "Store"))) {
            if (newNode.NodeEntID) {
                let exploreType = 2;
                if (featureId === FEnums.AssetConfiguration) {
                    exploreType = 2;
                } else if (featureId === FEnums.DeviceConfiguration) {
                    exploreType = 3;
                }
                else if (featureId === FEnums.InventoryManagement || featureId === FEnums.InventoryConfiguration) {
                    exploreType = 1;
                }
                await fetchFloorDevicesConfigurationHierarchy({ floorID: newNode.NodeEntID, exploreType: exploreType }).then(async (resp: iAPIResponse) => {
                    if (resp && resp.data && resp.data.hierarchyJson) {
                        console.log('resp.data :', resp.data);
                        apiData = JSON.parse(resp.data.hierarchyJson);
  
                    }
                })
            }
        }
        else if (newNode.treetype === "DeviceSlot" && newNode.MountedDeviceEntID && (featureId === FEnums.AssetConfiguration
            || featureId === FEnums.DeviceConfiguration
            || featureId === FEnums.DeviceNetworkCabling
            || featureId === FEnums.DevicePowerCabling)) {
  
            await fetchMountedDeviceConfigurationHierarchy({ deviceID: newNode.MountedDeviceEntID }).then(async (resp: iAPIResponse) => {
                if (resp && resp.data && resp.data.deviceJson) {
                    apiData = JSON.parse(resp.data.deviceJson);
                }
            });
        }
        else if (newNode.NodeType && processStringToCompare(newNode.NodeType, "Site")) {
            if (featureId) {
                let payload: object = {
                    isSearch: false,
                    keyword: "",
                    exploreType: featureId === FEnums.InventoryManagement || featureId === FEnums.InventoryConfiguration ? 1 : 2,
                    isRefresh: false
                }
                await siteHierarchy(payload).then(async (resp: iAPIResponse) => {
                    if (resp && resp.data && resp.data.hierarchyJson) {
                        console.log('resp.data :', resp.data);
                        apiData = JSON.parse(resp.data.hierarchyJson);
  
                    }
                })
            }
        }
    }
  
    return apiData;
  }

const autoExpandNodes = async (node: any, expandedNodeKeys: string[], originalTreeData: any, treeDataToUpdate: any, treeDataProps: any) => {
    let updatedTreeData = treeDataToUpdate;
    let updatedOriginalData = originalTreeData;
    let currentExpandedKeys = expandedNodeKeys;
    let selectedNodeKey = null;
    let selectedNodeData = null;
    let expandedNodes: ITreeNode[] = [node];
    const findAndAppendChildren = async (newNode: any) => {
        if (newNode && !newNode.children?.length && updatedOriginalData) {
            let resultData = await findChildrenBasedOnKey(updatedOriginalData, newNode.key,treeDataProps.featureId );
            if (resultData && resultData.length > 1) {
                let removedChildren = resultData.map((node: any) => ({ ...node, children: [] }));
                updatedTreeData = await addSubNode(updatedTreeData, newNode.key, removedChildren, treeDataProps, treeDataProps.featureId, false, newNode.stepNo);
                selectedNodeKey = [removedChildren[0].key];
                selectedNodeData = { node: removedChildren[0], event: "select" };
                return;
            }
            else if (resultData && resultData.length === 1) {
                let removedChildren = resultData.map((node: any) => ({ ...node, children: [] }));
                updatedTreeData = await addSubNode(updatedTreeData, newNode.key, removedChildren, treeDataProps, treeDataProps.featureId, false, newNode.stepNo);
                currentExpandedKeys.push(resultData[0].key);
                expandedNodes.push(resultData[0]);
                await findAndAppendChildren(removedChildren[0]);
            }
            else {
  
                let result = await apiCallsForGetData(newNode, treeDataProps.featureId);
                if (result) {
  
                    let formattedData = await convertFlatDataToHierarchyData(result, newNode.NodeEntID);
                    updatedOriginalData = await addSubNode(updatedOriginalData, newNode.key, formattedData, treeDataProps, treeDataProps.featureId, true, newNode.stepNo);
                    let filteredData = await findChildrenBasedOnKey(updatedOriginalData, newNode.key, treeDataProps.featureId);
                    if (filteredData && filteredData.length === 1) {
                        let removedChildren = filteredData.map((node: any) => ({ ...node, children: [] }));
                        updatedTreeData = await addSubNode(updatedTreeData, newNode.key, removedChildren, treeDataProps, treeDataProps.featureId, false, newNode.stepNo);
                        currentExpandedKeys.push(filteredData[0].key);
                        expandedNodes.push(filteredData[0]);
                        await findAndAppendChildren(removedChildren[0]);
                    }
                    else if (filteredData && filteredData.length > 1) {
  
                        let removedChildren = filteredData.map((node: any) => ({ ...node, children: [] }));
                        updatedTreeData = await addSubNode(updatedTreeData, newNode.key, removedChildren, treeDataProps, treeDataProps.featureId, false, newNode.stepNo);
                        selectedNodeKey = [removedChildren[0].key];
                        selectedNodeData = { node: removedChildren[0], event: "select" };
                        return;
                    }
                    // if (formattedData && formattedData.length === 1) {
                    //     let removedChildren = formattedData.map((node: any) => ({ ...node, children: [] }));
                    //     updatedTreeData = await addSubNode(updatedTreeData, newNode.key, removedChildren, treeDataProps.treeDataProps, treeDataProps.featureId, false);
                    //     currentExpandedKeys.push(formattedData[0].key);
                    //     expandedNodes.push(formattedData[0]);
                    //     await findAndAppendChildren(removedChildren[0]);
                    // }
                    // else if (formattedData && formattedData.length > 1) {
                    //     let removedChildren = formattedData.map((node: any) => ({ ...node, children: [] }));
                    //     updatedTreeData = await addSubNode(updatedTreeData, newNode.key, removedChildren, treeDataProps.treeDataProps, treeDataProps.featureId, false);
                    //     selectedNodeKey = [removedChildren[0].key];
                    //     selectedNodeData = { node: removedChildren[0], event: "select" };
                    //     return;
                    // }
                }
                else {
                    newNode.HasChildren = 0;
                    newNode.isLeaf = true;
                    selectedNodeKey = [newNode.key];
                    selectedNodeData = { node: newNode, event: "select" };
                    return;
                }
  
            }
            //add childnodes and expand 
        }
        else {
            if (newNode && newNode.children && newNode.children.length > 1) {
                // newNode.children.map((node: any) => {
                //     node.children = [];
                // });
                selectedNodeKey = [newNode.children[0].key];
                selectedNodeData = { node: newNode.children[0], event: "select" };
                return;
            }
            else if (newNode && newNode.children && newNode.children.length === 1) {
                currentExpandedKeys.push(newNode.children[0].key);
                expandedNodes.push(newNode.children[0]);
                await findAndAppendChildren(newNode.children[0]);
            }
            else {
                selectedNodeKey = [newNode.key];
                selectedNodeData = { node: newNode, event: "select" };
                return;
            }
            //if children auto expand
        }
    }
  
  
    await findAndAppendChildren(node);
    return { updatedTreeData, currentExpandedKeys, selectedNodeKey, selectedNodeData, updatedOriginalData, expandedNodes }
  
  }
  