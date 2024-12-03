import React, { useEffect, useState } from 'react';
import { ReactSVG } from 'react-svg';
import { getImagePath } from './Common';
import { IconButton } from '@mui/material';

export const NzIcon = (props: any) => {
    const [tooltipMessage, setTooltipMessage] = useState(props.tooltip);
    useEffect(() => {
        if (props.isHide) {
            console.log('isHide', props.isHide);
        }
    }, [props.isHide]);

    const handleClick = (event: any) => {

        if (props.instanceName === "copyData") {
            setTooltipMessage("Copied to clipboard");
        } else if (props.instanceName === "DownloadData" || props.instanceName === "SaveData") {
            setTooltipMessage("Saved")
        } else if (props.instanceName === "SaveImage") {
            setTooltipMessage("Saved Image")
        }

        setTimeout(() => {
            setTooltipMessage(props.tooltip);
        }, 1000);

        if (props?.onClick) {
            props.onClick(event);
        }

    };

    return (
        <div className={`nz-common-icon${props.className ? ` ${props.className}` : ""}`} title={tooltipMessage}>
            <IconButton
                className={`nz-common-IconBtn ${props.swapGrid ? "nz-swapgrid-show-add" : ""}${props.isHide ? 'nz-hide-save-button' : ''} ${props.isDisable ? 'nz-button-icon-disabled' : ''}`}
                size="small"
                title={tooltipMessage}
                onClick={handleClick}
            >
                <ReactSVG className="nz-feature-icon"
                    title={tooltipMessage}
                    fallback={() => <ReactSVG className="nz-feature-icon" src={getImagePath("Default_128x128.svg", "misc")} />}
                    src={getImagePath(props.iconName, props.folderName)} />
            </IconButton>
        </div>
    );
};
