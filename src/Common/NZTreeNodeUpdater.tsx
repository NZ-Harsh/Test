import { faPersonRunning } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ReactSVG } from 'react-svg';
import Image from 'rc-image';
import { FEnums } from './enums';
import { ITreeNode, iTreeProps } from '../interface';
import { getImagePath } from './Common';

export const getTreeNodeTitle = (treeNode: ITreeNode, treeDataProps: iTreeProps, featureId: string) => {
    const getIcon = () => {
        if (treeNode.IsNZ && treeNode.Secured) return "NZSecureIcon";
        if (treeNode.IsNZ && !treeNode.Secured) return "NZIcon";
        if (!treeNode.IsNZ && treeNode.Secured) return "SecureIcon";
        return null;
    };

    const iconToShowForSecure = getIcon();
    const clonedNode = { ...treeNode, title: "", icon: null, children: [] };
    const titleContent = treeNode.Name || "";

   

    const renderNodeName = () => {
        const isImportOrExport = [
            FEnums.Export.toString(),
            FEnums.Import.toString(),
            FEnums.ImportCables.toString(),
            FEnums.ExportCables.toString(),
            FEnums.DeviceImport.toString(),
            FEnums.InventoryImport.toString(),
            FEnums.DeviceExport.toString(),
            FEnums.InventoryExport.toString(),
        ].includes(featureId);

        const nodeName = treeNode.TableLabel ? (treeNode.Type === "Table" ? `${treeNode.TableLabel} (${treeNode.Name})` : treeNode.TableLabel) : treeNode.Name;

        return (
            <>
                {isImportOrExport ? nodeName : treeNode.TableLabel || titleContent}
                {treeNode.RecordCount >= 0 && isImportOrExport ? ` (${treeNode.RecordCount})` : ""}
                {treeNode.HwEntityName ? ` (${treeNode.HwEntityName})` : ""}
            </>
        );
    };

    const renderIcon = () => {
        if (!iconToShowForSecure) return null;
        return (
            <div className='nz-tree-node-nz-icon-div' title={iconToShowForSecure.includes("Secure") ? "Secured" : ""}>
                <ReactSVG
                    className="nz-treeview-img-auth nz-tree-node-nz-icon ng-red-check"
                    beforeInjection={(svg: any) => { svg.setAttribute("title", iconToShowForSecure); }}
                    src={getImagePath(`${iconToShowForSecure}_128x128.svg`, "Features")}
                    fallback={() => <ReactSVG className="nz-treeview-img-auth" src={getImagePath("Default_128x128.svg", "misc")} />}
                />
            </div>
        );
    };

    if (
        treeDataProps.instanceName && ["auth_role_left_treeview", "auth_by_role_treeview"].includes(treeDataProps.instanceName) &&
        treeNode.GroupName !== "" &&
        treeNode.Name !== "Roles"
    ) {
        return (
            <div className="d-flex justify-content-between align-items-center" style={{ paddingRight: 3 }}>
                <span title={titleContent}>{titleContent}</span>
            </div>
        );
    }

    return (
        <span
            rel="tooltip"
            title={JSON.stringify(clonedNode)}
            data-html="true"
            className={`nz-tree-node-title exp-tree-node-span-${(treeNode.stepNo + 1) * 16}`}
            id={treeNode.EntID || treeNode.key}
            node-info={JSON.stringify(clonedNode)}
        >
            <span className={treeNode.EntID} node-info={JSON.stringify(clonedNode)}>
                {renderNodeName()}
            </span>
            {renderIcon()}
        </span>
    );
};

