import { filter } from "lodash";
import React from "react";
import { FaChevronDown, FaChevronUp, FaTimes } from "react-icons/fa";
import { v4 as uuidv4 } from "uuid";

import useDetectOutsideClick from "../hook/useDetectOutsideClick";
import {
  IButtonProps,
  IDropdownProps,
  ITextInputProps
} from "../shared.interface";
import { Transition } from "@headlessui/react";
import { FaMagnifyingGlass } from "react-icons/fa6";

const Button: React.LazyExoticComponent<React.FC<IButtonProps>> = React.lazy(
  () => import("../button/Button")
);
const TextInput: React.LazyExoticComponent<React.FC<ITextInputProps>> =
  React.lazy(() => import("../input/TextInput"));

const Dropdown: React.FC<IDropdownProps> = ({
  text,
  maxHeight,
  mainClassNames,
  showSearchInput,
  dropdownClassNames,
  values,
  style,
  setValue,
  onClick
}): React.ReactElement => {
  const [dropdownItems, setDropdownItems] = React.useState<string[]>(values);
  const [inputText, setInputText] = React.useState<string>(text);
  const dropdownRef = React.useRef<HTMLDivElement | null>(null);
  const [toggleDropdown, setToggleDropdown] = useDetectOutsideClick(
    dropdownRef,
    false
  );
  const [textChanged, setTextChanged] = React.useState<string>(text);

  const onHandleSelect = (event: React.MouseEvent): void => {
    const selectedItem: string = (event.target as HTMLLIElement)
      .textContent as string;

    setTextChanged(selectedItem);
    // if (setValue) {
    setValue?.(selectedItem);
    // }
    setInputText(selectedItem);
    setDropdownItems(values);
    setToggleDropdown(false);
    // if (onClick) {
    onClick?.(selectedItem);
    // }
  };

  const handleChange = (event: React.ChangeEvent) => {
    const inputValue: string = (event.target as HTMLInputElement).value;
    setInputText(inputValue);
    const filtered: string[] = filter(dropdownItems, (item: string) =>
      item.toLowerCase().includes(inputValue.toLowerCase())
    );
    setDropdownItems(filtered);
    if (!inputValue) {
      setDropdownItems(values);
    }
  };

  return (
    <React.Suspense>
      <div
        className={`w-full divide-y divide-gray-100 rounded border ${mainClassNames}`}
        style={style}
      >
        {(!showSearchInput || showSearchInput) && !toggleDropdown && (
          <Button
            className="bg-teal flex w-full justify-between rounded px-3 py-2 text-white"
            label={
              <>
                <span className="truncate text-slate-900">{textChanged}</span>
                {!toggleDropdown ? (
                  <FaChevronDown className="float-right mt-1 h-4 fill-current text-slate-900" />
                ) : (
                  <FaChevronUp className="float-right mt-1 h-4 fill-current text-slate-900" />
                )}
              </>
            }
            onClick={() => setToggleDropdown(!toggleDropdown)}
          />
        )}

        <Transition
          ref={dropdownRef}
          show={toggleDropdown}
          enter="transition ease-out duration-200"
          enterFrom="opacity-0 translate-y-1"
          enterTo="opacity-100 translate-y-0"
          leave="transition ease-in duration-150"
          leaveFrom="opacity-100 translate-y-0"
          leaveTo="opacity-0 translate-y-1"
        >
          {showSearchInput && (
            <div className="flex items-center">
              <FaMagnifyingGlass className="ms-4" />
              <TextInput
                type="text"
                name="search"
                value={inputText}
                className="h-10 w-full items-center rounded pl-3 text-sm font-normal text-gray-600 focus:outline-none lg:text-base"
                placeholder="Search..."
                onChange={handleChange}
              />
              <div
                className="flex self-center"
                onClick={() => setToggleDropdown(!toggleDropdown)}
              >
                <FaTimes className="mx-3 h-4 fill-current text-slate-900" />
              </div>
            </div>
          )}

          <ul
            className={`z-40 cursor-pointer overflow-y-scroll py-2 text-sm text-gray-700 dark:text-gray-200
              ${dropdownClassNames}`}
            style={{ maxHeight: `${maxHeight}px` }}
          >
            {dropdownItems.map((value: string) => (
              <li key={uuidv4()} onClick={onHandleSelect}>
                <div className="block px-4 py-2 text-slate-900 dark:hover:bg-gray-200">
                  {value}
                </div>
              </li>
            ))}
          </ul>
        </Transition>
      </div>
    </React.Suspense>
  );
};

export default Dropdown;
