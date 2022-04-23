import {Fragment} from "react";
import classesNew from "../../styles/Dropdown.module.css";
import classNames from "classnames";
import {Menu, Transition} from "@headlessui/react";

export function Dropdown({activatorClassName, children, activator}) {
  return <Menu as="div" className={classesNew.wrapper}>
    <Menu.Button as="div" className={classNames(classesNew.button, activatorClassName)} tabIndex={0}>
      {activator}
    </Menu.Button>
    <Transition
      as={Fragment}
      enter={classesNew.transitionEnter}
      enterFrom={classesNew.transitionEnterFrom}
      enterTo={classesNew.transitionEnterTo}
      leave={classesNew.transitionLeave}
      leaveFrom={classesNew.transitionLeaveFrom}
      leaveTo={classesNew.transitionLeaveTo}
    >
      <Menu.Items className={classesNew.items}>
        {children}
      </Menu.Items>
    </Transition>
  </Menu>;
}

export function DropdownSection({children}) {
  return <div className={classesNew.itemsSection}>
    {children}
  </div>;
}

export function DropdownItem({children, disabled, moderator, onClick}) {
  return <Menu.Item disabled={disabled}>
    {({active}) => (
      <div className={classNames(classesNew.item, active && classesNew.active, moderator && classesNew.moderator)}
           onClick={onClick}>
        {children}
      </div>
    )}
  </Menu.Item>;
}
