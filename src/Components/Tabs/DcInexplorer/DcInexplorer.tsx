import { useEffect, useState } from 'react'
import { GetAllTenants, getKebabMenuData, getSvgData, getTableVsProperty } from '../../../redux/action/dcservice';
import { autoExpandDefaultNodesOfTree, checkIsSuccess, convertFlatDataToHierarchyData, deepClone, expandAllNodesOfTree, expanedSigleNode, extractProperty, getAutoExpandNodeKeys, getExpandedNodeKeysBasedOnId, getImidiateParentTreeInfoUseingDiv, getKeyFromEntId, getNodesToExpandAndSelect, getParentTreeInfoUseingDiv, getSelectedKeyFromEntId, getSelectionFromHierarchy, getStorageItem, getTodayTimeString, getVisibleNodesBasedOnExpandedKeys, insertSvgContentIntoOffice, MakeExpInventoryMgtFloorDevices, ManagementMakeTreeData, processStringToCompare, searchKeywordInTree, updateTreeNodesBasedOnFeatureId, updateVisibleTreeData } from '../../../Common/Common';
import { closeSession, createSession } from '../../../redux/reducers/sessionService';
import { datacenterHierarchy, inventoryHierarchy, siteHierarchy } from '../../../redux/action/explorerService';
import { useDispatch, useSelector, } from 'react-redux';
import { iFeatureExplorerContainerProps, iTreeDataObject, iTreeProps } from '../../../interface';
import SearchKeywordControl from './SearchKeywordControl';
import Treeview from '../../TreeView/TreeView';
import { Backdrop, CircularProgress } from '@mui/material';
import { CATEGORY, DropableControlElementEnums, EntityNameEnums, FeatureQAEnums, FEnums, NewSessionParameterObject, reuseDataForFeatures } from '../../../Common/enums';
import { findNodeInTree, findNodeUsingAPICall, SearchKeywordForExploer } from '../../../Common/KeywordSearchFunction';
import { iAPIResponse, ITreeNode, } from "../../../interface";
import { useRef } from 'react';
import SvgContent from '../../properyAndSvg/SvgContent';
import PropertyTable from '../../properyAndSvg/PropertyTable';
import Library from '../Library/Library';
import { getDevicemodelSvg, getPropertiesForEqidlist } from '../../../redux/action/libraryservice';