export const getTreeNodeIcon = (treeNode: ITreeNode) => {
    let viewIcon = treeNode.Name && treeNode.Name.toLowerCase().includes("front") ? "Front" : treeNode.Name && treeNode.Name.toLowerCase().includes("rear") ? "Rear" : null;
    let entityName = treeNode.NodeEntityname ? treeNode.NodeEntityname.toString().replace('__', '') : "Default";
    let status = treeNode.NodeEntityname && treeNode.NodeEntityname === "AuditSession" && treeNode.NodeType === "AuditSessionNode" && treeNode.AuditSessionStatus ? treeNode.AuditSessionStatus : null;
    return (treeNode.NodeState && (treeNode.NodeState === "Preparing" || treeNode.NodeState === "Processing") ? <FontAwesomeIcon title={`${treeNode.NodeState}...`} className="nz-treeview-img-auth" icon={faPersonRunning} /> :
        status ? <span title={entityName}><ReactSVG title={entityName} className="nz-treeview-img-auth  ng-red-check" src={getImagePath(`${status}_128x128.svg`, "misc")} fallback={() => { return <ReactSVG title={entityName} className="nz-treeview-img-auth" src={getImagePath("Default_128x128.svg", "misc")} /> }} /></span>
            : treeNode.NodeEntityname && !treeNode.NodeEntityname.toString().includes('__') && entityName ? <span title={entityName}><ReactSVG title={entityName} className="nz-treeview-img-auth  ng-red-check" src={getImagePath(`${entityName}_128x128.svg`, "Features")} fallback={() => { return <ReactSVG title={entityName} className="nz-treeview-img-auth" src={getImagePath("Default_128x128.svg", "misc")} /> }} /></span>
                : treeNode.NodeEntityname && treeNode.NodeEntityname.toString().includes('__') && entityName ? <span title={entityName}> <Image title={entityName} className="nz-treeview-img-auth  ng-red-check" src={getImagePath(`${entityName}_128x128.png`, "entities_hw")} fallback={getImagePath("DefaultGrey_128x128.png", "misc")} /></span>
                    : treeNode.HwEntityName ? <Image title={entityName} className="nz-treeview-img-auth  ng-red-check" src={getImagePath(`${treeNode.Name}.png`, "EqType")} fallback={getImagePath("DefaultGrey_128x128.png", "misc")} />
                        : treeNode.treetype?.toLowerCase() === "eqtype" && treeNode.Name ? <span title={entityName}> <Image title={entityName} className="nz-treeview-img-auth  ng-red-check" src={getImagePath(`${treeNode.Name}.png`, "EqType")} fallback={getImagePath("DefaultGrey_128x128.png", "misc")} /></span>
                            : treeNode.treetype?.toLowerCase() === "productnumber" || treeNode.treetype?.toLowerCase() === "manufacturer" ? <span title={entityName}><Image title={entityName} className="nz-treeview-img-auth  ng-red-check" src={getImagePath(`${treeNode.treetype}.png`, "misc")} fallback={getImagePath("DefaultGrey_128x128.png", "misc")} /></span>
                                : treeNode.treetype?.toLowerCase() === "views" && viewIcon ? <span title={entityName}><Image title={entityName} className="nz-treeview-img-auth  ng-red-check" src={getImagePath(`${viewIcon}.png`, "misc")} fallback={getImagePath("DefaultGrey_128x128.png", "misc")} /></span>
                                    : <span title={entityName}> <Image title={entityName} className="nz-treeview-img-auth  ng-red-check" src={getImagePath('sites.png', 'misc')} fallback={getImagePath("DefaultGrey_128x128.png", "misc")} /></span>)
}


// export const isShowCheckbox = (treeNode: ITreeNode, featureId: string) => {
//     let showCheckbox = treeNode.NodeType == "Site" || treeNode.NodeType == "Room"
//         || treeNode.NodeType == "Floor" || treeNode.NodeType == "Location"
//         || (treeNode.NodeType == "Device" && (featureId != FEnums.DeviceConfiguration && featureId != FEnums.DevicePowerCabling && featureId != FEnums.DeviceNetworkCabling))
//         || treeNode.NodeType == "FrontView"
//         || treeNode.NodeType == "Rack"
//         || treeNode.NodeType == "RearView" ? false : true;

//     return showCheckbox;
// }

