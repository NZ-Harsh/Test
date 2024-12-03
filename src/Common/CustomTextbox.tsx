  // 1. Component Initialization:
  //    - The component is a custom text field (`CustomTextField`) created using Material-UI's `TextField`.
  //    - It accepts various props, including `isRequired`, `isForm`, `disabled`, `tooltip`, and others.

  // 2. State Initialization:
  //    - State variables are initialized using the `useState` hook to manage dynamic changes within the component.
  //    - States include `isError` (for tracking input validation errors), `errorMessage` (for displaying error messages), `value` (to store the input value), and `refTableData` (for storing reference table data).

  // 3. Redux Dispatch:
  //    - The `useDispatch` hook from Redux is utilized to dispatch actions when certain conditions are met.

  // 4. Input Change Handling (`handleChange`):
  //    - The `handleChange` function is responsible for handling changes in the input value.
  //    - It trims the input value and checks if it matches the data in the reference table.
  //    - If there is a mismatch, an error message is dispatched using Redux.
  //    - If there is a match, data is updated based on whether it's in a form context or not.
  //    - Required validation is performed, and error states and messages are updated accordingly.

  // 5. Effect Hooks:
  //    - `useEffect` hooks are employed to manage side effects during different lifecycle stages of the component.
  //    - One `useEffect` fetches and updates reference table data.
  //    - Another `useEffect` handles required error messages.
  //    - The last `useEffect` initializes the input value based on props.

  // 6. Render TextField Component:
  //    - The `TextField` component from Material-UI is rendered.
  //    - It takes various props such as `value`, `multiline`, `required`, `autoFocus`, `disabled`, `title`, etc.
  //    - The `onChange` event triggers the `handleChange` function, and the component updates based on user input.

  // 7. Returned Component:
  //    - The `CustomTextField` component is exported using `forwardRef`.

  // 8. Usage:
  //    - The component can be used in a React application by importing it and placing it in the desired part of the UI.

  // This workflow outlines the sequence of events and logic within the provided code.

  import { TextField } from "@mui/material";
  import React, { forwardRef, ForwardRefRenderFunction, useEffect, useImperativeHandle, useRef, useState } from "react";
  import { useDispatch } from "react-redux";
  import {  processStringToCompare } from "./Common";
  import { iFormControlProps } from "../interface";
  import { getStorageItem, setStorageItem } from "./Common";

  // CustomTextBox Component


  // Define the custom ref interface
  export interface CustomTextBoxRef {
    getValue: () => string;
    isCancelAfterEnd: () => boolean;
    afterGuiAttached: () => void;
  }


  const CustomTextBox: ForwardRefRenderFunction<CustomTextBoxRef, iFormControlProps> = (props, ref) => {
    // State variables
    const [isError, setIsError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [value, setValue] = useState('');
    const [refTableData, setRefTableData] = useState<any>(null);
    const [valueChanged, setValueChanged] = useState<boolean>(false);
    const [isFocused, setIsFocused] = useState<boolean>(false);
    const [isEnterKeyProcessed, setIsEnterKeyProcessed] = useState(false); // Flag to track Enter key press
    const dispatch = useDispatch();
    const textFieldRef: any = useRef(null);
    // Handle input change
    const handleChange = (event: React.ChangeEvent<HTMLInputElement> | any) => {
      let realValue: any =
        event.target.value?.trim()?.length > 0
          ? event.target.value
          : event.target.value.trim();
      setValue(realValue);
      setValueChanged(true);

      // if (!props.value?.length && realValue.trim() == "") {
      //   return false;
      // }
      // if (props?.data && props?.data?.EventRequired) {
      //   dispatch({
      //     type: "TEXTBOX_CHANGE_VALUE",
      //     data: realValue
      //   });
      // }

      // // Check if input value matches reference data
      // if (refTableData?.length > 0 && realValue && !refTableData.includes(realValue)) {
      //   // Input value does not match with data.
      //   getErrorMessage("AP", "174").then((resp: any) => {
      //     dispatch({
      //       type: "ERROR",
      //       message: resp.message,
      //     });
      //   });
      // } else {
      //   if (props.data?.IsFromPopup && props.data.ChangeEvent) {
      //     props.data.ChangeEvent(true);
      //   }
      //   // Update data based on form or non-form context
      //   if (!props.isForm) {
      //     props.node.setDataValue(props.colDef ? props.colDef.field : props.label, realValue);
      //   } else {
      //     props.valueChange(realValue, props.label);
      //   }

      // Check for required validation
      if (props.isRequired && realValue === '') {
        setIsError(true);
        setErrorMessage(
          `${props.displayLabel ? props.displayLabel : props.data?.propertyLabel ? props.data?.propertyLabel : "This field"
          } is required`
        );
      } else {
        setIsError(false);
        setErrorMessage('');
      }
      // }
    };
   

    // Validate input
    const validateInput = (realValue: string) => {
      // if (!props.value?.length && realValue.trim() === "") {
      //   return;
      // }
      if (props?.data && props?.data?.EventRequired) {
        dispatch({
          type: "TEXTBOX_CHANGE_VALUE",
          data: realValue
        });
      }

      // Check if input value matches reference data
      if (refTableData?.length > 0 && realValue && !refTableData.includes(realValue)) {
        // Input value does not match with data.
       
      } else {
        if (props.data?.IsFromPopup && props.data.ChangeEvent) {
          props.data.ChangeEvent(true);
        }
        // Update data based on form or non-form context
        if (!props.isForm) {
          // props.node.setDataValue(props.colDef ? props.colDef.field : props.label, realValue);
          props.stopEditing();
        } else {
          props.valueChange(realValue, props.label);
          setValueChanged(false);
        }

        // Check for required validation
        // if (props.isRequired === true && realValue === '') {
        //   setIsError(true);
        //   setErrorMessage(
        //     `${props.label ? props.label : props.data?.propertyLabel ? props.data?.propertyLabel : "This field"
        //     } is required`
        //   );
        // } else {
        //   setIsError(false);
        //   setErrorMessage('');
        // }
      }
    };

          useEffect(() =>{
            console.log('combobox props',props)

          },[props])
    // Effect hook for handling required error message
    useEffect(() => {
      if (props.requiredErrorMessage) {
        setIsError(true);
        setErrorMessage(props.requiredErrorMessage);
      } else {
        setIsError(false);
        setErrorMessage('');
      }
    }, [props.requiredErrorMessage]);

    // Effect hook to fetch and update reference table data
    useEffect(() => {
      if (props.refTableData?.length > 0) {
        var stringArray = props.refTableData.map((ele: any) => ele.Value);
        if (stringArray?.length > 0 && stringArray[0] !== undefined && stringArray[0] !== "Undefined") {
          setRefTableData(stringArray);
        } else {
     
        }
      }
    }, [props.refTableData]);

    // Effect hook to initialize value based on props
    useEffect(() => {
      if (props && props?.value) {
        if (!processStringToCompare(props.value.toString(), "undefined")) {
          setValue(props.value.toString());
          if (props.isDefault) {
            props.valueChange(props.value, props.label, true);
          }
        }
      } else {
        if (!props.isForm && props.data.DefaultAPValue && props.isRequired) {
          setValue(props.data.DefaultAPValue);
        }
        else {
          setValue('');
        }
      }

      if (props.focusedControl == props.label) {
        if (textFieldRef && textFieldRef.current) {
          textFieldRef.current.focus();
        }
        setIsFocused(true);
      }
      else {
        setIsFocused(false);
      }
    }, [props.value]);

    useImperativeHandle(ref, () => ({
      getValue: () => value,
      isCancelAfterEnd: () => value.trim() === '', // Validation logic
      afterGuiAttached: () => {
        if (textFieldRef.current) {
          textFieldRef.current.focus();
        }
      },
    }));

    // Handle blur event
    const handleBlur = () => {
      if (!isEnterKeyProcessed && valueChanged) {
        validateInput(value);

      }
      setIsEnterKeyProcessed(false); // Reset flag
    };

    // Handle key up event
    const handleKeyUp = (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter" && valueChanged) {
        setIsEnterKeyProcessed(true); // Set flag to true when Enter key is pressed
        validateInput(value);
      }
    };

    const handleFocus = () => {
      setStorageItem("focusedControl", props.label);
    }

    // Render the TextField component
    return (
      <TextField
        value={value}
        multiline={props.multiline ? true : false}
        required={props.isRequired ? true : false}
        fullWidth={true}
        inputRef={textFieldRef}
        autoFocus={!props.isForm}
        inputProps={{
          readOnly: props.disabled === true,
        }}
        // disabled={props.disabled === true}
        title={isError && errorMessage ? errorMessage : props.tooltip}
        autoComplete="off"
        className={props.disabled === true ? "nz-disabled" : ""}
        id={props.label}
        size={'small'}
        focused={true}
        onChange={handleChange}
        error={isError}
        helperText={isError && props.isForm ? errorMessage : ""}
        onBlur={handleBlur}
        onFocus={handleFocus}
        onKeyUp={handleKeyUp}
      />
    );
  };

  export default forwardRef(CustomTextBox);