const DcInexplorer = (props: iFeatureExplorerContainerProps) => {
    console.log('props FeatureExplorerContainer', props)
    const dispatch = useDispatch();
    const [splitterWidth, setSplitterWidth] = useState<string | null>();
    const [isSearched, setIsSearched] = useState<boolean>(false);
    const [searchedKeyWord, setSearchedKeyWord] = useState<string>("");
    const [apiDataForTree, setApiDataForTree] = useState<any>({});
    const [apiOriginalDataForTree, setApiOriginalDataForTree] = useState<any>([]);
    const [treeData, setTreeData] = useState<any>([]);
    const [newTreeData, setNewTreeData] = useState<any>([]);
    const [selectedNodeData, setSelectedNodeData] = useState<any>();
    const [selectedNodeKeys, setSelectedNodeKeys] = useState<string[]>([]);
    const [expandedNodeKeys, setExpandedNodeKeys] = useState<string[]>([]);
    const [checkedNodeKeys, setCheckedNodeKeys] = useState<string[]>([]);
    const [halfCheckedNodeKeys, setHalfCheckedNodeKeys] = useState<string[]>([]);
    const [defaultSelectedNodeInfo, setDefaultSelectedNodeInfo] = useState<any>(null);
    const [defaultSelectedNodeKeys, setDefaultSelectedNodeKeys] = useState<string[]>([]);
    const [defaultExpandedNodeKeys, setDefaultExpandedNodeKeys] = useState<string[]>([]);
    const [defaultCheckedNodeKeys, setDefaultCheckedNodeKeys] = useState<string[]>([]);
    const [defaultCheckedNodes, setDefaultCheckedNodes] = useState<any>([]);
    const [defaultHalfCheckedNodeKeys, setDefaultHalfCheckedNodeKeys] = useState<string[]>([]);
    const [isReloadTree, setIsReloadTree] = useState<boolean>(false);
    const [filterFormOpen, setFilterFormOpen] = useState<boolean>(false);
    const [selectedFQALabel, setSelectedFQALabel] = useState<string | null>(FeatureQAEnums.Property);
    const [noOfPanesToShow, setNoOfPanesToShow] = useState<number>(1);
    const [isUpdateOnly, setIsUpdateOnly] = useState<boolean>(false);
    const [excludeRecordId, setExcludeRecordId] = useState<boolean>(false);
    const [treeviewClassName, setTreeviewClassName] = useState("");
    const [treeDataProps, setTreeDataProps] = useState<iTreeProps | undefined>();
    const [featureId, setFeatureId] = useState<string>();
    const [treeDataArray, setTreeDataArray] = useState<iTreeDataObject[]>([]);
    const [isDirty, setIsDirty] = useState<boolean>(false);
    const [secondarySessionId, setSecondarySessionId] = useState<any>(null);
    const [isDefaultWidthSet, setIsDefaultWidthSet] = useState<boolean>(false);
    const [searchHistory, setSearchHistory] = useState<string[]>([]);
    const [reportBiData, setReportBiData] = useState<any>(null)
    const [devicename, setDeviceName] = useState<any>()
    const [property, setProperty] = useState<any>()
    const dataFetchedRef = useRef(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [shapeCounter, setShapeCounter] = useState(0);

    const [dialogTitle, setDialogTitle] = useState("");
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [showNewDialog, setShowNewDialog] = useState(false);
    const [xPosition, setXPosition] = useState<any>(null);
    const [yPosition, setYPosition] = useState<any>(null);
    const [RightPosition, setRightPosition] = useState(1);
    const [bottomPosition, setbottomPosition] = useState(1);
    const [isDialogDirty, setIsDialogDirty] = useState(false);
    const [entityType, setEntityType] = useState("");
    const [gridRowData, setGridRowData] = useState<any>(undefined);
    const [newEntityData, setNewEntityData] = useState<any>({});
    const [nameColumnWidth, setNameColumnWidth] = useState(0);
    const [widthOfDialog, setWidthOfDialog] = useState(500);
    const [heightOfDialog, setHeightOfDialog] = useState(500);
    const [showContentEditorDialog, setShowContentEditorDialog] = useState(false);

    const [openConfirmDialog, setOpenConfirmDialog] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [showOKButtonOnly, setShowOKButtonOnly] = useState<boolean>(false);

    const [embeddedSessionId, setNewSessionId] = useState<string | null>(null);
    const [localSession, setLocalSession] = useState<any>(null);
    const [isPowerBiLoader, setIsPowerBiLoader] = useState<boolean>(false)
    const [nodeNameDCI, setNodeNameForDCI] = useState<string | null>(null);
    const [autoSelectNodeId, setAutoSelectNodeId] = useState<string | null>(null);
    const [authUserCheckData, setAuthUserCheckData] = useState<any>(null)
    const [windowDimensions, setWindowDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });
    const [newAddedEntId, setNewAddedEntid] = useState<string | null>(null)
    const [addInstanceClicked, setAddInstanceClicked] = useState<boolean>(false);


    const [originalTreeData, setOriginalTreeData] = useState<ITreeNode[]>([]);
    const [originalTreeDataWithoutFilter, setOriginalTreeDataWithoutFilter] = useState<ITreeNode[]>([]);
    const [originalTreeDataInventory, setOriginalTreeDataInventory] = useState<ITreeNode[]>([]);
    const [showCloseIcon, setShowCloseIcon] = useState<boolean>(false);
    const [isSiteByTenant, setIsSiteByTenant] = useState<boolean>(false);

    const [showExplorerCloseIcon, setShowExplorerCloseIcon] = useState<boolean>(false);
    const [cloneUserTreeData, setCloneUserTreeData] = useState<any>([]);
    const [isFloorTree, setIsFloorTree] = useState<boolean>(false)
    const [svgdata, setSvgData] = useState<any>()
    const nodeInfo = useSelector((state:any) =>state.TreeDataReducer).node_info
    const resultselectednode = useSelector((state:any) => state.TreeDataReducer).result_tab_selected_node


    console.log('info',nodeInfo)
    useEffect(() =>{
        if(props.instanceName === "Library"){
            debugger
            let node = nodeInfo?.node
            if(nodeInfo?.node?.EQID || nodeInfo?.node?.ShapeID){

                setSelectedNodeData(nodeInfo)   
            } else if(nodeInfo?.event === 'select' && (node?.EQID || node?.ShapeID)){
                setSelectedNodeData(nodeInfo)
            } else {
                setSelectedNodeData('')
                setProperty('')
                setSvgData('')
            }
            console.log('nodeinfo',nodeInfo?.node)
        }
        
    },[nodeInfo])

    // useEffect(() => {
    //     debugger
    //     if (resultselectednode) {
    //       if (props.instanceName === "Library" && resultselectednode) {
    //         if (resultselectednode?.node?.EQID) {
    //             try {
    //                  getPropertiesForEqidlist([resultselectednode?.node?.EQID]).then((resp) => {

    //                     const librarypropertywithskeloton = resp.data.deviceJson
    //                     let parse = JSON.parse(librarypropertywithskeloton)
    //                     let property = parse.find((item: any) => item.TableName === "Hardware")
    //                     let parseProperty = JSON.parse(property.Properties)
    //                     console.log("property", parseProperty)
    //                     setProperty(parseProperty)
    //                     setSvgData('')
    //                 })
    //             } catch (error) {
    //                     console.error('error while show property data in library module')                    
    //             }
    //         }
    //       } else if (resultselectednode?.node?.ShapeID) {
    //         let resultnode = props.selectedNode
    //         try {
    //              getDevicemodelSvg(resultselectednode?.node?.ShapeID).then((resp) => {
          
    //               const parsesvg = JSON.parse(resp.data.devicePreviewJson)
    //               setSvgData(parsesvg[0].SVG)
    //               setProperty('')
    //               setDeviceName(resultselectednode?.node?.ProductNumber)
    //               console.log('svgdata',parsesvg)
    //             })
    //           } catch (error) {
    //             console.error('Error fetching device preview:', error);
    //           }
    //       }
    //     }
    //   }, [resultselectednode])
    // useEffect(() => {

    //         setDefaultCheckedNodes(selectedNodeData.node)
    //         setDefaultCheckedNodeKeys([selectedNodeData.node.key]);
    //         setDefaultSelectedNodeKeys([selectedNodeData.node.key])
    //         setDefaultExpandedNodeKeys(expandedNodeKeys)

    // }, [selectedNodeData])

 

    const handleClickAddInstance = () => {
        setAddInstanceClicked(true);
    }

    const handleClickDeleteInstance = (selectedNode: any) => {
        if (selectedNode && selectedNode.node && selectedNode.node.RecID) {
            console.log('selectedNode :', selectedNode, selectedNodeData);
            // Are you sure you want to Delete?
            let errorMsg = `Delete`;

        }
    }


    //Audit Sessions code start






    //Audit Sessions Code End
    // handle drag end event 


    //handelDragStart is called when splitter drag start
    const handelDragStart = () => {
        let iframeDiv: any = document.querySelector('.nz-home-map-iframe');
        if (iframeDiv) {
            console.log('iframeDiv :', iframeDiv);
            iframeDiv.style.pointerEvents = 'none';
        }
    }

    //handle onSecondaryPaneSizeChange event to set the width to secondary div

    //call API to get data on search 
    const callexploreAPIForSearch = (payload: any) => {

        payload.exploreType = featureId === FEnums.InventoryManagement || featureId === FEnums.InventoryConfiguration ? 1 : 2

        siteHierarchy(payload).then(async (resp: any) => {

            if (checkIsSuccess(resp) && resp.data && resp.data.hierarchyJson) {
                if (payload.isSearch === false) {
                    setSearchedKeyWord(payload.keyword ? payload.keyword : "")
                }
                let DataRes = JSON.parse(resp.data.hierarchyJson);
                setApiDataForTree(DataRes);

            }
        });
    }

    //handle search event called from Search keyword control 
    const handelSearch = async (value: any, treeDataVar: any = undefined) => {

        if (value != undefined || value != null) {
            if (value.isSearch === false) {
                setIsSearched(false);
                callexploreAPIForSearch(value)
            } else {
                if (value.resetControl === true) {
                    if (value.isLocalSearch && treeData?.length > 0) {
                        let empty: string[] = [];
                        setTreeData([...treeData])
                        setSearchHistory([...empty]);
                    }
                    else {

                        let payload: object = {
                            isSearch: false,
                            keyword: "",
                            exploreType: 2
                        }
                        setIsSearched(false);
                        callexploreAPIForSearch(payload)
                    }
                } else {
                    if (value.isSiteByTenant !== undefined) {

                        if (apiDataForTree && typeof apiDataForTree === "object") {
                            setApiDataForTree({ ...apiDataForTree });
                        }
                        else {
                            let session_var = getStorageItem("session_variables");
                            if (session_var) {
                                let parsedData: any = JSON.parse(session_var);
                                let data = parsedData.filter((element: any) => { return element.VariableContext == "Location" && element.VariableName == "SiteID" });
                                if (data?.length > 0) {
                                    let payload: object = {
                                        siteID: data[0].SessionValue
                                    }
                                    await GetAllTenants(payload).then((resp: any) => {
                                        if (checkIsSuccess(resp) && resp.data && resp.data.tenantJson) {
                                            let DataRes = JSON.parse(resp.data.tenantJson);
                                            setApiDataForTree({ ...DataRes });
                                        }
                                        else {
                                            setApiDataForTree(undefined);
                                        }
                                    });
                                }
                                else {
                                    setApiDataForTree(undefined);
                                }
                            }
                            else {
                                setApiDataForTree(undefined);
                            }
                        }
                        setIsSiteByTenant(value.isSiteByTenant);


                    }
                    else {

                        setIsSearched(true);
                        if (value.isLocalSearch && (treeData?.length > 0 || treeDataVar?.length > 0)) {

                            let result: any = await searchKeywordInTree(value.keyword, treeDataVar ? treeDataVar : treeData, true, searchHistory);
                            if (result?.searchedNode) {
                                setSelectedNodeData({ node: result.searchedNode, selected: true });
                                setDefaultSelectedNodeKeys([result.searchedNode.key]);
                                setDefaultExpandedNodeKeys([...result.path]);
                                setSearchHistory([...searchHistory, result.searchedNode.key]);
                            }
                        }
                        else {
                            if (props.featureId && treeDataProps?.handleFlatData) {
                                handleKeywordSearch(value.keyword, value.searchAllWord);
                            }
                            else {

                                let res: any = await SearchKeywordForExploer(value, props.featureId, treeDataVar ? treeDataVar : treeData, treeDataProps?.hideKebabMenu)
                                if (res) {
                                    let { response, error } = res
                                    if (response) {
                                        let { exandeKeys, oldTreeData, selectkey, selectedNode } = response;
                                        if (selectedNode?.length > 0) {
                                            setSelectedNodeData({ node: selectedNode[0] })
                                        }
                                        setDefaultExpandedNodeKeys([...exandeKeys])

                                        setDefaultSelectedNodeKeys([selectkey])
                                        setTreeData([...oldTreeData])
                                    }

                                }
                            }
                        }
                    }
                }
            }

        }
    }
    //Dialog code start

    const setDraggableDialogPosition = () => {
        var element: any = document.querySelector(`.nz-fqa-bar-grid`);
        let div: any = document.querySelector('.nz-feature-explorer-container')
        console.log('element', element)
        if (element && div) {

            var position: any = element.getBoundingClientRect();
            var dipos: any = div.getBoundingClientRect()
            setWidthOfDialog(position.width);
            // setWidthOfDialog(position.width / 2);
            var x = position.left;
            setXPosition(x ? x : 1);
            var y = dipos.height / 2;
            setYPosition(y ? y : 1);

        }
        else {
            setXPosition(1);
            setYPosition(1);
        }


        // let windowDim = getWindowDimensions();
        // if (windowDim) {
        // setXPosition(((windowDim.width / 2) / 2));
        // setYPosition(((windowDim.height / 2) / 2));
        // }
    }






    const clearPopup = () => {
        setXPosition(null)
        setYPosition(null)
    }

    //Dialog code end

    //handleNodeCheckedEvent for treedata
    const handleNodeCheckedEvent = (checkedKeys: any, info: any, selectedKeys: any, expandedKeys: any, treeData: any, halfCheckedKeys?: string[]) => {
        console.log('treeDataProps?.instanceName', treeDataProps?.instanceName)

        if (treeDataProps?.instanceName == "auth_role_left_treeview"
            || treeDataProps?.instanceName == "auth_by_role_treeview"
            || treeDataProps?.instanceName == "feature_auth_by_role_treeview"
            || treeDataProps?.instanceName == "ItemAuthByRole_Entitiy"
            || treeDataProps?.instanceName == "ItemAuthByRole_SecureData"
            || treeDataProps?.instanceName == "feature_auth_by_user_treeview"
            || treeDataProps?.instanceName == "feature_auth_by_team_treeview"
            || treeDataProps?.instanceName == "feature_auth_by_tenant_treeview"
            || treeDataProps?.instanceName == "ItemAuthByRole_SecureData"
        ) {

            let checkedNodes = checkedKeys.length == 0 ? [] : defaultCheckedNodes;
            if (info.event == "check" && info.checked === false) {

                if (treeDataProps?.instanceName == "feature_auth_by_role_treeview"
                    || treeDataProps?.instanceName == "feature_auth_by_user_treeview"
                    || treeDataProps?.instanceName == "feature_auth_by_team_treeview"
                    || treeDataProps?.instanceName == "feature_auth_by_tenant_treeview" || treeDataProps?.instanceName == "ItemAuthByRole_SecureData") {
                    checkedNodes.map((item: any) => {
                        if (item.key == info.node.key) {
                            item.unchecked = true
                        }
                    })
                    if (checkedNodes.length == 0) {
                        let node = { ...info.node, unchecked: true }
                        checkedNodes.push(node)
                    }
                } else {
                    checkedNodes = checkedNodes.filter((ele: any) => { return ele.key != info.node.key });
                }
            }
            else {
                if (info.checked) {
                    checkedNodes.push(info.node);
                }
            }

            setDefaultCheckedNodes(checkedNodes);
            setIsDirty(true)
        }


        setCheckedNodeKeys(checkedKeys);
        setExpandedNodeKeys(expandedKeys);
        setHalfCheckedNodeKeys(halfCheckedKeys ? halfCheckedKeys : []);
        setNewTreeData(treeData);
    }
    //handleNodeSelectEvent for treedata
    const handleNodeSelectEvent = async (selectedKeys: any, info: any, expandedKeys: any, checkedKeys: any, treeData: any) => {
        if (props.treeProps?.instanceName == "entity_mfg_eqtype_treeview") {
            if (info && info.event == "select" && (info.node.HwEntityName || info.node.Type == "Manufacturer")) {
                setSelectedNodeData(null);
            }
            else if (info && (info.node.Type == "ProductNumber"
                || processStringToCompare(info.node.treetype, "ProductNumber")
                || processStringToCompare(info.node.treetype, "Manufacturer")
                || processStringToCompare(info.node.treetype, "EQType")
                || processStringToCompare(info.node.treetype, "Views"))) {
                setSelectedNodeData(info);
            }
        }
        else {
            setSelectedNodeData(info);
        }
        if (treeDataProps?.instanceName === "RoleByUser_for_userAuth") {
            props.handleNodeSelectedEvent(selectedKeys, info)
        }
        setAddInstanceClicked(false);
        setCheckedNodeKeys(checkedKeys);
        setSelectedNodeKeys(selectedKeys);
        setExpandedNodeKeys(expandedKeys);
        setNewTreeData(treeData);
        

    }


    //this function will reload the treeview 
    const handleReloadTreeview = (instanceName: string, name: any | null = null, entId: string | null = null) => {
        console.log('entId handleReloadTreeview', entId)
        console.log('name handleReloadTreeview', name)
        console.log('instanceName handleReloadTreeview', instanceName)
        setAutoSelectNodeId(null);
        if (props.treeProps?.instanceName == "datacenter_hierarchy_treeview") {
            setNewAddedEntid(name)
            datacenterHierarchy().then((resp: any) => {
                if (checkIsSuccess(resp)) {
                    if (resp.data && resp.data.hierarchyJson) {
                        var cat = JSON.parse(resp.data.hierarchyJson);
                        setAutoSelectNodeId(entId);
                        dispatch({
                            type: "RT_MOUSE_ACTION_TREE",
                            data: null
                        });
                        setApiDataForTree(cat);
                        setApiOriginalDataForTree(JSON.parse(JSON.stringify(cat)));
                    }
                    else {
                        setApiDataForTree(undefined);
                    }

                }
                else {
                    setApiDataForTree(undefined);
                }
            });
        } else if (props.treeProps?.instanceName == "inventory_hierarchy_treeview") {
            setNewAddedEntid(name)
            inventoryHierarchy().then((resp: any) => {
                if (checkIsSuccess(resp)) {
                    if (resp.data && resp.data.hierarchyJson) {
                        var cat = JSON.parse(resp.data.hierarchyJson);
                        setApiDataForTree(cat);
                        setApiOriginalDataForTree(JSON.parse(JSON.stringify(cat)));
                    }
                    else {
                        setApiDataForTree(undefined);
                    }

                }
                else {
                    setApiDataForTree(undefined);
                }
            });
        }

    }

    // this function is used to expand nodes from session table
    const expandDefaultTreeNodes = async (treeDataset: any) => {
        if (treeDataset && treeDataset?.length > 0) {

            if (treeDataProps?.openAllNodes) {
                let result = await expandAllNodesOfTree(treeDataset, true, props.featureId, treeDataProps);
                if (result && result.expKeys) {
                    // setDefaultExpandedNodeKeys(result.expKeys);
                    // setDefaultSelectedNodeKeys(result.selKeys);
                    // setSelectedNodeData(result.selNodes?.length > 0 ? { node: result.selNodes[0], selected: true, event: "select" } : null);
                    // setDefaultSelectedNodeInfo(result.selNodes?.length > 0 ? { node: result.selNodes[0], selected: true, event: "select" } : null)
                    setTreeData([...result.updatedTree ? result.updatedTree : treeDataset]);
                }
            }
            else {
                if (props.selectedNodeExplorer?.node && treeDataProps?.instanceName == "asset_management") {
                    if (Object.keys(props.selectedNodeExplorer.node)?.length > 0) {
                        let floorName: string = "";
                        let roomName: string = "";
                        await Object.keys(props.selectedNodeExplorer.node).forEach((item: string) => {
                            if (item.toLowerCase() == DropableControlElementEnums.FloorName.toLowerCase()) {
                                if (props.selectedNodeExplorer.node[item]) {
                                    floorName = props.selectedNodeExplorer.node[item];
                                }
                            }
                            else if (item.toLowerCase() == DropableControlElementEnums.RoomName.toLowerCase()) {
                                if (props.selectedNodeExplorer.node[item]) {
                                    roomName = props.selectedNodeExplorer.node[item];
                                }
                            }
                        });
                        console.log('floorName :', floorName);
                        if (floorName?.length > 0) {
                            let keysToExpand: any = [];
                            let roomNode: any = await getKeyFromEntId(treeDataset, roomName, true);
                            if (roomNode.node && roomNode.node.node && roomNode.node.node.children?.length > 0) {
                                let nodeData: any = await getKeyFromEntId(roomNode.node.node.children, floorName, true);
                                console.log('nodeData :', nodeData);
                                if (nodeData.node && nodeData.node.node) {

                                    if (nodeData.node.node.children?.length > 0) {
                                        setTreeData([...treeDataset]);
                                    }
                                    else {
                                        await MakeExpInventoryMgtFloorDevices(nodeData.node.node.NodeEntID, treeDataset, props.featureId, "", keysToExpand, nodeData.node.node.stepNo, nodeData.node.node.NodeEntityname, nodeData.node.node.parentEntID, treeDataProps?.hideKebabMenu, treeDataProps?.instanceName, false, embeddedSessionId, undefined, treeDataProps).then((resp: any) => {
                                            if (resp && resp.newTreeData) {
                                                setTreeData([...resp.newTreeData]);

                                            }
                                            else {
                                                setTreeData([...treeDataset]);
                                            }
                                        });
                                    }
                                }
                                else {
                                    setTreeData([...treeDataset]);
                                }
                            }
                            else {
                                setTreeData([...treeDataset]);
                            }
                        }
                        else {
                            setTreeData([...treeDataset]);
                        }
                    }
                    else {
                        setTreeData([...treeDataset]);
                    }
                }
                else {

                    let session_var = getStorageItem("session_variables");
                    if (session_var) {
                        let data = JSON.parse(session_var);
                        let locationData = data.filter((item: any) => { return item.VariableContext == "Location" && item.VariableName == "FloorID" });
                        let keysToExpand: any = [];
                        if (locationData?.length > 0 && locationData[0].SessionValue?.length > 0) {
                            let nodeData: any = await getKeyFromEntId(treeDataset, locationData[0].SessionValue, true);
                            if (nodeData.node && nodeData.node.node) {

                                if (nodeData.node.node.children?.length > 0) {
                                    setTreeData([...treeDataset]);
                                }
                                else {

                                    await MakeExpInventoryMgtFloorDevices(nodeData.node.node.NodeEntID, treeDataset, props.featureId, "", keysToExpand, nodeData.node.node.stepNo, nodeData.node.node.NodeEntityname, nodeData.node.node.parentEntID, treeDataProps?.hideKebabMenu, treeDataProps?.instanceName, false, embeddedSessionId).then((resp: any) => {

                                        if (resp && resp.newTreeData) {
                                            setTreeData([...resp.newTreeData]);

                                        }
                                        else {
                                            setTreeData([...treeDataset]);
                                        }
                                    });
                                }
                            }
                            else {
                                setTreeData([...treeDataset]);
                            }
                        }
                        else {
                            setTreeData([...treeDataset]);
                        }
                    }
                    else {
                        setTreeData([...treeDataset]);
                    }
                }
            }
        }
    }

    const handleUpdateOnlyCheckEvent = (event: any, checked: any) => {
        setIsUpdateOnly(!isUpdateOnly);
        let halfChecked = halfCheckedNodeKeys;
        treeData.map((item: any) => {
            if (item.children?.length > 0) {
                item.children.map((itemL1: any) => {
                    if (itemL1.NodeType == "EntityNode" && itemL1.children?.length > 1) {
                        let isCheckedPgTable: any = itemL1.children?.filter((itemL3: any) => { return itemL3.Name != `_${itemL1.Name}` && checkedNodeKeys.includes(itemL3.key) });
                        itemL1.children.map((itemL2: any) => {
                            if (itemL2.Name == `_${itemL1.Name}` && checkedNodeKeys.includes(itemL2.key)) {
                                itemL2.disabled = checked || isCheckedPgTable?.length == 0 ? false : true;
                            }
                            else if (itemL2.Name == `_${itemL1.Name}` && isCheckedPgTable?.length > 0 && checked == false) {
                                itemL2.disabled = checked ? false : true;
                                checkedNodeKeys.push(itemL2.key);
                            }
                        });
                        let isAllChecked: any = itemL1.children.filter((itemL4: any) => { return !checkedNodeKeys.includes(itemL4.key) });
                        if (isAllChecked?.length == 0) {
                            checkedNodeKeys.push(itemL1.key);
                            if (halfChecked.includes(itemL1.key)) {
                                halfChecked = halfChecked.filter((element: string) => { return element != itemL1.key });
                            }
                        }
                    }
                });
            }
        });
        // treeData.forEach((item: any) => {
        // if (item.children?.length > 1) {
        // item.children.forEach((subItem: any) => {
        // if (subItem.Name == `_${item.Name}` && checkedNodeKeys.includes(subItem.key)) {
        // subItem.disabled = checked ? false : true;
        // }
        // });
        // }
        // });
        setDefaultCheckedNodeKeys(checkedNodeKeys);
        setDefaultHalfCheckedNodeKeys(halfChecked);
        setDefaultExpandedNodeKeys(expandedNodeKeys);
        setTreeData(treeData);
    }

    const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
        let checkedKeys: string[] = [];
        let isExport: boolean = (treeDataProps?.instanceName === "import_treeview"
            || treeDataProps?.instanceName === "import_config_treeview"
            || treeDataProps?.instanceName === "import_cables_treeview") ? false : true;
        treeData.forEach((item: any) => {
            if (item.children?.length > 0) {
                item.children?.forEach((itemL1: any) => {
                    if (itemL1.NodeType == "EntityNode" && itemL1.children?.length > 0) {
                        itemL1.children.forEach((itemL2: any) => {
                            if (itemL2.Name == `_${itemL1.Name}` && itemL1.children?.length > 1 && isUpdateOnly == false) {
                                itemL2.disabled = checked && !isExport ? true : false;
                            }
                            if (checked) {
                                checkedKeys.push(itemL2.key);
                            }
                        });
                        if (checked) {
                            checkedKeys.push(itemL1.key);
                        }
                    }
                })
                if (checked) {
                    checkedKeys.push(item.key);
                }
            }
        });
        // treeData.forEach((item: any) => {
        // if (item.children?.length > 0) {
        // item.children.forEach((subItem: any) => {
        // if (subItem.Name == `_${item.Name}` && item.children?.length > 1) {
        // subItem.disabled = checked ? true : false;
        // }
        // if (checked) {
        // checkedKeys.push(subItem.key);
        // }
        // });
        // if (checked) {
        // checkedKeys.push(item.key);
        // }
        // }
        // });
        setDefaultCheckedNodeKeys(checkedKeys);
        setHalfCheckedNodeKeys(checked == false ? [] : halfCheckedNodeKeys);
        setCheckedNodeKeys(checkedKeys);
        setDefaultExpandedNodeKeys(expandedNodeKeys);
        setTreeData(treeData);
    }


    useEffect(() => {
        if (isDirty) {
            const init = async () => {
                if ((treeDataProps?.instanceName == "feature_auth_by_user_treeview" ||
                    treeDataProps?.instanceName == "feature_auth_by_team_treeview" ||
                    treeDataProps?.instanceName == "feature_auth_by_tenant_treeview") && props.selectedUserForAuth) {
                    let ownerEntity = null;
                    if (treeDataProps?.instanceName == "feature_auth_by_user_treeview") {
                        ownerEntity = "User"
                    } else if (treeDataProps?.instanceName == "feature_auth_by_team_treeview") {
                        ownerEntity = "Team"
                    } else if (treeDataProps?.instanceName == "feature_auth_by_tenant_treeview") {
                        ownerEntity = "Tenant"
                    }
                    let payloadData: any = []
                    props.usersListForAuth.map((ele: any) => {
                        if (ele.checked) {
                            payloadData.push(
                                {
                                    EntID: ele.EntID, OwnerEntityName: ele.Name
                                })
                        }
                    })




                } else if (treeDataProps?.instanceName == "ItemAuthByRole_SecureData") {
                    let ownerEntityJson: any = []
                    let ownerEntity: string = 'Role'
                    console.log('props.checkedNodesMainTree ItemAuthByRole_SecureData', props.checkedNodesMainTree)
                    if (props.checkedNodesMainTree) {
                        props.checkedNodesMainTree.forEach((element: any) => {
                            let obj = { EntID: element.NodeEntID, OwnerEntityName: element.Name }
                            ownerEntityJson.push(obj)
                        });
                    }
                    console.log('props.usersListForAuth ItemAuthByRole_SecureData', props.usersListForAuth)
                    if (props.usersListForAuth) {
                        props.usersListForAuth.map((ele: any) => {
                            if (ele.NodeType == "TeamNode") {
                                ownerEntity = "Team"
                            } else if (ele.NodeType == "TenantNode") {
                                ownerEntity = "Tenant"
                            } else if (ele.NodeType == "UserNode") {
                                ownerEntity = "User"
                            }
                            if (ele.checked) {
                                ownerEntityJson.push(
                                    {
                                        EntID: ele.EntID, OwnerEntityName: ele.Name
                                    })
                            }
                        })
                    }
                    console.log('props', props)
                    console.log('props?.checkedNodes', props?.checkedNodes)




                }
            }
            init()
        }
    }, [isDirty, props.checkedNodes, defaultCheckedNodes])

    //clear data when feature change start

    const clearStateVaribles = () => {
        let emptyArray: any = [];
        setApiDataForTree({});
        setSelectedNodeData(undefined);
        setTreeData([...emptyArray]);
        setNewTreeData([...emptyArray]);
        setFeatureId(undefined);
        setNoOfPanesToShow(1);
        setSelectedNodeKeys([]);
        setExpandedNodeKeys([]);
        setCheckedNodeKeys([]);
        setHalfCheckedNodeKeys([]);
        setDefaultSelectedNodeKeys([]);
        setDefaultExpandedNodeKeys([]);
        setDefaultCheckedNodeKeys([]);
        setDefaultCheckedNodes([]);
        setDefaultHalfCheckedNodeKeys([]);
    }


    //clear data when feature change end

    //handle secondary explorer node select event start 


    //handle secondary explorer node select event end

    //useEffect to check and create new session if required start

    useEffect(() => {
        if (treeDataProps?.isNewSessionRequired) {
            createSession({
                sessionId: getStorageItem("user_session"),
                jsonSession: JSON.stringify(NewSessionParameterObject),
                Nz_isfromui: true
            }).then((resp: any) => {
                if (checkIsSuccess(resp)) {
                    if (resp.data?.newSessionID) {
                        // let storageData = getStorageItem("embedded_session");
                        // if (storageData && storageData?.length > 0) {
                        // let parsed: string[] = JSON.parse(storageData);
                        // if (parsed) {
                        // parsed.push(resp.data.newSessionID);
                        // }
                        // else {
                        // parsed = [resp.data.newSessionID];
                        // }
                        // setStorageItem("embedded_session", JSON.stringify(parsed));
                        // }
                        // else {
                        // let embeddedData: string[] = [];
                        // embeddedData.push(resp.data.newSessionID);
                        // setStorageItem("embedded_session", JSON.stringify(embeddedData));
                        // }
                        setNewSessionId(resp.data.newSessionID);
                        if (resp.data?.jsonSessionOutput) {
                            let parsedData = JSON.parse(resp.data.jsonSessionOutput);
                            if (typeof parsedData == "object" && Object.keys(parsedData)?.length > 0) {
                                let keyName: string = Object.keys(parsedData)[0];
                                setLocalSession(parsedData[keyName]);
                            }
                        }
                    }
                }
            })
        }
    }, [treeDataProps?.isNewSessionRequired])


    //useEffect to check and create new session if required end

    useEffect(() => {

        return () => {
            if (embeddedSessionId) {
                closeSession(embeddedSessionId);
            }
        }
    }, [embeddedSessionId])

    //useEffect to handle unload component end


    //useeffect to hide show filter form
    useEffect(() => {
        if (filterFormOpen) {
            document.querySelector('.nz-exp-treeview .rc-tree.ng-treeview-assest-mgt.nz-setting-tree.rc-tree-show-line')?.classList.add("nz-hide-treeview");
        } else {
            document.querySelector('.nz-exp-treeview .rc-tree.ng-treeview-assest-mgt.nz-setting-tree.rc-tree-show-line')?.classList.remove("nz-hide-treeview");
        }
    }, [filterFormOpen, !filterFormOpen])


    //useEffect for handling 
    useEffect(() => {
        if (splitterWidth) {
            let splitter_width = splitterWidth;

            if (treeDataProps?.instanceName == "ItemAuthByRole_SecureData" || (treeDataProps?.instanceName == "asset_management" && props.featureId == FEnums.ManageAuditSessions)) {
                document.documentElement.style.setProperty(`--explorer_pane_size_${treeDataProps?.indexNumber == undefined ? 1 : treeDataProps?.indexNumber}`, splitter_width + "px");
            } else {

            }
            let outerDiv: any = document.querySelector(`.nz-feature-explorer-container-${treeDataProps?.indexNumber == undefined ? 0 : treeDataProps?.indexNumber} .nz-list-nav-category`)
            if (outerDiv) {
                outerDiv.style.width = splitter_width + 'px'
            }
        }
    }, [splitterWidth, noOfPanesToShow])

    //useEffect for handle when component first time render 


    useEffect(() => {
        if (props.featureId) {
            setIsFloorTree(false)
            setShowExplorerCloseIcon(false)
            console.log('1003 newSplitterWidth :');
            setSplitterWidth(null);
            let pane = `${props.featureId ? `${props.featureId}-` : ""}${props.paneName ? props.paneName : treeDataProps && treeDataProps?.indexNumber > 0 ? `Explorer_${treeDataProps?.indexNumber}` : "Explorer"}`;

        }
    }, [props.featureId, (treeDataProps && treeDataProps?.indexNumber), selectedFQALabel == FeatureQAEnums.DataCenter])

    useEffect(() => {

        if (selectedNodeData) {
            const getPropertyAndSvg = async () => {
                try {
                    const node = selectedNodeData.node;

                    console.log("Node Data:", node);

                    if(props.instanceName === 'asset_management'){

                        if (
                            node.NodeType !== "FrontView" &&
                            node.NodeType !== "RearView"
                        ) {
                            const entityName = node.NodeEntityname;
                            const nodeEntID = node.NodeEntID;
                            try {
                                // Fetch table and property data
                                const tableVsPropertyResp = await getTableVsProperty(entityName);
    
                                if (tableVsPropertyResp) {
                                    console.log("Property Response:", tableVsPropertyResp);
    
                                    const result = tableVsPropertyResp.data
                                        .filter(
                                            (item: any) =>
                                                item.entityPgClass === true &&
                                                item.isOneToManyRelation === false
                                        )
                                        .map((item: any) => ({
                                            tableName: item.tableName,
                                            properties: JSON.parse(item.properties),
                                        }));
    
                                    if (result && result.length > 0) {
                                        const extractLabel = extractProperty(result[0].properties, "PropertyLabel");
                                        const extractPName = extractProperty(result[0].properties, "PName"
                                        );
    
                                        // Generate column definitions
                                        const columnDefs = extractLabel.map((header) => ({
                                            field: header.replace(/\s+/g, ""),
                                        }));
    
    
                                        console.log("Filtered Table and Properties:", columnDefs);
    
                                        const tableName = result[0].tableName;
    
                                        // Fetch additional property data
                                        const kebabMenuResp = await getKebabMenuData(nodeEntID, entityName, tableName);
    
                                        if (kebabMenuResp) {
                                            const parsedData = JSON.parse(kebabMenuResp.data.propertyJson);
                                            const data =
                                                parsedData.tableName ||
                                                parsedData._Room ||
                                                parsedData._Zone ||
                                                parsedData._Location ||
                                                parsedData._Device ||
                                                parsedData._Floor ||
                                                parsedData._Store ||
                                                parsedData._Cable ||
                                                parsedData._Bin;
    
                                            console.log("Data from _Floor/Other:", data);
    
                                            const filterKeys = extractPName;
    
                                            // Map and retrieve nested data
                                            const getNestedValue = (key: any, data: any) => {
                                                if (data.hasOwnProperty(key)) {
                                                    const value = data[key];
                                                    if (Array.isArray(value)) {
                                                        return value.length > 0
                                                            ? value[0]
                                                            : "No data available";
                                                    }
                                                    if (typeof value === "object" && value !== null) {
                                                        return JSON.stringify(value);
                                                    }
                                                    return value;
                                                }
                                                return "Key not found";
                                            };
    
                                            const matchedValues = filterKeys.map((key) => {
                                                const matchedValue =
                                                    data?.length > 0
                                                        ? getNestedValue(key, data[0])
                                                        : "No data found";
                                                return { value: matchedValue };
                                            });
    
                                            console.log("Matched Values:", matchedValues);
    
                                            const keyValueObject: { [key: string]: any } = {};
                                            for (let i = 0; i < columnDefs.length; i++) {
                                                const key = columnDefs[i].field;
                                                const value = matchedValues[i]?.value || '';
                                                keyValueObject[key] = value;
                                            }
                                            const propertyData = Object.entries(keyValueObject).map(([name, value]) => ({
                                                PName: name,        // Use the key as 'PName'
                                                PropertyValue: value, // Use the value as 'PropertyValue'
                                            }));
                                            setProperty(propertyData)
                                            setSvgData('')
                                            console.log('data123', propertyData)
                                            // Here you can set the columnDefs and rowData in your state
                                            // setColumDefs(columnDefs);
                                            // setRowData(matchedValues);
                                        } else {
                                            console.warn("No response from getKebabMenuData.");
                                        }
                                    } else {
                                        console.warn("No valid table or property data found.");
                                    }
                                } else {
                                    console.warn("No response from getTableVsProperty.");
                                }
                            } catch (error) {
                                console.error("Error fetching table vs property data:", error);
                            }
                        } else 
                        
                        if (
                            node.NodeType === "FrontView" ||
                            node.NodeType === "RearView"
                        ) {
                            // Fetch SVG data
                            try {
                                const svgData = await getSvgData(node.NodeEntID, true);
                                if (svgData) {
                                    let data = JSON.parse(svgData.data.svgJson)
                                    let svgDatas: any = Object.values(data)[0]
                                    let SVGbase64 = window.atob(svgDatas[0].SVGFile)
                                    setSvgData(SVGbase64)
                                    setProperty('')
                                    let parentnode = getImidiateParentTreeInfoUseingDiv(node)
                                    setDeviceName(parentnode.Name)
                                    console.log("SVG Data:", parentnode.Name);
                                    // Handle SVG rendering or processing here
                                }
                               
                            } catch (error) {
                                console.error("Error fetching SVG data:", error);
                            }
    
                        }

                    } else if (props.instanceName ==="Library"){
                        if(node.EQID){
                            try {
                                await getPropertiesForEqidlist([node.EQID]).then((resp) => {
    
                                    const librarypropertywithskeloton = resp.data.deviceJson
                                    let parse = JSON.parse(librarypropertywithskeloton)
                                    let property = parse.find((item: any) => item.TableName === "Hardware")
                                    let parseProperty = JSON.parse(property.Properties)
                                    console.log("property", parseProperty)
                                    setProperty(parseProperty)
                                    setSvgData('')
                                })
                            } catch (error) {
                                    console.error('error while show property data in library module')                    
                            }
            
                        } else if(node.ShapeID){
                            try {
                                await getDevicemodelSvg(node.ShapeID).then((resp) => {
                          
                                  const parsesvg = JSON.parse(resp.data.devicePreviewJson)
                                  setSvgData(parsesvg[0].SVG)
                                  setProperty('')
                                  setDeviceName(node?.ProductNumber)
                                  console.log('svgdata',parsesvg)
                                })
                              } catch (error) {
                                console.error('Error fetching device preview:', error);
                              }
                        }
                    }
                    // Check for node type
                   
                } catch (error) {
                    console.error("Error in getPropertyAndSvg function:", error);
                }
            };
            getPropertyAndSvg();
        }
console.log('selectednodedata', selectedNodeData)

    }, [selectedNodeData])
    
    
    const handleDragStart = async (e: React.DragEvent<HTMLDivElement>) => {
        if(selectedNodeData){
            let node = selectedNodeData.node
            if (
                node.NodeType === "FrontView" ||
                node.NodeType === "RearView"
            ){
                const decodedSvg = window.atob(svgdata);  
                console.log('event triggrred')
                await insertSvgContentIntoOffice(svgdata, 'drag', shapeCounter);
                setShapeCounter((prev) => prev + 1);
            }
        }
        
        
    };


    useEffect(() => {
        if ((featureId && treeDataProps?.instanceName)) {
            setIsPowerBiLoader(false)
            const handleFeatureChange = async () => {
                setAutoSelectNodeId(null);
                setSelectedNodeData(null);
                setSelectedNodeKeys([]);
                if (treeDataProps?.instanceName == "asset_management" || treeDataProps?.instanceName == "phaysical_compoute" || treeDataProps?.instanceName == "cloud_compoute") {
                    {

                        if ((featureId === FEnums.InventoryManagement || featureId === FEnums.InventoryConfiguration) && originalTreeDataInventory?.length > 0) {
                            displayOnlyVisibleNodeRef.current(originalTreeDataInventory, treeDataProps, featureId);
                        }
                        else if (treeDataProps && treeDataProps.reuseFromCache
                            && originalTreeData?.length > 0
                            && featureId !== FEnums.InventoryManagement
                            && featureId !== FEnums.InventoryConfiguration && featureId) {
                            displayOnlyVisibleNodeRef.current(originalTreeData, treeDataProps, featureId);
                        }
                        else {

                            let payload: object = {
                                isSearch: false,
                                keyword: "",
                                exploreType: featureId === FEnums.InventoryManagement || featureId === FEnums.InventoryConfiguration ? 1 : 2,
                                isRefresh: false
                            }
                            siteHierarchy(payload).then((resp: iAPIResponse) => {
                                if (resp && resp.data && resp.data.hierarchyJson) {
                                    let parsedJson = JSON.parse(resp.data.hierarchyJson);
                                    setApiDataForTree({ ...parsedJson });
                                }
                            })

                        }

                    }

                }

                else if (treeDataProps?.instanceName == "DCI_form_site" || treeDataProps?.instanceName == "DCI_to_site") {

                    // datacenterHierarchy(true).then((resp: any) => {
                    //     if (checkIsSuccess(resp)) {
                    //         if (resp.data && resp.data.hierarchyJson) {
                    //             var cat = JSON.parse(resp.data.hierarchyJson);
                    setTimeout(() => {
                        setApiDataForTree(props.apiDataForTree);
                        setApiOriginalDataForTree(JSON.parse(JSON.stringify(props.apiDataForTree)));
                    }, 800)
                    //         }
                    //         else {
                    //             setApiDataForTree(undefined);
                    //         }

                    //     }
                    //     else {
                    //         setApiDataForTree(undefined);
                    //     }
                    // });
                }


                else if (treeDataProps?.instanceName == "datacenter_hierarchy_treeview") {
                    datacenterHierarchy().then((resp: any) => {
                        if (checkIsSuccess(resp)) {
                            if (resp.data && resp.data.hierarchyJson) {
                                var cat = JSON.parse(resp.data.hierarchyJson);
                                setApiDataForTree(cat);
                                setApiOriginalDataForTree(JSON.parse(JSON.stringify(cat)));
                            }
                            else {
                                setApiDataForTree(undefined);
                            }

                        }
                        else {
                            setApiDataForTree(undefined);
                        }
                    });
                }
                else if (treeDataProps?.instanceName == "inventory_hierarchy_treeview") {
                    inventoryHierarchy().then((resp: any) => {
                        if (checkIsSuccess(resp)) {
                            if (resp.data && resp.data.hierarchyJson) {
                                var cat = JSON.parse(resp.data.hierarchyJson);
                                setApiDataForTree(cat);
                                setApiOriginalDataForTree(JSON.parse(JSON.stringify(cat)));
                            }
                            else {
                                setApiDataForTree(undefined);
                            }

                        }
                        else {
                            setApiDataForTree(undefined);
                        }
                    });
                }

                else if (props.selectedNodeInfo && props.selectedNodeInfo.node) {
                    let entityName = ""
                    if (props.selectedNodeInfo.node.Name == CATEGORY.SUB_GROUP.AlertTemplate || props.selectedNodeInfo.node.Name == CATEGORY.SUB_GROUP.AlertDelivery) {
                        entityName = EntityNameEnums.AlertProfile
                    } else if (props.selectedNodeInfo.node.Name == CATEGORY.SUB_GROUP.FloorLayoutFilter) {
                        entityName = EntityNameEnums.LayoutFilterProfile;
                    } else if (props.selectedNodeInfo.node.Name == CATEGORY.SUB_GROUP.ChartAndDashboardTemplate) {
                        entityName = EntityNameEnums.ChartProfile
                    } else {
                        entityName = EntityNameEnums.ReportProfile;
                    }

                }

            }
            handleFeatureChange();

        }        // return () => {
        // setFeatureId(undefined);
        // setTreeDataProps(undefined);
        // }

    }, [featureId, treeDataProps?.instanceName, props.selectedUserForAuth, props.selectedNodeInfo?.node, props?.apiDataForTree])

    useEffect(() => {

        return () => {
            clearStateVaribles()
        };
    }, [])


    //useEffect to handle props changes
    useEffect(() => {
        if (props.treeProps?.indexNumber == 0) {
            clearStateVaribles();
        }

        setFeatureId(props.featureId);
        if (props.treeProps) {
            setTreeDataProps({ ...props.treeProps });
        }
        else {
            setTreeDataProps(undefined);
        }
        if (props.treeProps?.instanceName == "asset_management" && treeData?.length > 0 && (props.featureId == FEnums.ManageAuditSessions || props.featureId == FEnums.AuditDataCenter || props.featureId == FEnums.InventoryReconciliation)) {
            if (originalTreeDataWithoutFilter && treeDataProps) {
                displayOnlyVisibleNodeRef.current(originalTreeDataWithoutFilter, treeDataProps ? treeDataProps : props.treeProps, props.featureId, props.selectedNodeExplorer);
            }
            // expandDefaultTreeNodes(treeData);
        }
    }, [props.treeProps?.indexNumber, props.featureId, props.selectedNodeExplorer?.node])



    const displayOnlyVisibleNode = async (hierarchyData: any, treeProps: iTreeProps, selectedFeatureId: string, selectedExplorerNode: any = null) => {
        if (props.treeProps) {
            console.log('selectedFeatureId', selectedFeatureId, props)
            let result = await getSelectionFromHierarchy(hierarchyData, selectedFeatureId, props.treeProps, selectedExplorerNode ? selectedExplorerNode : props.selectedNodeExplorer);
            if (result) {
                console.log('result', result)
                if (!isFloorTree) {
                    if (selectedFeatureId === FEnums.InventoryManagement || selectedFeatureId === FEnums.InventoryConfiguration) {
                        setOriginalTreeDataInventory(result.originalTreeData);
                    }
                    else if (reuseDataForFeatures.includes(selectedFeatureId)) {
                        setOriginalTreeData(result.originalTreeData);
                    }
                    else {
                        setOriginalTreeDataWithoutFilter(result.originalTreeData)
                    }
                }

                setDefaultExpandedNodeKeys(result.expandKeys);
                let newSelectedNodeKeys: string[] = [result.selectedNodeKey];
                setDefaultSelectedNodeKeys([...newSelectedNodeKeys]);
                setExpandedNodeKeys(result.expandKeys);
                setSelectedNodeKeys([...newSelectedNodeKeys]);
                setSelectedNodeData({ ...result.selectedNode });


                let filtered_tree = getVisibleNodesBasedOnExpandedKeys(hierarchyData, result.expandKeys, treeProps, selectedFeatureId);
                setTreeData(filtered_tree.visibleTree);

            }
        }

    }
    const displayOnlyVisibleNodeRef = useRef(displayOnlyVisibleNode);

    //useEffect to handle apiDataChange
    useEffect(() => {
        if (apiDataForTree && typeof apiDataForTree == "object" && Object.keys(apiDataForTree).length > 0) {
            if (treeDataProps && treeDataProps.handleFlatData) {
                let cloneData = deepClone(apiDataForTree);

                convertFlatDataToHierarchyData(cloneData, null, props.featureId, isSiteByTenant).then((hierarchyData) => {
                    if (hierarchyData.length > 0 && treeDataProps, props.featureId) {
                        displayOnlyVisibleNodeRef.current(hierarchyData, treeDataProps, props.featureId)
                    }
                });
            }
            else {
                ManagementMakeTreeData(apiDataForTree, props.featureId, treeDataProps?.hideKebabMenu, treeDataProps?.instanceName, treeDataProps?.useUIDForKey, treeDataProps).then(async (res: any) => {
                    if (res) {
                        let { treeData, expadedKey, keyIdSingleNode, countSteoNo, checkedKeys } = res;
                        console.log('res ManagementMakeTreeData', res);
                        if (props.featureId == FEnums.InventoryManagement || props.featureId == FEnums.InventoryConfiguration) {
                            expandDefaultTreeNodes(treeData);
                            setDefaultExpandedNodeKeys([...expadedKey]);
                        }
                        else {
                            if (treeDataProps?.multiRootNode) {
                                setTreeData([...treeData]);
                            }
                            else {

                                if (keyIdSingleNode != '') {
                                    const data: any = await expanedSigleNode(treeData, keyIdSingleNode, expadedKey, props.featureId, countSteoNo, null, embeddedSessionId, treeDataProps?.instanceName, treeDataProps?.useUIDForKey);

                                    if (data && data.errorObj) {
                                        dispatch(data.errorObj);
                                        expandDefaultTreeNodes(treeData);
                                    }
                                    else {
                                        expandDefaultTreeNodes(data.updateTreedata);
                                    }
                                } else {
                                    expandDefaultTreeNodes(treeData);
                                }
                            }

                        }

                        if (checkedKeys?.length > 0) {
                            let checkedNodes: any = [];
                            if (treeDataProps?.instanceName == "entity_mfg_eqtype_treeview") {
                                await treeData.forEach((element: any) => {
                                    if (element.NodeEntityname == "HWEntity" && checkedKeys.includes(element.key)) {
                                        checkedNodes.push(element);
                                    }
                                    else if (element.children?.length > 0) {
                                        element.children.forEach((subElement: any) => {
                                            if (checkedKeys.includes(subElement.key)) {
                                                checkedNodes.push(subElement);
                                            }
                                        });
                                    }
                                });
                            }
                            else if (treeDataProps?.instanceName == "nz_entity_tables_treeview") {
                                await treeData.forEach((element: any) => {
                                    if (element.children?.length > 0) {
                                        element.children.forEach((subElement: any) => {
                                            if (checkedKeys.includes(subElement.key)) {
                                                checkedNodes.push(subElement);
                                            }
                                        })
                                    }

                                });
                            } else if (treeDataProps?.instanceName == "feature_auth_by_role_treeview"
                                || treeDataProps?.instanceName == "feature_auth_by_user_treeview"
                                || treeDataProps?.instanceName == "feature_auth_by_team_treeview"
                                || treeDataProps?.instanceName == "feature_auth_by_tenant_treeview") {
                                await treeData.forEach((element: any) => {
                                    if (element.children?.length > 0) {
                                        element.children.forEach((subElement: any) => {
                                            if (checkedKeys.includes(subElement.key)) {
                                                checkedNodes.push(subElement);
                                            }
                                        })
                                    }
                                });
                            }
                            console.log('checkedNodes', checkedNodes)
                            setDefaultCheckedNodes(checkedNodes);
                            setDefaultCheckedNodeKeys(checkedKeys);
                            setCheckedNodeKeys(checkedKeys);
                        } else {
                            setDefaultCheckedNodes([]);
                            setDefaultCheckedNodeKeys([]);
                            setCheckedNodeKeys([]);
                        }
                    }
                })
            }

        }
        else {
            let empty: any = [];
            setTreeData([...empty]);
        }
    }, [apiDataForTree, treeDataProps?.instanceName])
    //Tree data changes by NK
    useEffect(() => {
        if (treeData && treeData?.length > 0 && !treeDataProps?.handleFlatData) {
            const handleTreeDataChange = async () => {

                if (treeDataProps?.instanceName == "asset_management" && props.selectedNodeExplorer?.node && isSearched == false && (props.featureId == FEnums.ManageAuditSessions || props.featureId == FEnums.AuditDataCenter || props.featureId == FEnums.InventoryReconciliation)) {
                    if (props.selectedNodeExplorer.node?.NodeType == "AuditSessionNode" && Object.keys(props.selectedNodeExplorer.node)?.length > 0) {
                        if (props.selectedNodeExplorer.node?.SiteName != treeData[0].Name || props.selectedNodeExplorer.node?.DateApproved) {
                            treeDataProps.isAllowDrag = false;
                            setTreeDataProps(treeDataProps);
                        }
                        else {
                            treeDataProps.isAllowDrag = true;
                            setTreeDataProps(treeDataProps);
                        }
                        let propsWithValue: any = [];
                        Object.keys(props.selectedNodeExplorer.node).forEach((item: string) => {
                            if (item.toLowerCase() == DropableControlElementEnums.SiteName.toLowerCase() && props.selectedNodeExplorer.node[item]) {
                                propsWithValue.push({ index: 0, Name: props.selectedNodeExplorer.node[item] });
                            }
                            else if (item.toLowerCase() == DropableControlElementEnums.RoomName.toLowerCase() && props.selectedNodeExplorer.node[item]) {
                                propsWithValue.push({ index: 1, Name: props.selectedNodeExplorer.node[item] });
                            }
                            else if (item.toLowerCase() == DropableControlElementEnums.FloorName.toLowerCase() && props.selectedNodeExplorer.node[item]) {
                                propsWithValue.push({ index: 2, Name: props.selectedNodeExplorer.node[item] });
                            }
                            else if (item.toLowerCase() == DropableControlElementEnums.LocationName.toLowerCase() && props.selectedNodeExplorer.node[item]) {
                                propsWithValue.push({ index: 3, Name: props.selectedNodeExplorer.node[item] });
                            }
                            else if (item.toLowerCase() == DropableControlElementEnums.DeviceName.toLowerCase() && props.selectedNodeExplorer.node[item]) {
                                propsWithValue.push({ index: 4, Name: props.selectedNodeExplorer.node[item] });
                            }
                        });

                        if (propsWithValue?.length > 0) {
                            const sortedArray = [...propsWithValue].sort((a, b) => b.index - a.index);
                            let lastElement = sortedArray[0];
                            let keysToExpand: string[] = [];
                            let nodeData: any = null;
                            propsWithValue.forEach((item: any) => {
                                nodeData = getKeyFromEntId(nodeData == null || !nodeData?.node?.node?.children ? treeData : nodeData?.node?.node?.children, item.Name, true);
                                if (nodeData?.key) {
                                    if (!keysToExpand.includes(nodeData.key)) {
                                        keysToExpand.push(nodeData.key);
                                    }
                                }
                            });
                            let selectedNodedata: any = getKeyFromEntId(treeData, lastElement.Name, true);
                            if (selectedNodedata && selectedNodedata.key) {
                                if (selectedNodedata.key?.length > 0) {
                                    // NK Changes for refresh start
                                    if (isSearched == false) {

                                        let selectedKeys: any = [selectedNodedata.key];
                                        setDefaultSelectedNodeKeys(selectedKeys);

                                    }
                                    // NK Changes for refresh end
                                }

                            }
                            setDefaultExpandedNodeKeys(Array.from(new Set(keysToExpand)));
                        }
                    }
                    else {

                        let { keysToExpandNode, nodeToSelect } = await getNodesToExpandAndSelect(treeData, true);
                        if (keysToExpandNode?.length > 0) {
                            setDefaultExpandedNodeKeys(keysToExpandNode);
                        }
                        if (nodeToSelect) {
                            let keysToSelect = [nodeToSelect.key];
                            setDefaultSelectedNodeKeys(keysToSelect);
                            setSelectedNodeData({ node: nodeToSelect, selected: true, event: "select" });
                            setDefaultSelectedNodeInfo({ node: nodeToSelect, selected: true, event: "select" })
                        }
                    }
                }
                else {
                    if (treeDataProps && treeDataProps.instanceName == "asset_management") {
                        let session_var: any = null;

                        if (embeddedSessionId && localSession?.length > 0) {
                            session_var = JSON.stringify(localSession);
                        }
                        else {
                            session_var = getStorageItem("session_variables");
                        }
                        let entId = "";
                        if (session_var) {
                            let data = JSON.parse(session_var);
                            let filteredData = data.filter((item: any) => { return item.VariableContext == "Node" && item.VariableName == "SelectedNodeID" });
                            if (filteredData?.length > 0) {
                                entId = filteredData[0].SessionValue;
                            }
                            let locationData = data.filter((item: any) => { return item.VariableContext == "Location" });
                            let keysToExpand: any = defaultExpandedNodeKeys;
                            if (locationData?.length > 0) {
                                locationData.forEach((item: any) => {
                                    if (item.SessionValue?.length > 0 && (item.VariableName == "SiteID" || item.VariableName == "RoomID" || item.VariableName == "FloorID" || item.VariableName == "LocationID")) {
                                        let nodeData = getKeyFromEntId(treeData, item.SessionValue, true);
                                        if (nodeData?.key) {
                                            if (nodeData.node && nodeData.node.node && nodeData.node.node.treetype?.toLowerCase() == "floor") {
                                                if (nodeData.node.node.children?.length > 0) {
                                                    nodeData = getKeyFromEntId(treeData, item.SessionValue, true);
                                                    if (nodeData?.key) {
                                                        if (!keysToExpand.includes(nodeData.key)) {
                                                            keysToExpand.push(nodeData.key);
                                                        }
                                                    }
                                                }
                                            }
                                            else {
                                                if (!keysToExpand.includes(nodeData.key)) {
                                                    keysToExpand.push(nodeData.key);
                                                }
                                            }
                                        }

                                    }
                                })
                            }
                            if (keysToExpand?.length > 0 && !treeDataProps?.multiRootNode) {
                                if (treeData?.length > 0) {
                                    let keyList = await getAutoExpandNodeKeys(treeData, true);
                                    keysToExpand = [...keysToExpand, ...keyList];
                                }
                                setDefaultExpandedNodeKeys(Array.from(new Set(keysToExpand)));

                            }
                            else if (treeData.length == 1) {
                                keysToExpand.push(treeData[0].key);
                                setDefaultExpandedNodeKeys(keysToExpand);
                            }

                            let selectedNodedata: any = getSelectedKeyFromEntId(treeData, entId, keysToExpand, true);
                            if ((!selectedNodedata || !selectedNodedata.key || !selectedNodedata.node) && (!locationData || locationData.length == 0 || locationData[0].SessionValue == "")) {
                                selectedNodedata = getSelectedKeyFromEntId(treeData, "", keysToExpand, true);
                            }

                        }
                    } else if (treeDataProps?.instanceName == "auth_role_left_treeview" || treeDataProps?.instanceName == "auth_by_role_treeview" || treeDataProps?.instanceName == "RoleByUser_for_userAuth") {
                        let keys: any = []
                        await treeData.forEach((element: any) => {
                            keys.push(element.key)
                            if (element.children?.length > 0) {
                                element.children.forEach((subElement: any, index: number) => {
                                    if (subElement.NodeType == "Roles" && index == 0 && subElement.children.length > 0) {
                                        setDefaultSelectedNodeKeys([subElement.children[0].key])
                                        setSelectedNodeData({ node: subElement.children[0], selected: true, event: "select" });
                                        setDefaultSelectedNodeInfo({ node: subElement.children[0], selected: true, event: "select" });
                                    }
                                    keys.push(subElement.key)
                                })
                            }

                        });
                        setDefaultExpandedNodeKeys([...keys])
                        if (treeData.length > 0 && treeData[0]?.children?.length > 0) {
                            setDefaultSelectedNodeKeys([treeData[0].children[0].key])
                            setDefaultSelectedNodeInfo({ node: treeData[0].children[0], selected: true })
                            setSelectedNodeData({ node: treeData[0].children[0], selected: true })
                        }
                    }
                    else if ((treeDataProps?.instanceName === "datacenter_hierarchy_treeview" || treeDataProps?.instanceName === "inventory_hierarchy_treeview") && newAddedEntId) {
                        let data = await getExpandedNodeKeysBasedOnId(treeData, newAddedEntId, true)
                        setDefaultSelectedNodeInfo({ node: data.selectedNodeInfo, selected: true, event: "select" })
                        setSelectedNodeData({ node: data.selectedNodeInfo, selected: true, event: "select" })
                        setDefaultExpandedNodeKeys([...data.exandeKeys])
                        setExpandedNodeKeys([...data.exandeKeys])
                        setDefaultSelectedNodeKeys(data.selectKey)
                        setTreeData(treeData);
                    }
                    else {
                        if (autoSelectNodeId) {
                            let result = await getExpandedNodeKeysBasedOnId(treeData, autoSelectNodeId, true);
                            if (result) {
                                setDefaultExpandedNodeKeys(result.exandeKeys);
                                setDefaultSelectedNodeKeys(result.selectKey);
                                setSelectedNodeData({ node: result.selectedNodeInfo, selected: true, event: "select" });
                                setDefaultSelectedNodeInfo({ node: result.selectedNodeInfo, selected: true, event: "select" });
                                setTreeData(treeData);
                            }
                        }
                        else if (treeData.length == 1) {
                            let result = await autoExpandDefaultNodesOfTree(treeData, true);

                            if (result && result.selNodes?.length > 0) {
                                setDefaultExpandedNodeKeys(result.expKeys);
                                setDefaultSelectedNodeKeys(result.selKeys);
                                setSelectedNodeData({ node: result.selNodes[0], selected: true, event: "select" });
                                setDefaultSelectedNodeInfo({ node: result.selNodes[0], selected: true, event: "select" });
                            }
                            else {

                                let keysToExpand = [treeData[0].key];
                                setDefaultExpandedNodeKeys(keysToExpand);
                                if (treeData[0]?.children?.length > 0) {
                                    let keysToSelect = [treeData[0]?.children[0].key];
                                    setDefaultSelectedNodeKeys(keysToSelect);
                                    setSelectedNodeData({ node: treeData[0]?.children[0], selected: true, event: "select" });
                                    setDefaultSelectedNodeInfo({ node: treeData[0]?.children[0], selected: true, event: "select" });
                                }
                                else {
                                    let keysToSelect = [treeData[0]?.key];
                                    setDefaultSelectedNodeKeys(keysToSelect);
                                    setSelectedNodeData({ node: treeData[0], selected: true, event: "select" });
                                    setDefaultSelectedNodeInfo({ node: treeData[0], selected: true, event: "select" });
                                }
                            }
                        }
                        else if (treeData.length > 1) {
                            let keysToSelect = [treeData[0]?.key];
                            setDefaultSelectedNodeKeys(keysToSelect);
                            setSelectedNodeData({ node: treeData[0], selected: true, event: "select" });
                            setDefaultSelectedNodeInfo({ node: treeData[0], selected: true, event: "select" });

                        }
                    }
                }



                handleTreeDataChange();
            }



        }
    }, [treeData]);

    useEffect(() => {
        if (treeDataProps?.indexNumber == 0) {
            if (treeDataProps?.showPropertyPaneOnly == true) {
                setNoOfPanesToShow(1);
            } else if (selectedFQALabel?.toLowerCase() == FeatureQAEnums.Physical.toLowerCase() || selectedFQALabel?.toLowerCase() == FeatureQAEnums.Cloud.toLowerCase()) {
                setNoOfPanesToShow(2)
            }
            else {
                if (treeDataProps.instanceName == "asset_management") {
                    if (selectedFQALabel?.toLowerCase() != FeatureQAEnums.Property.toLowerCase()) {
                        setNoOfPanesToShow(1);
                    }
                    else {
                        if ((selectedNodeData && selectedNodeData.node && (selectedNodeData.node.treetype?.toLowerCase() == "site" || selectedNodeData.node.treetype?.toLowerCase() == "room"))) {
                            setNoOfPanesToShow(1);
                        }
                        else if (selectedNodeData && selectedNodeData.node && (selectedNodeData.node.treetype?.toLowerCase() == "floor"
                            || selectedNodeData.node.treetype?.toLowerCase() == "location"
                            || selectedNodeData.node.treetype?.toLowerCase() == "view"
                            || selectedNodeData.node.treetype?.toLowerCase() == "networkport"
                            || selectedNodeData.node.treetype?.toLowerCase() == "powerport"
                            || selectedNodeData.node.treetype?.toLowerCase() == "slot"
                            || selectedNodeData.node.treetype?.toLowerCase() == "device"
                            || selectedNodeData.node.treetype?.toLowerCase() == "deviceview"
                            || selectedNodeData.node.treetype?.toLowerCase() == "deviceslot"
                            || selectedNodeData.node.treetype?.toLowerCase() == "devicenetworkport"
                            || selectedNodeData.node.treetype?.toLowerCase() == "devicepowerport"
                        )) {
                            if (selectedNodeData.node.treetype?.toLowerCase() == "floor" || selectedNodeData.node.treetype?.toLowerCase() == "location") {
                                if (featureId === FEnums.FloorLayout) {
                                    setNoOfPanesToShow(2);
                                }
                            } else {
                                setNoOfPanesToShow(2);
                            }
                        }
                        else if (selectedNodeData && selectedNodeData.node && (selectedNodeData.node.treetype?.toLowerCase() == "mounteddevice")) {
                            setNoOfPanesToShow(3);
                        }
                        else {
                            setNoOfPanesToShow(1);
                        }
                    }
                }
                else if (treeDataProps.instanceName == "audit_explorer_tree") {
                    if (selectedFQALabel?.toLowerCase() != FeatureQAEnums.Property.toLowerCase() && selectedFQALabel?.toLowerCase() != FeatureQAEnums.DataCenter.toLowerCase()) {
                        setNoOfPanesToShow(1);
                    }
                    else {
                        setNoOfPanesToShow(2);
                    }
                } else if (treeDataProps.instanceName == "reminders_tree") {
                    setNoOfPanesToShow(1);
                }
                else {
                    setNoOfPanesToShow(1);
                }
            }
        }
        else if (treeDataProps?.indexNumber == 1) {
            if (treeDataProps?.showPropertyPaneOnly == true) {
                setNoOfPanesToShow(1);
            }
            else {
                if (treeDataProps.instanceName == "asset_management") {
                    if (props.featureId == FEnums.ManageAuditSessions || props.featureId == FEnums.ModelBusinessService || props.featureId == FEnums.ManageBusinessService || props.featureId == FEnums.AuditDataCenter || props.featureId == FEnums.InventoryReconciliation) {
                        if (selectedFQALabel?.toLowerCase() == FeatureQAEnums.Property.toLowerCase() && treeDataProps?.indexNumber == 1) {
                            setNoOfPanesToShow(0);
                        }
                        else if (selectedFQALabel && processStringToCompare(selectedFQALabel, FeatureQAEnums.Physical)) {
                            setNoOfPanesToShow(0);
                        }
                        else if (selectedFQALabel?.toLowerCase() == FeatureQAEnums.DataCenter.toLowerCase()) {
                            if ((selectedNodeData && selectedNodeData.node && (selectedNodeData.node.treetype?.toLowerCase() == "site" || selectedNodeData.node.treetype?.toLowerCase() == "room"))) {
                                setNoOfPanesToShow(1);
                            }
                            else if (selectedNodeData && selectedNodeData.node && (selectedNodeData.node.treetype?.toLowerCase() == "floor" || selectedNodeData.node.treetype?.toLowerCase() == "location")) {
                                setNoOfPanesToShow(2);
                            }
                            else if (selectedNodeData && selectedNodeData.node && (selectedNodeData.node.treetype?.toLowerCase() == "device" || selectedNodeData.node.treetype?.toLowerCase() == "mounteddevice")) {
                                setNoOfPanesToShow(2);
                            }
                        }
                    }
                    else if (selectedFQALabel?.toLowerCase() != FeatureQAEnums.Property.toLowerCase()) {
                        setNoOfPanesToShow(1);
                    }
                    else {
                        if ((selectedNodeData && selectedNodeData.node && (selectedNodeData.node.treetype?.toLowerCase() == "site" || selectedNodeData.node.treetype?.toLowerCase() == "room"))) {
                            setNoOfPanesToShow(1);
                        }
                        else if (selectedNodeData && selectedNodeData.node && (selectedNodeData.node.treetype?.toLowerCase() == "floor" || selectedNodeData.node.treetype?.toLowerCase() == "location" || selectedNodeData.node.treetype?.toLowerCase() == "device")) {
                            setNoOfPanesToShow(2);
                        }
                        else if (selectedNodeData && selectedNodeData.node && (selectedNodeData.node.treetype?.toLowerCase() == "mounteddevice")) {
                            setNoOfPanesToShow(3);
                        }
                        else {
                            setNoOfPanesToShow(1);
                        }
                    }
                } else if (treeDataProps?.instanceName == "phaysical_compoute" || treeDataProps?.instanceName == "cloud_compoute") {
                    setNoOfPanesToShow(0)
                }
                else {
                    setNoOfPanesToShow(1);
                }
            }
        } else if (treeDataProps?.indexNumber == 2) {
            if (treeDataProps?.instanceName == "feature_auth_by_role_treeview" ||
                treeDataProps?.instanceName == "feature_auth_by_user_treeview" ||
                treeDataProps?.instanceName == "feature_auth_by_team_treeview" ||
                treeDataProps?.instanceName == "RoleByUser_for_userAuth" ||
                treeDataProps?.instanceName == "feature_auth_by_tenant_treeview") {
                setNoOfPanesToShow(0)
            } else if (treeDataProps.instanceName == "DCI_form_site" || treeDataProps?.instanceName == "DCI_to_site" || treeDataProps?.instanceName == "NetZoom_tree" || treeDataProps?.instanceName == "WorkDay_tree" || treeDataProps?.instanceName == "ServiceNow_tree") {
                setNoOfPanesToShow(0);
            }
        } else if (treeDataProps?.indexNumber == 3) {
            if (treeDataProps?.instanceName == "ItemAuthByRole_SecureData") {
                setNoOfPanesToShow(0)
            }
        }
        if (props.featureId == FEnums.ManageAuditSessions && treeDataProps?.instanceName == "asset_management" && embeddedSessionId) {
            if (props.handleSecondaryExplorerNodeSelectEvent) {
                console.log('embeddedSessionId :', embeddedSessionId, localSession);
                props.handleSecondaryExplorerNodeSelectEvent(embeddedSessionId, treeDataProps?.instanceName);
            }
        }
    }, [selectedNodeData, selectedFQALabel, treeDataProps?.showPropertyPaneOnly])

  
