import { Box, Checkbox, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Popover } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { shallowEqual, useDispatch, useSelector } from 'react-redux'
import { ReactSVG } from 'react-svg'
import { checkIsSuccess, getImagePath, getImidiateParentTreeInfoUseingDiv, getSessionVariableFromStorage, getStorageItem, handleAPIResponse, RightMouseMenuRange, setStorageItem, updateFeatureLabelFromSession } from './Common'
import { NzIcon } from './NzIcon'
import { ChartEntityNameArr, FEnums, HomePageSubMenus, RightMouseMenuTreeNode } from './enums'
import { updateSession } from '../redux/reducers/sessionService'
import { getKebabMenu } from '../redux/action/dcservice'

export const RightMouseMenu = (props: any) => {
    const [anchorEl, setAnchorEl] = useState<HTMLImageElement | null>(null);
    const [isShowMenu, setIsShowMenu] = useState(false);
    const [isShowMoreMenu, setIsShowMoreMenu] = useState(false);
    const [rightMenus, setRightMenus] = useState<any>([]);
    const [explorerRightMouse, setExplorerRightMouse] = useState<any>([])
    const [selectedItem, setSelectedItem] = useState<any>({});
    const [mouseX, setMouseX] = useState<any>();
    const [mouseY, setMouseY] = useState<any>();
    const [rightMoreMenus, setRightMoreMenus] = useState([])
    const [selectedNodeData, setSelectedNodeData] = useState<any>();
    const [isShowKebabIcon, setIsShowKebabIcon] = useState(false);
    const dispatch = useDispatch();
    const feature_data = useSelector(
        (state: any) => state.sessionReducer?.feature_data,
        shallowEqual
    );

    useEffect(() => {
        console.log('selectedNodeData useEffect', selectedNodeData)
        console.log('props.container', props.container)
        if (props.container == "explorer_tree") {

            console.log('feature_data :', feature_data);
            if (feature_data) {
                // let filteredData: any = feature_data.filter((item: any) => { return item.MenuID == "103" && item._Feature > RightMouseMenuRange.MIN && item.NodeType == "" && item.Label != "" });
                if (selectedNodeData && selectedNodeData.node) {

                    let menuData = getExplorerMenuData();
                    if (menuData?.length > 0) {
                        setIsShowKebabIcon(true);
                    }
                    else {
                        setIsShowKebabIcon(false);
                    }
                }
            }
        }
        else if (props.container == "entity_mfg_eqtype_tree") {
            if (selectedNodeData && selectedNodeData.node && selectedNodeData.node.NodeType?.toLowerCase() == "hwentity") {
                setIsShowKebabIcon(false);
            }
            else {
                setIsShowKebabIcon(true);
            }
        } else if (props.container === "dashboard_chart") {
            setIsShowKebabIcon(true);
        } else if (props.container == "datacenter_hierarchy_treeview"
            || props.container == "inventory_hierarchy_treeview"
            || props.container == "dci_left_tree") {
            if (feature_data && props.selectedNodeExplorer) {
                if (selectedNodeData && selectedNodeData.node) {
                    let menuData = getExplorerMenuData(props.selectedNodeExplorer.NodeEntID);
                    if (menuData?.length > 0) {
                        setIsShowKebabIcon(true);
                    }
                    else {
                        setIsShowKebabIcon(false);
                    }
                }
            }
        }
        else if (props.container == "fqa_property_tab") {
            if (selectedNodeData && selectedNodeData.node) {
                setSelectedItem(null)
                let nodeName = selectedNodeData.node.NodeEntityname;
                getKebabMenu(nodeName, selectedNodeData.node.NodeType).then((resp: any) => {
                    if (checkIsSuccess(resp)) {
                        if (resp.data && resp.data.kebabJson?.length > 0) {
                            let kebabData = JSON.parse(resp.data.kebabJson);
                            let menuList: any = typeof kebabData == "object" && Object.keys(kebabData)?.length > 0 ? Object.values(kebabData)[0] : [];
                            setRightMenus([...menuList]);
                            setIsShowKebabIcon(true);
                        }
                        else {
                            setIsShowKebabIcon(false);
                        }
                    }
                    else {
                        setIsShowKebabIcon(false);
                    }
                })
            }
            else {
                setIsShowKebabIcon(false);
            }
        } else if (props.instanceName == "gemini_info") {
            if (props.searchedDeviceData.length > 0) {
                setIsShowKebabIcon(true);
            }
        }
        else {
            setIsShowKebabIcon(true);
        }

    }, [selectedNodeData])
    useEffect(() => {
        console.log('props.selectedNode useEffect:', props.selectedNode);
        if (props.selectedNode) {
            setSelectedNodeData({ node: props.selectedNode });
        }
        else if (props.selectedRow) {
            console.log('props.selectedRow useEffect:', props.selectedRow);
            let menuItems: any = getRightMouseMenuForGridRow(props.selectedRow);

            console.log('featureData :', menuItems);
            if (menuItems?.length > 0) {
                if (props.selectedRow && (props.container == "cabling_componet_deviceA" || props.container == "cabling_componet_cableB" || props.container == "cabling_componet_deviceC" || props.container == "mapping_FrontA" || props.container == "mapping_FrontB")) {
                    setIsShowKebabIcon(true);
                    setSelectedNodeData({ node: props.selectedRow })
                    // console.log('props.menuItems', props.menuItems)
                    // setRightMenus(props.menuItems)
                } else {
                    setIsShowKebabIcon(true);
                    setRightMenus(menuItems)
                }
            }
            else {
                setIsShowKebabIcon(false);
            }
        }

    }, [props.selectedNode, props?.selectedRow?.NodeType])


    //////////////////////////////////////////////////////////////////////////
    // fnHasChildren()
    // {
    // If ExplorerNode.HasChildren == 1 then return true else return false
    // }
    //////////////////////////////////////////////////////////////////////////

    const fnHasChildren = (hasChildren: any) => {
        if (hasChildren == 1)
            return true
        else
            return false
    }
    ///////////////////////////////////////////////////////////////////////////////////////
    //     fnDisplayOrder()
    //     {
    // 	If ExplorerNode.DisplayOrder == 0
    //         then
    //         {
    //             ExplorerNode.DisplayOrder = !ExplorerNode.DisplayOrder
    //             return true
    //         }
    // else
    // {
    //     ExplorerNode.DisplayOrder = !ExplorerNode.DisplayOrder
    //     return false
    // }
    // }
    ///////////////////////////////////////////////////////////////////////////////////////

    const fnDisplayOrder = (selectednode: any) => {
        let data: any = selectednode
        if (selectednode?.node?.DisplayOrder == 1) {
            data = { node: { ...selectedNodeData.node, DisplayOrder: !selectednode?.node?.DisplayOrder } }
            setSelectedNodeData(data)
            return true
        }
        else {
            data = { node: { ...selectedNodeData.node, DisplayOrder: !selectednode?.node?.DisplayOrder } }
            setSelectedNodeData(data)
            return false

        }
    }
    ///////////////////////////////////////////////////////////////////////
    // fnHasPowerPort()
    // {
    // If ExplorerNode.HasPowerPort > 0 then return true else return false
    // }
    ///////////////////////////////////////////////////////////////////////
    const fnHasPowerPort = (hasPowerPort: any) => {
        if (hasPowerPort > 0)
            return true
        else
            return false
    }
    ///////////////////////////////////////////////////////////////////////////////////
    // fnHasNetworkPort()
    // {
    // If ExplorerNode.HasNetworkPort > 0 then return true else return false
    // }
    ///////////////////////////////////////////////////////////////////////////////////

    const fnHasNetworkPort = (HasNetworkPort: any) => {
        if (HasNetworkPort > 0)
            return true
        else
            return false
    }

    const fnPowerBI = (selected_node: any) => {
        return true
    }

    const fnFloorDevice = (selectednode: any) => {
        let ParentNode = getImidiateParentTreeInfoUseingDiv(selectednode.node)
        if (ParentNode && ParentNode?.NodeType == "Floor" || ParentNode?.NodeType == "Location") {
            return true
        }
        else {
            return false
        }
    }
    /////////////////////////////////////////////////////////////////////////////
    //We are returning NodeType = RU and PortStatus: MountedFilled
    //fnRUNormalAllowed - PortStatus <> MountedFilled AND (PortStatus <> Normal)
    //fnRUNormal: PortStatus is Normal

    // Offer Normal RU – fnRUNormalAllowed 
    // Offer BAD, Reserved, Block – fnRUNormal
    /////////////////////////////////////////////////////////////////////////////
    const fnRUNormalAllowed = (selectednode: any) => {
        if ((selectednode?.node?.NodeType == "RU") &&
            (selectednode?.node?.PortStatus?.toLowerCase() != "filled" && (selectednode?.node?.PortStatus != null && selectednode?.node?.PortStatus?.toLowerCase() != "normal"))) {
            return true
        } else {
            return false
        }
    }
    const fnRUNormal = (selectednode: any) => {
        if ((selectednode?.node?.NodeType == "RU") &&
            (selectednode?.node?.PortStatus == null || selectednode?.node?.PortStatus?.toLowerCase() == "normal")) {
            return true
        } else {
            return false
        }
    }
    ////////////////////////////////////////////////////////////////////////////////////////////
    // We are returning NodeType = Slot and PortStatus = Filled

    // fnSlotNormalAllowed - PortStatus <> Filled AND(PortStatus <> Normal)
    // fnSlotNormal: PortStatus is Normal
    // Offer Normal RU – fnSlotNormalAllowed
    // Offer BAD, Reserved, Block – fnSlotNormal
    ////////////////////////////////////////////////////////////////////////////////////////////

    const fnSlotNormalAllowed = (selectednode: any) => {
        if ((selectednode?.node?.NodeType == "Slot" || selectednode?.node?.NodeType == "wide slot") &&
            (selectednode?.node?.PortStatus?.toLowerCase() != "filled"
                && (selectednode?.node?.PortStatus != null && selectednode?.node?.PortStatus?.toLowerCase() != "normal"))) {
            return true
        } else {
            return false
        }

    }
    const fnSlotNormal = (selectednode: any) => {
        if ((selectednode?.node?.NodeType == "Slot" || selectednode?.node?.NodeType == "wide slot") &&
            (selectednode?.node?.PortStatus == null || selectednode?.node?.PortStatus?.toLowerCase() == "normal")) {
            return true
        } else {
            return false
        }
    }
    //////////////////////////////////////////////////////////////////////////////////////////
    // for Port
    // fnPortNormalAllowed - PortStatus <> Cabled AND(PortStatus <> Normal)
    // fnPortNormal: PortStatus is Normal
    // fnPortCabled - PortStatus <> Cabled

    // Offer Normal RU – fnPortNormalAllowed 
    // Offer BAD, Reserved, Block – fnPortNormal

    // Offer Disconnect cable, Disconnect Port: fnPortCabled
    /////////////////////////////////////////////////////////////////////////////////////////////
    const fnPortNormalAllowed = (selectednode: any) => {
        console.log('selectednode fnPortNormalAllowed', selectednode)
        if ((selectednode?.node?.NodeType == "Port"
            || (props.container == "cabling_componet_deviceA" && selectednode?.node?.FromDevicePortNodeType == "DevicePortNode")
            || (props.container == "mapping_FrontA" && selectednode?.node?.NodeType == "DevicePortNode")
            || (props.container == "mapping_FrontB" && selectednode?.node?.NodeType == "DevicePortNode")
            || (props.container == "cabling_componet_cableB" && selectednode?.node?.PortBNodeType == "CablePortNode")
            || (props.container == "cabling_componet_deviceC" && (selectednode?.node?.ToDevicePortNodeType == "DevicePortNode" || selectednode.node.NodeType == "DevicePortNode"))
        ) &&
            (selectednode?.node?.PortStatus?.toLowerCase() != "cabled"
                || selectednode?.node?.FromDevicePortStatus?.toLowerCase() != "cabled"
                || selectednode?.node?.PortBStatus?.toLowerCase() != "cabled"
                || selectednode?.node?.ToDevicePortStatus?.toLowerCase() != "cabled"
                || selectednode?.node?.MappedPortsA?.toLowerCase() != "cabled"
            )
            && ((selectednode?.node?.PortStatus != null || selectednode?.node?.MappedPortsA != null || selectednode?.node?.FromDevicePortStatus != null || selectednode?.node?.PortBStatus != null || (selectednode?.node?.ToDevicePortStatus != null || selectednode.node.NodeType != null))
                && selectednode?.node?.PortStatus?.toLowerCase() != "normal"
                || selectednode?.node?.FromDevicePortStatus?.toLowerCase() != "normal"
                || selectednode?.node?.PortBStatus?.toLowerCase() != "normal"
                || selectednode?.node?.ToDevicePortStatus?.toLowerCase() != "normal"
                || selectednode?.node?.MappedPortsA?.toLowerCase() != "normal"
            )) {
            return true
        } else {
            return false
        }

    }
    const fnPortNormal = (selectednode: any) => {
        if ((selectednode?.node?.NodeType == "Port"
            || (props.container == "cabling_componet_deviceA" && selectednode?.node?.FromDevicePortNodeType == "DevicePortNode")
            || (props.container == "mapping_FrontA" && selectednode?.node?.NodeType == "DevicePortNode")
            || (props.container == "mapping_FrontA" && selectednode?.node?.NodeType == "CablePortNode")
            || (props.container == "mapping_FrontB" && selectednode?.node?.NodeType == "DevicePortNode")
            || (props.container == "mapping_FrontB" && selectednode?.node?.NodeType == "CablePortNode")
            || (props.container == "cabling_componet_cableB" && selectednode?.node?.PortBNodeType == "CablePortNode")
            || (props.container == "cabling_componet_deviceC" && (selectednode?.node?.ToDevicePortNodeType == "DevicePortNode" || selectednode.node.NodeType == "DevicePortNode"))

        ) &&
            ((selectednode?.node?.PortStatus == null || selectednode?.node?.MappedPortsA == null || selectednode?.node?.FromDevicePortStatus == null || selectednode?.node?.PortBStatus == null || (selectednode?.node?.ToDevicePortStatus == null || selectednode.node.NodeType == null)) ||
                (selectednode?.node?.PortStatus?.toLowerCase() == "normal"
                    || selectednode?.node?.FromDevicePortStatus == "normal"
                    || selectednode?.node?.PortBStatus?.toLowerCase() == "normal"
                    || selectednode?.node?.ToDevicePortStatus?.toLowerCase() == "normal"
                    || selectednode?.node?.MappedPortsA?.toLowerCase() == "normal"
                ))) {
            return true
        } else {
            return false
        }

    }
    const fnPortCabled = (selectednode: any) => {
        if (selectednode?.node?.NodeType == "Port" && selectednode?.node?.PortStatus?.toLowerCase() != "Cabled") {
            return true
        } else {
            return false
        }
    }

    ////////////////////////////////////////////////////////////////////////////
    // fnPortConnected()
    // {
    // If ExplorerNode.PortStatus<> ”Cabled” then return true else return false
    // }
    /////////////////////////////////////////////////////////////////////////////
    const fnPortConnected = (selectednode: any) => {
        let status = ['normal', 'block', 'reserve', 'bad']
        if (props.container == "cabling_componet_deviceA" || props.container == "cabling_componet_cableB" || props.container == "cabling_componet_deviceC" || props.container == "mapping_FrontA" || props.container == "mapping_FrontB") {
            if ((selectednode?.node?.FromDevicePortNodeType == "DevicePortNode" && (selectednode?.node?.FromDevicePortStatus != null && !status.includes(selectednode?.node?.FromDevicePortStatus?.toLowerCase())))
                || (selectednode?.node?.PortBNodeType == "CablePortNode" && (selectednode?.node?.PortBStatus != null && !status.includes(selectednode?.node?.PortBStatus?.toLowerCase())))
                || (selectednode?.node?.NodeType == "CablePortNode" && (selectednode?.node?.MappedPortsA != null && !status.includes(selectednode?.node?.MappedPortsA?.toLowerCase())))
                || (selectednode?.node?.NodeType == "DevicePortNode" && (selectednode?.node?.ToDevicePortStatus != null && !status.includes(selectednode?.node?.ToDevicePortStatus?.toLowerCase())))
                || (selectednode?.node?.ToDevicePortNodeType == "DevicePortNode" && ((selectednode?.node?.ToDevicePortStatus != null || selectednode.node.NodeType != null) && !status.includes(selectednode?.node?.ToDevicePortStatus?.toLowerCase())))) {
                return true
            } else {
                return false
            }


        } else {

            if (selectednode?.node?.NodeType == "Port" && selectednode.node.PortStatus?.toLowerCase() == "cabled") {
                return true
            } else {
                return false
            }

        }

    }

    const fnSelectedCell = (selectednode: any) => {
        if (props.container == "cabling_componet_deviceA" || props.container == "cabling_componet_cableB" || props.container == "cabling_componet_deviceC" || props.container == "mapping_FrontA" || props.container == "mapping_FrontB") {
            return true
        } else {
            return false
        }
    }
    /////////////////////////////////////////////////////////////////////////
    // fnDiscoverable
    // {
    // If ExplorerNode.NodeType ==”Device” then return true else return false
    // }
    /////////////////////////////////////////////////////////////////////////
    const fnDiscoverable = (selectednode: any) => {
        if (selectednode.node.NodeType == "Device") {
            return true
        } else { return false }
    }
    ///////////////////////////////////////////////////////////////////////////////////
    // fnMonitorable
    // {
    // If ExplorerNode.NodeType ==”Device” then return true else return false
    // }
    ///////////////////////////////////////////////////////////////////////////////////
    const fnMonitorable = (selectednode: any) => {
        if (selectednode.node.NodeType == "Device") {
            return true
        } else { return false }
    }
    ////////////////////////////////////////////////////////////////////////////////
    // fnPortMapNeeded()
    // {
    // If ExplorerNode.EntityName ==”_PatchPanel” then return true else return false
    // }
    ////////////////////////////////////////////////////////////////////////////////

    const fnPortMapNeeded = (selectednode: any) => {
        if (selectednode?.node?.NodeEntityname == "_PatchPanel") {
            return true
        } else {
            return false
        }
    }
    ////////////////////////////////////////////////////////////////////////////////////
    // fnPasteSource;//defined in NZPG.Session.pasteSource  in Session table
    // {
    //     If(Explorer.Node.NodeType
    //         in (Floor; SubFloor; Ceiling; Wall; Location) OR fnSlotAvailable) AND(NZPG.Session.pasteSource<> ””) then return true else return false
    // }
    ////////////////////////////////////////////////////////////////////////////////////
    const fnPasteSource = (selectednode: any) => {
        let sessionData: any = sessionStorage.getItem("session_variables")
        sessionData = JSON.parse(sessionData)
        let PasteSource: any = sessionData.filter((item: any) => {
            return item.VariableName == "PasteSource" ? item : null
        })
        PasteSource = PasteSource[0]

        if ((((selectednode.node.NodeType == "Floor" ||
            selectednode.node.NodeType == "SubFloor" ||
            selectednode.node.NodeType == "Ceiling" ||
            selectednode.node.NodeType == "Wall" ||
            selectednode.node.NodeType == "Location")) ||
            fnSlotAvailable(selectedNodeData)) &&
            PasteSource.SessionValue != "") {
            return true
        } else {
            return false
        }
    }
    //////////////////////////////////////////////////////////////////////////////
    //     fnDeviceImportBin()
    //     {
    //         If((ExplorerNode.NodeType ==”Bin”) AND
    //             (ExplorerNode.Name =”New” OR  ExplorerNode.Name =”Other”))
    //  then return true else return false
    //     }
    /////////////////////////////////////////////////////////////////////////////////////
    const fnDeviceImportBin = (selectednode: any) => {
        if ((selectednode.node.NodeType == "Bin") && (selectednode?.node?.Name == "New" || selectednode?.node?.Name == "Other")) {
            return true
        } else {
            return false
        }
    }
    ///////////////////////////////////////////////////////////////////////////////////////
    // fnPowerCableImportBin()
    // {
    //     If((ExplorerNode.NodeType ==”Bin”) AND
    //         (ExplorerNode.Name =”Network Cables” OR ExplorerNode.Name =”Power Cables”))
    //  then return true else return false
    // }

    ///////////////////////////////////////////////////////////////////////////////////////
    const fnPowerCableImportBin = (selectednode: any) => {
        if ((selectednode.node.NodeType == "Bin") && selectednode?.node?.Name == "Power Cables") {
            return true
        } else {
            return false
        }
    }
    ///////////////////////////////////////////////////////////////////////////////////////

    // fnNetworkCableImportBin()
    // {
    //     If((ExplorerNode.NodeType ==”Bin”) AND
    //         (ExplorerNode.Name =”Network Cables” OR  ExplorerNode.Name =”Power Cables”))
    //  then return true else return false
    // }
    ///////////////////////////////////////////////////////////////////////////////////////

    const fnNetworkCableImportBin = (selectednode: any) => {
        if ((selectednode.node.NodeType == "Bin") && selectednode?.node?.Name == "Network Cables") {
            return true
        } else {
            return false
        }
    }
    ///////////////////////////////////////////////////////////////////////////////////////
    // fnBinMoveToUnused;
    //{
    //         If(<Node>.NodeType==Bin and <Node>.Type==New or Other) return true else return false
    // }
    ///////////////////////////////////////////////////////////////////////////////////////
    const fnBinMoveToUnused = (selectedNode: any) => {
        if (selectedNode?.node?.NodeType == "Bin" && (selectedNode?.node?.Type == "New" || selectedNode?.node?.Type == "Other")) {
            return true;
        } else {
            return false;
        }
    }
    ///////////////////////////////////////////////////////////////////////////////////////
    //fnBinMoveToDisposable;
    //{
    //         If((<Node>.NodeType==Bin and <Node>.Type ==Unused) return true else return false
    //}
    ///////////////////////////////////////////////////////////////////////////////////////
    const fnBinMoveToDisposable = (selectedNode: any) => {
        if (selectedNode?.node?.NodeType == "Bin" && selectedNode?.node?.Type == "Unused") {
            return true
        } else {
            return false
        }
    }
    ///////////////////////////////////////////////////////////////////////////////////////
    //fnBinDispose;
    //{
    //                 If((<Node>.NodeType==Bin and <Node>.Type ==Disposable) return true else return false
    //}    
    ///////////////////////////////////////////////////////////////////////////////////////
    const fnBinDispose = (selectedNode: any) => {
        if (selectedNode?.node?.NodeType == "Bin" && selectedNode?.node?.Type == "Disposable") {
            return true
        } else {
            return false
        }
    }
    ///////////////////////////////////////////////////////////////////////////////////////
    // fnSwapMountedDevice
    // {
    //returns true if mounted device views can be swapped
    //     If(NodeType == MountedDevice AND(ParentNode.NodeType == SLOT OR(ParentNode.NodeType == RU)
    // Then Return true
    // Else return false
    // }
    /////////////////////////////////////////////////////////////////////////////////////
    const fnSwapMountedDevice = (selectedNode: any) => {
        let ParentNode = getImidiateParentTreeInfoUseingDiv(selectedNode.node)
        if (selectedNode?.node?.NodeType == "MountedDevice" && (ParentNode?.NodeType == "SLOT" || ParentNode?.NodeType == "RU")) {
            return true
        } else {
            return false
        }
    }

    /////////////////////////////////////////////////////////////////////////////////////
    // fnSlotAvailable(); used for RU, Slot and PORT only
    // {//We are sending status or RU, Slot also as a PortStatus
    // If ExplorerNode.PortStatus == “Avaialble” or "0”) then return true else return false
    // }
    /////////////////////////////////////////////////////////////////////////////////////

    // const fnSlotAvailable = (selectednode: any) => {
    //     if ((selectednode.node.NodeType == "RU" ||
    //         selectednode.node.NodeType == "TopRU" ||
    //         selectednode.node.NodeType == "RU0" ||
    //         selectednode.node.NodeType == "Slot") &&
    //         (selectednode?.node?.PortStatus?.toLowerCase() == "available" ||
    //             selectednode?.node?.PortStatus?.toLowerCase() == "" || selectednode?.node?.PortStatus == null) ||
    //         selectednode.node.PortStatus == '0') {
    //         return true
    //     } else {
    //         return false
    //     }
    // }

    ////////////////////////////////////////////////////////////////////////////////////////////
    //     TU - You developed this function, please remove this one
    //     fnSlotAvailable

    // Now Develop these functions
    //     a.fnRUAvailable		check NodeType = RU
    //     b.fnSlotAvailable		check NodeType = SLOT
    //     c.fnPortAvailable		check NodeType = Port
    //     d.fnPortConnected
    //     {
    //         a.Return false; this logic will be implemented after cabling is done.
    // }

    //     e.fnFloorDevice
    //     {
    //         if (ParentEntID.NodeType == Floor or ParentEntID.NodeType == Location) 
    // then Return true 
    // else return false
    // }
    /////////////////////////////////////////////////////////////////////////////////////////

    const fnRUAvailable = (selectednode: any) => {
        if ((selectednode?.node?.NodeType == "RU" && (selectednode?.node?.PortStatus?.toLowerCase() == "available" ||
            selectednode?.node?.PortStatus?.toLowerCase() == "normal" ||
            selectednode?.node?.PortStatus?.toLowerCase() == "" || selectednode?.node?.PortStatus == null))) {
            return true
        }
        else {
            return false
        }
    }
    const fnSlotAvailable = (selectednode: any) => {
        if ((selectednode?.node?.NodeType?.toLowerCase() == "slot" && (selectednode?.node?.PortStatus?.toLowerCase() == "available" ||
            selectednode?.node?.PortStatus?.toLowerCase() == "normal" ||
            selectednode?.node?.PortStatus?.toLowerCase() == "" || selectednode?.node?.PortStatus == null))) {
            return true
        }
        else {
            return false
        }
    }
    const fnPortAvailable = (selectednode: any) => {
        if ((selectednode?.node?.NodeType?.toLowerCase() == "port" && (selectednode?.node?.PortStatus?.toLowerCase() == "available" ||
            selectednode?.node?.PortStatus?.toLowerCase() == "normal" ||
            selectednode?.node?.PortStatus?.toLowerCase() == "" || selectednode?.node?.PortStatus == null))) {
            return true
        }
        else {
            return false
        }
    }

    const fnMapPort = (selectedNode: any) => {
        if (selectedNode.node.IsPatchPort) {
            return true
        } else {
            return false
        }
    }

    //Audit Session RTM Functions by NK
    // IsSelectedAuditSessionApprove 
    // If (AuditSessionNode AND
    // SelectedAuditsession.DateCreated = true	AND
    // SelectedAuditsession.DateApproved = False 	AND
    // SelectedAuditsession. OpenDate = False 	AND
    // SelectedAuditsession. CloseDate = False
    // ) return =true else return false;
    const IsSelectedAuditSessionApprove = (selectedNode: any) => {
        if (selectedNode?.node && selectedNode?.node?.DateCreated && !selectedNode?.node?.DateApproved
            && !selectedNode?.node?.OpenDate && !selectedNode?.node?.CloseDate) {
            return true;
        }
        else {
            return false;
        }
    }

    // IsSelectedAuditSessionReject
    // If(AuditSessionNode AND
    // SelectedAuditsession.DateCreated = true	AND
    // SelectedAuditsession.DateApproved = true 	AND
    // SelectedAuditsession.OpenDate = False 		AND
    // SelectedAuditsession.CloseDate = False
    // ) return = true else return false;
    const IsSelectedAuditSessionReject = (selectedNode: any) => {
        if (selectedNode?.node && selectedNode?.node?.DateCreated && selectedNode?.node?.DateApproved
            && !selectedNode?.node?.OpenDate && !selectedNode?.node?.CloseDate) {
            return true;
        }
        else {
            return false;
        }
    }

    // IsSelectedAuditSessionOpen
    // If (AuditSessionNode AND
    // SelectedAuditsession.DateCreated = true	AND
    // SelectedAuditsession.DateApproved = true 	AND
    // SelectedAuditsession. OpenDate = false 		AND
    // SelectedAuditsession. CloseDate = False
    // ) return =true else return false;
    const IsSelectedAuditSessionOpen = (selectedNode: any) => {
        if (selectedNode?.node && selectedNode?.node?.DateCreated && selectedNode?.node?.DateApproved
            && !selectedNode?.node?.OpenDate && !selectedNode?.node?.CloseDate) {
            return true;
        }
        else {
            return false;
        }
    }

    // IsSelectedAuditSessionClose
    // If (AuditSessionNode AND
    // SelectedAuditsession.DateCreated = true	AND
    // SelectedAuditsession.DateApproved = true 	AND
    // SelectedAuditsession. OpenDate = true 		AND
    // SelectedAuditsession. CloseDate = False
    // ) return =true else return false;
    const IsSelectedAuditSessionClose = (selectedNode: any) => {
        if (selectedNode?.node && selectedNode?.node?.DateCreated && selectedNode?.node?.DateApproved
            && selectedNode?.node?.OpenDate && !selectedNode?.node?.CloseDate) {
            return true;
        }
        else {
            return false;
        }
    }

    // IsSelectedAuditSessionSnapshot
    // If (AuditSessionNode AND
    // SelectedAuditsession.DateCreated = true	AND
    // SelectedAuditsession.DateApproved = true 	AND
    // SelectedAuditsession. OpenDate = true 		AND
    // SelectedAuditsession. CloseDate = False
    // ) return =true else return false;
    const IsSelectedAuditSessionSnapshot = (selectedNode: any) => {
        if (selectedNode?.node && selectedNode?.node?.DateCreated && selectedNode?.node?.DateApproved
            && selectedNode?.node?.OpenDate && !selectedNode?.node?.CloseDate) {
            return true;
        }
        else {
            return false;
        }
    }

    // IsSelectedAuditSessionDelete
    // If (AuditSessionNode AND
    // SelectedAuditsession.DateCreated = true	AND
    // SelectedAuditsession.DateApproved = true 	AND
    // SelectedAuditsession. OpenDate = true 		AND
    // SelectedAuditsession. CloseDate = true
    // ) return =true else return false;
    const IsSelectedAuditSessionDelete = (selectedNode: any) => {
        if (selectedNode?.node && selectedNode?.node?.DateCreated && selectedNode?.node?.DateApproved
            && selectedNode?.node?.OpenDate && selectedNode?.node?.CloseDate) {
            return true;
        }
        else {
            return false;
        }
    }

    // Function  IsAdminNZTaskNode
    // If (NZTaskNode AND
    //     Session.RequestedBy.LoginUserBasicRoleName = “Admin”
    // ) return =true else return false;
    const IsAdminNZTaskNode = (selectedNode: any) => {
        let sessionVar = getSessionVariableFromStorage("RequestedBy", "LoginUserBasicRoleName");
        if (selectedNode && sessionVar?.length > 0 && sessionVar[0].SessionValue == "Admin") {
            return true;
        }
        else {
            return false;
        }
    }

    // Function  IsAdminNZSessionNode
    // If (NZSessionNode AND
    //     Session.RequestedBy.LoginUserBasicRoleName = “Admin”
    // ) return =true else return false;
    const IsAdminNZSessionNode = (selectedNode: any) => {
        let sessionVar = getSessionVariableFromStorage("RequestedBy", "LoginUserBasicRoleName");
        if (selectedNode && sessionVar?.length > 0 && sessionVar[0].SessionValue == "Admin") {
            return true;
        }
        else {
            return false;
        }
    }

    // Function  IsAdminNZWinSVCNode
    // If (NZWinSVCNode AND
    //     Session.RequestedBy.LoginUserBasicRoleName = “Admin”
    // ) return =true else return false;
    const IsAdminNZWinSVCNode = (selectedNode: any) => {
        let sessionVar = getSessionVariableFromStorage("RequestedBy", "LoginUserBasicRoleName");
        if (selectedNode && sessionVar?.length > 0 && sessionVar[0].SessionValue == "Admin") {
            return true;
        }
        else {
            return false;
        }
    }
    const fnMigrationEnabled = (selectedNode: any) => {
        return true
    }
    const getRightMouseMenuForGridRow = (selectedRow: any) => {
        let menu: any = [];
        feature_data.map((item: any) => {
            

                if (item.NodeType == "") {
                    menu.push(item)
                } else {
                    if (item.NodeType.includes('IsAdminNZTaskNode')) {
                        if (IsAdminNZTaskNode(selectedRow)) {
                            menu.push(item)
                        }
                    }
                    else if (item.NodeType.includes('IsAdminNZSessionNode')) {
                        if (IsAdminNZSessionNode(selectedRow)) {
                            menu.push(item)
                        }
                    }
                    else if (item.NodeType.includes('IsAdminNZWinSVCNode')) {
                        if (IsAdminNZWinSVCNode(selectedRow)) {
                            menu.push(item)
                        }
                    }
                    else {
                        // console.log('item.NodeType', item.NodeType)
                        let nodeTypeArray = item.NodeType.split(";");
                        nodeTypeArray = nodeTypeArray.map((el: any) => {
                            return el.trim();
                        });
                        //same logic as we follow below in map fuction.
                        // if (nodeTypeArray.indexOf(selectedNodeData?.node?.NodeType) !== -1) {
                        //     menu.push(item)
                        // }
                        if (selectedRow?.NodeType) {

                            nodeTypeArray.map((element: any) => {
                                if (element.toLowerCase() == selectedRow?.NodeType.toLowerCase()) {
                                    menu.push(item)
                                }
                            })
                        }
                        // console.log('selectedNodeData?.node?.NodeType', selectedNodeData?.node?.NodeType)
                        // if (item.NodeType.includes(selectedNodeData?.node?.NodeType)) {
                        //     console.log('item', item)
                        //     menu.push(item)
                        // }
                    }
                }

            
        });
        return menu;
    }

    const getRightMouseMenuForCablingGridRow = (featureId: any) => {
        let menu: any = [];
        console.log('feature_data', feature_data)
        feature_data.map((item: any) => {
            if ((item.MenuID == featureId || featureId == null) && item.Label != "") {
                if (item.NodeType.includes('fnPortNormalAllowed')) {
                    if (fnPortNormalAllowed(selectedNodeData)) {
                        menu.push(item)
                    }
                } else if (item.NodeType.includes('fnPortNormal')) {
                    if (fnPortNormal(selectedNodeData)) {
                        menu.push(item)
                    }
                } else if (item.NodeType.includes("fnPortConnected")) {
                    if (fnPortConnected(selectedNodeData)) {
                        menu.push(item)
                    }
                } else if (item.NodeType.includes("fnSelectedCell")) {
                    if (fnSelectedCell(selectedNodeData)) {
                        menu.push(item)
                    }
                }
                else {
                    // console.log('item.NodeType', item.NodeType)
                    let nodeTypeArray = item.NodeType.split(";");
                    nodeTypeArray = nodeTypeArray.map((el: any) => {
                        return el.trim();
                    });
                    //same logic as we follow below in map fuction.
                    // if (nodeTypeArray.indexOf(selectedNodeData?.node?.NodeType) !== -1) {
                    //     menu.push(item)
                    // }
                    // if (selectedRow?.NodeType) {

                    //     nodeTypeArray.map((element: any) => {
                    //         if (element.toLowerCase() == selectedRow?.NodeType.toLowerCase()) {
                    //             menu.push(item)
                    //         }
                    //     })
                    // }
                    // console.log('selectedNodeData?.node?.NodeType', selectedNodeData?.node?.NodeType)
                    // if (item.NodeType.includes(selectedNodeData?.node?.NodeType)) {
                    //     console.log('item', item)
                    //     menu.push(item)
                    // }
                }

            }
        });
        return menu;
    }
    const fnCharts = (selectedNode: any, nodeType: string) => {
        let splitData: string[] = nodeType.split(";").map(item => item.trim());
        if (selectedNode.NodeEntityname && splitData.includes(selectedNode.NodeEntityname)) {
            if (ChartEntityNameArr.EntityNames.includes(selectedNode.NodeEntityname)) {
                return true
            } else {
                return true
            }
        } else {
            return false
        }
    }

    const getExplorerMenuData = (featureId: string | null = null) => {
        let menu: any = [];
        // let entityName = selectedNodeData.node.NodeEntityname.replace('__', '')
        // entityName = entityName.replace('_', '')
        // let pgClass = selectedNodeData.node.PGClassName.replace("__", "")
        // pgClass = pgClass.replace('_', '')
        let fnChildrenDisplayOrderToggleStatus = selectedNodeData.node.DisplayOrder
        feature_data.map((item: any) => {
                if (item.NodeType == "") {
                    menu.push(item)
                } else {
                    if (item.NodeType.includes("fnHasChildren")) {
                        if (fnHasChildren(selectedNodeData?.node?.HasChildren)) {
                            menu.push(item)
                        }
                    } else if (item.NodeType.includes("fnDisplayOrder")) {
                        if (fnDisplayOrder(selectedNodeData)) {
                            menu.push(item)
                        }
                    }
                    else if (item.NodeType.includes("fnHasNetworkPort")) {
                        if (fnHasNetworkPort(selectedNodeData?.node?.HasNetworkPorts)) {
                            menu.push(item)
                        }
                    } else if (item.NodeType.includes("fnHasPowerPort")) {
                        if (fnHasPowerPort(selectedNodeData?.node?.HasPowerPorts)) {
                            menu.push(item)
                        }
                    } else if (item.NodeType.includes("fnChildrenDisplayOrderToggle")) {

                        // if (fnChildrenDisplayOrderToggle(selectedNodeData, fnChildrenDisplayOrderToggleStatus)) {

                        if (selectedNodeData?.node?.HasChildren > 1) {
                            if (!fnChildrenDisplayOrderToggleStatus) {
                                menu.push(item)
                            }
                        }
                        fnChildrenDisplayOrderToggleStatus = fnChildrenDisplayOrderToggleStatus == 1 ? 0 : 1
                        // }
                    } else if (item.NodeType.includes("fnPortConnected")) {
                        if (fnPortConnected(selectedNodeData)) {
                            menu.push(item)
                        }
                    } else if (item.NodeType.includes("fnPortMapNeeded")) {
                        if (fnPortMapNeeded(selectedNodeData)) {
                            menu.push(item)
                        }
                    } else if (item.NodeType.includes("fnPasteSource")) {
                        if (fnPasteSource(selectedNodeData)) {
                            menu.push(item)
                        }
                    } else if (item.NodeType.includes("fnMonitorable")) {
                        if (fnMonitorable(selectedNodeData)) {
                            menu.push(item)
                        }
                    } else if (item.NodeType.includes("fnDiscoverable")) {
                        if (fnDiscoverable(selectedNodeData)) {
                            menu.push(item)
                        }
                    } else if (item.NodeType.includes("fnDeviceImportBin")) {
                        if (fnDeviceImportBin(selectedNodeData)) {
                            menu.push(item)
                        }
                    } else if (item.NodeType.includes("fnNetworkCableImportBin")) {
                        if (fnNetworkCableImportBin(selectedNodeData)) {
                            menu.push(item)
                        }
                    } else if (item.NodeType.includes("fnPowerCableImportBin")) {
                        if (fnPowerCableImportBin(selectedNodeData)) {
                            menu.push(item)
                        }
                    } else if (item.NodeType.includes('fnSlotAvailable')) {
                        if (fnSlotAvailable(selectedNodeData)) {
                            menu.push(item)
                        }
                    } else if (item.NodeType.includes('fnBinMoveToUnused')) {
                        if (fnBinMoveToUnused(selectedNodeData)) {
                            menu.push(item)
                        }
                    } else if (item.NodeType.includes('fnBinMoveToDisposable')) {
                        if (fnBinMoveToDisposable(selectedNodeData)) {
                            menu.push(item)
                        }
                    } else if (item.NodeType.includes('fnBinDispose')) {
                        if (fnBinDispose(selectedNodeData)) {
                            menu.push(item)
                        }
                    } else if (item.NodeType.includes('fnSwapMountedDevice')) {
                        if (fnSwapMountedDevice(selectedNodeData)) {
                            menu.push(item)
                        }
                    } else if (item.NodeType.includes('fnRUAvailable')) {
                        if (fnRUAvailable(selectedNodeData)) {
                            menu.push(item)
                        }
                    } else if (item.NodeType.includes('fnPortAvailable')) {
                        if (fnPortAvailable(selectedNodeData)) {
                            menu.push(item)
                        }
                    } else if (item.NodeType.includes('fnFloorDevice')) {
                        if (fnFloorDevice(selectedNodeData)) {
                            menu.push(item)
                        }
                    }
                    else if (item.NodeType.includes('IsSelectedAuditSessionApprove')) {
                        if (IsSelectedAuditSessionApprove(selectedNodeData)) {
                            menu.push(item)
                        }
                    }
                    else if (item.NodeType.includes('IsSelectedAuditSessionReject')) {
                        if (IsSelectedAuditSessionReject(selectedNodeData)) {
                            menu.push(item)
                        }
                    }
                    else if (item.NodeType.includes('IsSelectedAuditSessionOpen')) {
                        if (IsSelectedAuditSessionOpen(selectedNodeData)) {
                            menu.push(item)
                        }
                    }
                    else if (item.NodeType.includes('IsSelectedAuditSessionClose')) {
                        if (IsSelectedAuditSessionClose(selectedNodeData)) {
                            menu.push(item)
                        }
                    }
                    else if (item.NodeType.includes('IsSelectedAuditSessionSnapshot')) {
                        if (IsSelectedAuditSessionSnapshot(selectedNodeData)) {
                            menu.push(item)
                        }
                    }
                    else if (item.NodeType.includes('IsSelectedAuditSessionDelete')) {
                        if (IsSelectedAuditSessionDelete(selectedNodeData)) {
                            menu.push(item)
                        }
                    }
                    else if (item.NodeType.includes('IsAdminNZTaskNode')) {
                        if (IsAdminNZTaskNode(selectedNodeData)) {
                            menu.push(item)
                        }
                    }
                    else if (item.NodeType.includes('IsAdminNZSessionNode')) {
                        if (IsAdminNZSessionNode(selectedNodeData)) {
                            menu.push(item)
                        }
                    }
                    else if (item.NodeType.includes('IsAdminNZWinSVCNode')) {
                        if (IsAdminNZWinSVCNode(selectedNodeData)) {
                            menu.push(item)
                        }
                    } else if (item.NodeType.includes('fnMapPort')) {
                        if (fnMapPort(selectedNodeData)) {
                            menu.push(item)
                        }
                    } else if (item.NodeType.includes('fnMigrationEnabled')) {
                        if (fnMigrationEnabled(selectedNodeData)) {
                            menu.push(item)
                        }
                    } else if (item.NodeType.includes('fnCharts')) {
                        if (fnCharts(selectedNodeData.node, item.NodeType)) {
                            menu.push(item)
                        }
                    }
                    // else if (item.NodeType.includes('fnPowerBI')) {
                    //     if (fnPowerBI(selectedNodeData)) {
                    //         menu.push(item)
                    //     }
                    // }
                    else {
                        // console.log('item.NodeType', item.NodeType)
                        let nodeTypeArray = item.NodeType.split(";");
                        nodeTypeArray = nodeTypeArray.map((el: any) => {
                            return el.trim();
                        });
                        //same logic as we follow below in map fuction.
                        // if (nodeTypeArray.indexOf(selectedNodeData?.node?.NodeType) !== -1) {
                        //     menu.push(item)
                        // }
                        if (selectedNodeData?.node?.NodeType) {

                            nodeTypeArray.map((element: any) => {
                                if (element.toLowerCase() == selectedNodeData?.node?.NodeType.toLowerCase()) {
                                    menu.push(item)
                                }
                            })
                        }
                        // console.log('selectedNodeData?.node?.NodeType', selectedNodeData?.node?.NodeType)
                        // if (item.NodeType.includes(selectedNodeData?.node?.NodeType)) {
                        //     console.log('item', item)
                        //     menu.push(item)
                        // }
                    }
                }

        });
        return menu;
    }




    const handleClick = (event: React.MouseEvent<HTMLImageElement>) => {
        setMouseX(event.clientX);
        setMouseY(event.clientY);
        setIsShowMoreMenu(false);
        console.log('props handleClick', props)
        if (props.container == "entity_mfg_eqtype_tree") {
            let menu = [{ Label: "Create", Tooltip: "Create New Entity" }];
            setRightMenus(menu);
            setAnchorEl(event.target as HTMLImageElement);
        } else if (props.instanceName == "gemini_info") {
            if (props.searchedDeviceData.length > 0) {
                let menuList: any = [];
                let index: number = props.searchedDeviceData.length;
                props.searchedDeviceData.forEach((item: string) => {
                    if (item) {
                        menuList.push({ Label: `Page-${index}`, iconName: 'GoogleIcon_128x128.svg', result: item });
                    }
                    index--;
                })
                setRightMenus([...menuList]);
                setAnchorEl(event.target as HTMLImageElement);
            }
        } else if (props.container == "helpTip") {
            let menu: any = []
            props.menuData.map((item: any, index: any) => {
                if (selectedItem && selectedItem.Label) {
                    menu.push({ Label: item.Label, selected: selectedItem && selectedItem.Label == item.Label ? true : false, mdString: item.mdString })
                } else {
                    menu.push({ Label: item.Label, selected: index == 0 ? true : false, mdString: item.mdString })
                }
            })

            setRightMenus(menu)
            setAnchorEl(event.target as HTMLImageElement);
        } else if (props.container === "dashboard_chart") {
            let menu = [{ Label: "Show Data", Tooltip: "Show Chart Data" }];
            setRightMenus(menu);
            setAnchorEl(event.target as HTMLImageElement);
        }
        else if (props.container == "cabling_componet_deviceA" || props.container == "cabling_componet_cableB" || props.container == "cabling_componet_deviceC" || props.container == "mapping_FrontA" || props.container == "mapping_FrontB") {

            let menu: any = [];
            if (feature_data) {
                // let filteredData: any = feature_data.filter((item: any) => { return item.MenuID == location.state?.from?._Feature && item._Feature > RightMouseMenuRange.MIN && item.NodeType == "" && item.Label != "" });
                console.log('selectedNodeData', selectedNodeData)
                if (selectedNodeData && selectedNodeData.node) {
                    let feature: any = null
                    menu = getRightMouseMenuForCablingGridRow(feature);

                }
                console.log('menu', menu)

                if (menu?.length > 0) {
                    //remove duplicate recodes
                    const unique: any = [];
                    const uniqueMenu = menu.filter((element: any) => {
                        const isDuplicate = unique.includes(element.Label);

                        if (!isDuplicate) {
                            unique.push(element.Label);
                            return true;
                        }
                        return false;
                    });
                    console.log('uniqueMenu', uniqueMenu)
                    setRightMenus([...uniqueMenu]);

                    setAnchorEl(event.target as HTMLImageElement);
                }
                else {

                    setRightMenus([]);
                }
            }
            // setRightMenus(staticData)
            setAnchorEl(event.target as HTMLImageElement);
        }
        else if (props.container == "search_keyword") {
            let selectedMenu = selectedItem && selectedItem.Label ? selectedItem.Label : "AND"
            let menu = [{ Label: "AND", Tooltip: "AND", isCheckbox: true, checked: selectedMenu == "AND" ? true : false }, { Label: "OR", Tooltip: "OR", isCheckbox: true, checked: selectedMenu == "OR" ? true : false }];
            setRightMenus(menu);
            setAnchorEl(event.target as HTMLImageElement);
        } 
        else if (props.container == "data_grid" && props.selectedRow) {
            dispatch({
                type: "RT_MOUSE_ACTION_GRID",
                data: null
            });
            setAnchorEl(event.target as HTMLImageElement);
        }
        else if (props.container == "background_tasks" &&  feature_data && props.selectedRow) {
            let featureData = feature_data?.filter((item: any) => {
                return  (item?.NodeType?.includes(props?.selectedRow?.NodeType) || item.NodeType == '')
            })
            setRightMenus(featureData)
            setAnchorEl(event.target as HTMLImageElement);
        }
        else if (props.container == "open_session" &&feature_data && props.selectedRow) {
            console.log('props?.selectedRow', props?.selectedRow)
            let featureData = feature_data?.filter((item: any) => {
                return  (item?.NodeType?.includes(props?.selectedRow?.NodeType) || item.NodeType == '')
            })
            setRightMenus(featureData)
            setAnchorEl(event.target as HTMLImageElement);
        }
        else if (props.container == "background_window_service" &&  feature_data && props.selectedRow) {
            console.log('props background_window_service', props)
            let featureData = feature_data?.filter((item: any) => {
                return  (item?.NodeType?.includes(props?.selectedRow?.NodeType) || item.NodeType == '')
            })
            console.log('featureData background_window_service', featureData)
            setRightMenus(featureData)
            setAnchorEl(event.target as HTMLImageElement);
        } else if (props.NodeType && props?.rightMouseNodeType) {
            let featureData = feature_data?.filter((item: any) => {
                return  (item?.NodeType?.includes(props?.NodeType) || item.NodeType == '')
            })
            setRightMenus(featureData)
            setAnchorEl(event.target as HTMLImageElement);
        }
        else if (props.container === "datacenter_hierarchy_treeview" || props.container === "inventory_hierarchy_treeview" || props.container === "dci_left_tree") {
            if (feature_data && props.selectedNodeExplorer) {
                if (selectedNodeData && selectedNodeData.node) {

                    let menuData = getExplorerMenuData(props.selectedNodeExplorer.NodeEntID);
                    if (menuData?.length > 0) {
                        //remove duplicate recodes
                        const unique: any = [];
                        const uniqueMenu = menuData.filter((element: any) => {
                            const isDuplicate = unique.includes(element.Label);

                            if (!isDuplicate) {
                                unique.push(element.Label);
                                return true;
                            }
                            return false;
                        });
                        setRightMenus([...uniqueMenu]);

                        setAnchorEl(event.target as HTMLImageElement);
                    }
                    else {
                        setRightMenus([]);
                    }
                }
            }
        }
        else if (props.container == "fqa_property_tab") {
            setAnchorEl(event.target as HTMLImageElement);
            // if (selectedNodeData && selectedNodeData.node && selectedNodeData.node.Type == "DC") {
            //     let nodeName = selectedNodeData.node.NodeEntityname;
            //     getKebabMenu(nodeName, selectedNodeData.node.NodeType).then((resp: any) => {
            //         if (checkIsSuccess(resp)) {
            //             if (resp.data && resp.data.kebabJson?.length > 0) {
            //                 let kebabData = JSON.parse(resp.data.kebabJson);
            //                 let menuList: any = typeof kebabData == "object" && Object.keys(kebabData)?.length > 0 ? Object.values(kebabData)[0] : [];
            //                 setRightMenus([...menuList]);
            //                 setAnchorEl(event.target as HTMLImageElement);

            //             }
            //             else {
            //                 //Record not found
            //                 getErrorMessage("AP", "159").then((resp: any) => {
            //                     dispatch({
            //                         type: "ERROR",
            //                         message: resp.message,
            //                     });
            //                 });
            //             }
            //         }
            //         else {

            //             var message = getMessageFromArray(resp.errData);
            //             dispatch({
            //                 type: "ERROR",
            //                 message: message,
            //             });
            //         }
            //     })
            // }
            // else {

            //     //Please! Select node to view Property
            //     getErrorMessage("AP", "170").then((resp: any) => {
            //         dispatch({
            //             type: "ERROR",
            //             message: resp.message,
            //         });
            //     });
            // }
        }
        else if (props.container == "explorer_tree") {

            // dispatch({
            //     type: "RT_MOUSE_ACTION_TREE",
            //     data: null
            // });
            let menu: any = [];
            if (feature_data) {
                // let filteredData: any = feature_data.filter((item: any) => { return item.MenuID == location.state?.from?._Feature && item._Feature > RightMouseMenuRange.MIN && item.NodeType == "" && item.Label != "" });
                if (selectedNodeData && selectedNodeData.node) {
                    menu = getExplorerMenuData();

                }
                if (menu?.length > 0) {
                    //remove duplicate recodes
                    const unique: any = [];
                    const uniqueMenu = menu.filter((element: any) => {
                        const isDuplicate = unique.includes(element.Label);

                        if (!isDuplicate) {
                            unique.push(element.Label);
                            return true;
                        }
                        return false;
                    });
                    setExplorerRightMouse([...uniqueMenu]);

                    setAnchorEl(event.target as HTMLImageElement);
                }
                else {
                    setRightMenus([]);
                }
            }
        
        }
        else {

            //API will be called 
            if (feature_data) {
                var filteredData = feature_data.filter((item: any) => { return item._Feature > RightMouseMenuRange.MIN });
                if (filteredData?.length > 0) {
                    setRightMenus([...filteredData]);
                    setAnchorEl(event.target as HTMLImageElement);
                }
                else {
                    setRightMenus([]);

                }
            }
         
        }

    }

    useEffect(() => {
        setIsShowMenu(Boolean(anchorEl))
    }, [Boolean(anchorEl)])

    const redirectBaseOnSesssion = () => {
        let session_var = getStorageItem("session_variables");
        if (session_var) {
            let parsedData: any = JSON.parse(session_var);
            let data = parsedData.filter((element: any) => { return element.VariableContext == "Feature" && element.VariableName == "FeatureID" });
            let appqa_data = parsedData.filter((element: any) => { return element.VariableContext == "Feature" && element.VariableName == "AppQAID" });
            let feature: any = null;

            if (appqa_data?.length > 0 && appqa_data[0].SessionValue) {
                feature = feature_data.filter((ele: any) => { return ele._Feature == appqa_data[0].SessionValue });
            }
            else if (data?.length > 0 && data[0].SessionValue) {
                feature = feature_data.filter((ele: any) => { return ele._Feature == data[0].SessionValue });
            }
            else {
                data = parsedData.filter((element: any) => { return element.VariableContext == "Feature" && element.VariableName == "AppQAID" });
                if (data?.length > 0 && data[0].SessionValue) {
                    feature = feature_data.filter((ele: any) => { return ele._Feature == data[0].SessionValue });
                }
            }
            if (feature?.length > 0) {
            }
            else {
                let feature = feature_data.filter((ele: any) => { return ele._Feature == FEnums.AssetManagement });
                if (feature?.length > 0) {
                    let homePage: any = feature[0];
                    let jsonstring = [
                        { VariableContext: "Feature", VariableName: "FeatureID", SessionValue: homePage._Feature },
                        { VariableContext: "Feature", VariableName: "FeatureName", SessionValue: homePage.Label },
                        { VariableContext: "Feature", VariableName: "MenuName", SessionValue: "" },
                        { VariableContext: "Feature", VariableName: "AppQAID", SessionValue: "" },
                        { VariableContext: "Feature", VariableName: "AppQAName", SessionValue: "" }

                    ];
                    updateSessionVariable(jsonstring);

                }
            }

        }
    }
    const updateSessionVariable = (jsonString: any) => {
        updateSession(jsonString).then((resp: any) => {
            if (checkIsSuccess(resp)) {
                if (resp.data.jsonSessionOutput) {
                    let parsedData = handleAPIResponse(resp.data.jsonSessionOutput, "Dataset");

                    setStorageItem("session_variables", JSON.stringify(parsedData));
                    dispatch({
                        type: "SESSION_VARIABLES",
                        data: parsedData
                    });
                }

            }
        });
    }
    const handleRightMenuItemClick = (event: any, item: any,) => {
        console.log('event', event)
        console.log('item', item)
        if (item.Label === "More") {
            event.stopPropagation();
            event.preventDefault();
            setIsShowMoreMenu(true)

        } else {
            event.stopPropagation();
            event.preventDefault();
            dispatch({
                type: "INFORMATION",
                data: null,
            });
            if (props.container === "explorer_tree" || props.container === "datacenter_hierarchy_treeview" || props.container === "dci_left_tree"
                || props.container === "inventory_hierarchy_treeview"
            ) {

                dispatch({
                    type: "RT_MOUSE_ACTION_TREE",
                    data: null
                });
                setTimeout(() => {
                    if (item.Label == RightMouseMenuTreeNode.Refresh.toString()
                        || item.Label == RightMouseMenuTreeNode.OrderSubnodes.toString()
                        || item.Label == RightMouseMenuTreeNode.DonotOrderSubnodes.toString()
                        || item.Label == RightMouseMenuTreeNode.FindInInventory.toString()
                        || item.Label == RightMouseMenuTreeNode.Copy.toString()
                        || item.Label == RightMouseMenuTreeNode.Paste.toString()
                        || item.Label == RightMouseMenuTreeNode.Cut.toString()
                        || item.Label == RightMouseMenuTreeNode.Up.toString()
                        || item.Label == RightMouseMenuTreeNode.Down.toString()
                        || item.Label == RightMouseMenuTreeNode.unblockAll.toString()
                        || item.Label == RightMouseMenuTreeNode.BlockAll.toString()
                        || item.Label == RightMouseMenuTreeNode.NormalSlot.toString()
                        || item.Label == RightMouseMenuTreeNode.ReserveSlot.toString()
                        || item.Label == RightMouseMenuTreeNode.BlockSlot.toString()
                        || item.Label == RightMouseMenuTreeNode.NormalRU.toString()
                        || item.Label == RightMouseMenuTreeNode.ReserveRU.toString()
                        || item.Label == RightMouseMenuTreeNode.BlockRU.toString()
                        || item.Label == RightMouseMenuTreeNode.EmptyRack.toString()
                        || item.Label == RightMouseMenuTreeNode.EmptyDevice.toString()
                        || item.Label == RightMouseMenuTreeNode.Delete.toString()
                        || item.Label == RightMouseMenuTreeNode.BADPort.toString()
                        || item.Label == RightMouseMenuTreeNode.BlockPort.toString()
                        || item.Label == RightMouseMenuTreeNode.ReservePort.toString()
                        || item.Label == RightMouseMenuTreeNode.NormalPort.toString()
                        || item.Label == RightMouseMenuTreeNode.UpdateProperties.toString()
                        || item.Label == RightMouseMenuTreeNode.SetProperty.toString()
                        || item.Label == RightMouseMenuTreeNode.AddCabling.toString()
                        || item.Label == RightMouseMenuTreeNode.DeleteSiteDataCenter.toString()
                        || item.Label == RightMouseMenuTreeNode.EmptySiteDataCenter.toString()
                        || item.Label == RightMouseMenuTreeNode.EmptyRoom.toString()
                        || item.Label == RightMouseMenuTreeNode.EmptyFloor.toString()
                        || item.Label == RightMouseMenuTreeNode.EmptyBin.toString()
                        || item.Label == RightMouseMenuTreeNode.EditPowerCabling.toString()
                        || item.Label == RightMouseMenuTreeNode.EditNetworkCabling.toString()
                        || item.Label == RightMouseMenuTreeNode.ReviewNetworkCabling.toString()
                        || item.Label == RightMouseMenuTreeNode.ReviewPowerCabling.toString()
                        || item.Label == RightMouseMenuTreeNode.ImportDevices.toString()
                        || item.Label == RightMouseMenuTreeNode.ExportDevices.toString()
                        || item.Label == RightMouseMenuTreeNode.ImportPowerCables.toString()
                        || item.Label == RightMouseMenuTreeNode.ImportNetworkCables.toString()
                        || item.Label == RightMouseMenuTreeNode.ExportNetworkCables.toString()
                        || item.Label == RightMouseMenuTreeNode.ExportPowerCables.toString()
                        || item.Label == RightMouseMenuTreeNode.SwapDeviceViews.toString()
                        || item.Label == RightMouseMenuTreeNode.AddNewAuditSession.toString()
                        || item.Label == RightMouseMenuTreeNode.Add.toString()
                        || item.Label == RightMouseMenuTreeNode.Approve.toString()
                        || item.Label == RightMouseMenuTreeNode.Reject.toString()
                        || item.Label == RightMouseMenuTreeNode.Open.toString()
                        || item.Label == RightMouseMenuTreeNode.Close.toString()
                        || item.Label == RightMouseMenuTreeNode.Snapshot.toString()
                        || item.Label == RightMouseMenuTreeNode.AddRoom.toString()
                        || item.Label == RightMouseMenuTreeNode.AddFloor.toString()
                        || item.Label == RightMouseMenuTreeNode.AddBin.toString()
                        || item.Label == RightMouseMenuTreeNode.DeleteBin.toString()
                        || item.Label == RightMouseMenuTreeNode.AddNewSiteDataCenter.toString()
                        || item.Label == RightMouseMenuTreeNode.DeleteRoom.toString()
                        || item.Label == RightMouseMenuTreeNode.DeleteFloor.toString()
                        || item.Label == RightMouseMenuTreeNode.EmptyFloor.toString()
                        || item.Label == RightMouseMenuTreeNode.EmptyRoom.toString()
                        || item.Label == RightMouseMenuTreeNode.ImportAuditInventory.toString()
                        || item.Label == RightMouseMenuTreeNode.ExportAuditInventory.toString()
                        || item.Label == RightMouseMenuTreeNode.AddNewBusinessService.toString()
                        || item.Label == RightMouseMenuTreeNode.AddDCISegment.toString()
                        || item.Label == RightMouseMenuTreeNode.DeleteDCISegment.toString()
                        || item.Label == RightMouseMenuTreeNode.addDCI.toString()
                        || item.Label == RightMouseMenuTreeNode.DeleteDCI.toString()
                        || item.Label == RightMouseMenuTreeNode.MapPorts.toString()
                        || item.Label == RightMouseMenuTreeNode.Info.toString()
                        || item.Label == RightMouseMenuTreeNode.ImportDevicesToInventory.toString()
                        || item.Label == RightMouseMenuTreeNode.EditFloorLayout.toString()
                        || item.Label == RightMouseMenuTreeNode.Charts.toString()
                        || item.Label == RightMouseMenuTreeNode.CopyHyperlink.toString()
                    ) {

                        item.selectedNode = selectedNodeData;
                        dispatch({
                            type: "RT_MOUSE_ACTION_TREE",
                            data: item
                        });
                    }

                    setIsShowMenu(false);
                    setAnchorEl(null);
                    dispatch({ type: "USER_ACTION", data: item });
                }, 100);
            } 
          
             else if (props.instanceName == "homeicon") {
                dispatch({
                    type: "SPLITTER_WIDTH",
                    data: null
                });
                if (props.handleKebabMenuSelect) {
                    props.handleKebabMenuSelect();
                }
                if (item._Feature == HomePageSubMenus.Dashboards) {
                    let feature = feature_data.filter((ele: any) => { return ele._Feature == item._Feature });
                    if (feature?.length > 0) {
                        let homePage: any = feature[0];

                    }
                    // navigate("/dashboard", { replace: true, state: { from: dashboardPageObject } });
                }  else {
                    redirectBaseOnSesssion()
                }
                setIsShowMenu(false);
                setAnchorEl(null);
            } else if (props.container === "dashboard_chart") {

                item.selectedChartData = props.chartData;
                dispatch({
                    type: "RT_MOUSE_ACTION_TREE",
                    data: item
                });
            }
            else {
                if (props.container == "background_tasks") {
                    if (props.handleRightMouseAction) {
                        props.handleRightMouseAction(item, props?.selectedRow);
                    }
                }
                else if (props.container == "infobar") {
                    if (props.handleSelectionChange) {
                        setSelectedItem({ ...item });
                        props.handleSelectionChange(item);
                    }
                }
                else if (props.container == "helpTip") {
                    if (props.handleSelectionChange) {
                        let menu: any = []
                        rightMenus.map((element: any) => {
                            if (item.Label === element.Label) {
                                element.selected = true
                            } else {
                                element.selected = false
                            }
                            menu.push(element)
                        })
                        setRightMenus(menu)
                        setSelectedItem({ ...item });
                        props.handleSelectionChange(item);

                    }
                }
                else {
                    dispatch({ type: "USER_ACTION", data: item });
                    if (selectedItem?.Label == item.Label) {
                        let emptyObj: any = {};
                        setSelectedItem({ ...emptyObj });
                        if (props.container == "entity_mfg_eqtype_tree") {
                            dispatch({
                                type: "RIGHT_MOUSE_STATIC_MENU",
                                value: null
                            });
                            setIsShowMenu(false);
                            setAnchorEl(null);
                        }
                        else {
                            if (rightMenus?.length > 0 && props.container == "fqa_property_tab") {
                                setSelectedItem(item)

                                let isDefaultFound = rightMenus.filter((item: any) => { return item.DefaultQA == true });
                                if (props.isProperyPane) {
                                    dispatch({
                                        type: "RIGHT_MOUSE_SELECTED_MENU_FOR_PROP_PANE",
                                        value: null //isDefaultFound?.length > 0 ? isDefaultFound[0] : rightMenus[0]
                                    });
                                    setSelectedItem(null);
                                } else {

                                    dispatch({
                                        type: "RIGHT_MOUSE_SELECTED_MENU",
                                        value: isDefaultFound?.length > 0 ? isDefaultFound[0] : rightMenus[0]
                                    });
                                    setSelectedItem({ ...isDefaultFound?.length > 0 ? isDefaultFound[0] : rightMenus[0] });
                                }
                            }
                            else {
                                if (props.isProperyPane) {
                                    dispatch({
                                        type: "RIGHT_MOUSE_SELECTED_MENU_FOR_PROP_PANE",
                                        value: null
                                    });
                                } else {

                                    dispatch({
                                        type: "RIGHT_MOUSE_SELECTED_MENU",
                                        value: null
                                    });
                                }
                            }


                            dispatch({
                                type: "QA_CLICK_VAL",
                                value: false
                            });
                            if (props.container != "search_keyword") {
                                setIsShowMenu(false);
                                setAnchorEl(null);
                            }
                        }
                    }
                    else {
                        setSelectedItem({ ...item });
                        if (props.container == "entity_mfg_eqtype_tree" && item) {
                            item.selectedNode = selectedNodeData;
                            dispatch({
                                type: "RIGHT_MOUSE_STATIC_MENU",
                                value: item
                            });
                            setIsShowMenu(false);
                            setAnchorEl(null);
                        }
                        else {

                            if (item) {
                                if (props.isProperyPane) {
                                    dispatch({
                                        type: "RIGHT_MOUSE_SELECTED_MENU_FOR_PROP_PANE",
                                        value: item
                                    });
                                } else {
                                    dispatch({
                                        type: "RIGHT_MOUSE_SELECTED_MENU",
                                        value: item
                                    })
                                }
                            }
                            if (item.label === "Notes") {
                                dispatch({
                                    type: "QA_CLICK_VAL",
                                    value: true
                                })
                            } else {
                                dispatch({
                                    type: "QA_CLICK_VAL",
                                    value: false
                                })
                            }

                            if (props.container != "search_keyword") {
                                setIsShowMenu(false);
                                setAnchorEl(null);
                            }

                        }
                    }
                }
            }
        }


    }

    const handleCopyClick = React.useCallback(() => {
        setIsShowMenu(false);
        setAnchorEl(null);
        dispatch({
            type: "SUCCESS",
            message: "Copied successfully",
        });
    }, [])

    const handleCheck = (event: any, item: any) => {

        if (props.container == "search_keyword") {
            rightMenus.map((element: any) => {
                if (item.Label == element.Label) {
                    element.checked = true;
                }
                else {
                    element.checked = false;
                }
            });
            setSelectedItem(item);
            setRightMenus([...rightMenus]);
            if (props.handleConditionChange) {
                props.handleConditionChange(item);
            }
        }
    }
    useEffect(() => {
        if (explorerRightMouse.length > 0 && props.container == "explorer_tree") {
            console.log('explorerRightMouse useEffect', explorerRightMouse)
            let rightWithOutMore: any = []
            let moreMenu: any = []
            explorerRightMouse.map((item: any) => {
                if (item && item?.NodeType && item?.NodeType?.includes("Separator")) {
                    moreMenu.push(item)
                } else {
                    rightWithOutMore.push(item)
                }
            })
            // if (moreMenu.length > 0) {
            //     rightWithOutMore.push({ Label: "More" })
            // }
            console.log('rightWithOutMore', rightWithOutMore)
            setRightMenus(rightWithOutMore)
            console.log('moreMenu', moreMenu)
            setRightMoreMenus(moreMenu)
        }
    }, [explorerRightMouse])

    useEffect(() => {
        if (isShowMoreMenu) {
            let div: any = document.querySelector('.nz-popover-three-dots-menu-div .MuiPopover-paper')
            let moreMenuDiv: any = document.querySelector('.nz-popover-three-dots-menu-div .MuiPopover-paper .nz-nav-li-button-more')
            let moreDiv: any = document.querySelector('.nz-more-popover')
            // Check if the element is found
            if (moreMenuDiv) {
                // Get the position
                let rect = moreMenuDiv.getBoundingClientRect();
                let positionFromTop = rect.bottom + window.scrollY;

                console.log('Position from top of window:', positionFromTop);
            } else {
                console.error('Element not found');
            }
            if (moreDiv && moreMenuDiv) {
                let rect = moreMenuDiv.getBoundingClientRect();
                let positionFromTop = rect.top + window.scrollY;
                moreDiv.style.left = (div.offsetLeft + div.offsetWidth) + "px";
               

                let moreRect = moreDiv.getBoundingClientRect();

                console.log('heightDif :',  rect, moreDiv.getBoundingClientRect(), window.scrollY);



            }
        }
    }, [isShowMoreMenu])
    return (
        <>
            {isShowKebabIcon && <span title="Click to use commands" className={props.container == "homeicon" ? "nz-homeicon-span" : ""} style={{ display: `${props.container == "infobar" ? "block" : "flex"}` }}>
                <>
                    {

                        props.instanceName == "homeicon" ?
                            <img
                                title={`${props.currentSiteName} Data Center`}
                                className="nz-logo-image"
                                src={props.licenseeIconUrl ? props.licenseeIconUrl : getImagePath("fevi_80x80.png", "Features")}
                                onClick={(e: any) => handleClick(e)}
                            /> :
                            <div className="nz-img-three-dots-rtm">
                                <NzIcon onClick={(e: any) => handleClick(e)} iconName={"Kebab_128x128.svg"} folderName="misc" />
                            </div>
                        // <ReactSVG className="nz-img-three-dots-rtm" onClick={(e: any) => handleClick(e)} src={getImagePath("Kebab_128x128.svg", "misc")} />
                    }

                    {props.instanceName == "homeicon" && <span title={props.currentSiteName}>{props.currentSiteName}</span>}
                </>
            </span>}
            {rightMenus && rightMenus.length > 0 && isShowMenu &&
                <Popover
                    open={isShowMenu}

                    className="nz-popover-three-dots-menu-div"
                    anchorReference="anchorPosition"
                    anchorPosition={{ top: mouseY, left: mouseX }}
                    anchorEl={anchorEl}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'center',
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'left',
                    }}
                    onClick={() => {
                        setAnchorEl(null);
                        setIsShowMoreMenu(false);
                        setIsShowMenu(false);
                    }}
                >
                    <Box className='nz-popover-menu-box'

                        onMouseLeave={() => {
                            setAnchorEl(null);
                            setIsShowMoreMenu(false);
                            setIsShowMenu(false);
                        }}

                    >
                        {/* setAnchorEl(null); setIsShowMenu(false) */}
                        <List className='nz-nav-ul-main nz-rt-menu nz-property-tab' >
                            {
                                rightMenus.map((item: any, index: number) => {
                                    // console.log('item selectedItemselectedItem:', item, selectedItem);
                                    if (props.container == "fqa_property_tab") {
                                        return <ListItemButton key={item.Label + "_" + index.toString()}
                                            className='nz-nav-li-button'
                                            selected={(selectedItem?.Label && selectedItem?.Label == item.Label)}
                                            title={item.Tooltip ? item.Tooltip : item.Description ? item.Description : ""} onClick={(event: any) => handleRightMenuItemClick(event, item)}>
                                            {/* nz-rt-li-menu   This will be used to show menu like feature Menu */}
                                            <ListItemIcon className='nz-nav-li-icon'>
                                                <NzIcon iconName={item?.Label?.replace(/[^0-9A-Za-z_-]/g, '') + "_128x128.svg"} folderName="Features" />
                                            </ListItemIcon>
                                            <ListItemText className="nz-rt-menu-text" primary={item.Label} style={{ opacity: 1 }} />
                                        </ListItemButton>
                                    }
                                    else {
                                        return <ListItem key={index} title={item.Tooltip} disablePadding>
                                            {(item?.Label?.toLowerCase() != "copy" || props.container == "explorer_tree") &&
                                                <ListItemButton className={`nz-nav-li-button ${item.Label == "More" && "nz-nav-li-button-more"}`}
                                                    selected={(props.container == "search_keyword" && item.checked) || (props.container == "infobar" && item.selected) || (props.container == "helpTip" && item.selected)}
                                                    onClick={(event: any) => handleRightMenuItemClick(event, item)}>
                                                    {props.container != "search_keyword" && <ListItemIcon className="nz-nav-li-icon">
                                                        {/* <img className="nz-feature-icon" src={getImagePath(item.Label.replace(/[^0-9A-Za-z_-]/g, '') + "_128x128.svg", "Features")} /> */}
                                                        <ReactSVG className={`nz-feature-icon ${item.iconName || item.Label == RightMouseMenuTreeNode.Info ? "nz-icon-without-stroke" : ""}`}
                                                            fallback={() => { return <ReactSVG className="nz-feature-icon" src={getImagePath("Default_128x128.svg", "misc")} /> }}
                                                            src={getImagePath((item.iconName ? item.iconName : item?.Label?.replace(/[^0-9A-Za-z_-]/g, '') + "_128x128.svg"), item.Label == "More" ? "misc" : "Features")} />
                                                    </ListItemIcon>}
                                                    {props.container == "search_keyword" && <Checkbox sx={{ '& .MuiSvgIcon-root': { fontSize: 20 } }} checked={item.checked} className="ng-chekbox-user nz-rt-menu-checkbox" name={item.Label} onChangeCapture={(e) => { handleCheck(e, item) }} />}
                                                    <ListItemText primary={item?.Label} />
                                                    {item.Label == "More" && (<ListItemIcon className="nz-nav-li-icon nz-arrow-right-mouse">
                                                        {/* <ReactSVG className="nz-misc-icon"
                                                            fallback={() => { return <ReactSVG className="nz-misc-icon" src={getImagePath("Default_128x128.svg", "misc")} /> }}
                                                            src={getImagePath("ArrowForwardIos.svg", "misc")} /> */}
                                                        <NzIcon iconName={"ArrowForwardIos.svg"} folderName="misc" />
                                                    </ListItemIcon>)}
                                                </ListItemButton>
                                            }
                                        </ListItem>
                                    }
                                })
                            }

                            {rightMoreMenus && rightMoreMenus.length > 0 &&
                                // isShowMoreMenu &&
                                // <Popover
                                //     // open={isShowMoreMenu}
                                //     // className="nz-popover-three-dots-menu-div"
                                //     // anchorReference="anchorPosition"
                                //     // anchorPosition={{ top: mouseMoreY, left: mouseMoreX }}
                                //     // anchorEl={anchorElForMore}
                                //     // anchorOrigin={{
                                //     //     vertical: 'bottom',
                                //     //     horizontal: 'center',
                                //     // }}
                                //     // transformOrigin={{
                                //     //     vertical: 'top',
                                //     //     horizontal: 'left',
                                //     // }}

                                // >
                                // < Box className='nz-popover-more-menu-box nz-more-popover'
                                // onMouseLeave={() => {
                                //     setAnchorEl(null);
                                //     setAnchorElForMore(null); setIsShowMoreMenu(false); setIsShowMenu(false)
                                // }}
                                // >
                                <>
                                    <hr className='nz-rtm-hr-separator' />
                                    <List>
                                        {rightMoreMenus.map((item: any, index: any) => {
                                            return <ListItem key={index} title={item.Tooltip} disablePadding>
                                                {(item.Label.toLowerCase() != "copy" || props.container == "explorer_tree") &&
                                                    <ListItemButton className="nz-nav-li-button"
                                                        onClick={(event: any) => handleRightMenuItemClick(event, item)}>
                                                        {props.container != "search_keyword" && <ListItemIcon className="nz-nav-li-icon">
                                                            {/* <img className="nz-feature-icon" src={getImagePath(item.Label.replace(/[^0-9A-Za-z_-]/g, '') + "_128x128.svg", "Features")} /> */}
                                                            {/* <ReactSVG className="nz-feature-icon"
                                                            fallback={() => { return <ReactSVG className="nz-feature-icon" src={getImagePath("Default_128x128.svg", "misc")} /> }}
                                                            src={getImagePath(item?.Label?.replace(/[^0-9A-Za-z_-]/g, '') + "_128x128.svg", "Features")} /> */}
                                                            <NzIcon iconName={item?.Label?.replace(/[^0-9A-Za-z_-]/g, '') + "_128x128.svg"} folderName="Features" />
                                                        </ListItemIcon>}
                                                        <ListItemText primary={item.Label} />
                                                    </ListItemButton>
                                                }
                                            </ListItem >
                                        })}
                                    </List>
                                </>
                                // </Box>
                                // </Popover>
                            }
                        </List>


                    </Box>

                </Popover >
            }
        </>
    )
}
