import {useRef, useState} from "react";
import classes from "../../styles/Dropdown.module.css";
import classNames from "classnames";

export default function Dropdown({items, children}) {
  const wrapperRef = useRef();
  const dropdownRef = useRef();
  const [isOpen, setIsOpen] = useState(false);
  const [openTop, setOpenTop] = useState(false);

  function toggleDropdown() {
    const activatorRect = wrapperRef.current.getBoundingClientRect();
    const dropdownRect = dropdownRef.current.getBoundingClientRect();

    const spaceBottom = Math.max(
      document.documentElement.clientHeight || 0,
      window.innerHeight || 0
    ) - activatorRect.y - activatorRect.height;

    setIsOpen(!isOpen);
    setOpenTop(spaceBottom <= dropdownRect.height);
  }

  const itemEls = items.map((el, idx) => {
    if (el.type === "separator") {
      return <div className={classes.separator} key={idx} />;
    }
    return <div className={classes.item} key={el.id} onClick={el.onClick}>
      {el.label}
    </div>;
  });

  return <div className={classes.wrapper} onClick={toggleDropdown} ref={wrapperRef} tabIndex={0}>
    {children}
    <div className={classNames(classes.dropdown, isOpen && classes.open, openTop && classes.top)}
         ref={dropdownRef}>
      {itemEls}
    </div>
  </div>;
}