//     useEffect(() => {
//         debugger
//         if(props.instanceName === "Library"){

//             if (props.treeData) {
//                 // Apply autoExpand on first-time tree render
//                 autoExpandDefaultNodesOfTreeLib(props.treeData,).then(async ({ expandedKeys, selectedNode, isSelected }) => {
//             // setExpandedKeys(expandedKeys);
//             setExpandedNodeKeys(expandedKeys)
    
//             if (selectedNode.EQID && isSelected) {
//                 GetPropertyValue(selectedNode.EQID).then((resp) =>{
//                     setProperty(resp)
//                     console.log('lib response',resp)
//                 })
//                 setSelectedNodeKeys([selectedNode.key])
//                 setSelectedNodeData(selectedNode)
//             } else if (selectedNode.ShapeID) {
//                 await callApiForGetDevicePreview(selectedNode.ShapeID)
//                 setSelectedNodeKeys([selectedNode.key])
//         // setSvgContent(parsesvg);
//         // setPropertyData([])


//                 // setProductNumber(selectedNode.ProductNumber);
//             }
//             else {
//                 setSelectedNodeKeys([selectedNode.key])
//                 setSelectedNodeData(selectedNode)

//             }
//         });
    
//     }
// }
//         // eslint-disable-next-line
//       }, [props.instanceName,]);

    useEffect(() => {
        let className = "";
        if (props.showHeader) {
            className = "nz-treeview-with-header";
        }
        if (props.searchProps) {
            if (props.searchProps.hideFilter == false || props.searchProps.hideKwdControl == false) {
                className = className + " nz-treeview-with-search";
            }
            if (props.searchProps.hideSelectAll == false || props.searchProps.hideUpdateOnly == false) {
                className = className + " nz-treeview-with-check";
            }
        }
        setTreeviewClassName(className);
    }, [props.searchProps])

    useEffect(() => {
        let treeDataArray: iTreeDataObject[] = [];
        if (treeDataProps?.instanceName && (checkedNodeKeys || defaultCheckedNodes || selectedNodeData || localSession || embeddedSessionId)) {

            console.log('props.treeDataArray :', props.treeDataArray);
            if (props.treeDataArray && props.treeDataArray?.length > 0) {
                treeDataArray = props.treeDataArray;
                let treeInstance = treeDataArray.filter((item: iTreeDataObject) => { return item.instanceName == treeDataProps?.instanceName });
                if (treeInstance?.length > 0) {
                    treeInstance[0].checkedNodeKeys = checkedNodeKeys;
                    treeInstance[0].selectedNodeInfo = selectedNodeData;
                    treeInstance[0].checkedNodes = defaultCheckedNodes;
                    treeInstance[0].embeddedSessionId = embeddedSessionId;
                    treeInstance[0].localSessionData = localSession;
                }
                else {
                    treeDataArray.push({
                        checkedNodeKeys: checkedNodeKeys,
                        selectedNodeInfo: selectedNodeData,
                        instanceName: treeDataProps?.instanceName,
                        checkedNodes: defaultCheckedNodes,
                        embeddedSessionId: embeddedSessionId,
                        localSessionData: localSession
                    });
                }
            }
            else {
                treeDataArray.push({
                    checkedNodeKeys: checkedNodeKeys,
                    selectedNodeInfo: selectedNodeData,
                    instanceName: treeDataProps?.instanceName,
                    checkedNodes: defaultCheckedNodes,
                    embeddedSessionId: embeddedSessionId,
                    localSessionData: localSession
                });
            }
            console.log('treeDataArray :', treeDataArray);
            setTreeDataArray(treeDataArray);
        }
    }, [checkedNodeKeys, defaultCheckedNodes, selectedNodeData, localSession, embeddedSessionId])




    useEffect(() => {
        if (props.featureId == FEnums.ManageAuditSessions && props.selectedNodeExplorer?.node && embeddedSessionId) {
            console.log('props.selectedNodeInfo?.node props.selectedNodeExplorer.node :', props.selectedNodeExplorer.node, getTodayTimeString(), embeddedSessionId);


        }
    }, [props.selectedNodeExplorer?.node])

    const handleCheckDragAndDrop = async (dragInfo: any, dropInfo: any, controlName: string) => {
        console.log('dropInfo', dropInfo)
        console.log('dragInfo', dragInfo)
        let dropPerate = await getParentTreeInfoUseingDiv(dropInfo, true)
        console.log('dropPerate', dropPerate)
        let dargPerate = await getParentTreeInfoUseingDiv(dragInfo, true)
        console.log('dargPerate', dargPerate)
        if (controlName == "NetZoom_tree") {
            let netzoom: any = [dragInfo.Name]
            let servicenow: any = [dropInfo.Name]
            for (let index = 0; index < dargPerate.length; index++) {
                const element = dargPerate[index];
                if (element.Name) {
                    netzoom.push(element.Name)
                }
            }
            for (let index = 0; index < dropPerate.length; index++) {
                const element = dropPerate[index];
                if (element.Name) {
                    servicenow.push(element.Name)

                }
            }
            netzoom = netzoom.reverse()
            servicenow = servicenow.reverse()
            console.log('servicenow', servicenow)
            console.log('netzoom', netzoom)


            props.handleCheckDragAndDrop(netzoom, servicenow)
        }

    }

    const updateOriginalTreeDataset = async (updatedTreedata: any, expandedKeys: string[], selectedKeys: string[], userTreeData: any) => {
        console.log('updatedTreedata :', updatedTreedata);
        if (featureId === FEnums.InventoryManagement || featureId === FEnums.InventoryConfiguration) {
            setOriginalTreeDataInventory(updatedTreedata);
        }
        else if (featureId && reuseDataForFeatures.includes(featureId)) {
            setOriginalTreeData(updatedTreedata);
        }
        else {
            setOriginalTreeDataWithoutFilter(updatedTreedata)
        }
        setDefaultExpandedNodeKeys(expandedKeys);
        setDefaultSelectedNodeKeys(selectedKeys);
        setTreeData(userTreeData);
    }

    const handleKeywordSearch = async (searchText: string, searchAllWord: boolean) => {
        if (treeData) {
            //Search in user tree data.
            let foundedNode = await findNodeInTree(searchText, treeData, searchHistory);
            let foundFromCache = false;
            let cachedTreeData = [...originalTreeData];
            if (foundedNode && foundedNode.foundNode == null && featureId) {
                //Filter cached tree data based on selected feature
                cachedTreeData = await updateTreeNodesBasedOnFeatureId(cachedTreeData, featureId);
                //Search in Cached data. 
                foundedNode = await findNodeInTree(searchText, cachedTreeData, searchHistory);
                foundFromCache = foundedNode && foundedNode.foundNode ? true : false;
            }
            if (foundedNode && foundedNode.foundNode === null && treeDataProps && featureId) {
                let exploreType = 2
                if (featureId === FEnums.AssetConfiguration) {
                    exploreType = 2
                } else if (featureId === FEnums.DeviceConfiguration) {
                    exploreType = 3
                }
                else if (featureId === FEnums.InventoryManagement || featureId === FEnums.InventoryConfiguration) {
                    exploreType = 1
                }
                //Search using API call.
                let result = await findNodeUsingAPICall(originalTreeData, treeData, searchText, searchAllWord, exploreType, searchHistory.join(';'), featureId, treeDataProps);
                if (result && result.parentNodes && result.parentNodes.length > 0) {
                    let parentNodeKeys = result.parentNodes.map((item: any) => item.EntID);
                    if (treeDataProps && parentNodeKeys.length > 0) {
                        if (featureId === FEnums.InventoryManagement || featureId === FEnums.InventoryConfiguration) {
                            setOriginalTreeDataInventory(result.originalTreeData);
                        }
                        else if (featureId && reuseDataForFeatures.includes(featureId)) {
                            setOriginalTreeData(result.originalTreeData);
                        }
                        else {
                            setOriginalTreeDataWithoutFilter(result.originalTreeData)
                        }
                        setOriginalTreeData(result.originalTreeData);
                        let updatedTree = await updateVisibleTreeData(result.originalTreeData, treeData, parentNodeKeys, treeDataProps, featureId, false);
                        setTreeData(updatedTree.visibleTree);
                        setDefaultExpandedNodeKeys([...parentNodeKeys, ...expandedNodeKeys]);
                        setDefaultSelectedNodeKeys([parentNodeKeys[parentNodeKeys.length - 1]]);
                        setSearchHistory([...searchHistory, parentNodeKeys[parentNodeKeys.length - 1]]);
                    }
                }
            }
            if (foundedNode && foundedNode.foundNode) {
                let parentNodeKeys = foundedNode.parentNodes.map((item: ITreeNode) => item.key);
                if (foundFromCache) {
                    if (treeDataProps && parentNodeKeys.length > 0 && featureId) {

                        let updatedTree = await updateVisibleTreeData(cachedTreeData, treeData, parentNodeKeys, treeDataProps, featureId, foundFromCache);
                        setTreeData(updatedTree.visibleTree);
                    }
                }
                setDefaultExpandedNodeKeys([...parentNodeKeys, ...expandedNodeKeys]);
                setDefaultSelectedNodeKeys([foundedNode.foundNode.key]);

                setSearchHistory([...searchHistory, foundedNode.foundNode.key]);
            }
        }
    }
    const hanldeCloseIcon = () => {

        if (treeDataProps && featureId) {
            displayOnlyVisibleNodeRef.current(cloneUserTreeData, treeDataProps, featureId);
        }
        setShowExplorerCloseIcon(false)
        setIsFloorTree(false)
    }

    return (
        <div className={`nz-feature-explorer-container
        ${!treeDataProps?.hideCheckBox ? " nz-tree-with-check" : ""}
        ${!treeDataProps?.hideicon ? " nz-tree-with-icon" : ""}`}>
            
            <div className={props.searchProps && (props.searchProps?.hideFilter == false || props.searchProps?.hideKwdControl == false) ? "nz-list-nav-category" : "nz-list-nav-category nz-h-100"}>
                {props.showHeader && <div className="nz-form-title-bar">
                    <div className="form-title">
                        {props.headerText}
                    </div>
                    {/* {props.showSaveButton && <IconButton
                            size="small"
                            title="Save Changes"
                            className={`nz-general-save-btn${!isDirty ? ' nz-hide-save-button' : ""}`}
                            onClick={handleSaveButtonClick}
                        >
                            {" "}
                            <ReactSVG className="nz-misc-icon"
                                fallback={() => { return <ReactSVG className="nz-misc-icon" src={getImagePath("Default_128x128.svg", "misc")} /> }}
                                src={getImagePath("Save.svg", "misc")} />

                        </IconButton>} */}
                </div>}
                <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                    open={isLoading}
                >
                    <CircularProgress color="inherit" />
                </Backdrop>
                {props?.instanceName === "Library" ? (
                    
                  <Library instanceName ="Library" />

                ) : (<>
                    {props.searchProps && (props.searchProps?.hideFilter == false || props.searchProps?.hideKwdControl == false) && <div className="nz-search-setting-with-filter">
                    <SearchKeywordControl
                        featureId={featureId}
                        hideFilter={props.searchProps?.hideFilter}
                        findNodeLabel={props.searchProps.findNodeLabel}
                        treeIndexNumber={props.treeProps?.indexNumber}
                        localSession={localSession}
                        embeddedSessionId={embeddedSessionId}
                        allowHidePane={props.allowHidePane}
                        allowShowPane={props.allowShowPane}
                        paneName={props.paneName}
                        hidePaneTitles={props.hidePaneTitles}
                        handleCloseOpenPane={props.handleCloseOpenPane}
                        hideSearchKwd={props.searchProps?.hideKwdControl}
                        searchFor={treeDataProps?.instanceName ? treeDataProps.instanceName : "explorTree"}
                        showExplorerCloseIcon={showExplorerCloseIcon}
                        hanldeCloseIcon={hanldeCloseIcon}
                        handleParentFun={(value: any) => {
                            handelSearch(value);
                        }}
                        reloadTree={() => {
                            callexploreAPIForSearch({
                                isSearch: false,
                                keyword: "",
                                groupName: "",
                                sessionId: embeddedSessionId ? embeddedSessionId : null,
                                exploreType: (props.featureId == FEnums.InventoryManagement || props.featureId == FEnums.InventoryConfiguration) ? 1 : 2
                            })
                            setIsReloadTree(true)
                        }}
                        filterFormOpne={(value: any) => {
                            setFilterFormOpen(value);
                        }}
                    ></SearchKeywordControl>
                </div>}
               
               
                <div className='nz-exp-treeview'>
                    {treeDataProps && defaultExpandedNodeKeys && defaultSelectedNodeKeys
                        && (treeData || (treeData && (treeData.length == 0 || treeData.length > 0))) && (<Treeview
                            handleNodeSelectEvent={(selectedKeys: any, info: any, expandedKeys: any, checkedKeys: any, treeData: any) => {
                                // handleSubCategorySelection(selectedKeys, info, expandedNodes);
                                handleNodeSelectEvent(selectedKeys, info, expandedKeys, checkedKeys, treeData)
                            }}
                            handleNodeCheckedEvent={(checkedKeys: any, info: any, selectedKeys: any, expandedKeys: any, treeData: any, halfCheckedKeys?: string[]) => {
                                handleNodeCheckedEvent(checkedKeys, info, selectedKeys, expandedKeys, treeData, halfCheckedKeys)
                            }}
                            updateReloadState={() => {
                                setIsReloadTree(false)
                            }}
                            isReloadtree={isReloadTree}
                            class={`ng-treeview-assest-mgt nz-setting-tree nz-tree-common-number-${treeDataProps.indexNumber ? treeDataProps.indexNumber : 0} `}
                            controlName={treeDataProps?.instanceName}
                            hideKebabMenu={treeDataProps?.hideKebabMenu}
                            multiple={false}
                            isRightClickEnabled={true}
                            selectedKeys={defaultSelectedNodeKeys}
                            hideCopyIcon={treeDataProps.hideCopyIcon}
                            // location={location}
                            localSession={localSession}
                            embeddedSessionId={embeddedSessionId}
                            showIcon={!treeDataProps?.hideicon}
                            draggable={isFloorTree ? true : treeDataProps?.isAllowDrag}
                            dropAllow={treeDataProps?.isAllowDrop}
                            checkable={!treeDataProps?.hideCheckBox}
                            internalDrag={treeDataProps?.internalDrag}
                            indexNumber={treeDataProps.indexNumber}
                            isUpdateOnly={isUpdateOnly}
                            checkStrictly={treeDataProps?.checkStrictly}
                            treeData={treeData}
                            selectedNodeExplorer={props.selectedNodeExplorer ? props.selectedNodeExplorer.node : null}
                            halfCheckedKeys={defaultHalfCheckedNodeKeys?.length > 0 ? defaultHalfCheckedNodeKeys : []}
                            expandedKeys={defaultExpandedNodeKeys}
                            selectedNodeData={defaultSelectedNodeInfo}
                            isFloorTree={isFloorTree}
                            // splitterWidth={splitterWidth}
                            checkedKeys={defaultCheckedNodeKeys ? defaultCheckedNodeKeys : []}
                            keyword={searchedKeyWord}
                            useUIDForKey={treeDataProps.useUIDForKey}
                            allowEditIcon={props.allowEditIcon ? props.allowEditIcon : false}
                            allowAddIcon={props.allowAddIcon ? props.allowAddIcon : false}
                            allowDeleteIcon={props.allowDeleteIcon ? props.allowDeleteIcon : false}
                            handelEditIconOnTree={props?.handelEditIconOnTree}
                            handelAddIconOnTree={props?.handelAddIconOnTree ? props.handelAddIconOnTree : handleClickAddInstance}
                            handelDeleteIconOnTree={props?.handelDeleteIconOnTree ? props.handelDeleteIconOnTree : handleClickDeleteInstance}
                            handleReloadTreeview={handleReloadTreeview}
                            openAllNodes={treeDataProps?.openAllNodes ? true : false}
                            featureId={featureId ? featureId : ""}
                            originalTreeData={(featureId === FEnums.InventoryManagement || featureId === FEnums.InventoryConfiguration) ? originalTreeDataInventory : featureId && reuseDataForFeatures.includes(featureId) ? originalTreeData : originalTreeDataWithoutFilter}
                            updateOriginalTreeDataset={updateOriginalTreeDataset}
                            treeDataProps={treeDataProps}
                            handleFlatData={treeDataProps.handleFlatData}
                            handleCheckDragAndDrop={(dragInfo: any, dropInfo: any, controlName: string) => {
                                handleCheckDragAndDrop(dragInfo, dropInfo, controlName)
                            }}
                            handleDragStart={handleDragStart}

                        />)}
                </div>
                </>)}
                
              


            </div>

            {noOfPanesToShow > 0 && <div className={treeDataProps && treeDataProps.indexNumber == 0 ? 'nz-feature-qa-container' : 'nz-feature-qa-container-no-overflow'}>
               
                <>
                    {svgdata ? (
                        <SvgContent
                            svgContent={svgdata}
                            instanceName="DC_Inventory"
                            DeviceName={devicename}
                        />
                    ) : property ? (
                        <PropertyTable
                            propertyData={property}
                        />
                    ) : (
                        '' // Optional fallback message
                    )}
                </>

            </div>}





        </div >

    )
}

export default DcInexplorer
