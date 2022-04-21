import {useRef, useState} from "react";
import classes from "../../styles/Dropdown.module.css";
import classNames from "classnames";
import Spinner from "../Spinner";

export default function Dropdown({items, wide, children}) {
  const wrapperRef = useRef();
  const dropdownRef = useRef();
  const [isOpen, setIsOpen] = useState(false);
  const [openTop, setOpenTop] = useState(false);
  const [loadedItems, setLoadedItems] = useState({});

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
    if (!el) return null;
    if (el.type === "separator") {
      return <div className={classes.separator} key={idx} />;
    }
    if (el.loading) {
      if (loadedItems[el.id]?.done) {
        el = loadedItems[el.id];
      } else {
        if (isOpen && !loadedItems[el.id]) {
          setLoadedItems(a => ({...a, [el.id]: {done: false}}));
          el
            .loading()
            .then(item => setLoadedItems(a => ({...a, [el.id]: {...el, ...item, done: true}})));
        }

        return <div className={classNames(classes.item, classes.loading, el.className)} key={el.id}>
          <Spinner /> Загрузка...
        </div>;
      }
    }
    return <div className={classNames(classes.item, el.className)} key={el.id} onClick={el.onClick}>
      {el.label}
    </div>;
  });

  return <div className={classes.wrapper} onClick={toggleDropdown} ref={wrapperRef} tabIndex={0}>
    {children}
    <div className={classNames(classes.dropdown, isOpen && classes.open, openTop && classes.top, wide && classes.wide)}
         ref={dropdownRef}>
      {itemEls}
    </div>
  </div>;
}
