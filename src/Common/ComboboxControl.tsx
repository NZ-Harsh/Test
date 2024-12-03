// 1. Autocomplete Component: The main component that renders the Material-UI Autocomplete component.
// 2. State Management: Utilizes state hooks (useState) for managing component state.
// 3. useEffect Hooks: Manages various lifecycle events such as fetching data, handling default values, and updating options.
// 4. handleChange Function: Handles the change event of the Autocomplete component, updating the selected value and triggering necessary actions based on the component's configuration.
// 5. Comments: Added comments to explain the purpose and logic of different sections in the code.


import React, { forwardRef, useEffect, useRef, useState } from "react";
import { checkIsSuccess, getImagePath, setStorageItem } from "./Common";
import { processStringToCompare } from "./Common";
import { useDispatch } from "react-redux";
import { iFormControlProps } from "../interface"
import ReactSelect, { components, OptionProps, OnChangeValue, ActionMeta } from "react-select";
import { ReactSVG } from "react-svg";
import { getRefList } from "../redux/action/dcservice";
// import { isEqual } from 'lodash';

const Option = (props: OptionProps<any>) => {
  //props.isFocused = false;
  return (
    <components.Option {...props} className="nz-select2-option" />
  );
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

      </div>
    </components.DropdownIndicator >
  );
};
// ComboboxControl Component
const ComboboxControl: React.ForwardRefRenderFunction<HTMLDivElement, iFormControlProps> = (props, ref) => {
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [dataItems, setDataItems] = useState<any>([]);
  const [selectedValue, setSelectedValue] = useState<any>("");
  const [open, setOpen] = React.useState(false);
  const [refTableData, setRefTableData] = useState<any>(null);
  const loading = open && dataItems.length === 0;
  const selectRef = useRef(null);
  const dispatch = useDispatch();

  
  // Effect hook to handle changes in requiredErrorMessage prop
  useEffect(() => {
    if (props.requiredErrorMessage) {
      setIsError(true);
      setErrorMessage(props.requiredErrorMessage);
    } else {
      setIsError(false);
      setErrorMessage('');
    }
  }, [props.requiredErrorMessage]);

  // Effect hook to fetch reference table data
  useEffect(() => {
    if (props.refTable) {
      let refTableName = props.refTable;


    
      // Fetch data based on refTableName
      if (refTableName && refTableName.includes('refLib')) {
        getRefList(refTableName).then((resp: any) => {
          if (checkIsSuccess(resp) && resp.data && resp.data.jsonString?.length > 0) {
            let data = JSON.parse(resp.data.jsonString);

            if (data.length > 0) {
              var stringArray = data.map((ele: any) => { return ele.Value });

              if (stringArray?.length > 0 && (stringArray[0] != undefined && stringArray[0] != "Undefined")) {
                createAndSetDataForCombobox(stringArray);
                // setDataItems(stringArray)
                console.log('!props.value && !props.preventDefaultValue :', !props.value && !props.preventDefaultValue);

                if (!props.value && !props.preventDefaultValue) {
                  setSelectedValue(stringArray[0]);
                  if (props.valueChange) {
                    props.valueChange(stringArray[0], props.label, true);
                  }
                }
              } else {
                // Reference data not found
               
              }
            }
          } else {
            if (!props.isForm) {
              props.api.stopEditing();
            }
          }
        });
      } else {
        getRefList(refTableName).then((resp: any) => {
          if (resp && resp.length > 0) {

            var stringArray = resp.map((ele: any) => { return ele.Value });

            if (stringArray?.length > 0 && (stringArray[0] != undefined && stringArray[0] != "Undefined")) {
              createAndSetDataForCombobox(stringArray);
              // setDataItems(stringArray)
              if (!props.value && !props.preventDefaultValue) {
                // setSelectedValue(stringArray[0]);
                if (props.valueChange) {
                  props.valueChange(stringArray[0], props.label, true);
                }
              }
            } else {
              // Reference data not found
              
            }

          } else {
            if (!props.isForm) {
              props.api.stopEditing();
            }
          }
        })
      }
    }
  }, [props.refTable]);

  useEffect(() => {
    return () => {
      setDataItems([]);
      setSelectedValue("");
    }
  }, [])
  

  // Effect hook to handle changes in props.refTableData
  useEffect(() => {
    const handleRefTableChange = async () => {
      var stringArray = refTableData.map((ele: any) => { return ele.Value });
      if (stringArray?.length > 0 && (stringArray[0] != undefined && stringArray[0] != "Undefined")) {
        let formattedData = await createAndSetDataForCombobox(stringArray);
        if (!props.value && !props.preventDefaultValue) {
          // setSelectedValue(stringArray[0]);
          if (props.valueChange) {
            props.valueChange(props.isObjectVal ? formattedData[0] : formattedData[0].value, props.label, true);
          }
        }
        // setDataItems([...stringArray])
      } else {
        // Reference data not found
      
      }
    }
    if (refTableData?.length > 0) {
      handleRefTableChange();

    }
  }, [refTableData])


  useEffect(() => {
    if (props.refTableData && props.refTableData.length > 0) {
      setRefTableData(props.refTableData);
    }
    else {
      setRefTableData(null);
    }
    return () => {
      setRefTableData(null);
    }
  }, [props.refTableData])

  // Effect hook to handle changes in props.optionsData
  useEffect(() => {
    if (props.optionsData?.length > 0) {
      let active = true;
      setSelectedValue("");
      if (!props.value && !props.preventDefaultValue) {
        if (props.isObjectVal) {
          // setSelectedValue(props.optionsData[0]);
          if (props.valueChange) {
            props.valueChange(props.optionsData[0], props.label, true);
          }
        } else {
          // setSelectedValue(props.optionsData[0]?.toString());
          if (props.valueChange) {
            props.valueChange(props.optionsData[0], props.label, true);
          }
        }
      }
      createAndSetDataForCombobox(props.optionsData);
    } else {
      if (props?.isObjectVal) {

        setDataItems([]);
        setSelectedValue("");
      }
    }

  }, [props?.isObjectVal, props.optionsData]);

  const createAndSetDataForCombobox = (data: any) => {
    // Check if data is an array and not empty
    if (Array.isArray(data) && data?.length > 0) {
      let formatedData: any = [];
      // Add empty option if not required and not related to data model
      if (!props.isRequired && props.instanceName != "data_model") {
        formatedData.push({ value: "", label: "" });
      }
      // Iterate through each item in the data
      let isValueFound: boolean = false;
      data.forEach((item: any) => {
        if (props.groupName && processStringToCompare(props.groupName, "Floor")
          && processStringToCompare(props.label, "FloorType")
          && props.excludeRefValue && props.excludeRefValue?.length > 0 && props.excludeRefValue?.includes(item)
        ) {
          return;
        }
        // If item is a string
        if (typeof item == 'string') {
          // Check if the value matches the selected value
          if (props.value && item.includes(props.value)) {
            console.log('selectedValueNK 1 :', props.value, props);

            setSelectedValue({ value: item, label: item });
            isValueFound = true;
            if (props.isDefault && props.valueChange) {
              props.valueChange(item, props.label, true);
            }
          }
          // Push item to formatted data
          formatedData.push({ value: item, label: item });
        }
        // If item is an object
        else if (typeof item == "object") {
          // Determine label based on type
          let label = getLabelFromType(item);
          // Set label and value properties
          item.label = label;
          item.value = label;
          // Check if default value matches the label
          if (props.value && label.includes(getDefaultValueFromType())) {
            console.log('selectedValueNK 2 :', props.value, props);
            setSelectedValue(item);
            isValueFound = true;
            if (props.isDefault && props.valueChange) {
              props.valueChange(item.value, props.label, true);
            }
          }
          // Push item to formatted data
          formatedData.push(item);
        }
      });
      // If no selected value and data is not empty, select first item
      if (isValueFound == false && formatedData?.length > 0) {
        console.log('selectedValueNK 3 :', props.value, props);
        setSelectedValue(formatedData[0]);
        if (props.isRequired && props.valueChange) {
          props.valueChange(formatedData[0].value, props.label, true);
        }
        // if (props.groupName == "Device Filter" && props.subGroupName == "Device by Model" && formatedData?.length > 1) {
        //   setSelectedValue(formatedData[1]);
        // }
        // else {
        //   setSelectedValue(formatedData[0]);
        // }
      }
      // Set formatted data as data items
      setDataItems(formatedData);
      return formatedData;
      // setDataItems(createOptions(100));
    }
  }

  const getLabelFromType = (item: any) => {
    switch (props.type) {
      case "isEquipmentTypes":
        return item.eqType;
      case "isProdLine":
        return item.mfgProdLine;
      case "isProdNo":
        return item.mfgProdNo;
      case "isEntityName":
        return item.entityName;
      case "isPropertyGroup":
        return item.pgName;
      case "isProperty":
        return item.propertyName;
      default:
        return item.manufacturer;
    }
  };

  const getDefaultValueFromType = () => {
    switch (props.type) {
      case "isEquipmentTypes":
        return props.value.eqType;
      case "isProdLine":
        return props.value.mfgProdLine;
      case "isProdNo":
        return props.value.mfgProdNo;
      case "isEntityName":
        return props.value.entityName;
      case "isPropertyGroup":
        return props.value.pgName;
      case "isProperty":
        return props.value.propertyName;
      default:
        return props.value.manufacturer;
    }
  };

  const handleSelectionChange = (newValue: OnChangeValue<any, false>, actionMeta: ActionMeta<any>) => {
    console.log('actionMeta handleSelectionChange:', actionMeta);
    console.log('newValue handleSelectionChange:', newValue);
    if (newValue?.value || !props.isRequired) {
      if (props?.data?._AP == "Measurement") {
        setStorageItem("Measurement", newValue.value);
      }
      // Update the selected value based on the type of data
      setSelectedValue(newValue);

      // Process the selected value
      if (props.data?.IsFromPopup && props.data.ChangeEvent) {
        props.data.ChangeEvent(true);
      }
      if (!props.isForm) {
        // Update data value and stop editing if not part of a form
        props.node.setDataValue('Value', props.isObjectVal ? newValue : newValue?.value);
        props.api.stopEditing();

        // Dispatch an action if needed

        if (props.data && props.data.EventRequired) {
          dispatch({
            type: "COMBOBOX_CHANGE_VALUE",
            data: props.isObjectVal ? newValue : newValue?.value
          });
        }
      } else {
        // Trigger valueChange prop function if part of a form
        if (props.valueChange) {
          props.valueChange(props.isObjectVal ? newValue : newValue?.value, props.label);
        }
      }
    }
    else {
      // Handle required validation
      if (props.isRequired && newValue?.value === null) {
        setIsError(true);
        setErrorMessage(props.label + " is required");
      } else {
        setIsError(false);
        setErrorMessage('');
      }
    }
  }

 
  // Render the Autocomplete component
  return (
    <>
      <ReactSelect
        options={dataItems}
        isSearchable={false}
        menuPlacement="auto"
        value={selectedValue}
        menuPosition="absolute"
        menuPortalTarget={document.body}
        // isDisabled={props.disabled ? true : false}

        // maxMenuHeight={300}
        className={props.disabled ? "nz-fc-react-select nz-fc-readonly" : "nz-fc-react-select"}
        classNamePrefix={'nz_fc_rc'}
        isRtl={false}
        blurInputOnSelect={true}
        closeMenuOnSelect={true}
        placeholder={dataItems?.length > 0 ? "Select..." : "Nothing to select"}
        openMenuOnClick={!props.disabled}
        // menuIsOpen={true}
        menuIsOpen={props.menuIsOpen ? props.menuIsOpen : props.disabled ? false : undefined}
        onChange={props.disabled ? undefined : handleSelectionChange}
        styles={{
          option: (styles:any, state:any) => ({
            ...styles,
            backgroundColor: state.isFocused ? "var(--secondary)" : "",
            "&:hover": {
              backgroundColor: "var(--secondary)"
            }
          })
        }}
        components={
          { DropdownIndicator, Option, IndicatorSeparator: () => null }
        }
      />

   
    </>
  );
}

export default forwardRef(ComboboxControl);