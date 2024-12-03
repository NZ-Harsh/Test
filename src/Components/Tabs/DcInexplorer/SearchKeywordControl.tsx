import { Autocomplete, Box, TextField } from "@mui/material";
import React, { ChangeEvent, forwardRef, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { checkIsSuccess, fnGetRefList, getImagePath, setStorageItem } from "../../../Common/Common";
import {getMessageFromArray, handleAPIResponse, processStringToCompare } from "../../../Common/Common";
import { ReactSVG } from "react-svg";
import { updateSession } from "../../../redux/reducers/sessionService";
import { components, OptionProps } from 'react-select';
import { NzIcon } from "../../../Common/NzIcon";
import Treeview from "../../TreeView/TreeView";
import ComboboxControl from "../../../Common/ComboboxControl";
import { ManagementMakeTreeData } from "../../../Common/Common";
import { getSiteRooms } from "../../../redux/action/dcservice";
import { RightMouseMenu } from "../../../Common/RightMouseMenu";
import '../../../searchcontrol.css'
const style = {
    '& .MuiOutlinedInput-root': {
        '& fieldset': {
            borderColor: 'white',
        },
        '&:hover fieldset': {
            borderColor: 'white',
        },
        '&.Mui-focused fieldset': {
            border: '1',
            borderColor: 'white',

            
        },
    }
}
const useDebounce = (value: any, delay = 500) => {
    const [debouncedValue, setDebouncedValue] = useState();
    const timer: any = useRef(null);
    useEffect(() => {
        timer.current = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => clearTimeout(timer.current);
    }, [value, delay]);

    return debouncedValue;
};

const DropdownIndicator = (
    props: any
) => {
    return (
        <components.DropdownIndicator {...props} innerProps={{
            ...props.innerProps, onMouseDown: e => {
                // e.stopPropagation()
                // e.preventDefault()
            }
        }}>
            <div className="d-flex align-items-center">
                <ReactSVG className={"nz-misc-icon-search-keyword"}
                    fallback={() => { return <ReactSVG className="nz-misc-icon" src={getImagePath("Default_128x128.svg", "misc")} /> }}
                    src={getImagePath("ArrowDropDown.svg", "misc")} />
                {/* <img onClick={handleCopyClick} className="nz-status-bar-down-icon" src={getImagePath("Copy_128x128.png", "Misc")} /> */}
            </div>
        </components.DropdownIndicator >
    );
};

const Option = (props: OptionProps<any>) => {
    //props.isFocused = false;
    return (
        <components.Option {...props} className="nz-select2-option" />
    );
};

export default forwardRef((props: any, ref: any) => {
    const [searchQueryPara, setSearchQueryPara] = useState<any>(null);
    const [value, setValue] = useState<any>({});
    const dispatch = useDispatch();
    const [searchHistory, setSearchHistory] = useState<any[]>([]);
    const [apiData, setapiData] = useState<any[]>([])
    const [checkEnd, setcheckEnd] = useState(true)
    const [checkOr, setCheckOr] = useState(false)
    const [conditionAnd, setConditionAnd] = useState(true);
    const debounceData = useDebounce(value)
    const [openPopupFilter, setOpenPopupFilter] = useState(false)
    const [treeData, setTreeData] = useState<any[]>([]);
    const [expandedNodes, setExpandedkey] = useState<any>([]);
    const [selectedNode, setselectedNode] = useState<any>([]);
    const [makeAllCheck, setMakeAllcheck] = useState<any[]>([]);
    const [refTreeRes, setRefTreeRes] = useState<any>(null)
    const [TenantVal, setTenantVal] = useState("");
    const [workspace, setWorkspace] = useState("")
    const [teamVal, setteamVal] = useState("")
    const [deviceFilterVal, setDeviceFilterVal] = useState("")
    const [tagFilterVal, setTagFilterVal] = useState("")
    const [labelFilterVal, setLabelFilterVal] = useState("")
    const [FloorFilterVal, setFloorFilterVal] = useState("")
    const [colorFilterVal, setColorFilterVal] = useState("")
    const [customFilterVal, setCustomFilterVal] = useState("")
    const [isDirtyForm, setIsDirtyForm] = useState(false)
    const [checknodeKey, setChecknodekey] = useState<any>(null);
    const [workspaceList, setWorkspaceList] = useState<any>([]);
    const [tenantList, setTenantList] = useState<any>([]);
    const [userTeamList, setUserTeamList] = useState<any>([]);
    const [deviceFilterList, setDeviceFilterList] = useState<any>([]);
    const [customFilterList, setCustomFilterList] = useState<any>([]);
    const [tagFilterList, setTagFilterList] = useState<any>([]);
    const [filterComboFilterList, setFilterComboFilterList] = useState<any>([]);
    const [colorFilterList, setColorFilterList] = useState<any>([]);
    const [labelFilterList, setLabelFilterList] = useState<any>([]);
    const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(false);
    const [spliterWidth, setSplitterWidth] = useState<any>(null);
    const [conditionSelected, setConditionSelected] = useState<any>(null);
    const [isSearchDirty, setIsSearchDirty] = useState<boolean>(false)
    const [showFloorPaneWzard, setShowFloorPaneWzard] = useState<boolean>(false)
    const splitter_width = useSelector(
        (state: any) => state.routeReducer
    )?.splitter_width;
   
   
    useEffect(() => {
        if (checknodeKey) {
            setIsDirtyForm(true)
        }
    }, [checknodeKey]);

    useEffect(() => {
        if (props.searchQueryPara) {
            setSearchQueryPara(props.searchQueryPara);
        }
    }, [props.searchQueryPara])
useEffect(() =>{
    console.log('prop searchControl',props)

console.log('tenant',tenantList)
console.log('filter',customFilterList)
console.log('team',userTeamList)

},[tenantList,customFilterList,userTeamList])

    useEffect(() => {
        if (!props.notApplyFilterFormOpne) {
            // if (props?.filterFormOpne) {
            if (openPopupFilter && props.treeIndexNumber != undefined) {
                document.querySelector(`.nz-exp-treeview .rc-tree.nz-tree-common-number-${props.treeIndexNumber}`)?.classList.add("nz-hide-treeview");
            } else {
                // document.querySelector('.nz-exp-treeview .rc-tree.ng-treeview-assest-mgt.nz-setting-tree.rc-tree-show-line')?.classList.remove("nz-hide-treeview");
                document.querySelector(`.nz-exp-treeview .rc-tree.nz-tree-common-number-${props.treeIndexNumber}`)?.classList.remove("nz-hide-treeview");
            }
            // props?.filterFormOpne(openPopupFilter)
            // }
        }
         const DELIMITER = {
            separator: ";"
        }
        if (openPopupFilter) {
           
                let refTableNames = ["refTenants", "refTeam", "refDeviceFilter", "refCustomFilter", "refTags"];
                fillRefListData(refTableNames.join(DELIMITER.separator), "filters");
            
        }
    }, [openPopupFilter, !openPopupFilter])
 
    
    useEffect(() => {
        if (props?.featureId) {
            setOpenPopupFilter(false)
        }
    }, [props?.featureId])

  
    useEffect(() => {
        if (props.treeData) {
            setTreeData(props.treeData)
        }
    }, [props.treeData])
    let returnData = false
    let foundNodeDetail: any;
    let keyId: any = []
    let parentNodes: any = []
    const checkChildData = (children: any, entID: any, element?: any) => {

        children.forEach((item: any, index: number) => {

            if (item.key === entID) {
                parentNodes.push(element)
                returnData = true
                foundNodeDetail = item
                return;
            }
            else {

                if (item.children) {
                    checkChildData(item.children, entID, item)
                } else {
                    returnData = false
                }
            }
        })
        return { returnData, foundNodeDetail }
    }

    const CheckCurrData = (entID: any) => {
        let checkStatus = false
        if (treeData.length) {
            treeData.forEach((item: any, index: number) => {
                if (item.key === entID) {
                    checkStatus = true
                    return true
                } else {
                    if (item.children) {
                        if (!checkStatus) {

                            keyId.push(item.key)
                            const { returnData, foundNodeDetail } = checkChildData(item.children, entID, item)

                            checkStatus = returnData
                        }
                        return;
                    } else {
                        return false
                    }
                }

            })
            return { checkStatus, foundNodeDetail }
        }
    }
    const getParentNodes = () => {
        let nodeDetais = parentNodes[0]
        let nodelist = []
        if (parentNodes.length > 0) {
            do {

                var res = checkChildData(treeData, nodeDetais.key, nodeDetais)
                if (nodeDetais.type != "root") {
                    nodelist.push(parentNodes[0])
                    nodeDetais = parentNodes[0]
                }

                parentNodes = []
            } while (res.foundNodeDetail?.type != "root");
        }
        return nodelist
    }
   
   
    useEffect(() => {
        if (props.apiData) {
            setapiData(props.apiData)
        }
    }, [props.apiData])
    const handleSearchButtonClick = async (source: string) => {
        if (source === 'filter') {
            setOpenPopupFilter(true)
            if (!isDirtyForm ) {
                await getTreeDataForFilter();
            }
            if (openPopupFilter && isDirtyForm) {
                let SessionValue: any = null;
                if (props.localSession) {
                    SessionValue = props.localSession;
                }
                else {
                    SessionValue = window.sessionStorage.getItem("session_variables");
                    SessionValue = JSON.parse(SessionValue)
                }
                let array: any = []
                SessionValue?.filter((obj: any) => {
                    if (obj.VariableName === "TenantName") {
                        obj.SessionValue = TenantVal ? TenantVal : ''
                    }
                    if (obj.VariableName === "TeamName") {
                        obj.SessionValue = teamVal ? teamVal : ''
                    }
                    if (obj.VariableName === "DeviceFilterName") {
                        obj.SessionValue = deviceFilterVal ? deviceFilterVal : ''
                    }
                    if (obj.VariableName === "CustomFilterName") {
                        obj.SessionValue = customFilterVal ? customFilterVal : ''
                    }
                    if (checknodeKey) {
                        if (obj.VariableName === 'SiteID') {
                            obj.SessionValue = checknodeKey.multiNode ? (checknodeKey.SiteID ? checknodeKey.SiteID : "") : (checknodeKey?.NodeEntID ? checknodeKey?.NodeEntID : '')
                        }
                        if (obj.VariableName === 'SiteName') {
                            obj.SessionValue = checknodeKey.multiNode ? (checknodeKey.SiteName ? checknodeKey.SiteName : "") : (checknodeKey?.Name ? checknodeKey?.Name : "")
                        }
                        if (obj.VariableName === 'RoomName') {
                            obj.SessionValue = checknodeKey.multiNode ? (checknodeKey.RoomName ? checknodeKey.RoomName : "") : ""
                        }
                        if (obj.VariableName === 'RoomID') {
                            obj.SessionValue = checknodeKey.multiNode ? (checknodeKey.RoomID ? checknodeKey.RoomID : "") : ""
                        }
                    }
                    if (obj.VariableName === "TenantName" || obj.VariableName === "TeamName" || obj.VariableName === "DeviceFilterName"
                        || obj.VariableName === "CustomFilterName" || obj.VariableName === 'SiteID' || obj.VariableName === 'SiteName'
                        || obj.VariableName === 'RoomName' || obj.VariableName === 'RoomID') {

                        array.push({
                            VariableContext: obj.VariableContext,
                            VariableName: obj.VariableName,
                            SessionValue: obj.SessionValue
                        });
                    }

                })
                updateSession(array).then((resp: any) => {
                    if (checkIsSuccess(resp)) {
                        if (resp.data.jsonSessionOutput) {
                            let parsedData = handleAPIResponse(resp.data.jsonSessionOutput, "Dataset");

                            setStorageItem("session_variables", JSON.stringify(parsedData));
                        }
                        setOpenPopupFilter(false)
                        props.reloadTree()
                        setIsDirtyForm(false);
                    } else {
                        var message = getMessageFromArray(resp.errData);
                       console.log(message)
                    }
                })
            }

            if (openPopupFilter && !isDirtyForm) {
                setOpenPopupFilter(false)

            } else {
                // const data: any = document.querySelectorAll(`.layout-pane`)
                // if (data) {
                    // let width = data[0]?.offsetWidth
                    // setSplitterWidth(width)
                // }
                setOpenPopupFilter(true)
            }
        }
       
        
        else if (source == "lens") {
            let payload: object = {
                isSearch: true,
                keyword: value,
                groupName: "",
                isLocalSearch: true
            }

            // let expanded = TwoLevalDataCheck(value)
            props.handleParentFun(payload)
        }
        if (source == "lens" && props.searchFor === "asset_management") {
            let condition = conditionSelected && conditionSelected.Label ? conditionSelected.Label : "AND";
            let payload: object = {
                isSearch: true,
                keyword: value,
                searchAllWord: condition == "AND" ? true : false
            }
            props.handleParentFun(payload)
        }
        else if (props.searchFor === "user" || props.searchFor === "role") {


            let Entid = "ce1490ee-75f4-4781-ab68-77dc4d4832bc" //api 
            let data: any = CheckCurrData(Entid)
            if (data.checkStatus) {
                let nodelist: any = getParentNodes()
                let expandedkey: any = []
                nodelist.map((item: any) => {
                    if (item.type != 'root')
                        expandedkey.push(item.key)
                })

                if (data?.foundNodeDetail) {
                    props.handleParentFun(data?.foundNodeDetail?.key, expandedkey)

                }
            }
        }

        //call API to get EntId based on keyword search
       

    }

    const handleChange = (event: React.SyntheticEvent, value: any, reason: any) => {

        if (reason === 'clear') {
            setIsSearchDirty(false)
            setSearchQueryPara("");
            // dropSessionKeywordTable()
            if (value === "") {
                setValue(value);

                    props.handleParentFun({ resetControl: true })
                
            }
            //call API ClearSearchContext 
         
        }
        else {
            setIsSearchDirty(true)
            setSearchQueryPara(value);
            setValue(value);
        }
    }
    const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);

    const handleClickpop = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClosepop = () => {
        setAnchorEl(null);
    };

    // let openPop = Boolean(anchorEl);
    const [openPop, setopenPop] = useState(false)
    useEffect(() => {
        setopenPop(Boolean(anchorEl))

    }, [Boolean(anchorEl)])
    function handelAnd(event: any) {
        setcheckEnd(true)
        setCheckOr(false)
    }
    function handelOr(event: any) {
        setCheckOr(true)
        setcheckEnd(false)
    }
    const handleConditionChange = (selectedVal: any) => {
        setConditionSelected(selectedVal);
    }
    let obj: any = [];
    const fitlerTreeData = async (node: any, EntId: any, parentEntID?: any, newTreeData?: any) => {
        for (let index = 0; index < node.length; index++) {
            const element = node[index];
            if (element.NodeEntID === EntId) {
                obj.push(element.key)
                if (element.parentEntID) {
                    await fitlerTreeData(newTreeData, element.parentEntID, element.parentEntID, newTreeData)
                }
            } else {
                await fitlerTreeData(element.children, EntId, element.parentEntID, newTreeData)
            }

        }

        return obj
    }

    let objDetails: any = []
    let checkKey: any = []
    let singleObj: any = {}
    const getPrenetDetails = async (node: any, EntId: any, parentEntID?: any) => {
        for (let index = 0; index < node.length; index++) {
            const element = node[index];
            if (element.NodeEntID == EntId) {
                let name = `${element.treetype}Name`
                let id = `${element.treetype}ID`
                singleObj[name] = element.Name
                singleObj[id] = element.NodeEntID
                singleObj['multiNode'] = true
                objDetails.push({
                    [name]: element.Name,
                    'id': element.NodeEntID,
                    'key': element.key
                })
                checkKey.push(element.key)
                if (element.parentEntID != '') {
                    await getPrenetDetails(treeData, element.parentEntID, element.parentEntID)
                }
            } else {
                await getPrenetDetails(element.children, EntId, element.parentEntID)
            }

        }
        return { objDetails, checkKey, singleObj }
    }

    const getTreeDataForFilter = async () => {
        await getSiteRooms().then(async (resp: any) => {
            if (checkIsSuccess(resp)) {
                if (resp.data && resp.data.hierarchyJson) {
                    let refData = JSON.parse(resp.data.hierarchyJson);
                    await ManagementMakeTreeData(refData,'269', undefined).then(async (res: any) => {
                        if (res) {
                            let { treeData, expadedKey, keyIdSingleNode, countSteoNo, allkey } = res
                            await setTreeData([...treeData])
                            // await setExpandedkey([...allkey])
                            await setMakeAllcheck([allkey[0]])
                            let SessionValue: any = window.sessionStorage.getItem("session_variables");
                            SessionValue = JSON.parse(SessionValue)
                            let id: any = ''
                            let check = false
                            SessionValue?.filter((obj: any) => {
                                if (obj.VariableName === "RoomID") {
                                    if (obj.SessionValue != '') {
                                        check = true
                                        id = obj.SessionValue
                                    }
                                }
                                if (obj.VariableName === "SiteID" && check == false) {
                                    id = obj.SessionValue
                                }
                            })

                            let data = await fitlerTreeData(treeData, id, "", treeData)
                            setMakeAllcheck([...data])
                        }
                        // setTreeData(testTreeDATA)
                    })
                    setRefTreeRes({ ...refData })
                }
            }

        });
    }


    useEffect(() => {
        if (isDirtyForm == false) {
            clearbtnClick();
        }
    }, [isDirtyForm])

    const clearbtnClick = () => {
        setTenantVal('')
        setCustomFilterVal('')
        setDeviceFilterVal('')
        setteamVal('')

    }

    const treeViewCheck = async (info: any) => {
        if (info?.node?.treetype == "Site") {
            if (info.checked === false) {
                setMakeAllcheck([])
                setChecknodekey(null)

            } else {
                setMakeAllcheck([info.node.key])
                setChecknodekey(info.node)
            }
        } else {
            let data = await getPrenetDetails(treeData, info.node.NodeEntID)
            setMakeAllcheck([...data.checkKey])
            setChecknodekey(data.singleObj)
        }
    }

   
    const fillRefListData = (refTableNames: any, callFor: any) => {
        fnGetRefList(refTableNames).then((resp: any) => {
            if (resp && resp?.length > 0) {
                let data = resp
                if (data.length > 0) {
                    if (callFor == "workspace") {
                        // setWorkspaceList([...data]);
                        // if (data?.length > 0 && (data[0].Value != undefined && data[0].Value != "Undefined")) {
                        // setWorkspace(data[0].Value);
                        // }

                        // var stringArray = data.map((ele: any) => { return ele.Value });
                        if (data?.length > 0 && (data[0].Value != undefined && data[0].Value != "Undefined")) {
                            let listOfWorkspace: any = [];
                            data.map((ele: any) => {
                                listOfWorkspace.push({ label: ele.Value, value: ele.Value });
                            })
                            setWorkspaceList([...listOfWorkspace])
                            setIsWorkspaceOpen(true);

                        }
                    }
                    else if (callFor == "filters") {
                        let filterData = data.filter((element: any) => { return processStringToCompare(element.Name,"refTenants") });
                        if (filterData?.length > 0 && filterData[0].Value != undefined && filterData[0].Value != "Undefined") {
                            setTenantList(filterData);
                        }
                        filterData = data.filter((element: any) => { return processStringToCompare(element.Name,"refTeam") });
                        if (filterData?.length > 0 && filterData[0].Value != undefined && filterData[0].Value != "Undefined") {
                            setUserTeamList(filterData);
                        }
                        filterData = data.filter((element: any) => { return processStringToCompare(element.Name,"refDeviceFilter") });
                        if (filterData?.length > 0 && filterData[0].Value != undefined && filterData[0].Value != "Undefined") {
                            setDeviceFilterList(filterData);
                        }
                        filterData = data.filter((element: any) => { return processStringToCompare(element.Name,"refCustomFilter") });
                        if (filterData?.length > 0 && filterData[0].Value != undefined && filterData[0].Value != "Undefined") {
                            setCustomFilterList(filterData);
                        }
                        filterData = data.filter((element: any) => { return processStringToCompare(element.Name,"refTags") });
                        if (filterData?.length > 0 && filterData[0].Value != undefined && filterData[0].Value != "Undefined") {
                            setTagFilterList(filterData);
                        }
                        filterData = data.filter((element: any) => { return processStringToCompare(element.Name,"refFloorLayoutCriteria") });
                        if (filterData?.length > 0 && filterData[0].Value != undefined && filterData[0].Value != "Undefined") {
                            setFilterComboFilterList(filterData);
                        }
                        filterData = data.filter((element: any) => { return processStringToCompare(element.Name,"refColor") });
                        if (filterData?.length > 0 && filterData[0].Value != undefined && filterData[0].Value != "Undefined") {
                            setColorFilterList(filterData);
                        }
                        filterData = data.filter((element: any) => { return processStringToCompare(element.Name,"refFloorLayoutLabel") });
                        if (filterData?.length > 0 && filterData[0].Value != undefined && filterData[0].Value != "Undefined") {
                            setLabelFilterList(filterData);
                        }
                    }
                }
            }
        })
    }

    // useEffect(() => {
    //     if (workspace) {
    //         getWorkspaceJson({ displayName: workspace }).then(async (resp: any) => {
    //             if (checkIsSuccess(resp) && resp.data && resp.data.jsonString?.length > 0) {
    //                 let workspaceData = JSON.parse(resp.data.jsonString);
    //                 setTenantVal("");
    //                 setteamVal("");
    //                 setCustomFilterVal("");
    //                 setDeviceFilterVal("");
    //                 let checkedKey: any = [];
    //                 workspaceData.forEach((element: any) => {
    //                     if (element.VariableName == "TenantName" && element.SessionValue) {
    //                         setTenantVal(element.SessionValue);
    //                     }
    //                     else if (element.VariableName == "SiteID") {
    //                         if (element.SessionValue && treeData && treeData.length > 0) {
    //                             treeData.forEach((treeItem: any) => {
    //                                 if (treeItem.NodeEntID == element.SessionValue) {
    //                                     let isExists = checkedKey.filter((ele: any) => { return ele == treeItem.key });
    //                                     if (!isExists?.length) {
    //                                         setChecknodekey(treeItem);
    //                                         checkedKey.push(treeItem.key);
    //                                     }
    //                                 }
    //                             });

    //                         }
    //                     }
    //                     else if (element.VariableName == "RoomID") {
    //                         if (element.SessionValue && treeData && treeData.length > 0) {

    //                             treeData.forEach((treeItem: any) => {
    //                                 if (treeItem.children?.length > 0) {
    //                                     treeItem.forEach((subTreeItem: any) => {

    //                                         if (subTreeItem.NodeEntID == element.SessionValue) {
    //                                             let isExists = checkedKey.filter((ele: any) => { return ele == subTreeItem.key });
    //                                             if (!isExists?.length) {
    //                                                 checkedKey.push(treeItem.key);
    //                                             }
    //                                             let name = `${subTreeItem.treetype}Name`;
    //                                             let id = `${subTreeItem.treetype}ID`;
    //                                             singleObj[name] = subTreeItem.Name;
    //                                             singleObj[id] = subTreeItem.NodeEntID;
    //                                             singleObj['multiNode'] = true;
    //                                             name = `${treeItem.treetype}Name`;
    //                                             id = `${treeItem.treetype}ID`;
    //                                             singleObj[name] = treeItem.Name;
    //                                             singleObj[id] = treeItem.NodeEntID;
    //                                             setChecknodekey(singleObj);
    //                                         }
    //                                     })
    //                                 }
    //                             });
    //                             // setMakeAllcheck([...checkedKey]);
    //                         }
    //                     }
    //                     else if (element.VariableName == "CustomFilterName" && element.SessionValue) {
    //                         setCustomFilterVal(element.SessionValue);
    //                     }
    //                     else if (element.VariableName == "DeviceFilterName" && element.SessionValue) {
    //                         setDeviceFilterVal(element.SessionValue);
    //                     }
    //                     else if (element.VariableName == "TeamName" && element.SessionValue) {
    //                         setteamVal(element.SessionValue);
    //                     }
    //                 });
    //                 let wsList: any = [];
    //                 setWorkspaceList([...wsList]);
    //                 setMakeAllcheck([...checkedKey]);
    //                 setIsWorkspaceOpen(false);
    //                 setIsDirtyForm(true);
    //             }
    //         })
    //     }
    // }, [workspace])

 
 
    useEffect(() => {

    }, [workspaceList])


    useEffect(() => {
        if (isWorkspaceOpen) {

            let element = document.getElementById("react-select-3-listbox");
            if (element) {
                element.focus();
                element.addEventListener("mouseleave", handleStatusbarMouseLeave);
                return () => {
                    // mainEle.item[0].blur();
                    element?.removeEventListener("mouseleave", handleStatusbarMouseLeave);
                }
            }
        }
    }, [isWorkspaceOpen])

    const handleStatusbarMouseLeave = (event: any) => {
        setIsWorkspaceOpen(false);
    }

    const handleRadioButtonChange = (e: ChangeEvent, value: string) => {
        setIsDirtyForm(true);
    }
    const handleFitlerWizard = () => {
        setShowFloorPaneWzard(true)
    }
    return (<div className="ng-search-overter-div">
        <div className="nz-searchDiv">
    
            {!props.hideFilter && <Box className={openPopupFilter ? 'nz-filter-open-icon' : "nz-nav-filter-icon-box"}
                sx={{ width: "50px", display: "flex", alignItems: "center" }}

            >
                {props?.gridName !== "Reminder" && (
                    <div className={`nz-filter-apply-icon${isDirtyForm == true ? " nz-active-filter-icon" : ""}`} title={openPopupFilter == true && isDirtyForm == true ? "Save and Apply" : "Edit Explorer Filter"}>
                        <NzIcon
                            onClick={(_event: any) => { handleSearchButtonClick("filter") }} src={getImagePath("Filter_128x128.svg", "Misc")}
                            iconName={"Filter_128x128.svg"} folderName="misc" />
                    </div>
                )}
                {!props.hideSearchKwd && !openPopupFilter && (<RightMouseMenu container="search_keyword" handleConditionChange={handleConditionChange} />)}

            </Box>}
            {!props.hideSearchKwd && !openPopupFilter && (<Autocomplete
                id="nz_select_keyword_search"
                freeSolo
                className={`nz-sk-search-select${props.hideFilter ? " nz-keyword-search-only" : ""}`}
                inputValue={searchQueryPara == "" ? "" : searchQueryPara ? searchQueryPara : props.searchQueryPara}
                options={searchHistory}
                size="small"
                // classes={{ root: style }}
                sx={{ width: '140px', }}
                onInputChange={(event: React.SyntheticEvent, value: any, reason: any) => handleChange(event, value, reason)}
                renderInput={(params) => <TextField placeholder= "Enter keyword to Search" sx={{
                    ...style
                }} className="p-0" {...params} inputProps={{ ...params.inputProps, maxLength: 64 }}
                    onKeyDown={(event: any) => { event.key === 'Enter' && handleSearchButtonClick("lens") }}
                />}
            />)}
            {!openPopupFilter && (<div title="Search or Search Next" className="nz-sk-search-glass-btn-box nz-search-text-lens-icon"  style={{
                cursor: "pointer",
                 width: '40px !important'
            }}>
                <NzIcon className={`ng-sk-a-lens${isSearchDirty == true ? ' nz-active-filter-icon' : ""}`} iconName={"Lens_128x128.svg"} instanceName="DownloadData" folderName="misc" onClick={(event: any) => { handleSearchButtonClick("lens") }} />
            </div>)}
            <div className="nz-search-box-action">
                {!openPopupFilter && props.allowShowPane && <div className="nz-prop-action-icon">
                    <NzIcon title={`Open ${props.hidePaneTitles && props.hidePaneTitles.length > 0 ? props.hidePaneTitles[props.hidePaneTitles.length - 1] : ""} Pane`}
                        iconName={"Preview.svg"}
                        onClick={() => { props.handleCloseOpenPane(props.paneName, "open"); }} folderName="misc" />
                </div>}
                {!openPopupFilter && props.showExplorerCloseIcon && <div className="nz-prop-action-icon">
                    <NzIcon title="Return to DC Explorer" iconName={"Cancel.svg"} onClick={() => { props.hanldeCloseIcon(); }} folderName="misc" />
                </div>}
                {!openPopupFilter && props.allowHidePane && <div className="nz-prop-action-icon">
                    <NzIcon tooltip={`Close ${props.paneName} Pane`} onClick={() => { props.handleCloseOpenPane(props.paneName, "close", props.paneName); }} iconName={"Cancel.svg"} folderName="misc" />
                </div>}
            </div>
        </div>
        {openPopupFilter && (<div className="nz-filter-popup-div">

            <div className="nz-form-title-bar">
                <div className="form-title-header">
                    { "Select Filter and Data Center"}
                </div>
                {isDirtyForm == true && <span title="Discard changes">
                    <ReactSVG className="nz-misc-icon"
                        onClick={() => { setOpenPopupFilter(false); setIsDirtyForm(false); }}
                        fallback={() => { return <ReactSVG className="nz-misc-icon" src={getImagePath("Default_128x128.svg", "misc")} /> }}
                        src={getImagePath("Close.svg", "misc")} />
                </span>}
            </div>
            <div className="nz-filter-container">
               
                    <div className="nz-filter-explorer">
                        <div className={spliterWidth < 250 ? "" : "nz-filter-all-control"}>
                            <div className="nz-filter-label">
                                <p>Tenant</p>
                            </div>
                            <div className="nz-filter-control">
                                <ComboboxControl refTableData={tenantList} preventDefaultValue={true} label="" isForm={true} value={TenantVal} valueChange={(value: any) => {
                                    setTenantVal(value)
                                    setIsDirtyForm(true)
                                }} />
                            </div>
                        </div>
                        <div className={spliterWidth < 250 ? "" : "nz-filter-all-control"}>
                            <div className="nz-filter-label">
                                <p>Team</p>
                            </div>
                            <div className="nz-filter-control">
                                <ComboboxControl refTableData={userTeamList} preventDefaultValue={true} label="" isForm={true} value={teamVal} valueChange={(value: any) => {
                                    setteamVal(value)
                                    setIsDirtyForm(true)

                                }} />
                            </div>
                        </div>
                         
                            <div className={spliterWidth < 250 ? "" : "nz-filter-all-control"}>
                                <div className="nz-filter-label">
                                    <p>Device</p>
                                </div>
                                <div className="nz-filter-control">
                                    <ComboboxControl refTableData={deviceFilterList} preventDefaultValue={true} label="" isForm={true} value={deviceFilterVal} valueChange={(value: any) => {
                                        setDeviceFilterVal(value)
                                        setIsDirtyForm(true)

                                    }} />
                                </div>
                            </div>
                            <div className={spliterWidth < 250 ? "" : "nz-filter-all-control"}>
                                <div className="nz-filter-label">
                                    <p>Custom</p>
                                </div>
                                <div className="nz-filter-control nz-filter-custom-input">
                                    <ComboboxControl refTableData={deviceFilterList} preventDefaultValue={true} label="" isForm={true} value={deviceFilterVal} valueChange={(value: any) => {
                                        setDeviceFilterVal(value)
                                        setIsDirtyForm(true)

                                    }} />
                                    <div className="nz-filter-custom-icon">
                                        <NzIcon tooltip="Add Filter" iconName={"AddCircle.svg"} folderName="misc" />
                                        <NzIcon tooltip="Clear Filter" iconName={"Cancel.svg"} folderName="misc" />
                                    </div>
                                </div>
                            </div>
                        
                        <div className={spliterWidth < 250 ? "" : "nz-filter-all-control"}>
                            <div className="nz-filter-label">
                                <p>Tag</p>
                            </div>
                            <div className="nz-filter-control">
                                <ComboboxControl refTableData={tagFilterList} preventDefaultValue={true} label="" isForm={true} value={tagFilterVal} valueChange={(value: any) => {
                                    setTagFilterVal(value)
                                    setIsDirtyForm(true)

                                }} />
                            </div>
                        </div>
                      
                    </div>
                    {<div className="nz-filter-site-tree">
                        <div className="nz-filter-sub-header"><h4 className="filter-text">Select Data Center</h4></div>
                        <div className="nz-tree-filter-div">{expandedNodes && (<Treeview
                            handleNodeSelectEvent={(selectedKeys: any, info: any, expandedNodes: any) => {
                            }}
                            handleNodeCheckedEvent={(checksKeys: any, info: any, expandedNodes: any) => {
                                console.log('expandedNodes handelCheckBox:', expandedNodes);
                                setExpandedkey([...expandedNodes]);
                                treeViewCheck(info)
                            }}
                            // class="custom-rc-tree"
                            controlName={"filter_form_site_treeview"}
                            multiple={false}
                            isRightClickEnabled={true}
                            // location={location}
                            selectedKeys={selectedNode}
                            showIcon={true}
                            checkable={true}
                            treeData={treeData}
                            expandedKeys={expandedNodes}
                            checkStrictly={true}
                            checkedKeys={makeAllCheck ? makeAllCheck : []}
                            instanceName='site_tree'
                            showtree={openPopupFilter}
                        />)}
                        </div></div>}


            </div>
        </div>)
        }
    </div >
    );
});
